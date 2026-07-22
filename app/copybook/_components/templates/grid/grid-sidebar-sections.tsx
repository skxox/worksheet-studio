"use client";

import { getCopybookCapabilities } from "../../../copybook-metadata";
import {
  FontSettingsPanel,
  GridSettingsPanel,
  RenderModeSettingsPanel,
  ToggleSettingsPanel,
} from "../../panels/copybook-settings-panels";
import type { TemplateSidebarProps } from "../../workspace/copybook-template.types";

export function GridSidebarSections({
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
          showStrokeSwitch={capabilities.showStrokeSwitch}
          showPinyinToggle={capabilities.showPinyinToggle}
          showHighlightToggle={capabilities.showHighlightToggle}
          showInsertEmptyRow={capabilities.showInsertEmptyRow}
          showInsertEmptyCol={capabilities.showInsertEmptyCol}
          settings={settings}
          updateSetting={updateSetting}
        />
      ) : null}

      {capabilities.showGridControls ? (
        <GridSettingsPanel
          settings={settings}
          marginSummary={marginSummary}
          expandedPanel={expandedPanel}
          togglePanel={togglePanel}
          updateSetting={updateSetting}
          updateMargin={updateMargin}
        />
      ) : null}

      <FontSettingsPanel
        settings={settings}
        customLocalFont={customLocalFont}
        onCustomLocalFontChange={onCustomLocalFontChange}
        onApplyCustomLocalFont={onApplyCustomLocalFont}
        updateSetting={updateSetting}
        mode={capabilities.fontPanelMode}
      />

      {capabilities.showRenderModePanel ? (
        <RenderModeSettingsPanel
          settings={settings}
          expandedPanel={expandedPanel}
          togglePanel={togglePanel}
          updateSetting={updateSetting}
          showHighlightToggle={capabilities.showHighlightToggle}
        />
      ) : null}
    </>
  );
}
