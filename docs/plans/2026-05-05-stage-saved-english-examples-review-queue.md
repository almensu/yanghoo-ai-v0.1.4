# Stage 14 Plan: Saved English Examples Review Queue

Date: 2026-05-05
Owner: Codex
Executor: Gemini
Status: Ready

## Context

Stage 13 turned English Search into a learning workbench with bounded results, filters, embedded YouTube playback, and nearby sentence context. The next learning gap is persistence: when the user finds a sentence they like, they need to save it and return later for review.

This stage adds a local saved-example queue:

```text
English Search result
-> Save sentence
-> persisted local saved example
-> Saved Examples page
-> replay / review / note / remove
```

The saved object is a specific sentence instance, not just a query or video:

```text
channelId + sourceId + videoId + start + end + text
```

## Goals

- Add one-click save/unsave from English Search result cards and active player panel.
- Persist saved English examples under the canonical `data/` root.
- Add a Saved Examples surface for replaying, reviewing, filtering, editing notes/tags, and removing saved sentences.
- Preserve the embedded playback workflow from Stage 13.
- Avoid duplicate saves for the same sentence.
- Keep this local-first and deterministic.

## Non-Goals

- Do not add login/account sync.
- Do not add cloud persistence.
- Do not implement full spaced repetition scheduling in this stage.
- Do not generate automatic Chinese explanations.
- Do not export to Anki yet.
- Do not download YouTube video/audio or create media clips.
- Do not remove or change the global machine translation feature.
- Do not make Channel English Search depend on Chinese subtitles.

## Product Rules

- Save acts on a sentence instance.
- Saving must be idempotent: saving the same sentence twice returns the same saved item.
- Removing a saved item must not delete source/channel/subtitle/index assets.
- Saved examples must survive API restart.
- Saved examples should be usable even if the original search query is forgotten.
- Playback remains embedded first, external YouTube link second.

## Data Model

Persist under the canonical data root:

```text
data/learning/english-saved-examples.json
```

Shape:

```json
{
  "version": 1,
  "updatedAt": "2026-05-05T00:00:00.000Z",
  "items": [
    {
      "id": "stable-id",
      "channelId": "youtube-...",
      "channelTitle": "...",
      "sourceId": "yt-...",
      "videoId": "...",
      "videoTitle": "...",
      "publishedAt": "...",
      "start": 123.4,
      "end": 128.9,
      "text": "I would have done the same thing.",
      "normalizedText": "i would have done the same thing.",
      "captionKind": "auto",
      "captionLanguage": "en",
      "youtubeTimestampUrl": "...",
      "youtubeEmbedUrl": "...",
      "startSeconds": 121,
      "query": "would have",
      "note": "",
      "tags": [],
      "status": "saved",
      "savedAt": "...",
      "updatedAt": "...",
      "lastReviewedAt": null,
      "reviewCount": 0
    }
  ]
}
```

Stable id rule:

```text
sha1(channelId|sourceId|videoId|start|end|normalizedText)
```

Use a Node crypto hash in application/storage, not a frontend-generated id.

## Layer Placement

### Domain

Add stable types:

- `SavedEnglishExample`
- `SavedEnglishExamplesFile`
- `SavedEnglishExampleStatus`

Status can start small:

```ts
type SavedEnglishExampleStatus = 'saved' | 'learning' | 'mastered';
```

Default status:

```text
saved
```

### Storage

Add a narrow storage boundary for saved examples.

Expected interface:

```ts
interface SavedEnglishExampleStorage {
  readSavedEnglishExamples(): Promise<SavedEnglishExamplesFile>;
  writeSavedEnglishExamples(file: SavedEnglishExamplesFile): Promise<void>;
}
```

Implementation writes atomically enough for local use:

- ensure `data/learning/`,
- write JSON with indentation,
- preserve unknown file absence as empty list.

Do not let API routes directly import `fs`.

### Application

Add use cases:

- `saveEnglishExampleUseCase`
- `listSavedEnglishExamplesUseCase`
- `updateSavedEnglishExampleUseCase`
- `deleteSavedEnglishExampleUseCase`
- `markSavedEnglishExampleReviewedUseCase`

Responsibilities:

- generate stable id,
- dedupe saved items,
- normalize tags,
- update note/status,
- increment review count,
- preserve existing saved metadata on duplicate save,
- return useful result objects.

### API

Add routes:

```http
GET    /api/english-saved-examples
POST   /api/english-saved-examples
PATCH  /api/english-saved-examples/:id
DELETE /api/english-saved-examples/:id
POST   /api/english-saved-examples/:id/review
```

POST request shape:

```json
{
  "result": {
    "entry": { "...": "EnglishSentenceSearchResult.entry" },
    "youtubeTimestampUrl": "...",
    "youtubeEmbedUrl": "...",
    "startSeconds": 121
  },
  "query": "would have"
}
```

PATCH request shape:

```json
{
  "note": "Useful counterfactual pattern.",
  "tags": ["would-have", "speaking"],
  "status": "learning"
}
```

GET supports optional query filters if cheap:

```text
q
channelId
tag
status
```

First implementation can filter in application after reading the JSON file.

### Web

Update English Search:

- result card has `Save` / `Saved`,
- active player panel has `Save sentence` / `Saved`,
- saved state loads once when English Search mounts,
- after save/delete, update local saved id set,
- duplicate save should not create duplicate UI state.

Add a Saved Examples page/tab in `App.tsx`.

Saved Examples page should include:

- list of saved examples,
- search within saved examples,
- channel filter if data allows,
- tag/status filter if simple,
- embedded player for selected saved example,
- context-like active sentence display,
- actions:
  - Play here,
  - Copy sentence,
  - Copy timestamp URL,
  - Mark reviewed,
  - Edit note,
  - Edit tags,
  - Remove.

Do not overbuild SRS UI. The first learning loop is:

```text
save -> replay -> mark reviewed -> repeat later
```

## UX Details

### English Search Buttons

Result card:

```text
Play here | Save | Sentence | Link
```

Active player:

```text
Previous | Next | Save sentence | Copy sentence | YouTube
```

Saved state:

```text
Saved
```

If clicked again, acceptable options:

1. `Saved` opens a small remove action, or
2. `Saved` toggles remove with confirmation, or
3. separate `Remove` only in Saved Examples.

Preferred first implementation:

- Search page button toggles save/unsave without confirmation.
- Saved Examples page remove uses confirmation.

### Saved Examples Layout

Desktop:

```text
filters/search    saved sentence list    player/review panel
```

Mobile:

```text
search/filter
player/review panel
saved sentence list
```

Use the same embedded playback style as Stage 13.

### Notes and Tags

First implementation can use simple inputs:

- note textarea,
- comma-separated tags input.

Normalize tags:

- trim,
- lowercase,
- remove empty,
- dedupe.

## Target Files

Likely files:

- `packages/domain/src/index.ts`
- `packages/application/src/saveEnglishExampleUseCase.ts`
- `packages/application/src/listSavedEnglishExamplesUseCase.ts`
- `packages/application/src/updateSavedEnglishExampleUseCase.ts`
- `packages/application/src/deleteSavedEnglishExampleUseCase.ts`
- `packages/application/src/markSavedEnglishExampleReviewedUseCase.ts`
- `packages/application/src/index.ts`
- `packages/storage/src/index.ts`
- `apps/api/src/routes/englishSavedExamples.ts`
- `apps/api/src/server.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/EnglishSentenceSearch.tsx`
- `apps/web/src/components/SavedEnglishExamples.tsx`
- `apps/web/src/App.tsx`
- `scripts/ops/verify-stage14-saved-english-examples-review-queue.ts`
- `docs/plans/reports/2026-05-05-saved-english-examples-review-queue-report.md`

If several use cases are tiny, Gemini may combine them into one responsibility-named file:

```text
packages/application/src/savedEnglishExamplesUseCases.ts
```

Do not create vague `service.ts`, `manager.ts`, or `utils.ts`.

## Verification Strategy

Create:

```text
scripts/ops/verify-stage14-saved-english-examples-review-queue.ts
```

Use a temporary `DATA_DIR`.

The script must prove:

- saving a search result writes `data/learning/english-saved-examples.json`,
- duplicate save returns same id and does not duplicate item,
- listing returns persisted items after storage re-read,
- updating note/tags/status persists,
- tags are normalized and deduped,
- mark reviewed increments `reviewCount` and sets `lastReviewedAt`,
- deleting removes only the saved example,
- deleting does not delete source/channel/index assets,
- API shape can be exercised through use cases or route smoke if practical,
- saved item includes timestamp URL and embed URL.

Add UI-facing smoke if feasible:

- English Search can load saved ids,
- Save button changes to Saved,
- Saved Examples page lists saved item.

## Acceptance Criteria

- User can save a sentence from English Search.
- User can see saved state in English Search.
- Saving the same sentence twice does not duplicate.
- Saved examples are persisted under `data/learning/`.
- User can open Saved Examples tab/page.
- Saved Examples can replay an example in embedded YouTube player.
- User can copy sentence and timestamp URL from Saved Examples.
- User can edit note and tags.
- User can mark reviewed.
- User can remove a saved example.
- API restart does not lose saved examples.
- No video/audio download is introduced.
- Existing machine translation workflow remains untouched.
- `npm run typecheck` passes.
- `npm run build` passes.
- Stage 14 verification script passes.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage14-saved-english-examples-review-queue.ts
npm run typecheck
npm run build
```

If public exports change:

```bash
npm run build -w @yanghoo/application
```

If API smoke is included:

```bash
curl -sS http://127.0.0.1:8001/api/english-saved-examples
```

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-05-saved-english-examples-review-queue-report.md
```

Report must include:

- changed files,
- persisted file path and example JSON,
- API request/response shapes,
- English Search save/unsave behavior,
- Saved Examples page behavior,
- verification commands and results,
- skipped checks and reasons,
- residual risks.

## Audit Checklist

Codex should reject the report if:

- saved examples are only in browser localStorage,
- duplicate saves create duplicate items,
- API route writes JSON directly with `fs`,
- deleting a saved example deletes source/channel/caption/index assets,
- save action triggers video/audio download,
- saved examples do not survive API restart,
- timestamp/embed URLs are missing,
- global machine translation is removed or changed,
- UI claims are not backed by verification or smoke evidence.
