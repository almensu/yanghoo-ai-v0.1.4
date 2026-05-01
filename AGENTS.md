# Repository Guidelines

## Command Model

Codex is the project commander for this repository. Codex plans, audits, reviews reports, defines task files, and protects the architecture. Codex does not implement production code unless the user explicitly overrides this rule.

Gemini is the coding executor. Implementation tasks should be written clearly enough for Gemini to execute, verify, and report. Codex reviews Gemini output before the next task is assigned.

## Reference Repository Protocol

This repository uses `/Volumes/2T/com/yanghoo205/yanghoo-reference` as an architectural reference library. Agents should use it to guide structure, naming, layer boundaries, test strategy, migration order, and review checklists.

Reference is advisory, not vendored code:

- Do not copy source files, templates, or implementation from the reference repository into this repo.
- Do not treat the reference project as product scope. This repo remains a transcript-first Yanghoo AI rewrite.
- Extract principles, checklists, and decision rules only.
- If reference guidance conflicts with this repo's accepted `docs/decisions/*`, prefer this repo's ADRs and record the conflict in the relevant plan/report.

Default reference read order by task:

- New structure or directory decisions: `reference/index.md`, `reference/architecture.md`, `reference/repo-conventions.md`, `reference/decision-rules.md`.
- Layer or dependency questions: `reference/layer-boundaries.md`, then this repo's `docs/decisions/0003-apps-packages-architecture.md`.
- File/package naming: `reference/naming.md`, then this file's Naming Rules.
- Tests or verification design: `reference/test-strategy.md`.
- Existing structure drift or cleanup: `reference/project-skeleton-checklist.md`, `reference/migration-playbook.md`.
- AI/Gemini output review: `reference/review-checklists/` and `reference/Gotchas.md`.

Codex must reference these files when writing non-trivial Gemini task plans or audit reports. Gemini must use them before implementing structural, package, or naming changes.

## Local Gotchas

This repo also maintains a local avoid-pitfalls guide:

```text
docs/GOTCHAS.md
```

Agents must read it before work involving:

- dev server startup or port debugging,
- `MLX_AUDIO_PYTHON` and MLX Audio transcription,
- `yt-dlp` media downloads,
- `ffmpeg` audio extraction,
- X/Douyin media cards,
- asset deletion/reset workflows.

If a task discovers a repeatable operational or implementation trap, update `docs/GOTCHAS.md` or state in the report why no update was needed.

## Project Purpose

This is a greenfield transcript-first rewrite. The core workflow is:

```text
source video/url -> best transcript source -> refined sentence assets -> readable timestamped document
```

Avoid rebuilding the old v0.2.0 all-purpose media control panel. The product should expose document readiness and reading actions, not every internal processing step.

## Reference-Inspired Structure

The directory philosophy follows `/Volumes/2T/com/yanghoo205/yanghoo-reference/CLAUDE.md`: design the skeleton first, respect layer boundaries, then implement. Do not copy the reference project or vendor its files into this repo.

Current accepted shape:

```text
.
├── apps/
│   ├── web/              # React + TypeScript + Vite app
│   └── api/              # Fastify API app
├── packages/             # Shared domain, adapters, UI primitives, config
├── docs/
│   ├── plans/            # Planning docs
│   ├── plans/reports/    # Gemini reports and Codex audits
│   ├── decisions/        # ADR-style decisions
│   ├── architecture/     # System boundaries and diagrams
│   └── GOTCHAS.md        # Local avoid-pitfalls guide
├── tests/                # Cross-app integration/e2e tests when needed
├── examples/             # Small sample inputs and fixtures
├── scripts/              # Small operational entry points; business logic stays in packages
└── data/                 # Local generated assets; never commit real data
```

Top-level `frontend/` and `backend/` are obsolete in v0.3.0. Do not recreate them.

## Layer Boundaries

- UI layer: React components, routing, view state, Tailwind styling.
- Application layer: use cases such as `ensureTranscript`, `importSource`, `generateDocument`.
- Domain layer: task, transcript, document, job, source priority, status rules.
- Infrastructure layer: filesystem, Baoyu/YouTube adapter, `mlx-audio` adapter, subprocess execution.

