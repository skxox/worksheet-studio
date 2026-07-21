import type { Margin, MarginPx, PaperSettings, PaperSize } from '@/types';

const MM_TO_PX = 3.7795275591; // 1mm = 3.78px @ 96 DPI

export const PAPER_SIZES: PaperSize[] = [
  { name: 'A4', width: 210, height: 297 },
  { name: 'A3', width: 297, height: 420 },
  { name: 'A5', width: 148, height: 210 },
  { name: 'B5', width: 176, height: 250 },
  { name: 'Letter', width: 216, height: 279 },
  { name: '16K', width: 195, height: 270 },
  { name: '32K', width: 130, height: 185 },
];

export const PAPER_THEMES: Record<
  NonNullable<PaperSettings['theme']>,
  { bg: string; line: string }
> = {
  default: { bg: '#ffffff', line: '#d1d5db' },
  warm: { bg: '#fef9f3', line: '#e8d5c4' },
  cool: { bg: '#f0f9ff', line: '#bae6fd' },
};

export function mmToPx(mm: number): number {
  return mm * MM_TO_PX;
}

export function toMarginPx(margin: Margin): MarginPx {
  return {
    top: mmToPx(margin.top),
    right: mmToPx(margin.right),
    bottom: mmToPx(margin.bottom),
    left: mmToPx(margin.left),
  };
}

export function getCanvasSize(
  paperSize: PaperSize,
  dpi: number = 96
): { width: number; height: number } {
  const ratio = dpi / 96;
  return {
    width: Math.round(mmToPx(paperSize.width) * ratio),
    height: Math.round(mmToPx(paperSize.height) * ratio),
  };
}

function getLineDash(style: string, width: number): number[] {
  switch (style) {
    case 'dashed':
      return [width * 4, width * 2];
    case 'dotted':
      return [width, width * 2];
    default:
      return [];
  }
}

function applyLineStyle(ctx: CanvasRenderingContext2D, settings: PaperSettings) {
  ctx.strokeStyle = settings.lineColor;
  ctx.lineWidth = settings.lineWidth;
  ctx.setLineDash(getLineDash(settings.lineStyle, settings.lineWidth));
}

/** 绘制纸张背景（背景色） */
export function drawPaperBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings
): void {
  ctx.fillStyle = settings.bgColor;
  ctx.fillRect(0, 0, width, height);
}

/** 背景纹理叠加（保持淡，不影响打印书写） */
function drawTexture(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings
): void {
  if (settings.texture === 'none') return;
  ctx.save();
  if (settings.texture === 'parchment') {
    ctx.fillStyle = 'rgba(150, 120, 60, 0.05)';
    ctx.fillRect(0, 0, width, height);
    ctx.fillStyle = 'rgba(120, 90, 40, 0.06)';
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * width, Math.random() * height, 20 + Math.random() * 70, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // fiber：细短纤维纹
    ctx.strokeStyle = 'rgba(120, 110, 90, 0.05)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < 220; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const len = 6 + Math.random() * 16;
      const a = Math.random() * Math.PI;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(a) * len, y + Math.sin(a) * len);
      ctx.stroke();
    }
  }
  ctx.restore();
}

/** 水印：居中、倾斜、半透明，自动缩放适应宽度 */
function drawWatermark(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  text: string,
  color: string
): void {
  if (!text) return;
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(-Math.PI / 6);
  let fs = Math.min(width, height) * 0.2;
  ctx.font = `bold ${fs}px sans-serif`;
  while (ctx.measureText(text).width > width * 0.85 && fs > 12) {
    fs -= 2;
    ctx.font = `bold ${fs}px sans-serif`;
  }
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.12;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 0);
  ctx.restore();
}

/** 页码：底部居中 "i / N" */
function drawPageNumber(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  pageIndex: number,
  pageCount: number
): void {
  ctx.save();
  ctx.fillStyle = '#9ca3af';
  ctx.font = `${mmToPx(3.5)}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${pageIndex} / ${pageCount}`, width / 2, height - mmToPx(6));
  ctx.restore();
}

