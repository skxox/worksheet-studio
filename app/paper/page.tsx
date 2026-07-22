"use client";

import { useCallback } from "react";
import { Printer } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { SliderRow } from "@/components/common/SliderRow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ExportPanel } from "@/components/common/ExportPanel";
import { PreviewCanvas } from "@/components/common/PreviewCanvas";
import { SettingGroup } from "@/components/common/SettingGroup";
import { SettingsPanel } from "@/components/common/SettingsPanel";
import { useCanvas } from "@/hooks/useCanvas";
import { useExport } from "@/hooks/useExport";
import { usePersistentState } from "@/hooks/usePersistentState";
import {
  drawPaper,
  getCanvasSize,
  PAPER_SIZES,
  PAPER_THEMES,
} from "@/lib/paper";
import { paperToSvg } from "@/lib/svg";
import { renderAtScale } from "@/lib/canvas";
import { exportCanvasesToPDF } from "@/lib/pdf";
import type { Margin, PaperSettings, PaperType } from "@/types";

const PAPER_TYPES: { value: PaperType; label: string }[] = [
  { value: "grid", label: "方格纸" },
  { value: "line", label: "横线纸" },
  { value: "dot", label: "点阵纸" },
  { value: "cornell", label: "康奈尔笔记" },
  { value: "staff", label: "五线谱" },
  { value: "tian", label: "田字格" },
  { value: "mi", label: "米字格" },
  { value: "huigong", label: "回宫格" },
  { value: "pinyin", label: "拼音格" },
  { value: "essay", label: "作文格" },
];

const THEMES = [
  { value: "default", label: "默认主题" },
  { value: "warm", label: "暖色护眼" },
  { value: "cool", label: "冷色清爽" },
] as const;

const DEFAULT_SETTINGS: PaperSettings = {
  type: "grid",
  size: PAPER_SIZES[0],
  gridSize: 5,
  lineColor: PAPER_THEMES.default.line,
  lineStyle: "solid",
  lineWidth: 0.5,
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
  theme: "default",
  bgColor: "#ffffff",
  texture: "none",
  watermark: "",
  watermarkColor: "#9ca3af",
  showPageNumber: false,
  pageCount: 1,
};

