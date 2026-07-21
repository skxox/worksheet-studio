"use client";

import { useCallback } from "react";
import { exportCanvasToPDF, exportToSVG, downloadPNG } from "@/lib/pdf";
import type { PaperSize } from "@/types";

/** 导出逻辑封装：PDF / SVG / PNG，全部从 canvas 或 svg 字符串直出 */
export function useExport() {
  const exportPDF = useCallback(
    (
      canvas: HTMLCanvasElement | null,
      filename: string,
      paperSize: PaperSize,
    ) => {
      if (!canvas) return;
      exportCanvasToPDF(canvas, filename, paperSize);
    },
    [],
  );

  const exportSVG = useCallback((svgString: string, filename: string) => {
    if (!svgString) return;
    exportToSVG(svgString, filename);
  }, []);

  const exportPNG = useCallback(
    (canvas: HTMLCanvasElement | null, filename: string) => {
      if (!canvas) return;
      const dataUrl = canvas.toDataURL("image/png");
      downloadPNG(dataUrl, filename);
    },
    [],
  );

  return { exportPDF, exportSVG, exportPNG };
}
