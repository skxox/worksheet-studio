import { describe, it, expect } from "vitest";
import {
  MM_TO_PX,
  PAPER_SIZES,
  PAPER_THEMES,
  mmToPx,
  toMarginPx,
  getCanvasSize,
  placeCenteredGridBlock,
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

describe("placeCenteredGridBlock（居中网格布局）", () => {
  /** 典型 A4 字帖参数：@3.78px/mm（791.8×1118.66）、边距 36px、
   *  格 10mm（37.8px）、行距 2mm（7.56px）。 */
  const a4ref = placeCenteredGridBlock({
    margin: { left: 36, top: 36 },
    contentWidth: 791.8 - 36 - 36,
    contentHeight: 1118.66 - 36 - 36,
    colUnit: 37.8,
    rowHeight: 37.8,
    rowGap: 7.56,
  });

  it("rows/cols 向下取整（行距最后一行不占）", () => {
    expect(a4ref.cols).toBe(Math.floor(719.8 / 37.8)); // 19
    expect(a4ref.rows).toBe(Math.floor((1046.66 + 7.56) / (37.8 + 7.56))); // 23
  });

  it("整块在边距内容盒内水平/垂直居中（上下留白一致）", () => {
    const blockW = a4ref.cols * 37.8;
    const blockH = a4ref.rows * (37.8 + 7.56) - 7.56;
    expect(a4ref.startX).toBeCloseTo(36 + (719.8 - blockW) / 2, 5);
    expect(a4ref.startY).toBeCloseTo(36 + (1046.66 - blockH) / 2, 5);
    // 块底即内容盒内最后一个格子的底边
    expect(a4ref.endY).toBeCloseTo(a4ref.startY + blockH, 5);
    // 上留白 === 下留白（用户反馈的核心诉求）
    expect(a4ref.startY - 36).toBeCloseTo(36 + 1046.66 - a4ref.endY, 5);
  });

  it("rowGap 为 0 时退化为整除布局，仍居中", () => {
    const p = placeCenteredGridBlock({
      margin: { left: 10, top: 20 },
      contentWidth: 100,
      contentHeight: 95,
      colUnit: 10,
      rowHeight: 30,
      rowGap: 0,
    });
    expect(p.rows).toBe(3); // floor(95/30)
    expect(p.cols).toBe(10);
    expect(p.startY).toBeCloseTo(20 + (95 - 90) / 2, 5); // 22.5
    expect(p.endY).toBeCloseTo(20 + (95 - 90) / 2 + 90, 5);
  });

  it("格大于内容盒时 rows/cols 归零且起点落在盒中心", () => {
    const p = placeCenteredGridBlock({
      margin: { left: 5, top: 5 },
      contentWidth: 30,
      contentHeight: 30,
      colUnit: 100,
      rowHeight: 100,
      rowGap: 10,
    });
    expect(p.rows).toBe(0);
    expect(p.cols).toBe(0);
    expect(p.startX).toBeCloseTo(5 + 30 / 2, 5);
    expect(p.startY).toBeCloseTo(5 + 30 / 2, 5);
    expect(p.endY).toBeCloseTo(p.startY, 5);
  });

  it("含笔顺/拼音带的整行高参与行数计算（附加行抬高行步进）", () => {
    // 行高 = 拼音带(0.6c) + 格(c) = 1.6×37.8 = 60.48
    const p = placeCenteredGridBlock({
      margin: { left: 36, top: 36 },
      contentWidth: 719.8,
      contentHeight: 1046.66,
      colUnit: 37.8,
      rowHeight: 37.8 * 1.6,
      rowGap: 7.56,
    });
    expect(p.rows).toBe(Math.floor((1046.66 + 7.56) / (37.8 * 1.6 + 7.56)));
    expect(p.rows).toBeGreaterThan(0);
  });
});
