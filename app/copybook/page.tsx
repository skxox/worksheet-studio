"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from "react";
import { Check, ChevronsUpDown, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCanvas } from "@/hooks/useCanvas";
import { useExport } from "@/hooks/useExport";
import { useFontLoader } from "@/hooks/useFontLoader";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useStrokeData } from "@/hooks/useStrokeData";
import {
  COMMON_FONT_KEYS,
  LOCAL_FONT_KEYS,
  fontLabel,
  fontStack,
} from "@/lib/fonts";
import { drawCopybook, STROKE_PRESET } from "@/lib/copybook";
import { getCanvasSize, PAPER_SIZES } from "@/lib/paper";
import type {
  CopybookSettings,
  CopybookType,
  GridType,
  Margin,
  PaperSize,
} from "@/types";

const GRID_TYPES: { value: GridType; label: string }[] = [
  { value: "tian", label: "田字格" },
  { value: "mi", label: "米字格" },
  { value: "huigong", label: "回宫格" },
  { value: "fang", label: "方格" },
  { value: "jiugong", label: "九宫格" },
];

const GRID_SIZES = [8, 10, 12, 15, 20];

const COMMON_FONT_OPTIONS = COMMON_FONT_KEYS.map((key) => ({
  value: key,
  label: fontLabel(key),
  preview: fontStack(key),
}));

const LOCAL_FONT_OPTIONS = LOCAL_FONT_KEYS.map((key) => ({
  value: key,
  label: fontLabel(key),
  preview: fontStack(key),
}));

const DEFAULT_CONTENT: Record<CopybookType, string> = {
  character: "你好世界",
  word: "春暖花开 阳光明媚",
  paragraph: "床前明月光，疑是地上霜。\n举头望明月，低头思故乡。",
  pinyin: "春夏秋冬",
  stroke: STROKE_PRESET,
  "english-char": "AaBbCcDd",
  "english-word": "hello world",
  "english-para": "The quick brown fox jumps over the lazy dog.",
  number: "0123456789",
  control: "",
};

