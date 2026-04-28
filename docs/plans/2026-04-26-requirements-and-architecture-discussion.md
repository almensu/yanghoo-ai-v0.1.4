# 需求与架构讨论稿：URL 到字幕与 LLM 内容生成工作台

## 1. 项目本质

这个项目不是传统“视频下载器”，也不是普通“笔记软件”。它的主轴是：

```text
从互联网收集视频/播客/短视频/网页来源
-> 获取或生成高质量字幕/转录文本
-> 组织成可阅读、可引用、可对话的知识文档
-> 供 LLM 生成新内容
```

因此产品应定义为 **Source-to-Transcript-to-LLM Workbench**。

核心对象不是“视频文件”，而是：

- Source: 互联网上的来源 URL。
- Transcript: 从来源得到的字幕/转录。
- Document: 可阅读、可引用、可供 LLM 使用的文档资产。
- Conversation: 围绕来源和文档进行的问答与内容生成。

## 2. 用户真实需求

用户从互联网收集：

- 视频 URL，例如 YouTube。
- 播客 URL，例如小宇宙 Xiaoyuzhou；Apple Podcasts 属于同一类，但不是同一个平台。
- 短视频 URL，例如抖音、 小红书。
- 频道 URL，例如 YouTube channel / playlist / podcast feed。
- X / Twitter 网页或帖子。
- 未来可能还有普通网页、文章、RSS、Bilibili 等。

用户的目的不是“下载资源本身”，而是：

1. 快速收集来源。
2. 判断来源是否可处理。
3. 获得字幕或转录文本。
4. 形成结构化文档。
5. 用本地模型或 API 模型与资料对话。
6. 基于资料生成新内容，例如摘要、文章、脚本、学习材料。

## 3. 产品入口

### 3.1 URL 收集卡片页面

这是首页和主入口。

职责：

- 粘贴 URL。
- 批量导入 URL。
- 展示所有 source card。
- 展示每个 source 的处理状态。
- 提供主动作：`Ensure Transcript` / `Read` / `Chat`。

卡片关注内容价值，而不是底层文件操作。

建议卡片字段：

```text
title
source class
platform
thumbnail
channel/author
duration/date
transcript status
document status
conversation status
last updated
```

### 3.2 频道收集页面

频道页面不是简单列表，而是 source discovery。

职责：

- 输入频道 URL。
- 展开频道下的视频/音频条目。
- 选择要加入资料库的条目。
- 批量执行 metadata fetch。
- 批量触发 transcript ensure。

频道本身应建模为 `CollectionSource`，频道中的单条视频/播客是 `SourceItem`。

### 3.3 平台 URL 收集器

前期目标不是先做复杂知识库，而是先把各个平台的 URL 收集器落盘，并打通文字稿获取。

建议第一批 collector/adapter 命名：

```text
youtubeSourceAdapter
xiaoyuzhouSourceAdapter
douyinSourceAdapter
xiaohongshuSourceAdapter
applePodcastSourceAdapter
```

MVP 先实现 YouTube + Xiaoyuzhou。Douyin、小红书、Apple Podcasts 进入明确的 adapter roadmap，避免后续临时拼接脚本。

### 3.4 X 网页收集

X/Twitter 来源与视频不同。

可能包含：

- 单条 tweet。
- thread。
- embedded video。
- external link。
- author context。

X 入口不应强行套视频模型。它应先进入 `source capture`，然后根据内容类型派发：

```text
text-only -> document extraction
video/audio -> transcript pipeline
external link -> webpage/article pipeline
```

## 4. Transcript Pipeline

统一主动作：

```text
Ensure Transcript
```

系统内部按优先级选择路径：

```text
1. 平台原生字幕 / Baoyu YouTube InnerTube
2. 已有 VTT / SRT / caption file
3. 如果只有音频或可提取音频，则使用 mlx-audio
4. 手动上传字幕
```

用户不应该在卡片上面对一堆按钮，例如“下载 VTT / WhisperX / 合并 / 转码”。这些属于 pipeline 内部细节。

### 4.1 YouTube

优先使用 Baoyu/InnerTube 字幕能力：

- transcript raw snippets
- language list
- chapters
- metadata
- thumbnail
- cache

输出统一资产：

```text
transcript-raw.json
transcript-sentences.json
transcript.md
transcript.vtt
```

### 4.2 Xiaoyuzhou / Podcast Audio

小宇宙 Xiaoyuzhou 是 `podcast_audio` 类下的第一个平台适配器。Apple Podcasts 与它属于同一类，但应作为独立平台 adapter。

如果来源只有音频：

- 下载或定位音频。
- 使用 `mlx-audio` 转录。
- 转成统一 raw snippets 或 segment schema。
- 再进入 refiner。

### 4.3 Douyin / Xiaohongshu Short Video

抖音和小红书属于 `short_video` 类。产品逻辑与其他媒体来源保持一致：

```text
收集 URL -> 获取 metadata/media -> 提取或定位音频 -> mlx-audio 转录 -> refiner -> document
```

