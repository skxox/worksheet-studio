"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Check, Download } from "lucide-react";
import { PreviewCanvas } from "@/components/common/PreviewCanvas";
import { SettingsPanel } from "@/components/common/SettingsPanel";
import { PrintCanvasButton } from "@/components/workspace/PrintCanvasButton";
import { Button } from "@/components/ui/button";
import { useCanvas } from "@/hooks/useCanvas";
import { useExport } from "@/hooks/useExport";
import { useFontLoader } from "@/hooks/useFontLoader";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useStrokeData } from "@/hooks/useStrokeData";
import { drawCopybook } from "@/lib/copybook";
import { fontMetrics } from "@/lib/fonts";
import type { PinyinToggleMarker } from "@/lib/copybook";
import { charAllPinyins } from "@/lib/pinyin";
import { getCanvasSize } from "@/lib/paper";
import {
  CopybookLeftNav,
  CopybookMobileTypeBar,
} from "../layout/copybook-left-nav";
import {
  COPYBOOK_TYPE_GROUPS,
  getCopybookTypeMeta,
} from "../../copybook-metadata";
import {
  CONTENT_PLACEHOLDERS,
  createDefaultSettings,
  VALID_GRID_TYPES,
  VALID_RENDER_MODES,
  type StrokeDraftRow,
} from "../../copybook-config";
import type { CopybookSettings, CopybookType, Margin } from "@/types";
import {
  getContentPreview,
  sanitizeCopybookSettings,
} from "./copybook-workbench.helpers";
import type { ExpandedPanelKey } from "../panels/copybook-settings-panels";
import { getCopybookTemplate } from "./copybook-template-resolver";

