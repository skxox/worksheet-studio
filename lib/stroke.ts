/**
 * 汉字笔顺数据：取自 hanzi-writer-data（Make Me a Hanzi），每字 {strokes:[SVGpath...], medians:[[[x,y]...],...]}，坐标系 1024×1024。
 * 按字懒加载（jsDelivr CDN），内存缓存；失败/字符集外回退 null（调用方回退字体直绘）。
 * 注：npmmirror 文件端点不允许该包，故用 jsDelivr；中国网络首取略慢，缓存后仅一次。
 */

import type { CopybookSettings } from '@/types';

export interface CharStrokeData {
  strokes: string[];
  medians: number[][][];
}

const VERSION = '2.0.1';
const BASE = `https://cdn.jsdelivr.net/npm/hanzi-writer-data@${VERSION}`;
const REF_SIZE = 1024;

const CACHE = new Map<string, CharStrokeData | null>();

export async function fetchStroke(char: string): Promise<CharStrokeData | null> {
  if (CACHE.has(char)) return CACHE.get(char)!;
  try {
    const res = await fetch(`${BASE}/${encodeURIComponent(char)}.json`);
    if (!res.ok) {
      CACHE.set(char, null);
      return null;
    }
    const data = (await res.json()) as CharStrokeData;
    if (!data || !Array.isArray(data.strokes) || data.strokes.length === 0) {
      CACHE.set(char, null);
      return null;
    }
    CACHE.set(char, data);
    return data;
  } catch {
    CACHE.set(char, null);
    return null;
  }
}

/** 预取文本中所有汉字的笔顺数据（并行），完成后 resolve */
export async function prefetchStrokes(text: string): Promise<void> {
  const chars = Array.from(new Set(Array.from(text)));
  await Promise.all(chars.map(fetchStroke));
}

export function strokeCached(char: string): boolean {
  return CACHE.has(char);
}

/** 同步读取已缓存的笔顺数据（未命中返回 null） */
export function peekStroke(char: string): CharStrokeData | null {
  return CACHE.get(char) ?? null;
}

interface DrawStrokeOpts {
  color: string;
  /** 只画前 upTo 笔（默认全部），用于"逐笔累进" */
  upTo?: number;
  /** 最后一笔（即第 upTo 笔，当前正在写的那一笔）用该色高亮；不传则与 color 一致 */
  lastStrokeColor?: string;
  /** 在第 orderNumber 笔的起点标序号（1-based）；不传则不标 */
  orderNumber?: number;
  orderColor?: string;
}

/**
 * 用笔顺路径绘制单个汉字（已缓存则用数据，否则返回 false 让调用方回退字体）。
 * 在 (x,y) 起、大小 size 的方框内绘制，自带 ~8% 内边距居中、Y 轴翻转（数据为 Y-up）。
 */
export function drawCharStrokes(
  ctx: CanvasRenderingContext2D,
  char: string,
  x: number,
  y: number,
  size: number,
  opts: DrawStrokeOpts
): boolean {
  const data = CACHE.get(char);
  if (!data) return false;

  // Make Me a Hanzi 数据为 Y 轴朝上，自然包围盒 X∈[0,1024]、Y∈[-124,900]。
  const pad = 0.04;
  const drawSize = size * (1 - pad * 2);
  const sc = drawSize / REF_SIZE;
  const off = size * pad;
  const yTop = 900;
  const upto = Math.min(opts.upTo ?? data.strokes.length, data.strokes.length);

  ctx.save();
  ctx.translate(x + off, y + off + yTop * sc);
  ctx.scale(sc, -sc);
  for (let i = 0; i < upto; i++) {
    // 最后一笔（当前笔画）单独高亮
    ctx.fillStyle =
      i === upto - 1 && opts.lastStrokeColor ? opts.lastStrokeColor : opts.color;
    ctx.fill(new Path2D(data.strokes[i]));
  }
  ctx.restore();

  // 笔顺序号：在第 orderNumber 笔的起点（画布坐标系，避免被翻转）
  if (opts.orderNumber) {
    const idx = opts.orderNumber - 1;
    const m = data.medians[idx];
    if (m && m[0]) {
      ctx.save();
      ctx.fillStyle = opts.orderColor ?? '#d33b3b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `bold ${Math.max(10, size * 0.2)}px sans-serif`;
      const mx = x + off + m[0][0] * sc;
      const my = y + off + (yTop - m[0][1]) * sc;
      ctx.fillText(String(opts.orderNumber), mx, my);
      ctx.restore();
    }
  }
  return true;
}

/** 当前字色（solid→color, miao→miaoColor, hollow→color） */
export function resolveStrokeColor(settings: CopybookSettings): string {
  return settings.renderMode === 'miao' ? settings.miaoColor : settings.color;
}
