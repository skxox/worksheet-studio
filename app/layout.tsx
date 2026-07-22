import type { Metadata } from "next";
import "./globals.css";
import "lxgw-wenkai-webfont/style.css";
// 中文手写体（fontsource，按 unicode-range 子集懒加载）
import "@fontsource/long-cang/400.css";
import "@fontsource/zhi-mang-xing/400.css";
import "@fontsource/ma-shan-zheng/400.css";
import { Navbar } from "@/components/layout/Navbar";
import { MotionProvider } from "@/components/common/MotionProvider";

export const metadata: Metadata = {
  title: "字帖大师 — 三合一字帖平台",
  description: "字帖工坊 / 手写模拟器 / 纸张工厂，在线生成可打印字帖，完全免费",
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
