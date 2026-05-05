# Stage 13 Plan: English Search Learning Workbench

Date: 2026-05-05
Owner: Codex
Executor: Gemini
Status: Ready

## Context

English Search has reached the point where it can search indexed English subtitle sentences across multiple learning channels. The next improvement should make it useful for actual English learning, not only for raw search.

The current surface still behaves mostly like a result list:

```text
query -> many matching sentences -> external YouTube timestamp link
```

For a YouGlish-like learning workflow, the better shape is:

```text
query + filters
-> curated result queue
-> embedded timestamp playback in the same page
-> sentence/context/shadowing controls
-> preload next playable result
-> optional collect/review later
```

This stage upgrades English Search into a learning workbench while preserving the transcript-first architecture and the existing Channel URL Library flow.

Reference guidance used:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/architecture.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `docs/GOTCHAS.md`

The reference principles applied here are:

- UI remains an entry/display layer.
- Search ranking, pagination, and context assembly belong in application/domain-shaped contracts, not hidden in React state.
- External playback and caching behavior must be explicit and testable.
- Verification should use the narrowest deterministic tests before browser smoke.

## Goals

Build an English Search learning workbench with:

- default bounded results, not unbounded rendering,
- explicit filters and sort modes,
- embedded YouTube playback in the same page,
- active result queue and keyboard-friendly navigation,
- next-result preload/prefetch strategy,
- context expansion around a sentence,
- result diversity controls so one video does not dominate,
- clear channel filtering,
- learning-oriented actions such as copy sentence, shadowing loop, and save-for-review placeholders.

## Non-Goals

- Do not download YouTube video or audio in Channels.
- Do not add video/audio media acquisition to English Search.
- Do not remove the global single-source machine translation feature.
- Do not implement full spaced repetition in this stage.
- Do not introduce a database.
- Do not require login to YouTube or third-party accounts.
- Do not bypass YouTube embed restrictions.
- Do not make Chinese subtitles part of Channel English Search. This remains English-learning focused.

## Product Principles

### Learning First

English Search should optimize for learning usefulness:

- see a small number of strong examples,
- hear the sentence immediately,
- inspect nearby context,
- repeat and shadow,
- move through examples quickly,
- compare across channels/speakers.

It should not optimize for dumping every match onto the screen.

### One-Page Workflow

Search, filters, result list, selected sentence, and video playback should stay on one page.

