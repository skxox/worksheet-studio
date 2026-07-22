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
import { useCanvas } from "@/hooks/useCanvas";
import { useExport } from "@/hooks/useExport";
import { useFontLoader } from "@/hooks/useFontLoader";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useStrokeData } from "@/hooks/useStrokeData";
import { drawCopybook } from "@/lib/copybook";
import type { PinyinToggleMarker } from "@/lib/copybook";
import { charAllPinyins } from "@/lib/pinyin";
import { getCanvasSize } from "@/lib/paper";
import { CopybookLeftNav, CopybookMobileTypeBar } from "../layout/copybook-left-nav";
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
import {
  getCopybookTemplate,
} from "./copybook-template-resolver";

export function CopybookWorkbenchShell({
  initialType = "character",
}: {
  initialType?: CopybookType;
}) {
  const initialSettings = useMemo(
    () => createDefaultSettings(initialType),
    [initialType],
  );
  const [settings, setSettings] = usePersistentState<CopybookSettings>(
    `ws:copybook:${initialType}`,
    initialSettings,
  );
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
    const nextState = getCopybookTemplate(t).getEditorState(safeSettings.content);
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
    <main
      className="bg-muted/40 relative"
      style={{ minHeight: "calc(-122px + 100vh)" }}
    >
      <div
        className="print-out container mx-auto flex w-full max-w-(--content-width) flex-col gap-3 pt-5"
        style={{ "--content-width": "1090px" } as CSSProperties}
      >
        <CopybookMobileTypeBar
          groups={COPYBOOK_TYPE_GROUPS}
          currentType={t}
        />
        <div className="flex w-full gap-4">
          <CopybookLeftNav groups={COPYBOOK_TYPE_GROUPS} currentType={t} />

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
                className="paper-canvas print-page shadow-paper rounded-sm ring-1 ring-black/5"
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

        <aside className="glass-strong sticky top-16 flex max-h-[calc(100vh-80px)] w-58 min-w-50 shrink-0 flex-col gap-2 overflow-y-auto rounded-2xl p-2">
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
              className="bg-background hover:bg-accent hover:text-accent-foreground inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium whitespace-nowrap shadow-1 transition-all"
            >
              <Download className="h-4 w-4" />导 出
            </Button>
            <Button
              onClick={handlePrint}
              className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap shadow-1 transition-all"
            >
              <Printer className="h-4 w-4" />打 印
            </Button>
          </div>

          {ContentCard ? (
            <ContentCard
              type={t}
              label={activeLabel}
              content={template.getCardContent(safeSettings.content, contentPreview)}
              placeholder={CONTENT_PLACEHOLDERS[t]}
              onEdit={openContentEditor}
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
        </aside>
        </div>
      </div>

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
