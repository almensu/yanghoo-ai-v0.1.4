# Stage 14 Report: Saved English Examples Review Queue

Date: 2026-05-05
Executor: Claude (Gemini mode)
Status: Complete

## Changed Files

### Domain
- `packages/domain/src/index.ts` — Added `SavedEnglishExample`, `SavedEnglishExamplesFile`, `SavedEnglishExampleStatus` types
- `packages/domain/src/storage.ts` — Added `getLearningDir()`, `getSavedEnglishExamplesPath()`

### Storage
- `packages/storage/src/index.ts` — Added `SavedEnglishExampleStorage` interface, `FileSavedEnglishExampleStorage` implementation, `savedEnglishExampleStorage` singleton

### Application
- `packages/application/src/savedEnglishExamplesUseCases.ts` — **NEW**: `saveEnglishExampleUseCase`, `listSavedEnglishExamplesUseCase`, `updateSavedEnglishExampleUseCase`, `deleteSavedEnglishExampleUseCase`, `markSavedEnglishExampleReviewedUseCase`, `listSavedEnglishExampleIdsUseCase`
- `packages/application/src/index.ts` — Added export

### API
- `apps/api/src/routes/englishSavedExamples.ts` — **NEW**: CRUD routes for `/api/english-saved-examples`
- `apps/api/src/server.ts` — Registered new routes

### Web
- `apps/web/src/api/client.ts` — Added `SavedEnglishExample` type, `listSavedExamples`, `listSavedExampleIds`, `saveEnglishExample`, `deleteSavedExample`, `updateSavedExample`, `markSavedExampleReviewed`
- `apps/web/src/components/EnglishSentenceSearch.tsx` — Save/Unsave toggle on result cards and player panel, loads saved IDs on mount
- `apps/web/src/components/SavedEnglishExamples.tsx` — **NEW**: Full Saved Examples page with embedded playback, note/tags editing, status, mark reviewed, remove
- `apps/web/src/App.tsx` — Added "Saved" nav tab

## Persisted File

```text
data/learning/english-saved-examples.json
```

Example shape:
```json
{
  "version": 1,
  "updatedAt": "2026-05-05T12:00:00.000Z",
  "items": [{
    "id": "a1b2c3d4e5f6g7h8i9j0",
    "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
    "channelTitle": "Speak English With Vanessa",
    "sourceId": "yt-abc123",
    "videoId": "abc123",
    "videoTitle": "How to use WOULD HAVE",
    "start": 123.4,
    "end": 128.9,
    "text": "I would have done the same thing.",
    "normalizedText": "i would have done the same thing.",
    "captionKind": "manual",
    "captionLanguage": "en",
    "youtubeTimestampUrl": "https://www.youtube.com/watch?v=abc123&t=123s",
    "youtubeEmbedUrl": "https://www.youtube.com/embed/abc123?start=121&autoplay=1&rel=0",
    "startSeconds": 121,
    "query": "would have",
    "note": "",
    "tags": [],
    "status": "saved",
    "savedAt": "2026-05-05T12:00:00.000Z",
    "updatedAt": "2026-05-05T12:00:00.000Z",
    "lastReviewedAt": null,
    "reviewCount": 0
  }]
}
```

Stable id: `sha1(channelId|sourceId|videoId|start|end|normalizedText)` truncated to 20 chars.

## API Request/Response Shapes

```http
GET    /api/english-saved-examples          → { items: SavedEnglishExample[] }
GET    /api/english-saved-examples/ids      → { ids: string[] }
POST   /api/english-saved-examples          → { item, created }
PATCH  /api/english-saved-examples/:id      → { item }
DELETE /api/english-saved-examples/:id      → { deleted: true }
POST   /api/english-saved-examples/:id/review → { item }
```

GET supports optional filters: `q`, `channelId`, `tag`, `status`.

## English Search Save/Unsave Behavior

- Result card shows `Save` / `Saved` bookmark button
- Player panel shows `Save sentence` / `Saved`
- Saved IDs loaded on mount via `/ids` endpoint
- Toggle save: POST to create, DELETE to remove
- No confirmation needed on toggle (Saved Examples page uses confirm for remove)
- Duplicate save returns same id without error

## Saved Examples Page Behavior

- Lists all saved examples with text, channel, time, status, tags
- Search filter for text content
- Click to select → embedded YouTube player panel
- Actions: Play here, Mark reviewed, Copy sentence, YouTube link, Remove
- Inline note textarea editing
- Inline comma-separated tags input (normalized: trim, lowercase, dedupe)
- Status toggle: saved / learning / mastered
- Remove with `window.confirm()`

## Verification Results

```bash
npx tsx scripts/ops/verify-stage14-saved-english-examples-review-queue.ts
```

```
Results: 36 passed, 0 failed
```

```bash
npm run typecheck  # passed
npm run build      # passed
```

## Skipped Checks

- No live API smoke test (requires running dev server)
- No browser UI test — manual verification recommended

## Residual Risks

- Saved examples file is a single JSON — no locking for concurrent writes
- No export to Anki yet (explicitly non-goal for this stage)
- No spaced repetition scheduling — just manual mark reviewed
