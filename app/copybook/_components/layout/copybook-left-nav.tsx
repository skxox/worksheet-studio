"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { CopybookType } from "@/types";
import type {
  CopybookTemplateGroup,
  CopybookTemplateOption,
} from "../../copybook-metadata";
import { cn } from "@/lib/utils";

const DIRECT_LABELS: Partial<Record<CopybookType, string>> = {
  number: "数字字帖",
  pinyin: "拼音字帖",
  control: "控笔练习",
};

function TemplateGroupMenu({
  group,
  currentType,
}: {
  group: CopybookTemplateGroup;
  currentType: CopybookType;
}) {
  const activeOption = group.options.find(
    (option) => option.value === currentType,
  );
  const label = group.key === "cn" ? "语文字帖" : "英文字帖";

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-haspopup="menu"
          className={cn(
            "inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium transition-colors",
            activeOption
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {label}
          <ChevronDown className="size-3.5 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-1.5">
        <div className="text-muted-foreground px-2 py-1.5 text-xs font-semibold">
          {label}
        </div>
        <div className="flex flex-col">
          {group.options.map((option) => (
            <TemplateMenuItem
              key={option.value}
              option={option}
              currentType={currentType}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function TemplateMenuItem({
  option,
  currentType,
}: {
  option: CopybookTemplateOption;
  currentType: CopybookType;
}) {
  const active = option.value === currentType;
  return (
    <Link
      href={`/copybook/${option.value}`}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-h-12 flex-col justify-center rounded-md px-2.5 py-1.5 transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-foreground hover:bg-muted",
      )}
    >
      <span className="text-sm font-medium">{option.label}</span>
      {option.description ? (
        <span className="text-muted-foreground mt-0.5 text-xs leading-4">
          {option.description}
        </span>
      ) : null}
    </Link>
  );
}

/** 桌面端顶部分类菜单，语文和英文按类别展开，专项练习直接切换。 */
export function CopybookLeftNav({
  groups,
  currentType,
}: {
  groups: CopybookTemplateGroup[];
  currentType: CopybookType;
}) {
  const languageGroups = groups.filter(
    (group) => group.key === "cn" || group.key === "en",
  );
  const directOptions = groups
    .filter((group) => group.key === "skill")
    .flatMap((group) => group.options);

  return (
    <nav
      aria-label="字帖分类"
      className="border-border/60 hidden h-12 shrink-0 items-center gap-1 border-b px-4 md:flex"
    >
      {languageGroups.map((group) => (
        <TemplateGroupMenu
          key={group.key}
          group={group}
          currentType={currentType}
        />
      ))}
      <div className="bg-border/70 mx-1 h-5 w-px" aria-hidden />
      {directOptions.map((option) => {
        const active = option.value === currentType;
        return (
          <Link
            key={option.value}
            href={`/copybook/${option.value}`}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {DIRECT_LABELS[option.value] ?? option.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** 移动端保留横向模板切换条，避免层级菜单占用过多屏幕空间。 */
export function CopybookMobileTypeBar({
  groups,
  currentType,
  className,
}: {
  groups: CopybookTemplateGroup[];
  currentType: CopybookType;
  className?: string;
}) {
  const options = groups.flatMap((group) => group.options);
  return (
    <nav
      aria-label="选择模板"
      className={cn(
        "-mx-4 flex scrollbar-thin gap-2 overflow-x-auto px-4 pb-1 md:hidden",
        className,
      )}
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
                ? "bg-primary text-primary-foreground shadow-1 border-transparent"
                : "border-border/60 bg-card text-muted-foreground hover:text-foreground",
            )}
          >
            {DIRECT_LABELS[option.value] ?? option.label}
          </Link>
        );
      })}
    </nav>
  );
}
