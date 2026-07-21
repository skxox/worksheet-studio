import type { CopybookSettings, GridType, MarginPx } from "@/types";
import { fontStack } from "@/lib/fonts";
import {
  mmToPx,
  drawTianGrid,
  drawMiGrid,
  drawHuigongGrid,
  drawJiugongGrid,
  drawEssayGrid,
  drawHuitianGrid,
  drawHuimiGrid,
  drawHuijiuGrid,
  drawYuanmiGrid,
} from "@/lib/paper";
import { charAllPinyins } from "@/lib/pinyin";
import { drawCharStrokes, peekStroke } from "@/lib/stroke";

export type RenderModeLike = CopybookSettings["renderMode"];

/** 笔画字帖预设：横竖撇捺点提等基本笔画 */
export const STROKE_PRESET = "一丨丿㇏丶㇀𠃋𠃌";

/** 多音字切换按钮的命中区域（画布逻辑坐标，供页面层做点击命中检测） */
export interface PinyinToggleMarker {
  char: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 圆角矩形路径（不依赖较新的 ctx.roundRect，兼容旧浏览器） */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** 取某字在当前设置下的实际拼音（带声调），尊重多音字手选覆盖 */
function effectivePinyin(ch: string, settings: CopybookSettings): string {
  const all = charAllPinyins(ch);
  if (all.length === 0) return "";
  const overrides = settings.pinyinOverrides ?? {};
  const idx = typeof overrides[ch] === "number" ? overrides[ch] : 0;
  return all[Math.max(0, Math.min(idx, all.length - 1))] ?? all[0];
}

/** 在左侧页边距空白处绘制 "1/3" 样式的多音字切换按钮 */
function drawPinyinToggle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  current: number,
  total: number,
) {
  ctx.save();
  ctx.fillStyle = "#eef2ff";
  ctx.strokeStyle = "#818cf8";
  ctx.lineWidth = 1;
  roundRectPath(ctx, x, y, w, h, Math.min(5, h / 2));
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#4338ca";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.max(8, h * 0.5)}px ui-sans-serif, system-ui, sans-serif`;
  ctx.fillText(`${current}/${total}`, x + w / 2, y + h / 2 + 0.5);
  ctx.restore();
}

function setFont(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  size?: number,
) {
  const w = settings.fontWeight === "bold" ? "bold " : "";
  ctx.font = `${w}${size ?? settings.fontSize}px ${fontStack(settings.fontFamily)}`;
}

/** 按字色模式绘制单个字形 */
/** 绘制单个字形：solid 实心 / trace 浅灰实心范字 / hollow 空心轮廓 */
function paintChar(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  style: "solid" | "trace" | "hollow",
  color: string,
  traceColor: string,
  fontSize: number,
  align: CanvasTextAlign = "center",
  baseline: CanvasTextBaseline = "middle",
) {
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  if (style === "hollow") {
    ctx.strokeStyle = traceColor;
    ctx.lineWidth = Math.max(0.8, fontSize * 0.03);
    ctx.lineJoin = "round";
    ctx.strokeText(ch, x, y);
  } else if (style === "trace") {
    ctx.fillStyle = traceColor;
    ctx.fillText(ch, x, y);
  } else {
    ctx.fillStyle = color;
    ctx.fillText(ch, x, y);
  }
}

/** 描红数量控制“要生成多少个可练习字”，首字高亮只控制第一个是否实心。 */
function shouldRenderPracticeChar(
  settings: CopybookSettings,
  index: number,
): boolean {
  return index < Math.max(0, settings.solidCount);
}

/** 练习字渲染外观：style（实心/描红/空心）+ 该 style 下应使用的主色。
 *  - solid/hollow 模式：全部用字色 color（hollow 时 paintChar 用 miaoColor 描边）。
 *  - miao 模式：开启 highlightFirst 时，前 highlightCount 个字作实心示范（highlightColor），其余描红（miaoColor）。 */
function practiceCellLook(
  settings: CopybookSettings,
  index: number,
): { style: "solid" | "trace" | "hollow"; color: string } {
  if (settings.renderMode === "solid") return { style: "solid", color: settings.color };
  if (settings.renderMode === "hollow") return { style: "hollow", color: settings.color };
  if (
    settings.highlightFirst &&
    index < Math.max(0, settings.highlightCount)
  ) {
    return { style: "solid", color: settings.highlightColor };
  }
  return { style: "trace", color: settings.miaoColor };
}

