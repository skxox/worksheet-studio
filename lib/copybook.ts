import {
  ControlTraceWeight,
  type CopybookSettings,
  type GridType,
  type MarginPx,
} from "@/types";
import {
  fontStack,
  fontMetrics,
  pinyinFontSpec,
  type PinyinFontSpec,
} from "@/lib/fonts";
import {
  mmToPx,
  placeCenteredGridBlock,
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
import {
  buildEnglishCharacterSamples,
  splitEnglishWordRows,
  splitPinyinPracticeRows,
} from "@/lib/copybook-language";
import {
  buildNumberPracticeSequence,
  parseNumberRows,
} from "@/lib/copybook-number";
import {
  drawControlPattern,
  parseControlPatternCodes,
} from "@/lib/copybook-control";

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
  if (settings.renderMode === "solid")
    return { style: "solid", color: settings.color };
  if (settings.renderMode === "hollow")
    return { style: "hollow", color: settings.color };
  if (settings.highlightFirst && index < Math.max(0, settings.highlightCount)) {
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
  spec?: PinyinFontSpec,
) {
  if (!py) return;
  const s = spec ?? { family: "", scale: 66, offset: 0 };
  const family = s.family
    ? `"${s.family}", ui-sans-serif, sans-serif`
    : "ui-sans-serif, system-ui, sans-serif";
  const gap = h / 3;
  ctx.save();
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  // 专用拼音字体按各自 scale 定字号（为四线三格定制）；宽度超格时收缩
  let fs = h * (s.scale / 100);
  ctx.font = `${fs}px ${family}`;
  while (ctx.measureText(py).width > maxW && fs > 8) {
    fs -= 1;
    ctx.font = `${fs}px ${family}`;
  }
  ctx.fillText(py, cx, y + 2 * gap + (s.offset / 100) * fs);
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
  // 垂直位置 = 格心 + 用户上下偏移 + 字体标定的基线修正（手写字体 em 框内字形高低不一）
  const cy =
    y +
    cell / 2 +
    (settings.vOffset / 100) * cell +
    (fontMetrics(settings.fontFamily).offset / 100) * fontPx;
  ctx.save();
  setFont(ctx, settings, fontPx);
  paintChar(
    ctx,
    ch,
    cx,
    cy,
    look.style,
    look.color,
    settings.miaoColor,
    fontPx,
  );
  ctx.restore();
}

interface StrokeTemplateRow {
  pattern: string;
  example: string;
}

function parseStrokeTemplateRows(content: string): StrokeTemplateRow[] {
  // 旧版本默认内容是基本笔画预设串；新版默认留空，故把遗留预设当作空内容处理，
  // 让曾访问过的用户（localStorage 仍是旧预设）也得到「空白练习页」的新默认行为。
  if (content.trim() === STROKE_PRESET) return [];
  const rows: StrokeTemplateRow[] = [];
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const [pattern = "", example = ""] = trimmed.split("\t");
    if (pattern in STROKE_PATTERN_GLYPHS) {
      // 序列化格式："pattern\t示例字"
      rows.push({ pattern, example: example.trim() });
    } else {
      // 预设串 / 旧格式 / 纯汉字：每个非空白字符单独成行，按字回退到对应笔画
      for (const ch of Array.from(pattern)) {
        if (!ch.trim()) continue;
        rows.push({
          pattern: STROKE_CHAR_TO_PATTERN[ch] ?? "long-heng",
          example: ch,
        });
      }
    }
  }
  return rows;
}

