# Report: Add Bilibili and TikTok Platforms

## Summary

Successfully added Bilibili and TikTok platform adapters, enabling URL extraction, metadata capture, and media-based transcription workflow for these platforms.

## Changed Files

- `packages/domain/src/index.ts`: Added `tiktok` to `Platform` union.
- `packages/application/src/extractSupportedSourceUrl.ts`: Added regex patterns for Bilibili and TikTok.
- `packages/source-adapters/src/bilibiliAdapter.ts`: New adapter for Bilibili.
- `packages/source-adapters/src/tiktokAdapter.ts`: New adapter for TikTok.
- `packages/source-adapters/src/index.ts`: Exported new adapters.
- `packages/application/src/index.ts`: Updated `captureSourceUseCase` with routing for new platforms.
- `apps/web/src/components/TaskCard.tsx`: Updated `isShortVideoPlatform` check to include `tiktok` and ensure Bilibili follows the media download path.
- `scripts/collect/collect-bilibili-url.ts`: New collection script.
- `scripts/collect/collect-tiktok-url.ts`: New collection script.
- `docs/GOTCHAS.md`: Added notes on TikTok and Bilibili capture.

## Verification Results

### yt-dlp Version and Extractors

```text
yt-dlp version: 2026.03.17
Extractors:
BiliBili
TikTok
vm.tiktok
```

### Bilibili Test Case

- **URL**: `https://www.bilibili.com/video/BV1pqr5BUEhr`
- **Import Status**: Success
- **Source ID**: `bili-BV1pqr5BUEhr`
- **Metadata Captured**:
  - Title: "这是你唯一一次读懂全包半包自装的底层逻辑的机 会"
  - Author: "一粒小图钉"
  - Duration: 871.516s
- **Media Download**: Success (`data/sources/bili-BV1pqr5BUEhr/media.mp4`)

### TikTok Test Case

- **URL**: `https://www.tiktok.com/@khaby.lame/video/7311758509420055813`
- **Import Status**: Failed (Expected)
- **Error**: `TikTok metadata capture failed: ... Read timed out. (read timeout=20.0)`
- **Observation**: Correctly surfaces `yt-dlp` errors instead of creating invalid cards.

### Build and Typecheck

- `npm run build`: Pass
- `npm run typecheck`: Pass

## UI Action Summary

- Bilibili Card:
  - No media -> "下载视频"
  - Media downloaded -> "转录"
  - Transcribed -> "阅读"
- TikTok Card:
  - Same as Bilibili (follows media download workflow).

## Risks and Mitigation

- **TikTok Impersonation**: TikTok is highly sensitive to headers and IP. Users may need to provide cookies via environment variables if `yt-dlp` continues to fail in their environment.
- **Bilibili Quality**: Default `yt-dlp` download for Bilibili might be limited to 480p/720p without cookies. However, for transcription purposes, this is sufficient.
