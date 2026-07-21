import jsPDF from "jspdf";
import type { PaperSize } from "@/types";

/**
 * 把 canvas 直接导出为 PDF（不经过 html2canvas，规避 Tailwind v4 oklch 解析问题）。
 * 图片按纸张宽度等比缩放，垂直居中。
 */
export function exportCanvasToPDF(
  canvas: HTMLCanvasElement,
  filename: string = "worksheet.pdf",
  paperSize: PaperSize = { name: "A4", width: 210, height: 297 },
): void {
  const imgData = canvas.toDataURL("image/png");
  const orientation: "p" | "l" = paperSize.width > paperSize.height ? "l" : "p";
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: [paperSize.width, paperSize.height],
  });

  const imgW = paperSize.width;
  const imgH = (canvas.height * imgW) / canvas.width;
  const y = Math.max(0, (paperSize.height - imgH) / 2);
  pdf.addImage(imgData, "PNG", 0, y, imgW, Math.min(imgH, paperSize.height));
  pdf.save(filename);
}

/** 多页 PDF：每个 canvas 一页（纸张多页导出用） */
export function exportCanvasesToPDF(
  canvases: HTMLCanvasElement[],
  filename: string = "worksheet.pdf",
  paperSize: PaperSize = { name: "A4", width: 210, height: 297 },
): void {
  if (canvases.length === 0) return;
  const orientation: "p" | "l" = paperSize.width > paperSize.height ? "l" : "p";
  const pdf = new jsPDF({
    orientation,
    unit: "mm",
    format: [paperSize.width, paperSize.height],
  });
  canvases.forEach((canvas, i) => {
    if (i > 0) pdf.addPage([paperSize.width, paperSize.height], orientation);
    const imgData = canvas.toDataURL("image/png");
    const imgW = paperSize.width;
    const imgH = (canvas.height * imgW) / canvas.width;
    const y = Math.max(0, (paperSize.height - imgH) / 2);
    pdf.addImage(imgData, "PNG", 0, y, imgW, Math.min(imgH, paperSize.height));
  });
  pdf.save(filename);
}

/** 序列化一个 SVGSVGElement 并下载为 .svg 文件 */
export function exportToSVG(
  svgString: string,
  filename: string = "worksheet.svg",
): void {
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** 用 dataURL 下载 PNG */
export function downloadPNG(
  dataUrl: string,
  filename: string = "worksheet.png",
): void {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
