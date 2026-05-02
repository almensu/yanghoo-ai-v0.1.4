# YouTube Bilingual Captions and Machine Translation

Date: 2026-05-02

## Goal

Make YouTube `Ensure Transcript` actively acquire both:

- English captions (`en`)
- Simplified Chinese captions (`zh-Hans`), using YouTube timedtext machine translation when no native Simplified Chinese track exists

Only fall back to `下载音频 -> 音频转字幕` when no usable YouTube caption variants can be acquired.

## Non-goals

- Do not download YouTube video for normal caption acquisition.
- Do not replace the Baoyu/InnerTube caption-first strategy with generic media download.
- Do not use local MLX LM translation as the first Simplified Chinese subtitle path.

## Target Files

- `packages/source-adapters/src/youtubeAdapter.ts`
- `packages/application/src/index.ts`
- `packages/domain/src/index.ts`
- `packages/domain/src/storage.ts`
- `packages/storage/src/index.ts`
- `docs/README.md`
- `docs/GOTCHAS.md`
- `README.md`

## Layer Placement

- Source adapter: discovers caption tracks and fetches English / `zh-Hans` caption variants.
- Application layer: decides persistence shape and readiness fallback.
- Domain/storage: defines paths for caption variants and persists manifest metadata.
- UI/API: continues to use existing document and translation asset surfaces.

## Acceptance Criteria

- YouTube transcript acquisition requests both `en` and `zh-Hans`.
- If `zh-Hans` is not a native track, the adapter actively requests `tlang=zh-Hans`.
- If anonymous timedtext translation is blocked, the adapter uses subtitle-only yt-dlp fallback with browser cookies; it must still use `--skip-download`.
- English and Simplified Chinese caption assets are persisted under `data/sources/{sourceId}/captions/`.
- Simplified Chinese is also persisted to `translation/document.zh-Hans.md` so the reader's Chinese preview works without local MLX translation.
- No audio download occurs while at least one caption variant is usable.

## Verification

Use the user-provided test video:

```bash
npm run -s cli -- source add 'https://www.youtube.com/watch?v=v4F1gFy-hqg' --json
npm run -s cli -- transcript ensure yt-v4F1gFy-hqg --json
find data/sources/yt-v4F1gFy-hqg -maxdepth 4 -type f | sort
cat data/sources/yt-v4F1gFy-hqg/captions/captions-manifest.json
cat data/sources/yt-v4F1gFy-hqg/translation/translation-manifest.json
npm run typecheck
npm run build
```
