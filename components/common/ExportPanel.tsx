"use client";

import { FileDown, ImageDown, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ExportPanelProps {
  onPDF: () => void;
  onPNG: () => void;
  onSVG?: () => void;
  showSVG?: boolean;
}

/** 通用导出按钮组：PDF / PNG（+ 可选 SVG） */
export function ExportPanel({
  onPDF,
  onPNG,
  onSVG,
  showSVG,
}: ExportPanelProps) {
  return (
    <div className="flex gap-2">
      <Button onClick={onPDF} variant="outline" className="flex-1">
        <FileDown className="mr-2 h-4 w-4" />
        PDF
      </Button>
      <Button onClick={onPNG} variant="outline" className="flex-1">
        <ImageDown className="mr-2 h-4 w-4" />
        PNG
      </Button>
      {showSVG && onSVG && (
        <Button onClick={onSVG} variant="outline" className="flex-1">
          <FileCode className="mr-2 h-4 w-4" />
          SVG
        </Button>
      )}
    </div>
  );
}