function drawLineGuides(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
  lineHeight: number,
): number[] {
  const rowCount = Math.max(0, Math.floor(contentHeight / lineHeight));
  if (rowCount <= 0) return [];
  // 居中布局：整块行组在边距内容盒内垂直居中，上下留白一致
  const blockTop = m.top + (contentHeight - rowCount * lineHeight) / 2;
  const x0 = m.left;
  const x1 = m.left + contentWidth;
  // 双横线间距：随行高自适应，夹在合理区间
  const gap = Math.max(1.5, Math.min(3, lineHeight * 0.07));

  ctx.save();
  ctx.strokeStyle = settings.lineColor;
  ctx.lineWidth = 1;
  for (let i = 0; i <= rowCount; i++) {
    const y = blockTop + i * lineHeight;
    const isEdge = i === 0 || i === rowCount;
    if (isEdge) {
      // 首条 / 末条：单横线
      ctx.beginPath();
      ctx.moveTo(x0, y);
      ctx.lineTo(x1, y);
      ctx.stroke();
    } else {
      // 中间行界：双横线（两条平行线分列边界两侧，相邻两行文字居于其上下）
      ctx.beginPath();
      ctx.moveTo(x0, y - gap);
      ctx.lineTo(x1, y - gap);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x0, y + gap);
      ctx.lineTo(x1, y + gap);
      ctx.stroke();
    }
  }
  ctx.restore();

  // 返回每行「可绘空间」的垂直中心：上下边界各取其内侧线（双横线取靠近行内的那根，
  // 单线取其本身）再求中点。文字按此中心绘制 = 在双横线内部空间上下居中。
  const centers: number[] = [];
  for (let r = 0; r < rowCount; r++) {
    const topY = blockTop + r * lineHeight;
    const innerTop = topY + (r === 0 ? 0 : gap);
    const innerBottom = topY + lineHeight - (r + 1 === rowCount ? 0 : gap);
    centers.push((innerTop + innerBottom) / 2);
  }
  return centers;
}

function drawWordCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const groups = settings.content
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
  const cell = mmToPx(settings.gridSize);
  const rowGap = mmToPx(settings.rowGap);
  const groupGap = mmToPx(settings.groupSpacing || 4);
  const auxRowH = settings.showPinyin ? cell * 0.6 : 0;
  // 居中布局：行/列取整后整块网格在边距内容盒内水平/垂直居中（上下间距一致）
  const placement = placeCenteredGridBlock({
    margin: m,
    contentWidth,
    contentHeight,
    colUnit: cell,
    rowHeight: auxRowH + cell,
    rowGap,
  });
  const cols = Math.max(1, placement.cols);
  const area: MarginPx = {
    ...m,
    left: placement.startX,
    top: placement.startY,
  };
  const maxY = placement.endY;

  function drawWordLine(y: number, text: string): number {
    if (y + auxRowH + cell > maxY + 0.5) return maxY + 1;
    const chars = Array.from(text).filter((c) => c.trim().length > 0);

    if (settings.showPinyin) {
      drawPinyinRule(
        ctx,
        area.left,
        y,
        cols * cell,
        auxRowH,
        settings.lineColor,
      );
      chars.forEach((ch, index) => {
        if (index >= cols) return;
        drawPinyinText(
          ctx,
          effectivePinyin(ch, settings),
          area.left + index * cell + cell / 2,
          y,
          auxRowH,
          cell - 4,
          practiceCellLook(settings, index).color,
          pinyinFontSpec(settings.pinyinFont),
        );
      });
      y += auxRowH;
    }

    for (let c = 0; c < cols; c++) {
      const ch = chars[c];
      if (ch && shouldRenderPracticeChar(settings, c)) {
        drawCharCell(
          ctx,
          ch,
          area.left + c * cell,
          y,
          cell,
          settings,
          practiceCellLook(settings, c),
        );
      } else {
        drawCellBox(
          ctx,
          settings.gridType,
          area.left + c * cell,
          y,
          cell,
          settings.lineColor,
        );
      }
    }

    return y + cell + rowGap;
  }

  let y = area.top;
  for (const word of groups) {
    y = drawWordLine(y, word);
    if (y > maxY) break;
    if (settings.insertEmptyRow) y += groupGap;
  }
  while (y + auxRowH + cell <= maxY + 0.5) {
    y = drawWordLine(y, "");
  }
}