平台差异只应存在于 `source-adapters`，不要泄漏到 transcript/refiner/domain。

### 4.4 Refiner

无论来源是 YouTube 字幕、VTT/SRT，还是 mlx-audio，都必须进入统一 refiner。

refiner 负责：

- 语义断句。
- 时间戳校准。
- CJK 空格处理。
- 生成 sentence-level transcript。
- 输出 Markdown / VTT。

## 5. NotebookLM-like Workspace

目标不是复刻 UI，而是学习它的信息架构：

```text
左侧：Sources / documents
中间：Reader / transcript / notes
右侧：Chat / generation
```

建议布局：

### Source Library

- URL cards。
- 频道 collections。
- document status。
- batch actions。

### Source Workspace

进入单个 source 后：

- 左侧 source/doc list。
- 中间 reader：Markdown / Sentences / VTT。
- 右侧 chat：基于当前 source 或 selected sources。

### Chat Mechanism

对话必须有 scope：

```text
current source
selected sources
collection/channel
all library
```

每次回答应能引用来源：

- source title
- timestamp
- sentence range
- document section

后续生成内容也应保存为 `GeneratedDocument`，而不是只停留在聊天消息中。

## 6. LLM 接入

支持两类模型：

- Local model：Ollama、LM Studio、OpenAI-compatible local server 等。
- API model：OpenAI、Gemini、Claude、智谱等。

架构上不应让前端直接绑定某个 provider。

建议设计：

```text
LLMProvider
LLMModel
Conversation
ConversationMessage
GenerationJob
```

Provider adapter 应放在 infrastructure/adapters，不进入 domain。

## 7. 推荐架构

按参考项目方法论，先定层：

```text
apps/web
apps/api
packages/domain
packages/application
packages/adapters
packages/ui
packages/config
docs
tests
examples
data
```

当前决策：正式迁到 `apps/` + `packages/` 新架构，不保留旧的顶层 `frontend/` / `backend/` app 结构。已有 greenfield scaffold 仅作为过渡，后续由 Gemini 迁移。

建议长期结构：

```text
.
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── domain/
│   ├── application/
│   ├── transcript/
│   ├── source-adapters/
│   ├── llm-adapters/
│   ├── storage/
│   └── ui/
├── docs/
│   ├── plans/
│   ├── architecture/
│   └── decisions/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── examples/
└── data/
```

## 8. Domain Model 草案

```text
Source
- id
- url
- sourceClass: long_video | podcast_audio | short_video | webpage | social_post | channel | feed
- platform: youtube | xiaoyuzhou | apple_podcast | douyin | xiaohongshu | x | webpage | bilibili | other
- title
- author/channel
- thumbnail
- duration
- capturedAt
- status

Collection
- id
- type: channel | playlist | feed | manual
- url
- title
- sourceIds

TranscriptAsset
- id
- sourceId
- source: platform_caption | vtt | srt | mlx_audio | manual
- language
- rawPath
- sentencesPath
- vttPath
- status
- engine
- model
- generatedAt

DocumentAsset
- id
- sourceId
- transcriptId
- markdownPath
- sections
- chapters
- status

Conversation
- id
- scopeType: source | selected_sources | collection | library
- scopeIds
- modelProvider
- modelName

GeneratedDocument
- id
- conversationId
- sourceIds
- type: summary | article | script | study_notes | custom
- markdownPath
```

## 9. 第一版 MVP 范围

第一版只做：

1. URL 收集卡片页面。
2. YouTube URL ingest。
3. Xiaoyuzhou URL ingest。
4. YouTube 字幕优先获取。
5. Xiaoyuzhou/audio fallback 使用 mlx-audio。
6. 统一 transcript refiner。
7. 单 source reader。
8. 单 source chat。

暂缓：

- 多频道复杂同步。
- Keyframes。
- 视频剪辑。
- ASS 字幕。
- 多人协作。
- 复杂知识库检索。
- X/Twitter 深度采集。
- 通用网页/RSS 深度采集。
- Apple Podcasts、抖音、小红书的真实下载/采集实现。

## 10. 待敲定问题

1. 是否需要保存完整视频/音频，还是只保存 transcript/document？
2. NotebookLM-like chat 第一版是否需要引用精确 timestamp？
3. URL 卡片页面是否需要 batch import？
4. 频道收集页面第一版是否只做 YouTube channel/playlist？
5. 抖音/小红书第一版是否只保存 URL 和 metadata，还是立即进入真实下载与转录？

## 11. 建议下一步

先不要写业务实现。下一步应敲定：

1. `Source` / `TranscriptAsset` / `DocumentAsset` 的最终字段。
2. apps/packages 目录迁移任务。
3. LLM gateway 的接口草案。
4. 第一批 Gemini 执行任务。

建议先让 Gemini 执行 Stage 1 apps/packages 骨架迁移，并在 `packages/domain` 固化 `sourceClass` / `platform`，再进入各平台 collector 的实现任务。
