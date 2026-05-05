# Stage 15 Report: Channel Categories and Tags

Date: 2026-05-05
Executor: Claude (Gemini mode)
Status: Complete

## Changed Files

### Domain
- `packages/domain/src/index.ts` — Added `ChannelTaxonomyItem`, `ChannelTaxonomyFile` types
- `packages/domain/src/storage.ts` — Added `getChannelTaxonomyPath()`
- `packages/domain/src/channelVideoSelection.ts` — Added `category`, `tags`, `taxonomyNote` to `LearningChannelSummary`

### Storage
- `packages/storage/src/index.ts` — Added `ChannelTaxonomyStorage` interface, `FileChannelTaxonomyStorage` implementation, `channelTaxonomyStorage` singleton

### Application
- `packages/application/src/channelTaxonomyUseCases.ts` — **NEW**: `normalizeChannelCategory`, `normalizeChannelTags`, `listChannelTaxonomyUseCase`, `updateChannelTaxonomyUseCase`, `deleteChannelTaxonomyUseCase`
- `packages/application/src/listLearningChannelsUseCase.ts` — Merges taxonomy into channel summaries
- `packages/application/src/deleteLearningChannelUseCase.ts` — Cleans up taxonomy on channel delete
- `packages/application/src/index.ts` — Added export

### API
- `apps/api/src/routes/learningChannelTaxonomy.ts` — **NEW**: `GET /api/learning-channel-taxonomy`, `PUT /api/learning-channel-taxonomy/:channelId`, `DELETE /api/learning-channel-taxonomy/:channelId`
- `apps/api/src/server.ts` — Registered taxonomy routes

### Web
- `apps/web/src/api/client.ts` — Added `category`, `tags`, `taxonomyNote` to `LearningChannelSummary`; added `ChannelTaxonomyItem` type and `listChannelTaxonomy`, `updateChannelTaxonomy`, `deleteChannelTaxonomy` helpers
- `apps/web/src/components/LearningChannelVideoTable.tsx` — Taxonomy editor in URL Library band (category/tags/note inputs with save)
- `apps/web/src/components/EnglishSentenceSearch.tsx` — Category/tag dropdowns, Select visible / Clear visible, visible/selected counts

## Persisted File

```text
data/channels/channel-taxonomy.json
```

Sample:
```json
{
  "version": 1,
  "updatedAt": "2026-05-05T12:00:00.000Z",
  "items": [
    {
      "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
      "category": "english-teacher",
      "tags": ["american", "conversation"],
      "note": "Intermediate speaking practice",
      "updatedAt": "2026-05-05T12:00:00.000Z"
    }
  ]
}
```

## API Request/Response Shapes

```http
GET    /api/learning-channel-taxonomy              → { items: ChannelTaxonomyItem[] }
PUT    /api/learning-channel-taxonomy/:channelId    → { item: ChannelTaxonomyItem }
DELETE /api/learning-channel-taxonomy/:channelId    → { deleted: true } | 404
```

PUT body:
```json
{ "category": "Street Interview", "tags": ["American", " conversation "], "note": "Good content." }
```

`GET /api/learning-channels` now includes:
```json
{ "channelId": "...", "category": "street-interview", "tags": ["american", "conversation"], "taxonomyNote": "Good content." }
```

## Normalization Rules

Category: trim, lowercase, spaces→hyphens, collapse hyphens, strip leading/trailing hyphens, empty→undefined.

Tags: trim, lowercase, spaces→hyphens, remove empty, dedupe, sort.

## Channel URL Library Behavior

- URL Library band shows category, tags, note below channel title
- "Uncategorized" label when no category
- "Edit" link opens inline category/tags/note inputs
- "Save" persists via PUT API, "Cancel" closes editor

## English Search Channel Selector Behavior

- Category dropdown: All categories + unique categories from indexed channels
- Tag dropdown: All tags + unique tags from indexed channels
- Visible channels filtered by both category and tag
- "Select visible" adds visible channels to selected set
- "Clear visible" removes visible channels from selected set
- "Select all indexed" / "Clear all" work on all channels regardless of filter
- Shows "N visible · M selected" count
- Hidden selected channels remain selected unless cleared explicitly

## Channel Deletion Integration

- `deleteLearningChannelUseCase` now removes the deleted channel's taxonomy item
- Other channels' taxonomy items preserved
- Source and index assets unaffected by taxonomy cleanup

## Verification Results

```bash
npx tsx scripts/ops/verify-stage15-channel-categories-and-tags.ts
```

```
Results: 45 passed, 0 failed
```

```bash
npm run typecheck  # passed
npm run build      # passed
```

## Skipped Checks

- No live API smoke test (requires running dev server)
- No browser UI test — manual verification recommended

## Residual Risks

- Single taxonomy JSON file — no locking for concurrent writes
- No category/tag suggestions in this stage — could add preset dropdowns later
- No multi-level category hierarchy — flat categories only
