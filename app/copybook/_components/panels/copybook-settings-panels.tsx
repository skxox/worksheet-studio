"use client";

import { Input } from "@/components/ui/input";
import {
  COMMON_FONT_OPTIONS,
  GRID_SIZES,
  GRID_TYPES,
  PINYIN_FONT_OPTIONS,
  fontOptionsForType,
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
import {
  ControlTraceWeight,
  type CopybookSettings,
  type GridType,
  type Margin,
} from "@/types";

export type ExpandedPanelKey =
  | null
  | "font"
  | "margin"
  | "miaoColor"
  | "lineColor"
  | "color"
  | "highlightColor";

export function MarginEditor({
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
              className="border-input bg-background shadow-1 h-9 rounded-md border px-2 text-center text-xs"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ControlSettingsPanel({
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
    <>
      <PanelCard>
        <CompactSliderRow
          label="方格大小"
          value={settings.gridSize}
          unit="mm"
          min={5}
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
      <PanelCard>
        <CompactColorRow
          label="方格颜色"
          value={settings.lineColor}
          expanded={expandedPanel === "lineColor"}
          onToggle={() => togglePanel("lineColor")}
          onChange={(value) => updateSetting("lineColor", value)}
        />
        <CompactColorRow
          label="描红颜色"
          value={settings.miaoColor}
          expanded={expandedPanel === "miaoColor"}
          onToggle={() => togglePanel("miaoColor")}
          onChange={(value) => updateSetting("miaoColor", value)}
        />
        <CompactSelectRow
          label="描红粗细"
          value={settings.controlTraceWeight}
          options={[
            { value: ControlTraceWeight.Normal, label: "常规" },
            { value: ControlTraceWeight.Bold, label: "加粗" },
          ]}
          onValueChange={(value) =>
            updateSetting("controlTraceWeight", value as ControlTraceWeight)
          }
        />
        <CompactSliderRow
          label="描红数量"
          value={settings.solidCount}
          unit=""
          min={0}
          max={100}
          step={1}
          onChange={(value) => updateSetting("solidCount", value)}
        />
        <CompactSwitchRow
          label="插入空行"
          checked={settings.insertEmptyRow}
          onCheckedChange={(value) => updateSetting("insertEmptyRow", value)}
        />
      </PanelCard>
    </>
  );
}

export function ToggleSettingsPanel({
  showStrokeSwitch,
  showPinyinToggle,
  showHighlightToggle,
  showLetterCasePair = false,
  showInsertEmptyRow,
  showInsertEmptyCol,
  settings,
  updateSetting,
}: {
  showStrokeSwitch: boolean;
  showPinyinToggle: boolean;
  showHighlightToggle: boolean;
  showLetterCasePair?: boolean;
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
      {showLetterCasePair && (
        <CompactSwitchRow
          label="大小写成对"
          checked={settings.pairLetterCase}
          onCheckedChange={(value) => updateSetting("pairLetterCase", value)}
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

export function PracticeRowSettingsPanel({
  settings,
  marginSummary,
  expandedPanel,
  togglePanel,
  updateSetting,
  updateMargin,
  gridLabel,
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
  gridLabel?: string;
}) {
  return (
    <PanelCard>
      {gridLabel ? (
        <div className="flex h-9 items-center justify-between text-sm">
          <span className="text-muted-foreground">方格类型</span>
          <span>{gridLabel}</span>
        </div>
      ) : null}
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
  gridOptions = [{ value: "line", label: "横线格" }],
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
  gridOptions?: { value: string; label: string }[];
}) {
  return (
    <PanelCard>
      <CompactSelectRow
        label="方格类型"
        value={settings.gridType}
        options={gridOptions}
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
      {settings.gridType !== "line" && (
        <CompactSliderRow
          label="行间距"
          value={settings.rowGap}
          unit="mm"
          min={0}
          max={10}
          step={0.5}
          onChange={(value) => updateSetting("rowGap", value)}
        />
      )}
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
  // 按模板类型过滤字体列表（中文/英文/数字各见其类）；当前值若不在列表中则追加，
  // 避免历史持久化设置在切换模板后选项“消失”
  const typeFontOptions = fontOptionsForType(settings.type);
  const commonOptions = typeFontOptions.some(
    (option) => option.value === settings.fontFamily,
  )
    ? typeFontOptions
    : [
        ...typeFontOptions,
        ...COMMON_FONT_OPTIONS.filter(
          (option) => option.value === settings.fontFamily,
        ),
      ];

  return (
    <PanelCard>
      <FontPickerCard
        value={settings.fontFamily}
        customLocalFont={customLocalFont}
        commonOptions={commonOptions}
        onValueChange={(value: string) => updateSetting("fontFamily", value)}
        onCustomLocalFontChange={onCustomLocalFontChange}
        onApplyCustomLocalFont={onApplyCustomLocalFont}
      />
      {(settings.type === "pinyin" || settings.showPinyin) && (
        <CompactSelectRow
          label="拼音字体"
          value={settings.pinyinFont ?? "py1"}
          options={PINYIN_FONT_OPTIONS}
          onValueChange={(value) => updateSetting("pinyinFont", value)}
        />
      )}
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
      {(mode === "grid" || mode === "english-grid") && (
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
