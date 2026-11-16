"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Margin } from "@/types";

const MARGIN_LABELS: Record<keyof Margin, string> = {
  top: "上",
  right: "右",
  bottom: "下",
  left: "左",
};

interface MarginFieldsProps {
  value: Margin;
  onChange: (key: keyof Margin, value: number) => void;
}

/** 统一的纸张边距输入，避免各页面各自维护字段标签和转换逻辑。 */
export function MarginFields({ value, onChange }: MarginFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.keys(MARGIN_LABELS) as (keyof Margin)[]).map((key) => (
        <div key={key} className="space-y-1">
          <Label className="text-muted-foreground text-xs">
            {MARGIN_LABELS[key]}
          </Label>
          <Input
            type="number"
            value={value[key]}
            onChange={(event) => onChange(key, Number(event.target.value))}
            min={0}
            step={1}
          />
        </div>
      ))}
    </div>
  );
}
