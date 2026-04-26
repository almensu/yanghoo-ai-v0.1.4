# 阶段 10：前端交互与响应式 QA

## 背景

阶段 8 完成了任务列表和字幕阅读体验升级，阶段 9 完成了设计系统、核心组件视觉统一、Studio Workbench 刷新以及干净构建环境。下一步需要做一次面向真实使用的前端 QA，确保现代化后的界面在不同任务状态、屏幕宽度和操作路径下稳定可用。

本阶段不以新增功能为主，重点是发现并修复交互、布局、状态展示和响应式问题。

## 目标

对以下核心前端区域进行系统检查：

- TaskList / TaskListPage
- Studio / StudioWorkSpace
- VideoPlayer / VttPreviewer
- SentencesViewer
- AIChat
- KeyframeClipPanel
- Sidebar

## 执行范围

### Step 1 - 真实数据路径检查

至少用以下任务类型验证：

- 没有字幕/Markdown/关键帧的新任务。
- 有普通 VTT/SRT 的旧任务。
- 有 Stage 6 `sentences_json_path` 和 `markdown_path` 的 YouTube 任务。
- 有关键帧数据的任务。
- 归档任务。

检查任务列表和 Studio 中的资产状态是否一致。

### Step 2 - 响应式布局检查

至少检查以下宽度：

- 1440px desktop
- 1280px laptop
- 1024px narrow desktop
- 768px tablet
- 390px mobile

重点确认：

- 文本不重叠。
- 工具栏可换行或滚动。
- TableView 不撑破页面。
- Studio 三栏在窄屏下仍可操作。
- Refined Reader 长句不撑破面板。
- AIChat 输入区和文件选择区不溢出。

### Step 3 - 状态 UI 检查

覆盖并修复：

- 首次加载。
- API 错误。
- 空任务列表。
- 搜索无结果。
- 无字幕。
- 无 Markdown。
- 无 refined sentences。
- 无关键帧。
- 长任务处理中。

状态文案应短、明确、可执行。

### Step 4 - 关键交互路径

逐项验证：

- 导入任务后刷新列表。
- 搜索、筛选、排序、视图切换。
- 进入 Studio。
- Documents / Refined 切换。
- 点击时间戳跳转视频。
- 播放视频时当前句高亮。
- VTT/SRT 字幕预览。
- AIChat 引用文档或任务内容。
- 关键帧面板选择、跳转和清空。

### Step 5 - 可访问性与键盘体验

检查：

- 主要按钮有 `title` 或可理解文本。
- icon-only button 有 tooltip/title。
- focus-visible 清晰。
- Tab 顺序基本可用。
- 颜色不只依赖色相表达状态。

## 验收标准

- `npm run build` 无 error、无 warning。
- 主要页面在 1440 / 1280 / 1024 / 768 / 390 宽度下无明显布局破损。
- TaskList 与 Studio 对同一任务的资产状态展示一致。
- 空/错/加载状态不再出现空白面板。
- Refined Reader 的跳转和高亮在真实 Stage 6 任务中可用。
- 不破坏旧任务的 VTT/SRT/WhisperX 阅读路径。

## 验证命令

至少运行：

```bash
cd frontend && npm run build
```

建议补充：

```bash
cd frontend && npm test -- --watchAll=false
```

如果启动本地环境验证：

```bash
./start.sh
./stop.sh
```

## 报告要求

将执行报告写入：

```text
tasks/reports/2026-04-26-stage-10-frontend-interaction-responsive-qa-report.md
```

报告需包含：

- 检查过的页面和组件。
- 检查过的屏幕宽度。
- 使用过的任务类型。
- 发现并修复的问题列表。
- 未修复但已记录的风险。
- 构建/测试命令结果。