function drawCellBox(
  ctx: CanvasRenderingContext2D,
  gridType: GridType,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  switch (gridType) {
    case "tian":
      drawTianGrid(ctx, x, y, size, color);
      break;
    case "mi":
      drawMiGrid(ctx, x, y, size, color);
      break;
    case "huigong":
      drawHuigongGrid(ctx, x, y, size, color);
      break;
    case "jiugong":
      drawJiugongGrid(ctx, x, y, size, color);
      break;
    case "essay":
      drawEssayGrid(ctx, x, y, size, color);
      break;
    case "huitian":
      drawHuitianGrid(ctx, x, y, size, color);
      break;
    case "huimi":
      drawHuimiGrid(ctx, x, y, size, color);
      break;
    case "huijiu":
      drawHuijiuGrid(ctx, x, y, size, color);
      break;
    case "yuanmi":
      drawYuanmiGrid(ctx, x, y, size, color);
      break;
    default:
      drawEssayGrid(ctx, x, y, size, color);
      break;
  }
}

/** 拼音四线三格：整行连续 4 条横线（上、下实线，中间两条虚线），高度 h 均分 3 格；
 *  最外左、右两侧加竖向实线边框，与下方字格连成一体（底边与字格顶边重合）。
 *  实线边框的线宽与颜色（frameColor）与文字方格保持一致；中间两条虚线为浅灰导引线。 */
function drawPinyinRule(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  frameColor: string,
) {
  const gap = h / 3;
  ctx.save();
  // 中间两条虚线导引（浅灰、细）
  ctx.strokeStyle = "#b8c2d0";
  ctx.lineWidth = 0.6;
  ctx.setLineDash([3, 2]);
  for (const i of [1, 2]) {
    ctx.beginPath();
    ctx.moveTo(x, y + i * gap);
    ctx.lineTo(x + w, y + i * gap);
    ctx.stroke();
  }
  // 实线边框：上、下、左、右，颜色与线宽与文字方格一致
  ctx.setLineDash([]);
  ctx.strokeStyle = frameColor;
  ctx.lineWidth = 1;
  for (const i of [0, 3]) {
    ctx.beginPath();
    ctx.moveTo(x, y + i * gap);
    ctx.lineTo(x + w, y + i * gap);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + h);
  ctx.moveTo(x + w, y);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
  ctx.restore();
}

/** 在四线三格上写一个拼音：基线落在第 3 条线（y+2*gap），水平居中，按宽度自适应缩字号。
 *  颜色跟随传入的 color（页面层传字色 settings.color），不再硬编码灰色。 */
function drawPinyinText(
  ctx: CanvasRenderingContext2D,
  py: string,
  cx: number,
  y: number,
  h: number,
  maxW: number,
  color: string,
) {
  if (!py) return;
  const gap = h / 3;
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  // 字号约为行高的 0.66：让小写 x-height 正好填满中间格（一格 = h/3）
  let fs = h * 0.66;
  ctx.font = `${fs}px ui-sans-serif, system-ui, sans-serif`;
  while (ctx.measureText(py).width > maxW && fs > 8) {
    fs -= 1;
    ctx.font = `${fs}px ui-sans-serif, system-ui, sans-serif`;
  }
  ctx.fillText(py, cx, y + 2 * gap);
  ctx.restore();
}

/** 汉字格：画格 + 按 look 绘字（solid 实心示范 / trace 描红 / hollow 空心） */
function drawCharCell(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  cell: number,
  settings: CopybookSettings,
  look: { style: "solid" | "trace" | "hollow"; color: string },
) {
  drawCellBox(ctx, settings.gridType, x, y, cell, settings.lineColor);
  const fontPx = cell * (settings.fontScale / 100);
  const cx = x + cell / 2;
  const cy = y + cell / 2 + (settings.vOffset / 100) * cell;
  ctx.save();
  setFont(ctx, settings, fontPx);
  paintChar(ctx, ch, cx, cy, look.style, look.color, settings.miaoColor, fontPx);
  ctx.restore();
}

