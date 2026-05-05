# Stage 10 Plan: Channel Batch Summary and Sync Intent Clarification

Date: 2026-05-04
Owner: Codex
Executor: Gemini
Status: Ready

## Context

The Channels flow is now functionally a URL library with staged subtitle intake, but the user still benefits from clearer batch feedback after selection and sync. The next polish step should make the page answer, at a glance:

- how many URLs are in the current library,
- how many are new,
- what batch was selected,
- what batch will be synced,
- what batch actually synced.

This is a clarification pass, not a new workflow or backend rewrite.

## Goal

Make batch selection and subtitle sync intent easier to read on the Channels page:

- surface a concise batch summary before sync,
- show what the current selected batch represents,
- show post-sync intent/result in the same terminology,
- keep the page aligned with the "URL library first" model.

Primary scenario:

```text
channel library has 236 URLs
-> user filters New
-> user selects first 20
-> UI shows "20 URLs selected for subtitle sync"
-> user syncs
-> UI shows what was processed and what remains
```

## Non-Goals

- Do not change the refresh merge logic.
- Do not change selection semantics.
- Do not add video or audio downloads.
- Do not add `zh-Hans` or translation behavior to Channels.
- Do not change backend business rules.
- Do not introduce a database.

## Product Rules

Channels should keep using the learning-library language:

- URL library
- batch selection
- English subtitle sync
- selected URLs

Avoid wording that makes the user think the page is a downloader or an encoder.

## Target Files

- `apps/web/src/components/LearningChannelVideoTable.tsx`
- `apps/web/src/components/LearningChannelLibrary.tsx`
- `apps/web/src/api/client.ts`
- `scripts/ops/verify-stage10-channel-batch-summary-and-sync-intent-clarification.ts`
- `docs/plans/reports/2026-05-04-channel-batch-summary-and-sync-intent-clarification-report.md`

## Layer Placement

- Web owns the batch summary presentation.
- API/client only changes if the summary needs a small existing-field aggregation helper.
- Scripts own deterministic verification.

## Required Behavior

### Batch Summary

The channel detail page should show a short summary near the selection controls, such as:

- how many URLs are currently selected,
- whether the visible selection is the `New` subset or the full library,
- whether the next action is subtitle sync or just selection.

### Sync Intent

Before and after syncing, the UI should make it obvious:

- what URLs were selected,
- how many subtitles were processed,
- how many succeeded or failed,
- what remains unprocessed.

### Language Consistency

The UI should continue to prefer:

- `URL library`
- `selected URLs`
- `English subtitles`

## Acceptance Criteria

- The Channels page shows a concise selected-batch summary.
- The selected batch summary reflects the active filter and current selection count.
- The subtitle sync result uses the same vocabulary as the page.
- The UI still reads as a URL library, not a downloader.
- Existing batch selection behavior remains unchanged.
- `npm run typecheck` passes.
- `npm run build` passes.
- A deterministic verification script proves the summary text and sync intent wording.

## Verification Strategy

Use deterministic string/structure checks first.

Recommended script:

```text
scripts/ops/verify-stage10-channel-batch-summary-and-sync-intent-clarification.ts
```

The script should prove:

- the batch summary text exists,
- the batch summary reflects selected count and filter context,
- the sync result text uses English subtitle wording,
- no download wording is introduced.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage10-channel-batch-summary-and-sync-intent-clarification.ts
npm run typecheck
npm run build
```

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-04-channel-batch-summary-and-sync-intent-clarification-report.md
```

The report must include:

- changed files,
- the batch summary wording,
- sync intent/result wording,
- verification commands and results,
- skipped checks and reasons,
- residual risks.

## Audit Checklist

Codex should reject the report if:

- the batch summary does not make selection intent clearer,
- the sync result still reads like a downloader action,
- download wording appears in the Channels UI,
- the verification does not prove the new summary copy,
- typecheck or build are skipped without a concrete blocker.