function drawNumberGridRow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  rowHeight: number,
  colWidth: number,
  color: string,
) {
  const cols = Math.max(1, Math.floor(width / colWidth));
  const gridWidth = cols * colWidth;
  const midY = y + rowHeight / 2;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + gridWidth, y);
  ctx.moveTo(x, y + rowHeight);
  ctx.lineTo(x + gridWidth, y + rowHeight);
  ctx.moveTo(x, y);
  ctx.lineTo(x, y + rowHeight);
  ctx.moveTo(x + gridWidth, y);
  ctx.lineTo(x + gridWidth, y + rowHeight);
  ctx.stroke();

  ctx.strokeStyle = "#b8c2d0";
  ctx.lineWidth = 0.8;
  ctx.setLineDash([2.5, 2]);
  for (let c = 1; c < cols; c++) {
    const cx = x + c * colWidth;
    ctx.beginPath();
    ctx.moveTo(cx, y);
    ctx.lineTo(cx, y + rowHeight);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(x, midY);
  ctx.lineTo(x + gridWidth, midY);
  ctx.stroke();

  ctx.restore();
}

function drawNumberCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const rowHeight = mmToPx(settings.gridSize);
  const colWidth = rowHeight * 0.52;
  const rowGap = mmToPx(settings.rowGap);
  const rows = parseNumberRows(settings.content);
  // 居中布局：整块网格在边距内容盒内水平/垂直居中（数字列宽 = 0.52×行高）
  const placement = placeCenteredGridBlock({
    margin: m,
    contentWidth,
    contentHeight,
    colUnit: colWidth,
    rowHeight,
    rowGap,
  });
  const cols = Math.max(1, placement.cols);
  const gridWidth = cols * colWidth;
  const gridLeft = placement.startX;
  const maxY = placement.endY;
  const visibleColumns = settings.insertEmptyCol ? Math.ceil(cols / 2) : cols;
  const practiceLimit = Math.max(
    0,
    Math.min(visibleColumns, settings.solidCount),
  );

  function drawNumberLine(y: number, token?: string): number {
    if (y + rowHeight > maxY + 0.5) return maxY + 1;
    drawNumberGridRow(
      ctx,
      gridLeft,
      y,
      gridWidth,
      rowHeight,
      colWidth,
      settings.lineColor,
    );

    if (token) {
      const sequence = buildNumberPracticeSequence(
        token,
        practiceLimit,
        visibleColumns,
      );
      if (sequence.length > 0) {
        let renderedCount = 0;
        for (let c = 0; c < cols; c++) {
          if (settings.insertEmptyCol && c % 2 === 1) continue;
          const seqIndex = settings.insertEmptyCol ? Math.floor(c / 2) : c;
          const ch = sequence[seqIndex] ?? "";
          if (!ch) continue;
          const look = practiceCellLook(settings, renderedCount);
          const fontPx = Math.min(
            rowHeight * (settings.fontScale / 100),
            colWidth * 1.35,
          );
          ctx.save();
          setFont(ctx, settings, fontPx);
          paintChar(
            ctx,
            ch,
            gridLeft + c * colWidth + colWidth / 2,
            y +
              rowHeight / 2 +
              (settings.vOffset / 100) * rowHeight +
              (fontMetrics(settings.fontFamily).offset / 100) * fontPx,
            look.style,
            look.color,
            settings.miaoColor,
            fontPx,
          );
          ctx.restore();
          if (ch !== "/") renderedCount += 1;
        }
      }
    }

    return y + rowHeight + rowGap;
  }

  let y = placement.startY;
  for (const row of rows) {
    y = drawNumberLine(y, row);
    if (y > maxY) break;
    if (settings.insertEmptyRow) y = drawNumberLine(y);
  }

  while (y + rowHeight <= maxY + 0.5) {
    y = drawNumberLine(y);
  }
}

const STROKE_PATTERN_GLYPHS: Record<string, string> = {
  "right-dot": "丶",
  "left-dot": "丶",
  "long-heng": "一",
  "short-heng": "一",
  shu: "丨",
  pie: "丿",
  na: "㇏",
  ti: "㇀",
  "heng-zhe": "乙",
  "heng-gou": "了",
  "shu-gou": "亅",
  "xie-gou": "戈",
};

/** 单字 → 笔画 pattern 回退：用于预设串 / 旧格式 / 纯汉字内容的逐字解析。
 *  与 `app/copybook/copybook-config.ts` 的 parseStrokeContent 共用，避免两处解析不一致。 */
