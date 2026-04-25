# 阶段 9D：前端构建 Warning 清理

## 背景

阶段 9A/9B 后，`frontend` 的生产构建可以通过，但仍存在 CSS minimizer warning：

```text
postcss-calc:: Lexical error on line 1: Unrecognized text.

Erroneous area:
1: infinity * 1px
```

该 warning 不阻断构建，但会污染验证结果，使后续 UI 阶段难以判断是否引入了新的构建问题。

## 目标

让以下命令通过且不产生该 CSS minimizer warning：

```bash
cd frontend && npm run build
```

## 执行范围

重点检查：

- `frontend/src/index.css`
- `frontend/src/styles/tokens.css`
- `frontend/tailwind.config.js`
- daisyUI 5 与 CRA / css-minimizer / postcss-calc 的兼容输出
- 最近引入的 theme token、radius、tab、button 等 daisyUI 配置

## 排查方向

### Step 1 - 定位来源

确认 `infinity * 1px` 来自：

- 手写 CSS。
- Tailwind 编译产物。
- daisyUI 主题配置。
- 某个 daisyUI 组件变量。

可通过逐步注释配置或检查 build CSS 产物定位。

### Step 2 - 优先保守修复

优先选择低风险修复：

- 调整 daisyUI 配置中可疑 token。
- 避免生成 `calc(infinity * 1px)` 一类 CSS。
- 如确认为 daisyUI/CRA 组合问题，采用项目内兼容配置，而不是忽略 warning。

不要为了消除 warning 大范围重写设计系统。

### Step 3 - 保持视觉基线

修复后必须保持：

- `yanghoo-workbench` 主题仍为默认主题。
- Stage 9A 的 token 仍可用。
- Stage 9B 已对齐组件不发生明显视觉回退。

## 验收标准

- `cd frontend && npm run build` 成功。
- 构建输出不再出现 `postcss-calc` / `infinity * 1px` warning。
- 无新增 ESLint warning。
- 视觉主题仍为 `yanghoo-workbench`。

## 报告要求

将执行报告写入：

```text
tasks/reports/2026-04-25-stage-9d-frontend-build-warning-cleanup-report.md
```

报告需包含：

- warning 根因。
- 修改的文件。
- 为什么选择该修复方式。
- `npm run build` 最终结果。