const DEFAULT_SETTINGS: CopybookSettings = {
  type: "character",
  content: DEFAULT_CONTENT.character,
  fontFamily: "kaiti",
  fontWeight: "normal",
  gridType: "tian",
  gridSize: 10,
  rowGap: 2,
  margin: { top: 36, right: 36, bottom: 36, left: 36 },
  fontScale: 68,
  fontSize: 28,
  vOffset: 0,
  renderMode: "miao",
  solidCount: 20,
  groupSpacing: 4,
  miaoColor: "#cfd5de",
  lineColor: "#98a5b9",
  color: "#1f2937",
  showPinyin: false,
  showStroke: false,
  highlightFirst: true,
  insertEmptyRow: false,
  insertEmptyCol: false,
  lineSpacing: 12,
  paperSize: PAPER_SIZES[0],
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function resolvePaperSize(value: unknown): PaperSize {
  if (typeof value === "string") {
    return PAPER_SIZES.find((item) => item.name === value) ?? PAPER_SIZES[0];
  }
  if (isRecord(value) && typeof value.name === "string") {
    return (
      PAPER_SIZES.find((item) => item.name === value.name) ?? PAPER_SIZES[0]
    );
  }
  return PAPER_SIZES[0];
}

function resolveMargin(value: unknown): Margin {
  if (!isRecord(value)) return DEFAULT_SETTINGS.margin;
  return {
    top: toFiniteNumber(value.top, DEFAULT_SETTINGS.margin.top),
    right: toFiniteNumber(value.right, DEFAULT_SETTINGS.margin.right),
    bottom: toFiniteNumber(value.bottom, DEFAULT_SETTINGS.margin.bottom),
    left: toFiniteNumber(value.left, DEFAULT_SETTINGS.margin.left),
  };
}

export default function CopybookPage() {
  const [settings, setSettings] = usePersistentState<CopybookSettings>(
    "ws:copybook",
    DEFAULT_SETTINGS,
  );
  const safeSettings = useMemo<CopybookSettings>(
    () => ({
      ...settings,
      paperSize: resolvePaperSize(settings.paperSize),
      margin: resolveMargin(settings.margin),
      renderMode: "miao",
    }),
    [settings],
  );
  const [fontTab, setFontTab] = useState<"common" | "local">(() => {
    const initialFont =
      typeof settings.fontFamily === "string"
        ? settings.fontFamily
        : DEFAULT_SETTINGS.fontFamily;
    return (LOCAL_FONT_KEYS as readonly string[]).includes(initialFont) ||
      initialFont.startsWith("local:")
      ? "local"
      : "common";
  });
  const [customLocalFont, setCustomLocalFont] = useState(() => {
    const initialFont =
      typeof settings.fontFamily === "string" ? settings.fontFamily : "";
    return initialFont.startsWith("local:")
      ? initialFont.slice("local:".length)
      : "";
  });
  const [expandedPanel, setExpandedPanel] = useState<
    null | "font" | "margin" | "miaoColor" | "lineColor" | "color"
  >(null);

  const fontReady = useFontLoader(safeSettings.fontFamily);
  const strokesReady = useStrokeData(
    safeSettings.content,
    safeSettings.showStroke,
  );
  const { exportPDF } = useExport();
  const canvasSize = getCanvasSize(safeSettings.paperSize);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      drawCopybook(ctx, width, height, safeSettings);
    },
    [safeSettings],
  );

  const { canvasRef, redraw } = useCanvas({
    width: canvasSize.width,
    height: canvasSize.height,
    onDraw: draw,
  });

  // 笔顺数据就绪后重绘一次
  useEffect(() => {
    if (strokesReady) redraw();
  }, [strokesReady, redraw]);

  useEffect(() => {
    if (fontReady) redraw();
  }, [fontReady, redraw]);

  const updateSetting = <K extends keyof CopybookSettings>(
    key: K,
    value: CopybookSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  const updateMargin = (key: keyof Margin, value: number) => {
    const next = Number.isFinite(value)
      ? Math.min(100, Math.max(10, Math.round(value)))
      : 36;
    setSettings((prev) => ({
      ...prev,
      margin: { ...prev.margin, [key]: next },
    }));
  };
  const applyCustomLocalFont = () => {
    const name = customLocalFont.trim();
    if (!name) return;
    setFontTab("local");
    updateSetting("fontFamily", `local:${name}`);
  };
  const togglePanel = (
    panel: "font" | "margin" | "miaoColor" | "lineColor" | "color",
  ) => {
    setExpandedPanel((prev) => (prev === panel ? null : panel));
  };

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) return;
    w.document.write(
      `<html><head><title>打印字帖</title><style>body{margin:0;display:flex;justify-content:center}img{max-width:100%}</style></head><body><img src="${url}" onload="window.focus();window.print()"/></body></html>`,
    );
    w.document.close();
  };

  const t = safeSettings.type;
  const isGridMode = [
    "character",
    "word",
    "number",
    "stroke",
    "pinyin",
  ].includes(t);
  const isLineMode = t === "paragraph" || t === "english-para";
  const showPinyinToggle = ["character", "word", "pinyin"].includes(t);
  const marginSummary = `${safeSettings.margin.top}, ${safeSettings.margin.right}, ${safeSettings.margin.bottom}, ${safeSettings.margin.left}`;

  return (
    <main
      className="relative bg-slate-100"
      style={{ minHeight: "calc(-122px + 100vh)" }}
    >
      <div
        className="print-out container mx-auto flex w-full max-w-[var(--content-width)] justify-center gap-4 pt-5"
        style={{ "--content-width": "1090px" } as CSSProperties}
      >
        <section className="relative">
          <div
            className="relative"
            style={{
              minWidth: `${canvasSize.width}px`,
              minHeight: `${canvasSize.height}px`,
            }}
          >
            <div
              id="print-body"
              className="print-papges pointer-events-none"
              style={{
                minWidth: `${canvasSize.width}px`,
                minHeight: `${canvasSize.height}px`,
              }}
            >
              <canvas
                ref={canvasRef}
                id="paper-canvas-0"
                className="paper-canvas print-page"
                style={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                }}
              />
            </div>
            <div className="print-none absolute top-0 left-0 z-10">
              <div
                className="print-page relative"
                style={{
                  width: `${canvasSize.width}px`,
                  height: `${canvasSize.height}px`,
                }}
              />
            </div>
          </div>
        </section>

        <aside className="scrollbar-thin sticky top-16 flex max-h-[calc(100vh-80px)] min-w-50 flex-1 flex-col gap-3 overflow-y-auto pb-4">
          <div className="flex gap-2">
            <Button
              onClick={() =>
                exportPDF(
                  canvasRef.current,
                  "copybook.pdf",
                  safeSettings.paperSize,
                )
              }
              variant="outline"
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md border bg-background px-4 py-2 text-sm font-medium shadow-xs transition-all hover:bg-accent hover:text-accent-foreground"
            >
              <Download className="h-4 w-4" />导 出
            </Button>
            <Button
              onClick={handlePrint}
              className="inline-flex h-9 flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-all hover:bg-primary/90"
            >
              <Printer className="h-4 w-4" />打 印
            </Button>
          </div>

          {t !== "control" && (
            <Textarea
              value={safeSettings.content}
              onChange={(e) => updateSetting("content", e.target.value)}
              rows={3}
              placeholder="输入要练习的文字..."
              className="h-24 min-h-16 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-base shadow-xs transition-[color,box-shadow] placeholder:text-muted-foreground md:text-sm"
            />
          )}

          <PanelCard>
            {isGridMode && (
              <CompactSwitchRow
                label="显示笔顺"
                checked={safeSettings.showStroke}
                onCheckedChange={(value) => updateSetting("showStroke", value)}
              />
            )}
            {showPinyinToggle && (
              <CompactSwitchRow
                label="显示拼音"
                checked={safeSettings.showPinyin}
                onCheckedChange={(value) => updateSetting("showPinyin", value)}
              />
            )}
            {isGridMode && (
              <>
                <CompactSwitchRow
                  label="首字高亮"
                  checked={safeSettings.highlightFirst}
                  onCheckedChange={(value) =>
                    updateSetting("highlightFirst", value)
                  }
                />
                <CompactSwitchRow
                  label="插入空行"
                  checked={safeSettings.insertEmptyRow}
                  onCheckedChange={(value) =>
                    updateSetting("insertEmptyRow", value)
                  }
                />
                <CompactSwitchRow
                  label="插入空列"
                  checked={safeSettings.insertEmptyCol}
                  onCheckedChange={(value) =>
                    updateSetting("insertEmptyCol", value)
                  }
                />
              </>
            )}
          </PanelCard>

          {isGridMode && (
            <PanelCard>
              <CompactSelectRow
                label="方格类型"
                value={safeSettings.gridType}
                options={GRID_TYPES.map((item) => ({
                  value: item.value,
                  label: item.label,
                }))}
                onValueChange={(value) =>
                  updateSetting("gridType", value as GridType)
                }
              />
              <CompactSliderRow
                label="方格大小"
                value={safeSettings.gridSize}
                unit="mm"
                min={GRID_SIZES[0]}
                max={GRID_SIZES[GRID_SIZES.length - 1]}
                step={1}
                onChange={(value) => updateSetting("gridSize", value)}
              />
              <CompactSliderRow
                label="行间距"
                value={safeSettings.rowGap}
                unit="mm"
                min={0}
                max={10}
                step={0.5}
                onChange={(value) => updateSetting("rowGap", value)}
              />
              <ExpandableTriggerRow
                label="页边距"
                value={marginSummary}
                expanded={expandedPanel === "margin"}
                onToggle={() => togglePanel("margin")}
              />
              {expandedPanel === "margin" && (
                <div className="grid gap-2 py-2">
                  <div className="grid grid-cols-4 gap-2">
                    {(["top", "right", "bottom", "left"] as const).map(
                      (key) => (
                        <div key={key} className="space-y-1">
                          <div className="text-center text-[11px] text-muted-foreground">
                            {
                              {
                                top: "上",
                                right: "右",
                                bottom: "下",
                                left: "左",
                              }[key]
                            }
                          </div>
                          <Input
                            type="number"
                            min={10}
                            max={100}
                            step={1}
                            value={safeSettings.margin[key]}
                            onChange={(e) =>
                              updateMargin(key, Number(e.target.value))
                            }
                            className="h-9 rounded-md border border-input bg-background px-2 text-center text-xs shadow-xs"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </PanelCard>
          )}

          <PanelCard>
            <FontPickerCard
              value={safeSettings.fontFamily}
              activeTab={fontTab}
              customLocalFont={customLocalFont}
              expanded={expandedPanel === "font"}
              commonOptions={COMMON_FONT_OPTIONS}
              localOptions={LOCAL_FONT_OPTIONS}
              onToggle={() => togglePanel("font")}
              onTabChange={setFontTab}
              onValueChange={(value: string) =>
                updateSetting("fontFamily", value)
              }
              onCustomLocalFontChange={setCustomLocalFont}
              onApplyCustomLocalFont={applyCustomLocalFont}
            />
            <CompactSelectRow
              label="字体粗细"
              value={safeSettings.fontWeight}
              options={[
                { value: "normal", label: "常规" },
                { value: "bold", label: "粗体" },
              ]}
              onValueChange={(value) =>
                updateSetting(
                  "fontWeight",
                  value as CopybookSettings["fontWeight"],
                )
              }
            />
            {isGridMode ? (
              <>
                <CompactSliderRow
                  label="字体大小"
                  value={safeSettings.fontScale}
                  unit="%"
                  min={30}
                  max={100}
                  step={1}
                  onChange={(value) => updateSetting("fontScale", value)}
                />
                <CompactSliderRow
                  label="上下偏移"
                  value={safeSettings.vOffset}
                  unit="%"
                  min={-30}
                  max={30}
                  step={1}
                  onChange={(value) => updateSetting("vOffset", value)}
                />
              </>
            ) : isLineMode ? (
              <>
                <CompactSliderRow
                  label="字号"
                  value={safeSettings.fontSize}
                  unit="px"
                  min={14}
                  max={48}
                  step={1}
                  onChange={(value) => updateSetting("fontSize", value)}
                />
                <CompactSliderRow
                  label="行距"
                  value={safeSettings.lineSpacing}
                  unit="px"
                  min={2}
                  max={40}
                  step={1}
                  onChange={(value) => updateSetting("lineSpacing", value)}
                />
              </>
            ) : null}
          </PanelCard>

          {isGridMode && (
            <PanelCard>
              <CompactSliderRow
                label="描红数量"
                value={safeSettings.solidCount}
                unit=""
                min={0}
                max={20}
                step={1}
                onChange={(value) => updateSetting("solidCount", value)}
              />
              <CompactColorRow
                label="描红颜色"
                value={safeSettings.miaoColor}
                expanded={expandedPanel === "miaoColor"}
                onToggle={() => togglePanel("miaoColor")}
                onChange={(value) => updateSetting("miaoColor", value)}
              />
              <CompactColorRow
                label="线条颜色"
                value={safeSettings.lineColor}
                expanded={expandedPanel === "lineColor"}
                onToggle={() => togglePanel("lineColor")}
                onChange={(value) => updateSetting("lineColor", value)}
              />
              {safeSettings.renderMode !== "miao" && (
                <CompactColorRow
                  label="字色"
                  value={safeSettings.color}
                  expanded={expandedPanel === "color"}
                  onToggle={() => togglePanel("color")}
                  onChange={(value) => updateSetting("color", value)}
                />
              )}
            </PanelCard>
          )}
        </aside>
      </div>
    </main>
  );
}

function PanelCard({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(Boolean);
  return (
    <div className="bg-background border-input flex flex-col rounded-md border px-3 py-[2px] shadow-xs">
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

function FontPickerCard({
  value,
  activeTab,
  customLocalFont,
  expanded,
  commonOptions,
  localOptions,
  onToggle,
  onTabChange,
  onValueChange,
  onCustomLocalFontChange,
  onApplyCustomLocalFont,
}: {
  value: string;
  activeTab: "common" | "local";
  customLocalFont: string;
  expanded: boolean;
  commonOptions: { value: string; label: string; preview: string }[];
  localOptions: { value: string; label: string; preview: string }[];
  onToggle: () => void;
  onTabChange: (tab: "common" | "local") => void;
  onValueChange: (value: string) => void;
  onCustomLocalFontChange: (value: string) => void;
  onApplyCustomLocalFont: () => void;
}) {
  const currentLabel = fontLabel(value);
  const options = activeTab === "common" ? commonOptions : localOptions;

  return (
    <div className="space-y-3 py-1">
      <button
        type="button"
        onClick={onToggle}
        className="flex h-9 w-full items-center justify-between gap-0.5 text-sm"
      >
        <div className="flex flex-1 items-center justify-between">
          <label className="max-w-[45%] truncate text-sm font-medium text-slate-700">
            字体
          </label>
          <div className="max-w-[55%] truncate text-sm text-slate-700">
            {currentLabel}
          </div>
        </div>
        <ChevronsUpDown className="size-4 flex-none shrink-0 opacity-50" />
      </button>

      {expanded && (
        <>
          <div className="grid grid-cols-2 rounded-lg bg-muted p-0.5">
            <button
              type="button"
              onClick={() => onTabChange("common")}
              className={`h-8 rounded-md text-sm font-medium transition-colors ${
                activeTab === "common"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground"
              }`}
            >
              常用字体
            </button>
            <button
              type="button"
              onClick={() => onTabChange("local")}
              className={`h-8 rounded-md text-sm font-medium transition-colors ${
                activeTab === "local"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground"
              }`}
            >
              本机字体
            </button>
          </div>

          <div className="max-h-44 overflow-y-auto rounded-md border border-input bg-background shadow-xs">
            {options.map((option) => {
              const selected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onValueChange(option.value)}
                  className={`flex w-full items-center justify-between border-b border-border px-3 py-2 text-left text-sm last:border-b-0 ${
                    selected
                      ? "bg-muted/50 text-foreground"
                      : "text-slate-700 hover:bg-accent"
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

          {activeTab === "local" && (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={customLocalFont}
                  onChange={(e) => onCustomLocalFontChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") onApplyCustomLocalFont();
                  }}
                  placeholder="输入本机字体名"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                />
                <Button
                  type="button"
                  onClick={onApplyCustomLocalFont}
                  variant="outline"
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
                >
                  应用
                </Button>
              </div>
              <p className="text-xs leading-5 text-muted-foreground">
                可输入系统已安装字体名，如“田英章楷书”“方正楷体”“AaKaiSong”。
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ExpandableTriggerRow({
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
    <button
      type="button"
      onClick={onToggle}
      className="flex h-9 w-full items-center justify-between gap-0.5 text-sm"
    >
      <div className="flex flex-1 items-center justify-between">
        <label className="max-w-[45%] truncate text-sm font-medium text-slate-700">
          {label}
        </label>
        <div className="max-w-[55%] truncate text-sm text-slate-700">
          {value}
        </div>
      </div>
      <ChevronsUpDown
        className={`size-4 flex-none shrink-0 opacity-50 transition-transform ${
          expanded ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}

function CompactSwitchRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex h-9 items-center justify-between text-sm">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="h-[1.15rem] w-8 shadow-xs"
      />
    </div>
  );
}

function CompactSelectRow({
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
    <div className="flex h-9 items-center justify-between text-sm">
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="relative h-9 w-full select-none gap-0.5 border-0 bg-transparent px-0 text-sm shadow-none outline-none">
          <div className="flex w-full items-center justify-between gap-1 text-sm">
            <label className="max-w-[45%] truncate text-sm font-medium text-slate-700">
              {label}
            </label>
            <div className="max-w-[50%] truncate">
              <span>{currentLabel}</span>
            </div>
          </div>
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

function CompactSliderRow({
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
    <div className="flex h-9 items-center gap-3 text-sm">
      <label className="min-w-14 text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="flex flex-1 items-center gap-1">
        <Slider
          value={[value]}
          onValueChange={([next]) => onChange(next)}
          min={min}
          max={max}
          step={step}
          className="flex-1"
        />
        <div className="max-w-12 min-w-4 overflow-x-hidden text-right text-xs tabular-nums">
          {display}
          {unit}
        </div>
      </div>
    </div>
  );
}

function CompactColorRow({
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
      <button
        type="button"
        onClick={onToggle}
        className="flex h-9 w-full items-center justify-between text-sm"
      >
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <span className="size-5 rounded" style={{ backgroundColor: value }} />
      </button>
      {expanded && (
        <div className="flex items-center gap-2 pb-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 w-10 cursor-pointer rounded-md border border-input bg-background p-1"
          />
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs"
          />
        </div>
      )}
    </div>
  );
}
