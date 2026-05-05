# Stage 11 Plan: Channel UI Batch Summary Layout Clarification

Date: 2026-05-04
Owner: Codex
Executor: Gemini
Status: Ready

## Context

Stage 9 clarified the Channels surface as a URL library with subtitle intake. Stage 10 clarified the batch summary and sync intent wording. The remaining gap is layout: the page should visually guide the user through the batch flow without feeling like a downloader or a loose collection of controls.

This stage is a layout and hierarchy pass only.

## Goal

Make the Channels page visually obvious:

```text
URL Library
-> Selection
-> Subtitle Sync
```

The user should be able to scan the page and immediately understand:

- what URLs are in the library,
- what subset is selected,
- what will be synced next,
- what just synced.

## Non-Goals

- Do not change refresh logic.
- Do not change selection semantics.
- Do not change subtitle sync behavior.
- Do not add video or audio downloads.
- Do not change translation behavior outside Channels.
- Do not introduce a database.

## Product Rules

The page must continue to read like a study workspace:

- URL library first,
- selection second,
- subtitle sync third.

Avoid page patterns that imply a generic media manager, such as:

- nested cards,
- dense action clusters with unclear hierarchy,
- download-oriented labels,
- floating controls detached from the data table.

## Target Files

- `apps/web/src/components/LearningChannelVideoTable.tsx`
- `apps/web/src/components/LearningChannelLibrary.tsx`
- `scripts/ops/verify-stage11-channel-ui-batch-summary-layout-clarification.ts`
- `docs/plans/reports/2026-05-04-channel-ui-batch-summary-layout-clarification-report.md`

## Layer Placement

- Web owns the layout and hierarchy of the Channels page.
- Scripts own deterministic verification of the new structure.

## Required Layout

### 1. URL Library Band

Top of the channel detail view should present:

- channel title
- URL count summary
- refresh controls
- the `URL Library` label

This band should feel like the header of the working library.

### 2. Selection Band

The selection tools should be grouped together:

- `Select New`
- `Select first 20`
- `Select first 50`
- `Select first 100`
- `Clear selected`
- selected count summary

The summary should sit with the controls, not buried in the table.

### 3. Subtitle Sync Band

The subtitle sync tools should be grouped separately:

- batch size input
- `Sync English Subtitles`
- `Build Index`
- result text showing processed/succeeded/failed counts

This section should clearly follow selection, so the user understands what happens next.

## Visual Guidance

- Use a single vertical flow, not floating cards inside cards.
- Keep the three bands dense and aligned.
- Keep the table as the main body, not the controls.
- Do not introduce decorative elements that compete with the data.
- On mobile, the same order must stack cleanly without losing meaning.

## Acceptance Criteria

- The Channels page visually reads as `URL Library -> Selection -> Subtitle Sync`.
- The batch summary is visible where selection happens.
- The sync intent/result is visible where sync happens.
- The layout does not feel like a media download panel.
- The controls remain usable on desktop and mobile.
- `npm run typecheck` passes.
- `npm run build` passes.
- A deterministic verification script proves the expected layout markers exist.

## Verification Strategy

Use deterministic structural checks first.

Recommended script:

```text
scripts/ops/verify-stage11-channel-ui-batch-summary-layout-clarification.ts
```

The script should prove:

- the page contains explicit `URL Library`, `Selection`, and `Subtitle Sync` markers,
- the selection summary sits near the selection controls,
- the subtitle sync summary sits near the sync controls,
- the library wording remains URL-oriented,
- no download wording is introduced.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage11-channel-ui-batch-summary-layout-clarification.ts
npm run typecheck
npm run build
```

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-04-channel-ui-batch-summary-layout-clarification-report.md
```

The report must include:

- changed files,
- the layout structure summary,
- verification commands and results,
- skipped checks and reasons,
- residual risks.

## Audit Checklist

Codex should reject the report if:

- the page does not clearly separate URL Library, Selection, and Subtitle Sync,
- the batch summary is detached from the selection controls,
- the sync result is detached from the sync controls,
- the layout still feels like a downloader panel,
- typecheck or build are skipped without a concrete blocker.
