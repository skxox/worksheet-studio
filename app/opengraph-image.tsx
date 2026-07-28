import { ImageResponse } from "next/og";

// 注：ImageResponse(Satori) 默认字体不含 CJK 字形，中文会渲染为豆腐块；
// 因此 OG 图刻意只使用拉丁文字 + 拼音，保持跨平台可读。站点的中文标题仍由
// metadata（社交卡片标题文案）承载。
export const runtime = "nodejs";
export const alt = "Worksheet Studio — free, no-login copybook generator";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PILLS = ["Copybook", "Handwriting", "Paper"];

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        background:
          "linear-gradient(135deg, #1f1d1b 0%, #2c2823 55%, #3a3328 100%)",
        color: "#fafafa",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
        <div
          style={{
            width: "76px",
            height: "76px",
            borderRadius: "20px",
            background: "#fafafa",
            color: "#1f1d1b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "44px",
            fontWeight: 700,
          }}
        >
          W
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: "36px", fontWeight: 600, lineHeight: 1.1 }}>
            Worksheet Studio
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "#b3a89a",
              marginTop: "6px",
            }}
          >
            Zìtiēdàshī
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
        <div
          style={{
            fontSize: "64px",
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-1px",
            maxWidth: "900px",
          }}
        >
          Printable copybooks, in one click.
        </div>
        <div style={{ fontSize: "30px", color: "#cfc7bb", maxWidth: "860px" }}>
          Copybook, handwriting &amp; paper — free, no login.
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px" }}>
        {PILLS.map((p) => (
          <div
            key={p}
            style={{
              display: "flex",
              padding: "12px 24px",
              borderRadius: "999px",
              border: "1px solid rgba(250,250,250,0.25)",
              fontSize: "24px",
              color: "#e9e3d8",
            }}
          >
            {p}
          </div>
        ))}
      </div>
    </div>,
    { ...size },
  );
}
