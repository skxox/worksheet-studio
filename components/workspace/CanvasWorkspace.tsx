"use client";

import type { ReactNode, RefObject } from "react";
import { PreviewCanvas } from "@/components/common/PreviewCanvas";
import { SettingsPanel } from "@/components/common/SettingsPanel";

interface CanvasWorkspaceProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  children: ReactNode;
}

/**
 * 生成器页面的统一工作台骨架。
 * 画布始终占据主操作区，设置在桌面端固定于右侧、移动端收进抽屉。
 */
export function CanvasWorkspace({ canvasRef, children }: CanvasWorkspaceProps) {
  return (
    <main className="flex min-h-0 flex-1 overflow-hidden">
      <PreviewCanvas canvasRef={canvasRef} />
      <SettingsPanel>{children}</SettingsPanel>
    </main>
  );
}
