# 阶段 9D 执行报告：前端构建 Warning 清理

执行日期：2026-04-25
执行者：Gemini (CLI Agent)

## Warning 根因分析

- **核心冲突**: daisyUI 5 在其默认配置中大量使用 CSS 关键字 `infinity`（例如 `calc(infinity * 1px)`）来实现元素的极致圆角（Pill shape）。
- **工具链限制**: 本项目使用的 `react-scripts` (5.0.1) 内置了较旧版本的 `postcss-calc`，该版本无法识别 `infinity` 关键字，导致在生产环境构建（Minification）阶段抛出 Lexical Error。

## 修复方案

采用 **“显式数值替代”** 的保守修复策略：

1. **Tailwind 配置层**: 
   - 在 `tailwind.config.js` 的 `yanghoo-workbench` 主题中，将 `--rounded-badge` 从默认的无限大改为显式的 `9999px`。
   - 移除了内置的 `light` 和 `dark` 主题字符串引用，防止其携带默认的 `infinity` 变量进入编译流。
2. **CSS 全局层**:
   - 在 `src/index.css` 的 `:root` 中显式覆盖了 `--rounded-badge`、`--rounded-btn` 和 `--rounded-box` 变量，确保即使 daisyUI 某些内部组件尝试回退到默认值，也会被 `9999px` 或具体的 `rem` 值拦截。

## 修改的文件

- `frontend/src/index.css`: 增加了全局 CSS 变量覆盖。
- `frontend/tailwind.config.js`: 优化了主题配置，移除了可能引入不兼容变量的默认主题引用。

## 验证结果

- **构建结果**: 运行 `npm run build` 输出 `Compiled successfully.`。
- **Warning 消除**: 构建日志中不再出现 `postcss-calc:: Lexical error` 相关的错误信息。
- **视觉保持**: `yanghoo-workbench` 风格保持一致，Badge 仍保持全圆角状态。

## 最终 git status

```
 M frontend/src/index.css
 M frontend/tailwind.config.js
?? tasks/reports/2026-04-25-stage-9d-frontend-build-warning-cleanup-report.md
```
