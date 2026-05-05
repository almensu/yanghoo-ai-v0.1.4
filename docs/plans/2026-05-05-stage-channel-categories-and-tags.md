# Stage 15 Plan: Channel Categories and Tags

Date: 2026-05-05
Owner: Codex
Executor: Gemini
Status: Ready

## Context

The Channel URL Library can now collect many YouTube channels, selectively sync English subtitles, build sentence indexes, search across selected channels, and save useful examples. As the number of channels grows, a flat channel list becomes inefficient.

The user needs channel organization:

```text
news
street interview
AI
English teacher
podcast
business
tech
custom groups
```

This stage adds a local channel taxonomy system:

```text
channel -> one category + many tags + optional note
```

Then English Search can filter and bulk-select channels by category/tag:

```text
Category: AI
Tag: interview
-> Select visible
-> Search only those channels
```

## Goals

- Allow each learning channel to have one custom category.
- Allow each learning channel to have multiple tags.
- Persist taxonomy under the canonical data root.
- Show and edit taxonomy in Channel URL Library.
- Return taxonomy with learning channel summaries.
- Let English Search filter the channel selector by category and tag.
- Add efficient selection actions:
  - Select visible,
  - Clear visible,
  - Select category,
  - Select tag.
- Delete a channel's taxonomy record when the channel is deleted.

## Non-Goals

- Do not add multi-level category trees.
- Do not add AI auto-classification.
- Do not add tag color customization.
- Do not add cloud sync.
- Do not add drag-and-drop taxonomy management.
- Do not classify individual videos in this stage.
- Do not change subtitle sync or sentence indexing semantics.
- Do not remove or alter the global machine translation feature.
- Do not introduce a database.

## Product Model

Each channel gets:

```ts
category?: string;
tags: string[];
note?: string;
```

Category:

- one primary classification,
- free-form but normalized,
- suggested presets in UI.

Tags:

- many labels,
- normalized,
- used for finer filtering and bulk selection.

Examples:

```json
{
  "channelId": "youtube-xxx",
  "category": "news",
  "tags": ["british", "daily-news", "beginner"],
  "note": "Short current-events English."
}
```

```json
{
  "channelId": "youtube-yyy",
  "category": "street-interview",
  "tags": ["american", "conversation", "fast-speaking"],
  "note": ""
}
```

## Normalization Rules

Category:

- trim,
- lowercase,
- convert spaces to hyphens,
- collapse repeated hyphens,
- remove leading/trailing hyphens,
- empty string means no category.

Tags:

- trim,
- lowercase,
- convert spaces to hyphens,
- remove empty,
- dedupe,
- stable sort optional but recommended.

Display labels can be friendlier:

```text
street-interview -> Street Interview
english-teacher -> English Teacher
```

Do not store display-only labels as the source of truth in this stage.

## Suggested Presets

Category suggestions:

```text
news
street-interview
ai
english-teacher
podcast
business
tech
culture
conversation
story
pronunciation
grammar
```

Tag suggestions:

```text
american
british
beginner
intermediate
advanced
slow-english
fast-speaking
daily-news
interview
conversation
business
ai
pronunciation
listening
shadowing
```

These are suggestions only. Users can type custom values.

## Persistence

Persist separately from channel manifests:

```text
data/channels/channel-taxonomy.json
```

File shape:

```json
{
  "version": 1,
  "updatedAt": "2026-05-05T00:00:00.000Z",
  "items": [
    {
      "channelId": "youtube-xxx",
      "category": "news",
      "tags": ["british", "daily-news"],
      "note": "",
      "updatedAt": "2026-05-05T00:00:00.000Z"
    }
  ]
}
```

Why separate:

- avoids polluting captured YouTube channel manifests,
- can evolve independently,
- can be exported/imported later,
- easier to clean when a channel is deleted.

## Layer Placement

### Domain

Add types:

