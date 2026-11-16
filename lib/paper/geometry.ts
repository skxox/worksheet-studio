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

/** 居中网格布局结果（全部为画布逻辑 px） */
export interface CenteredGridPlacement {
  /** 内容盒内可容纳的行数（含最后一行行距的抵扣，向下取整） */
  rows: number;
  /** 内容盒内可容纳的列数（向下取整） */
  cols: number;
  /** 网格块左边（= 左边距 + 左右剩余空间一半） */
  startX: number;
  /** 网格块顶边（= 上边距 + 上下剩余空间一半，保证上下间距一致） */
  startY: number;
  /** 网格块底边（startY + blockHeight），铺格循环以此为界 */
  endY: number;
}

/**
 * 字帖网格居中布局：行列向下取整后，整块网格在「边距内容盒」内
 * 水平 + 垂直居中——上下留白各为 (剩余高度)/2，视觉间距一致。
 *
 * 公式：
 * - rows = floor((contentHeight + rowGap) / (rowHeight + rowGap))
 * - cols = floor(contentWidth / colUnit)
 * - blockHeight = rows * (rowHeight + rowGap) - rowGap
 * - startY = margin.top + (contentHeight - blockHeight) / 2
 */
export function placeCenteredGridBlock(input: {
  margin: Pick<MarginPx, "left" | "top">;
  contentWidth: number;
  contentHeight: number;
  /** 水平单元宽（格宽 / 列宽） */
  colUnit: number;
  /** 垂直单元高（整行高，含笔顺带/拼音带等附加行） */
  rowHeight: number;
  rowGap: number;
}): CenteredGridPlacement {
  const rowStep = input.rowHeight + input.rowGap;
  const rows =
    rowStep > 0
      ? Math.max(0, Math.floor((input.contentHeight + input.rowGap) / rowStep))
      : 0;
  const cols =
    input.colUnit > 0
      ? Math.max(0, Math.floor(input.contentWidth / input.colUnit))
      : 0;
  const blockWidth = cols * input.colUnit;
  const blockHeight = rows > 0 ? rows * rowStep - input.rowGap : 0;
  const startX = input.margin.left + (input.contentWidth - blockWidth) / 2;
  const startY = input.margin.top + (input.contentHeight - blockHeight) / 2;
  return { rows, cols, startX, startY, endY: startY + blockHeight };
}
