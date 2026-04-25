# 阶段 8A：任务列表体验优化

## 背景

当前前端首页以任务列表为入口，但任务资产状态、可操作性和筛选能力不足。用户往往需要进入 Studio 后才知道任务是否已有字幕、Markdown、关键帧或归档状态。

本阶段目标是让任务列表成为高效的任务管理入口：能快速搜索、判断状态、进入下一步操作。

## 目标

优化 `frontend/src/pages/TaskListPage.js`、`frontend/src/components/TaskList.js`、`frontend/src/components/CardView.js`、`frontend/src/components/TableView.js` 及相关样式/工具函数。

## 执行范围

### Step 1 - 任务状态信息

在列表/卡片中展示关键状态：

- 平台：YouTube、播客、小宇宙、其他。
- 是否归档。
- 是否存在视频/音频资产。
- 是否存在字幕：`vtt_files`、`srt_files`、`sentences_json_path`。
- 是否存在 Markdown：`markdown_path`、`srt_md_files` 等。
- 是否存在关键帧：`keyframes_count`、`keyframes_json_path`。

状态展示应简洁，优先使用标签、图标和短文本。

### Step 2 - 搜索与筛选

增加基础任务筛选：

- 搜索标题、URL、UUID。
- 按平台筛选。
- 按归档状态筛选。
- 按资产状态筛选：有字幕、有 Markdown、有关键帧。

筛选状态应在刷新前端页面时尽量保持，至少可使用 URL query 或 local state。

### Step 3 - 排序与信息密度

默认按 `last_modified` 或 `created_at` 倒序展示。

任务项应明确展示：

- 标题。
- 平台。
- 创建/更新时间。
- UUID 的短显示。
- 主要可用资产状态。
- 进入 Studio 的主操作。

避免把调试字段直接堆到 UI 上。

### Step 4 - 加载、空状态、错误状态

补齐：

- 首次加载态。
- 无任务空状态。
- 搜索无结果状态。
- API 错误状态。
- WebSocket 或自动刷新失败提示。

空状态应提供导入任务的直接入口。

## 验收标准

- 用户无需进入 Studio，即可判断任务是否有字幕、Markdown、关键帧。
- 能按标题/URL/UUID 搜索任务。
- 能按平台和资产状态筛选任务。
- 页面加载、空列表、错误状态都有明确 UI。
- 桌面与窄屏下文本不重叠，主要操作可访问。

## 验证命令

至少运行：

```bash
cd frontend && npm test -- --watchAll=false
cd frontend && npm run build
```

如涉及后端字段消费，还需确认 `/api/tasks` 或当前任务列表 API 的响应字段足够支撑 UI。

## 报告要求

将执行报告写入：

```text
tasks/reports/2026-04-25-stage-8a-task-list-experience-upgrade-report.md
```

报告需包含：

- 修改的页面/组件。
- 新增的筛选和状态字段。
- 运行过的验证命令。
- 尚未处理的体验问题。
