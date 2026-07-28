# 字帖大师 · Worksheet Studio

> 字帖工坊 / 手写模拟器 / 纸张工厂 —— 输入内容即可生成可打印字帖，完全免费、无需登录。

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38bdf8)](https://tailwindcss.com)
[![CI](https://img.shields.io/badge/CI-passing-brightgreen)](./.github/workflows/ci.yml)

字帖大师是一个纯前端、开箱即用的字帖与纸张生成平台。所有渲染在浏览器本地完成，
**不上传任何内容、无需注册登录**，导出 PDF / PNG / SVG 直接下载。

## ✨ 功能

| 模块                          | 说明                                                                                                                                                 |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **字帖工坊** `/copybook`      | 汉字、词组、段落、笔画、拼音、英文、数字、控笔——十大模板，支持田字格/米字格/回宫格/九宫格/圆米格等多种格子，描红/空心/实心多模式，多音字可切换读音。 |
| **手写模拟器** `/handwriting` | 文本转手写体，支持涂改、位置/笔画/字形凌乱度调节，多种纸张质感；可从 `.txt / .docx / .pdf / 图片`(OCR) 导入文本。                                    |
| **纸张工厂** `/paper`         | 方格、横线、点阵、康奈尔、五线谱、田字格、米字格、回宫格、拼音格、作文格，导出 PDF/PNG/SVG。                                                         |

## 🧱 技术栈

- **[Next.js 16](https://nextjs.org)**（App Router · Turbopack）+ **[React 19](https://react.dev)**
- **[Tailwind CSS v4](https://tailwindcss.com)**（oklch 色彩、CSS 变量主题）
- **[shadcn/ui](https://ui.shadcn.com)**（New York 风格，基于 Radix）
- **[Motion](https://motion.dev)** 动效
- Canvas 直绘 + jsPDF 导出（不经过 html2canvas，规避 oklch 解析问题）
- 自托管中文字体（霞鹜文楷等，按 unicode-range 子集懒加载）
- **[Vitest](https://vitest.dev)** 单元测试 · pnpm · ESLint · Prettier · Husky + Commitlint

## 🚀 快速开始

> 需要 **Node.js ≥ 20.9** 与 **pnpm ≥ 9**。

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
# 打开 http://localhost:3000
```

<details>
<summary>🇨🇳 中国大陆网络加速</summary>

项目已默认走 npm 镜像（见 [`.npmrc`](./.npmrc)）：

```ini
registry=https://registry.npmmirror.com
```

如未生效，可手动执行 `pnpm install --registry=https://registry.npmmirror.com`。
</details>

### 常用脚本

| 命令                                | 说明                                  |
| ----------------------------------- | ------------------------------------- |
| `pnpm dev`                          | 启动开发服务器（Turbopack）           |
| `pnpm build`                        | 生产构建                              |
| `pnpm start`                        | 启动生产服务器                        |
| `pnpm typecheck`                    | TypeScript 类型检查（`tsc --noEmit`） |
| `pnpm lint` / `pnpm lint:fix`       | ESLint 检查 / 自动修复                |
| `pnpm format` / `pnpm format:check` | Prettier 格式化 / 检查                |
| `pnpm test`                         | Vitest 监听模式                       |
| `pnpm test:run`                     | 单次运行测试                          |
| `pnpm test:coverage`                | 测试覆盖率报告                        |

## 📁 项目结构

```text
worksheet-studio/
├── app/                      # Next.js App Router
│   ├── copybook/             # 字帖工坊（模板化工作台）
│   ├── handwriting/          # 手写模拟器（动态加载）
│   ├── paper/                # 纸张工厂
│   ├── layout.tsx            # 根布局 + 元数据
│   ├── opengraph-image.tsx   # 动态 OG 图（next/og）
│   ├── sitemap.ts · robots.ts · manifest.ts
│   └── error.tsx · loading.tsx · not-found.tsx
├── components/               # 通用 UI（shadcn/ui + 业务组件）
├── hooks/                    # 自定义 Hooks（Canvas / 持久化 / 字体 / 导出）
├── lib/                      # 核心逻辑
│   ├── paper/geometry.ts     # 纯几何换算（mm↔px，无 Canvas，可单测）
│   ├── copybook.ts · paper.ts · handwriting.ts · stroke.ts
│   ├── pinyin.ts · fonts.ts · svg.ts · pdf.ts · canvas.ts
│   └── __tests__/            # Vitest 单元测试
└── types/                    # 全局类型
```

## 🏗️ 架构要点

- **纯客户端渲染**：字帖/手写/纸张均为 Canvas 直绘，数据存于 `localStorage`，**无后端、无数据库、无服务端写入**。因此刻意未引入 React Server Actions——所有「变更」都是本地设置驱动画布。
- **服务端组件 + 客户端岛屿**：首页与路由层用 Server Component，仅交互/动效部分下沉为客户端岛屿（如 `app/_components/home-modules.tsx`）。
- **按需加载重依赖**：`tesseract.js` / `mammoth` / `pdfjs-dist` 仅在文件导入时动态 `import()`；`jspdf` 在导出时才加载，不进首屏包。
- **纯逻辑可测**：几何换算、拼音、SVG 序列化等无副作用的纯函数从 Canvas 模块中抽出（`lib/paper/geometry.ts`），纳入 Vitest 覆盖。

## 🤝 贡献

欢迎提 Issue 与 PR！请阅读 [贡献指南](./CONTRIBUTING.md)。提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org)（如 `feat: ...`、`fix: ...`），由 commitlint 校验。

## 📄 许可证

[MIT](./LICENSE) © SK-ERIC
