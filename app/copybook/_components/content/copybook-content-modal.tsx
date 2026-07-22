"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet } from "@/components/common/Sheet";
import type { CopybookType } from "@/types";

export function CopybookContentModal({
  open,
  title,
  type,
  placeholder,
  draftContent,
  onClose,
  onDraftChange,
  onSave,
}: {
  open: boolean;
  title: string;
  type: CopybookType;
  placeholder: string;
  draftContent: string;
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
}) {
  const modalHeading = "编辑内容";
  const modalSubheading = title;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="center"
      ariaLabel="编辑内容"
      panelClassName="max-w-2xl"
    >
      <div className="border-border/50 flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="text-foreground truncate text-base font-semibold">
            {modalHeading}
          </div>
          <div className="text-muted-foreground truncate text-xs">
            {modalSubheading}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onClose}>
            取消
          </Button>
          <Button size="sm" onClick={onSave}>
            保存
          </Button>
        </div>
      </div>
      <div className="p-4">
        <Textarea
          value={draftContent}
          onChange={(e) => onDraftChange(e.target.value)}
          rows={type === "paragraph" || type === "english-para" ? 10 : 6}
          placeholder={placeholder}
          className="border-input bg-background placeholder:text-muted-foreground w-full resize-none rounded-lg border px-3 py-2 text-base shadow-1 transition-[color,box-shadow] md:text-sm"
        />
      </div>
    </Sheet>
  );
}
