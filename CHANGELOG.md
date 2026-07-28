# 更新日志

本项目所有重要变更均会记录在本文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本管理遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

- **开源项目化**：新增 [CONTRIBUTING.md](./CONTRIBUTING.md)、[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)、Issue / PR 模板、GitHub Actions CI（lint + typecheck + test + build）。
- **SEO 与应用外壳**：完善站点元数据（OpenGraph / Twitter / keywords / metadataBase）、动态 OG 图（`app/opengraph-image.tsx`，`next/og`）、`sitemap.ts`、`robots.ts`、`manifest.ts`、`app/icon.svg`，以及 `error.tsx` / `loading.tsx` / 自定义 `not-found.tsx`。
- **单元测试**：引入 Vitest，覆盖纯逻辑模块——拼音（`pinyin.ts`）、工具（`utils.ts`）、纸张几何（`lib/paper/geometry.ts`）、SVG 序列化（`svg.ts`）、字体注册表（`fonts.ts`）。
- **开发体验**：Husky + lint-staged + commitlint（Conventional Commits）；新增 `typecheck` / `test` / `test:run` / `test:coverage` / `lint:fix` 脚本。
- **React 19 / Next 16 现代化**：首页改造为服务端组件 + 客户端岛屿（`app/_components/home-modules.tsx`）；手写模拟器改用 `next/dynamic` + `ssr:false` 客户端壳按需加载。
- 独立的 `viewport` 导出与 `themeColor`。

### Changed

- **架构**：将纯几何换算从 `lib/paper.ts` 抽出为无 Canvas 依赖的 `lib/paper/geometry.ts`（原模块透出，零行为变更）。
- **打包**：`jspdf` 改为导出时动态加载，不再进入首屏 bundle；`next.config.ts` 启用 `optimizePackageImports`（lucide-react / motion / radix-ui）与生产环境 `removeConsole`。
- README 由 `create-next-app` 默认模板替换为正式项目文档。
- 字帖工作台容器加宽至 `1400px`，画布在左导航与右设置面板之间居中（修复三列布局溢出导致的偏移）。

### Notes

- 本应用为纯客户端、无后端架构，故刻意未引入 React Server Actions（所有「变更」均为本地设置驱动画布）。

## 历史

- `feat(字帖,动效,技能文档)`：新增字帖生成功能、全局动效配置与官方技能文档。
- `feat(copybook)`：完善字帖编辑功能，重构页面模块（左导航分组模板）。
- `refactor(grid drawing)`：重构网格绘制逻辑，统一内边距比例。