export default function PaperPage() {
  const [settings, setSettings] = usePersistentState<PaperSettings>(
    "ws:paper",
    DEFAULT_SETTINGS,
  );
  const { exportPNG, exportSVG } = useExport();
  const canvasSize = getCanvasSize(settings.size);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      drawPaper(ctx, width, height, settings, 1, settings.pageCount);
    },
    [settings],
  );

  const { canvasRef } = useCanvas({
    width: canvasSize.width,
    height: canvasSize.height,
    onDraw: draw,
  });

  const updateSetting = <K extends keyof PaperSettings>(
    key: K,
    value: PaperSettings[K],
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateMargin = (key: keyof Margin, value: number) => {
    setSettings((prev) => ({
      ...prev,
      margin: { ...prev.margin, [key]: value },
    }));
  };

  const changeTheme = (theme: PaperSettings["theme"]) => {
    setSettings((prev) => ({
      ...prev,
      theme,
      lineColor: PAPER_THEMES[theme].line,
      bgColor: PAPER_THEMES[theme].bg,
    }));
  };

  const renderPage = (pageIndex: number) =>
    renderAtScale(
      (ctx, w, h) =>
        drawPaper(ctx, w, h, settings, pageIndex, settings.pageCount),
      canvasSize.width,
      canvasSize.height,
      2,
    );

  const handlePrint = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const w = window.open("", "_blank", "width=900,height=1200");
    if (!w) return;
    w.document.write(
      `<html><head><title>打印纸张</title><style>body{margin:0;display:flex;justify-content:center}img{max-width:100%}</style></head><body><img src="${url}" onload="window.focus();window.print()"/></body></html>`,
    );
    w.document.close();
  };

  return (
    <main className="flex min-h-0 flex-1 overflow-hidden">
      <PreviewCanvas canvasRef={canvasRef} />

      <SettingsPanel>
        <div className="flex items-center justify-between">
          <h1 className="text-display-sm">纸张工厂</h1>
          <Button onClick={handlePrint} variant="ghost" size="sm">
            <Printer className="mr-1 h-4 w-4" />
            打印
          </Button>
        </div>

        <ExportPanel
          onPDF={() => {
            const pages = Array.from({ length: settings.pageCount }, (_, i) =>
              renderPage(i + 1),
            );
            exportCanvasesToPDF(pages, "paper.pdf", settings.size);
          }}
          onPNG={() => exportPNG(renderPage(1), "paper.png")}
          onSVG={() => exportSVG(paperToSvg(settings), "paper.svg")}
          showSVG
        />

        <Separator />

        <SettingGroup title="纸张">
          <div className="space-y-2">
            <Label>纸张类型</Label>
            <Select
              value={settings.type}
              onValueChange={(v) => updateSetting("type", v as PaperType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>纸张尺寸</Label>
            <Select
              value={settings.size.name}
              onValueChange={(v) => {
                const size = PAPER_SIZES.find((s) => s.name === v);
                if (size) updateSetting("size", size);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_SIZES.map((s) => (
                  <SelectItem key={s.name} value={s.name}>
                    {s.name}（{s.width} × {s.height} mm）
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>主题</Label>
            <Select
              value={settings.theme}
              onValueChange={(v) => changeTheme(v as PaperSettings["theme"])}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {THEMES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </SettingGroup>

        <SettingGroup title="网格 / 线条">
          <div className="space-y-2">
            <Label>格子大小（mm）</Label>
            <Input
              type="number"
              value={settings.gridSize}
              onChange={(e) =>
                updateSetting("gridSize", Number(e.target.value))
              }
              min={1}
              max={50}
              step={0.5}
            />
            <p className="text-muted-foreground text-[10px] leading-none">
              常用 5mm（田字格）/ 8mm（横线纸）
            </p>
          </div>

          <div className="space-y-2">
            <Label>线条样式</Label>
            <Select
              value={settings.lineStyle}
              onValueChange={(v) =>
                updateSetting("lineStyle", v as PaperSettings["lineStyle"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solid">实线</SelectItem>
                <SelectItem value="dashed">虚线</SelectItem>
                <SelectItem value="dotted">点线</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <SliderRow
            label="线条粗细"
            value={settings.lineWidth}
            onChange={(v) => updateSetting("lineWidth", v)}
            min={0.1}
            max={3}
            step={0.1}
            unit="px"
            minLabel="细"
            maxLabel="粗"
            recommend={0.5}
          />

          <div className="space-y-2">
            <Label>线条颜色</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.lineColor}
                onChange={(e) => updateSetting("lineColor", e.target.value)}
                className="border-input h-9 w-12 cursor-pointer rounded-md border bg-transparent"
              />
              <Input
                value={settings.lineColor}
                onChange={(e) => updateSetting("lineColor", e.target.value)}
              />
            </div>
          </div>
        </SettingGroup>

        <SettingGroup title="背景与水印">
          <ColorRow
            label="背景颜色"
            value={settings.bgColor}
            onChange={(v) => updateSetting("bgColor", v)}
          />
          <div className="space-y-2">
            <Label>背景纹理</Label>
            <Select
              value={settings.texture}
              onValueChange={(v) =>
                updateSetting("texture", v as PaperSettings["texture"])
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">无</SelectItem>
                <SelectItem value="fiber">细纹</SelectItem>
                <SelectItem value="parchment">仿羊皮纸</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>水印文字</Label>
            <Input
              value={settings.watermark}
              onChange={(e) => updateSetting("watermark", e.target.value)}
              placeholder="如：姓名 / 专属标记"
            />
          </div>
          <ColorRow
            label="水印颜色"
            value={settings.watermarkColor}
            onChange={(v) => updateSetting("watermarkColor", v)}
          />
          <SliderRow
            label="页数"
            value={settings.pageCount}
            onChange={(v) => updateSetting("pageCount", v)}
            min={1}
            max={10}
            step={1}
            unit="页"
          />
          <div className="flex items-center justify-between">
            <Label htmlFor="pn">显示页码</Label>
            <Switch
              id="pn"
              checked={settings.showPageNumber}
              onCheckedChange={(v) => updateSetting("showPageNumber", v)}
            />
          </div>
        </SettingGroup>

        <SettingGroup title="边距（mm）">
          <div className="grid grid-cols-2 gap-2">
            {(["top", "right", "bottom", "left"] as const).map((k) => (
              <div key={k} className="space-y-1">
                <Label className="text-muted-foreground text-xs">
                  {{ top: "上", right: "右", bottom: "下", left: "左" }[k]}
                </Label>
                <Input
                  type="number"
                  value={settings.margin[k]}
                  onChange={(e) => updateMargin(k, Number(e.target.value))}
                  min={0}
                  step={1}
                />
              </div>
            ))}
          </div>
        </SettingGroup>
      </SettingsPanel>
    </main>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="border-input h-9 w-12 cursor-pointer rounded-md border bg-transparent"
        />
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      </div>
    </div>
  );
}
