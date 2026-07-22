"use client";

import type { CopybookType } from "@/types";

export function CopybookLeftNav({
  groups,
  currentType,
  onChange,
}: {
  groups: {
    key: string;
    label: string;
    options: { value: CopybookType; label: string }[];
  }[];
  currentType: CopybookType;
  onChange: (value: CopybookType) => void;
}) {
  return (
    <nav className="sticky top-16 hidden max-h-[calc(100vh-80px)] w-56 shrink-0 overflow-y-auto pb-4 md:block">
      <div className="flex flex-col gap-3">
        <div className="px-1 text-xs font-medium text-slate-500">模板</div>
        {groups.map((group) => (
          <div
            key={group.key}
            className="rounded-md bg-background p-2 shadow-xs ring-1 ring-slate-200"
          >
            <div className="px-1 pb-2 text-xs font-semibold text-slate-700">
              {group.label}
            </div>
            <div className="flex flex-col gap-1">
              {group.options.map((option) => {
                const active = option.value === currentType;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={`flex h-9 items-center justify-between rounded-md px-2 text-left text-sm transition-colors ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{option.label}</span>
                    {active && <span className="text-xs opacity-80">当前</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </nav>
  );
}
