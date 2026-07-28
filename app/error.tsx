"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 上报错误（暂仅控制台；接入监控时可替换为 Sentry 等）
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-24">
      <div className="text-center">
        <h1 className="text-display-sm">出错了</h1>
        <p className="text-muted-foreground mt-3">
          渲染时发生意外错误，可以尝试重试。
        </p>
        {error.digest ? (
          <p className="text-muted-foreground/70 mt-1 font-mono text-xs">
            {error.digest}
          </p>
        ) : null}
        <div className="mt-8">
          <Button onClick={reset}>重试</Button>
        </div>
      </div>
    </main>
  );
}