- `ChannelTaxonomyItem`
- `ChannelTaxonomyFile`
- possibly `LearningChannelSummary` taxonomy fields if that summary type lives in domain.

### Storage

Add a narrow interface:

```ts
interface ChannelTaxonomyStorage {
  readChannelTaxonomy(): Promise<ChannelTaxonomyFile>;
  writeChannelTaxonomy(file: ChannelTaxonomyFile): Promise<void>;
}
```

Implementation:

- file absence returns empty taxonomy file,
- ensure `data/channels/` exists,
- write JSON with indentation,
- do not expose `fs` to API/application callers.

### Application

Add:

```text
packages/application/src/channelTaxonomyUseCases.ts
```

Use cases:

- `listChannelTaxonomyUseCase`
- `updateChannelTaxonomyUseCase`
- `deleteChannelTaxonomyUseCase`
- `normalizeChannelCategory`
- `normalizeChannelTags`

Also update learning channel list behavior:

- `listLearningChannelsUseCase` should merge taxonomy into summaries, or
- add `listLearningChannelsWithTaxonomyUseCase`.

Prefer updating the existing list result so frontend can consume one endpoint.

### API

Add taxonomy routes:

```http
GET    /api/learning-channel-taxonomy
PUT    /api/learning-channel-taxonomy/:channelId
DELETE /api/learning-channel-taxonomy/:channelId
```

PUT body:

```json
{
  "category": "street interview",
  "tags": ["American", " conversation ", "american"],
  "note": "Good street interviews."
}
```

Response:

```json
{
  "item": {
    "channelId": "...",
    "category": "street-interview",
    "tags": ["american", "conversation"],
    "note": "Good street interviews.",
    "updatedAt": "..."
  }
}
```

Also update:

```http
GET /api/learning-channels
```

to include:

```json
{
  "channelId": "...",
  "title": "...",
  "category": "news",
  "tags": ["british", "daily-news"],
  "taxonomyNote": ""
}
```

### Web

Update shared client types:

- `LearningChannelSummary.category?: string`
- `LearningChannelSummary.tags: string[]`
- `LearningChannelSummary.taxonomyNote?: string`

Add API client helpers:

- `listChannelTaxonomy`
- `updateChannelTaxonomy`
- `deleteChannelTaxonomy`

## Channel URL Library UI

Where to edit:

- channel card or channel detail header,
- preferably detail/header first to avoid crowded cards.

UI controls:

- category select/input,
- tags chip/input,
- note textarea or compact text input,
- save button,
- clear taxonomy button.

Card display:

```text
Category: News
Tags: british, daily-news, beginner
```

If no taxonomy:

```text
Uncategorized
```

Do not make category/tag editing look like subtitle sync. It is channel library metadata.

## English Search Channel Selector

Add filter controls above channel checkbox list:

```text
Category [All categories v]
Tag      [All tags v]
```

Visible channels are filtered by:

- indexed channels only,
- selected category if any,
- selected tag if any.

Bulk actions:

- `Select all indexed`
- `Clear all`
- `Select visible`
- `Clear visible`

Rules:

- `Select visible` adds all currently visible channels to selected set.
- `Clear visible` removes only currently visible channels from selected set.
- Hidden selected channels remain selected unless user uses `Clear all`.
- Search API remains channelIds-based. Do not add category/tag search params yet.

Summary text should be clear:

```text
3 visible · 12 selected
```

If filters hide all channels:

```text
No indexed channels match this category/tag.
```

## Saved Examples Optional Integration

Optional for this stage:

- show category/tags beside saved examples if available,
- filter saved examples by channel category/tag.

Do not block Stage 15 on this. The required workflow is Channel URL Library + English Search selector.

## Channel Deletion Integration

When deleting a learning channel:

```text
DELETE /api/learning-channels/:channelId
```

must also remove that channel's taxonomy item.

This cleanup must not remove:

- taxonomy items for other channels,
- source assets,
- saved examples,
- global translation data.

