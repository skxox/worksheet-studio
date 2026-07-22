"use client";

import { PanelCard } from "../primitives/copybook-controls";

export function CopybookContentCard({
  label,
  content,
  placeholder,
  onEdit,
}: {
  label: string;
  content: string;
  placeholder: string;
  onEdit: () => void;
}) {
  return (
    <PanelCard>
      <div className="flex h-8 items-center justify-between gap-2 pt-1">
        <div className="text-foreground text-sm font-semibold">内容</div>
        <div className="bg-muted text-muted-foreground max-w-24 truncate rounded-md px-1.5 py-0.5 text-[10px] leading-none">
          {label}
        </div>
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="border-input bg-background press mt-2 mb-1 flex w-full flex-col gap-1 rounded-lg border px-3 py-2 text-left shadow-1 transition-colors hover:bg-muted/60"
      >
        <div className="text-muted-foreground text-xs">点击编辑</div>
        <div className="text-foreground line-clamp-2 text-sm">
          {content.trim().length ? content : placeholder}
        </div>
      </button>
    </PanelCard>
  );
}
