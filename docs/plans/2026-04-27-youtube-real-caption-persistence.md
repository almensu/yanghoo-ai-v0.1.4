# YouTube Real Caption Persistence

## Owner

Gemini implements. Codex reviews.

## Goal

Replace the mock YouTube transcript path with a real caption-fetching path so a YouTube URL such as:

```text
https://www.youtube.com/watch?v=Xdy1vkhSz-M
```

persists actual transcript-derived content, not demo placeholder text.

## Non-goals

- Do not implement real `mlx-audio` fallback in this task unless platform captions are unavailable and the user explicitly expands scope.
- Do not add unrelated UI redesign.
- Do not mark mock/demo text as `platform_caption`.
- Do not silently return demo segments when real caption fetching fails.

## Target Files

- `packages/source-adapters/src/youtubeAdapter.ts`
- `packages/application/src/index.ts`
- `packages/domain/src/index.ts` if status/error contracts need refinement
- `packages/storage/src/index.ts` if transcript failure/readiness needs persistence support
- `scripts/transcript/refine-transcript-sentences.ts`
- report file under `docs/plans/reports/`

## Requirements

### 1. Real YouTube caption fetch

Implement `YouTubeSourceAdapter.fetchTranscript(videoId)` so it attempts to retrieve actual YouTube caption/transcript data.

Preferred priority follows product rules:

```text
Baoyu/YouTube InnerTube -> VTT/SRT -> mlx-audio -> manual upload
```

For this task, implement the first available real platform-caption path. It may use Baoyu/InnerTube or another explicit YouTube caption mechanism, but it must return real segments from the target video.

### 2. No silent mock fallback

Remove the fixed demo transcript fallback from production code.

If real caption fetching fails:

- return a typed failure from the adapter or throw a clear error
- do not write `document.md` containing demo text
- do not set readiness to `markdown_ready`
- do not set manifest `sourceType` to `platform_caption`

### 3. Persist enough source evidence

When platform captions are successfully fetched, persist enough metadata to audit the result:

- source type: `platform_caption`
- language if known
- caption track/source if known
- generated timestamp
- number of raw segments

### 4. Verify with `Xdy1vkhSz-M`

Run the end-to-end path:

```bash
npx tsx scripts/collect/collect-youtube-url.ts 'https://www.youtube.com/watch?v=Xdy1vkhSz-M'
npx tsx scripts/transcript/refine-transcript-sentences.ts yt-Xdy1vkhSz-M
```

Then inspect:

```bash
data/sources/yt-Xdy1vkhSz-M/transcript-raw.json
data/sources/yt-Xdy1vkhSz-M/transcript-sentences.json
data/sources/yt-Xdy1vkhSz-M/document.md
data/sources/yt-Xdy1vkhSz-M/transcript-manifest.json
```

## Acceptance Criteria

- `document.md` contains actual content from YouTube video `Xdy1vkhSz-M`, not the four demo sentences.
- `transcript-raw.json` contains real raw caption segments from the target video.
- `transcript-sentences.json` is derived from those real raw segments.
- `transcript-manifest.json` records `sourceType: platform_caption` only when real platform captions were fetched.
- If the video has no accessible captions, the command must fail clearly or persist a failed transcript state; it must not create fake successful document assets.
- `getDocumentReadiness('yt-Xdy1vkhSz-M')` only returns `markdown_ready` when the generated Markdown is based on real fetched content.

## Verification Commands

Gemini must run:

```bash
npm run build
npm run typecheck
npx tsx scripts/collect/collect-youtube-url.ts 'https://www.youtube.com/watch?v=Xdy1vkhSz-M'
npx tsx scripts/transcript/refine-transcript-sentences.ts yt-Xdy1vkhSz-M
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('yt-Xdy1vkhSz-M'), null, 2)))"
```

Gemini must also include a short excerpt or segment count from the generated real transcript in the report. Do not paste long copyrighted transcript content.

## Expected Report

Write report to:

```text
docs/plans/reports/2026-04-27-youtube-real-caption-persistence-report.md
```

Report must include:

- changed files
- implementation approach for YouTube caption fetching
- verification command outputs
- whether `Xdy1vkhSz-M` had accessible captions
- generated file list
- readiness output
- unresolved risks
