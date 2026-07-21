"use client";

import { useRef, useEffect, useCallback } from "react";
import { setupHiDPICanvas } from "@/lib/canvas";

interface UseCanvasOptions {
  width: number;
  height: number;
  onDraw?: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => void;
}

/**
 * HiDPI canvas 初始化 + 自动重绘。
 * 页面把 onDraw 用 useCallback 包裹并以 settings 作为依赖，settings 变化即触发重绘。
 */
export function useCanvas({ width, height, onDraw }: UseCanvasOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = setupHiDPICanvas(canvas, width, height);
    ctxRef.current = ctx;
    onDraw?.(ctx, width, height);
  }, [width, height, onDraw]);

  const redraw = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    onDraw?.(ctx, width, height);
  }, [width, height, onDraw]);

  return { canvasRef, ctxRef, redraw };
}
