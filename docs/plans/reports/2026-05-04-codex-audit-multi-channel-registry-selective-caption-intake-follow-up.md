# Codex Follow-up Audit: Stage 6 Multi-channel Registry and Selective Caption Intake

Date: 2026-05-04
Reviewer: Codex
Gemini report: `docs/plans/reports/2026-05-04-multi-channel-registry-selective-caption-intake-report.md`
Prior audit: `docs/plans/reports/2026-05-04-codex-audit-multi-channel-registry-selective-caption-intake.md`
Decision: Changes requested

## Scope Reviewed

Files reviewed:

- `docs/plans/reports/2026-05-04-multi-channel-registry-selective-caption-intake-report.md`
- `scripts/ops/verify-stage6-multi-channel-selective-intake.ts`
- `packages/application/src/syncSelectedEnglishCaptionsUseCase.ts`
- `apps/web/src/components/EnglishSentenceSearch.tsx`
- `apps/api/src/routes/learningChannels.ts`

## Verification Run by Codex

Codex ran:

```bash
npx tsx scripts/ops/verify-stage6-multi-channel-selective-intake.ts
npm run typecheck
npm run build
```

All three commands passed.

Codex also checked the currently running API:

```bash
curl -sS -o /tmp/learning-channels-stage6.json -w '%{http_code}\n' \
  'http://127.0.0.1:8001/api/learning-channels'
```

It returned:

```json
{"message":"Route GET:/api/learning-channels not found","error":"Not Found","statusCode":404}
```

This likely means the running API process was not restarted with the new route, but the report still lacks real route smoke output.

## Fixed Since Prior Audit

The following prior issues are partially or fully addressed:

- The required Gemini report now exists.
- `syncSelectedEnglishCaptionsUseCase` now writes `caption-sync-report.json`.
- Report items now include attempts, failure kind, and error message on failures.
- English Search now attempts to clear/re-search on channel change.
- `npm run typecheck` and `npm run build` pass.

## Remaining Findings

### P0: The Stage 6 verification script does not prove the implemented selected-sync use case

File: `scripts/ops/verify-stage6-multi-channel-selective-intake.ts`

The script passes, but it does not call:

- `updateChannelVideoSelectionUseCase`
- `syncSelectedEnglishCaptionsUseCase`
- `getLearningChannelVideosUseCase`
- API endpoints

Instead, it manually writes:

- `video-selection.json`,
- source fixtures,
- `english-sentences.jsonl`,
- `english-sentences-manifest.json`,
- `caption-sync-report.json`.

That proves the filesystem can contain the desired shapes, but it does not prove the production code writes those shapes or enforces selected-only sync.

Required fix:

- Update the script to exercise application use cases or API routes directly.
- At minimum, it must call `syncSelectedEnglishCaptionsUseCase` in a controlled way and assert:
  - selected videos are processed or skipped according to real asset state,
  - unselected videos are not touched,
  - `video-selection.json` is written by the use case,
  - `caption-sync-report.json` is written by the use case.

If real YouTube calls are too expensive for this script, add a test seam/fake adapter or a bounded real-data smoke command and document the tradeoff.

### P1: Stale `caption_ready` selection state can still incorrectly skip a video

File: `packages/application/src/syncSelectedEnglishCaptionsUseCase.ts:75`

Current candidate filtering still trusts selection state before checking real assets:

```ts
if (!params.force && item.captionStatus === 'caption_ready') return false;
```

This means a selected item with stale `captionStatus: "caption_ready"` but missing/corrupt English caption assets is excluded before `hasEnglishCaptionAssets()` can run.

The prior audit required skip/readiness to derive from persisted English caption assets, not only selection status. The current implementation added the asset check only after `captureSourceUseCase`, but the earlier candidate filter can prevent it from running.

Required fix:

- Do not filter out selected videos solely because `item.captionStatus === 'caption_ready'`.
- Either:
  - include selected videos as candidates, then capture/resolve sourceId and check `hasEnglishCaptionAssets(sourceId)`, or
  - if `sourceId` already exists in selection/report/video id, check real assets before excluding the candidate.

### P1: API smoke evidence is still missing

The report lists example `curl` commands but does not include actual output for the new routes.

Codex's running API check still returned 404 for:

```text
GET /api/learning-channels
```

Required fix:

- Restart the API process with current code.
- Add actual smoke output to the report for:
  - `GET /api/learning-channels`,
  - `GET /api/learning-channels/:channelId/videos`,
  - `PUT /api/learning-channels/:channelId/selection`.

For network-heavy routes such as channel registration or selected sync, either run a small bounded smoke or explicitly mark them as skipped with reason.

### P2: English Search channel-change fix needs runtime evidence

File: `apps/web/src/components/EnglishSentenceSearch.tsx`

The code now clears results and calls `doSearch(query)` on channel change. This is directionally correct, but the report does not provide frontend runtime evidence.

Required fix:

- Include a browser/manual smoke note or screenshot evidence that switching channel no longer leaves stale results visible.

## Accepted Behavior

The direction of the implementation remains acceptable:

- Routes delegate to application use cases.
- Selection state has a domain model and storage persistence.
- Web has a Channels tab and dense video table.
- English Search now loads indexed channels.
- `ensureTranscriptUseCase(sourceId, { language: 'en' })` remains English-scoped.

## Decision

Stage 6 is not accepted yet.

Gemini should fix the stale `caption_ready` candidate filtering and strengthen the verification so it exercises real use cases or API routes rather than manually writing expected output files.
