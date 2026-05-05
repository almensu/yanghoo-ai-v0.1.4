# Stage 13 Report: English Search Learning Workbench

Date: 2026-05-05
Executor: Codex
Status: Complete

## Summary

English Search has been upgraded from a plain result list into a learning workbench:

- bounded result pages with `Load more`,
- diversity modes to prevent one video from dominating,
- embedded YouTube playback in the same page,
- current result queue with highlighted active sentence,
- context lookup for nearby sentences,
- channel filters retained,
- quick phrase groups for common spoken chunks,
- conservative next-result preload via preconnect/prefetch.

No YouTube video/audio download behavior was added.

## Changed Files

- `packages/application/src/searchEnglishSentenceIndexUseCase.ts`
- `packages/application/src/getEnglishSentenceContextUseCase.ts`
- `packages/application/src/index.ts`
- `apps/api/src/routes/englishSentences.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/EnglishSentenceSearch.tsx`
- `scripts/ops/verify-stage13-english-search-learning-workbench.ts`

## API Shape

Search:

```http
GET /api/english-sentences/search?channelIds=ch1,ch2&q=would+have&limit=20&offset=0&diversity=balanced&sort=recent&captionKind=all
```

Response includes:

```json
{
  "results": [],
  "warnings": [],
  "page": {
    "limit": 20,
    "offset": 0,
    "returned": 20,
    "hasMore": true
  }
}
```

Each result now includes:

- `youtubeTimestampUrl`
- `youtubeEmbedUrl`
- `startSeconds`

Context:

```http
GET /api/english-sentences/context?channelId=...&sourceId=...&start=1806.96&window=1
```

Returns nearby rows with `isMatch`.

## UI Behavior

English Search now uses a workbench layout:

- left: search, quick phrase groups, result options, channel checkboxes,
- middle: bounded sentence queue and `Load more`,
- right: embedded YouTube player, active sentence actions, context panel.

Default behavior:

- all indexed channels selected,
- query defaults to `would have`,
- result limit defaults to `20`,
- diversity defaults to `Balanced`,
- first result is selected when results arrive,
- selecting a result updates the iframe in place.

## Preload Strategy

The implementation is conservative:

- only one visible iframe is rendered,
- next result embed URL is computed,
- YouTube domains are preconnected,
- the next embed URL is exposed as a browser prefetch hint.

No media files are downloaded or proxied.

## Verification

Commands run:

```bash
npm run build -w @yanghoo/application
npx tsx scripts/ops/verify-stage13-english-search-learning-workbench.ts
npm run typecheck
npm run build
npx tsx scripts/ops/verify-stage12-channel-delete-and-multi-channel-english-search.ts
```

Results:

- Stage 13 verification: `16 passed, 0 failed`
- Full typecheck: passed
- Full build: passed
- Stage 12 regression: `33 passed, 0 failed`

API/Vite smoke:

```text
GET http://127.0.0.1:8001/api/health -> 200
GET http://127.0.0.1:3000/api/health -> 200
GET /api/english-sentences/search -> 20 results, hasMore true, embed URL present
GET /api/english-sentences/context -> 3 context items, match marked, no warnings
```

## Dev Server

Started with tmux:

```text
yanghoo-api -> http://127.0.0.1:8001
yanghoo-web -> http://127.0.0.1:3000
```

The web app is available at:

```text
http://localhost:3000
```

## Residual Risks

- YouTube embed availability depends on the video's embed policy.
- Context lookup currently uses the sentence index entries, not raw caption files.
- Saved examples / spaced repetition are intentionally deferred.
- Browser visual QA was not performed with an in-app screenshot in this pass.