Expected layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ query + quick phrases + result count                         │
├───────────────┬───────────────────────────────┬─────────────┤
│ filters       │ result queue                  │ video panel │
│ channels      │ sentence cards                │ embedded    │
│ sort/diverse  │ active item highlighted       │ YouTube     │
│ result limit  │ load more                     │ context     │
└───────────────┴───────────────────────────────┴─────────────┘
```

On smaller screens:

```text
query
filters as collapsible drawer
video panel
active sentence
result queue
```

### Embedded Playback

Opening a result should not jump out to YouTube by default.

Primary action:

```text
Play here
```

Secondary action:

```text
Open on YouTube
```

Use YouTube iframe embed URLs with timestamp start parameters. Example shape:

```text
https://www.youtube.com/embed/{videoId}?start={seconds}&autoplay=1
```

Do not attempt to cache or proxy YouTube media files. The allowed optimization is browser-level preconnect/prefetch and preloading the next iframe/container where practical.

## User Experience Requirements

### 1. Bounded Results by Default

Default result size:

```text
20
```

Controls:

- `20`
- `50`
- `100`
- `Load more`

The UI should display:

```text
Showing 20 results
```

If the API can cheaply provide total matches, show:

```text
Showing 20 of 436
```

If total matches are not cheap yet, use:

```text
Showing 20 results
Load more to continue
```

Do not render hundreds or thousands of cards at once.

### 2. Result Queue

Search results should behave as a queue:

- first result is selected by default,
- selected result is visibly highlighted,
- clicking another result updates the embedded video panel,
- keyboard navigation can be added with `j/k` or arrow keys if simple, but is optional for the first implementation.

The result card should show:

- sentence text,
- highlighted match,
- channel title,
- video title,
- timestamp,
- caption kind,
- compact actions:
  - play here,
  - copy sentence,
  - copy timestamp URL,
  - show context.

### 3. Embedded Video Panel

Right-side panel on desktop, top/inline panel on mobile.

The panel should include:

- embedded YouTube player for the selected result,
- active sentence text,
- timestamp,
- channel/video metadata,
- actions:
  - replay sentence,
  - open on YouTube,
  - copy sentence,
  - next result,
  - previous result.

Playback starts near the sentence timestamp. Use a small lead-in if supported by the URL builder:

```text
start = max(0, sentence.start - 2)
```

The displayed sentence timestamp remains the original start time.

### 4. Next Result Preload

When result `N` is selected, prepare result `N + 1`.

Allowed preload behaviors:

- add `preconnect` hints for YouTube domains,
- compute and memoize the next embed URL,
- optionally render a hidden or low-priority next iframe only after the current player is stable,
- avoid creating many iframes at once.

Do not:

- download video/audio files,
- spawn background media acquisition,
- create iframes for the entire result list.

Practical first implementation:

```text
current iframe rendered
next embed URL computed
preconnect links mounted once
when user clicks Next, iframe src swap is immediate
```

Optional second pass:

```text
one hidden next iframe with loading="lazy"
only for same-origin browser-managed cache behavior
```

Gemini should choose the conservative first implementation unless hidden iframe behavior is proven stable.

### 5. Context Expansion

Each result should support showing nearby subtitle context:

```text
previous sentence
matched sentence
next sentence
```

Preferred API shape:

```http
GET /api/english-sentences/context?channelId=...&sourceId=...&start=...&window=1
```

or extend search results to include context if cheap.

Application layer should own context assembly from sentence index/source caption sentences. UI should not scan files or infer context from raw paths.

First implementation can support:

- `window=1` or `window=2`,
- return ordered context rows with `isMatch`.

Context response shape:

```json
{
  "sourceId": "yt-...",
  "videoId": "...",
  "start": 123.4,
  "items": [
    { "start": 118.2, "end": 122.9, "text": "...", "isMatch": false },
    { "start": 123.4, "end": 128.0, "text": "...", "isMatch": true },
    { "start": 128.1, "end": 134.8, "text": "...", "isMatch": false }
  ],
  "warnings": []
}
```

### 6. Result Diversity

Add a diversity mode to avoid one long video dominating.

Modes:

- `Balanced` default: cap results per video.
- `All matches`: no per-video cap.
- `One per video`: broadest variety.

Suggested defaults:

```text
Balanced: max 2 results per video
One per video: max 1 result per video
All matches: unlimited per video, still bounded by page size
```

This should be implemented in the application search use case, not only by hiding cards in the UI, so pagination remains coherent.

Search options should include:

```ts
diversityMode?: 'balanced' | 'all' | 'one_per_video'
perVideoLimit?: number
```

### 7. Sorting and Filters

Sort modes:

- `Relevant` or existing stable order,
- `Recent`,
- `Channel variety`,
- `Shortest usable sentence`.

Keep initial implementation small:

```text
Sort: Recent | Variety
Diversity: Balanced | All | One per video
```

Filters:

- channel checkboxes,
- caption kind if available:
  - manual,
  - auto,
  - all,
- minimum/maximum sentence length if cheap:
  - short,
  - medium,
  - long.

Avoid overbuilding filters before the playback workflow is smooth.

### 8. Quick Phrase Library

Keep quick phrase buttons but expand them into learning categories:

Common spoken fillers:

- `I mean`
- `you know`
- `kind of`
- `sort of`

Grammar chunks:

- `would have`
- `could have`
- `should have`
- `supposed to`
- `used to`

Conversation connectors:

- `turns out`
- `end up`
- `as long as`
- `even though`

Do not make this a giant visible list. Use compact tabs or grouped chips.

### 9. Learning Actions

Add lightweight actions that do not require a new persistence model yet:

- copy sentence,
- copy timestamp URL,
- copy sentence + URL,
- mark active item visually during the session.

Persistence can be planned for a later stage:

```text
Saved Examples / Review Queue
```

If persistence is cheap and already matches local storage patterns, Gemini may add browser-local saved examples only, but must not create a new backend persistence subsystem in this stage.

## API and Application Requirements

### Search Request

Current endpoint can be extended:

```http
GET /api/english-sentences/search
```

Query params:

```text
channelIds=ch1,ch2
q=would+have
limit=20
offset=0
sort=recent|variety
diversity=balanced|all|one_per_video
captionKind=all|manual|auto
```

If `offset` is awkward with diversity, use cursor-style pagination:

```text
cursor=<opaque>
```

For this stage, offset is acceptable if deterministic and documented.

Response:

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

Total count is optional. Do not do expensive total scans just for display if it slows search.

### Playback URL Builder

Create or centralize a small helper for embedded playback URLs.

Expected output:

```ts
{
  youtubeTimestampUrl: string;
  youtubeEmbedUrl: string;
  startSeconds: number;
}
```

Rules:

- `youtubeTimestampUrl` opens YouTube externally.
- `youtubeEmbedUrl` stays inside the page.
- `startSeconds = Math.max(0, Math.floor(entry.start) - leadInSeconds)`.
- URL parameters must be encoded safely.

This helper can live in application/domain-adjacent code if used by API, or in web if only UI uses it. Prefer API returning the embed URL so browser smoke can validate the contract.

### Context Endpoint

Add one endpoint only if needed:

```http
GET /api/english-sentences/context
```

Required params:

```text
channelId
sourceId
start
window
```

Validation:

- `window` max 3,
- English only,
- missing sentence data returns a warning/404-style clear message, not a crash.

## UI Layout Requirements

Target file:

- `apps/web/src/components/EnglishSentenceSearch.tsx`

If the file becomes too large, split into focused components:

- `EnglishSearchFilters.tsx`
- `EnglishSearchResultQueue.tsx`
- `EnglishSearchPlayerPanel.tsx`
- `EnglishSearchContextPanel.tsx`

Do not create vague `utils.ts`. If helpers are needed, use responsibility names:

- `englishPlaybackUrls.ts`
- `englishSearchPagination.ts`

### Desktop

Use three functional areas:

- left: filters/channels/quick phrases,
- middle: result queue,
- right: player + active sentence + context.

Avoid nested cards. A full-width workbench with panels is acceptable.

### Mobile

Use a stacked layout:

- search input,
- active player,
- active sentence,
- collapsible filters,
- results.

Ensure text does not overflow buttons or cards. Use stable iframe aspect ratio:

```css
aspect-ratio: 16 / 9;
```

### Empty and Error States

States:

- no indexed channels,
- no channels selected,
- no matching results,
- API warning for missing index,
- embed unavailable or blocked.

If embed is unavailable, keep the sentence visible and show `Open on YouTube`.

## Performance Rules

- Do not render more than the active page of result cards.
- Do not create one iframe per result.
- Only one active visible iframe.
- Preconnect YouTube domains once.
- Debounce search input.
- Cancel or ignore stale search responses if the user changes query/channel quickly.
- Keep result card keys stable.

## Layer Placement

### Domain

Own stable types if needed:

- search paging metadata,
- diversity mode,
- sort mode,
- context row type.

### Application

Own behavior:

- multi-channel search orchestration,
- diversity filtering,
- pagination/cursor,
- context lookup,
- playback URL contract if API returns embed URLs.

### Storage

Only expose narrow read APIs if context lookup needs sentence access. Do not leak file paths to web.

### API

Own validation and route shape:

- search params,
- context params,
- bounded limits.

### Web

Own interaction and presentation:

- selected result,
- player panel,
- filters,
- load more,
- copy actions,
- in-session active state.

## Target Files

Likely files:

- `packages/domain/src/index.ts`
- `packages/application/src/searchEnglishSentenceIndexUseCase.ts`
- `packages/application/src/getEnglishSentenceContextUseCase.ts`
- `packages/application/src/index.ts`
- `packages/storage/src/index.ts`
- `apps/api/src/routes/englishSentences.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/EnglishSentenceSearch.tsx`

Optional split files:

- `apps/web/src/components/EnglishSearchFilters.tsx`
- `apps/web/src/components/EnglishSearchResultQueue.tsx`
- `apps/web/src/components/EnglishSearchPlayerPanel.tsx`
- `apps/web/src/components/EnglishSearchContextPanel.tsx`

Verification:

- `scripts/ops/verify-stage13-english-search-learning-workbench.ts`
- `docs/plans/reports/2026-05-05-english-search-learning-workbench-report.md`

## Verification Strategy

Follow the reference test strategy: prove contracts with the narrowest tests first.

### Deterministic Script

Create:

```text
scripts/ops/verify-stage13-english-search-learning-workbench.ts
```

It should use fixture indexes and prove:

- default limit returns 20 or configured page size,
- `hasMore` behaves correctly,
- `Load more` equivalent offset returns the next page,
- `balanced` diversity caps per-video results,
- `one_per_video` returns at most one per video,
- `all` allows repeated video results,
- channel filters still work,
- warnings are preserved,
- embed URL includes `/embed/{videoId}` and safe `start`,
- external timestamp URL remains available,
- context use case returns previous/current/next rows in order,
- context window is capped.

### API Smoke

Run bounded curl checks against local API:

```bash
curl -sS 'http://127.0.0.1:8001/api/english-sentences/search?channelIds=...&q=would+have&limit=20&diversity=balanced'
curl -sS 'http://127.0.0.1:8001/api/english-sentences/context?channelId=...&sourceId=...&start=...&window=1'
```

Also verify through Vite proxy if dev servers are running:

```bash
curl -sS 'http://127.0.0.1:3000/api/health'
curl -sS 'http://127.0.0.1:3000/api/english-sentences/search?...'
```

Remember `docs/GOTCHAS.md`: API environment and running process must be restarted after build/env changes.

### Browser/UI Smoke

If feasible, Gemini should use a browser smoke check or at least include screenshots/manual evidence for:

- English Search loads,
- channels selected by default,
- first result selected,
- iframe player visible,
- clicking second result changes player URL/title,
- `Load more` appends results,
- context expands without leaving the page.

Do not claim UI success without browser or API evidence.

## Acceptance Criteria

- English Search defaults to a bounded result page, not all results.
- `Load more` works or a page-size control exists with clear behavior.
- Search, filters, results, and embedded playback are on one page.
- First result is selected by default when results exist.
- Selecting a result updates the embedded YouTube player.
- External YouTube timestamp link remains available as a secondary action.
- Next result preload strategy is implemented conservatively and documented.
- Diversity mode prevents one video from dominating by default.
- Users can switch to all matches.
- Context expansion returns nearby sentences without frontend file access.
- Multi-channel checkbox behavior from Stage 12 remains intact.
- No YouTube video/audio download is introduced.
- Global machine translation remains untouched.
- `npm run typecheck` passes.
- `npm run build` passes.
- Stage 13 verification script passes.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage13-english-search-learning-workbench.ts
npm run typecheck
npm run build
```

If public package exports change, run the relevant package build first:

```bash
npm run build -w @yanghoo/application
```

If local dev server smoke is included:

```bash
DATA_DIR=/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4/data node apps/api/dist/server.js
npm --workspace apps/web run dev
```

Then verify:

```bash
curl -sS http://127.0.0.1:8001/api/health
curl -sS http://127.0.0.1:3000/api/health
```

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-05-english-search-learning-workbench-report.md
```

The report must include:

- changed files,
- final API request/response shapes,
- search pagination behavior,
- diversity behavior,
- embedded playback behavior,
- next-result preload strategy and its limits,
- context behavior,
- UI screenshots or browser smoke evidence if available,
- exact verification commands and results,
- skipped checks and reasons,
- residual risks.

## Audit Checklist

Codex should reject the report if:

- English Search still renders all results by default,
- playback jumps out to YouTube as the primary path,
- one iframe is rendered per result,
- result diversity is only a frontend hide/filter that breaks pagination,
- context is assembled by reading files from the web layer,
- Channel English Search starts downloading YouTube video/audio,
- global translation code is removed or disabled,
- warnings are dropped,
- verification uses mocks while claiming real API/UI behavior,
- dev server success is claimed without checking API and Vite proxy health.
