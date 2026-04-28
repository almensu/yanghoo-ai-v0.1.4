# Stage 4: Transcript Pipeline

## Owner

Gemini implements. Codex reviews.

## Goal

Establish the core pipeline for turning captured sources into refined transcript assets.

## Non-goals

- Do not implement the actual `mlx-audio` Whisper transcription logic yet (keep it as a stub).
- Do not implement advanced CJK text refinement (basic splitting is enough).

## Tasks

### 1. Define Transcript Interfaces in Application

In `packages/application`, define the orchestration logic for `ensureTranscriptUseCase`.

### 2. Implement YouTube Transcript Fetcher

In `packages/source-adapters`, add transcript fetching capability to `YouTubeSourceAdapter`.
- *MVP*: Implement a stub or simple fetcher that returns mock transcript segments if an external library is not used.

### 3. Implement Transcript Refiner

Create `packages/transcript/src/refiner.ts`:
- Responsible for converting `TranscriptSegment[]` into `TranscriptSegment[]` (sentences).
- Handle basic timestamp merging and sentence boundary detection.

### 4. Implement Asset Persistence

In `packages/storage`, implement `TranscriptStorage` and `DocumentStorage` to save:
- `transcript-raw.json`
- `transcript-sentences.json`
- `transcript.vtt`
- `document.md`

### 5. Create Transcription Script Entrypoints

Update or create:
- `scripts/transcript/export-transcript-vtt.ts`
- `scripts/transcript/normalize-transcript-segments.ts`
- `scripts/transcript/refine-transcript-sentences.ts`

## Acceptance Criteria

- Running `npx tsx scripts/transcript/refine-transcript-sentences.ts <sourceId>` generates all four asset files in `data/sources/{sourceId}/`.
- `document.md` contains a readable Markdown version of the transcript with timestamps.
- Project passes `npm run typecheck`.

## Verification Commands

```bash
# Verify pipeline for an existing source
npx tsx scripts/transcript/refine-transcript-sentences.ts yt-dQw4w9WgXcQ
ls -l data/sources/yt-dQw4w9WgXcQ/
```
