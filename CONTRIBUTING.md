# 贡献指南

感谢你关注字帖大师！🎉 无论是修 bug、加功能、改进文档，都欢迎提交 PR。

## 环境准备

- **Node.js ≥ 20.9**
- **pnpm ≥ 9**（`corepack enable` 或 `npm i -g pnpm`）
- 克隆仓库后：

```bash
pnpm install
pnpm dev   # http://localhost:3000
```

> 🇨🇳 中国大陆网络：仓库已默认使用 npmmirror 镜像（见 `.npmrc`），通常无需额外配置。

## 开发流程

1. **建分支**：从最新的 `main` 拉取，命名建议 `feat/xxx`、`fix/xxx`、`docs/xxx`。
2. **开发**：改动后请确保以下全部通过：

   ```bash
   pnpm typecheck   # 类型检查
   pnpm lint        # ESLint
   pnpm test:run    # 单元测试
   pnpm build       # 生产构建
   ```

3. **提交**：信息遵循 [Conventional Commits](https://www.conventionalcommits.org)，例如：

   ```
   feat(copybook): 支持回九格模板
   fix(pdf): 修正多页导出尺寸
   docs: 补充架构说明
   ```

   提交时 Husky 会自动运行 lint-staged（Prettier + ESLint）与 commitlint 校验。

4. **发 PR**：描述清楚动机与改动点，关联相关 Issue。等待 CI 通过后 review。

## 代码风格

- 使用 **Prettier**（配置见 `.prettierrc.json`，含 Tailwind class 排序插件）。
- TypeScript `strict` 模式；新增公共 API 需带类型与 JSDoc。
- 新增纯逻辑（无 Canvas / DOM 副作用）请放可在 Node 下单测的位置，并补充 Vitest 用例（见 `lib/__tests__/`）。
- 复用现有 shadcn/ui 组件，避免重复造轮子；如需新组件优先 `pnpm dlx shadcn@latest add ...`。

## 提交信息规范（Commitlint）

| 类型       | 用途               |
| ---------- | ------------------ |
| `feat`     | 新功能             |
| `fix`      | 修复缺陷           |
| `docs`     | 文档               |
| `style`    | 格式（不影响逻辑） |
| `refactor` | 重构               |
| `perf`     | 性能优化           |
| `test`     | 测试               |
| `chore`    | 构建 / 工具 / 杂务 |

作用域（可选）：`copybook` / `handwriting` / `paper` / `pdf` / `ui` 等。

## 报告缺陷 / 建议功能

请通过 GitHub Issue 模板提交，并附上复现步骤与截图。
