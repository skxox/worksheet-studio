import type { CopybookSettings, GridType, MarginPx } from "@/types";
import { fontStack } from "@/lib/fonts";
import {
  mmToPx,
  drawTianGrid,
  drawMiGrid,
  drawHuigongGrid,
  drawFangGrid,
  drawJiugongGrid,
} from "@/lib/paper";
import { charToPinyin } from "@/lib/pinyin";
import { drawCharStrokes, peekStroke } from "@/lib/stroke";

export type RenderModeLike = CopybookSettings["renderMode"];

/** 笔画字帖预设：横竖撇捺点提等基本笔画 */
export const STROKE_PRESET = "一丨丿㇏丶㇀𠃋𠃌";

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

/** 按 renderMode + 首字高亮决定该格是实心还是空心 */
function practiceCellStyle(
  settings: CopybookSettings,
  index: number,
): "solid" | "trace" | "hollow" {
  if (settings.renderMode === "solid") return "solid";
  if (settings.renderMode === "hollow") return "hollow";
  if (settings.highlightFirst && index === 0) return "solid";
  return "trace";
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
    default:
      drawFangGrid(ctx, x, y, size, color);
      break;
  }
}

/** 拼音格：浅框 + 居中拼音（与下方汉字格同宽对齐） */
function drawPinyinCell(
  ctx: CanvasRenderingContext2D,
  py: string,
  x: number,
  y: number,
  cell: number,
) {
  ctx.save();
  ctx.strokeStyle = "#e3e3e3";
  ctx.lineWidth = 0.6;
  ctx.strokeRect(x, y, cell, cell);
  if (py) {
    ctx.fillStyle = "#8a8a8a";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${cell * 0.34}px ui-sans-serif, system-ui, sans-serif`;
    ctx.fillText(py, x + cell / 2, y + cell / 2);
  }
  ctx.restore();
}

/** 汉字格：画格 + 按 style 绘字（solid 实心 / hollow 描红空心） */
function drawCharCell(
  ctx: CanvasRenderingContext2D,
  ch: string,
  x: number,
  y: number,
  cell: number,
  settings: CopybookSettings,
  style: "solid" | "trace" | "hollow",
) {
  drawCellBox(ctx, settings.gridType, x, y, cell, settings.lineColor);
  const fontPx = cell * (settings.fontScale / 100);
  const cx = x + cell / 2;
  const cy = y + cell / 2 + (settings.vOffset / 100) * cell;
  ctx.save();
  setFont(ctx, settings, fontPx);
  paintChar(ctx, ch, cx, cy, style, settings.color, settings.miaoColor, fontPx);
  ctx.restore();
}

/** 汉字 / 词组 / 数字 / 笔画 / 拼音字帖 */
function drawCharacterCopybook(
  ctx: CanvasRenderingContext2D,
  settings: CopybookSettings,
  m: MarginPx,
  contentWidth: number,
  contentHeight: number,
) {
  const cell = mmToPx(settings.gridSize);
  const cols = Math.max(1, Math.floor(contentWidth / cell));
  const chars = Array.from(settings.content).filter((c) => c.trim().length > 0);

  const strokeRowH = settings.showStroke ? cell * 0.7 : 0;
  const pinyinRowH = settings.showPinyin ? cell : 0; // 与汉字格等高、列对齐
  const rowGap = mmToPx(settings.rowGap);
  const maxY = m.top + contentHeight;

  function drawPracticeGroup(y: number, ch?: string): number {
    if (y + strokeRowH + pinyinRowH + cell > maxY) return maxY + 1;

    if (settings.showStroke) {
      const sd = ch ? peekStroke(ch) : null;
      if (ch && sd && sd.strokes.length > 0) {
        const n = sd.strokes.length;
        const mini = Math.min(strokeRowH, contentWidth / Math.max(n, 1));
        for (let k = 1; k <= n; k++) {
          drawCharStrokes(ctx, ch, m.left + (k - 1) * mini * 1.02, y, mini, {
            color: settings.color,
            upTo: k,
            orderNumber: k,
          });
        }
      }
      y += strokeRowH;
    }

    if (settings.showPinyin) {
      const py = ch ? charToPinyin(ch) : "";
      for (let c = 0; c < cols; c++) {
        drawPinyinCell(ctx, py, m.left + c * cell, y, cell);
      }
      y += pinyinRowH;
    }

    for (let c = 0; c < cols; c++) {
      if (ch && shouldRenderPracticeChar(settings, c)) {
        drawCharCell(
          ctx,
          ch,
          m.left + c * cell,
          y,
          cell,
          settings,
          practiceCellStyle(settings, c),
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
  yBase = m.top + lineHeight - settings.lineSpacing / 2;
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
  yBase = m.top + lineHeight - settings.lineSpacing / 2;
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
): void {
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
      );
      break;
    case "character":
    case "word":
    case "number":
    case "stroke":
      drawCharacterCopybook(ctx, settings, m, contentWidth, contentHeight);
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