/** 汉字 / 词组 / 数字 / 笔画 / 拼音字帖 */
function drawCharacterCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
  markers?: PinyinToggleMarker[],
) {
  const cell = mmToPx(settings.gridSize);
  const cols = Math.max(1, Math.floor(contentWidth / cell));
  const chars = Array.from(settings.content).filter((c) => c.trim().length > 0);

  // 笔顺行与拼音四线三格行同高（均略矮于字格），笔顺字形/拼音字号随之等比缩小
  const auxRowH = cell * 0.6;
  const strokeRowH = settings.showStroke ? auxRowH : 0;
  const pinyinRowH = settings.showPinyin ? auxRowH : 0;
  const rowGap = mmToPx(settings.rowGap);
  const maxY = m.top + contentHeight;

  function drawPracticeGroup(y: number, ch?: string): number {
    if (y + strokeRowH + pinyinRowH + cell > maxY) return maxY + 1;

    if (settings.showStroke) {
      // 整行外边框：与拼音行/字格行同宽（cols*cell），三行连成一整块；线色与字格一致
      ctx.save();
      ctx.strokeStyle = settings.lineColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(m.left, y, cols * cell, strokeRowH);
      ctx.restore();
      const sd = ch ? peekStroke(ch) : null;
      if (ch && sd && sd.strokes.length > 0) {
        const n = sd.strokes.length;
        const mini = Math.min(strokeRowH, contentWidth / Math.max(n, 1));
        // 笔顺字形比字格小一点，在槽位内居中
        const gs = mini * 0.8;
        const gy = y + (strokeRowH - gs) / 2;
        // 逐笔累进：第 k 个位置画前 k 笔，已写笔画用首字高亮的字色、当前第 k 笔标红（不画方格、不标序号）
        for (let k = 1; k <= n; k++) {
          const sx = m.left + (k - 1) * mini;
          const gx = sx + (mini - gs) / 2;
          drawCharStrokes(ctx, ch, gx, gy, gs, {
            color: settings.color,
            upTo: k,
            lastStrokeColor: "#d33b3b",
          });
        }
      }
      y += strokeRowH;
    }

    if (settings.showPinyin) {
      const py = ch ? effectivePinyin(ch, settings) : "";
      // 多音字：在行首左侧页边距空白处放一个可点击切换按钮，并把命中区记入 markers
      if (ch && markers) {
        const all = charAllPinyins(ch);
        if (all.length > 1 && m.left >= 14) {
          const btnH = Math.min(pinyinRowH * 0.6, 20);
          const btnW = Math.min(btnH * 1.15, m.left - 4);
          const bx = m.left - btnW - 2;
          const by = y + (pinyinRowH - btnH) / 2;
          const cur = Math.max(
            0,
            Math.min(settings.pinyinOverrides?.[ch] ?? 0, all.length - 1),
          );
          drawPinyinToggle(ctx, bx, by, btnW, btnH, cur + 1, all.length);
          markers.push({ char: ch, x: bx, y: by, w: btnW, h: btnH });
        }
      }
      // 四线三格：整行连续横线 + 最外两侧竖向边框（与下方字格一体）
      drawPinyinRule(
        ctx,
        m.left,
        y,
        cols * cell,
        pinyinRowH,
        settings.lineColor,
      );
      // 每个练习列居中写一个拼音（插入空列时仅偶数列）；
      // 拼音颜色按列套用与下方汉字相同的规则（practiceCellLook）：
      // 受首字高亮 + 高亮数量约束——前 N 个用高亮色、其余用描红色。
      for (let c = 0; c < cols; c++) {
        const slot = !settings.insertEmptyCol || c % 2 === 0;
        const idx = settings.insertEmptyCol ? Math.floor(c / 2) : c;
        if (slot && py) {
          drawPinyinText(
            ctx,
            py,
            m.left + c * cell + cell / 2,
            y,
            pinyinRowH,
            cell - 4,
            practiceCellLook(settings, idx).color,
          );
        }
      }
      y += pinyinRowH;
    }

    for (let c = 0; c < cols; c++) {
      // 插入空列：字落在偶数列，练习字序号按实际字数计算
      const slot = !settings.insertEmptyCol || c % 2 === 0;
      const idx = settings.insertEmptyCol ? Math.floor(c / 2) : c;
      if (slot && ch && shouldRenderPracticeChar(settings, idx)) {
        drawCharCell(
          ctx,
          ch,
          m.left + c * cell,
          y,
          cell,
          settings,
          practiceCellLook(settings, idx),
        );
      } else {
        drawCellBox(
          ctx,
          settings.gridType,
          m.left + c * cell,
          y,
          cell,
          settings.lineColor,
        );
      }
    }

    return y + cell + rowGap;
  }

  let y = m.top;
  for (const ch of chars) {
    y = drawPracticeGroup(y, ch);
    if (y > maxY) break;
    // 插入空行：在每两个字块之间补一个完整空组。笔顺/拼音/文字三行是一个整体，
    // 空行也应是等高同结构的空组（drawPracticeGroup 不传 ch 即只画格不画内容），
    // 这样开启笔顺/拼音时空白练习区与其余字组对齐、结构齐全。
    if (settings.insertEmptyRow) {
      y = drawPracticeGroup(y);
    }
  }

  // 内容画完后继续铺满整页练习格，符合字帖工坊的使用预期。
  while (y + strokeRowH + pinyinRowH + cell <= maxY) {
    y = drawPracticeGroup(y);
  }
}

