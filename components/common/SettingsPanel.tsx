"use client";

import * as React from "react";
import { motion } from "motion/react";
import { Settings, X } from "lucide-react";
import { Sheet } from "@/components/common/Sheet";
import { springs } from "@/lib/motion";

interface SettingsPanelProps {
  children: React.ReactNode;
}

/**
 * 编辑器设置面板：
 * - 桌面(≥lg)：右侧静态半透明材质栏（glass-strong）。
 * - 移动端：浮动「设置」按钮 + 右侧可拖拽抽屉（Sheet，侧滑跟手、速度抛掷关闭）。
 * 内部 space-y-6 + p-4，调用方直接放设置内容即可。
 */
export function SettingsPanel({ children }: SettingsPanelProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* 浮动打开按钮（仅移动端） */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        whileTap={{ scale: 0.92 }}
        transition={springs.default}
        className="bg-primary text-primary-foreground press fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-3 lg:hidden"
      >
        <Settings className="h-5 w-5" />
        设置
      </motion.button>

      {/* 移动端抽屉：Sheet side=right，可侧滑跟手 + 速度关闭 */}
      <div className="lg:hidden">
        <Sheet
          open={open}
          onClose={() => setOpen(false)}
          side="right"
          ariaLabel="设置"
        >
          <div className="flex h-full flex-col">
            <div className="flex justify-end p-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted-foreground hover:text-foreground press rounded-md p-1"
                aria-label="关闭设置"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="scrollbar-thin space-y-6 flex-1 overflow-y-auto p-4">
              {children}
            </div>
          </div>
        </Sheet>
      </div>

      {/* 桌面静态栏 */}
      <aside className="glass-strong scrollbar-thin hidden w-80 shrink-0 flex-col space-y-6 overflow-y-auto p-4 lg:flex">
        {children}
      </aside>
    </>
  );
}
