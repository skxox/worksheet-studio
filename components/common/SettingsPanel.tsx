"use client";

import * as React from "react";
import { Settings, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsPanelProps {
  children: React.ReactNode;
}

/**
 * 编辑器设置面板：桌面(≥lg)为右侧静态栏；移动端为右滑抽屉 + 浮动"设置"按钮 + 遮罩。
 * 内部 space-y-6 + p-4，调用方直接放设置内容即可。
 */
export function SettingsPanel({ children }: SettingsPanelProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      {/* 浮动打开按钮（仅移动端） */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-primary text-primary-foreground fixed right-4 bottom-4 z-30 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg lg:hidden"
      >
        <Settings className="h-5 w-5" />
        设置
      </button>

      {/* 遮罩（仅移动端抽屉打开时） */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          "bg-background space-y-6 overflow-y-auto p-4",
          "fixed inset-y-0 right-0 z-50 w-[85vw] max-w-sm border-l shadow-xl transition-transform duration-200",
          "lg:static lg:z-auto lg:min-h-0 lg:w-80 lg:max-w-none lg:translate-x-0 lg:border-t-0 lg:border-l lg:shadow-none",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex justify-end lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-muted-foreground"
            aria-label="关闭设置"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </aside>
    </>
  );
}
