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
    webFamily: "Noto Serif SC",
    label: "宋体",
  },
  hei: {
    stack:
      '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Heiti SC", sans-serif',
    webFamily: "Noto Sans SC",
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
  liujian: {
    stack: '"Liu Jian Mao Cao", "KaiTi", cursive',
    webFamily: "Liu Jian Mao Cao",
    label: "刘健毛草",
  },
  xiaowei: {
    stack: '"ZCOOL XiaoWei", "KaiTi", serif',
    webFamily: "ZCOOL XiaoWei",
    label: "站酷小薇",
  },
  kuaile: {
    stack: '"ZCOOL KuaiLe", "KaiTi", cursive',
    webFamily: "ZCOOL KuaiLe",
    label: "站酷快乐体",
  },
  klee: {
    stack: '"Klee One", "LXGW WenKai", "KaiTi", serif',
    webFamily: "Klee One",
    label: "日式楷书",
  },
  // ---- 字帖字体 ----
  tian_kai: {
    stack: '"田英章楷书", "KaiTi", serif',
    webFamily: "田英章楷书",
    label: "田英章楷书（近似）",
  },
  tian_xing: {
    stack: '"田英章行书", "KaiTi", cursive',
    webFamily: "田英章行书",
    label: "田英章行书",
  },
  pang_kai: {
    stack: '"庞中华楷书", "KaiTi", serif',
    webFamily: "庞中华楷书",
    label: "庞中华楷书",
  },
  pang_xing: {
    stack: '"庞中华行书", "KaiTi", cursive',
    webFamily: "庞中华行书",
    label: "庞中华行书",
  },
  sima_xing: {
    stack: '"司马彦行书", "KaiTi", cursive',
    webFamily: "司马彦行书",
    label: "司马彦行书",
  },
  jxp_kai: {
    stack: '"荆霄鹏楷书", "KaiTi", serif',
    webFamily: "荆霄鹏楷书",
    label: "荆霄鹏楷书（近似）",
  },
  jxp_xingkai: {
    stack: '"荆霄鹏行楷", "KaiTi", cursive',
    webFamily: "荆霄鹏行楷",
    label: "荆霄鹏行楷",
  },
  hy_shoujin: {
    stack: '"汉仪瘦金书", "KaiTi", serif',
    webFamily: "汉仪瘦金书",
    label: "汉仪瘦金书",
  },
  jbr_hand: {
    stack: '"井柏然手写", "KaiTi", cursive',
    webFamily: "井柏然手写",
    label: "井柏然手写（网传版）",
  },
  momo_zhiyuan: {
    stack: '"默陌纸鸢行草", "KaiTi", cursive',
    webFamily: "默陌纸鸢行草",
    label: "默陌纸鸢行草",
  },
  xinye_nian: {
    stack: '"新叶念体", "KaiTi", cursive',
    webFamily: "新叶念体",
    label: "新叶念体",
  },
  yrd_zhushi: {
    stack: '"杨任东竹石体", "KaiTi", serif',
    webFamily: "杨任东竹石体",
    label: "杨任东竹石体",
  },
  rmj_kai: {
    stack: '"瑞美加张清平楷书", "KaiTi", serif',
    webFamily: "瑞美加张清平楷书",
    label: "瑞美加张清平楷书",
  },
  rmj_xing: {
    stack: '"瑞美加张清平行书", "KaiTi", cursive',
    webFamily: "瑞美加张清平行书",
    label: "瑞美加张清平行书",
  },
  pinru_hand: {
    stack: '"品如手写体", "KaiTi", cursive',
    webFamily: "品如手写体",
    label: "品如手写体",
  },
  hkh_hand: {
    stack: '"黄凯桦手写体", "KaiTi", cursive',
    webFamily: "黄凯桦手写体",
    label: "黄凯桦手写体",
  },
  qingshu: {
    stack: '"情书体", "KaiTi", cursive',
    webFamily: "情书体",
    label: "情书体",
  },
  tamanegi: {
    stack: '"玉葱楷书", "LXGW WenKai", "KaiTi", serif',
    webFamily: "玉葱楷书",
    label: "玉葱楷书（日式）",
  },
  zhengfeng: {
    stack: '"正風毛筆", "KaiTi", serif',
    webFamily: "正風毛筆",
    label: "正風毛筆",
  },
  moda: {
    stack: '"莫大毛筆", "KaiTi", serif',
    webFamily: "莫大毛筆",
    label: "莫大毛筆",
  },
  simkai: {
    stack: '"Windows 楷体", "KaiTi", serif',
    webFamily: "Windows 楷体",
    label: "Windows 楷体",
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
  // 以下为常见字帖字体名目（15 款）：均为「引用本机已装字体」的直通项——
  // 不随项目分发字体文件（商业字体仅限个人本机使用）。
  local_pinru: localFontOption("品如手写体", "品如手写体"),
  local_huangkaihua: localFontOption("黄凯桦手写体", "黄凯桦手写体"),
  local_zhongqi_maoacao: localFontOption("钟齐流江毛草", "钟齐流江毛草"),
  local_jingboran: localFontOption("井柏然手写体", "井柏然手写体"),
  local_moda: localFontOption("莫大毛筆字體", "莫大毛筆字體"),
  local_zhengfeng: localFontOption("正風毛筆字體", "正風毛筆字體"),
  local_tamanegi: localFontOption("玉ねぎ楷書", "玉ねぎ楷書"),
  local_jingxiaopeng: localFontOption("荆霄鹏楷书", "荆霄鹏楷书"),
  local_wuyusheng: localFontOption("吴玉生行书", "吴玉生行书"),
  local_luzhongnan: localFontOption("卢中南毛筆小楷", "卢中南毛筆小楷"),
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
  "liujian",
  "xiaowei",
  "kuaile",
  "klee",
  "tian_kai",
  "tian_xing",
  "pang_kai",
  "pang_xing",
  "sima_xing",
  "jxp_kai",
  "jxp_xingkai",
  "hy_shoujin",
  "jbr_hand",
  "momo_zhiyuan",
  "xinye_nian",
  "yrd_zhushi",
  "rmj_kai",
  "rmj_xing",
  "pinru_hand",
  "hkh_hand",
  "qingshu",
  "tamanegi",
  "zhengfeng",
  "moda",
  "simkai",
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
  "local_pinru",
  "local_huangkaihua",
  "local_zhongqi_maoacao",
  "local_jingboran",
  "local_moda",
  "local_zhengfeng",
  "local_tamanegi",
  "local_jingxiaopeng",
  "local_wuyusheng",
  "local_luzhongnan",
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
