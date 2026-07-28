"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Sheet } from "@/components/common/Sheet";
import {
  createStrokeRow,
  STROKE_PATTERN_OPTIONS,
  type StrokeDraftRow,
} from "../../../copybook-config";
import type { TemplateModalProps } from "../../workspace/copybook-template.types";

export function StrokeContentModal({
  open,
  title,
  strokeRows,
  onClose,
  onStrokeRowsChange,
  onSave,
}: TemplateModalProps) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      side="center"
      ariaLabel="编辑笔画内容"
      panelClassName="max-w-2xl"
    >
      <div className="border-border/50 flex items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0">
          <div className="text-foreground truncate text-base font-semibold">
            编辑内容
          </div>
          <div className="text-muted-foreground truncate text-xs">{title}</div>
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
        <div className="space-y-3">
          <div className="text-muted-foreground text-sm">
            选择要练习的笔画，并为每条笔画补一个示例字。
          </div>
          <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
            {strokeRows.map((row, index) => {
              const examples =
                STROKE_PATTERN_OPTIONS.find(
                  (item) => item.value === row.pattern,
                )?.examples ?? "";
              const update = (patch: Partial<StrokeDraftRow>) =>
                onStrokeRowsChange(
                  strokeRows.map((item) =>
                    item.id === row.id ? { ...item, ...patch } : item,
                  ),
                );
              return (
                <div key={row.id} className="space-y-1.5">
                  <div className="grid grid-cols-[160px_1fr_40px] gap-2">
                    <Select
                      value={row.pattern}
                      onValueChange={(value) => {
                        // 切换笔画时，若示例为空则自动取该笔画的首个常用例字
                        const firstExample =
                          STROKE_PATTERN_OPTIONS.find(
                            (item) => item.value === value,
                          )?.examples[0] ?? "";
                        update({
                          pattern: value,
                          example: row.example.trim() || firstExample,
                        });
                      }}
                    >
                      <SelectTrigger className="bg-background shadow-1 h-9 text-sm">
                        <span className="truncate">
                          {STROKE_PATTERN_OPTIONS.find(
                            (item) => item.value === row.pattern,
                          )?.label ?? "选择笔画"}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        {STROKE_PATTERN_OPTIONS.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={row.example}
                      onChange={(e) => update({ example: e.target.value })}
                      placeholder={`示例 ${index + 1}`}
                      className="border-input bg-background shadow-1 h-9 rounded-md border px-3 text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onStrokeRowsChange(
                          strokeRows.length > 1
                            ? strokeRows.filter((item) => item.id !== row.id)
                            : strokeRows,
                        )
                      }
                    >
                      删
                    </Button>
                  </div>
                  {examples && (
                    <div className="flex flex-wrap items-center gap-1 pl-42">
                      <span className="text-muted-foreground pr-0.5 text-xs">
                        例字
                      </span>
                      {Array.from(examples).map((ch) => (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => update({ example: ch })}
                          className="text-foreground hover:bg-accent h-7 min-w-7 rounded-md border px-1.5 text-sm transition-colors"
                        >
                          {ch}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              onStrokeRowsChange([...strokeRows, createStrokeRow()])
            }
          >
            新增一条
          </Button>
        </div>
      </div>
    </Sheet>
  );
}