/** 方格纸 */
export function drawGridPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings
): void {
  const gridPx = mmToPx(settings.gridSize);
  const m = toMarginPx(settings.margin);
  applyLineStyle(ctx, settings);

  const startX = m.left;
  const endX = width - m.right;
  for (let y = m.top; y <= height - m.bottom + 0.5; y += gridPx) {
    ctx.beginPath();
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
    ctx.stroke();
  }
  for (let x = m.left; x <= width - m.right + 0.5; x += gridPx) {
    ctx.beginPath();
    ctx.moveTo(x, m.top);
    ctx.lineTo(x, height - m.bottom);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/** 横线纸 */
export function drawLinePaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings
): void {
  const linePx = mmToPx(settings.gridSize);
  const m = toMarginPx(settings.margin);
  applyLineStyle(ctx, settings);

  for (let y = m.top; y <= height - m.bottom + 0.5; y += linePx) {
    ctx.beginPath();
    ctx.moveTo(m.left, y);
    ctx.lineTo(width - m.right, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/** 点阵纸 */
export function drawDotPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings
): void {
  const gridPx = mmToPx(settings.gridSize);
  const m = toMarginPx(settings.margin);
  const radius = Math.max(0.6, settings.lineWidth * 1.5);

  ctx.fillStyle = settings.lineColor;
  for (let x = m.left; x <= width - m.right + 0.5; x += gridPx) {
    for (let y = m.top; y <= height - m.bottom + 0.5; y += gridPx) {
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/** 康奈尔笔记纸 */
export function drawCornellPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings
): void {
  const m = toMarginPx(settings.margin);
  const contentWidth = width - m.left - m.right;
  const cueWidth = contentWidth * 0.3;
  const summaryHeight = mmToPx(35);

  applyLineStyle(ctx, settings);

  // 提示栏竖线
  ctx.beginPath();
  ctx.moveTo(m.left + cueWidth, m.top);
  ctx.lineTo(m.left + cueWidth, height - m.bottom - summaryHeight);
  ctx.stroke();

  // 总结区横线
  ctx.beginPath();
  ctx.moveTo(m.left, height - m.bottom - summaryHeight);
  ctx.lineTo(width - m.right, height - m.bottom - summaryHeight);
  ctx.stroke();

  // 笔记区横线
  const linePx = mmToPx(8);
  ctx.setLineDash(getLineDash(settings.lineStyle, settings.lineWidth));
  for (let y = m.top + linePx; y <= height - m.bottom - summaryHeight; y += linePx) {
    ctx.beginPath();
    ctx.moveTo(m.left + cueWidth + 8, y);
    ctx.lineTo(width - m.right, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);
}

/** 五线谱纸 */
export function drawStaffPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings
): void {
  const m = toMarginPx(settings.margin);
  const lineGap = Math.max(3, settings.lineWidth * 4); // 线间距
  const groupHeight = lineGap * 4; // 5 线 4 间距
  const groupGap = lineGap * 3; // 组间留白

  applyLineStyle(ctx, settings);
  let yStart = m.top;
  while (yStart + groupHeight <= height - m.bottom + 0.5) {
    for (let i = 0; i < 5; i++) {
      const y = yStart + i * lineGap;
      ctx.beginPath();
      ctx.moveTo(m.left, y);
      ctx.lineTo(width - m.right, y);
      ctx.stroke();
    }
    yStart += groupHeight + groupGap;
  }
  ctx.setLineDash([]);
}

/** 拼音格（四线三格）：每 4 线一组，1/3 位实线、中间两条虚线 */
export function drawPinyinPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings
): void {
  const m = toMarginPx(settings.margin);
  const lineGap = Math.max(3, settings.lineWidth * 5);
  const unit = lineGap * 3;
  const groupGap = lineGap * 2;

  ctx.lineWidth = Math.max(0.6, settings.lineWidth);
  let y = m.top;
  while (y + unit <= height - m.bottom + 0.5) {
    for (let i = 0; i < 4; i++) {
      const ly = y + i * lineGap;
      const dashed = i === 1 || i === 2;
      ctx.setLineDash(dashed ? [4, 3] : []);
      ctx.strokeStyle = settings.lineColor;
      ctx.beginPath();
      ctx.moveTo(m.left, ly);
      ctx.lineTo(width - m.right, ly);
      ctx.stroke();
    }
    y += unit + groupGap;
  }
  ctx.setLineDash([]);
}

/** 作文格：方格 + 红色外框 */
export function drawEssayPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings
): void {
  const m = toMarginPx(settings.margin);
  drawGridPaper(ctx, width, height, settings);
  ctx.save();
  ctx.strokeStyle = '#d64545';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(m.left, m.top, width - m.left - m.right, height - m.top - m.bottom);
  ctx.restore();
}

// ============ 单元格格子绘制（字帖 / 田字格纸共用） ============

/** 辅助引导线（十字 / 对角 / 内框 / 3×3 等虚线）线宽。
 *  外框 / 圆框保持 1px；虚线引导线更细，拉开主次层次，并避免 HiDPI(2x) 下
 *  逻辑 1px 被渲染成 2 个设备像素而显得过粗（用户反馈米字格偏闷）。 */
const GUIDE_LINE_WIDTH = 0.5;

/** 虚线引导线的 [短划, 间隙]。比旧的 [4,3]/[3,2] 更细碎，接近主流字帖的细虚线观感。 */
const GUIDE_DASH: number[] = [2, 2];

/** 画一条经过中心 (cx,cy) 的虚线：拆成「中心→端点1」「中心→端点2」两段分别描边，
 *  使中心交界恒落在短划起点（而非间隙），避免田字/米字等中心交汇处被虚线间隙截断。
 *  调用前需已 setLineDash / lineWidth。 */
function strokeDashedThroughCenter(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): void {
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x1, y1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

/** 田字格：外框 + 十字虚线 */
export function drawTianGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = '#d1d5db'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);

  ctx.lineWidth = GUIDE_LINE_WIDTH;
  ctx.setLineDash(GUIDE_DASH);
  const cx = x + size / 2;
  const cy = y + size / 2;
  strokeDashedThroughCenter(ctx, cx, cy, cx, y, cx, y + size);
  strokeDashedThroughCenter(ctx, cx, cy, x, cy, x + size, cy);
  ctx.setLineDash([]);
  ctx.restore();
}

/** 米字格：田字格 + 两条对角虚线 */
export function drawMiGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = '#d1d5db'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);

  ctx.lineWidth = GUIDE_LINE_WIDTH;
  ctx.setLineDash(GUIDE_DASH);
  const cx = x + size / 2;
  const cy = y + size / 2;
  // 十字
  strokeDashedThroughCenter(ctx, cx, cy, cx, y, cx, y + size);
  strokeDashedThroughCenter(ctx, cx, cy, x, cy, x + size, cy);
  // 对角线
  strokeDashedThroughCenter(ctx, cx, cy, x, y, x + size, y + size);
  strokeDashedThroughCenter(ctx, cx, cy, x + size, y, x, y + size);
  ctx.setLineDash([]);
  ctx.restore();
}

