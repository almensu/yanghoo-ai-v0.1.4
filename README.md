# Yanghoo AI v0.3.0

Yanghoo AI is a transcript-first workbench for turning source URLs into readable timestamped documents.

The core workflow is:

```text
source video/url -> best transcript source -> refined sentence assets -> readable timestamped document
```

The product should expose document readiness and reading actions. It should not become a general-purpose media control panel.

## External Coordination Skill

Yanghoo AI stays independent from `Anything-to-English`.

An external Claude skill may coordinate the two projects without merging them:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
```

The skill exists to apply a Linux-style single-purpose boundary:

- Yanghoo AI remains the real-corpus engine for source URLs, captions, subtitle search, timestamped playback, and saved examples.
- `Anything-to-English` remains the personal scene compiler for raw life input, canonical blocks/scenes, runtime user state, and learning outputs.
- The skill acts only as an off-repo coordinator: it may read public/project-approved surfaces, create scene briefs, request real subtitle evidence, build temporary study packs, and audit boundary drift.

The skill must not merge repositories, copy large subtitle corpora into `Anything-to-English`, write `Anything-to-English` runtime state from Yanghoo internals, or let AI-generated English masquerade as real subtitle evidence.

## Current Capabilities

- Capture sources from supported platform URLs.
- Prefer platform captions when available.
- Download podcast/audio assets for audio-first sources such as Xiaoyuzhou.
- Transcribe local audio through MLX Audio when configured.
- Persist transcript, VTT, Markdown, and readiness metadata in the canonical data root.
- Read generated timestamped documents in the web app.

Transcript source priority:

```text
Baoyu/YouTube -> VTT/SRT -> mlx-audio -> manual upload
```

Shownotes, descriptions, chapters, and outlines are not transcripts. They may be stored as notes/chapters, but they must not be used to claim transcript readiness.

## Stack

- Web: React, TypeScript, Vite, Tailwind CSS, lucide-react
- API: Fastify, Node.js, TypeScript
- CLI: Node.js + TypeScript workspace app
- Workspace: npm workspaces
- Storage: local filesystem under `data/` or `DATA_DIR`
- Transcript engines: platform captions and MLX Audio
- LLM layer: provider-agnostic gateway with adapter packages

## Repository Layout

```text
.
├── apps/
│   ├── web/              # React + TypeScript + Vite app
│   ├── api/              # Fastify API app
│   └── cli/              # Local command line operator
├── packages/
│   ├── domain/           # Domain types and storage path contracts
│   ├── application/      # Use cases and orchestration
│   ├── source-adapters/  # Platform adapters
│   ├── transcript/       # Transcript refinement/export helpers
│   ├── storage/          # Filesystem persistence
│   ├── llm-gateway/      # Provider-agnostic LLM interface
│   ├── llm-adapters/     # Concrete LLM providers
│   ├── config/           # Shared config package
│   └── ui/               # Shared UI primitives
├── docs/
│   ├── decisions/        # Accepted ADRs
│   ├── plans/            # Codex task plans
│   ├── plans/reports/    # Gemini reports and Codex audits
│   └── GOTCHAS.md        # Avoid pitfalls guide
├── scripts/              # Small operational entry points
└── data/                 # Local generated assets, ignored by git
```

Top-level `frontend/` and `backend/` are obsolete and should not be recreated.

## Install

```bash
npm install
```

## Development

Recommended local startup uses two terminals so the API and web server are easy to restart independently.

Terminal 1, start the API with MLX transcription enabled:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev -w @yanghoo/api
```

Terminal 2, start the web app:

```bash
npm run dev -w apps/web
```

Default ports:

- Web: `http://127.0.0.1:3000`
- API: `http://127.0.0.1:8001`

The web app proxies `/api` and `/files` to the API server.

Verify both services:

```bash
curl -sS http://127.0.0.1:8001/api/health
curl -sS http://127.0.0.1:3000/api/health
```

Open:

```text
http://127.0.0.1:3000/
```

If transcription is not needed, the API can be started without MLX:

```bash
npm run dev -w @yanghoo/api
```

but `音频转字幕` and `视频转字幕` will fail until the API is restarted with `MLX_AUDIO_PYTHON`.

