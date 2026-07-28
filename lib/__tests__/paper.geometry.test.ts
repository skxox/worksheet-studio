import { describe, it, expect } from "vitest";
import {
  MM_TO_PX,
  PAPER_SIZES,
  PAPER_THEMES,
  mmToPx,
  toMarginPx,
  getCanvasSize,
} from "@/lib/paper/geometry";

describe("mmToPx", () => {
  it("converts millimetres to pixels @ 96 DPI", () => {
    expect(mmToPx(1)).toBeCloseTo(MM_TO_PX, 5);
    expect(mmToPx(0)).toBe(0);
    expect(mmToPx(10)).toBeCloseTo(37.7953, 3);
  });
});

describe("toMarginPx", () => {
  it("converts each margin side independently", () => {
    const m = toMarginPx({ top: 1, right: 2, bottom: 3, left: 4 });
    expect(m.top).toBeCloseTo(mmToPx(1), 5);
    expect(m.right).toBeCloseTo(mmToPx(2), 5);
    expect(m.bottom).toBeCloseTo(mmToPx(3), 5);
    expect(m.left).toBeCloseTo(mmToPx(4), 5);
  });
});

describe("getCanvasSize", () => {
  const a4 = { name: "A4", width: 210, height: 297 };
  it("returns rounded px for a portrait paper", () => {
    const size = getCanvasSize(a4);
    expect(size.width).toBe(Math.round(210 * MM_TO_PX));
    expect(size.height).toBe(Math.round(297 * MM_TO_PX));
    expect(size.height).toBeGreaterThan(size.width);
  });
  it("honours a custom dpi by scaling linearly", () => {
    // 注意：getCanvasSize 内部各自独立取整，故 2×dpi 的结果与「96dpi 取整后再 ×2」
    // 最多相差 1px。这里用 ±1 容差断言「线性缩放」关系，避免双重取整导致的脆弱。
    const at96 = getCanvasSize(a4, 96);
    const at192 = getCanvasSize(a4, 192);
    expect(at192.width).toBeGreaterThanOrEqual(at96.width * 2 - 1);
    expect(at192.width).toBeLessThanOrEqual(at96.width * 2 + 1);
    expect(at192.height).toBeGreaterThanOrEqual(at96.height * 2 - 1);
    expect(at192.height).toBeLessThanOrEqual(at96.height * 2 + 1);
  });
});

describe("PAPER_SIZES", () => {
  it("includes A4 and the expected set", () => {
    const a4 = PAPER_SIZES.find((s) => s.name === "A4");
    expect(a4).toBeDefined();
    expect(a4?.width).toBe(210);
    expect(a4?.height).toBe(297);
    expect(PAPER_SIZES.length).toBeGreaterThanOrEqual(7);
  });
  it("every size has positive dimensions", () => {
    for (const s of PAPER_SIZES) {
      expect(s.width).toBeGreaterThan(0);
      expect(s.height).toBeGreaterThan(0);
    }
  });
});

describe("PAPER_THEMES", () => {
  it("exposes the three built-in themes with bg + line", () => {
    const keys = Object.keys(PAPER_THEMES).sort();
    expect(keys).toEqual(["cool", "default", "warm"]);
    for (const key of keys) {
      const t = PAPER_THEMES[key as keyof typeof PAPER_THEMES];
      expect(typeof t.bg).toBe("string");
      expect(typeof t.line).toBe("string");
    }
  });
});
