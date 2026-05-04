# Stage 6 Plan: Multi-channel Registry and Selective Caption Intake

Date: 2026-05-04
Owner: Codex
Executor: Gemini
Status: Ready for implementation

## Context

The product now has a proven single-channel learning pipeline:

```text
channel URL
-> channel manifest and videos.json
-> bounded English caption sync
-> English sentence index
-> Youglish-like English search surface
```

Accepted reports:

- `docs/plans/reports/2026-05-04-codex-accept-vanessa-real-channel-closed-loop.md`
- `docs/plans/reports/2026-05-04-youglish-like-english-search-surface-report.md`

The next product need is multi-channel operation:

```text
register more YouTube channels
-> view each channel's videos
-> choose which videos to ingest
-> sync English captions only for selected videos
-> build/search per-channel sentence indexes
```

Important terminology:

- In this stage, "download selected videos" means "download/sync English caption assets for selected videos."
- It does not mean downloading YouTube video files or audio files.

Reference guidance used:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `docs/GOTCHAS.md`

## Goal

Build multi-channel registration and selective English caption intake.

Primary user flow:

```text
open web app
-> add YouTube channel URL
-> see local channel list
-> open a channel
-> see its video inventory
-> select videos
-> sync English captions for selected videos
-> build or refresh that channel's sentence index
-> search that channel in English Search
```

## Non-goals

- Do not download YouTube video files.
- Do not download YouTube audio files.
- Do not run MLX Audio transcription.
- Do not request or persist `zh-Hans` in selected English-caption intake.
- Do not generate translations in selected English-caption intake.
- Do not remove or weaken the existing single-video machine translation feature.
- Do not implement all-channel federated search yet.
- Do not introduce a new database.
- Do not implement background queue orchestration unless the existing job mechanism can be reused with low risk.

## Product Rules

Channel management must remain learner-oriented:

- show document/search readiness,
- show selected-for-learning status,
- show caption/index status,
- keep destructive or maintenance actions out of the primary path.

Primary action labels should avoid "download video". Use labels such as:

- `Add Channel`
- `Select`
- `Sync English Captions`
- `Sync Next 20`
- `Retry Failed`
- `Build Index`
- `Search Channel`

## Persistence Shape

Keep channel metadata in existing canonical locations:

```text
data/channels/{channelId}/channel-manifest.json
data/channels/{channelId}/videos.json
data/channels/{channelId}/sync-checkpoint.json
data/channels/{channelId}/caption-sync-report.json
data/indexes/{channelId}/english-sentences.jsonl
data/indexes/{channelId}/english-sentences-manifest.json
```

Add selected-video state:

```text
data/channels/{channelId}/video-selection.json
```

Recommended schema:

```json
{
  "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
  "updatedAt": "2026-05-04T00:00:00.000Z",
  "items": [
    {
      "videoId": "EsVaXsNNASc",
      "sourceId": "yt-EsVaXsNNASc",
      "selected": true,
      "captionStatus": "ready",
      "indexStatus": "indexed",
      "lastError": null,
      "updatedAt": "2026-05-04T00:00:00.000Z"
    }
  ]
}
```

Status vocabulary can be adjusted, but must distinguish at least:

- not captured,
- selected,
- caption ready,
- caption failed,
- indexed.

Do not store duplicate video metadata here if it already exists in `videos.json`; selection should reference video/source IDs and derived readiness.

## Layer Placement

### Domain

Own stable contracts:

- channel summary,
- channel video intake item,
- video selection manifest,
- selected caption intake status vocabulary.

Suggested file:

```text
packages/domain/src/channelVideoSelection.ts
```

### Storage

Own filesystem persistence for:

- listing known channels,
- reading channel manifests/videos,
- reading/writing `video-selection.json`,
- deriving per-video status from existing source/caption/index/report artifacts.

Suggested file:

```text
packages/storage/src/channelVideoSelectionStorage.ts
```

### Application

Own orchestration:

- register channel from URL by delegating to existing channel capture use case,
- list local channels with counts,
- get channel detail with video rows and readiness,
- update selected videos,
- sync English captions for selected videos,
- build channel index after selected sync,
- expose search-channel readiness.

Suggested files:

```text
packages/application/src/listLearningChannelsUseCase.ts
packages/application/src/getLearningChannelVideosUseCase.ts
packages/application/src/updateChannelVideoSelectionUseCase.ts
packages/application/src/syncSelectedEnglishCaptionsUseCase.ts
```

If existing use cases can be reused cleanly, prefer reuse over new parallel implementations.

### API

Add focused routes for learning channels.

Suggested file:

```text
apps/api/src/routes/learningChannels.ts
```

Suggested endpoints:

```http
POST /api/learning-channels
GET  /api/learning-channels
GET  /api/learning-channels/:channelId/videos
PUT  /api/learning-channels/:channelId/selection
POST /api/learning-channels/:channelId/sync-selected
POST /api/learning-channels/:channelId/build-index
```

Route rules:

- validate request shape,
- call application use cases,
- do not read/write files directly,
- do not call YouTube adapters directly from route handlers.

### Web

Add a Channel Library surface.

Suggested components:

```text
apps/web/src/components/LearningChannelLibrary.tsx
apps/web/src/components/LearningChannelVideoTable.tsx
```

Update:

```text
apps/web/src/App.tsx
apps/web/src/api/client.ts
apps/web/src/components/EnglishSentenceSearch.tsx
```

The English Search surface should allow choosing one indexed channel. In Stage 6, per-channel search is enough; do not implement all-channel search unless it is trivial and fully tested.