Dependency direction must point inward: UI -> application -> domain; infrastructure is called through adapters. Domain must not import UI, Fastify, filesystem, or subprocess modules.

When adding or moving code, answer before implementation:

1. Which layer owns this behavior?
2. Which package/app should contain it?
3. Which dependencies are allowed?
4. Which boundary would be violated if this grows?
5. What verification proves the boundary and behavior?

## Product Rules

The primary action is `Ensure Transcript`.

Transcript source priority:

```text
Baoyu/YouTube -> VTT/SRT -> mlx-audio -> manual upload
```

Platform acquisition strategy:

- YouTube must use the Baoyu/YouTube InnerTube internal API path for metadata and captions. YouTube cards should support a caption-only flow and must not require video download before transcript generation.
- YouTube cards without a readable document should expose `Ensure Transcript` / `载字幕`, not a primary `下载视频` action.
- X, Xiaohongshu, Douyin, Bilibili, and TikTok use `yt-dlp` for metadata/media acquisition, then audio extraction/probing and MLX transcription when media has audio.
- Do not route YouTube through the generic short-video `yt-dlp` download workflow unless a task explicitly defines a separate experimental fallback and records the architecture exception.

Cards and tables should present document readiness. Destructive, maintenance, and low-frequency operations belong behind menus or admin/debug surfaces.

For audio-only sources such as Xiaoyuzhou, staged actions may be exposed when they clarify expensive work:

```text
metadata captured -> fetch audio -> transcribe audio -> read transcript
```

These actions must remain document-readiness oriented. Do not rebuild a general media control panel.

Shownotes, descriptions, chapters, and outlines are not transcripts. They may be persisted as notes/chapters, but must not be labeled `platform_caption` or used to claim transcript readiness.

Chinese transcript output should be normalized to Simplified Chinese for user-facing transcript assets. Apply this in the transcript normalization/persistence pipeline, not as a frontend-only display replacement.

Generated files in `data/` are local runtime assets. Do not assume they are committed. Do not duplicate assets into app-local `apps/*/data` directories; use one canonical data root.

## Naming Rules

Avoid vague filenames such as `utils.ts`, `manager.ts`, `service.ts`, or `handler.ts` unless scoped by a clear noun. Prefer names that state responsibility:

- `deriveDocumentAssets.ts`
- `ensureTranscriptUseCase.ts`
- `youtubeTranscriptAdapter.ts`
- `mlxAudioTranscriptionAdapter.ts`
- `sentenceTimestampRefiner.ts`

If a module name needs “and”, split it.

## Script Rules

Scripts follow the same rule as Unix tools: one file, one action, explicit input/output, predictable exit code. Keep platform-specific scripts concrete, for example `collect-xiaoyuzhou-url.ts` and `fetch-douyin-metadata.ts`. Keep shared pipeline scripts platform-neutral, for example `transcribe-audio-mlx.ts` and `refine-transcript-sentences.ts`.

Scripts are entry points only. Business logic belongs in `packages/*`, and scripts should orchestrate package calls after the packages exist.

## Task Workflow

Codex should create task docs under `docs/plans/` or future `tasks/` before Gemini implements non-trivial changes. Each task should include:

- goal and non-goals
- target files/directories
- layer placement
- acceptance criteria
- verification commands
- expected report path

Gemini reports must state changed files, verification results, and unresolved risks.

For user-facing "it works" claims, Gemini must include evidence:

- exact commands run
- exact output or summarized key lines
- generated file list
- API/readiness output when relevant
- unresolved risks and skipped commands

Codex must reject reports that describe mock/stub behavior as real implementation.

## Commands

- `npm install`: install workspace dependencies.
- `npm run dev`: start backend and frontend dev servers.
- `npm run build`: build backend and frontend.
- `npm run typecheck`: run TypeScript checks.

Before handoff, Gemini should run:

```bash
npm run build
npm run typecheck
```

If a command is skipped, the report must say why.
