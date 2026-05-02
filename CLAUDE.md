# CLAUDE.md

Purpose: give Claude/Gemini the same operating rules that Codex enforces in this repository.

This repo is a transcript-first rewrite. The core loop is:

```text
source video/url -> best transcript source -> refined sentence assets -> readable timestamped document
```

Do not rebuild the old broad media control panel. Expose document readiness and reading actions.

## Yanghoo Skill

A project-specific Claude skill exists at:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo/SKILL.md
```

Claude/Gemini should read this skill before Yanghoo AI work involving source capture, YouTube/Baoyu captions, yt-dlp media acquisition, MLX transcription, MLX LM translation, NotebookLM export, CLI workflows, architecture, or task/report handoffs.

If the skill conflicts with this file, `AGENTS.md`, or accepted `docs/decisions/*`, prefer the repository-local rules and accepted decisions.

## Roles

Codex is the project commander:

- plans
- audits
- writes task files
- reviews Gemini reports
- protects architecture

Gemini is the coding executor:

- implements tasks written under `docs/plans/`
- runs verification
- writes reports under `docs/plans/reports/`
- states changed files, command outputs, and unresolved risks

Unless the user explicitly overrides this rule, Codex does not implement production code.

## Reference Library

Use `/Volumes/2T/com/yanghoo205/yanghoo-reference` as a reference library before structural work.

Reference is not source code to copy. Use it for:

- repository skeleton decisions
- layer boundaries
- package/app placement
- naming
- migration order
- test strategy
- review checklists
- gotchas

Do not vendor or copy implementation files from the reference repository.

Recommended reference files:

- `reference/index.md`: navigation.
- `reference/architecture.md`: skeleton and long-term structure.
- `reference/repo-conventions.md`: repository organization rules.
- `reference/layer-boundaries.md`: dependency direction and ownership.
- `reference/decision-rules.md`: where a capability belongs.
- `reference/naming.md`: precise file/package names.
- `reference/test-strategy.md`: verification design.
- `reference/project-skeleton-checklist.md`: structure audit.
- `reference/migration-playbook.md`: staged cleanup.
- `reference/review-checklists/`: review before accepting AI output.
- `reference/Gotchas.md`: recurring failure patterns.

If reference guidance conflicts with this repo's `docs/decisions/*`, follow this repo's accepted decisions and document the conflict.

## Local Gotchas

This repository has a local avoid-pitfalls guide:

```text
docs/GOTCHAS.md
```

Claude/Gemini must read it before environment-sensitive work such as:

- starting dev servers,
- debugging `127.0.0.1:3000` or `127.0.0.1:8001`,
- running MLX Audio transcription,
- downloading X/Douyin media,
- extracting audio with `ffmpeg`,
- changing card actions for media/transcript workflows.

If a task hits a recurring failure, update `docs/GOTCHAS.md` or mention why no update was needed in the report.

## Current Structure

Accepted shape:

```text
.
├── apps/
│   ├── web/
│   ├── api/
│   └── cli/
├── packages/
│   ├── domain/
│   ├── application/
│   ├── source-adapters/
│   ├── transcript/
│   ├── storage/
│   ├── llm-gateway/
│   ├── llm-adapters/
│   ├── ui/
│   └── config/
├── docs/
│   ├── decisions/
│   ├── architecture/
│   ├── plans/
│   │   └── reports/
│   └── GOTCHAS.md
├── scripts/
├── tests/
├── examples/
└── data/
```

Top-level `frontend/` and `backend/` are obsolete. Do not recreate them.

## Layer Rules

Dependency direction:

```text
UI -> application -> domain
infrastructure/adapters are called through explicit ports/adapters
```

Domain must not import:

- React
- Fastify
- filesystem
- subprocess
- platform SDKs
- environment variables

Scripts are entry points only. Business logic belongs in `packages/*`.

## Product Rules

Primary user action:

```text
Ensure Transcript
```

Transcript source priority:

```text
Baoyu/YouTube -> VTT/SRT -> mlx-audio -> manual upload
```

Platform acquisition strategy:

- YouTube must use the Baoyu/YouTube InnerTube internal API path for metadata and captions. YouTube cards should support a caption-only flow and must not require video download before transcript generation.
- YouTube cards without a readable document should expose `Ensure Transcript` / `载字幕`, not a primary `下载视频` action.
- If InnerTube confirms a YouTube video has no caption tracks or returns an empty caption result, persist a failed `platform_caption` transcript manifest with an `audio_transcription` fallback. The card may then expose `下载音频 -> 转录` using `yt-dlp` audio extraction and MLX transcription.
- X, Xiaohongshu, Douyin, Bilibili, and TikTok use `yt-dlp` for metadata/media acquisition, then audio extraction/probing and MLX transcription when media has audio.
- Do not route YouTube through the generic short-video `yt-dlp` download workflow. The only accepted `yt-dlp` YouTube fallback is caption-missing audio extraction for transcription.

For Xiaoyuzhou/audio sources, staged actions are allowed when they clarify real work:

```text
Fetch Audio -> Transcribe Audio -> Read Transcript
```

These actions must stay document-readiness oriented.

Shownotes, summaries, descriptions, and chapter outlines are not transcripts. They must not be stored as `platform_caption`, and they must not make a card `markdown_ready`.

Chinese transcript output should be normalized to Simplified Chinese for user-facing transcript assets. Apply this in the transcript normalization/persistence pipeline, not as a frontend-only display replacement.

Never generate fake `document.md` or fake readiness to make a demo look complete.

## Naming Rules

Avoid vague names unless strongly scoped:

- `utils`
- `helpers`
- `common`
- `service`
- `manager`
- `handler`
- `types`

Prefer names that state the object and responsibility:

- `ensureTranscriptUseCase.ts`
- `youtubeTranscriptAdapter.ts`
- `mlxAudioTranscriptionAdapter.ts`
- `sentenceTimestampRefiner.ts`
- `deriveDocumentReadiness.ts`
- `xiaoyuzhouAudioFetcher.ts`

If a module name needs "and", split it.

## Data Rules

`data/` is local runtime output and should not contain committed real user data.

Use one canonical data root. Do not write a second runtime store under `apps/api/data` or `apps/web/data`.

When testing persistence, prove both:

- files exist under the canonical source directory
- `/api/tasks` and the web proxy expose the same readiness

## Verification Rules

Before handoff, Gemini should run:

```bash
npm run build
npm run typecheck
```

CLI-specific work should also verify:

```bash
npm run cli -- doctor
npm run -s cli -- source list --json
```

If working on a specific pipeline, Gemini must also run the relevant end-to-end commands and include outputs in the report.

Reports must include:

- changed files
- exact commands run
- key outputs
- generated file list
- readiness/API output
- unresolved risks
- skipped commands and why

Codex should reject reports that confuse stubs, mocks, shownotes, or partial metadata with real transcript/document completion.
