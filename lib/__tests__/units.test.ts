import { describe, it, expect } from "vitest";
import {
  MM_PER_INCH,
  PX_PER_INCH,
  PT_PER_INCH,
  MM_TO_PX,
  MM_TO_PT,
  PT_TO_PX,
  mmToPx,
  pxToMm,
  mmToPt,
  ptToMm,
  ptToPx,
  pxToPt,
} from "@/lib/units";

describe("unit constants", () => {
  it("anchors everything to the inch", () => {
    expect(MM_PER_INCH).toBe(25.4);
    expect(PX_PER_INCH).toBe(96);
    expect(PT_PER_INCH).toBe(72);
    expect(MM_TO_PX).toBeCloseTo(96 / 25.4, 10);
    expect(MM_TO_PT).toBeCloseTo(72 / 25.4, 10);
    expect(PT_TO_PX).toBeCloseTo(96 / 72, 10);
  });
});

describe("mm <-> px", () => {
  it("converts at 96DPI by default", () => {
    expect(mmToPx(0)).toBe(0);
    expect(mmToPx(1)).toBeCloseTo(3.7795, 4);
    expect(mmToPx(10)).toBeCloseTo(37.795, 3); // 10mm ≈ 38px
  });

  it("honours a custom dpi", () => {
    expect(mmToPx(1, 192)).toBeCloseTo(2 * mmToPx(1), 6);
    expect(mmToPx(1, 300)).toBeCloseTo(300 / 25.4, 4);
  });

  it("is inverted by pxToMm", () => {
    expect(pxToMm(mmToPx(10))).toBeCloseTo(10, 10);
    expect(pxToMm(mmToPx(10, 192), 192)).toBeCloseTo(10, 10);
  });
});

describe("mm <-> pt", () => {
  it("converts mm to pt", () => {
    expect(mmToPt(1)).toBeCloseTo(2.8346, 4);
    expect(mmToPt(25.4)).toBeCloseTo(72, 6); // 1 inch = 72pt
  });

  it("is inverted by ptToMm", () => {
    expect(ptToMm(mmToPt(10))).toBeCloseTo(10, 10);
  });
});

describe("pt <-> px", () => {
  it("converts pt to px at 96DPI", () => {
    expect(ptToPx(72)).toBeCloseTo(96, 6); // 72pt = 1in = 96px
    expect(ptToPx(1)).toBeCloseTo(4 / 3, 6);
  });

  it("is inverted by pxToPt", () => {
    expect(pxToPt(ptToPx(10))).toBeCloseTo(10, 10);
  });
});
