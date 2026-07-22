"use client";

import React, { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { fontLabel } from "@/lib/fonts";
import { cn } from "@/lib/utils";

function ControlRow({
  children,
  withIndicator = false,
  className,
}: {
  children: React.ReactNode;
  withIndicator?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid h-8 w-full items-center gap-2 text-sm",
        withIndicator
          ? "grid-cols-[64px_minmax(0,1fr)_16px]"
          : "grid-cols-[64px_minmax(0,1fr)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ControlRowButton({
  children,
  withIndicator = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  withIndicator?: boolean;
}) {
  return (
    <button
      {...props}
      className={cn(
        "grid h-8 w-full items-center gap-2 text-sm",
        withIndicator
          ? "grid-cols-[64px_minmax(0,1fr)_16px]"
          : "grid-cols-[64px_minmax(0,1fr)]",
        className,
      )}
    >
      {children}
    </button>
  );
}

function ControlRowLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="truncate text-sm font-medium text-slate-700">
      {children}
    </label>
  );
}

function ControlRowValue({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("truncate text-right text-sm text-slate-700", className)}
    >
      {children}
    </div>
  );
}

function ControlRowEnd({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("flex justify-end", className)}>{children}</div>;
}

export function PanelCard({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div className="bg-background border-input flex flex-col rounded-md border px-3 py-0.5 shadow-xs">
      {items.map((child, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <div
              data-orientation="horizontal"
              role="none"
              data-slot="separator-root"
              className="bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full"
            />
          )}
          {child}
        </React.Fragment>
      ))}
    </div>
  );
}

