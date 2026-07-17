import type { HandwritingSettings, MarginPx } from '@/types';
import { fontStack } from '@/lib/fonts';
import { mmToPx, toMarginPx } from '@/lib/paper';
import { seededRandom } from '@/lib/utils';

/** #RRGGBB → rgba()，失败时回退原值 */
function hexToRgba(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const PAPER_BG: Record<HandwritingSettings['paperBackground'], string> = {
  white: '#ffffff',
  lined: '#fbfbf8',
  grid: '#fbfbf8',
  dot: '#fcfbf7',
  yellow: '#fdf6e8',
  aged: '#f1e9d6',
};

/** 按宽度软换行，尊重 \n */
function wrapLines(ctx: CanvasRenderingContext2D, content: string, maxWidth: number): string[] {
  const result: string[] = [];
  for (const para of content.split('\n')) {
    const chars = Array.from(para);
    let cur = '';
    for (const ch of chars) {
      const test = cur + ch;
      if (ctx.measureText(test).width > maxWidth && cur.length > 0) {
        result.push(cur);
        cur = ch;
      } else {
        cur = test;
      }
    }
    result.push(cur);
  }
  return result;
}

/** 按固定每行字数换行，尊重 \n */
function wrapByCols(content: string, cols: number): string[] {
  const result: string[] = [];
  for (const para of content.split('\n')) {
    const chars = Array.from(para);
    if (chars.length === 0) {
      result.push('');
      continue;
    }
    for (let i = 0; i < chars.length; i += cols) {
      result.push(chars.slice(i, i + cols).join(''));
    }
  }
  return result;
}

/** 绘制纸张背景：底色 + 横线/做旧纹理 */
function drawHandwritingBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: HandwritingSettings,
  m: MarginPx,
  rng: () => number
): void {
  ctx.fillStyle = PAPER_BG[settings.paperBackground];
  ctx.fillRect(0, 0, width, height);

  // 横线稿纸：基线 + 左侧红色装订线（更接近真实信纸/稿纸）
  if (settings.paperBackground === 'lined') {
    ctx.strokeStyle = '#e2dfd6';
    ctx.lineWidth = 0.8;
    const step = settings.lineSpacing;
    for (let y = m.top + settings.fontSize; y <= height - m.bottom; y += step) {
      ctx.beginPath();
      ctx.moveTo(m.left, y);
      ctx.lineTo(width - m.right, y);
      ctx.stroke();
    }
    // 红色装订线
    ctx.strokeStyle = '#e7b3b3';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(m.left, m.top);
    ctx.lineTo(m.left, height - m.bottom);
    ctx.stroke();
  }

  // 方格 / 点阵 背景
  if (settings.paperBackground === 'grid' || settings.paperBackground === 'dot') {
    const step = mmToPx(5);
    if (settings.paperBackground === 'grid') {
      ctx.strokeStyle = '#e6e2d8';
      ctx.lineWidth = 0.5;
      for (let y = m.top; y <= height - m.bottom + 0.5; y += step) {
        ctx.beginPath();
        ctx.moveTo(m.left, y);
        ctx.lineTo(width - m.right, y);
        ctx.stroke();
      }
      for (let x = m.left; x <= width - m.right + 0.5; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, m.top);
        ctx.lineTo(x, height - m.bottom);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#cbc4b3';
      for (let x = m.left; x <= width - m.right + 0.5; x += step) {
        for (let y = m.top; y <= height - m.bottom + 0.5; y += step) {
          ctx.beginPath();
          ctx.arc(x, y, 0.9, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // 米黄 / 做旧：淡淡的纤维纹理 + 偶发污渍，避免纯色塑料感
  if (settings.paperBackground === 'yellow' || settings.paperBackground === 'aged') {
    const isAged = settings.paperBackground === 'aged';
    ctx.fillStyle = isAged ? 'rgba(120, 92, 50, 0.05)' : 'rgba(150, 130, 80, 0.03)';
    const count = Math.floor((width * height) / 900);
    for (let i = 0; i < count; i++) {
      ctx.fillRect(rng() * width, rng() * height, 1.4, 1.4);
    }
    if (isAged) {
      // 几处淡褐色污渍
      ctx.fillStyle = 'rgba(120, 90, 45, 0.06)';
      for (let i = 0; i < 6; i++) {
        const cx = rng() * width;
        const cy = rng() * height;
        const r = 20 + rng() * 60;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * 手写模拟主绘制：seeded 随机 → 全局笔锋倾斜 + 每字位置/旋转/缩放/墨色抖动 + 涂改。
 * 相同 seed + 相同 settings 结果一致；点"重新生成"换 seed。
 * 幅度参数对标凹凸工坊推荐值（位置 10 / 笔画 5 / 涂改 3 即很自然）。
 */
export function drawHandwriting(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  settings: HandwritingSettings,
  seed: number
): void {
  const rng = seededRandom(seed);
  const m = toMarginPx(settings.margin);
  drawHandwritingBackground(ctx, width, height, settings, m, rng);

  const contentWidth = width - m.left - m.right;
  const contentHeight = height - m.top - m.bottom;
  const lineHeight = settings.lineSpacing;

  ctx.font = `${settings.fontSize}px ${fontStack(settings.fontFamily)}`;
  const lines =
    settings.cols > 0
      ? wrapByCols(settings.content, settings.cols)
      : wrapLines(ctx, settings.content, contentWidth);

  // 全局笔锋倾斜（同一人书写方向一致），±4° 左右
  const baseSlant = (rng() - 0.5) * 0.14;

  const pChaos = settings.positionChaos / 100;
  const sChaos = settings.strokeChaos / 100;
  const dLevel = settings.distortionLevel / 100;
  const scribble = settings.scribbleRate / 100;
  const baseSpacing = settings.fontSize * 0.02 + settings.letterSpacing;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  let baselineY = m.top + settings.fontSize;
  for (const line of lines) {
    if (baselineY - settings.fontSize > m.top + contentHeight) break;
    // 每行基线轻微起伏，模拟书写时手的上下漂移
    const lineDrift = (rng() - 0.5) * pChaos * settings.fontSize * 0.5;
    // 行首轻微缩进/错位
    let x = m.left + (rng() - 0.5) * pChaos * settings.fontSize * 0.4;

    for (const ch of Array.from(line)) {
      if (ch === ' ' || ch === '\t') {
        x += ctx.measureText(ch).width + baseSpacing;
        continue;
      }
      const cw = ctx.measureText(ch).width;
      const centerX = x + cw / 2;

      const dx = (rng() - 0.5) * pChaos * settings.fontSize * 0.5;
      const dy = (rng() - 0.5) * pChaos * settings.fontSize * 0.3;
      const rot = baseSlant + (rng() - 0.5) * sChaos * 0.3;
      const sc = 1 + (rng() - 0.5) * dLevel * 0.18;
      // 墨色浓淡 + 笔画粗细微变（x 方向轻微缩放模拟提按）
      const alpha = 0.7 + rng() * 0.3;
      const widthJitter = 1 + (rng() - 0.5) * dLevel * 0.12;

      ctx.save();
      ctx.translate(centerX + dx, baselineY + dy + lineDrift);
      ctx.rotate(rot);
      ctx.scale(sc * widthJitter, sc);

      // 涂改：先划掉再重写
      if (rng() < scribble) {
        ctx.strokeStyle = hexToRgba(settings.inkColor, alpha * 0.75);
        ctx.lineWidth = settings.fontSize * 0.07;
        ctx.beginPath();
        ctx.moveTo(-cw * 0.6, -settings.fontSize * 0.05);
        ctx.lineTo(cw * 0.6, settings.fontSize * 0.1);
        ctx.moveTo(-cw * 0.55, settings.fontSize * 0.06);
        ctx.lineTo(cw * 0.55, -settings.fontSize * 0.09);
        ctx.stroke();
      }

      ctx.fillStyle = hexToRgba(settings.inkColor, alpha);
      ctx.fillText(ch, 0, 0);
      ctx.restore();

      x += cw + baseSpacing + (rng() - 0.5) * pChaos * settings.fontSize * 0.2;
    }
    baselineY += lineHeight;
  }
}
