# Stage 7 Audit Fix Plan: Channel Refresh Incremental Discovery

Date: 2026-05-04
Owner: Codex
Executor: Gemini
Status: Ready

## Context

Stage 7 introduced channel refresh for incremental video discovery. The latest audit rejected the implementation because the current merge path can still persist duplicate new `videoId`s, can reverse the order of multiple newly discovered videos, and the web UI only exposes a fixed `latest 50` refresh action.

This follow-up keeps the scope narrow. The goal is to make the refresh path satisfy the original Stage 7 contract without expanding into caption sync, downloads, or media processing.

## Goal

Fix the remaining Stage 7 acceptance blockers:

```text
remote refresh window -> merge by videoId without duplicates
-> preserve remote order for newly discovered videos
-> expose full refresh in the web UI
-> prove with deterministic verification
```

## Non-Goals

- Do not change caption sync behavior.
- Do not add video or audio downloads.
- Do not add translation, `zh-Hans`, or MLX transcription behavior.
- Do not introduce a database.
- Do not redesign the channel library UI beyond the refresh control needed for this fix.

## Target Files

- `packages/application/src/refreshChannelVideosUseCase.ts`
- `scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts`
- `apps/web/src/components/LearningChannelVideoTable.tsx`
- `docs/plans/reports/2026-05-04-channel-refresh-incremental-video-discovery-report.md`

## Layer Placement

- Application layer owns merge behavior and refresh orchestration.
- Scripts layer owns deterministic verification.
- Web layer owns the user-facing refresh controls.

## Required Behavior

### Merge Safety

Use `videoId` as the identity source during refresh.

The merge function must:

1. Never duplicate a `videoId`, even if the remote refresh window contains repeated IDs.
2. Preserve the order of newly discovered videos as returned by the remote fetch.
3. Keep existing local videos and selection/caption/index state intact.
4. Continue to avoid deleting local videos in `latest` mode.
5. Continue to mark remote-missing only in `full` mode.

### Web UI

The channel detail view must expose both refresh modes:

- `Refresh latest 50`
- `Full refresh`

The UI should make it obvious which action is a bounded incremental refresh and which action is a full inventory scan.

## Acceptance Criteria

- `mergeChannelVideos()` does not produce duplicate `videoId`s for repeated remote new IDs.
- Multiple new videos keep remote order in the merged output.
- `latest` mode still does not mark out-of-window videos as missing.
- `full` mode still marks missing remote videos without deleting local videos.
- The web UI exposes both `latest` and `full` refresh actions.
- Refresh remains metadata-only and does not create caption, translation, audio, or media assets.
- The deterministic verification script covers the new duplicate-new-ID case and the multi-new-video ordering case.
- `npm run typecheck` passes.
- `npm run build` passes.
- `npx tsx scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts` passes.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts
npm run typecheck
npm run build
```

If the web UI is changed materially, include a bounded local browser check on the channel detail view.

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-04-channel-refresh-incremental-video-discovery-audit-fix-report.md
```

The report must include:

- changed files,
- exact behavior fixes,
- verification commands and results,
- evidence that duplicate new IDs are rejected,
- evidence that new video order is preserved,
- evidence that the web UI now exposes both refresh modes,
- any skipped checks and the reason,
- any residual risks.

## Audit Checklist

Codex should reject the follow-up report if:

- duplicate new `videoId`s can still be written to `videos.json`,
- multiple new videos are reordered,
- the UI still only exposes `latest 50`,
- the verification script does not cover the duplicate-new-ID case,
- typecheck or build are skipped without a concrete blocker.