Common startup checks:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN || true
lsof -nP -iTCP:8001 -sTCP:LISTEN || true
```

## 命令行使用手册

命令行入口用于批量操作本项目，适合给 NotebookLM 准备 URL、Markdown、字幕和转录文档。开发环境下统一使用：

```bash
# 在仓库根目录执行；-- 后面才是 Yanghoo CLI 参数
npm run cli -- <command>
```

常用全局参数：

```bash
# 输出 JSON，方便脚本处理
npm run -s cli -- source list --json

# 指定独立的数据缓存目录，避免污染默认 data/
npm run cli -- --data-dir /tmp/yanghoo-data source list
```

需要纯 JSON 输出时使用 `npm run -s cli -- ...`，这样 npm 不会打印额外脚本日志。

### 1. 检查本机环境

```bash
# 检查 DATA_DIR、yt-dlp、ffmpeg、ffprobe、MLX Audio、MLX LM
npm run cli -- doctor
```

转录需要配置 `MLX_AUDIO_PYTHON`：

```bash
# 配置本机 MLX Audio Python，再执行转录相关命令
export MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python
```

YouTube 没有平台字幕时会通过 `yt-dlp` 下载音频再转录。为了避免反复出现 `网络或 SSL 连接失败`，建议启动 API/CLI 前固定 yt-dlp 网络配置：

```bash
# 推荐：本机代理。默认也会优先尝试这个地址，再兜底直连。
export YTDLP_PROXY=http://127.0.0.1:7897

# 可选：需要登录、地区或年龄验证时打开 cookies
export YTDLP_COOKIES_FROM_BROWSER=chrome
# 或 export YTDLP_COOKIES=/absolute/path/to/cookies.txt
```

YouTube 字幕获取会同时请求英文字幕和简体中文字幕。简体中文优先使用 YouTube timedtext 机器翻译；如果匿名请求被 YouTube 限流，会自动用字幕-only `yt-dlp` 兜底，不下载视频。这个兜底默认读取 Chrome cookies，可按需显式配置：

```bash
export YOUTUBE_CAPTION_COOKIES_FROM_BROWSER=chrome
# 禁用浏览器 cookies:
export YOUTUBE_CAPTION_COOKIES_FROM_BROWSER=off
```

强制直连时使用：

```bash
export YTDLP_PROXY=direct
```

修改这些环境变量后要重启 API。已运行的服务不会自动继承新的代理或 cookies 设置。

翻译需要配置或使用默认的 `MLX_LM_PYTHON`：

```bash
# 可选：显式指定 MLX LM Python
export MLX_LM_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-lm/.venv/bin/python
```

### 2. 添加和查看来源

```bash
# 添加一个来源 URL，支持 YouTube、Bilibili、TikTok、抖音、小红书、X、小宇宙、Apple Podcast
npm run cli -- source add "https://www.bilibili.com/video/BV1pqr5BUEhr"

# 查看所有来源卡片和文档状态
npm run cli -- source list

# 查看某个来源的完整状态
npm run cli -- source show <sourceId>
```

### 3. 字幕、音频、视频和转录

```bash
# 优先获取平台字幕；YouTube 会走 Baoyu/InnerTube 字幕逻辑
npm run cli -- transcript ensure <sourceId>

# 没有平台字幕时，先拉取音频，再用 MLX Audio 转录
npm run cli -- audio fetch <sourceId>
npm run cli -- transcribe <sourceId>

# Bilibili、TikTok、抖音、小红书、X 等媒体来源可先下载媒体，再转录音轨
npm run cli -- media download <sourceId>
npm run cli -- transcribe <sourceId>
```

### 4. 英文文档翻译成简体中文

```bash
# 使用默认 Qwen3 4B 模型翻译
npm run cli -- translate <sourceId>

# 手动选择 Qwen3 8B 模型
npm run cli -- translate <sourceId> --model Qwen/Qwen3-8B-MLX-4bit

# 强制重新翻译，覆盖已有翻译资产
npm run cli -- translate <sourceId> --force
```

### 5. 全局搜索

```bash
# 搜索已生成的 Markdown 或中文翻译文档
npm run cli -- search "关键词"

