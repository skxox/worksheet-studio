import { pinyin } from "pinyin-pro";

const HAN_RE = /[一-鿿]/;

/** 是否为中日韩统一表意文字（汉字） */
export function isHan(ch: string): boolean {
  return !!ch && HAN_RE.test(ch);
}

/**
 * 取单个汉字带声调的默认拼音（如 "永" → "yǒng"）。多音字取 pinyin-pro 的默认读音；非汉字返回空串。
 */
export function charToPinyin(char: string): string {
  if (!char || !isHan(char)) return "";
  const arr = pinyin(char, { toneType: "symbol", type: "array" });
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : "";
}

/** 取一段文本逐字拼音数组（非汉字位置为空串），与原文字符一一对应 */
export function stringToPinyin(text: string): string[] {
  return Array.from(text).map((ch) => charToPinyin(ch));
}

const ALL_CACHE = new Map<string, string[]>();

/**
 * 取单个汉字的所有读音（带声调），如 "行" → ["xíng","háng","hàng","héng"]。
 * 非多音字返回单元素数组，非汉字返回空数组。第 0 项为默认读音，与 charToPinyin 一致。
 * 用于多音字切换。结果按字缓存。
 */
export function charAllPinyins(char: string): string[] {
  if (!char || !isHan(char)) return [];
  const cached = ALL_CACHE.get(char);
  if (cached) return cached;
  const arr = pinyin(char, {
    toneType: "symbol",
    type: "array",
    multiple: true,
  });
  const out: string[] = [];
  if (Array.isArray(arr)) {
    const seen = new Set<string>();
    for (const p of arr) {
      if (p && !seen.has(p)) {
        seen.add(p);
        out.push(p);
      }
    }
  }
  ALL_CACHE.set(char, out);
  return out;
}
