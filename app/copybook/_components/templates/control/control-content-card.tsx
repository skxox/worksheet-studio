"use client";

import { PanelCard } from "../../primitives/copybook-controls";
import type { TemplateContentCardProps } from "../../workspace/copybook-template.types";
import {
  CONTROL_PATTERN_CODES,
  parseControlPatternCodes,
} from "@/lib/copybook-control";

export function ControlContentCard({
  content,
  placeholder,
  onContentChange,
}: TemplateContentCardProps) {
  const selectedCodes = new Set(parseControlPatternCodes(content));

  return (
    <PanelCard>
      <div className="flex h-8 items-center justify-between gap-2 pt-1">
        <label
          htmlFor="control-pattern-content"
          className="text-foreground text-sm font-semibold"
        >
          练习图案
        </label>
        <span className="text-muted-foreground text-[11px]">
          {parseControlPatternCodes(content).length} 个
        </span>
      </div>
      <textarea
        id="control-pattern-content"
        aria-label="控笔图案序列"
        value={content}
        onChange={(event) => onContentChange?.(event.target.value)}
        placeholder={placeholder}
        rows={4}
        className="border-input bg-background placeholder:text-muted-foreground shadow-1 focus-visible:ring-ring mt-2 w-full resize-y rounded-lg border px-3 py-2 text-sm leading-5 focus-visible:ring-2 focus-visible:outline-none"
      />
      <div className="text-muted-foreground py-2 text-xs">
        点击图案添加到练习序列，也可直接编辑上方内容
      </div>
      <div aria-label="控笔练习图案" className="grid grid-cols-6 gap-1.5 pb-1">
        {CONTROL_PATTERN_CODES.map((code) => {
          const selected = selectedCodes.has(code);
          return (
            <button
              key={code}
              type="button"
              aria-label={`添加图案 ${code}`}
              aria-pressed={selected}
              title={`添加图案 ${code}`}
              onClick={() => onContentChange?.(`${content}${code}`)}
              className={`focus-visible:ring-ring grid size-8 place-items-center rounded-md border text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                selected
                  ? "border-primary/40 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {code}
            </button>
          );
        })}
      </div>
    </PanelCard>
  );
}
