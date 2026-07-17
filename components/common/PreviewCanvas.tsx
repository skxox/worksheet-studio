'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface PreviewCanvasProps {
  /** 由 useCanvas 返回的 canvasRef；绘制在逻辑坐标系，显示由 CSS 响应式缩放 */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  className?: string;
}

/**
 * 通用预览容器：canvas 的后缓冲保持全分辨率（导出清晰），
 * 显示层用 maxHeight/maxWidth 等比缩放到视口内，可滚动。
 */
export function PreviewCanvas({ canvasRef, className }: PreviewCanvasProps) {
  return (
    <div
      className={cn(
        'flex flex-1 items-start justify-center overflow-auto bg-muted/40 p-6',
        className
      )}
    >
      <canvas
        ref={canvasRef}
        className="block rounded-sm bg-white ring-1 ring-black/5"
        style={{
          maxHeight: 'calc(100vh - 7rem)',
          maxWidth: '100%',
          width: 'auto',
          height: 'auto',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
        }}
      />
    </div>
  );
}
