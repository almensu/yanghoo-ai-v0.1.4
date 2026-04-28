# Stage 1: Apps/Packages Skeleton Migration

## Owner

Gemini implements. Codex reviews.

## Goal

Migrate the current greenfield scaffold from top-level `frontend/` and `backend/` into the accepted `apps/` + `packages/` architecture.

## Non-goals

- Do not implement real transcript fetching.
- Do not implement real LLM calls.
- Do not add database persistence yet.
- Do not copy files from `/Volumes/2T/com/yanghoo205/yanghoo-reference`.

## Decisions to Follow

- `docs/README.md`
- `docs/plans/2026-04-26-priority-roadmap.md`
- `docs/decisions/0001-mvp-platform-scope.md`
- `docs/decisions/0002-llm-gateway-provider-model.md`
- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`
- `AGENTS.md`

## Target Directory Shape

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
│   ├── llm-gateway/
│   ├── llm-adapters/
│   ├── storage/
│   ├── ui/
│   └── config/
├── docs/
├── tests/
├── examples/
├── scripts/
└── data/
```

## Migration Requirements

### 1. Move App Shells

- Move current Vite React app from `frontend/` to `apps/web/`.
- Move current Fastify app from `backend/` to `apps/api/`.
- Remove the old top-level `frontend/` and `backend/` directories after migration.

### 2. Extract Shared Types

Move shared domain-facing types out of apps and into `packages/domain`.

Initial domain concepts:

- `Source`
- `Collection`
- `TranscriptAsset`
- `DocumentAsset`
- `Conversation`
- `GeneratedDocument`

`Source` must separate:

- `sourceClass`: `long_video | podcast_audio | short_video | webpage | social_post | channel | feed`
- `platform`: `youtube | xiaoyuzhou | apple_podcast | douyin | xiaohongshu | x | webpage | bilibili | other`

### 3. Extract Application Use Cases

Create `packages/application` for app-level workflows:

- `ensureTranscriptUseCase`
- `captureSourceUseCase`
- `createConversationUseCase`

Only stubs are required in this stage.

### 4. Prepare Adapter Packages

Create package skeletons only:

- `packages/source-adapters`
- `packages/transcript`
- `packages/llm-gateway`
- `packages/llm-adapters`
- `packages/storage`

Each should have a small README explaining responsibility and forbidden dependencies.

`packages/source-adapters/README.md` must explicitly list planned adapters:

- `youtubeSourceAdapter`
- `xiaoyuzhouSourceAdapter`
- `applePodcastSourceAdapter`
- `douyinSourceAdapter`
- `xiaohongshuSourceAdapter`
- `xSourceAdapter`
- `webpageSourceAdapter`

Do not name the first podcast-class adapter `podcastSourceAdapter`; Xiaoyuzhou is the concrete first platform.

### 5. Update Workspace Config

Update root `package.json` workspaces to include:

```json
[
  "apps/*",
  "packages/*"
]
```

Update build/typecheck scripts so the project can still run:

```bash
npm run build
npm run typecheck
```

### 6. Preserve Script Entrypoints

Keep `scripts/` as empty planned entry points for now. Do not add implementation in Stage 1.

Gemini may move or update script paths only if the final shape still preserves:

- single-responsibility script names
- platform-specific collectors/fetchers
- platform-neutral transcript/document/LLM scripts
- no business logic embedded in scripts

## Acceptance Criteria

- No top-level `frontend/` or `backend/` app directories remain.
- `apps/web` and `apps/api` build or typecheck successfully.
- Shared type imports come from package boundaries, not app-to-app relative paths.
- `packages/*/README.md` documents each package boundary.
- Source domain types include separate `sourceClass` and `platform` fields.
- `packages/source-adapters/README.md` documents the platform adapter roadmap.
- `scripts/` remains present and aligned with `docs/decisions/0005-script-entrypoint-naming.md`.
- No implementation copied from `yanghoo-reference`.

## Verification Commands

```bash
npm run build
npm run typecheck
```

## Report

Write report to:

```text
docs/plans/reports/2026-04-26-stage-1-apps-packages-skeleton-migration-report.md
```

Report must include:

- moved directories
- package boundaries created
- changed scripts
- verification output
- unresolved risks
