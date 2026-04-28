# Priority Roadmap

## Status

Active as of 2026-04-26.

## Product North Star

Build a Source-to-Transcript-to-LLM Workbench:

```text
collect platform URL -> fetch metadata -> obtain transcript -> refine document -> read/chat/generate
```

The early goal is reliable platform URL collectors and reliable text transcripts.

## Priority Order

### P0: Stage 1 Apps/Packages Skeleton

Plan: `docs/plans/2026-04-26-stage-1-apps-packages-skeleton-migration.md`

Why first:

- The current `frontend/` and `backend/` scaffold is transitional.
- Domain contracts, adapters, LLM gateway, and scripts need stable package boundaries.
- Later work should not be implemented into directories that will immediately be removed.

Exit criteria:

- `apps/web` and `apps/api` exist.
- Required `packages/*` directories exist.
- Top-level `frontend/` and `backend/` are removed.
- `scripts/` remains as empty single-responsibility entrypoints.

### P1: Stage 2 Domain Contracts and Storage Shape

Codex should create a stage plan before Gemini starts.

Goal:

- Lock the minimum domain model before platform implementations.
- Define IDs, statuses, asset paths, source classes, platforms, and transcript asset contracts.

Must cover:

- `Source`
- `Collection`
- `TranscriptAsset`
- `DocumentAsset`
- `Conversation`
- `GeneratedDocument`
- `sourceClass`
- `platform`
- canonical IDs and storage paths

Do not implement real platform fetchers in this stage.

### P1: Stage 3 URL Collectors

Codex should create a stage plan after Stage 2 review.

Goal:

- Implement URL capture and metadata stubs for the first platform adapters.

Order:

1. YouTube URL collector.
2. Xiaoyuzhou URL collector.
3. YouTube channel/playlist collector if domain contracts are ready.
4. Xiaoyuzhou show collector if domain contracts are ready.

Deferred:

- Douyin.
- Xiaohongshu.
- Apple Podcasts.
- X/Twitter.
- Generic webpages.

### P1: Stage 4 Transcript Pipeline

Codex should create a stage plan after Stage 3 review.

Goal:

- Turn captured sources into transcript assets.

Pipeline priority:

1. Platform captions, especially Baoyu/YouTube InnerTube.
2. Imported VTT/SRT/caption files.
3. `mlx-audio` for audio extraction or audio-only sources.
4. Manual upload.

Required separation:

- Platform rules stay in `packages/source-adapters`.
- Caption and media normalization stay in `packages/transcript`.
- Use-case orchestration stays in `packages/application`.

### P2: Stage 5 Reader and Source Cards

Goal:

- Build the document-first UI after transcript assets exist.

Scope:

- URL collection card page.
- Source cards with platform badges and transcript/document status.
- Single-source reader with timestamp jumping and scrolling transcript.

Avoid:

- Admin-style buttons on cards.
- Exposing internal pipeline steps as primary UI actions.

### P2: Stage 6 LLM Gateway and NotebookLM-like Workspace

Goal:

- Add the unified model gateway and source-scoped chat.

Must follow:

- `docs/decisions/0002-llm-gateway-provider-model.md`
- Local and API models enter through one gateway.
- Frontend must not call provider-specific APIs directly.

### P3: Stage 7 Short-Video Platform Adapters

Goal:

- Add Douyin and Xiaohongshu after the YouTube/Xiaoyuzhou loop is stable.

Common flow:

```text
collect short-video URL -> fetch metadata/media -> extract audio -> mlx-audio -> transcript refiner
```

Do not start this before Stage 4 is verified, unless the user explicitly changes priority.

## Decision Dependencies

- Platform scope: `docs/decisions/0001-mvp-platform-scope.md`
- LLM gateway: `docs/decisions/0002-llm-gateway-provider-model.md`
- Apps/packages architecture: `docs/decisions/0003-apps-packages-architecture.md`
- Source classes and adapters: `docs/decisions/0004-source-classes-and-platform-adapters.md`
- Script naming: `docs/decisions/0005-script-entrypoint-naming.md`

## Next Codex Action

Review Gemini's Stage 1 report when available. If Stage 1 passes, write Stage 2 as a concrete task plan for domain contracts and storage shape.
