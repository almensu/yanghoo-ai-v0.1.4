# Yanghoo AI v0.3.0

Yanghoo AI is a transcript-first workbench for turning source URLs into readable timestamped documents.

The core workflow is:

```text
source video/url -> best transcript source -> refined sentence assets -> readable timestamped document
```

The product should expose document readiness and reading actions. It should not become a general-purpose media control panel.

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
- Workspace: npm workspaces
- Storage: local filesystem under `data/` or `DATA_DIR`
- Transcript engines: platform captions and MLX Audio
- LLM layer: provider-agnostic gateway with adapter packages

## Repository Layout

```text
.
├── apps/
│   ├── web/              # React + TypeScript + Vite app
│   └── api/              # Fastify API app
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
