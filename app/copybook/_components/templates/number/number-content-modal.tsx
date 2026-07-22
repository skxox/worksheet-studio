"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Sheet } from "@/components/common/Sheet";

export function NumberContentModal({
  open,
  draftContent,
  placeholder,
  onClose,
  onDraftChange,
  onSave,
}: {
  open: boolean;
  draftContent: string;
  placeholder: string;
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onSave: () => void;
}) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="center"
      ariaLabel="输入内容"
      panelClassName="max-w-2xl"
    >
      <div className="border-border/50 flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="text-foreground truncate text-base font-semibold">
            输入内容
          </div>
          <div className="text-muted-foreground truncate text-xs">
            请输入数字
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
          rows={12}
          placeholder={placeholder}
          className="border-input bg-background placeholder:text-muted-foreground w-full resize-none rounded-lg border px-3 py-2 text-base leading-7 shadow-1 transition-[color,box-shadow] md:text-sm"
        />
      </div>
    </Sheet>
  );
}
