# Codex Audit: YouTube Channel Greedy Caption Sync

Date: 2026-05-04

Reviewer: Codex

Result: Not accepted. Happy-path batching works, but Stage 3 is not complete enough for greedy/full-channel operation.

## Evidence Reviewed

- `docs/plans/2026-05-04-stage-youtube-channel-greedy-caption-sync.md`
- `docs/plans/reports/2026-05-04-youtube-channel-greedy-caption-sync-report.md`
- `packages/domain/src/index.ts`
- `packages/storage/src/index.ts`
- `packages/application/src/syncChannelCaptionsUseCase.ts`
- `apps/cli/src/commands/channel-command.ts`
- `scripts/ops/verify-stage3-greedy-caption-sync.ts`

## Verification Run By Codex

```bash
npx tsx scripts/ops/verify-stage3-greedy-caption-sync.ts
npm run typecheck
npm run build
```

Results:

```text
Stage 3 greedy caption sync verification passed.
```

`npm run typecheck` passed.

`npm run build` passed.

The verification proves the happy path:

- channel manifest with 5 videos,
- resume batches of 2 + 2 + 1,
- checkpoint reaches `nextIndex: 5` and `status: completed`,
- re-run after completion is no-op,
- non-resume re-run skips already-ready English caption sources,
- no `zh-Hans`, translation, audio, or media assets are created.

## Findings

### P0: Required failure fixture is missing

The Stage 3 plan explicitly required:

```text
Before this stage is accepted, Gemini must also address the remaining prerequisite:
add a fake-adapter, fixture, or deterministic verification proving one video can fail caption acquisition while the channel batch continues and records the failure.
```

The Gemini report defers this item:

```text
Missing-caption failure fixture ... Recommended as a follow-up.
```

That is not acceptable for greedy sync. Greedy mode is specifically for hundreds or thousands of videos, where individual failures are normal. Without a deterministic failure test, the most important safety property is unproven.

Required fix:

- Add a fake-adapter, fixture, or controlled verification path where one item fails with a missing-caption-style error and later items continue.
- Assert the batch result has both success and failure.
- Assert `caption-sync-report.json` records the failed video with `status: "failed"`, `failureKind: "missing_caption"`, and a non-empty `errorMessage`.
- Assert checkpoint counts include the failed item.

### P0: `--retry-failed` is implemented but not verified

The Stage 3 plan required:

```text
--retry-failed retries failed items without reprocessing successes.
```

The report says:

```text
--retry-failed verification ... not exercised in the verification script.
```

This means one of the core Stage 3 command modes is unaccepted.

Required fix:

- After creating a deterministic failed report item, run `channel captions ... --retry-failed --batch-size 1 --json`.
- Assert only failed items are selected.
- Assert successful items are not reprocessed.
- Assert attempt counts increment only for retried failed items.

### P1: Checkpoint is written after the whole batch, not after each video

The Stage 3 plan required:

```text
After each video, update checkpoint or write enough state so interruption loses at most one video's progress.
```

Current `syncChannelCaptionsUseCase` accumulates the whole batch and writes checkpoint/report only after the loop. If the process is interrupted after video 1 of a 20-video batch, the checkpoint can lose all completed work in that batch. That is too fragile for greedy operation.

Required fix:

- Persist checkpoint and report after each video, or otherwise write durable per-item progress after each video.
- Add a test or script mode that can simulate an interruption after one processed item, then resume without reprocessing already-recorded work.

### P1: Skip behavior overwrites prior success status with `skipped`

The verification output shows final report statuses:

```text
skipped, skipped, success, success, success
```

This means re-running without `--resume` changed previously successful report items to `skipped`. For a long-term sync report, it is usually better to preserve the last acquisition result (`success`) and separately record a later skip event or skipped count. Otherwise the report no longer tells which videos actually have successful caption acquisition.

Required fix:

- Preserve successful item status when skipping already-ready sources, or add an explicit `lastAction: "skipped"` field while keeping `status: "success"`.
- Update verification to assert successful acquisition records are not downgraded by a skip pass.

### P1: Invalid `--language` values are not rejected

The accepted Stage 2 follow-up left this as a note. In Stage 3, allowing arbitrary language strings into checkpoint/report state is risky because greedy sync will persist long-running state.

Required fix:

- Validate CLI/application language values. For now, accept `en` and any explicitly planned bilingual/zh-Hans modes. Reject unsupported values with a clear error.

## Accepted Parts

- Happy-path resume batching works for a 5-video Vanessa manifest.
- Checkpoint and report files are created.
- English-only acquisition remains scoped: no `zh-Hans` request logs or persisted zh-Hans/translation assets in the verification.
- No audio/media assets are created.
- Build and typecheck pass.

## Decision

Do not proceed to Stage 4 sentence indexing or full greedy channel sync yet. First harden Stage 3 with deterministic failure/retry verification and per-video durable progress.
