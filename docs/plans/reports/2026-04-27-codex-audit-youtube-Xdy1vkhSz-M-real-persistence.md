# Codex Audit: YouTube Xdy1vkhSz-M Real Persistence

## Summary

Codex tested YouTube source `Xdy1vkhSz-M` after the Stage 7 and post-audit fixes. The pipeline creates files, but it does not persist real YouTube transcript content. The generated transcript is mock data from `YouTubeSourceAdapter.fetchTranscript()`.

Therefore, this is **not accepted as real content persistence**.

## Test Performed

```bash
npx tsx scripts/collect/collect-youtube-url.ts 'https://www.youtube.com/watch?v=Xdy1vkhSz-M'
npx tsx scripts/transcript/refine-transcript-sentences.ts yt-Xdy1vkhSz-M
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('yt-Xdy1vkhSz-M'), null, 2)))"
```

Generated files:

```text
data/sources/yt-Xdy1vkhSz-M/document.md
data/sources/yt-Xdy1vkhSz-M/record.json
data/sources/yt-Xdy1vkhSz-M/transcript-manifest.json
data/sources/yt-Xdy1vkhSz-M/transcript-raw.json
data/sources/yt-Xdy1vkhSz-M/transcript-sentences.json
data/sources/yt-Xdy1vkhSz-M/transcript.vtt
```

Readiness result:

```json
{
  "status": "markdown_ready",
  "source": "platform_caption",
  "sentencesCount": 4,
  "chaptersCount": 0,
  "hasMarkdown": true,
  "hasRefined": true,
  "hasVtt": true
}
```

## Finding

### P0: YouTube transcript persistence is mock-only

Evidence:

- `packages/source-adapters/src/youtubeAdapter.ts:51-64`
- Generated `data/sources/yt-Xdy1vkhSz-M/document.md`

Problem:

`fetchTranscript(videoId)` logs that it is fetching transcript data, but returns four fixed demo segments:

```text
Welcome to this demo.
Today we are building a transcript workbench.
This project focuses on turning URLs into readable documents.
Let's see how it works!
```

This means:

- `transcript-raw.json` is not real YouTube caption data
- `transcript-sentences.json` is not real refined transcript content
- `document.md` is not a readable document generated from the actual video
- `transcript-manifest.json` incorrectly reports `sourceType: platform_caption`
- readiness incorrectly reports `markdown_ready` for a document that is structurally complete but content-invalid

## Root Cause

Stage 4 allowed this non-production behavior:

```text
MVP: Implement a stub or simple fetcher that returns mock transcript segments if an external library is not used.
```

That was acceptable for pipeline scaffolding only. It is no longer acceptable for testing real YouTube persistence.

## Required Gemini Follow-up

Gemini must implement the task:

```text
docs/plans/2026-04-27-youtube-real-caption-persistence.md
```

Gemini must write the report:

```text
docs/plans/reports/2026-04-27-youtube-real-caption-persistence-report.md
```

## Decision

Current result proves that the file-writing pipeline works, but does **not** prove real YouTube content persistence. Do not claim YouTube transcript persistence is complete until `Xdy1vkhSz-M` produces actual caption-derived content or an explicit no-caption/fallback failure state.