/** 回宫格：外框 + 内框 + 中线（用于结构练习） */
export function drawHuigongGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = '#d1d5db'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);

  ctx.lineWidth = GUIDE_LINE_WIDTH;
  const inset = size * 0.12;
  ctx.setLineDash(GUIDE_DASH);
  ctx.strokeRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
  const cx = x + size / 2;
  const cy = y + size / 2;
  strokeDashedThroughCenter(ctx, cx, cy, cx, y + inset, cx, y + size - inset);
  strokeDashedThroughCenter(ctx, cx, cy, x + inset, cy, x + size - inset, cy);
  ctx.setLineDash([]);
  ctx.restore();
}

/** 方格（单格外框） */
export function drawFangGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = '#d1d5db'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);
  ctx.restore();
}

/** 九宫格：外框 + 内部 3×3 虚线 */
export function drawJiugongGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = '#d1d5db'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);
  ctx.lineWidth = GUIDE_LINE_WIDTH;
  ctx.setLineDash(GUIDE_DASH);
  ctx.beginPath();
  for (let i = 1; i < 3; i++) {
    ctx.moveTo(x + (i * size) / 3, y);
    ctx.lineTo(x + (i * size) / 3, y + size);
    ctx.moveTo(x, y + (i * size) / 3);
    ctx.lineTo(x + size, y + (i * size) / 3);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/** 作文格（稿纸格）：纯方格，无内部辅助线，用于作文 / 自由书写练习 */
export function drawEssayGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = '#d1d5db'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);
  ctx.restore();
}

/** 回宫内框（回田 / 回米 / 回九 共用）：外框（1px 实线）+ 内缩虚线框（细虚线） */
function strokeHuigongFrame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string,
  inset: number
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);
  ctx.lineWidth = GUIDE_LINE_WIDTH;
  ctx.setLineDash(GUIDE_DASH);
  ctx.strokeRect(x + inset, y + inset, size - inset * 2, size - inset * 2);
}

/** 回田格：回宫内框 + 田字十字（满格虚线十字） */
export function drawHuitianGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = '#d1d5db'
): void {
  ctx.save();
  const inset = size * 0.12;
  strokeHuigongFrame(ctx, x, y, size, color, inset);
  ctx.lineWidth = GUIDE_LINE_WIDTH;
  const cx = x + size / 2;
  const cy = y + size / 2;
  strokeDashedThroughCenter(ctx, cx, cy, cx, y, cx, y + size);
  strokeDashedThroughCenter(ctx, cx, cy, x, cy, x + size, cy);
  ctx.setLineDash([]);
  ctx.restore();
}

