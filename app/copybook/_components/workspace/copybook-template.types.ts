"use client";

import type { ComponentType } from "react";
import type { CopybookSettings, CopybookType, Margin } from "@/types";
import type { ExpandedPanelKey } from "../panels/copybook-settings-panels";
import type { CopybookTemplateKind } from "../../copybook-metadata";
import type { StrokeDraftRow } from "../../copybook-config";

export type UpdateCopybookSetting = <K extends keyof CopybookSettings>(
  key: K,
  value: CopybookSettings[K],
) => void;

export interface TemplateSidebarProps {
  type: CopybookType;
  settings: CopybookSettings;
  marginSummary: string;
  expandedPanel: ExpandedPanelKey;
  togglePanel: (panel: Exclude<ExpandedPanelKey, null>) => void;
  updateSetting: UpdateCopybookSetting;
  updateMargin: (key: keyof Margin, value: number) => void;
  customLocalFont: string;
  onCustomLocalFontChange: (value: string) => void;
  onApplyCustomLocalFont: () => void;
}

export interface TemplateContentCardProps {
  type: CopybookType;
  label: string;
  content: string;
  placeholder: string;
  onEdit: () => void;
}

export interface TemplateModalProps {
  type: CopybookType;
  title: string;
  open: boolean;
  placeholder: string;
  draftContent: string;
  strokeRows: StrokeDraftRow[];
  onClose: () => void;
  onDraftChange: (value: string) => void;
  onStrokeRowsChange: (rows: StrokeDraftRow[]) => void;
  onSave: () => void;
}

export interface TemplateEditorState {
  draftContent: string;
  strokeRows: StrokeDraftRow[];
}

export interface CopybookTemplateDefinition {
  kind: CopybookTemplateKind;
  ContentCard: ComponentType<TemplateContentCardProps> | null;
  Sidebar: ComponentType<TemplateSidebarProps> | null;
  ContentModal: ComponentType<TemplateModalProps> | null;
  getCardContent: (content: string, previewContent: string) => string;
  getEditorState: (content: string) => TemplateEditorState;
  serializeContent: (
    draftContent: string,
    strokeRows: StrokeDraftRow[],
  ) => string;
}