## Target Files

Likely files:

- `packages/domain/src/index.ts`
- `packages/domain/src/storage.ts`
- `packages/storage/src/index.ts`
- `packages/application/src/channelTaxonomyUseCases.ts`
- `packages/application/src/listLearningChannelsUseCase.ts`
- `packages/application/src/deleteLearningChannelUseCase.ts`
- `packages/application/src/index.ts`
- `apps/api/src/routes/learningChannelTaxonomy.ts`
- `apps/api/src/routes/learningChannels.ts`
- `apps/api/src/server.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/LearningChannelLibrary.tsx`
- `apps/web/src/components/LearningChannelVideoTable.tsx`
- `apps/web/src/components/EnglishSentenceSearch.tsx`
- `scripts/ops/verify-stage15-channel-categories-and-tags.ts`
- `docs/plans/reports/2026-05-05-channel-categories-and-tags-report.md`

If UI needs extraction, use responsibility names:

- `ChannelTaxonomyEditor.tsx`
- `ChannelTaxonomyBadges.tsx`
- `EnglishChannelSelectorFilters.tsx`

Avoid vague `utils.ts`.

## Verification Strategy

Create:

```text
scripts/ops/verify-stage15-channel-categories-and-tags.ts
```

Use a temporary `DATA_DIR`.

The script must prove:

- missing taxonomy file reads as empty,
- updating taxonomy writes `data/channels/channel-taxonomy.json`,
- category normalization works,
- tag normalization trims/lowercases/dedupes,
- list taxonomy returns persisted items,
- `GET /api/learning-channels` equivalent use case includes category/tags,
- deleting a channel removes only that channel's taxonomy item,
- deleting taxonomy does not delete channel/source/index assets,
- English Search selector filtering logic is covered by a pure helper or deterministic test if extracted.

If API smoke is feasible, include:

```bash
GET /api/learning-channel-taxonomy
PUT /api/learning-channel-taxonomy/:channelId
DELETE /api/learning-channel-taxonomy/:channelId
GET /api/learning-channels
```

## Acceptance Criteria

- User can assign category and tags to a channel.
- Category/tags are persisted locally.
- Category/tags survive API restart.
- Channel list displays taxonomy metadata.
- `GET /api/learning-channels` includes taxonomy fields.
- English Search channel selector can filter by category.
- English Search channel selector can filter by tag.
- `Select visible` and `Clear visible` behave correctly.
- Deleting a channel removes its taxonomy item.
- Deleting a taxonomy item does not delete the channel.
- Subtitle sync, sentence index, saved examples, and global machine translation remain unaffected.
- `npm run typecheck` passes.
- `npm run build` passes.
- Stage 15 verification script passes.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage15-channel-categories-and-tags.ts
npm run typecheck
npm run build
```

If public exports change:

```bash
npm run build -w @yanghoo/application
```

If dev server smoke is included:

```bash
curl -sS http://127.0.0.1:8001/api/learning-channel-taxonomy
curl -sS http://127.0.0.1:8001/api/learning-channels
```

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-05-channel-categories-and-tags-report.md
```

Report must include:

- changed files,
- taxonomy file path and sample JSON,
- API request/response shapes,
- Channel URL Library taxonomy editing behavior,
- English Search selector filtering behavior,
- delete-channel taxonomy cleanup behavior,
- verification commands and results,
- skipped checks and reasons,
- residual risks.

## Audit Checklist

Codex should reject the report if:

- taxonomy is only in browser localStorage,
- API routes directly import `fs`,
- category/tags are not normalized,
- `GET /api/learning-channels` does not expose taxonomy,
- English Search cannot bulk select by visible category/tag filter,
- deleting a channel leaves stale taxonomy,
- deleting taxonomy deletes channel/source assets,
- subtitle sync/index/search behavior is changed unnecessarily,
- global machine translation is removed or changed,
- verification only checks mocks while claiming real persistence.
