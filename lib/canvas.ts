/** 创建一个离屏 canvas（用于导出等场景） */
export function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

export interface HiDPIResult {
  canvasWidth: number;
  canvasHeight: number;
  scale: number;
}

/** 计算 HiDPI 下的后缓冲尺寸。CSS 显示尺寸交由组件层（响应式）控制，这里只管后缓冲。 */
export function getHiDPICanvasSize(
  _canvas: HTMLCanvasElement,
  width: number,
  height: number,
): HiDPIResult {
  const dpr = window.devicePixelRatio || 1;
  return {
    canvasWidth: Math.round(width * dpr),
    canvasHeight: Math.round(height * dpr),
    scale: dpr,
  };
}

/**
 * 初始化 HiDPI canvas：后缓冲按 dpr 放大，逻辑坐标系仍按传入的 width/height。
 * 用 setTransform 而非 scale()，避免多次重绘时缩放累积。
 */
export function setupHiDPICanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D {
  const { canvasWidth, canvasHeight, scale } = getHiDPICanvasSize(
    canvas,
    width,
    height,
  );
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return ctx;
}

export function canvasToPNG(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png");
}

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

/**
 * 用同一套绘制逻辑在一个离屏 canvas 上按 scale 放大重绘，得到高清位图（≈600dpi 导出用）。
 * drawFn 使用逻辑坐标 (width × height)；内部已 ctx.scale(scale)。
 */
export function renderAtScale(
  drawFn: (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) => void,
  width: number,
  height: number,
  scale: number,
): HTMLCanvasElement {
  const canvas = createCanvas(
    Math.round(width * scale),
    Math.round(height * scale),
  );
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  drawFn(ctx, width, height);
  return canvas;
}