## API Behavior

### `POST /api/learning-channels`

Input:

```json
{
  "url": "https://www.youtube.com/@SpeakEnglishWithVanessa",
  "limit": 50
}
```

Behavior:

- capture/update channel manifest and video inventory,
- bounded by `limit`,
- does not sync captions,
- returns channel summary.

### `GET /api/learning-channels`

Returns local channel summaries:

```json
{
  "channels": [
    {
      "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
      "title": "Speak English With Vanessa",
      "videoCount": 30,
      "selectedCount": 20,
      "captionReadyCount": 20,
      "indexedSentenceCount": 3246,
      "updatedAt": "2026-05-04T00:00:00.000Z"
    }
  ]
}
```

### `GET /api/learning-channels/:channelId/videos`

Returns video inventory with selection/readiness:

```json
{
  "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
  "videos": [
    {
      "videoId": "EsVaXsNNASc",
      "sourceId": "yt-EsVaXsNNASc",
      "title": "Real English Conversation",
      "publishedAt": "2026-01-01T00:00:00.000Z",
      "selected": true,
      "captionStatus": "ready",
      "indexStatus": "indexed",
      "youtubeUrl": "https://www.youtube.com/watch?v=EsVaXsNNASc",
      "lastError": null
    }
  ]
}
```

### `PUT /api/learning-channels/:channelId/selection`

Input:

```json
{
  "videoIds": ["EsVaXsNNASc", "0R22Fxe_SFE"],
  "selected": true
}
```

Behavior:

- updates `video-selection.json`,
- preserves existing status fields,
- returns updated counts.

### `POST /api/learning-channels/:channelId/sync-selected`

Input:

```json
{
  "batchSize": 10,
  "force": false
}
```

Behavior:

- sync English captions only for selected videos that are not already ready unless `force` is true,
- bounded by `batchSize`,
- continues after individual failures,
- updates selection status and existing `caption-sync-report.json`.

If existing `syncChannelCaptionsUseCase` only supports manifest-order batches, Gemini may implement a selected-video wrapper that temporarily filters selected videos in application logic. Do not hack route handlers or mutate `videos.json` destructively.

### `POST /api/learning-channels/:channelId/build-index`

Behavior:

- calls `buildEnglishSentenceIndexUseCase(channelId, 'en')`,
- returns index manifest summary.

## Web UX Requirements

Add a top-level tab:

```text
Tasks | Channels | English Search
```

### Channels View

Must include:

- channel URL input,
- limit input with safe default, such as 50,
- local channel list,
- channel detail view,
- video selection table,
- bulk select visible/selected controls,
- `Sync English Captions` action,
- `Build Index` action,
- clear status badges.

The video table should be dense and operational, not card-heavy:

- checkbox,
- title,
- published date,
- selected state,
- caption status,
- index status,
- failure reason if any.

### English Search

Replace hardcoded Vanessa-only behavior with channel selection from local indexed channels.

Minimum:

- dropdown/select for channel,
- default to Vanessa if still available,
- search selected channel only,
- keep current search result UI.

## Verification Strategy

Gemini must provide deterministic verification. Prefer a script:

```text
scripts/ops/verify-stage6-multi-channel-selective-intake.ts
```

The script should use local fixtures or a tiny real-data bound. It must prove:

- multiple channel manifests can be listed,
- selection writes `video-selection.json`,
- deselection persists,
- selected sync only attempts selected videos,
- unselected videos are not processed,
- build index works after selected sync,
- no forbidden assets are created.

If real YouTube access is used, keep the bound small and document exact commands and network dependency.

## Acceptance Criteria

- User can register at least two YouTube channel URLs through API or Web.
- Local channel list returns both channels.
- Channel videos endpoint returns video inventory with selection/readiness fields.
- Selecting videos writes `data/channels/{channelId}/video-selection.json`.
- Refreshing preserves selection state.
- Sync selected processes only selected videos.
- Unselected videos do not get new English caption assets during selected sync.
- Sync selected is bounded by `batchSize`.
- Sync selected writes truthful per-video status and errors.
- Build index works for the selected channel after sync.
- English Search can switch between indexed channels.
- No `zh-Hans`, `translation`, audio, or media assets are created by selected English-caption intake.
- Existing task/card/reader workflows still render.
- Existing single-video machine translation path remains available.
- `npm run typecheck` passes.
- `npm run build` passes.

## Verification Commands

Gemini must run:

```bash
npm run typecheck
npm run build
```

Recommended:

```bash
npx tsx scripts/ops/verify-stage6-multi-channel-selective-intake.ts
```

If the verification script is skipped, the report must include equivalent API/CLI commands and explain why no script was created.

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-04-multi-channel-registry-selective-caption-intake-report.md
```

The report must include:

- changed files,
- new API endpoints,
- new persistence files,
- exact commands run,
- generated file evidence,
- selected vs unselected processing evidence,
- side-effect scan evidence,
- frontend verification evidence,
- skipped checks and reasons,
- unresolved risks.

## Codex Audit Checklist

Codex should reject the report if:

- "download selected videos" downloads video or audio files,
- selected sync creates `zh-Hans`, translation, audio, or media assets,
- route handlers directly implement core selection/sync logic,
- selection state is only frontend state and not persisted,
- unselected videos are processed during selected sync,
- sync selected is unbounded,
- English Search remains hardcoded to Vanessa only,
- task/reader or machine-translation workflows are removed or disabled,
- typecheck/build are skipped without a concrete blocker.