export function CopybookWorkbenchShell({
  initialType = "character",
}: {
  initialType?: CopybookType;
}) {
  const initialSettings = useMemo(
    () => createDefaultSettings(initialType),
    [initialType],
  );
  const settingsStorageKey = `ws:copybook:${initialType}`;
  const [settings, setSettings] = usePersistentState<CopybookSettings>(
    settingsStorageKey,
    initialSettings,
  );
  // #region debug-point A:workbench-client-mount
  useEffect(() => {}, [initialType]);
  // #endregion
  useEffect(() => {
    if (initialType !== "number") return;

    const migrationKey = `${settingsStorageKey}:center-offset-v1`;
    try {
      if (localStorage.getItem(migrationKey)) return;

      const storedSettings = localStorage.getItem(settingsStorageKey);
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings) as Partial<CopybookSettings>;
        const hasLegacyNumberDefaults =
          parsed.vOffset === 20 &&
          parsed.fontScale === 85 &&
          parsed.fontSize === 28 &&
          parsed.gridSize === 10 &&
          parsed.rowGap === 2;
        if (hasLegacyNumberDefaults) {
          setSettings((current) =>
            current.vOffset === 20 ? { ...current, vOffset: 0 } : current,
          );
        }
      }
      localStorage.setItem(migrationKey, "1");
    } catch {
      /* Keep the current settings if storage is unavailable. */
    }
  }, [initialType, setSettings, settingsStorageKey]);
  const safeSettings = useMemo<CopybookSettings>(
    () =>
      sanitizeCopybookSettings(
        settings,
        initialType,
        initialSettings,
        VALID_GRID_TYPES,
        VALID_RENDER_MODES,
      ),
    [initialSettings, initialType, settings],
  );
  const [customLocalFont, setCustomLocalFont] = useState(() => {
    const initialFont =
      typeof settings.fontFamily === "string" ? settings.fontFamily : "";
    return initialFont.startsWith("local:")
      ? initialFont.slice("local:".length)
      : "";
  });
  const [expandedPanel, setExpandedPanel] = useState<ExpandedPanelKey>(null);

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
    if (key === "fontFamily" && typeof value === "string") {
      // 切换字体时套用该款的标定字号：手写字体字面率不同，按各自 scale%
      // 渲染才能充满格面（offset 修正已在绘制层生效）
      const { scale } = fontMetrics(value);
      setSettings((prev) =>
        scale
          ? { ...prev, fontFamily: value, fontScale: scale }
          : { ...prev, fontFamily: value },
      );
      return;
    }
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
    updateSetting("fontFamily", `local:${name}`);
  };
  const togglePanel = (panel: Exclude<ExpandedPanelKey, null>) => {
    setExpandedPanel((prev) => (prev === panel ? null : panel));
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
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!p || !rect) return;
    const hit = hitTestToggle(p);
    if (!hit) return;
    setPinyinMenu({
      char: hit.char,
      left: rect.left + (hit.x / canvasSize.width) * rect.width,
      top: rect.top + ((hit.y + hit.h) / canvasSize.height) * rect.height,
    });
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
  const marginSummary = `${safeSettings.margin.top}, ${safeSettings.margin.right}, ${safeSettings.margin.bottom}, ${safeSettings.margin.left}`;
  const pinyinReadings = pinyinMenu ? charAllPinyins(pinyinMenu.char) : [];
  const pinyinCurrent = pinyinMenu
    ? (safeSettings.pinyinOverrides[pinyinMenu.char] ?? 0)
    : 0;
  const activeLabel = getCopybookTypeMeta(t).label;

  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [draftContent, setDraftContent] = useState("");
  const [strokeRows, setStrokeRows] = useState<StrokeDraftRow[]>([]);
  const openContentEditor = () => {
    const nextState = getCopybookTemplate(t).getEditorState(
      safeSettings.content,
    );
    setDraftContent(nextState.draftContent);
    setStrokeRows(nextState.strokeRows);
    setContentModalOpen(true);
  };
  const contentPreview = getContentPreview(t, safeSettings.content, strokeRows);
  const template = getCopybookTemplate(t);
  const ContentCard = template.ContentCard;
  const Sidebar = template.Sidebar;
  const ContentModal = template.ContentModal;

  return (
    <main className="bg-muted/40 flex min-h-0 flex-1 overflow-hidden">
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="print-none shrink-0">
          <CopybookLeftNav groups={COPYBOOK_TYPE_GROUPS} currentType={t} />
          <CopybookMobileTypeBar
            groups={COPYBOOK_TYPE_GROUPS}
            currentType={t}
            className="px-4 pt-3"
          />
        </div>
        <PreviewCanvas
          canvasRef={canvasRef}
          className="p-4 sm:p-6"
          canvasProps={{
            id: "paper-canvas-0",
            className: "paper-canvas print-page",
            onClick: handleCanvasClick,
            onMouseMove: handleCanvasMove,
          }}
        />

        {pinyinMenu ? (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setPinyinMenu(null)}
              aria-hidden
            />
            <div
              role="listbox"
              aria-label={`${pinyinMenu.char} 的读音`}
              className="border-input bg-background fixed z-50 min-w-28 overflow-hidden rounded-md border p-1 shadow-lg"
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
                  {i === pinyinCurrent ? (
                    <Check className="text-primary h-3.5 w-3.5" />
                  ) : null}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </section>

      <SettingsPanel>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-display-sm truncate">{activeLabel}</h1>
          <span className="text-muted-foreground shrink-0 text-xs">
            字帖工坊
          </span>
        </div>
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
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <PrintCanvasButton
            canvasRef={canvasRef}
            title="打印字帖"
            variant="default"
            className="flex-1"
          />
        </div>

        {ContentCard ? (
          <ContentCard
            type={t}
            label={activeLabel}
            content={template.getCardContent(
              safeSettings.content,
              contentPreview,
            )}
            placeholder={CONTENT_PLACEHOLDERS[t]}
            onEdit={openContentEditor}
            onContentChange={(value) => {
              updateSetting("content", value);
            }}
          />
        ) : null}

        {Sidebar ? (
          <Sidebar
            type={t}
            settings={safeSettings}
            marginSummary={marginSummary}
            expandedPanel={expandedPanel}
            togglePanel={togglePanel}
            updateSetting={updateSetting}
            updateMargin={updateMargin}
            customLocalFont={customLocalFont}
            onCustomLocalFontChange={setCustomLocalFont}
            onApplyCustomLocalFont={applyCustomLocalFont}
          />
        ) : null}
      </SettingsPanel>

      {ContentModal ? (
        <ContentModal
          type={t}
          title={activeLabel}
          open={contentModalOpen}
          placeholder={CONTENT_PLACEHOLDERS[t]}
          draftContent={draftContent}
          strokeRows={strokeRows}
          onClose={() => setContentModalOpen(false)}
          onDraftChange={setDraftContent}
          onStrokeRowsChange={setStrokeRows}
          onSave={() => {
            updateSetting(
              "content",
              template.serializeContent(draftContent, strokeRows),
            );
            setContentModalOpen(false);
          }}
        />
      ) : null}
    </main>
  );
}
