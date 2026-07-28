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
  });
  it("returns null for system-only fonts", () => {
    expect(fontWebFamily("song")).toBeNull();
    expect(fontWebFamily("hei")).toBeNull();
  });
  it("returns null for custom local: families", () => {
    expect(fontWebFamily("local:MyHandwriting")).toBeNull();
  });
});