export function FontPickerCard({
  value,
  customLocalFont,
  commonOptions,
  onValueChange,
  onCustomLocalFontChange,
  onApplyCustomLocalFont,
}: {
  value: string;
  customLocalFont: string;
  commonOptions: { value: string; label: string; preview: string }[];
  onValueChange: (value: string) => void;
  onCustomLocalFontChange: (value: string) => void;
  onApplyCustomLocalFont: () => void;
}) {
  const currentLabel = fontLabel(value);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"common" | "local">(() =>
    value.startsWith("local:") ? "local" : "common",
  );
  const [syncedValue, setSyncedValue] = useState(value);

  if (value !== syncedValue) {
    setSyncedValue(value);
    setTab(value.startsWith("local:") ? "local" : "common");
  }

  type LocalFont = {
    family: string;
    fullName: string;
    postscriptName: string;
    style: string;
  };

  const [localFamilies, setLocalFamilies] = useState<string[] | null>(null);
  const [localStatus, setLocalStatus] = useState<
    "idle" | "loading" | "loaded" | "unsupported" | "error"
  >("idle");
  const [localQuery, setLocalQuery] = useState("");

  const loadLocalFonts = async () => {
    const queryLocalFonts = (
      window as unknown as {
        queryLocalFonts?: () => Promise<LocalFont[]>;
      }
    ).queryLocalFonts;
    if (!queryLocalFonts) {
      setLocalStatus("unsupported");
      return;
    }
    setLocalStatus("loading");
    try {
      const fonts = await queryLocalFonts();
      const seen = new Set<string>();
      const families: string[] = [];
      for (const f of fonts) {
        if (!seen.has(f.family)) {
          seen.add(f.family);
          families.push(f.family);
        }
      }
      families.sort((a, b) => a.localeCompare(b));
      setLocalFamilies(families);
      setLocalStatus("loaded");
    } catch {
      setLocalStatus("error");
    }
  };

  const filteredLocal =
    localFamilies?.filter((f) =>
      localQuery ? f.toLowerCase().includes(localQuery.toLowerCase()) : true,
    ) ?? [];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <ControlRowButton type="button" withIndicator className="outline-none">
          <ControlRowLabel>字体</ControlRowLabel>
          <ControlRowValue>{currentLabel}</ControlRowValue>
          <ChevronsUpDown className="size-4 flex-none shrink-0 opacity-50" />
        </ControlRowButton>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-1.5"
      >
        <div className="bg-muted grid grid-cols-2 rounded-lg p-0.5">
          <button
            type="button"
            onClick={() => setTab("common")}
            className={`h-8 rounded-md text-sm font-medium transition-colors ${
              tab === "common"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            常用字体
          </button>
          <button
            type="button"
            onClick={() => setTab("local")}
            className={`h-8 rounded-md text-sm font-medium transition-colors ${
              tab === "local"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground"
            }`}
          >
            本机字体
          </button>
        </div>

        {tab === "common" ? (
          <div className="border-input bg-background mt-1.5 max-h-72 overflow-y-auto rounded-md border shadow-xs">
            {commonOptions.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onValueChange(option.value);
                    setOpen(false);
                  }}
                  className={`border-border flex w-full items-center justify-between border-b px-3 py-2 text-left text-sm last:border-b-0 ${
                    selected
                      ? "bg-muted/50 text-foreground"
                      : "hover:bg-accent text-slate-700"
                  }`}
                >
                  <span
                    className="truncate"
                    style={{ fontFamily: option.preview }}
                  >
                    {option.label}
                  </span>
                  {selected && <Check className="h-4 w-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-1.5 space-y-1.5">
            {localStatus === "idle" && (
              <Button
                type="button"
                onClick={loadLocalFonts}
                variant="outline"
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs"
              >
                读取本机字体
              </Button>
            )}
            {localStatus === "loading" && (
              <p className="text-muted-foreground px-1 py-2 text-sm">读取中…</p>
            )}
            {(localStatus === "unsupported" || localStatus === "error") && (
              <p className="text-muted-foreground px-1 text-xs leading-5">
                {localStatus === "unsupported"
                  ? "当前浏览器不支持读取本机字体（需 Chrome/Edge 等 Chromium 内核），可在下方手动输入字体名。"
                  : "读取失败或权限被拒绝，可在下方手动输入字体名。"}
              </p>
            )}
            {localStatus === "loaded" && localFamilies && (
              <>
                <Input
                  value={localQuery}
                  onChange={(e) => setLocalQuery(e.target.value)}
                  placeholder={`搜索 ${localFamilies.length} 个字体`}
                  className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs"
                />
                <div className="border-input bg-background max-h-60 overflow-y-auto rounded-md border shadow-xs">
                  {filteredLocal.map((family) => {
                    const optValue = `local:${family}`;
                    const selected = optValue === value;
                    return (
                      <button
                        key={family}
                        type="button"
                        onClick={() => {
                          onValueChange(optValue);
                          setOpen(false);
                        }}
                        className={`border-border flex w-full items-center justify-between border-b px-3 py-2 text-left text-sm last:border-b-0 ${
                          selected
                            ? "bg-muted/50 text-foreground"
                            : "hover:bg-accent text-slate-700"
                        }`}
                      >
                        <span
                          className="truncate"
                          style={{ fontFamily: family }}
                        >
                          {family}
                        </span>
                        {selected && <Check className="h-4 w-4 shrink-0" />}
                      </button>
                    );
                  })}
                  {filteredLocal.length === 0 && (
                    <p className="text-muted-foreground px-3 py-2 text-sm">
                      无匹配字体
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="flex gap-2 pt-1">
              <Input
                value={customLocalFont}
                onChange={(e) => onCustomLocalFontChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onApplyCustomLocalFont();
                }}
                placeholder="或手动输入本机字体名"
                className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs"
              />
              <Button
                type="button"
                onClick={onApplyCustomLocalFont}
                variant="outline"
                className="border-input bg-background h-9 shrink-0 rounded-md border px-3 text-sm shadow-xs"
              >
                应用
              </Button>
            </div>
            <p className="text-muted-foreground text-xs leading-5">
              可输入系统已安装字体名，如“田英章楷书”“方正楷体”“AaKaiSong”。
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function ExpandableTriggerRow({
  label,
  value,
  expanded,
  onToggle,
}: {
  label: string;
  value: string;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <ControlRowButton type="button" onClick={onToggle} withIndicator>
      <ControlRowLabel>{label}</ControlRowLabel>
      <ControlRowValue>{value}</ControlRowValue>
      <ChevronsUpDown
        className={`size-4 flex-none shrink-0 opacity-50 transition-transform ${
          expanded ? "rotate-180" : ""
        }`}
      />
    </ControlRowButton>
  );
}

export function CompactSwitchRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <ControlRow>
      <ControlRowLabel>{label}</ControlRowLabel>
      <ControlRowEnd>
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          className="h-[1.15rem] w-8 shadow-xs"
        />
      </ControlRowEnd>
    </ControlRow>
  );
}

export function CompactSelectRow({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
}) {
  const currentLabel =
    options.find((item) => item.value === value)?.label ?? value;

  return (
    <div className="text-sm">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="border-0 bg-transparent px-0 py-0 text-sm shadow-none outline-none select-none [&>svg]:static [&>svg]:justify-self-end">
          <ControlRow withIndicator>
            <ControlRowLabel>{label}</ControlRowLabel>
            <ControlRowValue className="text-inherit">
              <span>{currentLabel}</span>
            </ControlRowValue>
          </ControlRow>
        </SelectTrigger>
        <SelectContent>
          {options.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function CompactSliderRow({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
}) {
  const display = Number.isInteger(value) ? String(value) : value.toFixed(1);

  return (
    <ControlRow className="grid-cols-[64px_minmax(0,1fr)_44px]">
      <ControlRowLabel>{label}</ControlRowLabel>
      <div className="min-w-0">
        <Slider
          value={[value]}
          onValueChange={([next]) => onChange(next)}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
      </div>
      <ControlRowValue className="shrink-0 text-xs tabular-nums">
        {display}
        {unit}
      </ControlRowValue>
    </ControlRow>
  );
}

export function CompactColorRow({
  label,
  value,
  expanded,
  onToggle,
  onChange,
}: {
  label: string;
  value: string;
  expanded: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div className="py-1">
      <ControlRowButton type="button" onClick={onToggle}>
        <ControlRowLabel>{label}</ControlRowLabel>
        <ControlRowEnd>
          <span className="size-5 rounded" style={{ backgroundColor: value }} />
        </ControlRowEnd>
      </ControlRowButton>
      {expanded && (
        <div className="flex items-center gap-2 pb-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-input bg-background h-9 w-10 cursor-pointer rounded-md border p-1"
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-input bg-background h-9 rounded-md border px-3 text-sm shadow-xs"
          />
        </div>
      )}
    </div>
  );
}
