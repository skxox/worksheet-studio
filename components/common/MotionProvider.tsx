"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * 全局 Motion 配置：reducedMotion="user" 让所有 Motion 动画在系统开启
 * 「减少动效」时自动降级（位移/缩放类动画退化为仅透明度或不动画），
 * 对应 Apple Fluid Interfaces §14。手势组件 Sheet 另自行处理拖拽降级。
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
