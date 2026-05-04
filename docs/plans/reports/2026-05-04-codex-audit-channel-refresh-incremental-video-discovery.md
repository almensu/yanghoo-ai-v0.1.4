# Codex Audit: Stage 7 Channel Refresh and Incremental Video Discovery

Date: 2026-05-04
Auditor: Codex
Plan: `docs/plans/2026-05-04-stage-channel-refresh-incremental-video-discovery.md`
Gemini Report: `docs/plans/reports/2026-05-04-channel-refresh-incremental-video-discovery-report.md`
Result: Rejected

## Commands Run

```bash
npx tsx scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts
npm run typecheck
npm run build
npx tsx -e "import { mergeChannelVideos } from './packages/application/src/refreshChannelVideosUseCase.ts'; const v=(id:string)=>({id:'yt-'+id,videoId:id,title:id,url:'https://youtu.be/'+id}); const r=mergeChannelVideos([], [v('new1'), v('new2'), v('new1')], 'latest'); console.log(JSON.stringify({ids:r.merged.map(x=>x.videoId), unique:[...new Set(r.merged.map(x=>x.videoId))], added:r.addedVideos.map(x=>x.videoId)}, null, 2));"
```

## Verification Result

- Stage 7 verification script passed: 43/43 assertions.
- `npm run typecheck` passed.
- `npm run build` passed.
- Additional Codex duplicate-new probe failed the intended invariant:

```json
{
  "ids": ["new1", "new2", "new1"],
  "unique": ["new1", "new2"],
  "added": ["new1", "new2", "new1"]
}
```

## Findings

### P1: Refresh Can Persist Duplicate New Videos

`packages/application/src/refreshChannelVideosUseCase.ts` builds `localMap` only from existing local videos. When a remote refresh window contains a duplicate `videoId` that is not already local, the first occurrence is prepended but the map/set is not updated. A later duplicate occurrence is treated as new again and is prepended a second time.

Relevant code:

- `packages/application/src/refreshChannelVideosUseCase.ts:20` builds `localMap` from local videos only.
- `packages/application/src/refreshChannelVideosUseCase.ts:27` iterates remote videos.
- `packages/application/src/refreshChannelVideosUseCase.ts:29` treats any remote ID missing from the original local map as new.
- `packages/application/src/refreshChannelVideosUseCase.ts:30` prepends without marking the ID as seen.

This violates the Stage 7 merge rule and audit checklist:

- `docs/plans/2026-05-04-stage-channel-refresh-incremental-video-discovery.md:158` says `videoId` is identity.
- `docs/plans/2026-05-04-stage-channel-refresh-incremental-video-discovery.md:171` says do not duplicate by `videoId`.
- `docs/plans/2026-05-04-stage-channel-refresh-incremental-video-discovery.md:367` says Codex should reject if refresh duplicates videos.

Required fix:

- Track `seenVideoIds` initialized from local videos.
- For each remote video, skip or merge duplicates if `seenVideoIds` already contains the ID.
- When adding a new remote video, immediately add its `videoId` to `seenVideoIds`.
- Add a verification assertion where `remoteVideos` contains duplicate new IDs, not only duplicates of existing local IDs.

### P2: Multiple New Videos Are Reordered Opposite To Remote Order

`merged.unshift(remote)` runs once per newly discovered video. If remote order is `[newest, secondNewest, old]`, the final merged prefix becomes `[secondNewest, newest, ...]`.

This does not break persistence safety, but it weakens the "latest 50 / newest first" user expectation. For a learning channel UI, the user should see the fetched remote order preserved.

Required fix:

- Collect new videos in remote order, then save `merged = [...newVideos, ...updatedLocalVideos]`, or iterate new remote additions in reverse only at the final insertion step.
- Add an assertion for multiple new videos preserving remote order.

## Accepted Parts

- Refresh is metadata-only in the reviewed path.
- No caption, `zh-Hans`, translation, audio, or media side effects were observed by the deterministic script.
- Latest-window mode does not mark out-of-window old videos as remote missing.
- Full mode reports missing remote IDs without deleting local videos.
- `video-selection.json` preservation is covered by fixture evidence.
- API route and CLI command are wired.
- Typecheck and build are clean.

## Notes

Gemini skipped live API smoke and browser screenshots. That is acceptable for this rejection because the blocking issue is already proven in deterministic application logic. After the duplicate fix, a bounded API smoke would still strengthen acceptance because `POST /api/learning-channels/:channelId/refresh` is an explicit Stage 7 acceptance criterion.

## Required Gemini Follow-Up

1. Fix `mergeChannelVideos` so duplicate remote new IDs cannot be persisted.
2. Preserve remote order for multiple newly discovered videos.
3. Extend `scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts` with:
   - duplicate new remote IDs,
   - multiple new videos preserving order.
4. Re-run:

```bash
npx tsx scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts
npm run typecheck
npm run build
```

Stage 7 should remain rejected until these are resolved.
