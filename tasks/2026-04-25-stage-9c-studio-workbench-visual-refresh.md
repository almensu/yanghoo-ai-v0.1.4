# 阶段 9C：Studio Workbench 现代化视觉刷新

## 背景

阶段 9A 建立了设计系统基础，阶段 9B 已将部分核心组件对齐到 **Modern Editorial Workbench** 风格。Studio 仍是项目中最复杂、最关键的工作界面，需要进一步统一信息层级、面板语言和字幕阅读体验。

本阶段目标是让 Studio 从“多功能拼接界面”升级为专业的视频/字幕/文档工作台。

## 前置条件

建议先完成阶段 9D，确保：

```bash
cd frontend && npm run build
```

无 CSS minimizer warning。

## 目标文件

重点优化：

- `frontend/src/components/Studio.js`
- `frontend/src/components/StudioWorkSpace.js`
- `frontend/src/components/SentencesViewer.js`
- `frontend/src/components/VideoPlayer.js`
- `frontend/src/components/VttPreviewer.js`
- 必要时复用 `frontend/src/styles/tokens.css`

## 设计原则

- Studio 是生产工具，不是展示页。
- 保持高信息密度，避免大 padding 和大阴影。
- 使用细边框、分隔线、紧凑 toolbar、明确 active state。
- 控制按钮优先使用 icon button，并提供 tooltip/title。
- 不引入大面积渐变、装饰性背景、过圆卡片。

## 执行范围

### Step 1 - Studio 顶部任务摘要栏

增加或优化顶部摘要区域：

- 任务标题。
- 平台。
- UUID 短码。
- 资产状态：视频、字幕、Markdown、Refined、关键帧。
- 当前主要操作状态。

摘要栏应紧凑，不挤占主工作区。

### Step 2 - 三栏布局层级统一

统一 Studio 主布局：

- 视频/字幕区。
- AI / 操作区。
- Workspace / 文档区。

要求：

- 面板边框、背景、间距一致。
- 减少嵌套卡片。
- 滚动区域边界清晰。
- 窄屏下不发生文字重叠。

### Step 3 - Refined Transcript Reader

重点打磨 `SentencesViewer.js`：

- 时间戳列与正文列对齐。
- 当前句高亮使用 `--wb-accent` 低透明度版本。
- hover 状态清晰但克制。
- 点击时间戳/句子跳转视频。
- 自动滚动不要抢用户手动滚动焦点。
- 长句换行稳定，不撑破面板。

### Step 4 - Video / VTT 视觉对齐

优化：

- `VideoPlayer` 控制区按钮。
- 字幕预览区。
- VTT cue 高亮状态。
- 时间戳导航按钮。

所有颜色和状态尽量使用 9A token 或 daisyUI 主题色。

## 验收标准

- Studio 整体视觉与 TaskList/AIChat 风格一致。
- 面板层级清楚，主要操作不被次要信息抢占。
- Refined 句子流阅读体验明显提升。
- 桌面和窄屏无明显重叠或横向撑破。
- 不破坏旧任务的 VTT/SRT/WhisperX 工作流。

## 验证命令

至少运行：

```bash
cd frontend && npm run build
```

建议手动验证：

- 打开普通任务 Studio。
- 打开有 Stage 6 `sentences_json_path` 的 YouTube 任务。
- 切换 Documents / Refined。
- 播放视频观察当前句高亮。
- 点击时间戳跳转。
- 检查窄屏布局。

## 报告要求

将执行报告写入：

```text
tasks/reports/2026-04-25-stage-9c-studio-workbench-visual-refresh-report.md
```

报告需包含：

- 修改的组件。
- Studio 顶部摘要栏字段。
- Refined reader 的视觉和交互改动。
- 兼容旧任务的验证结果。
- `npm run build` 结果。
