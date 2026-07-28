/**
 * 纯几何换算与纸张常量 —— 无 Canvas / 无 DOM 依赖。
 *
 * 从 `lib/paper.ts` 抽出，使其可在 Node（Vitest 单测）中直接运行；
 * `lib/paper.ts` 通过 `export * from "./paper/geometry"` 透出，原有引用全部保持不变。
 */
import type { Margin, MarginPx, PaperSettings, PaperSize } from "@/types";

/** 1mm ≈ 3.78px @ 96 DPI */
export const MM_TO_PX = 3.7795275591;

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

export function mmToPx(mm: number): number {
  return mm * MM_TO_PX;
}

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
  const ratio = dpi / 96;
  return {
    width: Math.round(mmToPx(paperSize.width) * ratio),
    height: Math.round(mmToPx(paperSize.height) * ratio),
  };
}
