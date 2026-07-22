"use client";

import React, {
  useCallback,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Check, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCanvas } from "@/hooks/useCanvas";
import { useExport } from "@/hooks/useExport";
import { useFontLoader } from "@/hooks/useFontLoader";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useStrokeData } from "@/hooks/useStrokeData";
import { drawCopybook } from "@/lib/copybook";
import type { PinyinToggleMarker } from "@/lib/copybook";
import { charAllPinyins } from "@/lib/pinyin";
import { getCanvasSize, PAPER_SIZES } from "@/lib/paper";
import { CopybookContentModal } from "./_components/copybook-content-modal";
import {
  CompactColorRow,
  CompactSelectRow,
  CompactSliderRow,
  CompactSwitchRow,
  ExpandableTriggerRow,
  FontPickerCard,
  PanelCard,
} from "./_components/copybook-controls";
import { CopybookLeftNav } from "./_components/copybook-left-nav";
import {
  COMMON_FONT_OPTIONS,
  CONTENT_PLACEHOLDERS,
  COPYBOOK_TYPE_GROUPS,
  COPYBOOK_TYPES,
  DEFAULT_CONTENT,
  DEFAULT_SETTINGS,
  GRID_SIZES,
  GRID_TYPES,
  parseStrokeContent,
  serializeStrokeContent,
  STROKE_PATTERN_OPTIONS,
  VALID_GRID_TYPES,
  VALID_RENDER_MODES,
  VALID_TYPES,
  type RenderMode,
  type StrokeDraftRow,
} from "./copybook-config";
import type {
  CopybookSettings,
  CopybookType,
  GridType,
  Margin,
  PaperSize,
} from "@/types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
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
  const base = DEFAULT_SETTINGS.margin;
  return {
    top: clamp(toFiniteNumber(value.top, base.top), 10, 100),
    right: clamp(toFiniteNumber(value.right, base.right), 10, 100),
    bottom: clamp(toFiniteNumber(value.bottom, base.bottom), 10, 100),
    left: clamp(toFiniteNumber(value.left, base.left), 10, 100),
  };
}

/** 校验多音字覆盖表：只保留“字 → 有限整数索引”的项 */
function resolvePinyinOverrides(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "number" && Number.isFinite(v)) {
      out[k] = Math.floor(v);
    }
  }
  return out;
}

