"use client";

import { getCopybookCapabilities } from "../../../copybook-metadata";
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
      />

      <FontSettingsPanel
        settings={settings}
        customLocalFont={customLocalFont}
        onCustomLocalFontChange={onCustomLocalFontChange}
        onApplyCustomLocalFont={onApplyCustomLocalFont}
        updateSetting={updateSetting}
        mode="line"
      />
    </>
  );
}
