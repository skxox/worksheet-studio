import { describe, it, expect } from "vitest";
import { paperToSvg } from "@/lib/svg";
import type { PaperSettings } from "@/types";

function baseSettings(overrides: Partial<PaperSettings> = {}): PaperSettings {
  return {
    type: "grid",
    size: { name: "A4", width: 210, height: 297 },
    gridSize: 5,
    lineColor: "#d1d5db",
    lineStyle: "solid",
    lineWidth: 0.5,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    theme: "default",
    bgColor: "#ffffff",
    texture: "none",
    watermark: "",
    watermarkColor: "#9ca3af",
    showPageNumber: false,
    pageCount: 1,
    ...overrides,
  };
}

describe("paperToSvg", () => {
  it("emits a well-formed <svg> root with a background rect", () => {
    const svg = paperToSvg(baseSettings());
    expect(svg.startsWith("<svg")).toBe(true);
    expect(svg).toContain("</svg>");
    expect(svg).toContain("<rect");
    expect(svg).toContain(`fill="#ffffff"`);
  });

  it("renders <line> elements for grid paper", () => {
    const svg = paperToSvg(baseSettings({ type: "grid" }));
    expect(svg).toContain("<line");
  });

  it("renders <circle> elements for dot paper", () => {
    const svg = paperToSvg(baseSettings({ type: "dot" }));
    expect(svg).toContain("<circle");
  });

  it("renders an outer + inner rect for huigong (回宫) cells", () => {
    const svg = paperToSvg(baseSettings({ type: "huigong" }));
    expect(svg).toContain("<rect");
  });

  it("includes a watermark <text> when one is set", () => {
    const svg = paperToSvg(
      baseSettings({ watermark: "样本", watermarkColor: "#9ca3af" }),
    );
    expect(svg).toContain("<text");
    expect(svg).toContain("样本");
  });

  it("escapes XML-significant characters in the watermark", () => {
    const svg = paperToSvg(baseSettings({ watermark: "a&b<c>" }));
    expect(svg).toContain("a&amp;b&lt;c&gt;");
    expect(svg).not.toContain("a&b<c>");
  });
});
