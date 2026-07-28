/**
 * 纯几何换算与纸张常量 —— 无 Canvas / 无 DOM 依赖。
 *
 * 单位换算集中在 `@/lib/units`（mm↔px↔pt，含 DPI）；这里透出常用项，
 * 使历史引用（`@/lib/paper`、`@/lib/paper/geometry`）保持不变。
 */
import type { Margin, MarginPx, PaperSettings, PaperSize } from "@/types";
export {
  mmToPx,
  pxToMm,
  mmToPt,
  ptToMm,
  ptToPx,
  pxToPt,
  MM_TO_PX,
  MM_TO_PT,
  PT_TO_PX,
} from "@/lib/units";
import { mmToPx } from "@/lib/units";

export const PAPER_SIZES: PaperSize[] = [
  { name: "A4", width: 210, height: 297 },
  { name: "A3", width: 297, height: 420 },
  { name: "A5", width: 148, height: 210 },
  { name: "B5", width: 176, height: 250 },
  { name: "Letter", width: 216, height: 279 },
  { name: "16K", width: 195, height: 270 },
  { name: "32K", width: 130, height: 185 },
];

export const PAPER_THEMES: Record<
  NonNullable<PaperSettings["theme"]>,
  { bg: string; line: string }
> = {
  default: { bg: "#ffffff", line: "#d1d5db" },
  warm: { bg: "#fef9f3", line: "#e8d5c4" },
  cool: { bg: "#f0f9ff", line: "#bae6fd" },
};

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
  dpi: number = 96,
): { width: number; height: number } {
  return {
    width: Math.round(mmToPx(paperSize.width, dpi)),
    height: Math.round(mmToPx(paperSize.height, dpi)),
  };
}
