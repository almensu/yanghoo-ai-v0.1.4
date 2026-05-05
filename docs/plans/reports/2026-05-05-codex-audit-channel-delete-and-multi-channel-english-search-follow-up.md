# Codex Audit Follow-Up: Stage 12 Channel Delete and Multi-Channel English Search

Date: 2026-05-05

Audited report:

- `docs/plans/reports/2026-05-05-channel-delete-and-multi-channel-english-search-report.md`

Previous audit:

- `docs/plans/reports/2026-05-05-codex-audit-channel-delete-and-multi-channel-english-search.md`

## Verdict

Rejected for one remaining delete-safety fix.

The revised Stage 12 implementation fixes the originally reported selection/report shared-source case, passes the revised verification script, and now preserves API warnings through the web client. However, deletion still misses a valid shared-reference case: another channel may reference the same source/video in its URL library `videos.json` before selection or caption sync has happened.

## Findings

### P1: Shared source detection ignores other channels' `videos.json`

File:

- `packages/application/src/deleteLearningChannelUseCase.ts`

Current shared-source collection scans only:

- `channelStorage.getVideoSelection(chId)`
- `channelStorage.getCaptionSyncReport(chId)`

It does not scan:

- `channelStorage.getChannelVideos(chId)`

But the delete loop itself uses `video.id` as a fallback source id:

```ts
const sourceId = selMap.get(video.videoId)?.sourceId || video.id;
```

That means a source referenced by another channel's URL library can still be deleted if that other channel has not yet selected/synced the video.

Reproduction evidence:

```bash
DATA_DIR="$(mktemp -d)" npx tsx -e "<two channels share source in videos.json only>"
```

Key output:

```json
{
  "before": true,
  "after": false,
  "channelB": true,
  "deletedSources": 1,
  "skippedSources": 0,
  "warnings": []
}
```

Interpretation:

- `channelB` still exists.
- The source referenced by `channelB`'s URL library was deleted.
- No warning was returned.

Required fix:

- `collectSourceIdsReferencedByOtherChannels()` must also scan every other channel's `videos.json`.
- It should add `video.id` and, when available, any selection/report `sourceId`.
- Prefer matching both exact `sourceId` and YouTube `videoId` where the data model allows it, so source preservation does not depend only on one id shape.
- Add a verification case where two channels share a video/source only through `videos.json`, with no selection and no caption sync report. Deleting one channel must preserve the shared source and return an explicit skipped-source warning.

## Previously Raised Items Now Fixed

- Selection/report shared-source safety: fixed and verified.
- Real two-channel search verification: fixed and verified.
- Delete path-level summary: improved by merging `deleteSource()` details.
- API warnings passthrough to UI: fixed.

## Verification Run

Commands run:

```bash
npx tsx scripts/ops/verify-stage12-channel-delete-and-multi-channel-english-search.ts
npm run typecheck
npm run build
```

Observed results:

- Revised Stage 12 verification: `28 passed, 0 failed`.
- `npm run typecheck`: passed.
- `npm run build`: passed.

These passing checks are valid, but the verification suite still needs the `videos.json`-only shared-source case above.

## Next Gemini Task

Patch Stage 12 only:

- Extend shared-source detection to include other channels' URL library videos.
- Add the missing videos-only shared-source regression test.
- Re-run the revised Stage 12 verification, `npm run typecheck`, and `npm run build`.
