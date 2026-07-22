"use client";

import {
  FontSettingsPanel,
  NumberSettingsPanel,
  NumberTraceSettingsPanel,
  ToggleSettingsPanel,
  type ExpandedPanelKey,
} from "../../panels/copybook-settings-panels";
import type { CopybookSettings, Margin } from "@/types";

export function NumberSidebarSections({
  settings,
  marginSummary,
  expandedPanel,
  togglePanel,
  updateSetting,
  updateMargin,
  customLocalFont,
  onCustomLocalFontChange,
  onApplyCustomLocalFont,
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
  customLocalFont: string;
  onCustomLocalFontChange: (value: string) => void;
  onApplyCustomLocalFont: () => void;
}) {
  return (
    <>
      <ToggleSettingsPanel
        showStrokeSwitch={false}
        showPinyinToggle={false}
        showHighlightToggle
        showInsertEmptyRow
        showInsertEmptyCol
        settings={settings}
        updateSetting={updateSetting}
      />
      <NumberSettingsPanel
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
        mode="grid"
      />
      <NumberTraceSettingsPanel
        settings={settings}
        expandedPanel={expandedPanel}
        togglePanel={togglePanel}
        updateSetting={updateSetting}
      />
    </>
  );
}
