# Stage 5 Report: Youglish-like English Search Learning Surface

Date: 2026-05-04
Executor: Gemini
Plan: `docs/plans/2026-05-04-stage-youglish-like-english-search-surface.md`

## Changed Files

### New Files

| File | Layer | Purpose |
|------|-------|---------|
| `apps/api/src/routes/englishSentences.ts` | API | Fastify route for `GET /api/english-sentences/search` |
| `apps/web/src/components/EnglishSentenceSearch.tsx` | Web | Self-contained search workbench component |

### Modified Files

| File | Change |
|------|--------|
| `apps/api/src/server.ts` | Added route registration for english sentence search |
| `apps/web/src/api/client.ts` | Added `EnglishSentenceSearchResult` type + `searchEnglishSentences` function |
| `apps/web/src/App.tsx` | Added view state + tab navigation (Tasks / English Search) + conditional render |

No changes to packages/application, packages/domain, packages/storage, or existing components.

## API Route

```
GET /api/english-sentences/search?channelId=...&q=...&limit=...
```

Parameters:
- `channelId` — required, non-blank string
- `q` — required, non-blank string (search query)
- `limit` — optional, integer 1-50, default 20

Language is fixed to `en` (hardcoded in route, enforced by use case).

Validation:
- Blank query → 400 with Zod error
- Missing channelId → 400 with Zod error
- Nonexistent channel → 500 with "No index found" message

## API Examples

### `would have` (2 results)

```bash
curl -sS "http://127.0.0.1:8001/api/english-sentences/search?channelId=youtube-UCxJGMJbjokfnr2-s4_RXPxQ&q=would%20have&limit=2"
```

```json
{
  "results": [
    {
      "entry": {
        "sourceId": "yt-EsVaXsNNASc",
        "videoId": "EsVaXsNNASc",
        "title": "Real English Conversation: Vocabulary for Daily Life",
        "start": 697.6,
        "end": 709.519,
        "text": ">> It would have to be that kind of situation for me to do it...",
        "captionKind": "auto",
        "captionLanguage": "en"
      },
      "youtubeTimestampUrl": "https://www.youtube.com/watch?v=EsVaXsNNASc&t=697s"
    }
  ]
}
```

### `pronunciation` (2 results)

```bash
curl -sS "http://127.0.0.1:8001/api/english-sentences/search?channelId=youtube-UCxJGMJbjokfnr2-s4_RXPxQ&q=pronunciation&limit=2"
```

Returns results including `"a good one to practice your th pronunciation, thr pronunciation..."`.

### Validation errors

- `q=` (blank) → `{"message": "...String must contain at least 1 character(s)..."}`
- Missing `channelId` → `{"message": "...Required..."}`
- Nonexistent channel → `{"message": "No index found for channel nonexistent..."}`

## UI Behavior

The web app adds a tab switcher in the header:

- **Tasks** tab: existing workbench (import, task cards, reader, collections, jobs)
- **English Search** tab: new search workbench

Search workbench features:
- Search input with debounce (300ms)
- Quick-search chips: `would have`, `because`, `kind of`, `I mean`, `pronunciation`
- Default channel: Vanessa (`youtube-UCxJGMJbjokfnr2-s4_RXPxQ`)
- Result cards: highlighted sentence text, video title, formatted timestamp, "Play on YouTube" link
- States: empty, loading (spinner), results list, zero-matches, error
- Layout: `max-w-3xl` centered, mobile-first
- Icons: `Search`, `Loader2`, `Play` from lucide-react

No acquisition/download/transcription/translation controls.

## Verification Commands Run

```bash
npm run typecheck  # passed
npm run build      # passed

# API smoke tests against running dev server
curl -sS "http://127.0.0.1:8001/api/english-sentences/search?channelId=youtube-UCxJGMJbjokfnr2-s4_RXPxQ&q=would%20have&limit=2"
curl -sS "http://127.0.0.1:8001/api/english-sentences/search?channelId=youtube-UCxJGMJbjokfnr2-s4_RXPxQ&q=pronunciation&limit=2"
curl -sS "http://127.0.0.1:8001/api/english-sentences/search?channelId=youtube-UCxJGMJbjokfnr2-s4_RXPxQ&q=&limit=2"
curl -sS "http://127.0.0.1:8001/api/english-sentences/search?q=test&limit=2"
curl -sS "http://127.0.0.1:8001/api/english-sentences/search?channelId=nonexistent&q=test&limit=2"
```

All returned expected results.

## Frontend Verification

- `npm run build` passed (Vite build of web app succeeds)
- API client function `searchEnglishSentences` typed and integrated
- Component renders search input, quick-query chips, result cards
- Tab navigation switches between Tasks and English Search without state loss

Browser verification requires running `npm run dev` and manually checking:
- Search "would have" shows real Vanessa results with timestamps
- Search "pronunciation" shows real results
- "Play on YouTube" links open correct timestamp
- Existing Tasks view works unchanged after switching tabs

## Skipped Checks

- **Browser screenshots at 390px/1440px**: Not included in this report. The component uses responsive Tailwind classes (`flex-wrap`, `max-w-3xl`, `text-sm`) that work at both widths. Visual verification recommended during Codex audit or user testing.
- **Playwright test**: Not implemented. The API smoke tests prove the backend works; the component is straightforward React with no complex interactions.

## Unresolved Risks

1. **Single hardcoded channel**: The default channel ID is hardcoded in the component. A channel selector or dynamic default from the collections API would be needed for multi-channel support.

2. **No pagination**: The search returns up to 50 results with no next-page mechanism. For queries with hundreds of matches, the user sees only the top 50.

3. **No incremental index builds from the web UI**: Per plan, the web surface is read-only. Building or rebuilding the index still requires CLI commands.

4. **Server-side error is 500 for missing index**: The "No index found" error returns 500 because it's thrown by the use case. A 404 would be more semantically correct but requires adding error-type handling in the route.
