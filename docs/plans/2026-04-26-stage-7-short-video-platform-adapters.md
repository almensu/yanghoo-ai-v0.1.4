# Stage 7: Short-Video Platform Adapters

## Owner

Gemini implements. Codex reviews.

## Goal

Add support for short-video platforms (Douyin and Xiaohongshu) and establish the media-to-audio extraction flow.

## Non-goals

- Do not implement real `ffmpeg` extraction in this stage (use stubs for file paths).
- Do not implement real cookie-based scraping (use URL-based metadata extraction stubs).

## Tasks

### 1. Implement Douyin Adapter

In `packages/source-adapters`:
- Create `douyinAdapter.ts`.
- Extract video ID from shared URL.
- Map to `short_video` source class.

### 2. Implement Xiaohongshu Adapter

In `packages/source-adapters`:
- Create `xiaohongshuAdapter.ts`.
- Extract post ID from URL.

### 3. Add Media Extraction Service

In `packages/transcript/src/index.ts` (or a new file):
- Add `extractAudioFromVideo(videoPath: string): Promise<string>` interface.
- This will be used in future stages for `mlx-audio` input.

### 4. Create Collection Scripts

Update or create:
- `scripts/collect/collect-douyin-url.ts`
- `scripts/collect/collect-xiaohongshu-url.ts`

### 5. Update Application Use Case

Update `captureSourceUseCase` in `packages/application` to handle these new platforms.

## Acceptance Criteria

- User can run `collect-douyin-url.ts` with a valid-looking URL.
- A source record is created with `sourceClass: 'short_video'` and `platform: 'douyin'`.
- Project passes `npm run typecheck`.

## Verification Commands

```bash
npx tsx scripts/collect/collect-douyin-url.ts "https://v.douyin.com/id/"
ls -l data/sources/
```
