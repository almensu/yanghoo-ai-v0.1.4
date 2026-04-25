# 阶段 8C：字幕与文档阅读体验优化

## 背景

阶段 6 已引入 `transcript-sentences.json`、`transcripts/youtube/transcript.md` 和句子级 VTT。前端需要优先消费这些资产，使 YouTube 字幕清洗成果能被用户直接阅读、跳转和校对。

本阶段目标是优化 Studio 内字幕/文档阅读链路：时间戳可跳转、播放进度可高亮句子、资产缺失时有明确操作入口。

## 目标

重点检查并优化：

- `frontend/src/pages/StudioPage.js`
- `frontend/src/components/StudioWorkSpace.js`
- `frontend/src/components/MarkdownViewer.js`
- `frontend/src/components/MarkdownWithTimestamps.js`
- `frontend/src/components/VttPreviewer.js`
- `frontend/src/components/VideoPlayer.js`
- `frontend/src/utils/timestampUtils.js`

## 执行范围

### Step 1 - 资产优先级

Studio 读取字幕/文档时应优先使用阶段 6 资产：

1. `sentences_json_path`
2. `markdown_path`
3. `vtt_files`
4. 旧的 SRT/WhisperX Markdown 字段

如果资产不存在，显示明确的缺失状态和下一步操作，而不是空白面板。

### Step 2 - 时间戳跳转

Markdown 中 `[HH:MM:SS]`、`[HH:MM:SS.mmm]` 或 YouTube 跳转链接应能触发本地播放器 seek。

要求：

- 点击时间戳后视频跳转到对应秒数。
- 不破坏普通 Markdown 链接。
- 支持小时、分钟、秒格式。
- 对非法时间戳安全忽略。

### Step 3 - 当前句子高亮

当存在 `transcript-sentences.json` 时：

- 根据播放器当前时间找到对应句子。
- 在字幕/句子列表中高亮当前句子。
- 当前句子变化时避免频繁重排或滚动抖动。
- 用户手动滚动时不要强行抢焦点。

### Step 4 - 阅读视图切换

提供清晰的视图切换：

- Markdown 文档视图。
- 句子流视图。
- VTT 预览视图。

视图切换应保留当前任务上下文和播放器状态。

## 验收标准

- YouTube stage 6 任务能直接打开 Markdown 或 sentences 视图。
- 点击 Markdown 时间戳能跳转本地视频播放器。
- 播放视频时当前句子可高亮。
- 无字幕/无 Markdown 时有可执行提示。
- 不影响旧任务的 VTT/SRT/WhisperX 阅读能力。

## 验证命令

至少运行：

```bash
cd frontend && npm test -- --watchAll=false
cd frontend && npm run build
```

建议配合一个已有 YouTube stage 6 任务做手动验证：

- 打开 Studio。
- 切换 Markdown / sentences / VTT。
- 点击多个时间戳。
- 播放视频并观察高亮。

## 报告要求

将执行报告写入：

```text
tasks/reports/2026-04-25-stage-8c-transcript-reading-experience-report.md
```

报告需包含：

- 实际使用的字幕资产优先级。
- 时间戳格式支持范围。
- 高亮逻辑说明。
- 兼容旧任务的验证结果。
- 执行过的验证命令。
