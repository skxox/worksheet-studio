"use client";

import { PAPER_SIZES } from "@/lib/paper";
import type {
  CopybookSettings,
  CopybookType,
  GridType,
  Margin,
  PaperSize,
} from "@/types";
import {
  getCopybookCapabilities,
  type CopybookTemplateCapabilities,
  type FontPanelMode,
} from "../../copybook-metadata";
import {
  STROKE_PATTERN_OPTIONS,
  createDefaultSettings,
  parseStrokeContent,
  type RenderMode,
  type StrokeDraftRow,
} from "../../copybook-config";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toFiniteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function resolvePaperSize(value: unknown): PaperSize {
  if (typeof value === "string") {
    return PAPER_SIZES.find((item) => item.name === value) ?? PAPER_SIZES[0];
  }
  if (isRecord(value) && typeof value.name === "string") {
    return (
      PAPER_SIZES.find((item) => item.name === value.name) ?? PAPER_SIZES[0]
    );
  }
  return PAPER_SIZES[0];
}

function resolveMargin(value: unknown): Margin {
  if (!isRecord(value)) return createDefaultSettings().margin;
  const base = createDefaultSettings().margin;
  return {
    top: clamp(toFiniteNumber(value.top, base.top), 10, 100),
    right: clamp(toFiniteNumber(value.right, base.right), 10, 100),
    bottom: clamp(toFiniteNumber(value.bottom, base.bottom), 10, 100),
    left: clamp(toFiniteNumber(value.left, base.left), 10, 100),
  };
}

function resolvePinyinOverrides(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value)) {
    if (typeof v === "number" && Number.isFinite(v)) {
      out[k] = Math.floor(v);
    }
  }
  return out;
}

export function sanitizeCopybookSettings(
  settings: CopybookSettings,
  initialType: CopybookType,
  initialSettings: CopybookSettings,
  validGridTypes: GridType[],
  validRenderModes: RenderMode[],
): CopybookSettings {
  return {
    ...settings,
    type: initialType,
    content: typeof settings.content === "string" ? settings.content : "",
    fontFamily:
      typeof settings.fontFamily === "string" ? settings.fontFamily : "kaiti",
    fontWeight: settings.fontWeight === "bold" ? "bold" : "normal",
    gridType: validGridTypes.includes(settings.gridType as GridType)
      ? (settings.gridType as GridType)
      : (settings.gridType as string) === "fang"
        ? "essay"
        : "tian",
    gridSize: clamp(
      toFiniteNumber(settings.gridSize, initialSettings.gridSize),
      5,
      40,
    ),
    rowGap: clamp(
      toFiniteNumber(settings.rowGap, initialSettings.rowGap),
      0,
      20,
    ),
    margin: resolveMargin(settings.margin),
    fontScale: clamp(
      toFiniteNumber(settings.fontScale, initialSettings.fontScale),
      10,
      150,
    ),
    fontSize: clamp(
      toFiniteNumber(settings.fontSize, initialSettings.fontSize),
      8,
      96,
    ),
    vOffset: clamp(
      toFiniteNumber(settings.vOffset, initialSettings.vOffset),
      -50,
      50,
    ),
    renderMode: validRenderModes.includes(settings.renderMode as RenderMode)
      ? (settings.renderMode as RenderMode)
      : "miao",
    solidCount: clamp(
      toFiniteNumber(settings.solidCount, initialSettings.solidCount),
      0,
      100,
    ),
    miaoColor:
      typeof settings.miaoColor === "string" && settings.miaoColor !== "#cfd5de"
        ? settings.miaoColor
        : "#94a3b8",
    lineColor:
      typeof settings.lineColor === "string" ? settings.lineColor : "#98a5b9",
    color: typeof settings.color === "string" ? settings.color : "#1f2937",
    highlightColor:
      typeof settings.highlightColor === "string"
        ? settings.highlightColor
        : "#1f2937",
    showPinyin: settings.showPinyin !== false,
    showStroke: settings.showStroke === true,
    highlightFirst: settings.highlightFirst !== false,
    highlightCount: clamp(
      toFiniteNumber(settings.highlightCount, initialSettings.highlightCount),
      1,
      5,
    ),
    insertEmptyRow: settings.insertEmptyRow === true,
    insertEmptyCol: settings.insertEmptyCol === true,
    pinyinOverrides: resolvePinyinOverrides(settings.pinyinOverrides),
    lineSpacing: clamp(
      toFiniteNumber(settings.lineSpacing, initialSettings.lineSpacing),
      0,
      80,
    ),
    paperSize: resolvePaperSize(settings.paperSize),
  };
}

export function getWorkspaceFlags(
  type: CopybookType,
): CopybookTemplateCapabilities {
  return getCopybookCapabilities(type);
}

export function getFontPanelMode(type: CopybookType): FontPanelMode {
  return getCopybookCapabilities(type).fontPanelMode;
}

export function getContentPreview(
  type: CopybookType,
  content: string,
  strokeRows: StrokeDraftRow[],
) {
  if (type !== "stroke") {
    return content;
  }

  const rows = strokeRows.length ? strokeRows : parseStrokeContent(content);
  return rows
    .map((row) => {
      const patternLabel =
        STROKE_PATTERN_OPTIONS.find((item) => item.value === row.pattern)
          ?.label ?? row.pattern;
      return row.example ? `${patternLabel} ${row.example}` : patternLabel;
    })
    .filter(Boolean)
    .slice(0, 3)
    .join(" / ");
}
