"use client";

import { ControlSettingsPanel } from "../../panels/copybook-settings-panels";
import type { TemplateSidebarProps } from "../../workspace/copybook-template.types";

export function ControlSidebarSections(props: TemplateSidebarProps) {
  return (
    <ControlSettingsPanel
      settings={props.settings}
      marginSummary={props.marginSummary}
      expandedPanel={props.expandedPanel}
      togglePanel={props.togglePanel}
      updateSetting={props.updateSetting}
      updateMargin={props.updateMargin}
    />
  );
}