/** 回米格：回宫内框 + 米字（满格虚线十字 + 对角线） */
export function drawHuimiGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = '#d1d5db'
): void {
  ctx.save();
  const inset = size * 0.12;
  strokeHuigongFrame(ctx, x, y, size, color, inset);
  ctx.lineWidth = GUIDE_LINE_WIDTH;
  const cx = x + size / 2;
  const cy = y + size / 2;
  // 十字
  strokeDashedThroughCenter(ctx, cx, cy, cx, y, cx, y + size);
  strokeDashedThroughCenter(ctx, cx, cy, x, cy, x + size, cy);
  // 对角线
  strokeDashedThroughCenter(ctx, cx, cy, x, y, x + size, y + size);
  strokeDashedThroughCenter(ctx, cx, cy, x + size, y, x, y + size);
  ctx.setLineDash([]);
  ctx.restore();
}

/** 回九格：回宫内框 + 九宫 3×3（满格虚线） */
export function drawHuijiuGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = '#d1d5db'
): void {
  ctx.save();
  const inset = size * 0.12;
  strokeHuigongFrame(ctx, x, y, size, color, inset);
  ctx.lineWidth = GUIDE_LINE_WIDTH;
  ctx.beginPath();
  for (let i = 1; i < 3; i++) {
    ctx.moveTo(x + (i * size) / 3, y);
    ctx.lineTo(x + (i * size) / 3, y + size);
    ctx.moveTo(x, y + (i * size) / 3);
    ctx.lineTo(x + size, y + (i * size) / 3);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();
}

/** 圆米格：外接方框 + 内切圆 + 米字（十字 + 对角虚线），书法结构练习常用 */
export function drawYuanmiGrid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string = '#d1d5db'
): void {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.strokeRect(x, y, size, size);
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = GUIDE_LINE_WIDTH;
  ctx.setLineDash(GUIDE_DASH);
  const cx = x + size / 2;
  const cy = y + size / 2;
  // 十字
  strokeDashedThroughCenter(ctx, cx, cy, cx, y, cx, y + size);
  strokeDashedThroughCenter(ctx, cx, cy, x, cy, x + size, cy);
  // 对角线
  strokeDashedThroughCenter(ctx, cx, cy, x, y, x + size, y + size);
  strokeDashedThroughCenter(ctx, cx, cy, x + size, y, x, y + size);
  ctx.setLineDash([]);
  ctx.restore();
}

/** 按格子大小铺满整页的田字格 / 米字格 / 回宫格 / 方格纸 */
export function drawCellGridPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings,
  cell:
    | 'tian'
    | 'mi'
    | 'huigong'
    | 'fang'
): void {
  const gridPx = mmToPx(settings.gridSize);
  const m = toMarginPx(settings.margin);
  const color = settings.lineColor;

  for (let y = m.top; y + gridPx <= height - m.bottom + 0.5; y += gridPx) {
    for (let x = m.left; x + gridPx <= width - m.right + 0.5; x += gridPx) {
      if (cell === 'tian') drawTianGrid(ctx, x, y, gridPx, color);
      else if (cell === 'mi') drawMiGrid(ctx, x, y, gridPx, color);
      else if (cell === 'huigong') drawHuigongGrid(ctx, x, y, gridPx, color);
      else drawFangGrid(ctx, x, y, gridPx, color);
    }
  }
}

/** 纸张工厂总调度（pageIndex/pageCount 用于多页与页码） */
export function drawPaper(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: PaperSettings,
  pageIndex: number = 1,
  pageCount: number = 1
): void {
  drawPaperBackground(ctx, width, height, settings);
  drawTexture(ctx, width, height, settings);

  switch (settings.type) {
    case 'grid':
      drawGridPaper(ctx, width, height, settings);
      break;
    case 'line':
      drawLinePaper(ctx, width, height, settings);
      break;
    case 'dot':
      drawDotPaper(ctx, width, height, settings);
      break;
    case 'cornell':
      drawCornellPaper(ctx, width, height, settings);
      break;
    case 'staff':
      drawStaffPaper(ctx, width, height, settings);
      break;
    case 'tian':
      drawCellGridPaper(ctx, width, height, settings, 'tian');
      break;
    case 'mi':
      drawCellGridPaper(ctx, width, height, settings, 'mi');
      break;
    case 'huigong':
      drawCellGridPaper(ctx, width, height, settings, 'huigong');
      break;
    case 'pinyin':
      drawPinyinPaper(ctx, width, height, settings);
      break;
    case 'essay':
      drawEssayPaper(ctx, width, height, settings);
      break;
  }

  drawWatermark(ctx, width, height, settings.watermark, settings.watermarkColor);
  if (settings.showPageNumber) drawPageNumber(ctx, width, height, pageIndex, pageCount);
}
