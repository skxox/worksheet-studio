"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  useReducedMotion,
  type PanInfo,
} from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { springs } from "@/lib/motion";

type Side = "center" | "bottom" | "right";

/**
 * 可拖拽的半透明浮层（弹窗 / 底部表单 / 侧抽屉）。
 *
 * 设计参考 Apple Fluid Interfaces：
 * - §2 1:1 跟手：drag 轴随手指实时位移（style 绑定 motion value）。
 * - §3 可中断：进/出/拖拽都作用在同一个 motion value 上，动画始终从「当前呈现值」续接。
 * - §5 速度交接：onDragEnd 读取 info.velocity，超阈值即带速度关闭。
 * - §9 边界橡皮筋：dragElastic 按方向分级（仅允许朝「关闭」方向弹性拉出）。
 * - §7 进出同路径：enter/exit 共用同一离屏目标，路径对称可逆。
 * - §8 scrim 随拖拽距离同步变暗，暗示「再拉一点就消失」。
 * - §14 reduced-motion：禁用拖拽，退化为纯透明度交叉淡入，无位移。
 */
export function Sheet({
  open,
  onClose,
  children,
  side = "center",
  className,
  panelClassName,
  ariaLabel,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  side?: Side;
  className?: string;
  panelClassName?: string;
  ariaLabel?: string;
}) {
  const reduce = useReducedMotion();
  const axis: "x" | "y" = side === "right" ? "x" : "y";

  // 拖拽偏移（px）。进/出/拖拽都驱动这一个值，保证可中断、无跳变。
  const drag = useMotionValue(0);
  // scrim 透明度随拖拽距离衰减（底部/右侧）。center 走独立的 opacity 动画。
  const scrimOpacity = useTransform(drag, [0, 360], [0.45, 0]);

  // 离屏目标 px（足够大，覆盖任何面板尺寸），数值型以与 useTransform 相容。
  const off = 1000;

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Esc 关闭
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  // 打开时锁定背景滚动
  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", onKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, onKeyDown]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const offset = axis === "y" ? info.offset.y : info.offset.x;
    const velocity = axis === "y" ? info.velocity.y : info.velocity.x;
    let dismiss = false;
    if (side === "center") {
      // 居中弹窗：任意方向拉够或甩出即关
      dismiss = Math.abs(offset) > 120 || Math.abs(velocity) > 600;
    } else {
      // 抽屉：朝关闭方向（下 / 右）正向偏移或速度
      dismiss = offset > 100 || velocity > 500;
    }
    if (dismiss) onClose();
  };

  // 进入/退出目标：center 用 scale+opacity；bottom/right 用离轴位移。
  const enterExit =
    side === "center"
      ? { opacity: 0, scale: 0.94 }
      : side === "bottom"
        ? { y: off }
        : { x: off };
  const settled =
    side === "center" ? { opacity: 1, scale: 1 } : { x: 0, y: 0 };

  const dragProp = reduce ? false : axis;
  // 仅允许朝「关闭」方向弹性拉出，反方向硬阻尼（bottom：只下不下；right：只右不左）
  const elastic =
    side === "bottom"
      ? { top: 0, bottom: 0.5, left: 0, right: 0 }
      : side === "right"
        ? { top: 0, bottom: 0, left: 0, right: 0.5 }
        : { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 };

  const wrapperPos =
    side === "center"
      ? "flex items-center justify-center p-4"
      : side === "bottom"
        ? "absolute inset-x-0 bottom-0 flex justify-center"
        : "absolute inset-y-0 right-0 flex";

  return (
    <AnimatePresence>
      {open && (
        <div
          ref={wrapperRef}
          role="dialog"
          aria-modal="true"
          aria-label={ariaLabel}
          className={cn("fixed inset-0 z-50", wrapperPos, className)}
        >
          {/* Scrim：center 用 opacity 动画；bottom/right 随拖拽距离变暗 */}
          <motion.div
            className="absolute inset-0 bg-black/45"
            style={reduce || side === "center" ? undefined : { opacity: scrimOpacity }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className={cn(
              "glass-strong relative max-h-[92vh] w-full overflow-hidden rounded-2xl",
              side === "bottom" && "rounded-b-none",
              side === "right" && "h-full w-[85vw] max-w-sm rounded-r-none",
              panelClassName,
            )}
            style={reduce ? undefined : { [axis]: drag }}
            initial={enterExit}
            animate={settled}
            exit={enterExit}
            transition={springs.sheet}
            drag={dragProp}
            dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
            dragElastic={elastic}
            onDragEnd={handleDragEnd}
          >
            {/* 拖拽提示（底部表单）：视觉暗示可下拉关闭 */}
            {side === "bottom" && !reduce && (
              <div className="bg-muted-foreground/30 absolute left-1/2 top-2 h-1 w-9 -translate-x-1/2 rounded-full" />
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
