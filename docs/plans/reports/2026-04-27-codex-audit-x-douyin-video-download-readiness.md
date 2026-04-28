# Codex Audit: X and Douyin Video Download Readiness

## Summary

Codex audited the current state for X and Douyin video download persistence after pausing MLX transcription work due to macOS 12.4 compatibility constraints.

Result: not ready for real X/Douyin video download testing yet. The repository has partial Douyin source capture only, no X adapter, and empty media scripts.

This stage should focus only on media download and persistence:

```text
URL -> real metadata -> real video/media file -> media manifest -> homepage/API readiness
```

Do not attempt transcription in this stage.

## Environment Note

The user confirmed:

```text
macOS 12.4 Monterey
```

`mlx` Python wheels require macOS >= 14.0, so `mlx-audio` ASR should be treated as blocked on this machine. X/Douyin work should avoid MLX and only prove media download persistence.

Local tool check:

```bash
which yt-dlp
yt-dlp --version
```

Observed:

```text
/Users/yanghoomacmini/miniconda3/bin/yt-dlp
2026.03.17
```

## Current State

### Douyin

File:

```text
packages/source-adapters/src/douyinAdapter.ts
```

Current behavior:

- parses `/video/{id}` or last URL segment
- creates placeholder title and author
- stores `metadata.videoId`
- does not resolve share short links robustly
- does not fetch real metadata
- does not locate video URL
- does not download video

Script:

```text
scripts/collect/collect-douyin-url.ts
```

Only calls `captureSourceUseCase`.

### X

Current state:

- `scripts/collect/collect-x-url.ts` exists but is empty
- no `xAdapter.ts` exists under `packages/source-adapters/src`
- `packages/source-adapters/README.md` lists planned `xSourceAdapter`
- no X media download path exists

### Media scripts

These files exist but are empty:

```text
scripts/media/download-source-media.ts
scripts/media/resolve-media-url.ts
scripts/media/extract-source-audio.ts
```

### Existing storage

Current storage has audio-specific support:

```text
audio.m4a
audio-manifest.json
```

There is no general video/media asset contract yet. `packages/domain/src/storage.ts` has `getMediaDownloadPath(sourceId, ext)`, but storage/readiness does not model video/media download state.

## Findings

### P0: X video download has no adapter or script implementation

Gemini must implement X source capture and media download before any X video persistence claim.

### P0: Douyin video download is metadata-placeholder only

Current Douyin support cannot prove real media persistence. It only creates a placeholder source record.

### P1: Media asset model is audio-specific

For X/Douyin, use a general `MediaAsset` model rather than forcing all media into `AudioAsset`.

Suggested conceptual states:

```text
missing -> resolving -> resolved -> downloaded -> failed
```

### P1: Homepage cards need media-download actions distinct from transcript actions

For short-video sources, cards should expose document-readiness-oriented staged actions:

```text
Fetch Video -> Extract/Transcribe later
```

Do not build a full media control panel.

## Gemini Follow-up

Gemini must implement:

```text
docs/plans/2026-04-27-x-douyin-video-download-persistence.md
```

Gemini must report to:

```text
docs/plans/reports/2026-04-27-x-douyin-video-download-persistence-report.md
```

## Decision

X/Douyin video persistence is not accepted until real downloaded media files and media manifests exist under the canonical source data root and are visible through API/homepage readiness.
