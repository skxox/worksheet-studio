import type { CopybookType } from "@/types";

export type FontPanelMode = "grid" | "line" | "english-grid";
export type CopybookTemplateKind =
  "grid" | "line" | "stroke" | "number" | "control";

export interface CopybookTemplateCapabilities {
  isNumberMode: boolean;
  isStrokeMode: boolean;
  showGridControls: boolean;
  showHighlightToggle: boolean;
  showInsertEmptyCol: boolean;
  showInsertEmptyRow: boolean;
  showLineControls: boolean;
  showPinyinToggle: boolean;
  showRenderModePanel: boolean;
  showStrokeControls: boolean;
  showStrokeSwitch: boolean;
  showSwitchPanel: boolean;
  fontPanelMode: FontPanelMode;
  showLetterCasePair?: boolean;
  showEnglishGridControls?: boolean;
  showPinyinGridControls?: boolean;
}

export interface CopybookTemplateOption {
  value: CopybookType;
  label: string;
  description?: string;
}

export interface CopybookTemplateGroup {
  key: "cn" | "en" | "skill";
  label: string;
  options: CopybookTemplateOption[];
}

export interface CopybookTemplateMeta extends CopybookTemplateOption {
  groupKey: CopybookTemplateGroup["key"];
  capabilities: CopybookTemplateCapabilities;
}

const TEMPLATE_CAPABILITIES = {
  character: {
    isNumberMode: false,
    isStrokeMode: false,
    showGridControls: true,
    showHighlightToggle: true,
    showInsertEmptyCol: true,
    showInsertEmptyRow: true,
    showLineControls: false,
    showPinyinToggle: true,
    showRenderModePanel: true,
    showStrokeControls: false,
    showStrokeSwitch: true,
    showSwitchPanel: true,
    fontPanelMode: "grid",
  },
  word: {
    isNumberMode: false,
    isStrokeMode: false,
    showGridControls: true,
    showHighlightToggle: true,
    showInsertEmptyCol: true,
    showInsertEmptyRow: true,
    showLineControls: false,
    showPinyinToggle: true,
    showRenderModePanel: true,
    showStrokeControls: false,
    showStrokeSwitch: false,
    showSwitchPanel: true,
    fontPanelMode: "grid",
  },
  paragraph: {
    isNumberMode: false,
    isStrokeMode: false,
    showGridControls: false,
    showHighlightToggle: false,
    showInsertEmptyCol: false,
    showInsertEmptyRow: true,
    showLineControls: true,
    showPinyinToggle: false,
    showRenderModePanel: false,
    showStrokeControls: false,
    showStrokeSwitch: false,
    showSwitchPanel: true,
    fontPanelMode: "line",
  },
  stroke: {
    isNumberMode: false,
    isStrokeMode: true,
    showGridControls: false,
    showHighlightToggle: true,
    showInsertEmptyCol: false,
    showInsertEmptyRow: false,
    showLineControls: false,
    showPinyinToggle: false,
    showRenderModePanel: true,
    showStrokeControls: true,
    showStrokeSwitch: false,
    showSwitchPanel: true,
    fontPanelMode: "grid",
  },
  pinyin: {
    isNumberMode: false,
    isStrokeMode: false,
    showGridControls: false,
    showHighlightToggle: true,
    showInsertEmptyCol: false,
    showInsertEmptyRow: true,
    showLineControls: false,
    showPinyinToggle: false,
    showRenderModePanel: true,
    showStrokeControls: false,
    showStrokeSwitch: false,
    showSwitchPanel: true,
    fontPanelMode: "grid",
    showPinyinGridControls: true,
  },
  "english-char": {
    isNumberMode: false,
    isStrokeMode: false,
    showGridControls: false,
    showHighlightToggle: true,
    showInsertEmptyCol: false,
    showInsertEmptyRow: true,
    showLineControls: false,
    showPinyinToggle: false,
    showRenderModePanel: true,
    showStrokeControls: false,
    showStrokeSwitch: false,
    showSwitchPanel: true,
    fontPanelMode: "english-grid",
    showLetterCasePair: true,
    showEnglishGridControls: true,
  },
  "english-word": {
    isNumberMode: false,
    isStrokeMode: false,
    showGridControls: false,
    showHighlightToggle: true,
    showInsertEmptyCol: false,
    showInsertEmptyRow: true,
    showLineControls: false,
    showPinyinToggle: false,
    showRenderModePanel: true,
    showStrokeControls: false,
    showStrokeSwitch: false,
    showSwitchPanel: true,
    fontPanelMode: "english-grid",
    showEnglishGridControls: true,
  },
  "english-para": {
    isNumberMode: false,
    isStrokeMode: false,
    showGridControls: false,
    showHighlightToggle: false,
    showInsertEmptyCol: false,
    showInsertEmptyRow: false,
    showLineControls: true,
    showPinyinToggle: false,
    showRenderModePanel: false,
    showStrokeControls: false,
    showStrokeSwitch: false,
    showSwitchPanel: false,
    fontPanelMode: "line",
  },
  number: {
    isNumberMode: true,
    isStrokeMode: false,
    showGridControls: false,
    showHighlightToggle: true,
    showInsertEmptyCol: true,
    showInsertEmptyRow: true,
    showLineControls: false,
    showPinyinToggle: false,
    showRenderModePanel: false,
    showStrokeControls: false,
    showStrokeSwitch: false,
    showSwitchPanel: true,
    fontPanelMode: "grid",
  },
  control: {
    isNumberMode: false,
    isStrokeMode: false,
    showGridControls: false,
    showHighlightToggle: false,
    showInsertEmptyCol: false,
    showInsertEmptyRow: false,
    showLineControls: false,
    showPinyinToggle: false,
    showRenderModePanel: false,
    showStrokeControls: false,
    showStrokeSwitch: false,
    showSwitchPanel: false,
    fontPanelMode: "grid",
  },
} satisfies Record<CopybookType, CopybookTemplateCapabilities>;

