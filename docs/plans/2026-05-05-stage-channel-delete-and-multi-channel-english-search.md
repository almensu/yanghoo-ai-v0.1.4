# Stage 12 Plan: Channel Delete and Multi-Channel English Search

Date: 2026-05-05
Owner: Codex
Executor: Gemini
Status: Ready

## Context

Channels now behave as a URL library with English subtitle intake. Two user-facing workflow gaps remain:

1. Channel URL Library needs a clear delete action for removing a channel and its subtitle assets.
2. English Search currently searches one channel at a time, but the learning workflow should default to searching all indexed channels, with checkboxes to narrow to one or several channels.

This stage adds those two surfaces while preserving the existing transcript-first architecture.

## Goals

### Channel Delete

Add a dangerous delete action in the Channel URL Library:

```text
channel card/detail
-> Delete channel
-> second confirmation
-> remove channel library and default subtitle assets for that channel
```

### Multi-Channel English Search

Add channel checkboxes in English Search:

```text
default: all indexed channels selected
-> user can uncheck/check channels
-> search runs across selected channels
-> results include source channel context
```

## Non-Goals

- Do not remove the global single-video machine translation feature.
- Do not add video or audio downloads to Channels.
- Do not change YouTube caption acquisition internals unless required for delete cleanup.
- Do not introduce a database.
- Do not remove unrelated source assets outside the deleted channel.
- Do not implement cross-language search. English Search remains `language: en`.

## Product Rules

- Channel deletion is destructive and must require explicit confirmation.
- Default delete behavior removes the channel URL library and subtitle/search assets associated with that channel.
- Deletion must not silently delete unrelated sources that are not in the channel's `videos.json` or reports.
- English Search defaults to all indexed learning channels selected.
- Users can select one, several, or all indexed channels.
- If no channel is selected, search should not run and the UI should show a clear empty state.

## Target Files

Expected areas:

- `packages/domain/src/index.ts`
- `packages/domain/src/storage.ts`
- `packages/storage/src/index.ts`
- `packages/application/src/deleteLearningChannelUseCase.ts`
- `packages/application/src/searchEnglishSentenceIndexUseCase.ts`
- `packages/application/src/index.ts`
- `apps/api/src/routes/learningChannels.ts`
- `apps/api/src/routes/englishSentences.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/LearningChannelLibrary.tsx`
- `apps/web/src/components/LearningChannelVideoTable.tsx`
- `apps/web/src/components/EnglishSentenceSearch.tsx`
- `scripts/ops/verify-stage12-channel-delete-and-multi-channel-english-search.ts`
- `docs/plans/reports/2026-05-05-channel-delete-and-multi-channel-english-search-report.md`

Keep edits scoped. If an existing storage helper already supports safe deletion, use it rather than adding a broad new deletion API.

## Channel Delete Requirements

### API

Add a route such as:

```http
DELETE /api/learning-channels/:channelId
```

Expected behavior:

- returns 404 if channel does not exist,
- deletes the channel directory under `data/channels/{channelId}`,
- deletes default source/subtitle assets for source IDs associated with the channel videos when safe,
- returns a summary of deleted and skipped paths.

Deletion summary shape can be conservative:

```json
{
  "channelId": "youtube-xxx",
  "deletedChannel": true,
  "deletedSources": 20,
  "skippedSources": 0,
  "deletedPaths": [],
  "skippedPaths": [],
  "warnings": []
}
```

### UI

Add a delete button in Channel URL Library, preferably on the channel detail view and/or channel card action area.

The UI must require a second confirmation. Acceptable patterns:

- modal confirmation,
- typed channel title/id confirmation,
- browser confirm as a minimum for first implementation.

The confirmation text must say that channel URLs and subtitles will be removed by default.

### Safety

Do not delete:

- global translation code or config,
- unrelated `data/sources` directories not tied to the channel,
- unrelated channels,
- media/audio assets outside the deleted channel's source IDs.

## Multi-Channel English Search Requirements

### API

Support searching multiple channels. Options:

1. Extend `/api/english-sentences/search` to accept repeated or comma-separated `channelId`.
2. Add `channelIds` query parameter.
3. Add a new POST endpoint for structured search body.

Pick the smallest change that keeps validation clear.

The application layer should fan out across selected channel indexes and return a merged result set. Sorting should remain stable and explainable:

- primary: existing sentence index score/order,
- then `publishedAt` or stable fallback,
- then channel/video/start time as needed.

If any selected channel has no index, do not fail the entire search. Return results from indexed channels and include warnings, or skip unindexed channels before search by only listing indexed channels in the selector.

### UI

English Search should:

- load indexed learning channels,
- default all indexed channels selected,
- show a checkbox per channel,
- include `Select all` / `Clear` controls,
- allow single-channel and multi-channel search,
- show result channel context.

No selected channels:

- disable search or show a clear message,
- do not call the search API.

## Verification Strategy

Use deterministic local fixtures first.

Recommended script:

```text
scripts/ops/verify-stage12-channel-delete-and-multi-channel-english-search.ts
```

The script should prove:

- channel delete removes the target channel directory,
- channel delete removes only source assets tied to the deleted channel,
- channel delete does not remove unrelated channels or unrelated sources,
- delete returns a truthful summary,
- English Search can search across two indexed channels,
- English Search can search a single selected channel,
- no selected channels produce no API search call or a validation error,
- typecheck/build pass.

## Acceptance Criteria

- Channel URL Library exposes a delete channel action.
- Delete requires second confirmation.
- Default delete removes the channel library and that channel's subtitle assets.
- Delete does not remove unrelated channels or unrelated source assets.
- English Search defaults to all indexed channels selected.
- English Search supports selecting one or multiple channels.
- Search results across multiple channels are merged and include channel context.
- Empty channel selection is handled clearly.
- `npm run typecheck` passes.
- `npm run build` passes.
- Deterministic verification passes.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage12-channel-delete-and-multi-channel-english-search.ts
npm run typecheck
npm run build
```

If API routes change, include bounded API smoke evidence for:

```bash
GET /api/learning-channels
DELETE /api/learning-channels/:channelId
GET /api/english-sentences/search
```

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-05-channel-delete-and-multi-channel-english-search-report.md
```

The report must include:

- changed files,
- delete behavior and confirmation UX,
- deletion summary example,
- multi-channel search API shape,
- English Search checkbox behavior,
- verification commands and results,
- skipped checks and reasons,
- residual risks.

## Audit Checklist

Codex should reject the report if:

- delete lacks a second confirmation,
- delete can remove unrelated channels or source assets,
- delete reports success without proving what was removed,
- English Search still only supports a single active channel,
- default selected channels are not all indexed channels,
- empty channel selection triggers confusing searches,
- verification lacks deterministic delete safety coverage,
- typecheck or build are skipped without a concrete blocker.
