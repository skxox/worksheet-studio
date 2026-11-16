import { fontLabel, fontStack, COMMON_FONT_KEYS } from "@/lib/fonts";
import { STROKE_CHAR_TO_PATTERN } from "@/lib/copybook";
import { PAPER_SIZES } from "@/lib/paper";
import {
  ControlTraceWeight,
  type CopybookSettings,
  type CopybookType,
  type GridType,
} from "@/types";
export {
  COPYBOOK_TYPE_GROUPS,
  COPYBOOK_TYPES,
  VALID_TYPES,
  getCopybookCapabilities,
  getCopybookTypeMeta,
  isCopybookType,
  type CopybookTemplateCapabilities,
  type CopybookTemplateGroup,
  type CopybookTemplateMeta,
  type FontPanelMode,
} from "./copybook-metadata";

export const GRID_TYPES: { value: GridType; label: string }[] = [
  { value: "essay", label: "作文格" },
  { value: "tian", label: "田字格" },
  { value: "mi", label: "米字格" },
  { value: "huigong", label: "回宫格" },
  { value: "huitian", label: "回田格" },
  { value: "huimi", label: "回米格" },
  { value: "huijiu", label: "回九格" },
  { value: "jiugong", label: "九宫格" },
  { value: "yuanmi", label: "圆米格" },
];

/** 篇章誊写可选的方格类型：默认横线格，另支持 7 种方格（文字流式铺入）。 */
export const PARAGRAPH_GRID_TYPES: { value: GridType; label: string }[] = [
  { value: "line", label: "横线格" },
  { value: "essay", label: "作文格" },
  { value: "tian", label: "田字格" },
  { value: "mi", label: "米字格" },
  { value: "huigong", label: "回宫格" },
  { value: "jiugong", label: "九宫格" },
  { value: "huitian", label: "回田格" },
  { value: "huimi", label: "回米格" },
];

export const GRID_SIZES = [8, 10, 12, 15, 20];

export type RenderMode = CopybookSettings["renderMode"];
export const VALID_GRID_TYPES: GridType[] = [
  "line",
  "tian",
  "mi",
  "huigong",
  "jiugong",
  "essay",
  "huitian",
  "huimi",
  "huijiu",
  "yuanmi",
];
export const VALID_RENDER_MODES: RenderMode[] = ["solid", "miao", "hollow"];

export const COMMON_FONT_OPTIONS = COMMON_FONT_KEYS.map((key) => ({
  value: key,
  label: fontLabel(key),
  preview: fontStack(key),
}));

export const DEFAULT_CONTENT: Record<CopybookType, string> = {
  character: "你好世界",
  word: "春暖花开 阳光明媚",
  paragraph: "床前明月光，疑是地上霜。\n举头望明月，低头思故乡。",
  pinyin: "a\no\ne\ni\nu\nü\nā á ǎ à\nnǐ\nwǒ",
  stroke: "",
  "english-char": "ABCDEFGH",
  "english-word": "Lily\n\nbook, pencil, ruler, bag",
  "english-para": "The quick brown fox jumps over the lazy dog.",
  number: "1\n2\n3\n4\n5\n6\n7\n8\n9\n0\n\n1234567890",
  control: "123456",
};

export const CONTENT_PLACEHOLDERS: Record<CopybookType, string> = {
  character: "输入要临写的汉字，例如：静、和、雅、志",
  word: "输入词语，用空格或换行分隔，例如：春暖花开 岁月静好",
  paragraph: "输入诗词、课文或句段内容，支持换行排版",
  stroke: "点击「编辑」选择要练习的笔画，并挑选包含该笔画的例字",
  pinyin: "输入要练习的拼音，每行一组；可使用声调韵母快捷输入",
  "english-char": "输入英文字母，例如：ABC；可选择大小写成对练习",
  "english-word": "输入英文单词，用换行或逗号分隔，例如：book, pencil, ruler",
  "english-para": "输入英文句子或段落，支持自动换行",
  number: "请输入数字，可按单行单个数字或整行数字序列输入",
  control: "输入图案序列，或点击下方 1–9、A–W 添加图案",
};

