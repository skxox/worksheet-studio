import { describe, it, expect } from "vitest";
import {
  isHan,
  charToPinyin,
  stringToPinyin,
  charAllPinyins,
} from "@/lib/pinyin";

describe("isHan", () => {
  it("recognises CJK ideographs", () => {
    expect(isHan("永")).toBe(true);
    expect(isHan("字")).toBe(true);
  });
  it("rejects ASCII and punctuation", () => {
    expect(isHan("a")).toBe(false);
    expect(isHan("A")).toBe(false);
    expect(isHan("1")).toBe(false);
    expect(isHan("，")).toBe(false);
    expect(isHan(" ")).toBe(false);
  });
  it("rejects empty input", () => {
    expect(isHan("")).toBe(false);
  });
});

describe("charToPinyin", () => {
  it("returns the default toned reading for a Han char", () => {
    expect(charToPinyin("永")).toBe("yǒng");
  });
  it("returns empty string for non-Han", () => {
    expect(charToPinyin("a")).toBe("");
    expect(charToPinyin("")).toBe("");
    expect(charToPinyin("，")).toBe("");
  });
});

describe("stringToPinyin", () => {
  it("returns one entry per character, aligned with the source", () => {
    const text = "永字";
    const out = stringToPinyin(text);
    expect(out).toHaveLength(Array.from(text).length);
    expect(out[0]).toBe(charToPinyin("永"));
  });
  it("puts empty string at non-Han positions", () => {
    const out = stringToPinyin("a永");
    expect(out[0]).toBe("");
    expect(out[1]).toBe(charToPinyin("永"));
  });
});

describe("charAllPinyins", () => {
  it("returns [] for non-Han", () => {
    expect(charAllPinyins("a")).toEqual([]);
    expect(charAllPinyins("")).toEqual([]);
  });
  it("reports multiple readings for a known polyphone", () => {
    const all = charAllPinyins("行"); // xíng / háng / ...
    expect(all.length).toBeGreaterThan(1);
    // 第 0 项为默认读音，须与 charToPinyin 一致
    expect(all[0]).toBe(charToPinyin("行"));
    // 包含一个已知的多音读音
    expect(all).toContain("háng");
  });
  it("is deduplicated and stable (cached)", () => {
    const a = charAllPinyins("行");
    const b = charAllPinyins("行");
    expect(a).toEqual(b);
  });
});
