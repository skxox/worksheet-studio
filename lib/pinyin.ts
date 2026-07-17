import { pinyin } from 'pinyin-pro';

const HAN_RE = /[一-鿿]/;

/** 是否为中日韩统一表意文字（汉字） */
export function isHan(ch: string): boolean {
  return !!ch && HAN_RE.test(ch);
}

/**
 * 取单个汉字的无声调拼音（如 "永" → "yong"）。
 * 多音字取 pinyin-pro 的默认读音；非汉字返回空串。
 */
export function charToPinyin(char: string): string {
  if (!char || !isHan(char)) return '';
  const arr = pinyin(char, { toneType: 'none', type: 'array' });
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : '';
}

/** 取一段文本逐字拼音数组（非汉字位置为空串），与原文字符一一对应 */
export function stringToPinyin(text: string): string[] {
  return Array.from(text).map((ch) => charToPinyin(ch));
}