/** 段落字帖：横线 + 文本（描红为浅灰范字便于描摹） */
function drawParagraphCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const lineHeight = settings.fontSize + settings.lineSpacing;
  setFont(ctx, settings);

  const lines: string[] = [];
  for (const para of settings.content.split("\n")) {
    const chars = Array.from(para);
    let cur = "";
    for (const ch of chars) {
      const test = cur + ch;
      if (ctx.measureText(test).width > contentWidth && cur.length > 0) {
        lines.push(cur);
        cur = ch;
      } else {
        cur = test;
      }
    }
    lines.push(cur);
  }

  ctx.strokeStyle = settings.lineColor;
  ctx.lineWidth = 1;
  let yBase = m.top + lineHeight;
  for (let i = 0; i < lines.length && yBase <= m.top + contentHeight; i++) {
    ctx.beginPath();
    ctx.moveTo(m.left, yBase);
    ctx.lineTo(m.left + contentWidth, yBase);
    ctx.stroke();
    yBase += lineHeight;
  }

  ctx.save();
  setFont(ctx, settings);
  const mode: "solid" | "trace" | "hollow" =
    settings.renderMode === "hollow"
      ? "hollow"
      : settings.renderMode === "miao"
        ? "trace"
        : "solid";
  // 范字基线与横线对齐：字坐在横线上，便于描摹（原先上浮 lineSpacing/2）
  yBase = m.top + lineHeight;
  for (let i = 0; i < lines.length && yBase <= m.top + contentHeight; i++) {
    paintChar(
      ctx,
      lines[i],
      m.left,
      yBase,
      mode,
      settings.color,
      settings.miaoColor,
      settings.fontSize,
      "left",
      "alphabetic",
    );
    yBase += lineHeight;
  }
  ctx.restore();
}

/** 英文四线三格字帖（字母 / 单词） */
function drawEnglishCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const unit = settings.fontSize * 2.4;
  const gap = unit * 0.4;
  const seq = Array.from(settings.content).filter((c) => c.trim().length > 0);
  const charW = settings.fontSize * 0.8;
  const cols = Math.max(1, Math.floor(contentWidth / charW));

  let y = m.top;
  let idx = 0;
  while (y + unit <= m.top + contentHeight && idx < seq.length) {
    drawFourLineGrid(ctx, m.left, y, contentWidth, unit, settings.lineColor);
    ctx.save();
    setFont(ctx, settings);
    const baselineY = y + unit * (2 / 3);
    for (let c = 0; c < cols && idx < seq.length; c++) {
      const cx = m.left + (c + 0.5) * charW;
      paintChar(
        ctx,
        seq[idx++],
        cx,
        baselineY,
        settings.renderMode === "hollow"
          ? "hollow"
          : settings.renderMode === "miao"
            ? "trace"
            : "solid",
        settings.color,
        settings.miaoColor,
        settings.fontSize,
      );
    }
    ctx.restore();
    y += unit + gap;
  }
}

function drawFourLineGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  unit: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  for (const i of [0, 3]) {
    const ly = y + (i * unit) / 3;
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + width, ly);
    ctx.stroke();
  }
  ctx.setLineDash([4, 3]);
  for (const i of [1, 2]) {
    const ly = y + (i * unit) / 3;
    ctx.beginPath();
    ctx.moveTo(x, ly);
    ctx.lineTo(x + width, ly);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.restore();
}

/** 英文段落字帖：横线 + 按词换行 */
function drawEnglishParagraphCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const lineHeight = settings.fontSize + settings.lineSpacing;
  setFont(ctx, settings);

  const lines: string[] = [];
  for (const para of settings.content.split("\n")) {
    const words = para.split(/\s+/).filter(Boolean);
    let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (ctx.measureText(test).width > contentWidth && cur) {
        lines.push(cur);
        cur = w;
      } else {
        cur = test;
      }
    }
    if (cur) lines.push(cur);
  }

  ctx.strokeStyle = settings.lineColor;
  ctx.lineWidth = 1;
  let yBase = m.top + lineHeight;
  for (let i = 0; i < lines.length && yBase <= m.top + contentHeight; i++) {
    ctx.beginPath();
    ctx.moveTo(m.left, yBase);
    ctx.lineTo(m.left + contentWidth, yBase);
    ctx.stroke();
    yBase += lineHeight;
  }

  ctx.save();
  setFont(ctx, settings);
  const mode: "solid" | "trace" | "hollow" =
    settings.renderMode === "hollow"
      ? "hollow"
      : settings.renderMode === "miao"
        ? "trace"
        : "solid";
  // 范字基线与横线对齐：字坐在横线上，便于描摹（原先上浮 lineSpacing/2）
  yBase = m.top + lineHeight;
  for (let i = 0; i < lines.length && yBase <= m.top + contentHeight; i++) {
    paintChar(
      ctx,
      lines[i],
      m.left,
      yBase,
      mode,
      settings.color,
      settings.miaoColor,
      settings.fontSize,
      "left",
      "alphabetic",
    );
    yBase += lineHeight;
  }
  ctx.restore();
}

