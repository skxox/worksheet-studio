# CLAUDE.md

本文件为 AI 编码助手（Claude 等）在本仓库工作时的指引。先读这里，再动代码。

## 项目一句话

字帖大师（Worksheet Studio）—— 纯前端字帖 / 手写 / 纸张生成平台。Next.js 16 + React 19 + Tailwind v4，Canvas 直绘，无后端。

## 关键约束（务必遵守）

- **不引入 html2canvas**：Tailwind v4 使用 oklch 色彩，html2canvas 无法解析。导出走 Canvas → jsPDF / PNG / SVG 直出（见 `lib/pdf.ts`）。
- **字体自托管**：中文字体经 `@fontsource/*` 与 `lxgw-wenkai-webfont` 按 unicode-range 子集加载；绘制前需 `document.fonts.load` 等待就绪（`hooks/useFontLoader.ts`）。
- **无后端 / 无数据库 / 无服务端写入**：所有状态存于 `localStorage`（键名 `ws:*`）。**不要引入 React Server Actions / 服务端 mutation**——所有「变更」都是本地设置驱动画布。这是刻意设计，不是遗漏。
- **包管理器是 pnpm**；registry 走 npmmirror（`.npmrc`），勿改。
- **shadcn/ui（New York）** 已接入（`components.json`）。需要新 UI 原语优先 `pnpm dlx shadcn@latest add ...`，别手写下拉/弹层。

## 代码地图

### 纯逻辑（可在 Node / Vitest 下单测，无 Canvas/DOM 副作用）

- `lib/paper/geometry.ts` —— mm↔px、纸张尺寸/主题常量。**新增纯几何放这里**。
- `lib/pinyin.ts` —— 拼音（基于 `pinyin-pro`）；多音字读音缓存。
- `lib/fonts.ts` —— 字体注册表（`fontStack`/`fontLabel`/`fontWebFamily`）。
- `lib/svg.ts` —— `paperToSvg` 纯字符串构建。
- `lib/utils.ts` —— `cn`/`clamp`/`seededRandom` 等。

### Canvas / DOM 耦合（仅在浏览器运行）

- `lib/paper.ts` —— 纸张绘制（透出 `./paper/geometry`）。
- `lib/copybook.ts` —— 字帖总绘制（**单文件 ~1100 行的 `drawCopybook`，刻意未拆**：内部高度耦合，无安全纯函数切分点；改动需格外小心）。
- `lib/handwriting.ts`、`lib/stroke.ts`（笔顺，jsDelivr 懒加载）、`lib/canvas.ts`（HiDPI）、`lib/pdf.ts`（导出，jsPDF 动态加载）。

### 路由（App Router）

- `app/page.tsx` —— **服务端组件**，Hero 静态 + 客户端岛屿 `app/_components/home-modules.tsx`。
- `app/copybook/[type]/page.tsx` —— 服务端组件，校验 `type` 后渲染客户端工作台 `CopybookWorkbenchShell`。
- `app/handwriting/page.tsx` —— 服务端组件，渲染客户端壳 `handwriting-sim-loader`（`next/dynamic` + `ssr:false` 按需加载 `handwriting-sim`）。
- `app/paper/page.tsx` —— 客户端页面。

### 字帖模板架构

- `app/copybook/copybook-metadata.ts` —— 类型注册表 + 能力位（capabilities），驱动左侧导航与可用控件。
- `app/copybook/_components/templates/<kind>/` —— 每种模板的「侧栏 / 内容卡 / 内容弹窗」三元组，由 `copybook-template-resolver.tsx` 解析。

## 常用命令

```bash
pnpm dev               # 开发
pnpm typecheck         # tsc --noEmit（改完必跑）
pnpm test:run          # 单元测试
pnpm lint              # ESLint
pnpm build             # 生产构建
```

提交前确保 `typecheck` + `test:run` + `lint` + `build` 全绿。提交信息遵循 Conventional Commits（`feat:`/`fix:`/…），commitlint 会校验。

## 改动建议

- 新增纯逻辑 → 放进对应纯模块并补 `lib/__tests__/*.test.ts`。
- 改 Canvas 绘制 → 注意 HiDPI（`setupHiDPICanvas` 用 `setTransform`，勿用累积的 `scale()`）。
- 改字帖工作台 → 留意 `CopybookWorkbenchShell` 的重绘依赖（`useCanvas` 的 `onDraw`，字体/笔顺就绪后自动重绘一次）。
- 新增依赖 → 优先确认在 npmmirror 可解析；带 native 构建的包需在 `pnpm-workspace.yaml` 的 `onlyBuiltDependencies`/`allowBuilds` 里声明。
