"use client";

import {
  FontSettingsPanel,
  RenderModeSettingsPanel,
  ToggleSettingsPanel,
} from "../../panels/copybook-settings-panels";
import type { TemplateSidebarProps } from "../../workspace/copybook-template.types";

export function StrokeSidebarSections({
  settings,
  expandedPanel,
  togglePanel,
  updateSetting,
  customLocalFont,
  onCustomLocalFontChange,
  onApplyCustomLocalFont,
}: TemplateSidebarProps) {
  return (
    <>
      <ToggleSettingsPanel
        showStrokeSwitch={false}
        showPinyinToggle={false}
        showHighlightToggle
        showInsertEmptyRow={false}
        showInsertEmptyCol={false}
        settings={settings}
        updateSetting={updateSetting}
      />
      <FontSettingsPanel
        settings={settings}
        customLocalFont={customLocalFont}
        onCustomLocalFontChange={onCustomLocalFontChange}
        onApplyCustomLocalFont={onApplyCustomLocalFont}
        updateSetting={updateSetting}
        mode="grid"
      />
      <RenderModeSettingsPanel
        settings={settings}
        expandedPanel={expandedPanel}
        togglePanel={togglePanel}
        updateSetting={updateSetting}
        showHighlightToggle
      />
    </>
  );
}
