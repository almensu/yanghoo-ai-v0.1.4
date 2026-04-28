# Stage 2: Domain Contracts and Storage Shape

## Owner

Gemini implements. Codex reviews.

## Goal

Lock the core domain model and file system storage contracts before implementing platform-specific collectors.

## Non-goals

- Do not implement real platform fetchers (YouTube/Xiaoyuzhou etc.).
- Do not implement real transcription logic.
- Do not add database persistence (only in-memory stubs and file paths).

## Decisions to Follow

- `docs/plans/2026-04-26-requirements-and-architecture-discussion.md` (Section 8)
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`

## Tasks

### 1. Refine Domain Interfaces

Update `packages/domain/src/index.ts` to include the full set of recommended fields from the discussion document.

#### Source
- Add `duration` (number, seconds).
- Add `author` (string, the author/channel name).
- Add `capturedAt` (string, ISO date).
- Ensure `sourceClass` and `platform` are exhaustive.

#### TranscriptAsset
- Add `sourceType`: `platform_caption | vtt | srt | mlx_audio | manual`.
- Add `language` (string).
- Add `engine` (string, e.g., 'mlx-whisper', 'youtube-innertube').
- Add `model` (string, the specific model used).
- Add asset paths: `rawPath`, `sentencesPath`, `vttPath`.

#### DocumentAsset
- Add `markdownPath`.
- Add `sections` (placeholder for chapters/structural analysis).

#### Conversation & GeneratedDocument
- Add `scopeType`: `source | selected_sources | collection | library`.
- Add `type`: `summary | article | script | study_notes | custom`.

### 2. Define Storage Shape Contracts

Create a new file `packages/domain/src/storage.ts` or add to `index.ts` to define canonical paths for assets.

Recommended structure under `data/`:
- `data/sources/{sourceId}/record.json`
- `data/sources/{sourceId}/transcript-raw.json`
- `data/sources/{sourceId}/transcript-sentences.json`
- `data/sources/{sourceId}/transcript.vtt`
- `data/sources/{sourceId}/document.md`
- `data/sources/{sourceId}/media.{ext}` (if downloaded)

### 3. Implement Domain Logic Stubs

In `packages/application`, ensure use cases use these refined types.

### 4. Create Storage Interface Stub

Define the interface for reading/writing these assets in `packages/storage`.

## Acceptance Criteria

- `packages/domain` contains complete, type-safe interfaces for all core concepts.
- `Source` includes `sourceClass` and `platform` with types matching the discussion draft.
- Storage path helpers are defined (e.g., `getSourcePath(id)`, `getTranscriptPath(id, type)`).
- All package READMEs remain accurate to their responsibilities.
- The project passes `npm run typecheck`.

## Verification Commands

```bash
npm run build
npm run typecheck
```

## Report

Write report to:
`docs/plans/reports/2026-04-26-stage-2-domain-contracts-and-storage-shape-report.md`
