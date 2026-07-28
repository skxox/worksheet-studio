"use client";

import { getCopybookCapabilities } from "../../../copybook-metadata";
import { PARAGRAPH_GRID_TYPES } from "../../../copybook-config";
import {
  FontSettingsPanel,
  LineSettingsPanel,
  ToggleSettingsPanel,
} from "../../panels/copybook-settings-panels";
import type { TemplateSidebarProps } from "../../workspace/copybook-template.types";

export function LineSidebarSections({
  type,
  settings,
  marginSummary,
  expandedPanel,
  togglePanel,
  updateSetting,
  updateMargin,
  customLocalFont,
  onCustomLocalFontChange,
  onApplyCustomLocalFont,
}: TemplateSidebarProps) {
  const capabilities = getCopybookCapabilities(type);

  return (
    <>
      {capabilities.showSwitchPanel ? (
        <ToggleSettingsPanel
          showStrokeSwitch={false}
          showPinyinToggle={false}
          showHighlightToggle={false}
          showInsertEmptyRow={capabilities.showInsertEmptyRow}
          showInsertEmptyCol={false}
          settings={settings}
          updateSetting={updateSetting}
        />
      ) : null}

      <LineSettingsPanel
        settings={settings}
        marginSummary={marginSummary}
        expandedPanel={expandedPanel}
        togglePanel={togglePanel}
        updateSetting={updateSetting}
        updateMargin={updateMargin}
        // 篇章誊写可选多种方格；英文句段只保留横线格
        gridOptions={
          type === "paragraph"
            ? PARAGRAPH_GRID_TYPES
            : [{ value: "line", label: "横线格" }]
        }
      />

      <FontSettingsPanel
        settings={settings}
        customLocalFont={customLocalFont}
        onCustomLocalFontChange={onCustomLocalFontChange}
        onApplyCustomLocalFont={onApplyCustomLocalFont}
        updateSetting={updateSetting}
        // 篇章誊写字号用「字体大小 % + 上下偏移 %」（同方格模式）；英文句段保留 px 字号
        mode={type === "paragraph" ? "grid" : "line"}
      />
    </>
  );
}
