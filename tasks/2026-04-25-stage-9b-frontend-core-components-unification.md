# 阶段 9B：核心组件视觉对齐 (Core Components Unification)

你是 gemini。在 9A 建立了设计系统基础后，本阶段目标是将设计令牌（Tokens）深度应用到现有核心组件中，消除视觉上的“补丁感”，实现全站一致的 **Modern Editorial Workbench** 风格。

## 目标

1.  **AIChat 视觉重构**: 
    - 移除顶部的蓝紫渐变，改为基于 `--wb-bg-page` 和细边框的专业风格。
    - 统一聊天气泡样式，使用 `--wb-bg-panel` 和极轻阴影。
    - 优化“思考块”外观，使用更淡的边框色，模拟终端或日志的专业感。
2.  **任务列表 (Home) 对齐**:
    - 将 `CardView` 的卡片容器改为 `.wb-card`。
    - 统一 Badge 样式，确保 Platform (YouTube/Podcast) 和 Status (Refined/MD) 标签具有一致的高度和字体。
3.  **Studio 交互层级优化**:
    - 优化 `StudioWorkSpace` 的 Tab 切换样式，确保激活态具有明显的品牌色 (`--wb-accent`) 指示。
    - 调整右侧面板的间距，确保在不同分辨率下都有良好的信息密度。
4.  **全局状态组件**:
    - 统一 Loading 动画颜色为 `primary`。
    - 统一 Empty State 的图标和文字颜色为 `text-muted`。

## 强制约束

1.  **严禁引入新 CSS 文件**: 优先使用 Tailwind 类和 `tokens.css` 中已定义的类。
2.  **保持信息密度**: 不要为了“美观”而大幅增加 Padding 导致一屏显示内容变少。
3.  **不改变功能逻辑**: 仅修改 `className` 或少量的 HTML 结构。

## 执行步骤

### Step 1 - AIChat.js 令牌化
- 修改容器背景、消息气泡、输入框阴影。
- 替换内联颜色值为 Tailwind 颜色（如 `bg-base-100`, `border-base-300`）。

### Step 2 - Task List (Card/Table) 令牌化
- 在 `CardView.js` 中引入 `.wb-card`。
- 在 `TableView.js` 中优化 `tr:hover` 的背景色。

### Step 3 - Studio 细部调优
- 调整 `Studio.js` 中的左/中/右面板间距。
- 确保 `VttPreviewer` 的高亮色使用设计系统的 `accent`。

### Step 4 - 验证
- 运行 `npm run build` 确保无样式类冲突。

## 报告要求
将执行报告写入：`tasks/reports/2026-04-25-stage-9b-frontend-core-components-unification-report.md`。

## 最终回复主控
完成后回复：
- 已重构的组件列表。
- 视觉变化最显著的部分。
- 报告路径。
