"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createStrokeRow,
  STROKE_PATTERN_OPTIONS,
  type StrokeDraftRow,
} from "../copybook-config";
import type { CopybookType } from "@/types";

export function CopybookContentModal({
  open,
  title,
  type,
  placeholder,
  draftContent,
  strokeRows,
  onClose,
  onDraftChange,
  onStrokeRowsChange,
  onSave,
}: {
  open: boolean;
  title: string;
  type: CopybookType;
  placeholder: string;
  draftContent: string;
  strokeRows: StrokeDraftRow[];
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onStrokeRowsChange: (rows: StrokeDraftRow[]) => void;
  onSave: () => void;
}) {
  if (!open) return null;

  const isStrokeMode = type === "stroke";

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/45" onClick={onClose} aria-hidden />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-background w-full max-w-2xl overflow-hidden rounded-lg shadow-xl ring-1 ring-black/10">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="min-w-0">
              <div className="truncate text-base font-semibold text-slate-900">
                编辑内容
              </div>
              <div className="truncate text-xs text-slate-500">{title}</div>
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
            {isStrokeMode ? (
              <div className="space-y-3">
                <div className="text-sm text-slate-600">
                  选择要练习的笔画，并为每条笔画补一个示例字。
                </div>
                <div className="max-h-[52vh] space-y-2 overflow-y-auto pr-1">
                  {strokeRows.map((row, index) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-[160px_1fr_40px] gap-2"
                    >
                      <Select
                        value={row.pattern}
                        onValueChange={(value) =>
                          onStrokeRowsChange(
                            strokeRows.map((item) =>
                              item.id === row.id
                                ? { ...item, pattern: value }
                                : item,
                            ),
                          )
                        }
                      >
                        <SelectTrigger className="h-9 bg-background text-sm shadow-xs">
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
                        onChange={(e) =>
                          onStrokeRowsChange(
                            strokeRows.map((item) =>
                              item.id === row.id
                                ? { ...item, example: e.target.value }
                                : item,
                            ),
                          )
                        }
                        placeholder={`示例 ${index + 1}`}
                        className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs"
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
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onStrokeRowsChange([...strokeRows, createStrokeRow()])}
                >
                  新增一条
                </Button>
              </div>
            ) : (
              <Textarea
                value={draftContent}
                onChange={(e) => onDraftChange(e.target.value)}
                rows={type === "paragraph" || type === "english-para" ? 10 : 6}
                placeholder={placeholder}
                className="border-input bg-background placeholder:text-muted-foreground w-full resize-none rounded-md border px-3 py-2 text-base shadow-xs transition-[color,box-shadow] md:text-sm"
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
