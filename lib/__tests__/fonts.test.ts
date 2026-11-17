import { describe, it, expect } from "vitest";
import {
  fontStack,
  fontLabel,
  fontWebFamily,
  fontKeysForTarget,
  FONTS,
} from "@/lib/fonts";

describe("fontStack", () => {
  it("returns the registered stack for a known key", () => {
    expect(fontStack("kaiti")).toContain("KaiTi");
    expect(fontStack("wenkai")).toContain("LXGW WenKai");
  });
  it("falls back to the kaiti stack for an unknown key", () => {
    expect(fontStack("does-not-exist")).toBe(FONTS.kaiti.stack);
  });
  it("honours a custom local: family", () => {
    expect(fontStack("local:MyHandwriting")).toContain("MyHandwriting");
  });
});

describe("fontLabel", () => {
  it("returns the registered label for a known key", () => {
    expect(fontLabel("kaiti")).toBe("楷体");
    expect(fontLabel("wenkai")).toBe("霞鹜文楷");
  });
  it("returns the raw family for a custom local: family", () => {
    expect(fontLabel("local:MyHandwriting")).toBe("MyHandwriting");
  });
  it("falls back to the key itself for unknown keys", () => {
    expect(fontLabel("does-not-exist")).toBe("does-not-exist");
  });
});

describe("fontWebFamily", () => {
  it("returns the web family name for web fonts", () => {
    expect(fontWebFamily("wenkai")).toBe("LXGW WenKai");
    expect(fontWebFamily("longcang")).toBe("Long Cang");
    // 宋 / 黑升级为 Noto 自托管 Web 字体（思源系，跨设备一致渲染）
    expect(fontWebFamily("song")).toBe("Noto Serif SC");
    expect(fontWebFamily("hei")).toBe("Noto Sans SC");
    expect(fontWebFamily("liujian")).toBe("Liu Jian Mao Cao");
    expect(fontWebFamily("xiaowei")).toBe("ZCOOL XiaoWei");
  });
  it("returns null for system-only fonts", () => {
    expect(fontWebFamily("fangsong")).toBeNull();
    expect(fontWebFamily("lishu")).toBeNull();
  });
  it("returns null for custom local: families", () => {
    expect(fontWebFamily("local:MyHandwriting")).toBeNull();
  });
});

describe("fontKeysForTarget（按模板类别的字体清单）", () => {
  it("中文模板包含基础与字帖中文字体", () => {
    const cn = fontKeysForTarget("cn");
    expect(cn).toContain("kaiti");
    expect(cn).toContain("tian_kai");
    expect(cn).toContain("simkai");
  });
  it("英文模板含英文练习字体与跨类中文字体，不含纯中文字体", () => {
    const en = fontKeysForTarget("en");
    expect(en).toContain("en_hengshui");
    expect(en).toContain("qingshu"); // 跨类（cn+en+num）
    expect(en).not.toContain("kaiti");
    expect(en).not.toContain("tian_kai");
  });
  it("数字模板只含标记 num 的字体", () => {
    const num = fontKeysForTarget("num");
    expect(num).toContain("en_mugun");
    expect(num).toContain("en_yilin");
    expect(num).not.toContain("en_comic");
    expect(num).not.toContain("kaiti");
  });
});
