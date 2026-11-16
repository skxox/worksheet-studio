"use client";

import { Printer } from "lucide-react";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";

interface PrintCanvasButtonProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  title: string;
  className?: string;
  variant?: "default" | "ghost";
  size?: "default" | "sm";
}

/** 从当前画布创建独立打印文档，避免页面控制面板进入打印结果。 */
export function PrintCanvasButton({
  canvasRef,
  title,
  className,
  variant = "ghost",
  size = "sm",
}: PrintCanvasButtonProps) {
  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printWindow) return;

    const imageUrl = canvas.toDataURL("image/png");
    printWindow.document.write(
      `<html><head><title>${title}</title><style>body{margin:0;display:flex;justify-content:center}img{max-width:100%}</style></head><body><img src="${imageUrl}" onload="window.focus();window.print()"/></body></html>`,
    );
    printWindow.document.close();
  };

  return (
    <Button
      type="button"
      onClick={handlePrint}
      variant={variant}
      size={size}
      className={className}
    >
      <Printer className="mr-1 h-4 w-4" />
      打印
    </Button>
  );
}
