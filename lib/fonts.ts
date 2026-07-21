import type { FontOption } from "@/types";

function localFontOption(
  label: string,
  family: string,
  fallback: string = "serif",
): FontOption {
  return {
    stack: `"${family}", "KaiTi", "STKaiti", "Kaiti SC", "Songti SC", ${fallback}`,
    webFamily: null,
    label,
  };
}

/**
 * 字体注册表。
 * - webFamily 非 null 者（如 LXGW WenKai）为真实 Web 字体，绘制前需 document.fonts.load 确保 ready。
 * - webFamily 为 null 者依赖操作系统字体栈（macOS/Windows 各有对应），开箱即用、无需联网。
 */
export const FONTS: Record<string, FontOption> = {
  wenkai: {
    stack: '"LXGW WenKai", "KaiTi", "STKaiti", serif',
    webFamily: "LXGW WenKai",
    label: "霞鹜文楷",
  },
  kaiti: {
    stack: '"KaiTi", "STKaiti", "LXGW WenKai", serif',
    webFamily: "LXGW WenKai",
    label: "楷体",
  },
  song: {
    stack: '"Noto Serif SC", "Songti SC", "STSong", "SimSun", serif',
    webFamily: null,
    label: "宋体",
  },
  hei: {
    stack:
      '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif',
    webFamily: null,
    label: "黑体",
  },
  fangsong: {
    stack: '"FangSong", "STFangsong", "FangSong_GB2312", serif',
    webFamily: null,
    label: "仿宋",
  },
  lishu: {
    stack: '"LiSu", "STLiti", "SimLi", serif',
    webFamily: null,
    label: "隶书",
  },
  cursive: {
    stack: '"LXGW WenKai", "KaiTi", cursive',
    webFamily: "LXGW WenKai",
    label: "手写体",
  },
  longcang: {
    stack: '"Long Cang", "KaiTi", cursive',
    webFamily: "Long Cang",
    label: "龙藏行书",
  },
  zhimang: {
    stack: '"Zhi Mang Xing", "KaiTi", cursive',
    webFamily: "Zhi Mang Xing",
    label: "志莽行书",
  },
  mashan: {
    stack: '"Ma Shan Zheng", "KaiTi", serif',
    webFamily: "Ma Shan Zheng",
    label: "马善政楷",
  },
  local_kaiti: localFontOption("系统楷体", "KaiTi"),
  local_stkaiti: localFontOption("华文楷体", "STKaiti"),
  local_kaitisc: localFontOption("Kaiti SC", "Kaiti SC"),
  local_songti: localFontOption("宋体", "SimSun"),
  local_songtisc: localFontOption("Songti SC", "Songti SC"),
  local_fangsong: localFontOption("仿宋", "FangSong"),
  local_stfangsong: localFontOption("华文仿宋", "STFangsong"),
  local_lisu: localFontOption("隶书", "LiSu"),
  local_youyuan: localFontOption("幼圆", "YouYuan", "sans-serif"),
  local_yahei: localFontOption("微软雅黑", "Microsoft YaHei", "sans-serif"),
  local_pingfang: localFontOption("苹方", "PingFang SC", "sans-serif"),
  local_tianyingzhang_kai: localFontOption("田英章楷书", "田英章楷书"),
  local_tianyingzhang_xing: localFontOption("田英章行书", "田英章行书"),
  local_ruimeijia_kai: localFontOption("瑞美加张清平楷书", "瑞美加张清平楷书"),
  local_ruimeijia_xing: localFontOption("瑞美加张清平行书", "瑞美加张清平行书"),
  local_pangzhonghua_kai: localFontOption("庞中华楷书", "庞中华楷书"),
  local_pangzhonghua_xing: localFontOption("庞中华行书", "庞中华行书"),
  local_sima_yanxing: localFontOption("司马彦行书", "司马彦行书"),
  local_guzhongan_xing: localFontOption("顾仲安行书", "顾仲安行书"),
};

export const COMMON_FONT_KEYS = [
  "kaiti",
  "wenkai",
  "song",
  "hei",
  "fangsong",
  "lishu",
  "mashan",
  "longcang",
  "zhimang",
] as const;

export const LOCAL_FONT_KEYS = [
  "local_kaiti",
  "local_stkaiti",
  "local_kaitisc",
  "local_songti",
  "local_songtisc",
  "local_fangsong",
  "local_stfangsong",
  "local_lisu",
  "local_youyuan",
  "local_yahei",
  "local_pingfang",
  "local_tianyingzhang_kai",
  "local_tianyingzhang_xing",
  "local_ruimeijia_kai",
  "local_ruimeijia_xing",
  "local_pangzhonghua_kai",
  "local_pangzhonghua_xing",
  "local_sima_yanxing",
  "local_guzhongan_xing",
] as const;

function customLocalFamily(key: string): string | null {
  return key.startsWith("local:") ? key.slice("local:".length).trim() : null;
}

/** 取某字体的 Canvas font-family 字符串 */
export function fontStack(key: string): string {
  const custom = customLocalFamily(key);
  if (custom) {
    return `"${custom}", "KaiTi", "STKaiti", "Kaiti SC", "Songti SC", serif`;
  }
  return FONTS[key]?.stack ?? FONTS.kaiti.stack;
}

/** 取某字体的显示名 */
export function fontLabel(key: string): string {
  const custom = customLocalFamily(key);
  if (custom) return custom;
  return FONTS[key]?.label ?? key;
}

/** 字体是否为需要预加载的 Web 字体 */
export function fontWebFamily(key: string): string | null {
  if (customLocalFamily(key)) return null;
  return FONTS[key]?.webFamily ?? null;
}

/**
 * 确保某 Web 字体在给定字号下已加载完毕；系统字体直接 resolve。
 * 用于 canvas 绘制前等待字体就绪，否则首帧会以回退字体渲染。
 */
export async function ensureFontLoaded(
  family: string | null,
  size: number = 48,
): Promise<boolean> {
  if (typeof document === "undefined" || !family) return true;
  try {
    await document.fonts.load(`${size}px "${family}"`);
    await document.fonts.ready;
    return true;
  } catch {
    return false;
  }
}
