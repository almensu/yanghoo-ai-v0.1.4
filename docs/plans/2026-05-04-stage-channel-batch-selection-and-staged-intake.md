# Stage 8 Plan: Channel Batch Selection and Staged Intake

Date: 2026-05-04
Owner: Codex
Executor: Gemini
Status: Ready

## Context

Stage 7 gave the product a safe channel refresh path:

```text
channel refresh -> discover new videos -> keep local state intact -> show new rows in UI
```

The next gap is user workflow. After refresh, the user still needs a fast way to:

- inspect only the newly discovered videos,
- choose videos in publish/discovery order,
- select a bounded batch such as the first 20, 50, or 100,
- keep the rest unselected for later,
- then sync only the chosen English captions.

This stage is about staged intake, not new acquisition. It should make the channel library usable as a learning queue.

## Goal

Add batch selection tools for channel intake:

```text
refresh a channel
-> inspect new videos
-> sort or filter by time/discovery order
-> select a controlled batch
-> sync selected English captions
```

Primary scenario:

```text
channel has 236 videos
-> refresh discovers 1 new video
-> user filters to New
-> user selects the first 20 or first 100 in order
-> sync only that batch
-> leave the rest untouched
```

## Non-Goals

- Do not change the channel refresh merge logic.
- Do not auto-sync captions during selection.
- Do not add video or audio downloads.
- Do not add translation, `zh-Hans`, or MLX transcription behavior.
- Do not introduce a database.
- Do not rebuild the app into a generic media control panel.

## Product Rules

The product should stay learning-oriented:

- selection is an explicit user action,
- batch intake must preserve existing selected/caption/index state,
- staged intake should work even when `publishedAt` is missing,
- visible order should be stable and understandable,
- the channel UI should help the user focus on new or unprocessed videos.

## Target Files

- `packages/domain/src/channelVideoSelection.ts`
- `packages/domain/src/index.ts`
- `packages/application/src/getLearningChannelVideosUseCase.ts`
- `apps/web/src/components/LearningChannelVideoTable.tsx`
- `apps/web/src/api/client.ts`
- `apps/api/src/routes/learningChannels.ts`
- `scripts/ops/verify-stage8-channel-batch-selection-and-staged-intake.ts`
- `docs/plans/reports/2026-05-04-channel-batch-selection-and-staged-intake-report.md`

## Layer Placement

- Domain owns selection status and any staged-intake metadata contract.
- Application owns selection operations and ordering logic.
- API exposes batch selection actions.
- Web owns batch selection controls and the channel intake surface.
- Scripts own deterministic verification.

## Required Behavior

### Selection Workflow

The channel video table must support:

1. Filtering to `New`.
2. Selecting all visible new videos.
3. Selecting a bounded batch from the currently visible ordered set.
4. Deselecting the same bounded batch.
5. Preserving existing selection and caption state when the user changes filters or refreshes.

### Order Semantics

Selection must follow a stable order that is useful for learning intake:

- prefer `publishedAt` when it exists,
- otherwise use refresh/discovery order,
- otherwise preserve the local channel order already stored on disk.

This is important because the user wants to add videos in phases, for example 50 first, then 100, then the remainder.

### Batch Controls

The channel view should expose controls that make staged intake explicit, such as:

- `Select first 20`
- `Select first 50`
- `Select first 100`
- `Select New`
- `Clear selected`

Exact copy can vary as long as the intent is clear and the controls are not buried.

## Data Shape Considerations

If the existing selection data is insufficient to express staged intake order, Gemini may add conservative optional fields, such as:

- `discoveryStatus`
- `discoveredAt`
- `refreshOrder`
- `batchLabel`

Any new fields must remain backward compatible with existing local data.

## Acceptance Criteria

- The user can filter to new videos in the channel table.
- The user can select a bounded batch from the visible ordered set.
- The user can clear or deselect that batch without disturbing unrelated rows.
- Existing selection/caption/index state remains intact.
- Batch intake can be performed in phases, such as 50 then 100 then the remainder.
- The UI remains focused on English learning, not media management.
- `npm run typecheck` passes.
- `npm run build` passes.
- A deterministic verification script proves staged selection behavior.

## Verification Strategy

Use deterministic fixtures first.

Recommended script:

```text
scripts/ops/verify-stage8-channel-batch-selection-and-staged-intake.ts
```

The script should prove:

- new rows can be filtered and selected,
- selection order follows the chosen stable ordering,
- selecting the first N rows only affects N rows,
- deselecting the first N rows only affects N rows,
- existing `video-selection.json` entries remain unchanged outside the targeted batch,
- staged intake does not create caption, translation, audio, or media assets.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage8-channel-batch-selection-and-staged-intake.ts
npm run typecheck
npm run build
```

If the UI changes materially, add a bounded browser check for the channel detail view.

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-04-channel-batch-selection-and-staged-intake-report.md
```

The report must include:

- changed files,
- selection and ordering behavior summary,
- verification commands and results,
- proof that staged selection preserves existing state,
- proof that staged intake does not trigger caption sync or asset generation,
- skipped checks and reasons,
- residual risks.

## Audit Checklist

Codex should reject the report if:

- batch selection mutates unrelated selection state,
- visible order is unstable or unusable for staged intake,
- the UI cannot express phased selection,
- the script does not prove batch boundaries,
- typecheck or build are skipped without a concrete blocker.
