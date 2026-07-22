"use client";

import { Input } from "@/components/ui/input";
import {
  COMMON_FONT_OPTIONS,
  GRID_SIZES,
  GRID_TYPES,
  type RenderMode,
} from "../../copybook-config";
import {
  Collapse,
  CompactColorRow,
  CompactSelectRow,
  CompactSliderRow,
  CompactSwitchRow,
  ExpandableTriggerRow,
  FontPickerCard,
  PanelCard,
} from "../primitives/copybook-controls";
import type { CopybookSettings, GridType, Margin } from "@/types";

export type ExpandedPanelKey =
  | null
  | "font"
  | "margin"
  | "miaoColor"
  | "lineColor"
  | "color"
  | "highlightColor";

function MarginEditor({
  margin,
  updateMargin,
}: {
  margin: Margin;
  updateMargin: (key: keyof Margin, value: number) => void;
}) {
  return (
    <div className="grid gap-2 py-2">
      <div className="grid grid-cols-4 gap-2">
        {(["top", "right", "bottom", "left"] as const).map((key) => (
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
              value={margin[key]}
              onChange={(e) => updateMargin(key, Number(e.target.value))}
              className="border-input bg-background h-9 rounded-md border px-2 text-center text-xs shadow-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ToggleSettingsPanel({
  showStrokeSwitch,
  showPinyinToggle,
  showHighlightToggle,
  showInsertEmptyRow,
  showInsertEmptyCol,
  settings,
  updateSetting,
}: {
  showStrokeSwitch: boolean;
  showPinyinToggle: boolean;
  showHighlightToggle: boolean;
  showInsertEmptyRow: boolean;
  showInsertEmptyCol: boolean;
  settings: CopybookSettings;
  updateSetting: <K extends keyof CopybookSettings>(
    key: K,
    value: CopybookSettings[K],
  ) => void;
}) {
  return (
    <PanelCard>
      {showStrokeSwitch && (
        <CompactSwitchRow
          label="显示笔顺"
          checked={settings.showStroke}
          onCheckedChange={(value) => updateSetting("showStroke", value)}
        />
      )}
      {showPinyinToggle && (
        <CompactSwitchRow
          label="显示拼音"
          checked={settings.showPinyin}
          onCheckedChange={(value) => updateSetting("showPinyin", value)}
        />
      )}
      {showHighlightToggle && (
        <CompactSwitchRow
          label="首字高亮"
          checked={settings.highlightFirst}
          onCheckedChange={(value) => updateSetting("highlightFirst", value)}
        />
      )}
      {showInsertEmptyRow && (
        <CompactSwitchRow
          label="插入空行"
          checked={settings.insertEmptyRow}
          onCheckedChange={(value) => updateSetting("insertEmptyRow", value)}
        />
      )}
      {showInsertEmptyCol && (
        <CompactSwitchRow
          label="插入空列"
          checked={settings.insertEmptyCol}
          onCheckedChange={(value) => updateSetting("insertEmptyCol", value)}
        />
      )}
    </PanelCard>
  );
}

export function GridSettingsPanel({
  settings,
  marginSummary,
  expandedPanel,
  togglePanel,
  updateSetting,
  updateMargin,
}: {
  settings: CopybookSettings;
  marginSummary: string;
  expandedPanel: ExpandedPanelKey;
  togglePanel: (panel: Exclude<ExpandedPanelKey, null>) => void;
  updateSetting: <K extends keyof CopybookSettings>(
    key: K,
    value: CopybookSettings[K],
  ) => void;
  updateMargin: (key: keyof Margin, value: number) => void;
}) {
  return (
    <PanelCard>
      <CompactSelectRow
        label="方格类型"
        value={settings.gridType}
        options={GRID_TYPES.map((item) => ({
          value: item.value,
          label: item.label,
        }))}
        onValueChange={(value) => updateSetting("gridType", value as GridType)}
      />
      <CompactSliderRow
        label="方格大小"
        value={settings.gridSize}
        unit="mm"
        min={GRID_SIZES[0]}
        max={GRID_SIZES[GRID_SIZES.length - 1]}
        step={1}
        onChange={(value) => updateSetting("gridSize", value)}
      />
      <CompactSliderRow
        label="行间距"
        value={settings.rowGap}
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
      <Collapse open={expandedPanel === "margin"}>
        <MarginEditor margin={settings.margin} updateMargin={updateMargin} />
      </Collapse>
    </PanelCard>
  );
}

export function NumberSettingsPanel({
  settings,
  marginSummary,
  expandedPanel,
  togglePanel,
  updateSetting,
  updateMargin,
}: {
  settings: CopybookSettings;
  marginSummary: string;
  expandedPanel: ExpandedPanelKey;
  togglePanel: (panel: Exclude<ExpandedPanelKey, null>) => void;
  updateSetting: <K extends keyof CopybookSettings>(
    key: K,
    value: CopybookSettings[K],
  ) => void;
  updateMargin: (key: keyof Margin, value: number) => void;
}) {
  return (
    <PanelCard>
      <CompactSliderRow
        label="行高"
        value={settings.gridSize}
        unit="mm"
        min={8}
        max={20}
        step={1}
        onChange={(value) => updateSetting("gridSize", value)}
      />
      <CompactSliderRow
        label="行间距"
        value={settings.rowGap}
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
      <Collapse open={expandedPanel === "margin"}>
        <MarginEditor margin={settings.margin} updateMargin={updateMargin} />
      </Collapse>
    </PanelCard>
  );
}

export function LineSettingsPanel({
  settings,
  marginSummary,
  expandedPanel,
  togglePanel,
  updateSetting,
  updateMargin,
}: {
  settings: CopybookSettings;
  marginSummary: string;
  expandedPanel: ExpandedPanelKey;
  togglePanel: (panel: Exclude<ExpandedPanelKey, null>) => void;
  updateSetting: <K extends keyof CopybookSettings>(
    key: K,
    value: CopybookSettings[K],
  ) => void;
  updateMargin: (key: keyof Margin, value: number) => void;
}) {
  return (
    <PanelCard>
      <CompactSelectRow
        label="方格类型"
        value={settings.gridType}
        options={[{ value: "essay", label: "横线格" }]}
        onValueChange={(value) => updateSetting("gridType", value as GridType)}
      />
      <CompactSliderRow
        label="方格大小"
        value={settings.gridSize}
        unit="mm"
        min={8}
        max={20}
        step={1}
        onChange={(value) => updateSetting("gridSize", value)}
      />
      <CompactSliderRow
        label="字间距"
        value={settings.lineSpacing}
        unit="px"
        min={0}
        max={24}
        step={1}
        onChange={(value) => updateSetting("lineSpacing", value)}
      />
      <CompactSliderRow
        label="行间距"
        value={settings.rowGap}
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
      <Collapse open={expandedPanel === "margin"}>
        <MarginEditor margin={settings.margin} updateMargin={updateMargin} />
      </Collapse>
    </PanelCard>
  );
}

export function FontSettingsPanel({
  settings,
  customLocalFont,
  onCustomLocalFontChange,
  onApplyCustomLocalFont,
  updateSetting,
  mode,
}: {
  settings: CopybookSettings;
  customLocalFont: string;
  onCustomLocalFontChange: (value: string) => void;
  onApplyCustomLocalFont: () => void;
  updateSetting: <K extends keyof CopybookSettings>(
    key: K,
    value: CopybookSettings[K],
  ) => void;
  mode: "grid" | "line" | "english-grid";
}) {
  return (
    <PanelCard>
      <FontPickerCard
        value={settings.fontFamily}
        customLocalFont={customLocalFont}
        commonOptions={COMMON_FONT_OPTIONS}
        onValueChange={(value: string) => updateSetting("fontFamily", value)}
        onCustomLocalFontChange={onCustomLocalFontChange}
        onApplyCustomLocalFont={onApplyCustomLocalFont}
      />
      <CompactSelectRow
        label="字体粗细"
        value={settings.fontWeight}
        options={[
          { value: "normal", label: "常规" },
          { value: "bold", label: "粗体" },
        ]}
        onValueChange={(value) =>
          updateSetting("fontWeight", value as CopybookSettings["fontWeight"])
        }
      />
      {mode === "grid" && (
        <>
          <CompactSliderRow
            label="字体大小"
            value={settings.fontScale}
            unit="%"
            min={30}
            max={100}
            step={1}
            onChange={(value) => updateSetting("fontScale", value)}
          />
          <CompactSliderRow
            label="上下偏移"
            value={settings.vOffset}
            unit="%"
            min={-30}
            max={30}
            step={1}
            onChange={(value) => updateSetting("vOffset", value)}
          />
        </>
      )}
      {mode === "line" && (
        <>
          <CompactSliderRow
            label="字号"
            value={settings.fontSize}
            unit="px"
            min={14}
            max={48}
            step={1}
            onChange={(value) => updateSetting("fontSize", value)}
          />
          <CompactSliderRow
            label="行距"
            value={settings.lineSpacing}
            unit="px"
            min={2}
            max={40}
            step={1}
            onChange={(value) => updateSetting("lineSpacing", value)}
          />
        </>
      )}
      {mode === "english-grid" && (
        <CompactSliderRow
          label="字号"
          value={settings.fontSize}
          unit="px"
          min={14}
          max={48}
          step={1}
          onChange={(value) => updateSetting("fontSize", value)}
        />
      )}
    </PanelCard>
  );
}

export function RenderModeSettingsPanel({
  settings,
  expandedPanel,
  togglePanel,
  updateSetting,
  showHighlightToggle,
}: {
  settings: CopybookSettings;
  expandedPanel: ExpandedPanelKey;
  togglePanel: (panel: Exclude<ExpandedPanelKey, null>) => void;
  updateSetting: <K extends keyof CopybookSettings>(
    key: K,
    value: CopybookSettings[K],
  ) => void;
  showHighlightToggle: boolean;
}) {
  return (
    <PanelCard>
      <CompactSelectRow
        label="字色模式"
        value={settings.renderMode}
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
        value={settings.solidCount}
        unit=""
        min={0}
        max={20}
        step={1}
        onChange={(value) => updateSetting("solidCount", value)}
      />
      {settings.renderMode === "miao" && showHighlightToggle && (
        <CompactSliderRow
          label="高亮数量"
          value={settings.highlightCount}
          unit=""
          min={1}
          max={5}
          step={1}
          onChange={(value) => updateSetting("highlightCount", value)}
        />
      )}
      <CompactColorRow
        label="描红颜色"
        value={settings.miaoColor}
        expanded={expandedPanel === "miaoColor"}
        onToggle={() => togglePanel("miaoColor")}
        onChange={(value) => updateSetting("miaoColor", value)}
      />
      {settings.renderMode === "miao" && (
        <CompactColorRow
          label="高亮颜色"
          value={settings.highlightColor}
          expanded={expandedPanel === "highlightColor"}
          onToggle={() => togglePanel("highlightColor")}
          onChange={(value) => updateSetting("highlightColor", value)}
        />
      )}
      <CompactColorRow
        label="线条颜色"
        value={settings.lineColor}
        expanded={expandedPanel === "lineColor"}
        onToggle={() => togglePanel("lineColor")}
        onChange={(value) => updateSetting("lineColor", value)}
      />
      {settings.renderMode !== "miao" && (
        <CompactColorRow
          label="字色"
          value={settings.color}
          expanded={expandedPanel === "color"}
          onToggle={() => togglePanel("color")}
          onChange={(value) => updateSetting("color", value)}
        />
      )}
    </PanelCard>
  );
}

export function NumberTraceSettingsPanel({
  settings,
  expandedPanel,
  togglePanel,
  updateSetting,
}: {
  settings: CopybookSettings;
  expandedPanel: ExpandedPanelKey;
  togglePanel: (panel: Exclude<ExpandedPanelKey, null>) => void;
  updateSetting: <K extends keyof CopybookSettings>(
    key: K,
    value: CopybookSettings[K],
  ) => void;
}) {
  return (
    <PanelCard>
      <CompactSliderRow
        label="描红数量"
        value={settings.solidCount}
        unit=""
        min={0}
        max={20}
        step={1}
        onChange={(value) => updateSetting("solidCount", value)}
      />
      <CompactColorRow
        label="描红颜色"
        value={settings.miaoColor}
        expanded={expandedPanel === "miaoColor"}
        onToggle={() => togglePanel("miaoColor")}
        onChange={(value) => updateSetting("miaoColor", value)}
      />
      <CompactColorRow
        label="线条颜色"
        value={settings.lineColor}
        expanded={expandedPanel === "lineColor"}
        onToggle={() => togglePanel("lineColor")}
        onChange={(value) => updateSetting("lineColor", value)}
      />
    </PanelCard>
  );
}
