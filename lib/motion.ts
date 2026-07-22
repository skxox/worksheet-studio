"use client";

export { useReducedMotion, useMotionValue, useTransform, animate } from "motion/react";

/**
 * Apple Fluid Interfaces 的 damping/response 两参数，映射到 Motion 的
 * bounce(≈阻尼比) + duration(≈response) 弹簧 API。全站统一曲线。
 * 参考：Designing Fluid Interfaces (WWDC 2018)。
 *
 * - default：阻尼 1.0（临界阻尼，无回弹），绝大多数 UI。
 * - gentle：同无回弹，略慢，用于大面积/远距离位移。
 * - bounce：略带回弹，仅用于「带速度的抛掷/弹回」场景（被甩出的卡片、回弹）。
 * - sheet：抽屉/弹窗，轻微回弹 + 快 response。
 */
export const springs = {
  default: { type: "spring", bounce: 0, duration: 0.4 },
  gentle: { type: "spring", bounce: 0, duration: 0.5 },
  bounce: { type: "spring", bounce: 0.18, duration: 0.4 },
  sheet: { type: "spring", bounce: 0.12, duration: 0.35 },
} as const;

/**
 * Apple 风格缓动（可逆过渡用：正向与反向取控制点镜像）。
 * 近似 iOS 标准曲线，用于非弹簧的 CSS/关键帧过渡。
 */
export const easeApple = [0.32, 0.72, 0, 1] as const;

/** 入场起始态：从下方 16px 淡入 —— 错峰 stagger 用 */
export const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
} as const;
