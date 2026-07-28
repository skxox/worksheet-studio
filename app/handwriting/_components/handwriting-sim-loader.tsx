"use client";

import dynamic from "next/dynamic";

// Next 16：`ssr: false` 不允许写在 Server Component 内，因此用一个客户端壳包住
// next/dynamic，让手写模拟器（Canvas / OCR / 字体等重客户端逻辑）仅在浏览器侧
// 加载与渲染，服务端只输出骨架占位。
const HandwritingSim = dynamic(() => import("./handwriting-sim"), {
  ssr: false,
  loading: () => (
    <main
      className="text-muted-foreground flex min-h-[60vh] flex-1 items-center justify-center text-sm"
      role="status"
      aria-live="polite"
    >
      加载手写模拟器…
    </main>
  ),
});

export function HandwritingSimLoader() {
  return <HandwritingSim />;
}