export interface StrokeDraftRow {
  id: string;
  pattern: string;
  example: string;
}

export const STROKE_PATTERN_OPTIONS = [
  { value: "right-dot", label: "右点", examples: "主玉卜义" },
  { value: "left-dot", label: "左点", examples: "小少尚" },
  { value: "long-heng", label: "长横", examples: "三王五工" },
  { value: "short-heng", label: "短横", examples: "二土士正" },
  { value: "shu", label: "竖", examples: "中十干丰" },
  { value: "pie", label: "撇", examples: "人千白禾" },
  { value: "na", label: "捺", examples: "八大天木" },
  { value: "ti", label: "提", examples: "民习扛" },
  { value: "heng-zhe", label: "横折", examples: "口日田回" },
  { value: "heng-gou", label: "横钩", examples: "了你宁买" },
  { value: "shu-gou", label: "竖钩", examples: "小水了于" },
  { value: "xie-gou", label: "斜钩", examples: "七戈毛弋氏" },
] as const;

export function createStrokeRow(
  pattern: string = STROKE_PATTERN_OPTIONS[0].value,
  example: string = "",
): StrokeDraftRow {
  return {
    id: `${pattern}-${example}-${Math.random().toString(36).slice(2, 8)}`,
    pattern,
    example,
  };
}

export function parseStrokeContent(content: string): StrokeDraftRow[] {
  const rows = content
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [pattern, example = ""] = line.split("\t");
      const matched = STROKE_PATTERN_OPTIONS.find(
        (item) => item.value === pattern,
      );
      if (matched) return createStrokeRow(matched.value, example);
      return null;
    })
    .filter((row): row is StrokeDraftRow => row !== null);

  if (rows.length > 0) return rows;
  if (!content.trim()) return [createStrokeRow()];

  return Array.from(content)
    .filter((ch) => ch.trim().length > 0)
    .map((ch) => {
      const fallbackPattern =
        STROKE_CHAR_TO_PATTERN[ch] ?? STROKE_PATTERN_OPTIONS[0].value;
      return createStrokeRow(fallbackPattern, ch);
    });
}

export function serializeStrokeContent(rows: StrokeDraftRow[]): string {
  return rows.map((row) => `${row.pattern}\t${row.example.trim()}`).join("\n");
}

export function createDefaultSettings(
  type: CopybookType = "character",
): CopybookSettings {
  const isNumber = type === "number";
  const isEnglishGrid = type === "english-char" || type === "english-word";
  const isPinyin = type === "pinyin";
  const isLineTemplate = type === "paragraph" || type === "english-para";
  const isControl = type === "control";
  return {
    type,
    content: DEFAULT_CONTENT[type],
    fontFamily: isPinyin ? "hei" : "kaiti",
    fontWeight: "normal",
    gridType: isLineTemplate ? "line" : "tian",
    gridSize: 10,
    rowGap: isControl ? 0 : 2,
    margin: { top: 36, right: 36, bottom: 36, left: 36 },
    fontScale: isPinyin ? 60 : isNumber || isEnglishGrid ? 85 : 68,
    fontSize: 28,
    vOffset: isPinyin ? -12 : 0,
    renderMode: "miao",
    solidCount: 20,
    groupSpacing: 4,
    miaoColor: "#94a3b8",
    // 主流字帖线色（slate-500）：实线外框全色，虚线辅助线在绘制层再加 50% 透明度
    lineColor: "#64748b",
    color: "#1f2937",
    highlightColor: "#1f2937",
    showPinyin: false,
    showStroke: false,
    highlightFirst: true,
    highlightCount: 1,
    pairLetterCase: false,
    controlTraceWeight: ControlTraceWeight.Bold,
    insertEmptyRow: false,
    insertEmptyCol: false,
    pinyinOverrides: {},
    lineSpacing: isLineTemplate ? 0 : 12,
    paperSize: PAPER_SIZES[0],
  };
}

export const DEFAULT_SETTINGS: CopybookSettings =
  createDefaultSettings("character");
