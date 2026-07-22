"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { CopybookType } from "@/types";
import type { CopybookTemplateGroup } from "../../copybook-metadata";
import { springs } from "@/lib/motion";
import { cn } from "@/lib/utils";

/** 桌面端分组模板导航：材质卡片 + layoutId 弹簧高亮（激活态在选项间物理滑动） */
export function CopybookLeftNav({
  groups,
  currentType,
}: {
  groups: CopybookTemplateGroup[];
  currentType: CopybookType;
}) {
  return (
    <nav className="scrollbar-thin edge-fade-mask sticky top-16 hidden max-h-[calc(100vh-80px)] w-56 shrink-0 overflow-y-auto pb-4 md:block">
      <div className="flex flex-col gap-3">
        <div className="text-muted-foreground px-1 text-xs font-medium">
          模板
        </div>
        {groups.map((group) => (
          <div
            key={group.key}
            className="bg-card rounded-xl border border-border/50 p-2 shadow-1"
          >
            <div className="text-foreground px-1 pb-2 text-xs font-semibold">
              {group.label}
            </div>
            <div className="flex flex-col gap-1">
              {group.options.map((option) => {
                const active = option.value === currentType;
                return (
                  <Link
                    key={option.value}
                    href={`/copybook/${option.value}`}
                    className={cn(
                      "press relative flex h-9 items-center justify-between rounded-lg px-2 text-left text-sm transition-colors",
                      active
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="copybook-type-active"
                        className="bg-secondary absolute inset-0 rounded-lg shadow-1"
                        transition={springs.default}
                      />
                    )}
                    <span className="relative truncate">{option.label}</span>
                    {active && (
                      <span className="relative text-xs opacity-70">当前</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}

/**
 * 移动端模板选择条：横向滚动 + scroll-snap，原生触屏滑动切换。
 * 补齐桌面左栏在移动端缺失的入口。
 */
export function CopybookMobileTypeBar({
  groups,
  currentType,
}: {
  groups: CopybookTemplateGroup[];
  currentType: CopybookType;
}) {
  const options = groups.flatMap((g) => g.options);
  return (
    <nav
      aria-label="选择模板"
      className="scrollbar-thin md:hidden -mx-4 flex gap-2 overflow-x-auto px-4 pb-1"
      style={{ scrollbarWidth: "none" }}
    >
      {options.map((option) => {
        const active = option.value === currentType;
        return (
          <Link
            key={option.value}
            href={`/copybook/${option.value}`}
            className={cn(
              "press inline-flex h-8 shrink-0 items-center rounded-full border px-3 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground border-transparent shadow-1"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
