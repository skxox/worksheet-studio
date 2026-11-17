import type { Metadata, Viewport } from "next";
import "./globals.css";
import "lxgw-wenkai-webfont/style.css";
// 中文手写体（fontsource，按 unicode-range 子集懒加载）
import "@fontsource/long-cang/400.css";
import "@fontsource/zhi-mang-xing/400.css";
import "@fontsource/ma-shan-zheng/400.css";
// 宋 / 黑（Noto 思源系）与毛笔草书、站酷系、日式楷书（均 OFL 可再分发）
import "@fontsource/noto-serif-sc/400.css";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/liu-jian-mao-cao/400.css";
import "@fontsource/zcool-xiaowei/400.css";
import "@fontsource/zcool-kuaile/400.css";
import "@fontsource/klee-one/400.css";
import "./local-fonts.css";
import { Navbar } from "@/components/layout/Navbar";
import { MotionProvider } from "@/components/common/MotionProvider";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const SITE_DESCRIPTION =
  "字帖工坊 / 手写模拟器 / 纸张工厂，在线生成可打印字帖，完全免费、无需登录。";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "字帖大师 — 三合一字帖平台",
    template: "%s · 字帖大师",
  },
  description: SITE_DESCRIPTION,
  applicationName: "字帖大师",
  keywords: [
    "字帖",
    "字帖生成器",
    "练字",
    "字帖打印",
    "田字格",
    "米字格",
    "拼音字帖",
    "笔顺",
    "手写模拟",
    "方格纸",
    "Worksheet Studio",
  ],
  authors: [{ name: "SK-ERIC" }],
  creator: "SK-ERIC",
  publisher: "SK-ERIC",
  category: "education",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: SITE_URL,
    siteName: "字帖大师",
    title: "字帖大师 — 三合一字帖平台",
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "字帖大师 — 三合一字帖平台",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

// themeColor / colorScheme 必须放在独立的 viewport 导出里（Next 14+ 规范）。
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#232323" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "(function(){try{var t=localStorage.getItem('ws:theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();",
          }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <MotionProvider>
          <Navbar />
          <div className="flex flex-1 flex-col">{children}</div>
        </MotionProvider>
      </body>
    </html>
  );
}
