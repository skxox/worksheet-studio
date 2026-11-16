"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

/** 颜色选择与十六进制输入保持同步，供所有生成器复用。 */
export function ColorField({ label, value, onChange }: ColorFieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="border-input h-9 w-12 cursor-pointer rounded-md border bg-transparent"
        />
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
