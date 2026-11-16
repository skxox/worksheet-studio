"use client";

import { useEffect, useState } from "react";

/**
 * 持久化到 localStorage 的 useState。
 * 首屏用 initial（与 SSR 一致，避免 hydration 不匹配），挂载后再从 localStorage 读出并浅合并 initial（补全新增字段）。
 */
export function usePersistentState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      const next = raw
        ? ({ ...(initial as object), ...JSON.parse(raw) } as T)
        : initial;
      // 挂载或键切换时载入持久化设置（在 effect 中同步 setState 是此场景的合理用法）
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setState(next);
    } catch {
      /* ignore */
    } finally {
      // 只有当前键完成读取后才允许写回，防止默认值覆盖已有配置。
      // key 变化时，旧状态也不会被写入新的存储键。
      setHydratedKey(key);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (hydratedKey !== key) return;
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [hydratedKey, key, state]);

  return [state, setState] as const;
}
