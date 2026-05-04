# Stage 7 Plan: Channel Refresh and Incremental Video Discovery

Date: 2026-05-04
Owner: Codex
Executor: Gemini
Status: Ready for implementation after Stage 6 acceptance

## Context

Channels are living sources. A channel can have 236 videos today and 237 videos next week. The product must support refreshing the channel inventory without reprocessing all videos, losing selection state, or overwriting existing caption/index readiness.

Current behavior:

- `channel add <url> --limit N` uses `yt-dlp --flat-playlist --playlist-end N`.
- For YouTube `/videos` pages, the first N items are typically the channel's default videos ordering, normally newest first.
- Re-running capture with a larger limit updates `videos.json`, but the system does not yet explicitly represent refresh windows, added videos, missing remote videos, or discovery status.

Stage 7 should add incremental metadata refresh. It should not add automatic caption sync.

Reference guidance used:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `docs/GOTCHAS.md`

## Goal

Support safe channel inventory refresh:

```text
existing channel with local videos.json
-> fetch latest remote video inventory window
-> diff by videoId
-> merge new videos into videos.json
-> preserve old selection/caption/index state
-> write refresh report
-> show new videos in Channels UI
-> user manually selects new videos for English caption sync
```

Primary scenario:

```text
EnglishisEZ has 236 videos
-> next week it has 237
-> Refresh latest 50
-> system discovers 1 new video
-> old 236 remain stable
-> new video appears as New / not selected / not captured
```

## Non-goals

- Do not automatically sync captions for newly discovered videos.
- Do not download YouTube video files.
- Do not download YouTube audio files.
- Do not run MLX Audio transcription.
- Do not request or persist `zh-Hans` during refresh.
- Do not generate translations during refresh.
- Do not remove local videos that are missing from the latest remote window.
- Do not implement all-channel federated search.
- Do not introduce a database.
- Do not change the existing single-video machine translation behavior.

## Product Rules

Refresh is metadata-only.

After refresh:

- new videos should be visible and clearly marked,
- old selected/caption/index statuses must remain,
- missing remote videos should be marked or reported, not deleted,
- the user decides whether to select and sync new videos.

Use labels such as:

- `Refresh latest 50`
- `Full refresh`
- `New`
- `Remote missing`
- `Select new`
- `Sync selected English captions`

Avoid labels such as:

- `Download videos`
- `Auto ingest all`

## Persistence Shape

Keep existing channel files:

```text
data/channels/{channelId}/channel-manifest.json
data/channels/{channelId}/videos.json
data/channels/{channelId}/video-selection.json
data/channels/{channelId}/caption-sync-report.json
```

Add refresh report:

```text
data/channels/{channelId}/channel-refresh-report.json
```

Recommended report schema:

```json
{
  "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
  "mode": "latest",
  "limit": 50,
  "previousVideoCount": 236,
  "fetchedVideoCount": 50,
  "mergedVideoCount": 237,
  "addedCount": 1,
  "existingCount": 49,
  "missingRemoteCount": 0,
  "added": [
    {
      "videoId": "new123",
      "sourceId": "yt-new123",
      "title": "New lesson title",
      "url": "https://www.youtube.com/watch?v=new123",
      "publishedAt": null,
      "remoteOrder": 1,
      "discoveredAt": "2026-05-11T00:00:00.000Z"
    }
  ],
  "missingRemote": [],
  "refreshedAt": "2026-05-11T00:00:00.000Z"
}
```

Enhance video metadata if practical:

```json
{
  "id": "yt-new123",
  "videoId": "new123",
  "title": "New lesson title",
  "url": "https://www.youtube.com/watch?v=new123",
  "duration": 123,
  "publishedAt": null,
  "remoteOrder": 1,
  "firstDiscoveredAt": "2026-05-11T00:00:00.000Z",
  "lastSeenAt": "2026-05-11T00:00:00.000Z",
  "discoveryStatus": "new"
}
```

If TypeScript domain types make adding fields to `ChannelVideo` expensive, Gemini may add optional fields conservatively.

## Merge Rules

Use `videoId` as identity.

Given:

- existing local `videos.json`,
- fetched remote window from YouTube,
- optional existing `video-selection.json`,
- optional existing index/caption reports.

Rules:

1. Preserve existing local videos by default.
2. Add newly fetched video IDs to `videos.json`.
3. Do not duplicate by `videoId`.
4. Do not delete local videos missing from the latest fetched window.
5. Update existing video title/url/duration if the remote fetch provides better values.
6. Preserve `firstDiscoveredAt` for existing videos.
7. Update `lastSeenAt` for fetched videos.
8. Mark newly added videos as `discoveryStatus: "new"`.
9. Existing videos should not become `new` again on later refreshes.
10. Missing remote should be reported separately and may be marked `remote_missing`, but local assets stay intact.

For latest-window refresh, missingRemote should be conservative:

- If `mode: "latest"` and only 50 videos were fetched, do not mark old videos outside that window as missing.
- Only full refresh can confidently mark missing remote videos.

## Layer Placement

### Domain

Own refresh contracts:

```text
packages/domain/src/channelRefresh.ts
```

Suggested types:

- `ChannelRefreshMode`
- `ChannelRefreshReport`
- `ChannelRefreshAddedVideo`
- `ChannelVideoDiscoveryStatus`

### Source Adapter

Enhance YouTube channel capture options:

```ts
captureChannel(url, {
  limit,
  start,
  end,
  order
})
```

Minimum accepted for Stage 7:

- `limit`
- latest-window refresh with current YouTube default order

Optional:

- `--playlist-start`
- `--playlist-end`
- `order: newest | oldest`

Do not overbuild if yt-dlp cannot reliably support chronological order for YouTube channels.

### Storage

Own persistence:

- read/write channel refresh report,
- read/write merged videos,
- preserve selection.

Suggested additions:

```text
packages/storage/src/index.ts
```

or a more focused file if the package is split later.

### Application

Own orchestration:

```text
packages/application/src/refreshLearningChannelUseCase.ts
```

Responsibilities:

- load existing manifest/videos,
- fetch remote inventory window,
- compute diff,
- merge videos,
- save merged `videos.json`,
- save `channel-refresh-report.json`,
- leave selection/caption/index assets untouched.

### API

Extend learning channel routes:

```http
POST /api/learning-channels/:channelId/refresh
```

Input:

```json
{
  "mode": "latest",
  "limit": 50
}
```

Future optional input:

```json
{
  "mode": "range",
  "start": 51,
  "end": 100
}
```

### CLI

Add refresh command:

```bash
npm run -s cli -- channel refresh <channelId> --latest 50 --json
npm run -s cli -- channel refresh <channelId> --full --limit 300 --json
```

If channel ID alone is insufficient to refetch, use manifest URL.

### Web

Update Channels view:

- `Refresh latest 50`
- `Full refresh`
- show last refresh summary,
- show `New` badge in video table,
- filter video table by:
  - All,
  - New,
  - Selected,
  - Caption Ready,
  - Failed,
  - Remote Missing.

No refresh action should sync captions automatically.

## API Behavior

### `POST /api/learning-channels/:channelId/refresh`

Input:

```json
{
  "mode": "latest",
  "limit": 50
}
```

Output:

```json
{
  "channelId": "youtube-xxx",
  "mode": "latest",
  "previousVideoCount": 236,
  "fetchedVideoCount": 50,
  "mergedVideoCount": 237,
  "addedCount": 1,
  "missingRemoteCount": 0,
  "added": [
    {
      "videoId": "new123",
      "title": "New lesson title"
    }
  ]
}
```

Validation:

- channel must exist,
- `limit` default 50,
- `limit` max 500 unless explicitly justified,
- `mode` initially `latest` or `full`.

## UI Behavior

In channel detail:

```text
Refresh latest 50
Full refresh
New: 1
Total local: 237
```

Video table:

- show `New` badge for newly discovered videos,
- allow selecting only new videos,
- do not auto-select new videos by default,
- after selected English captions sync, status should update through Stage 6 mechanisms.

## Verification Strategy

Use deterministic local fixtures first.

Recommended script:

```text
scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts
```

The script should not need real YouTube. It can use a fake adapter seam or application-level injected fetcher if available. If no seam exists, Gemini should add a narrow test seam rather than relying only on real network.

The script must prove:

- existing 3-video channel refreshed with fetched 4-video window becomes 4 videos,
- exactly 1 video appears in `added`,
- old selection state is preserved,
- old caption/index statuses remain visible,
- new video defaults to unselected and not captured,
- refreshing again with the same window adds 0 videos,
- latest-window refresh does not mark older local videos as missing remote,
- full refresh can mark missing remote without deleting local videos,
- refresh does not create captions, translations, audio, or media.

## Acceptance Criteria

- `channel refresh <channelId> --latest 50 --json` works.
- `POST /api/learning-channels/:channelId/refresh` works.
- Refresh writes `channel-refresh-report.json`.
- Refresh merges videos by `videoId` without duplicates.
- Refresh preserves `video-selection.json`.
- Refresh preserves existing source/caption/index assets.
- New videos are visible in channel video table.
- New videos default to `selected: false`.
- New videos have `captionStatus: not_captured` and `indexStatus: not_indexed`.
- UI can filter to `New`.
- Refresh does not trigger caption sync.
- Refresh does not create `captions/en`, `zh-Hans`, translation, audio, or media assets.
- Re-running the same refresh is idempotent.
- `npm run typecheck` passes.
- `npm run build` passes.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts
npm run typecheck
npm run build
```

If a real API smoke is included, keep it bounded:

```bash
curl -sS -X POST "http://127.0.0.1:8001/api/learning-channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/refresh" \
  -H 'Content-Type: application/json' \
  -d '{"mode":"latest","limit":50}'
```

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-04-channel-refresh-incremental-video-discovery-report.md
```

The report must include:

- changed files,
- CLI/API command examples,
- merge algorithm summary,
- generated refresh report example,
- before/after video counts,
- added/missingRemote evidence,
- proof selection state was preserved,
- proof refresh did not create caption/media/translation assets,
- frontend verification evidence,
- skipped checks and reasons,
- unresolved risks.

## Codex Audit Checklist

Codex should reject the report if:

- refresh overwrites `videos.json` and loses old videos,
- refresh duplicates videos,
- refresh mutates or clears `video-selection.json`,
- latest-window refresh marks older out-of-window videos as missing remote,
- refresh auto-syncs captions,
- refresh creates caption, translation, audio, or media assets,
- new videos are auto-selected without explicit user setting,
- report omits before/after count evidence,
- verification relies only on live YouTube without deterministic fixture coverage,
- typecheck/build are skipped without a concrete blocker.
