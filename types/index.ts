// ==================== 通用类型 ====================

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PaperSize {
  name: string;
  width: number; // mm
  height: number; // mm
}

export type ExportFormat = 'pdf' | 'svg' | 'png';

/** 预览/导出时统一使用的像素边距结构 */
export interface MarginPx {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// ==================== 纸张工厂 ====================

export type PaperType =
  | 'grid' // 方格纸
  | 'line' // 横线纸
  | 'dot' // 点阵纸
  | 'cornell' // 康奈尔笔记
  | 'staff' // 五线谱
  | 'tian' // 田字格
  | 'mi' // 米字格
  | 'huigong' // 回宫格
  | 'pinyin' // 拼音格（四线三格）
  | 'essay'; // 作文格（红框方格）

export interface PaperSettings {
  type: PaperType;
  size: PaperSize;
  gridSize: number; // mm
  lineColor: string;
  lineStyle: 'solid' | 'dashed' | 'dotted';
  lineWidth: number; // px
  margin: Margin;
  theme: 'default' | 'warm' | 'cool';
  bgColor: string; // 背景色（主题切换会同步）
  texture: 'none' | 'fiber' | 'parchment'; // 背景纹理
  watermark: string; // 水印文字
  watermarkColor: string;
  showPageNumber: boolean;
  pageCount: number;
}

// ==================== 字帖工坊 ====================

export type CopybookType =
  | 'character' // 汉字字帖
  | 'word' // 词组字帖
  | 'paragraph' // 段落字帖
  | 'stroke' // 笔画字帖
  | 'pinyin' // 拼音字帖
  | 'english-char' // 英文字母
  | 'english-word' // 英文单词
  | 'english-para' // 英文段落
  | 'number' // 数字字帖
  | 'control'; // 控笔练习

export type GridType = 'tian' | 'mi' | 'huigong' | 'fang' | 'jiugong';

export interface CopybookSettings {
  type: CopybookType;
  content: string;
  fontFamily: string;
  fontWeight: 'normal' | 'bold';

  // —— 格子 ——
  gridType: GridType; // 田字格/米字格/回宫格/方格/九宫格
  gridSize: number; // mm，方格大小
  rowGap: number; // mm，行间距
  margin: Margin;

  // —— 字体 ——
  fontScale: number; // 占格 %（网格模式字号 = 格大小 × fontScale）
  fontSize: number; // px（段落 / 英文行式模式用）
  vOffset: number; // 上下偏移 %（-50..50）

  // —— 描红 ——
  renderMode: 'solid' | 'miao' | 'hollow';
  solidCount: number; // 每行生成多少个可练习字；是否首字实心由 highlightFirst 控制
  groupSpacing: number; // 每字（拼音行 + 汉字行）块之间的间距 mm
  miaoColor: string; // 描红(空心)颜色
  lineColor: string; // 格线颜色
  color: string; // 实心字色

  // —— 开关 ——
  showPinyin: boolean;
  showStroke: boolean; // 显示笔顺（逐笔数据，缺失字回退字体）
  highlightFirst: boolean; // 首字高亮（仅首个练习字作实心示范）
  insertEmptyRow: boolean; // 字间插入空行
  insertEmptyCol: boolean; // 字间插入空列
  pinyinOverrides: Record<string, number>; // 多音字手选读音：{ 字: 读音索引（charAllPinyins 的下标） }

  // —— 行式 ——
  lineSpacing: number; // 段落 / 英文段落行距 px
  paperSize: PaperSize;
}

// ==================== 手写模拟器 ====================

export interface HandwritingSettings {
  content: string;
  fontFamily: string;
  paperBackground: 'white' | 'lined' | 'grid' | 'dot' | 'yellow' | 'aged';
  distortionLevel: number; // 0-100, 字形变形程度
  positionChaos: number; // 0-100, 位置凌乱度
  strokeChaos: number; // 0-100, 笔画凌乱度（旋转）
  scribbleRate: number; // 0-100, 涂改概率
  inkColor: string;
  fontSize: number;
  letterSpacing: number; // 字间距 px
  cols: number; // 每行字数（0=按宽度自动换行）
  lineSpacing: number;
  paperSize: PaperSize;
  margin: Margin;
}

// ==================== 字体注册表 ====================

export interface FontOption {
  /** Canvas font-family 值（含回退栈） */
  stack: string;
  /** 在 CSS @font-face / Google Fonts 中注册的真实 family 名（用于 document.fonts.load） */
  webFamily: string | null;
  label: string;
}