export const STROKE_CHAR_TO_PATTERN: Record<string, string> = {
  一: "long-heng",
  丨: "shu",
  丿: "pie",
  "㇏": "na",
  丶: "right-dot",
  "㇀": "ti",
  "𠃋": "heng-zhe",
  "𠃌": "heng-gou",
};

function drawStrokeCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const rows = parseStrokeTemplateRows(settings.content);
  const cell = mmToPx(settings.gridSize);
  const rowGap = mmToPx(settings.rowGap);
  // 居中布局：整块网格在边距内容盒内水平/垂直居中（上下间距一致）
  const placement = placeCenteredGridBlock({
    margin: m,
    contentWidth,
    contentHeight,
    colUnit: cell,
    rowHeight: cell,
    rowGap,
  });
  const cols = Math.max(1, placement.cols);
  const area: MarginPx = {
    ...m,
    left: placement.startX,
    top: placement.startY,
  };
  const maxY = placement.endY;
  let y = area.top;

  for (const row of rows) {
    if (y + cell > maxY + 0.5) break;
    // 笔顺拆解练习的是「包含该笔画的字」，而非笔画本身：无例字则该行只画空格、不绘字
    const guideChar = row.example.trim().charAt(0);
    for (let c = 0; c < cols; c++) {
      const x = area.left + c * cell;
      if (guideChar) {
        drawCharCell(
          ctx,
          guideChar,
          x,
          y,
          cell,
          settings,
          practiceCellLook(settings, c),
        );
      } else {
        drawCellBox(ctx, settings.gridType, x, y, cell, settings.lineColor);
      }
    }
    y += cell + rowGap;
    if (settings.insertEmptyRow) y += cell + rowGap;
  }

  while (y + cell <= maxY + 0.5) {
    for (let c = 0; c < cols; c++) {
      drawCellBox(
        ctx,
        settings.gridType,
        area.left + c * cell,
        y,
        cell,
        settings.lineColor,
      );
    }
    y += cell + rowGap;
  }
}

/** 段前缩进的「整字宽」单位：取文本中首个非空字符的实测推进宽度（按当前字体，
 *  不写死 1em）——CJK≈一个字宽；拉丁文取首字母宽；纯空白回退字号。 */
function indentUnitWidth(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSize: number,
): number {
  for (const ch of Array.from(text)) {
    if (ch.trim()) return ctx.measureText(ch).width;
  }
  return fontSize;
}

function measureSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  spacing: number,
  fontSize: number,
): number {
  if (!text) return 0;
  const unit = indentUnitWidth(ctx, text, fontSize);
  let w = 0;
  let leading = true;
  for (const ch of Array.from(text)) {
    if (ch.trim()) {
      leading = false;
      w += ctx.measureText(ch).width + spacing;
    } else {
      // 段首空白 = 缩进，按整字宽；段中空白按字体常规空格宽
      w += (leading ? unit : ctx.measureText(ch).width) + spacing;
    }
  }
  return w;
}

