# Fix Xiaohongshu Cover Reliability and YouTube Card Titles

## Goal

Make source cards show reliable, human-readable metadata for:

- Xiaohongshu cards whose external cover image URL may fail in the browser.
- YouTube cards that currently fall back to `YouTube Video <videoId>` after metadata capture fails.

The result should improve card readiness presentation without changing transcript pipeline semantics.

Platform acquisition policy:

- YouTube uses Baoyu's YouTube InnerTube/internal API path. It should be able to load captions without downloading video.
- X, Xiaohongshu, and Douyin use `yt-dlp` for metadata/media acquisition.

## Non-Goals

- Do not rebuild the card UI as a media control panel.
- Do not label descriptions, shownotes, chapters, or outlines as transcripts.
- Do not copy source code or templates from the reference repository.
- Do not make frontend-only string hacks that hide bad persisted metadata.
- Do not require users to manually delete `data/` records to fix stale titles or covers.

## Context

Current observations:

- `packages/source-adapters/src/xiaohongshuAdapter.ts` stores `thumbnailUrl` from `yt-dlp` metadata.
- Existing Xiaohongshu data uses an external `sns-webpic-qc.xhscdn.com` thumbnail URL. Those URLs can fail in browsers because of hotlink restrictions, expiry, HTTP/HTTPS behavior, or CDN access rules.
- YouTube must follow this repo's accepted Baoyu/InnerTube priority. Current or recent code that uses `yt-dlp` for YouTube metadata or caption fetching is a drift from the intended platform split and must be corrected.
- Existing YouTube records under `data/sources/yt-*/record.json` still have fallback titles, so changing only future capture is insufficient.
- `apps/web/src/components/TaskCard.tsx` renders `task.thumbnailUrl` and `task.title` directly.

Reference repository note:

- The configured reference path `/Volumes/2T/com/yanghoo205/yanghoo-reference` was not mounted/available during task preparation. Gemini should read the default reference files from that repository before implementing if the path is available in its environment. If unavailable, state this in the report and follow this repo's ADRs and `AGENTS.md`.

Local gotchas:

- Read `docs/GOTCHAS.md` before work. This task touches media cards and URL/platform adapters.
- If this work confirms a repeatable cover-hotlink trap, update `docs/GOTCHAS.md` with the operational rule. If no update is needed, say why in the report.

## Layer Placement

- Source adapter layer owns platform metadata extraction and normalization.
- Application layer may own a use case that refreshes/repairs persisted source metadata.
- Storage layer owns persisted asset paths and source record updates.
- UI layer should only render supplied metadata and provide graceful image fallback.

Boundary answers:

1. Xiaohongshu cover capture belongs to `packages/source-adapters` plus storage/application if the cover is cached locally.
2. YouTube title/caption capture and refresh belongs to a YouTube-specific Baoyu/InnerTube adapter path plus an application-level metadata refresh path.
3. UI may add image `onError` fallback, but must not invent product metadata.
4. The boundary would be violated if React parses platform HTML, runs `yt-dlp`, rewrites persisted titles, or if YouTube is routed through the generic short-video media-download workflow.
5. Verification must prove persisted records and `/api/tasks` return stable metadata, and the card renders without a broken image/title placeholder.

## Required Design

### Xiaohongshu Cover

Implement a robust cover policy:

- Prefer a local cached cover asset for Xiaohongshu when `yt-dlp` returns a thumbnail.
- Store the browser-usable URL/path in `source.thumbnailUrl`.
- Preserve the original remote thumbnail in metadata, for example `metadata.remoteThumbnailUrl`.
- If cover caching fails, keep the card usable:
  - persist the source record,
  - show a non-broken fallback in the UI,
  - surface enough metadata/report detail for debugging.

Recommended shape:

- Add a small application/storage helper to download a remote thumbnail into the canonical source data directory, for example `data/sources/{sourceId}/cover.{ext}`.
- Expose local assets through the API rather than using app-local `apps/*/data`.
- Keep generated files under the canonical root `data/`.

Do not block the whole Xiaohongshu import only because cover caching fails.

### YouTube Card Titles

Fix both future imports and existing fallback records:

- Improve YouTube metadata capture through Baoyu/YouTube InnerTube/internal API data so it sets a real title, author, duration, and thumbnail when available.
- Add a repair path for existing records whose title matches fallback patterns such as `YouTube Video <videoId>`.
- The repair path can be a script or an application use case, but it must update persisted `record.json` records intentionally.
- Avoid frontend-only replacement of `YouTube Video <id>` because generated documents and reader titles also use `source.title`.

YouTube captions:

- Use Baoyu's YouTube InnerTube/internal API caption path as the primary implementation.
- A YouTube card without a readable document should show `载字幕` / ensure-transcript, not `下载视频`.
- YouTube can support a pure caption flow: URL capture -> metadata/caption list -> caption download -> refiner -> readable document.
- Do not use `yt-dlp` as the YouTube caption or video-download path for this task.

Use InnerTube/Baoyu metadata fields as the primary source for title. If unavailable, optionally fall back to safe oEmbed or HTML OpenGraph metadata, but keep failures explicit in logs/report.

### X, Xiaohongshu, and Douyin Media Path

Keep X, Xiaohongshu, and Douyin on the `yt-dlp` path:

- Capture metadata with `yt-dlp --dump-json --skip-download` where supported.
- Download media with the existing `yt-dlp` media use case.
- Then extract/probe audio and transcribe with MLX when the downloaded media has audio.
- Preserve truthful failure states for cookie/auth/rate-limit/platform extractor failures.
- Do not apply the YouTube Baoyu/InnerTube caption-only path to these platforms.

## Target Files / Directories

Likely files:

- `packages/source-adapters/src/xiaohongshuAdapter.ts`
- `packages/source-adapters/src/youtubeAdapter.ts`
- YouTube-specific Baoyu/InnerTube adapter/helper files if the current adapter needs to be split
- `packages/application/src/*` for metadata refresh/cache orchestration if needed
- `packages/storage/src/index.ts` for safe asset writing or URL exposure if needed
- `apps/api/src/routes/*` if local cover asset serving is needed
- `apps/web/src/components/TaskCard.tsx` only for image fallback behavior
- `scripts/*` if adding a one-action metadata repair script
- `docs/GOTCHAS.md` if the cover-hotlink trap is confirmed

Avoid broad refactors outside these files.

## Acceptance Criteria

- Xiaohongshu cards do not show a broken image when remote thumbnail URLs fail.
- Xiaohongshu source records keep canonical source IDs and do not reintroduce query-string IDs.
- Xiaohongshu source records preserve both display thumbnail information and original remote thumbnail metadata when available.
- YouTube imports produce real titles from the Baoyu/InnerTube/internal API metadata path when metadata is available.
- Existing fallback YouTube records can be repaired without deleting the card.
- The reader and generated markdown use the repaired YouTube title because `source.title` is updated.
- YouTube cards expose a caption/document action (`载字幕`) before any media-download action.
- YouTube transcript generation does not require video download.
- X, Xiaohongshu, and Douyin cards continue to use the `yt-dlp` media path and expose `下载视频 -> 视频转字幕 -> 阅读` when applicable.
- UI still presents document readiness actions, not a general media control panel.
- No descriptions, chapters, or shownotes are treated as transcript readiness.

## Verification Commands

Gemini should run:

```bash
npm run build
npm run typecheck
```

Focused manual/API verification should include:

```bash
npx tsx scripts/collect/collect-youtube-url.ts "https://www.youtube.com/watch?v=<known-video-id>"
npx tsx scripts/collect/collect-xiaohongshu-url.ts "<known-xhs-url-or-share-text>"
curl -sS http://127.0.0.1:8001/api/tasks
```

YouTube verification must prove caption-only behavior:

- Import a YouTube URL.
- Confirm the card's next action is `载字幕`, not `下载视频`.
- Trigger ensure-transcript and confirm transcript/document assets are generated without a downloaded `media.mp4`.
- Confirm the transcript manifest records a Baoyu/InnerTube-style `platform_caption` source, not a `yt-dlp` video-download flow.

X/Xiaohongshu/Douyin verification must prove `yt-dlp` behavior:

- Confirm each supported short-video card starts with `下载视频` when no media exists.
- Confirm `yt-dlp` failures are surfaced truthfully and do not create fake readiness.

If a metadata repair script is added, verify it against existing `yt-*` records and include before/after title evidence.

If local cover serving is added, verify:

- the cached cover file exists under `data/sources/{sourceId}/`,
- `/api/tasks` returns a browser-usable `thumbnailUrl`,
- the web card renders the cover or the designed fallback without a broken image icon.

## Expected Report

Write the Gemini report to:

```text
docs/plans/reports/2026-04-29-fix-xhs-cover-and-youtube-card-title-report.md
```

The report must include:

- changed files,
- exact commands run,
- key output lines or summarized evidence,
- generated file list for cached covers or repaired records,
- before/after examples for Xiaohongshu cover and YouTube title,
- unresolved risks,
- whether `docs/GOTCHAS.md` was updated and why.