export const COPYBOOK_TYPE_GROUPS: CopybookTemplateGroup[] = [
  {
    key: "cn",
    label: "语文书写",
    options: [
      {
        value: "character",
        label: "单字临写",
        description: "逐字练写，打牢书写基本功",
      },
      {
        value: "word",
        label: "词语书写",
        description: "边写边记，练字识词两不误",
      },
      {
        value: "paragraph",
        label: "篇章誊写",
        description: "粘贴任意文本，即刻生成字帖",
      },
      {
        value: "stroke",
        label: "笔顺拆解",
        description: "横竖撇捺，从零开始",
      },
    ],
  },
  {
    key: "en",
    label: "英文书写",
    options: [
      {
        value: "english-char",
        label: "字母训练",
        description: "逐个练写，养成规范笔顺",
      },
      {
        value: "english-word",
        label: "单词抄写",
        description: "练字兼顾记词，一举两得",
      },
      {
        value: "english-para",
        label: "句段誊写",
        description: "整段书写，提升流畅度与速度",
      },
    ],
  },
  {
    key: "skill",
    label: "专项练习",
    options: [
      {
        value: "number",
        label: "数字书写",
        description: "数字规范书写",
      },
      {
        value: "pinyin",
        label: "拼音拼写",
        description: "点击快速输入带声调韵母",
      },
      {
        value: "control",
        label: "控笔线练",
        description: "直线曲线，练好运笔控笔",
      },
    ],
  },
];

export const COPYBOOK_TYPES: CopybookTemplateMeta[] =
  COPYBOOK_TYPE_GROUPS.flatMap((group) =>
    group.options.map((option) => ({
      ...option,
      groupKey: group.key,
      capabilities: TEMPLATE_CAPABILITIES[option.value],
    })),
  );

export const COPYBOOK_TYPE_MAP: Record<CopybookType, CopybookTemplateMeta> =
  COPYBOOK_TYPES.reduce(
    (acc, item) => {
      acc[item.value] = item;
      return acc;
    },
    {} as Record<CopybookType, CopybookTemplateMeta>,
  );

export const VALID_TYPES = COPYBOOK_TYPES.map((item) => item.value);
export const LINE_TEMPLATE_TYPES: CopybookType[] = [
  "paragraph",
  "english-para",
];
export const GRID_TEMPLATE_TYPES: CopybookType[] = [
  "character",
  "word",
  "pinyin",
  "english-char",
  "english-word",
];
export const TEMPLATE_KIND_BY_TYPE = {
  character: "grid",
  word: "grid",
  paragraph: "line",
  stroke: "stroke",
  pinyin: "grid",
  "english-char": "grid",
  "english-word": "grid",
  "english-para": "line",
  number: "number",
  control: "control",
} satisfies Record<CopybookType, CopybookTemplateKind>;

export function isCopybookType(value: string): value is CopybookType {
  return value in COPYBOOK_TYPE_MAP;
}

export function isLineTemplateType(type: CopybookType) {
  return LINE_TEMPLATE_TYPES.includes(type);
}

export function isGridTemplateType(type: CopybookType) {
  return GRID_TEMPLATE_TYPES.includes(type);
}

export function getCopybookTypeMeta(type: CopybookType) {
  return COPYBOOK_TYPE_MAP[type];
}

export function getCopybookCapabilities(type: CopybookType) {
  return COPYBOOK_TYPE_MAP[type].capabilities;
}
