# Stage 3: YouTube Channel Greedy English Caption Sync

Date: 2026-05-04

Owner: Gemini

Reviewer: Codex

Status: Ready for Gemini

Report path:

```text
docs/plans/reports/2026-05-04-youtube-channel-greedy-caption-sync-report.md
```

## Goal

Make YouTube channel English-caption sync safe for hundreds or thousands of videos by adding batch state, checkpointing, resume, skip, retry, and truthful failure reporting.

Primary target:

```text
https://www.youtube.com/@SpeakEnglishWithVanessa
```

This stage continues the English-learning path:

```text
channel manifest
-> batch English caption sync
-> checkpoint and report
-> resume until all manifest videos are attempted
```

## Non-goals

- Do not implement sentence search or the Youglish-like UI.
- Do not perform unbounded full-channel sync in verification.
- Do not download YouTube video, audio, or media.
- Do not request `zh-Hans` when running `--language en`.
- Do not remove or weaken the existing single-video bilingual / machine-translation path.
- Do not add Web UI controls unless explicitly required by a later plan.

## Blocking Prerequisites

Accepted:

- `docs/plans/reports/2026-05-04-codex-accept-youtube-channel-capture-hardening.md`
- `docs/plans/reports/2026-05-04-codex-accept-youtube-channel-language-scoped-caption-acquisition.md`

Before this stage is accepted, Gemini must also address the remaining prerequisite from Codex:

- add a fake-adapter, fixture, or deterministic verification proving one video can fail caption acquisition while the channel batch continues and records the failure.

## Decisions To Follow

- `AGENTS.md`
- `docs/plans/2026-05-04-youtube-channel-greedy-english-captions-youglish-roadmap.md`
- `docs/plans/2026-05-04-stage-youtube-channel-english-caption-batch.md`
- `docs/plans/2026-05-04-stage-youtube-channel-language-scoped-caption-acquisition.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/decision-rules.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`

## Layer Placement

- `packages/domain`: checkpoint/report types and status vocabulary if new stable contracts are needed.
- `packages/application`: greedy sync orchestration, skip/retry policy, checkpoint updates, failure categorization.
- `packages/storage`: read/write checkpoint and sync report files under `data/channels/{channelId}/`.
- `apps/cli`: thin command parsing and output rendering only.
- `scripts/ops`: verification scripts with assertions.

Do not put orchestration, retry policy, or checkpoint mutation inside CLI command files.

## Persistence Shape

Use the channel paths already defined in `packages/domain/src/storage.ts`:

```text
data/channels/{channelId}/sync-checkpoint.json
data/channels/{channelId}/caption-sync-report.json
```

Recommended checkpoint shape:

```json
{
  "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
  "language": "en",
  "mode": "greedy_english_captions",
  "status": "in_progress",
  "nextIndex": 20,
  "processed": 20,
  "succeeded": 18,
  "failed": 2,
  "skipped": 0,
  "startedAt": "2026-05-04T00:00:00.000Z",
  "updatedAt": "2026-05-04T00:05:00.000Z"
}
```

Recommended report shape:

```json
{
  "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
  "language": "en",
  "status": "partial",
  "items": [
    {
      "videoId": "N_hNCnh1dxs",
      "sourceId": "yt-N_hNCnh1dxs",
      "status": "success",
      "attempts": 1,
      "captionLanguage": "en",
      "updatedAt": "2026-05-04T00:01:00.000Z"
    },
    {
      "videoId": "no-caption-fixture",
      "sourceId": "yt-no-caption-fixture",
      "status": "failed",
      "attempts": 1,
      "failureKind": "missing_caption",
      "errorMessage": "YouTube video has no caption tracks",
      "updatedAt": "2026-05-04T00:02:00.000Z"
    }
  ]
}
```

Keep the exact schema pragmatic, but the report must distinguish:

- success,
- skipped because already has English captions,
- missing caption,
- rate limit / 429,
- network error,
- unknown error.

## CLI Behavior

Extend the existing command instead of adding a separate broad script:

```bash
npm run -s cli -- channel captions <channelId> --language en --batch-size 20 --resume --json
npm run -s cli -- channel captions <channelId> --language en --batch-size 20 --from-index 40 --json
npm run -s cli -- channel captions <channelId> --language en --batch-size 20 --retry-failed --json
```

Compatibility:

- Existing `--limit N` can remain as an alias for one-shot small batch if already used.
- For greedy/resume mode, prefer `--batch-size` so it is clear that the command processes one bounded batch per invocation.

## Required Behavior

### Batch Boundaries

- One invocation processes at most `batchSize` videos.
- Default `batchSize` should be safe, for example 10 or 20.
- Never process the entire channel by default.

### Resume

- With `--resume`, read `sync-checkpoint.json` and continue from `nextIndex`.
- After each video, update checkpoint or write enough state so interruption loses at most one video's progress.
- After a completed batch, `nextIndex` points to the next unattempted video.

### Skip

- If a source already has English caption assets and `--force` is not set, skip it and record `status: "skipped"`.
- Skip detection should look for English caption/readiness assets, not zh-Hans or translation assets.

### Retry

- `--retry-failed` should retry failed items from the report, bounded by `batchSize`.
- Track attempt counts.
- Do not retry successful items unless `--force` is explicitly provided.

### Failure Reporting

- One failed video must not stop the batch.
- Store per-video failure reason.
- Categorize obvious errors:
  - missing caption,
  - rate limit / 429,
  - network,
  - unknown.

### Language Scope

- `--language en` must remain English-only at adapter and persistence layers.
- The verification must fail if English-only greedy sync logs or persists `zh-Hans`.
- Default single-video `transcript ensure <sourceId>` must still preserve bilingual / machine-translation behavior.

## Acceptance Criteria

- `channel captions <channelId> --language en --batch-size 2 --resume --json` processes exactly 2 videos from a 5-video Vanessa manifest.
- Running it a second time with `--resume` processes the next 2 videos, not the same 2.
- `sync-checkpoint.json` is written and has correct `nextIndex`, counts, language, and status.
- `caption-sync-report.json` records per-video statuses and attempts.
- Existing English-caption assets are skipped on a later run unless `--force` is used.
- `--retry-failed` retries failed items without reprocessing successes.
- Missing-caption or forced-failure fixture proves one failure does not stop the batch.
- No audio/media assets are created.
- No `zh-Hans` or `translation` assets are created in English-only channel sync.
- Verification proves no `zh-Hans` request logs in English-only channel sync.
- Default `transcript ensure` bilingual / machine-translation behavior remains available.
- `npm run typecheck` passes.
- `npm run build` passes.

## Verification Commands

Use assertion scripts, not count-only shell output.

Expected verification entrypoints:

```bash
npx tsx scripts/ops/verify-stage3-greedy-caption-sync.ts
npm run typecheck
npm run build
```

The Stage 3 verification script should use an isolated `DATA_DIR` and perform at least:

1. `channel add Vanessa --limit 5 --json`.
2. `channel captions <channelId> --language en --batch-size 2 --resume --json`.
3. Assert 2 processed, checkpoint `nextIndex: 2`.
4. Run the same command again.
5. Assert next 2 processed, checkpoint `nextIndex: 4`.
6. Run again.
7. Assert final 1 processed, checkpoint complete.
8. Run again.
9. Assert already-complete items are skipped or no-op without duplicating work.
10. Assert report item count and statuses.
11. Assert no `zh-Hans`, `translation`, audio, or media files.
12. Assert a fake/fixture failure path records failure and continues.

## Report Requirements

Gemini report must include:

- changed files,
- exact commands run,
- key output,
- generated checkpoint path and content excerpt,
- generated report path and content excerpt,
- source directories and asset classes generated,
- evidence that resume processed the next batch,
- evidence that skip works,
- evidence that retry/failure recording works,
- evidence that English-only mode did not request or persist `zh-Hans`,
- evidence that bilingual/machine-translation capability was not removed,
- unresolved risks,
- skipped commands with reasons.
