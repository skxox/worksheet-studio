'use client';

import { useEffect, useState } from 'react';
import { ensureFontLoaded, fontWebFamily } from '@/lib/fonts';

/**
 * 确保某字体（按 key）已加载完毕。系统字体立即就绪；Web 字体等待 document.fonts.load。
 * 返回 ready 布尔；页面在 onDraw 中据此决定是否绘制（字体就绪后再画，避免回退字体重绘抖动）。
 */
export function useFontLoader(fontKey: string, size: number = 48): boolean {
  const family = fontWebFamily(fontKey);
  const [loadedFamily, setLoadedFamily] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    ensureFontLoaded(family, size).then(() => {
      if (active) setLoadedFamily(family);
    });
    return () => {
      active = false;
    };
  }, [family, size]);

  // 系统字体（family=null）恒为就绪；否则需已加载的 family 与当前一致
  return family === null || loadedFamily === family;
}
