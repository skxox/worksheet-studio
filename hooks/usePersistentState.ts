"use client";

import { useEffect, useState } from "react";

/**
 * 持久化到 localStorage 的 useState。
 * 首屏用 initial（与 SSR 一致，避免 hydration 不匹配），挂载后再从 localStorage 读出并浅合并 initial（补全新增字段）。
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      // 挂载时载入持久化设置（在 effect 中同步 setState 是此场景的合理用法）
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setState({ ...(initial as object), ...JSON.parse(raw) } as T);
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [key, state]);

  return [state, setState] as const;
}