# 限制返回数量
npm run cli -- search "NotebookLM" --limit 10
```

搜索结果如果命中时间戳，会返回可跳转播放 URL。

### 6. 导出给 NotebookLM

```bash
# 导出所选来源的 Markdown；文件会放入 data/exports/notebooklm/
npm run cli -- export notebooklm <sourceId1> <sourceId2> --mode markdown

# 导出纯 URL 列表，适合 YouTube 频道或一组原始链接
npm run cli -- export notebooklm <sourceId1> <sourceId2> --mode url-list

# 导出完成后直接打开当前导出目录
npm run cli -- export notebooklm <sourceId1> <sourceId2> --mode markdown --open
```

NotebookLM 导出规则：

- Markdown 优先使用简体中文翻译资产；没有翻译时使用原始 Markdown。
- 文件名会尽量保留平台、作者和标题，便于识别。
- URL 列表是纯文本，每行一个来源 URL。

## Verification

```bash
npm run build
npm run typecheck
```

`npm run lint` is available where package lint scripts exist.

## Local Data

Runtime assets are written to `data/` by default and are ignored by git.

Use `DATA_DIR` to isolate fixtures or local experiments:

```bash
DATA_DIR=/tmp/yanghoo-data npm run dev -w apps/api
```

Canonical source assets live under:

```text
data/sources/{sourceId}/record.json
data/sources/{sourceId}/audio-manifest.json
data/sources/{sourceId}/transcript-manifest.json
data/sources/{sourceId}/transcript-raw.json
data/sources/{sourceId}/transcript-sentences.json
data/sources/{sourceId}/transcript.vtt
data/sources/{sourceId}/document.md
```

Do not commit real downloaded media, generated transcripts, model cache files, or fixture data.

## MLX Audio

Audio transcription requires a working MLX Audio Python runtime on a compatible Apple Silicon environment.

Configure the runtime explicitly:

```bash
export MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python
```

Start the MLX-enabled dev server:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev
```

Verify the environment:

```bash
$MLX_AUDIO_PYTHON -c "import mlx.core; print('mlx.core ok'); import mlx_audio; print('mlx_audio ok'); from mlx_audio.stt.generate import generate_transcription; print('generate_transcription ok')"
```

The application uses a project-native wrapper to call MLX Audio:

```bash
$MLX_AUDIO_PYTHON scripts/transcript/run-mlx-audio-transcription.py \
  --model mlx-community/whisper-large-v3-turbo-asr-fp16 \
  --audio <absolute-audio-path> \
  --output-json <output-json-path>
```

You can also run transcription via the Yanghoo script:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
npx tsx scripts/transcript/transcribe-audio-mlx.ts <sourceId>
```

## API Actions

Common source-level actions:

```text
POST /api/tasks
GET  /api/tasks
GET  /api/tasks/:taskId
POST /api/tasks/:taskId/ensure-transcript
POST /api/tasks/:taskId/fetch-audio
POST /api/tasks/:taskId/transcribe-audio
POST /api/tasks/:taskId/resolve-media
POST /api/tasks/:taskId/download-media
```

UI-facing workflow labels:

```text
载字幕 -> 下载音频 -> 音频转字幕 -> 阅读
```

## Architecture Rules

Dependency direction should point inward:

```text
UI -> application -> domain
infrastructure -> adapters called by application
```

Layer ownership:

- UI layer: React components, routing, view state, Tailwind styling.
- Application layer: use cases such as `ensureTranscript`, `fetchAudio`, `transcribeAudio`, `generateDocument`.
- Domain layer: source, transcript, document, job, status, provenance rules.
- Infrastructure layer: filesystem, platform adapters, MLX Audio, subprocess execution.

Domain code must not import UI, Fastify, filesystem, or subprocess modules.

Scripts are entry points only. Business logic belongs in `packages/*`.

## Planning Workflow

This repository uses a Codex/Gemini task workflow:

- Codex writes task plans under `docs/plans/`.
- Gemini implements from those plans and writes reports under `docs/plans/reports/`.
- Codex audits reports before the next task is assigned.

For non-trivial changes, read:

```text
AGENTS.md
docs/README.md
docs/decisions/
docs/plans/
```

Reports must include changed files, exact verification commands, key outputs, generated file lists when relevant, and unresolved risks.