function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  spacing: number,
  style: "solid" | "trace" | "hollow",
  color: string,
  traceColor: string,
  fontSize: number,
  baseline: CanvasTextBaseline = "alphabetic",
) {
  let cursorX = x;
  const unit = indentUnitWidth(ctx, text, fontSize);
  let leading = true;
  for (const ch of Array.from(text)) {
    if (ch.trim()) {
      leading = false;
      paintChar(
        ctx,
        ch,
        cursorX,
        y,
        style,
        color,
        traceColor,
        fontSize,
        "left",
        baseline,
      );
      cursorX += ctx.measureText(ch).width + spacing;
    } else {
      // 段首空白 = 缩进，按整字宽推进（不绘制）；段中空白按常规空格宽
      cursorX += (leading ? unit : ctx.measureText(ch).width) + spacing;
    }
  }
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
  const chars = Array.from(settings.content).filter((c) => c.trim().length > 0);

  // 笔顺行与拼音四线三格行同高（均略矮于字格），笔顺字形/拼音字号随之等比缩小
  const auxRowH = cell * 0.6;
  const strokeRowH = settings.showStroke ? auxRowH : 0;
  const pinyinRowH = settings.showPinyin ? auxRowH : 0;
  const rowGap = mmToPx(settings.rowGap);
  // 居中布局：行/列取整后，整块网格在边距内容盒内水平/垂直居中，
  // 上下留白各为剩余高度的一半，视觉间距一致。
  const placement = placeCenteredGridBlock({
    margin: m,
    contentWidth,
    contentHeight,
    colUnit: cell,
    rowHeight: strokeRowH + pinyinRowH + cell,
    rowGap,
  });
  const cols = Math.max(1, placement.cols);
  const area: MarginPx = {
    ...m,
    left: placement.startX,
    top: placement.startY,
  };
  const maxY = placement.endY;

  function drawPracticeGroup(y: number, ch?: string): number {
    if (y + strokeRowH + pinyinRowH + cell > maxY + 0.5) return maxY + 1;

    if (settings.showStroke) {
      // 整行外边框：与拼音行/字格行同宽（cols*cell），三行连成一整块；线色与字格一致
      ctx.save();
      ctx.strokeStyle = settings.lineColor;
      ctx.lineWidth = 1;
      ctx.strokeRect(area.left, y, cols * cell, strokeRowH);
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
          const sx = area.left + (k - 1) * mini;
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
        if (all.length > 1 && area.left >= 14) {
          const btnH = Math.min(pinyinRowH * 0.6, 20);
          const btnW = Math.min(btnH * 1.15, area.left - 4);
          const bx = area.left - btnW - 2;
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
        area.left,
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
            area.left + c * cell + cell / 2,
            y,
            pinyinRowH,
            cell - 4,
            practiceCellLook(settings, idx).color,
            pinyinFontSpec(settings.pinyinFont),
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
          area.left + c * cell,
          y,
          cell,
          settings,
          practiceCellLook(settings, idx),
        );
      } else {
        drawCellBox(
          ctx,
          settings.gridType,
          area.left + c * cell,
          y,
          cell,
          settings.lineColor,
        );
      }
    }

    return y + cell + rowGap;
  }

  let y = area.top;
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
  while (y + strokeRowH + pinyinRowH + cell <= maxY + 0.5) {
    y = drawPracticeGroup(y);
  }
}

/** 拼音字帖：每个输入行独立成行，按字符循环生成描红格。 */
function drawPinyinCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const rowHeight = mmToPx(settings.gridSize);
  const rowGap = mmToPx(settings.rowGap);
  const rowStep = rowHeight + rowGap;
  const maxRows = Math.max(0, Math.floor((contentHeight + rowGap) / rowStep));
  // 居中布局：整块行组在边距内容盒内垂直居中（拼音行横向铺满，无需水平居中）
  const startY =
    m.top +
    (contentHeight - (maxRows > 0 ? maxRows * rowStep - rowGap : 0)) / 2;
  const columns = Math.max(1, Math.floor(contentWidth / (rowHeight * 0.82)));
  const cellWidth = contentWidth / columns;
  const sampleLimit = Math.min(
    columns,
    Math.max(0, Math.floor(settings.solidCount)),
  );
  const fontSize = rowHeight * (settings.fontScale / 100);
  const baselineOffset = (settings.vOffset / 100) * rowHeight;
  // 拼音模板的字形用拼音专用字体（四线三格定制字形），字号仍由「字体大小」滑杆控制
  const pyFamily = pinyinFontSpec(settings.pinyinFont).family;

  const drawRow = (characters: string[], y: number) => {
    ctx.save();
    ctx.strokeStyle = settings.lineColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(m.left, y);
    ctx.lineTo(m.left + contentWidth, y);
    ctx.moveTo(m.left, y + rowHeight);
    ctx.lineTo(m.left + contentWidth, y + rowHeight);
    for (let column = 0; column <= columns; column++) {
      const x = m.left + column * cellWidth;
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + rowHeight);
    }
    ctx.stroke();

    ctx.strokeStyle = "#b8c2d0";
    ctx.lineWidth = 0.6;
    ctx.setLineDash([3, 2]);
    for (const guide of [1, 2]) {
      const guideY = y + (rowHeight * guide) / 3;
      ctx.beginPath();
      ctx.moveTo(m.left, guideY);
      ctx.lineTo(m.left + contentWidth, guideY);
      ctx.stroke();
    }

    if (characters.length > 0 && sampleLimit > 0) {
      setFont(ctx, settings, fontSize);
      if (pyFamily) {
        const w = settings.fontWeight === "bold" ? "bold " : "";
        ctx.font = `${w}${fontSize}px "${pyFamily}", ui-sans-serif, sans-serif`;
      }
      for (let column = 0; column < sampleLimit; column++) {
        const character = characters[column % characters.length];
        const look = practiceCellLook(settings, column);
        paintChar(
          ctx,
          character,
          m.left + (column + 0.5) * cellWidth,
          y + rowHeight / 2 + baselineOffset,
          look.style,
          look.color,
          settings.miaoColor,
          fontSize,
        );
      }
    }
    ctx.restore();
  };

  const rows = splitPinyinPracticeRows(settings.content);
  let y = startY;
  let rowsUsed = 0;

  for (const characters of rows) {
    if (rowsUsed >= maxRows) break;
    drawRow(characters, y);
    y += rowStep;
    rowsUsed++;

    if (settings.insertEmptyRow && rowsUsed < maxRows) {
      drawRow([], y);
      y += rowStep;
      rowsUsed++;
    }
  }

  while (rowsUsed < maxRows) {
    drawRow([], y);
    y += rowStep;
    rowsUsed++;
  }
}