export default function CopybookPage() {
  const [settings, setSettings] = usePersistentState<CopybookSettings>(
    "ws:copybook",
    DEFAULT_SETTINGS,
  );
  // safeSettings：对所有从 localStorage 反序列化回来的字段做类型/范围校验，
  // 避免脏数据（缺字段、NaN、越界、非法枚举）导致绘制崩溃或越界。
  const safeSettings = useMemo<CopybookSettings>(
    () => ({
      ...settings,
      type: VALID_TYPES.includes(settings.type as CopybookType)
        ? (settings.type as CopybookType)
        : "character",
      content: typeof settings.content === "string" ? settings.content : "",
      fontFamily:
        typeof settings.fontFamily === "string" ? settings.fontFamily : "kaiti",
      fontWeight: settings.fontWeight === "bold" ? "bold" : "normal",
      gridType: VALID_GRID_TYPES.includes(settings.gridType as GridType)
        ? (settings.gridType as GridType)
        : (settings.gridType as string) === "fang"
          ? "essay" // 老「方格」已合并为「作文格」（画法相同）
          : "tian",
      gridSize: clamp(toFiniteNumber(settings.gridSize, 10), 5, 40),
      rowGap: clamp(toFiniteNumber(settings.rowGap, 2), 0, 20),
      margin: resolveMargin(settings.margin),
      fontScale: clamp(toFiniteNumber(settings.fontScale, 68), 10, 150),
      fontSize: clamp(toFiniteNumber(settings.fontSize, 28), 8, 96),
      vOffset: clamp(toFiniteNumber(settings.vOffset, 0), -50, 50),
      renderMode: VALID_RENDER_MODES.includes(settings.renderMode as RenderMode)
        ? (settings.renderMode as RenderMode)
        : "miao",
      solidCount: clamp(toFiniteNumber(settings.solidCount, 20), 0, 100),
      miaoColor:
        typeof settings.miaoColor === "string" &&
        settings.miaoColor !== "#cfd5de" // 旧默认值迁移到新默认，避免老持久化数据盖回 #94a3b8
          ? settings.miaoColor
          : "#94a3b8",
      lineColor:
        typeof settings.lineColor === "string" ? settings.lineColor : "#98a5b9",
      color: typeof settings.color === "string" ? settings.color : "#1f2937",
      highlightColor:
        typeof settings.highlightColor === "string"
          ? settings.highlightColor
          : "#1f2937",
      showPinyin: settings.showPinyin !== false,
      showStroke: settings.showStroke === true,
      highlightFirst: settings.highlightFirst !== false,
      highlightCount: clamp(toFiniteNumber(settings.highlightCount, 1), 1, 5),
      insertEmptyRow: settings.insertEmptyRow === true,
      insertEmptyCol: settings.insertEmptyCol === true,
      pinyinOverrides: resolvePinyinOverrides(settings.pinyinOverrides),
      lineSpacing: clamp(toFiniteNumber(settings.lineSpacing, 12), 0, 80),
      paperSize: resolvePaperSize(settings.paperSize),
    }),
    [settings],
  );
  const [customLocalFont, setCustomLocalFont] = useState(() => {
    const initialFont =
      typeof settings.fontFamily === "string" ? settings.fontFamily : "";
    return initialFont.startsWith("local:")
      ? initialFont.slice("local:".length)
      : "";
  });
  const [expandedPanel, setExpandedPanel] = useState<
    | null
    | "font"
    | "margin"
    | "miaoColor"
    | "lineColor"
    | "color"
    | "highlightColor"
  >(null);

  // 自定义本机字体输入需跟随实际生效的 fontFamily。
  // useState 初始化只在挂载时跑一次（此时 localStorage 尚未载入），所以用 React
  // 官方“渲染期间按外部来源调整 state”的模式同步：当持久化字体变化（含挂载后载入）
  // 时重置自定义输入，避免输入框与实际字体不一致。
  const [syncedFont, setSyncedFont] = useState(settings.fontFamily);
  if (settings.fontFamily !== syncedFont) {
    setSyncedFont(settings.fontFamily);
    const f =
      typeof settings.fontFamily === "string" ? settings.fontFamily : "";
    setCustomLocalFont(f.startsWith("local:") ? f.slice("local:".length) : "");
  }

  const fontReady = useFontLoader(safeSettings.fontFamily);
  const strokesReady = useStrokeData(
    safeSettings.content,
    safeSettings.showStroke,
  );
  const { exportPDF } = useExport();
  const canvasSize = getCanvasSize(safeSettings.paperSize);

  // 多音字读音候选菜单：{ 字, 菜单左上角相对画布的坐标 }
  const [pinyinMenu, setPinyinMenu] = useState<{
    char: string;
    left: number;
    top: number;
  } | null>(null);

  // 多音字切换按钮的命中区：由 drawCopybook 在每次绘制时回填，点击事件据此命中检测
  const toggleMarkersRef = useRef<PinyinToggleMarker[]>([]);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      drawCopybook(ctx, width, height, safeSettings, toggleMarkersRef.current);
    },
    // fontReady / strokesReady 不参与绘制参数，仅作为重绘触发依赖：
    // 字体/笔顺数据就绪后由 useCanvas 自动重绘一次，避免手动 redraw 叠加成多次重绘。
    // 故 exhaustive-deps 视其为“多余依赖”，此处有意保留并放行。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeSettings, fontReady, strokesReady],
  );

  const { canvasRef } = useCanvas({
    width: canvasSize.width,
    height: canvasSize.height,
    onDraw: draw,
  });

  const updateSetting = <K extends keyof CopybookSettings>(
    key: K,
    value: CopybookSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };
  const changeType = (type: CopybookType) => {
    // 切换字帖类型时同步重置为该类型的默认内容，避免“汉字”内容留在“英文/控笔”模式里。
    setSettings((prev) => ({ ...prev, type, content: DEFAULT_CONTENT[type] }));
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
    updateSetting("fontFamily", `local:${name}`);
  };
  const togglePanel = (
    panel:
      | "font"
      | "margin"
      | "miaoColor"
      | "lineColor"
      | "color"
      | "highlightColor",
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

  // 把鼠标坐标换算成画布逻辑坐标（兼容 HiDPI / CSS 缩放）
  const eventToCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!canvas || !rect || rect.width === 0 || rect.height === 0) return null;
    return {
      x: ((e.clientX - rect.left) * canvasSize.width) / rect.width,
      y: ((e.clientY - rect.top) * canvasSize.height) / rect.height,
    };
  };

  const hitTestToggle = (p: { x: number; y: number }) =>
    toggleMarkersRef.current.find(
      (t) => p.x >= t.x && p.x <= t.x + t.w && p.y >= t.y && p.y <= t.y + t.h,
    );

  // 点击多音字按钮 → 在按钮下方弹出读音下拉框
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const p = eventToCanvasPoint(e);
    if (!p) return;
    const hit = hitTestToggle(p);
    if (!hit) return;
    setPinyinMenu({ char: hit.char, left: hit.x, top: hit.y + hit.h });
  };

  // 从下拉框里选定某字的一个读音
  const pickPinyin = (char: string, idx: number) => {
    setSettings((prev) => ({
      ...prev,
      pinyinOverrides: { ...(prev.pinyinOverrides ?? {}), [char]: idx },
    }));
    setPinyinMenu(null);
  };

  const handleCanvasMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const p = eventToCanvasPoint(e);
    canvas.style.cursor = p && hitTestToggle(p) ? "pointer" : "default";
  };

  const t = safeSettings.type;
  const isEnglishGridMode = t === "english-char" || t === "english-word";
  // 拼音类型在绘制端强制显示拼音，开关对它无效，故不展示，避免误导。
  const marginSummary = `${safeSettings.margin.top}, ${safeSettings.margin.right}, ${safeSettings.margin.bottom}, ${safeSettings.margin.left}`;
  const pinyinReadings = pinyinMenu ? charAllPinyins(pinyinMenu.char) : [];
  const pinyinCurrent = pinyinMenu
    ? (safeSettings.pinyinOverrides[pinyinMenu.char] ?? 0)
    : 0;
  const activeLabel =
    COPYBOOK_TYPES.find((item) => item.value === t)?.label ?? t;

  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [strokeRows, setStrokeRows] = useState<StrokeDraftRow[]>(() =>
    parseStrokeContent(DEFAULT_CONTENT.stroke),
  );
  const openContentEditor = () => {
    if (t === "stroke") {
      setStrokeRows(parseStrokeContent(safeSettings.content));
    } else {
      setDraftContent(safeSettings.content);
    }
    setContentModalOpen(true);
  };

  const isStrokeMode = t === "stroke";
  const showPinyinToggle = ["character", "word"].includes(t);
  const showGridControls = ["character", "word", "number", "pinyin"].includes(
    t,
  );
  const showLineControls = ["paragraph", "english-para"].includes(t);
  const showStrokeControls = t === "stroke";
  const showRenderModePanel = [
    "character",
    "word",
    "number",
    "pinyin",
    "stroke",
    "english-char",
    "english-word",
  ].includes(t);
  const showHighlightToggle = [
    "character",
    "word",
    "stroke",
    "english-char",
    "english-word",
  ].includes(t);
  const showInsertEmptyRow = [
    "character",
    "word",
    "paragraph",
    "english-word",
  ].includes(t);
  const showInsertEmptyCol = ["character", "word"].includes(t);
  const showStrokeSwitch = t === "character";
  const showSwitchPanel =
    showStrokeSwitch ||
    showPinyinToggle ||
    showHighlightToggle ||
    showInsertEmptyRow ||
    showInsertEmptyCol;
  const contentPreview = isStrokeMode
    ? strokeRows
        .map((row) => {
          const patternLabel =
            STROKE_PATTERN_OPTIONS.find((item) => item.value === row.pattern)
              ?.label ?? row.pattern;
          return row.example ? `${patternLabel} ${row.example}` : patternLabel;
        })
        .filter(Boolean)
        .slice(0, 3)
        .join(" / ")
    : safeSettings.content;

  return (
    <main
      className="relative bg-slate-100"
      style={{ minHeight: "calc(-122px + 100vh)" }}
    >
      <div
        className="print-out container mx-auto flex w-full max-w-(--content-width) gap-4 pt-5"
        style={{ "--content-width": "1090px" } as CSSProperties}
      >
        <CopybookLeftNav
          groups={COPYBOOK_TYPE_GROUPS}
          currentType={t}
          onChange={changeType}
        />

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
              className="pointer-events-none"
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
                  // 父级 #print-body 为 pointer-events:none，此处放开以接收多音字切换点击
                  pointerEvents: "auto",
                }}
                onClick={handleCanvasClick}
                onMouseMove={handleCanvasMove}
              />
            </div>
            {pinyinMenu && (
              <>
                {/* 点击外部关闭 */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setPinyinMenu(null)}
                  aria-hidden
                />
                {/* 读音下拉框：相对画布定位，随页面滚动 */}
                <div
                  role="listbox"
                  aria-label={`${pinyinMenu.char} 的读音`}
                  className="border-input bg-background absolute z-50 min-w-28 overflow-hidden rounded-md border p-1 shadow-lg"
                  style={{ left: pinyinMenu.left, top: pinyinMenu.top }}
                >
                  {pinyinReadings.map((py, i) => (
                    <button
                      key={py + i}
                      type="button"
                      role="option"
                      aria-selected={i === pinyinCurrent}
                      onClick={() => pickPinyin(pinyinMenu.char, i)}
                      className={`hover:bg-accent flex w-full items-center justify-between gap-3 rounded px-2 py-1.5 text-left text-sm transition-colors ${
                        i === pinyinCurrent
                          ? "bg-accent/60 text-foreground font-medium"
                          : "text-muted-foreground"
                      }`}
                    >
                      <span>{py}</span>
                      {i === pinyinCurrent && (
                        <Check className="text-primary h-3.5 w-3.5" />
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>

        <aside className="sticky top-16 flex max-h-[calc(100vh-80px)] w-58 min-w-50 shrink-0 scrollbar-thin flex-col gap-2 overflow-y-auto pb-4">
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
              className="bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-all"
            >
              <Download className="h-4 w-4" />导 出
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-all"
            >
              <Printer className="h-4 w-4" />打 印
            </Button>
          </div>

          {t !== "control" && (
            <PanelCard>
              <div className="flex h-8 items-center justify-between gap-2 pt-1">
                <div className="text-sm font-semibold text-slate-900">内容</div>
                <div className="max-w-24 truncate rounded-sm bg-slate-100 px-1.5 py-0.5 text-[10px] leading-none text-slate-500">
                  {activeLabel}
                </div>
              </div>
              <button
                type="button"
                onClick={openContentEditor}
                className="border-input bg-background mt-2 mb-1 flex w-full flex-col gap-1 rounded-md border px-3 py-2 text-left shadow-xs transition-colors hover:bg-slate-50"
              >
                <div className="text-xs text-slate-500">点击编辑</div>
                <div className="line-clamp-2 text-sm text-slate-700">
                  {(isStrokeMode
                    ? contentPreview
                    : safeSettings.content
                  )?.trim().length
                    ? isStrokeMode
                      ? contentPreview
                      : safeSettings.content
                    : CONTENT_PLACEHOLDERS[t]}
                </div>
              </button>
            </PanelCard>
          )}

          {showSwitchPanel && (
            <PanelCard>
              {showStrokeSwitch && (
                <CompactSwitchRow
                  label="显示笔顺"
                  checked={safeSettings.showStroke}
                  onCheckedChange={(value) =>
                    updateSetting("showStroke", value)
                  }
                />
              )}
              {showPinyinToggle && (
                <CompactSwitchRow
                  label="显示拼音"
                  checked={safeSettings.showPinyin}
                  onCheckedChange={(value) =>
                    updateSetting("showPinyin", value)
                  }
                />
              )}
              {showHighlightToggle && (
                <CompactSwitchRow
                  label="首字高亮"
                  checked={safeSettings.highlightFirst}
                  onCheckedChange={(value) =>
                    updateSetting("highlightFirst", value)
                  }
                />
              )}
              {showInsertEmptyRow && (
                <CompactSwitchRow
                  label="插入空行"
                  checked={safeSettings.insertEmptyRow}
                  onCheckedChange={(value) =>
                    updateSetting("insertEmptyRow", value)
                  }
                />
              )}
              {showInsertEmptyCol && (
                <CompactSwitchRow
                  label="插入空列"
                  checked={safeSettings.insertEmptyCol}
                  onCheckedChange={(value) =>
                    updateSetting("insertEmptyCol", value)
                  }
                />
              )}
            </PanelCard>
          )}

          {showGridControls && (
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
                          <div className="text-muted-foreground text-center text-[11px]">
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
                            className="border-input bg-background h-9 rounded-md border px-2 text-center text-xs shadow-xs"
                          />
                        </div>
                      ),
                    )}
                  </div>
                </div>
              )}
            </PanelCard>
          )}

          {showLineControls && (
            <PanelCard>
              <CompactSelectRow
                label="方格类型"
                value={safeSettings.gridType}
                options={[{ value: "essay", label: "横线格" }]}
                onValueChange={(value) =>
                  updateSetting("gridType", value as GridType)
                }
              />
              <CompactSliderRow
                label="方格大小"
                value={safeSettings.gridSize}
                unit="mm"
                min={8}
                max={20}
                step={1}
                onChange={(value) => updateSetting("gridSize", value)}
              />
              <CompactSliderRow
                label="字间距"
                value={safeSettings.lineSpacing}
                unit="px"
                min={0}
                max={24}
                step={1}
                onChange={(value) => updateSetting("lineSpacing", value)}
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
                          <div className="text-muted-foreground text-center text-[11px]">
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
                            className="border-input bg-background h-9 rounded-md border px-2 text-center text-xs shadow-xs"
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
              customLocalFont={customLocalFont}
              commonOptions={COMMON_FONT_OPTIONS}
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
            {showGridControls || showStrokeControls ? (
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
            ) : showLineControls ? (
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
            ) : isEnglishGridMode ? (
              <CompactSliderRow
                label="字号"
                value={safeSettings.fontSize}
                unit="px"
                min={14}
                max={48}
                step={1}
                onChange={(value) => updateSetting("fontSize", value)}
              />
            ) : null}
          </PanelCard>

          {showRenderModePanel && (
            <PanelCard>
              <CompactSelectRow
                label="字色模式"
                value={safeSettings.renderMode}
                options={[
                  { value: "miao", label: "描红" },
                  { value: "solid", label: "实心" },
                  { value: "hollow", label: "空心" },
                ]}
                onValueChange={(value) =>
                  updateSetting("renderMode", value as RenderMode)
                }
              />
              <CompactSliderRow
                label="描红数量"
                value={safeSettings.solidCount}
                unit=""
                min={0}
                max={20}
                step={1}
                onChange={(value) => updateSetting("solidCount", value)}
              />
              {safeSettings.renderMode === "miao" && showHighlightToggle && (
                <CompactSliderRow
                  label="高亮数量"
                  value={safeSettings.highlightCount}
                  unit=""
                  min={1}
                  max={5}
                  step={1}
                  onChange={(value) => updateSetting("highlightCount", value)}
                />
              )}
              <CompactColorRow
                label="描红颜色"
                value={safeSettings.miaoColor}
                expanded={expandedPanel === "miaoColor"}
                onToggle={() => togglePanel("miaoColor")}
                onChange={(value) => updateSetting("miaoColor", value)}
              />
              {safeSettings.renderMode === "miao" && (
                <CompactColorRow
                  label="高亮颜色"
                  value={safeSettings.highlightColor}
                  expanded={expandedPanel === "highlightColor"}
                  onToggle={() => togglePanel("highlightColor")}
                  onChange={(value) => updateSetting("highlightColor", value)}
                />
              )}
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

      <CopybookContentModal
        open={contentModalOpen}
        title={activeLabel}
        type={t}
        placeholder={CONTENT_PLACEHOLDERS[t]}
        draftContent={draftContent}
        strokeRows={strokeRows}
        onClose={() => setContentModalOpen(false)}
        onDraftChange={setDraftContent}
        onStrokeRowsChange={setStrokeRows}
        onSave={() => {
          updateSetting(
            "content",
            isStrokeMode ? serializeStrokeContent(strokeRows) : draftContent,
          );
          setContentModalOpen(false);
        }}
      />
    </main>
  );
}
