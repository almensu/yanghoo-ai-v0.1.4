# Post Stage 7 Audit Fix Bugs

## Owner

Gemini implements. Codex reviews.

## Goal

Fix the behavior bugs and boundary regressions found by Codex after Stage 7, with priority on transcript sentence correctness and truthful document readiness.

## Non-goals

- Do not add real Baoyu/InnerTube integration in this task.
- Do not add real `mlx-audio` transcription in this task.
- Do not add a database.
- Do not redesign the full frontend.
- Do not copy code from the reference project.

## Findings to Fix

### 1. Fix transcript sentence refinement

Target files:

- `packages/transcript/src/index.ts`
- add focused tests in the most appropriate existing or new test location

Required behavior:

- Complete sentence segments ending in `.`, `!`, `?`, `。`, `！`, or `？` must flush immediately.
- Consecutive complete sentence segments must remain separate.
- Fragment segments must merge until terminal punctuation or the configured maximum length.
- The final unterminated fragment must still be emitted.
- Preserve start time from the first merged segment and end time from the last merged segment.

Acceptance criteria:

- A two-segment input like `First sentence.` and `Second sentence.` returns two refined segments, not one.
- Existing YouTube mock transcript produces four sentence assets, not two.

### 2. Make API document readiness truthful

Target files:

- `apps/api/src/routes/tasks.ts`
- `packages/storage/src/index.ts`
- domain/read-model files if needed

Required behavior:

- Remove hard-coded readiness in `ensure-transcript` response.
- Implement enough storage read behavior to derive whether transcript JSON, VTT, and Markdown assets exist.
- `GET /api/tasks` and `GET /api/tasks/:taskId` should report readiness from persisted assets, not from static defaults.
- If Markdown is missing, do not report `markdown_ready`.

Acceptance criteria:

- After `ensureTranscriptUseCase` succeeds, task readiness is based on actual persisted `transcript-sentences.json`, `transcript.vtt`, and `document.md`.
- If any expected file is deleted, the API no longer claims that asset is present.

### 3. Reduce application-layer filesystem leakage

Target files:

- `packages/application/src/index.ts`
- `packages/storage/src/index.ts`

Required behavior:

- Remove direct `fs` reads from `packages/application`.
- Add or use storage APIs for reading document content.
- Keep filesystem implementation inside `packages/storage`.

Acceptance criteria:

- `packages/application` does not import Node `fs`.
- Chat context reads document content through storage.

### 4. Clarify shared readiness contract

Target files:

- `packages/domain/src/index.ts`
- `apps/api/src/types.ts`
- `apps/web/src/types.ts`

Required behavior:

- Avoid three divergent definitions of document readiness.
- Either move the read-model readiness types into `packages/domain`, or explicitly define one API contract type and have Web import/align to it without duplicating literals.

Acceptance criteria:

- The status literals used by API and Web have a single source of truth.
- `DocumentStatus` for persisted document lifecycle is not confused with task/card readiness.

### 5. Correct Gemini stage reports if needed

Target files:

- relevant files under `docs/plans/reports/`

Required behavior:

- Mark mock/stub behavior honestly.
- Do not describe stubbed collectors, mocked transcripts, or fake readiness as production-ready.

## Verification Commands

Gemini must run:

```bash
npm run build
npm run typecheck
```

Gemini must also run or add focused verification for transcript refinement behavior. If a formal test runner is not added, include a reproducible command and output proving the corrected segment count.

## Expected Report

Write report to:

```text
docs/plans/reports/2026-04-26-post-stage-7-audit-fix-bugs-report.md
```

Report must include:

- changed files
- exact verification commands and outputs
- before/after result for the transcript refiner bug
- how readiness is now derived
- unresolved risks
