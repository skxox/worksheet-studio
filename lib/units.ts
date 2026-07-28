/**
 * 单位换算 —— 纯函数，无 DOM / Canvas 依赖，可在 Node（Vitest）下直接单测。
 *
 * 统一基准（避免到处硬编码魔法数）：
 *   1 英寸 = 25.4 mm = 96 px（CSS / Canvas 标准）= 72 pt（印刷 / PDF 标准）
 * 所有换算都以「英寸」为锚派生 mm↔px↔pt，不再出现 `3.7795`、`96/25.4` 这类裸数字。
 */

/** 每英寸毫米数（国际标准）。 */
export const MM_PER_INCH = 25.4;
/** 每英寸的逻辑像素数（CSS / Canvas @ 96DPI）。 */
export const PX_PER_INCH = 96;
/** 每英寸的点数（印刷 / PDF 标准）。 */
export const PT_PER_INCH = 72;

/** 1 mm = ? px @ 96DPI（≈ 3.7795）。 */
export const MM_TO_PX = PX_PER_INCH / MM_PER_INCH;
/** 1 mm = ? pt（≈ 2.8346）。 */
export const MM_TO_PT = PT_PER_INCH / MM_PER_INCH;
/** 1 pt = ? px @ 96DPI（= 96/72 ≈ 1.3333）。 */
export const PT_TO_PX = PX_PER_INCH / PT_PER_INCH;

/** mm → px。默认 96DPI；高分辨率导出可传 dpi（如 192 / 300）。 */
export function mmToPx(mm: number, dpi: number = PX_PER_INCH): number {
  return (mm * dpi) / MM_PER_INCH;
}

/** px → mm。默认 96DPI。 */
export function pxToMm(px: number, dpi: number = PX_PER_INCH): number {
  return (px * MM_PER_INCH) / dpi;
}

/** mm → pt。 */
export function mmToPt(mm: number): number {
  return mm * MM_TO_PT;
}

/** pt → mm。 */
export function ptToMm(pt: number): number {
  return pt / MM_TO_PT;
}

/** pt → px @ 96DPI。 */
export function ptToPx(pt: number): number {
  return pt * PT_TO_PX;
}

/** px → pt @ 96DPI。 */
export function pxToPt(px: number): number {
  return px / PT_TO_PX;
}
