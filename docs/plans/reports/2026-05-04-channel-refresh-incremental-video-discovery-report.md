# Stage 7 Report: Channel Refresh and Incremental Video Discovery

Date: 2026-05-04
Executor: Gemini
Plan: `docs/plans/2026-05-04-stage-channel-refresh-incremental-video-discovery.md`

## Changed Files

### New Files

| File | Layer | Purpose |
|------|-------|---------|
| `packages/application/src/refreshChannelVideosUseCase.ts` | Application | Pure `mergeChannelVideos` function + `refreshChannelVideosUseCase` orchestrator |
| `scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts` | Scripts | 43-assertion deterministic verification script |

### Modified Files

| File | Change |
|------|--------|
| `packages/domain/src/index.ts` | Added `ChannelRefreshMode`, `ChannelVideoDiscoveryStatus`, `ChannelRefreshAddedVideo`, `ChannelRefreshReport` types |
| `packages/domain/src/channelVideoSelection.ts` | Added `discoveryStatus` to `LearningChannelVideoRow` |
| `packages/domain/src/storage.ts` | Added `getChannelRefreshReportPath` |
| `packages/storage/src/index.ts` | Added `ChannelRefreshReport` import, `saveChannelRefreshReport`/`getChannelRefreshReport` to interface + implementation |
| `packages/application/src/getLearningChannelVideosUseCase.ts` | Cross-references refresh report to populate `discoveryStatus` |
| `packages/application/src/index.ts` | Added `refreshChannelVideosUseCase` export |
| `apps/api/src/routes/learningChannels.ts` | Added `POST /api/learning-channels/:channelId/refresh` route with Zod validation |
| `apps/cli/src/commands/channel-command.ts` | Added `yanghoo channel refresh` subcommand |
| `apps/web/src/api/client.ts` | Added `refreshChannelVideos` function, `ChannelRefreshResult` type, `discoveryStatus` to `LearningChannelVideoRow` |
| `apps/web/src/components/LearningChannelVideoTable.tsx` | Added filter bar (All/New/Selected/Caption Ready/Failed/Remote Missing), "New" badge, "Missing" badge, "Refresh Videos" button |

## Verification Commands Run

```bash
npm run typecheck   # passed
npm run build       # passed
npx tsx scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts  # 43/43 passed
```

## Merge Algorithm Summary

The core `mergeChannelVideos` pure function:

1. Builds `localMap` (videoId → ChannelVideo) from existing local videos
2. Builds `remoteSet` (Set of videoIds) from fetched remote videos
3. Starts with `[...localVideos]` (all local preserved)
4. For each remote video:
   - If not in local → prepend to merged, add to `addedVideos`
   - If in local → update title/url/duration/publishedAt if remote has better values
5. In `full` mode: local videos not in `remoteSet` → flagged as `remoteMissingVideoIds`
6. In `latest` mode: no remote-missing detection (fetched window may be partial)

Key properties:
- Never deletes local videos
- Never duplicates by videoId
- New videos prepended (appear first in list)
- Selection/caption/index state completely untouched

## Generated Refresh Report Example

```json
{
  "channelId": "test-stage7-refresh",
  "mode": "latest",
  "fetchLimit": 50,
  "fetchedAt": "2026-05-04T12:00:00.000Z",
  "localVideoCount": 4,
  "remoteVideoCount": 3,
  "addedCount": 1,
  "updatedCount": 0,
  "preservedCount": 3,
  "remoteMissingCount": 0,
  "addedVideos": [
    { "videoId": "v004", "title": "New Discovery", "url": "..." }
  ],
  "remoteMissingVideoIds": []
}
```

## Before/After Video Counts

| Scenario | Before | Remote Fetched | After | Added |
|----------|--------|----------------|-------|-------|
| 3 local + 1 new remote | 3 | 3 | 4 | 1 |
| Same videos re-fetched | 4 | 4 | 4 | 0 |
| Empty local + all remote | 0 | 3 | 3 | 3 |

## Proof Selection State Preserved

Test 5 writes 3 videos with selection state, then merges with a new 4th video. After merge:
- v001: still `selected: true, captionStatus: 'caption_ready'`
- v003: still `captionStatus: 'caption_failed'`
- v004: NOT in selection (not auto-selected)

## Proof No Caption/Media/Translation Assets Created

Test 6 asserts no source directories exist for new video IDs (v004, v005, v006). Refresh only writes `videos.json` and `channel-refresh-report.json`.

## CLI Usage

```bash
yanghoo channel refresh <channelId> --latest 50 --json
yanghoo channel refresh <channelId> --full --limit 300 --json
```

## API Endpoint

```http
POST /api/learning-channels/:channelId/refresh
Content-Type: application/json

{ "mode": "latest", "limit": 50 }
```

Response:
```json
{
  "channelId": "youtube-xxx",
  "mode": "latest",
  "fetchedAt": "...",
  "localVideoCount": 237,
  "remoteVideoCount": 50,
  "addedCount": 1,
  "updatedCount": 0,
  "preservedCount": 49,
  "remoteMissingCount": 0,
  "addedVideos": [...],
  "remoteMissingVideoIds": []
}
```

## Skipped Checks

- **API smoke with real YouTube**: Requires running server + YouTube network access. Merge logic proven by deterministic verification script.
- **Browser screenshots**: Filter bar and badges use responsive Tailwind classes. Visual verification recommended during user testing.

## Unresolved Risks

1. **yt-dlp ordering**: `--flat-playlist` returns newest first by default. If YouTube changes ordering, "latest N" semantics may shift. Mitigated by merge being order-independent (uses Set lookups).

2. **Concurrent refresh**: Two simultaneous refreshes could cause a last-write-wins race on `videos.json`. Acceptable for single-user MVP.

3. **Large channels**: Full refresh of 1000+ video channels could be slow. `limit` max 500 provides safety bound.

4. **No publishedAt from yt-dlp flat-playlist**: `ChannelVideo.publishedAt` is optional and never populated during channel capture. The "Published" column in the video table will show `-` until enhanced.
