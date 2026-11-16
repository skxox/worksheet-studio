import { describe, it, expect } from "vitest";
import { fontStack, fontLabel, fontWebFamily, FONTS } from "@/lib/fonts";

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