/** 控笔练习：多种线条图案铺满整页 */
function drawControlCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const rowH = settings.fontSize * 1.6;
  ctx.save();
  ctx.strokeStyle = settings.color;
  ctx.lineWidth = Math.max(1, settings.fontSize * 0.05);
  ctx.lineCap = "round";

  const patterns: ((
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
  ) => void)[] = [
    (c, x, y, w, h) => {
      const step = h * 0.8;
      for (let sx = x; sx < x + w; sx += step) {
        c.beginPath();
        c.moveTo(sx, y + h);
        c.lineTo(sx + h * 0.8, y);
        c.stroke();
      }
    },
    (c, x, y, w, h) => {
      const mid = y + h / 2;
      const amp = h * 0.3;
      c.beginPath();
      c.moveTo(x, mid);
      for (let sx = x; sx <= x + w; sx += 4) {
        c.lineTo(sx, mid + Math.sin(((sx - x) / h) * Math.PI * 2) * amp);
      }
      c.stroke();
    },
    (c, x, y, w, h) => {
      const r = h * 0.35;
      for (let sx = x + r; sx < x + w; sx += r * 2) {
        c.beginPath();
        c.arc(sx, y + h / 2, r, 0, Math.PI * 2);
        c.stroke();
      }
    },
    (c, x, y, w, h) => {
      const step = h * 0.7;
      c.beginPath();
      c.moveTo(x, y + h / 2);
      for (let sx = x; sx < x + w; sx += step) {
        c.lineTo(sx + step / 2, y + h * 0.15);
        c.lineTo(sx + step, y + h * 0.85);
      }
      c.stroke();
    },
    (c, x, y, w, h) => {
      const cx = x + h / 2;
      const cy = y + h / 2;
      c.beginPath();
      for (let t = 0; t < Math.PI * 8; t += 0.2) {
        const r = (t / (Math.PI * 8)) * (h * 0.45);
        const px = cx + Math.cos(t) * r;
        const py = cy + Math.sin(t) * r;
        if (t === 0) c.moveTo(px, py);
        else c.lineTo(px, py);
      }
      c.stroke();
    },
  ];

  let row = 0;
  for (let y = m.top; y + rowH <= m.top + contentHeight; y += rowH) {
    patterns[row % patterns.length](ctx, m.left, y, contentWidth, rowH);
    row++;
  }
  ctx.restore();
}

/** 字帖总调度 */
export function drawCopybook(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: CopybookSettings,
  markers?: PinyinToggleMarker[],
): void {
  // 每次重绘前清空命中区，由 drawCharacterCopybook 重新填充
  if (markers) markers.length = 0;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const m: MarginPx = {
    top: settings.margin.top,
    right: settings.margin.right,
    bottom: settings.margin.bottom,
    left: settings.margin.left,
  };
  const contentWidth = width - m.left - m.right;
  const contentHeight = height - m.top - m.bottom;

  switch (settings.type) {
    case "pinyin":
      // 拼音字帖 = 汉字网格 + 强制显示拼音
      drawCharacterCopybook(
        ctx,
        { ...settings, showPinyin: true },
        m,
        contentWidth,
        contentHeight,
        markers,
      );
      break;
    case "character":
    case "word":
    case "number":
    case "stroke":
      drawCharacterCopybook(
        ctx,
        settings,
        m,
        contentWidth,
        contentHeight,
        markers,
      );
      break;
    case "paragraph":
      drawParagraphCopybook(ctx, settings, m, contentWidth, contentHeight);
      break;
    case "english-char":
    case "english-word":
      drawEnglishCopybook(ctx, settings, m, contentWidth, contentHeight);
      break;
    case "english-para":
      drawEnglishParagraphCopybook(
        ctx,
        settings,
        m,
        contentWidth,
        contentHeight,
      );
      break;
    case "control":
      drawControlCopybook(ctx, settings, m, contentWidth, contentHeight);
      break;
  }
}
