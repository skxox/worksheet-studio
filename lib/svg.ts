import type { PaperSettings } from '@/types';
import { mmToPx, toMarginPx, getCanvasSize } from '@/lib/paper';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function line(x1: number, y1: number, x2: number, y2: number, stroke: string, width: number, dash: string): string {
  return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${esc(stroke)}" stroke-width="${width}" stroke-dasharray="${dash}" />`;
}

function dashArray(style: string, width: number): string {
  switch (style) {
    case 'dashed':
      return `${width * 4},${width * 2}`;
    case 'dotted':
      return `${width},${width * 2}`;
    default:
      return '';
  }
}

function cellGrid(
  settings: PaperSettings,
  width: number,
  height: number,
  cell: 'tian' | 'mi' | 'huigong' | 'fang'
): string {
  const gridPx = mmToPx(settings.gridSize);
  const m = toMarginPx(settings.margin);
  const color = settings.lineColor;
  const parts: string[] = [];

  for (let y = m.top; y + gridPx <= height - m.bottom + 0.5; y += gridPx) {
    for (let x = m.left; x + gridPx <= width - m.right + 0.5; x += gridPx) {
      // 外框
      parts.push(
        `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${gridPx.toFixed(1)}" height="${gridPx.toFixed(1)}" fill="none" stroke="${esc(color)}" stroke-width="1" />`
      );
      const midX = x + gridPx / 2;
      const midY = y + gridPx / 2;
      const dash = '4,3';
      if (cell === 'tian' || cell === 'mi') {
        parts.push(line(midX, y, midX, y + gridPx, color, 1, dash));
        parts.push(line(x, midY, x + gridPx, midY, color, 1, dash));
      }
      if (cell === 'mi') {
        parts.push(line(x, y, x + gridPx, y + gridPx, color, 1, dash));
        parts.push(line(x + gridPx, y, x, y + gridPx, color, 1, dash));
      }
      if (cell === 'huigong') {
        const inset = gridPx * 0.12;
        parts.push(
          `<rect x="${(x + inset).toFixed(1)}" y="${(y + inset).toFixed(1)}" width="${(gridPx - inset * 2).toFixed(1)}" height="${(gridPx - inset * 2).toFixed(1)}" fill="none" stroke="${esc(color)}" stroke-width="1" stroke-dasharray="3,2" />`
        );
      }
    }
  }
  return parts.join('');
}

/** 把 PaperSettings 渲染为可独立打开的 SVG 字符串 */
export function paperToSvg(settings: PaperSettings): string {
  const { width, height } = getCanvasSize(settings.size);
  const dash = dashArray(settings.lineStyle, settings.lineWidth);
  const m = toMarginPx(settings.margin);
  const parts: string[] = [];

  const gridPx = mmToPx(settings.gridSize);

  switch (settings.type) {
    case 'grid':
      for (let y = m.top; y <= height - m.bottom + 0.5; y += gridPx) {
        parts.push(line(m.left, y, width - m.right, y, settings.lineColor, settings.lineWidth, dash));
      }
      for (let x = m.left; x <= width - m.right + 0.5; x += gridPx) {
        parts.push(line(x, m.top, x, height - m.bottom, settings.lineColor, settings.lineWidth, dash));
      }
      break;
    case 'line':
      for (let y = m.top; y <= height - m.bottom + 0.5; y += gridPx) {
        parts.push(line(m.left, y, width - m.right, y, settings.lineColor, settings.lineWidth, dash));
      }
      break;
    case 'dot': {
      const r = Math.max(0.6, settings.lineWidth * 1.5);
      for (let x = m.left; x <= width - m.right + 0.5; x += gridPx) {
        for (let y = m.top; y <= height - m.bottom + 0.5; y += gridPx) {
          parts.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${esc(settings.lineColor)}" />`);
        }
      }
      break;
    }
    case 'cornell': {
      const contentWidth = width - m.left - m.right;
      const cueWidth = contentWidth * 0.3;
      const summaryHeight = mmToPx(35);
      parts.push(line(m.left + cueWidth, m.top, m.left + cueWidth, height - m.bottom - summaryHeight, settings.lineColor, settings.lineWidth, dash));
      parts.push(line(m.left, height - m.bottom - summaryHeight, width - m.right, height - m.bottom - summaryHeight, settings.lineColor, settings.lineWidth, dash));
      const lh = mmToPx(8);
      for (let y = m.top + lh; y <= height - m.bottom - summaryHeight; y += lh) {
        parts.push(line(m.left + cueWidth + 8, y, width - m.right, y, settings.lineColor, settings.lineWidth, dash));
      }
      break;
    }
    case 'staff': {
      const lineGap = Math.max(3, settings.lineWidth * 4);
      const groupHeight = lineGap * 4;
      const groupGap = lineGap * 3;
      let yStart = m.top;
      while (yStart + groupHeight <= height - m.bottom + 0.5) {
        for (let i = 0; i < 5; i++) {
          parts.push(line(m.left, yStart + i * lineGap, width - m.right, yStart + i * lineGap, settings.lineColor, settings.lineWidth, ''));
        }
        yStart += groupHeight + groupGap;
      }
      break;
    }
    case 'tian':
    case 'mi':
    case 'huigong':
      parts.push(cellGrid(settings, width, height, settings.type));
      break;
  }

  const wm = settings.watermark
    ? `<text x="${width / 2}" y="${height / 2}" fill="${esc(settings.watermarkColor)}" fill-opacity="0.12" font-size="${Math.min(width, height) * 0.2}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" transform="rotate(-30 ${width / 2} ${height / 2})">${esc(settings.watermark)}</text>`
    : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${esc(settings.bgColor)}" />${parts.join('')}${wm}</svg>`;
}
