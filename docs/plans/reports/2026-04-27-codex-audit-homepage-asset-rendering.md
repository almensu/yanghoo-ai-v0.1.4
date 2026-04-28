# Codex Audit: Homepage Asset Rendering

## Summary

Gemini reports that real YouTube captions for `Xdy1vkhSz-M` were fetched and persisted. Codex confirmed that real content exists under the repository root data directory, but the running homepage/API is not reading that same dataset.

This explains why the user does not see the expected real assets rendered on the homepage.

## Evidence

Root data contains the real transcript result:

```text
data/sources/yt-Xdy1vkhSz-M/transcript-manifest.json
```

Manifest:

```json
{
  "sourceType": "platform_caption",
  "language": "en-orig",
  "engine": "youtube-innertube (yt-dlp fetched track)",
  "generatedAt": "2026-04-27T03:18:39.908Z",
  "rawSegmentsCount": 1315,
  "refinedSegmentsCount": 147
}
```

Root `document.md` contains real transcript-derived content about Codex and Remotion.

However, the running API returns the stale app-local asset:

```bash
curl -sS http://127.0.0.1:8001/api/tasks
curl -sS http://127.0.0.1:3000/api/tasks
```

Observed API result for `yt-Xdy1vkhSz-M`:

```json
{
  "id": "yt-Xdy1vkhSz-M",
  "documentAssets": {
    "status": "markdown_ready",
    "source": "platform_caption",
    "sentencesCount": 4,
    "chaptersCount": 0,
    "hasMarkdown": true,
    "hasRefined": true,
    "hasVtt": true
  }
}
```

The app-local API data confirms the stale mock asset:

```text
apps/api/data/sources/yt-Xdy1vkhSz-M/document.md
```

It still contains:

```text
Welcome to this demo.
Today we are building a transcript workbench.
This project focuses on turning URLs into readable documents.
Let's see how it works!
```

## Finding

### P0: Storage root is inconsistent between scripts and running API

Evidence:

- `packages/domain/src/storage.ts`
- `packages/storage/src/index.ts`
- `apps/api/src/config.ts`
- `apps/api/data/sources/yt-Xdy1vkhSz-M/*`
- `data/sources/yt-Xdy1vkhSz-M/*`

Problem:

Storage paths are based on relative `data/...` strings. Scripts run from the repository root and write:

```text
data/sources/...
```

The API is launched from `apps/api` through the workspace dev script and reads/writes:

```text
apps/api/data/sources/...
```

`apps/api/src/config.ts` defines `dataDir`, but storage does not use it. As a result, the homepage can only see whatever the running API process finds in its own current working directory, not the root assets that Gemini verified.

Impact:

- Real caption persistence can pass from scripts while homepage renders stale or missing data.
- `/api/tasks` reports `sentencesCount: 4` instead of the real `147`.
- Users cannot trust homepage readiness.

## Secondary Finding

### P1: Homepage has weak diagnostics for empty or failed API state

Evidence:

- `apps/web/src/App.tsx`
- `apps/web/src/api/client.ts`

Problem:

If the API is down or returns an empty list, the homepage only logs to console and then renders an empty grid. There is no visible error state or empty state explaining whether the issue is API connectivity or no assets.

## Required Gemini Follow-up

Gemini must implement:

```text
docs/plans/2026-04-27-fix-storage-root-and-homepage-assets.md
```

Gemini must report to:

```text
docs/plans/reports/2026-04-27-fix-storage-root-and-homepage-assets-report.md
```

## Decision

Do not consider the homepage/readiness path accepted until the running API and scripts share one canonical data root and `/api/tasks` returns the real `yt-Xdy1vkhSz-M` asset with `sentencesCount: 147`.