/** 段落字帖：横线 + 文本（描红为浅灰范字便于描摹） */
/** 篇章誊写方格模式：正文按换行切段、逐字流式铺入选定方格（作文格/田字格/…）；
 *  字符之外的格子保留为空练习格。字号用「字体大小 %」、可上下偏移（同方格模式）。 */
function drawParagraphCells(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const cell = mmToPx(settings.gridSize);
  const rowGap = mmToPx(settings.rowGap);
  const stepY = cell + rowGap;
  // 居中布局：整块网格在边距内容盒内水平/垂直居中（上下间距一致）
  const placement = placeCenteredGridBlock({
    margin: m,
    contentWidth,
    contentHeight,
    colUnit: cell,
    rowHeight: cell,
    rowGap,
  });
  const cols = Math.max(1, placement.cols);
  const area: MarginPx = {
    ...m,
    left: placement.startX,
    top: placement.startY,
  };
  const maxY = placement.endY;
  const rowCount = placement.rows;

  // 1) 把文字按「换行切段」流式铺到网格坐标；保留段首空白作缩进
  //    （空白也占一格，只是不写字、不计入描红序号）
  const placed = new Map<string, { ch: string; idx: number }>();
  let r = 0;
  let c = 0;
  let idx = 0;
  for (const seg of settings.content.split("\n")) {
    for (const ch of Array.from(seg)) {
      if (r >= rowCount) break;
      const isSpace = !ch.trim();
      placed.set(`${r},${c}`, { ch, idx: isSpace ? -1 : idx });
      c++;
      if (!isSpace) idx++;
      if (c >= cols) {
        c = 0;
        r++;
      }
    }
    if (c !== 0) {
      c = 0;
      r++;
    }
  }

  // 2) 逐格绘制：非空白字绘字（含格 + 上下偏移），空白 / 空位绘空格
  for (let rr = 0; rr < rowCount; rr++) {
    const y = area.top + rr * stepY;
    if (y + cell > maxY + 0.5) break;
    for (let cc = 0; cc < cols; cc++) {
      const x = area.left + cc * cell;
      const hit = placed.get(`${rr},${cc}`);
      if (hit && hit.ch.trim()) {
        drawCharCell(
          ctx,
          hit.ch,
          x,
          y,
          cell,
          settings,
          practiceCellLook(settings, hit.idx),
        );
      } else {
        drawCellBox(ctx, settings.gridType, x, y, cell, settings.lineColor);
      }
    }
  }
}

function drawParagraphCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  // 方格模式（作文格/田字格/…）：文字流式铺入选定方格
  if (settings.gridType !== "line") {
    drawParagraphCells(ctx, settings, m, contentWidth, contentHeight);
    return;
  }

  // 横线格：行带高度（= 两条横线间距）就等于「方格大小」（行间距不适用于横线格；
  // 方格大小即行高，默认 10mm≈38px）。字体大小% 基于方格大小的百分比，只缩放带内文字。
  const cellPx = mmToPx(settings.gridSize);
  const fontPx = cellPx * (settings.fontScale / 100);
  const lineHeight = cellPx;
  const letterSpacing = settings.lineSpacing;

  ctx.save();
  setFont(ctx, settings, fontPx);
  const lines: string[] = [];
  for (const para of settings.content.split("\n")) {
    const chars = Array.from(para);
    let cur = "";
    for (const ch of chars) {
      const test = cur + ch;
      if (
        measureSpacedText(ctx, test, letterSpacing, fontPx) > contentWidth &&
        cur.length > 0
      ) {
        lines.push(cur);
        cur = ch;
      } else {
        cur = test;
      }
    }
    lines.push(cur);
  }
  ctx.restore();

  const centers = drawLineGuides(
    ctx,
    settings,
    m,
    contentWidth,
    contentHeight,
    lineHeight,
  );

  ctx.save();
  setFont(ctx, settings, fontPx);
  const mode: "solid" | "trace" | "hollow" =
    settings.renderMode === "hollow"
      ? "hollow"
      : settings.renderMode === "miao"
        ? "trace"
        : "solid";
  // 文字在「双横线内部可绘空间」上下居中；「上下偏移」整体微调
  const yOffset = (settings.vOffset / 100) * cellPx;
  const count = Math.min(lines.length, centers.length);
  for (let i = 0; i < count; i++) {
    drawSpacedText(
      ctx,
      lines[i],
      m.left,
      centers[i] + yOffset,
      letterSpacing,
      mode,
      settings.color,
      settings.miaoColor,
      fontPx,
      "middle",
    );
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
  const unit = mmToPx(settings.gridSize);
  const rowGap = mmToPx(settings.rowGap);
  const rowStep = unit + rowGap;
  const maxRows = Math.max(0, Math.floor((contentHeight + rowGap) / rowStep));
  // 居中布局：整块行组在边距内容盒内垂直居中（四线格横向铺满，无需水平居中）
  const startY =
    m.top +
    (contentHeight - (maxRows > 0 ? maxRows * rowStep - rowGap : 0)) / 2;
  const fontSize = unit * (settings.fontScale / 100);
  const maxCopies = Math.max(0, Math.floor(settings.solidCount));
  const baselineOffset =
    (settings.vOffset / 100) * unit +
    (fontMetrics(settings.fontFamily).offset / 100) * fontSize;

  const drawRow = (sample: string, y: number) => {
    drawFourLineGrid(ctx, m.left, y, contentWidth, unit, settings.lineColor);
    ctx.save();
    setFont(ctx, settings, fontSize);
    const sampleWidth = ctx.measureText(sample).width;
    const sampleGap = Math.max(mmToPx(0.5), fontSize * 0.28);
    let cursorX = m.left;

    for (let index = 0; index < maxCopies; index++) {
      if (cursorX + sampleWidth > m.left + contentWidth) break;
      const look = practiceCellLook(settings, index);
      paintChar(
        ctx,
        sample,
        cursorX + sampleWidth / 2,
        y + (unit * 2) / 3 + baselineOffset,
        look.style,
        look.color,
        settings.miaoColor,
        fontSize,
        "center",
        "alphabetic",
      );
      cursorX += sampleWidth + sampleGap;
    }
    ctx.restore();
  };

  const drawBlankRow = (y: number) =>
    drawFourLineGrid(ctx, m.left, y, contentWidth, unit, settings.lineColor);

  let y = startY;
  let rowsUsed = 0;

  if (settings.type === "english-char") {
    const samples = buildEnglishCharacterSamples(
      settings.content,
      settings.insertEmptyRow ? Math.ceil(maxRows / 2) : maxRows,
      settings.pairLetterCase,
    );
    for (const sample of samples) {
      drawRow(sample, y);
      y += rowStep;
      rowsUsed++;

      if (settings.insertEmptyRow && rowsUsed < maxRows) {
        drawBlankRow(y);
        y += rowStep;
        rowsUsed++;
      }
    }
  } else {
    for (const word of splitEnglishWordRows(settings.content)) {
      if (rowsUsed >= maxRows) break;
      if (word) drawRow(word, y);
      else drawBlankRow(y);
      y += rowStep;
      rowsUsed++;

      if (settings.insertEmptyRow && rowsUsed < maxRows) {
        drawBlankRow(y);
        y += rowStep;
        rowsUsed++;
      }
    }
  }

  while (rowsUsed < maxRows) {
    drawBlankRow(y);
    y += rowStep;
    rowsUsed++;
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
  const lineHeight = settings.fontSize + mmToPx(settings.rowGap);
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

  const centers = drawLineGuides(
    ctx,
    settings,
    m,
    contentWidth,
    contentHeight,
    lineHeight,
  );

  ctx.save();
  setFont(ctx, settings);
  const mode: "solid" | "trace" | "hollow" =
    settings.renderMode === "hollow"
      ? "hollow"
      : settings.renderMode === "miao"
        ? "trace"
        : "solid";
  // 文字在「双横线内部可绘空间」上下居中
  const count = Math.min(lines.length, centers.length);
  for (let i = 0; i < count; i++) {
    paintChar(
      ctx,
      lines[i],
      m.left,
      centers[i],
      mode,
      settings.color,
      settings.miaoColor,
      settings.fontSize,
      "left",
      "middle",
    );
  }
  ctx.restore();
}

/** 控笔练习：每个图案占一行，行内按描红数量重复，余下格子留白。 */
function drawControlCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const cell = mmToPx(settings.gridSize);
  const rowGap = mmToPx(settings.rowGap);
  const rowStep = cell + rowGap;
  // 居中布局：整块网格在边距内容盒内水平/垂直居中（上下间距一致）
  const { rows, cols, startX, startY } = placeCenteredGridBlock({
    margin: m,
    contentWidth,
    contentHeight,
    colUnit: cell,
    rowHeight: cell,
    rowGap,
  });
  if (cell <= 0 || cols <= 0 || rows <= 0) return;

  const codes = parseControlPatternCodes(settings.content);
  const visibleCols = Math.min(
    cols,
    Math.max(0, Math.floor(settings.solidCount)),
  );
  const traceWidth =
    settings.controlTraceWeight === ControlTraceWeight.Bold
      ? Math.max(1.8, cell * 0.055)
      : Math.max(0.9, cell * 0.03);

  ctx.save();
  ctx.beginPath();
  ctx.rect(startX, startY, cols * cell, rows * rowStep - rowGap);
  ctx.clip();
  ctx.strokeStyle = settings.lineColor;
  ctx.lineWidth = 1;

  for (let row = 0; row < rows; row++) {
    const y = startY + row * rowStep;
    const bottom = y + cell;
    ctx.moveTo(startX, y);
    ctx.lineTo(startX + cols * cell, y);
    ctx.moveTo(startX, bottom);
    ctx.lineTo(startX + cols * cell, bottom);
    for (let col = 0; col <= cols; col++) {
      const x = startX + col * cell;
      ctx.moveTo(x, y);
      ctx.lineTo(x, bottom);
    }
  }
  ctx.stroke();

  let row = 0;
  for (const code of codes) {
    if (row >= rows) break;
    const y = startY + row * rowStep;
    for (let col = 0; col < visibleCols; col++) {
      drawControlPattern(
        ctx,
        code,
        startX + col * cell,
        y,
        cell,
        settings.miaoColor,
        traceWidth,
      );
    }
    row += settings.insertEmptyRow ? 2 : 1;
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
      drawPinyinCopybook(ctx, settings, m, contentWidth, contentHeight);
      break;
    case "character":
      drawCharacterCopybook(
        ctx,
        settings,
        m,
        contentWidth,
        contentHeight,
        markers,
      );
      break;
    case "word":
      drawWordCopybook(ctx, settings, m, contentWidth, contentHeight);
      break;
    case "number":
      drawNumberCopybook(ctx, settings, m, contentWidth, contentHeight);
      break;
    case "stroke":
      drawStrokeCopybook(ctx, settings, m, contentWidth, contentHeight);
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
