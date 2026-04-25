# 阶段 6：YouTube 字幕引擎升级 (Refined Transcript Engine)

你是 glm。本阶段目标是深度集成 **宝玉 (Baoyu)** 的 YouTube 字幕清洗方法论，重构项目的 YouTube 资产处理流程。

## 0. 参考对象 (Reference)
你必须参考并复刻以下技能文件中的核心逻辑与资产组织方式：
`Users/yanghoomacmini/claude-model/.claude-zhipu/skills/baoyu-youtube-transcript/SKILL.md`

**核心借鉴点：**
- **资产组织**：建立 `transcript-raw.json` (缓存) 和 `transcript-sentences.json` (精制品)。
- **语义断句**：使用正则表达式识别中英文标点，实现自然断句，而非依赖 YouTube 原始的碎片化切分。
- **时间校准**：通过字符长度比例，将长句的时间戳精确映射回原始片段。

## 1. 核心算法规格 (Algorithm Specification)

你必须在 Python 中复刻以下逻辑：

### 场景 A：线性时间戳分配
假设原始片段 S1 (10字符, 0-2s)。如果你提取其中前 5 个字符，其起止时间应为 0-1s。
公式：`char_time = snippet_start + (snippet_duration * char_offset / total_chars_in_snippet)`。

### 场景 B：CJK 断句处理
使用正则 `([^.?!…。？！]+[.?!…。？！]*)` 提取句子。确保标点符号不被丢弃，且紧跟在句子末尾。

## 2. 目标资产结构

```text
backend/data/{uuid}/
├── meta.json                  # 包含标题、时长、章节 (chapters)、作者信息
├── transcript-raw.json        # 原始原子片段数组 (Cache)
├── transcript-sentences.json   # 【核心】清洗后的句子流: [{"text": "...", "start": 1.2, "end": 3.5}]
└── transcripts/
    └── youtube/
        ├── transcript.md      # 带 YAML 头、章节标题、[HH:MM:SS] 时间戳链接
        └── transcript.vtt     # 播放器用：基于 sentences.json 重新生成的 VTT
```

## 3. 详细执行步骤

### Step 1 - 开发清洗工具 (`backend/src/utils/transcript_refiner.py`)
创建 `TranscriptRefiner` 类：
1. **铺平与映射**：将所有 raw snippets 合并为 `full_text`，并生成一个 `char_timestamps` 数组，记录每个字符的精确估计时间。
2. **断句执行**：根据正则切分 `full_text`，并根据切分位置从 `char_timestamps` 中取值。

### Step 2 - YouTube API 适配 (`backend/src/tasks/youtube_api.py`)
1. **数据源获取**：使用 `yt-dlp` 的 `json3` 格式，它是最接近原子 Snippets 的数据源。
2. **章节提取**：解析视频描述中的时间戳（如 `01:23 Intro`）。

### Step 3 - 系统集成 (`backend/src/routes/tasks.py`)
1. **重构 Ingest**：对于 YouTube 任务，跳过原有的 VTT 下载/合并逻辑，改为执行上述精制流程。
2. **元数据注册**：将 `transcript-sentences.json` 的路径记录到任务信息中，方便前端调用。

## 4. 验证标准 (Verification)
1. **句子级跳转**：点击 Markdown 中的时间戳，视频应能精准跳转。
2. **字幕质量**：VTT 字幕不应出现半截话或跨句合并。
3. **性能**：处理一个 1 小时的视频，清洗耗时应在秒级。

## 报告要求
将报告写入：`tasks/reports/2026-04-25-stage-6-youtube-transcript-engine-upgrade-report.md`。
需对比说明 `sentences.json` 的生成质量。
