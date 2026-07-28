import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "字帖大师 — 三合一字帖平台",
    short_name: "字帖大师",
    description: "在线生成可打印字帖，完全免费、无需登录。",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#232323",
    lang: "zh-CN",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
