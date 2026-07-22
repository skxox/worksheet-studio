"use client";

import { CopybookContentModal } from "../../content/copybook-content-modal";
import type { TemplateModalProps } from "../../workspace/copybook-template.types";

export function LineContentModal(props: TemplateModalProps) {
  return (
    <CopybookContentModal
      open={props.open}
      title={props.title}
      type={props.type}
      placeholder={props.placeholder}
      draftContent={props.draftContent}
      onClose={props.onClose}
      onDraftChange={props.onDraftChange}
      onSave={props.onSave}
    />
  );
}
