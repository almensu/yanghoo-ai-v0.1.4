# 阶段 9A：前端设计系统基础升级

## 背景

当前前端可用性已经提升，但视觉基线仍偏工程调试界面：`App.css` 保留 CRA 默认样式，`index.css` 使用系统字体和零散局部样式，Tailwind/daisyUI 未定义项目专属主题。组件中大量重复的 `bg-white rounded-lg shadow` 造成视觉普通、层级不够精确。

本阶段目标是建立统一、现代、专业的视觉基础，为后续任务列表和 Studio 美化提供稳定设计令牌。

## 审美方向

采用 **Modern Editorial Workbench**：

- 面向视频、字幕、文档处理的专业工作台。
- 高信息密度，但保持清爽。
- 中性色为主，少量高对比强调色。
- 使用细边框、低阴影、明确间距和排版层级。
- 避免大面积渐变、装饰性光球、过圆卡片和营销页风格。

## 执行范围

### Step 1 - 清理基础样式

检查并清理：

- `frontend/src/App.css`
- `frontend/src/index.css`
- `frontend/tailwind.config.js`

移除 CRA 默认无用样式，例如 `.App-logo`、`.App-header` 等。

### Step 2 - 建立设计令牌

定义项目统一 token，可放在 `index.css` 或新增：

```text
frontend/src/styles/tokens.css
```

至少包含：

- page background
- panel background
- elevated surface
- border
- text primary
- text muted
- accent
- success
- warning
- danger
- focus ring

同时定义：

- 标准 panel。
- 标准 toolbar。
- 标准 badge。
- 标准 icon button。
- 标准 empty/error/loading state。

### Step 3 - Tailwind / daisyUI 主题

在 `tailwind.config.js` 中增加项目主题，例如 `yanghoo-workbench`。

要求：

- 不依赖 `cupcake` 作为默认主题。
- 颜色映射与 CSS token 保持一致。
- 保留 `light` / `dark` 可选，但主应用默认使用项目主题。

### Step 4 - 全局排版与滚动条

统一：

- 字体栈。
- 页面字号层级。
- line-height。
- code / monospace 样式。
- scrollbar 样式。
- focus-visible 样式。

不要用 viewport width 动态缩放字体。

## 验收标准

- 应用默认主题不再使用 `cupcake`。
- `App.css` 不再保留 CRA 默认样式。
- 全局按钮、输入框、badge、panel 有一致视觉基线。
- 页面背景、面板、边框、文字层级统一。
- 不引入大面积单色调或紫蓝渐变审美。

## 验证命令

至少运行：

```bash
cd frontend && npm run build
```

若修改影响测试：

```bash
cd frontend && npm test -- --watchAll=false
```

## 报告要求

将执行报告写入：

```text
tasks/reports/2026-04-25-stage-9a-frontend-design-system-foundation-report.md
```

报告需包含：

- 新增/修改的设计 token。
- 默认主题名称。
- 清理的旧样式。
- 验证命令和结果。
- 仍需视觉统一的组件清单。
