"use client";

import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface SliderRowProps {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  minLabel?: string;
  maxLabel?: string;
  recommend?: number;
}

/** 带推荐值与两端语义标签的滑块行（对标凹凸工坊 / PaperMe 的提示风格） */
export function SliderRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = "",
  minLabel,
  maxLabel,
  recommend,
}: SliderRowProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        <span className="text-muted-foreground text-xs tabular-nums">
          {value}
          {unit}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
      {(minLabel || maxLabel) && (
        <div className="text-muted-foreground flex justify-between text-[10px] leading-none">
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </div>
      )}
      {recommend !== undefined && (
        <p className="text-muted-foreground text-[10px] leading-none">
          推荐 {recommend}
          {unit}
        </p>
      )}
    </div>
  );
}
