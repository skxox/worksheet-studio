"use client";

import {
  parseStrokeContent,
  serializeStrokeContent,
} from "../../copybook-config";
import type { CopybookType } from "@/types";
import {
  TEMPLATE_KIND_BY_TYPE,
  type CopybookTemplateKind,
} from "../../copybook-metadata";
import { CopybookContentCard } from "../content/copybook-content-card";
import { CopybookContentModal } from "../content/copybook-content-modal";
import { GridSidebarSections } from "../templates/grid/grid-sidebar-sections";
import { LineContentModal } from "../templates/line/line-content-modal";
import { LineSidebarSections } from "../templates/line/line-sidebar-sections";
import { NumberContentCard } from "../templates/number/number-content-card";
import { NumberContentModal } from "../templates/number/number-content-modal";
import { NumberSidebarSections } from "../templates/number/number-sidebar-sections";
import { StrokeContentModal } from "../templates/stroke/stroke-content-modal";
import { StrokeSidebarSections } from "../templates/stroke/stroke-sidebar-sections";
import type {
  CopybookTemplateDefinition,
  TemplateContentCardProps,
  TemplateEditorState,
  TemplateModalProps,
} from "./copybook-template.types";

function GenericContentCard(props: TemplateContentCardProps) {
  return (
    <CopybookContentCard
      label={props.label}
      content={props.content}
      placeholder={props.placeholder}
      onEdit={props.onEdit}
    />
  );
}

function NumberContentCardAdapter(props: TemplateContentCardProps) {
  return (
    <NumberContentCard
      label={props.label}
      content={props.content}
      placeholder={props.placeholder}
      onEdit={props.onEdit}
    />
  );
}

function NumberContentModalAdapter(props: TemplateModalProps) {
  return (
    <NumberContentModal
      open={props.open}
      draftContent={props.draftContent}
      placeholder={props.placeholder}
      onClose={props.onClose}
      onDraftChange={props.onDraftChange}
      onSave={props.onSave}
    />
  );
}

const DEFAULT_EDITOR_STATE: TemplateEditorState = {
  draftContent: "",
  strokeRows: [],
};

const GRID_TEMPLATE: CopybookTemplateDefinition = {
  kind: "grid",
  ContentCard: GenericContentCard,
  Sidebar: GridSidebarSections,
  ContentModal: CopybookContentModal,
  getCardContent: (_content, previewContent) => previewContent,
  getEditorState: (content) => ({
    ...DEFAULT_EDITOR_STATE,
    draftContent: content,
  }),
  serializeContent: (draftContent) => draftContent,
};

const LINE_TEMPLATE: CopybookTemplateDefinition = {
  kind: "line",
  ContentCard: GenericContentCard,
  Sidebar: LineSidebarSections,
  ContentModal: LineContentModal,
  getCardContent: (_content, previewContent) => previewContent,
  getEditorState: (content) => ({
    ...DEFAULT_EDITOR_STATE,
    draftContent: content,
  }),
  serializeContent: (draftContent) => draftContent,
};

const NUMBER_TEMPLATE: CopybookTemplateDefinition = {
  kind: "number",
  ContentCard: NumberContentCardAdapter,
  Sidebar: NumberSidebarSections,
  ContentModal: NumberContentModalAdapter,
  getCardContent: (content) => content,
  getEditorState: (content) => ({
    ...DEFAULT_EDITOR_STATE,
    draftContent: content,
  }),
  serializeContent: (draftContent) => draftContent,
};

const STROKE_TEMPLATE: CopybookTemplateDefinition = {
  kind: "stroke",
  ContentCard: GenericContentCard,
  Sidebar: StrokeSidebarSections,
  ContentModal: StrokeContentModal,
  getCardContent: (_content, previewContent) => previewContent,
  getEditorState: (content) => ({
    draftContent: "",
    strokeRows: parseStrokeContent(content),
  }),
  serializeContent: (_draftContent, strokeRows) =>
    serializeStrokeContent(strokeRows),
};

const CONTROL_TEMPLATE: CopybookTemplateDefinition = {
  kind: "control",
  ContentCard: null,
  Sidebar: null,
  ContentModal: null,
  getCardContent: (content) => content,
  getEditorState: (content) => ({
    ...DEFAULT_EDITOR_STATE,
    draftContent: content,
  }),
  serializeContent: (draftContent) => draftContent,
};

const TEMPLATE_REGISTRY: Record<
  CopybookTemplateKind,
  CopybookTemplateDefinition
> = {
  grid: GRID_TEMPLATE,
  line: LINE_TEMPLATE,
  number: NUMBER_TEMPLATE,
  stroke: STROKE_TEMPLATE,
  control: CONTROL_TEMPLATE,
};

export function getCopybookTemplate(type: CopybookType) {
  return TEMPLATE_REGISTRY[TEMPLATE_KIND_BY_TYPE[type]];
}
