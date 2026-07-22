import { fontLabel, fontStack, COMMON_FONT_KEYS } from "@/lib/fonts";
import { STROKE_PRESET } from "@/lib/copybook";
import { PAPER_SIZES } from "@/lib/paper";
import type { CopybookSettings, CopybookType, GridType } from "@/types";
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

export const GRID_SIZES = [8, 10, 12, 15, 20];

export type RenderMode = CopybookSettings["renderMode"];
export const VALID_GRID_TYPES: GridType[] = [
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
  pinyin: "春夏秋冬",
  stroke: STROKE_PRESET,
  "english-char": "AaBbCcDd",
  "english-word": "hello world",
  "english-para": "The quick brown fox jumps over the lazy dog.",
  number: "1\n2\n3\n4\n5\n6\n7\n8\n9\n0\n\n1234567890",
  control: "",
};

export const CONTENT_PLACEHOLDERS: Record<CopybookType, string> = {
  character: "输入要临写的汉字，例如：静、和、雅、志",
  word: "输入词语，用空格或换行分隔，例如：春暖花开 岁月静好",
  paragraph: "输入诗词、课文或句段内容，支持换行排版",
  stroke: "输入要练习笔顺的汉字，或直接使用默认笔顺示例",
  pinyin: "输入要练习的汉字，系统会按拼音字帖方式生成",
  "english-char": "输入字母序列，例如：Aa Bb Cc Dd",
  "english-word": "输入英文单词，例如：hello world future design",
  "english-para": "输入英文句子或段落，支持自动换行",
  number: "请输入数字，可按单行单个数字或整行数字序列输入",
  control: "",
};

export interface StrokeDraftRow {
  id: string;
  pattern: string;
  example: string;
}

export const STROKE_PATTERN_OPTIONS = [
  { value: "right-dot", label: "右点" },
  { value: "left-dot", label: "左点" },
  { value: "long-heng", label: "长横" },
  { value: "short-heng", label: "短横" },
  { value: "shu", label: "竖" },
  { value: "pie", label: "撇" },
  { value: "na", label: "捺" },
  { value: "ti", label: "提" },
  { value: "heng-zhe", label: "横折" },
  { value: "heng-gou", label: "横钩" },
  { value: "shu-gou", label: "竖钩" },
  { value: "xie-gou", label: "斜钩" },
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
      const matched = STROKE_PATTERN_OPTIONS.find((item) => item.value === pattern);
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
        {
          "一": "long-heng",
          "丨": "shu",
          "丿": "pie",
          "㇏": "na",
          "丶": "right-dot",
          "㇀": "ti",
        }[ch] ?? STROKE_PATTERN_OPTIONS[0].value;
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
  return {
    type,
    content: DEFAULT_CONTENT[type],
  fontFamily: "kaiti",
  fontWeight: "normal",
  gridType: "tian",
  gridSize: 10,
  rowGap: 2,
  margin: { top: 36, right: 36, bottom: 36, left: 36 },
  fontScale: isNumber ? 85 : 68,
  fontSize: 28,
  vOffset: isNumber ? 20 : 0,
  renderMode: "miao",
  solidCount: 20,
  groupSpacing: 4,
  miaoColor: "#94a3b8",
  lineColor: "#98a5b9",
  color: "#1f2937",
  highlightColor: "#1f2937",
  showPinyin: false,
  showStroke: false,
  highlightFirst: true,
  highlightCount: 1,
  insertEmptyRow: false,
  insertEmptyCol: false,
  pinyinOverrides: {},
  lineSpacing: 12,
  paperSize: PAPER_SIZES[0],
  };
}

export const DEFAULT_SETTINGS: CopybookSettings = createDefaultSettings("character");
