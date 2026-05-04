# Stage 5 Plan: Youglish-like English Search Learning Surface

Date: 2026-05-04
Owner: Codex
Executor: Gemini
Status: Ready for implementation

## Context

The backend pipeline is now proven through Stage 4.5:

```text
Vanessa channel URL
-> channel manifest
-> bounded English caption sync
-> English sentence index
-> timestamped search results
```

Accepted real-data evidence:

- `docs/plans/reports/2026-05-04-codex-accept-vanessa-real-channel-closed-loop.md`
- channel: `youtube-UCxJGMJbjokfnr2-s4_RXPxQ`
- indexed sources: 20
- indexed English sentences: 3246

Stage 5 should expose this local index through a learner-first web surface. This is a search and reading experience, not a new acquisition workflow.

Reference guidance used:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `docs/GOTCHAS.md`

## Goal

Build the first usable Youglish-like English search surface over the accepted sentence index.

Primary user flow:

```text
open web app
-> search English word or phrase
-> see real Vanessa sentence examples
-> open YouTube timestamp
-> inspect surrounding metadata and repeat searches
```

The first screen should be the actual search workbench, not a landing page.

## Non-goals

- Do not fetch YouTube metadata.
- Do not sync captions.
- Do not build or rebuild the index from the web UI.
- Do not download video, audio, or media.
- Do not run MLX Audio transcription.
- Do not generate Chinese captions or translations.
- Do not remove or weaken the existing single-video machine translation feature.
- Do not implement chat/discussion yet.
- Do not add autoplaying embedded YouTube players in this stage.
- Do not introduce a new search engine.

## Product Scope

Minimum UI:

- Channel selector or fixed default channel for Vanessa.
- Search input.
- Query examples for quick search:
  - `would have`
  - `because`
  - `kind of`
  - `I mean`
  - `pronunciation`
- Result count and loading/error states.
- Result list with:
  - sentence text,
  - video title,
  - timestamp,
  - YouTube timestamp link,
  - caption kind/language where available.
- Empty state for no hits.
- API failure state.

Optional if low risk:

- Previous/next sentence context if it can be read from the same index without scanning source transcripts.
- Copy timestamp URL button.
- Result limit selector.

## API Design

Add a focused API route separate from the existing document search route.

Suggested route:

```http
GET /api/english-sentences/search?channelId=youtube-UCxJGMJbjokfnr2-s4_RXPxQ&q=would%20have&limit=20
```

Response shape:

```json
{
  "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
  "query": "would have",
  "limit": 20,
  "results": [
    {
      "sourceId": "yt-EsVaXsNNASc",
      "videoId": "EsVaXsNNASc",
      "title": "Video title",
      "channelTitle": "Speak English With Vanessa",
      "start": 697.6,
      "end": 704.1,
      "text": "It would have to be that kind of situation...",
      "captionKind": "auto",
      "captionLanguage": "en",
      "youtubeTimestampUrl": "https://www.youtube.com/watch?v=EsVaXsNNASc&t=697s"
    }
  ]
}
```

Validation:

- `channelId` is required.
- `q` is required and must not be blank.
- `limit` default: 20.
- `limit` max: 50.
- language is fixed to `en` for this stage.

Layer rule:

- API route validates request and calls `searchEnglishSentenceIndexUseCase`.
- API route must not read JSONL files directly.

## Web Design

This is a utilitarian learning tool, not a marketing page.

Use a quiet workbench layout:

- top area: compact title, channel identity, search input,
- left or top filter area: query examples and result limit,
- main area: dense, readable result list,
- each result: sentence first, metadata second, timestamp action visible.

Avoid:

- hero marketing blocks,
- decorative cards inside cards,
- oversized typography,
- one-note purple/blue gradient styling,
- explanatory in-app text about implementation details,
- controls that imply caption sync or downloading.

Existing UI patterns:

- Follow `apps/web/src/App.tsx`, `GlobalSearch.tsx`, `TaskCard.tsx`, and `styles.css`.
- Use lucide icons where helpful.
- Keep cards to individual repeated result items only.
- Ensure text does not overflow on mobile.

Suggested files:

```text
apps/api/src/routes/englishSentenceSearch.ts
apps/web/src/components/EnglishSentenceSearch.tsx
```

Update existing app wiring:

```text
apps/api/src/server.ts
apps/web/src/api/client.ts
apps/web/src/App.tsx
apps/web/src/types.ts
```

## Acceptance Criteria

- API route returns timestamped results for `would have` on the Vanessa channel.
- API route rejects blank query.
- API route rejects missing channel id.
- API route caps `limit` at 50 or rejects values above 50.
- API route delegates to `searchEnglishSentenceIndexUseCase`.
- Web app exposes an English sentence search workbench.
- Search for `would have` shows real results from the Vanessa index.
- Search for `pronunciation` shows real results from the Vanessa index.
- Result rows include sentence text, video title, timestamp, and YouTube timestamp link.
- No UI action triggers channel capture, caption sync, audio/media download, transcription, or translation.
- Existing task list/reader workflows still render.
- Mobile layout is usable at 390px width.
- Desktop layout is usable at 1440px width.
- `npm run typecheck` passes.
- `npm run build` passes.

## Verification Commands

Gemini must run:

```bash
npm run typecheck
npm run build
```

Gemini should also run API smoke checks against the local API route. If a dev server is used, include the exact startup command and curl commands.

Recommended:

```bash
curl -sS "http://127.0.0.1:8001/api/english-sentences/search?channelId=youtube-UCxJGMJbjokfnr2-s4_RXPxQ&q=would%20have&limit=2"
curl -sS "http://127.0.0.1:8001/api/english-sentences/search?channelId=youtube-UCxJGMJbjokfnr2-s4_RXPxQ&q=pronunciation&limit=2"
```

For frontend verification, include either:

- screenshots at desktop and mobile widths, or
- a Playwright/browser smoke test that asserts the result text and timestamp links render.

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-04-youglish-like-english-search-surface-report.md
```

The report must include:

- changed files,
- API route path and examples,
- UI behavior summary,
- exact verification commands,
- key API output snippets,
- frontend verification evidence,
- skipped checks and reasons,
- unresolved risks.

## Codex Audit Checklist

Codex should reject the report if:

- API route reads index files directly instead of delegating to application,
- blank query or missing channel id is accepted,
- web UI introduces acquisition/download/transcription/translation controls,
- the page is a landing page rather than a working search surface,
- search results are mocked,
- results lack timestamp URLs,
- mobile layout clips or overlaps text,
- build/typecheck are skipped without a concrete blocker,
- existing machine translation behavior is removed or disabled globally.
