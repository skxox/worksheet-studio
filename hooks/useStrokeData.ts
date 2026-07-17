'use client';

import { useEffect, useState } from 'react';
import { prefetchStrokes } from '@/lib/stroke';

/**
 * 当 enabled 时，预取文本中所有汉字的笔顺数据；完成后递增 ready 触发重绘。
 * 页面将 ready 纳入 onDraw 依赖，数据就绪即重画一次（此前未命中的字会先以字体回退）。
 */
export function useStrokeData(text: string, enabled: boolean): number {
  const [ready, setReady] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    prefetchStrokes(text).then(() => {
      if (active) setReady((n) => n + 1);
    });
    return () => {
      active = false;
    };
  }, [text, enabled]);

  return ready;
}
