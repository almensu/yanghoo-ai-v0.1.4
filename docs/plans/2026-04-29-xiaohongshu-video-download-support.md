# Xiaohongshu Video Download Support

## Owner

Gemini implements. Codex reviews.

## Goal

Implement reliable Xiaohongshu/XHS video capture and download for URLs like:

```text
https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=ABHCAnYqVSjMn7bympymavoiCpF6yYBbkWLE1mUCesu1A=&xsec_source=pc_share
```

Also support mobile share text/short links like:

```text
千万不要陪孩子写作业！ 真的不用陪孩子写作业，既解... http://xhslink.com/o/4ALz6kVmU1m 
把这段话复制下来，打开【小红书】查看。
```

The card should support the existing short-video workflow:

```text
XHS URL -> real metadata -> download video -> media manifest -> video to subtitles when audio exists
```

User-facing UI should align with video cards:

```text
下载视频 -> 视频转字幕 -> 阅读
```

## Research Findings

### yt-dlp support

The installed local tool supports Xiaohongshu:

```bash
yt-dlp --version
yt-dlp --list-extractors | rg -i "xiaohongshu|xhs|rednote"
```

Observed:

```text
2026.03.17
XiaoHongShu
```

Official `yt-dlp` supported sites list includes:

```text
XiaoHongShu: 小红书
```

Source: https://github.com/yt-dlp/yt-dlp/blob/master/supportedsites.md

### Provided URL parses successfully

Command:

```bash
yt-dlp --dump-json --skip-download 'https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=ABHCAnYqVSjMn7bympymavoiCpF6yYBbkWLE1mUCesu1A=&xsec_source=pc_share'
```

Observed key fields:

```json
{
  "id": "682eefa40000000003039a4b",
  "title": "千万不要陪孩子写作业！",
  "duration": 63.252,
  "ext": "mp4",
  "vcodec": "h264",
  "acodec": "aac",
  "filesize": 10122269,
  "extractor": "XiaoHongShu"
}
```

Direct media URL can be obtained by:

```bash
yt-dlp --simulate --get-url '<xhs-url>'
```

Observed one URL:

```text
http://sns-bak-v8.xhscdn.com/stream/79/110/258/01e82eed67792b904f03700196f758a778_258.mp4
```

### Mobile short link parses successfully through yt-dlp

Mobile share short link:

```text
http://xhslink.com/o/4ALz6kVmU1m
```

Note: plain `curl -I` returned 404 for this short link in one local check, but `yt-dlp` resolved it successfully. Do not implement short-link support by relying only on `HEAD`/`curl` redirects.

Command:

```bash
yt-dlp --skip-download --print '%(id)s|%(title)s|%(duration)s|%(webpage_url)s|%(original_url)s|%(extractor)s' 'http://xhslink.com/o/4ALz6kVmU1m'
```

Observed:

```text
682eefa40000000003039a4b|千万不要陪孩子写作业！|63.252|https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b?...|http://xhslink.com/o/4ALz6kVmU1m|XiaoHongShu
```

`yt-dlp --dump-json --skip-download` also returns the same canonical `id`, title, duration, thumbnail, and MP4 formats for the mobile short link.

### Current repo bug

Current adapter:

```text
packages/source-adapters/src/xiaohongshuAdapter.ts
```

only matches:

```ts
/\/explore\/([a-zA-Z0-9]+)/
```

It does not support:

```text
/discovery/item/{id}
```

When tested with the provided URL, the current source ID became invalid/noisy:

```text
xhs-682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=...&xsec_source=pc_share
```

Expected source ID:

```text
xhs-682eefa40000000003039a4b
```

## Reference and Decisions

Use:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`
- `docs/plans/2026-04-28-x-video-download-and-transcribe-ui.md`
- `docs/GOTCHAS.md`

Relevant local gotchas:

- `yt-dlp` formats and media manifests.
- `ffmpeg` audio extraction requires audio stream probing.
- media card actions should stay document-readiness oriented.

## Non-goals

- Do not bypass paywalls, private content, or authentication.
- Do not fake media download success if XHS blocks extraction.
- Do not use post description as transcript.
- Do not mark `markdown_ready` from metadata alone.
- Do not commit downloaded XHS video/audio/transcript files.
- Do not add a broad media control panel.

## Target Files

Likely:

- `packages/source-adapters/src/xiaohongshuAdapter.ts`
- `packages/application/src/downloadSourceMediaUseCase.ts`
- `packages/application/src/resolveSourceMediaUseCase.ts`
- `apps/web/src/components/TaskCard.tsx` only if XHS state is not already handled correctly
- `scripts/collect/collect-xiaohongshu-url.ts`
- `scripts/metadata/fetch-xiaohongshu-metadata.ts`
- `scripts/media/download-source-media.ts`

Expected report:

- `docs/plans/reports/2026-04-29-xiaohongshu-video-download-support-report.md`

## Required Implementation

### 1. URL parsing

Support at least:

```text
https://www.xiaohongshu.com/discovery/item/{id}
https://www.xiaohongshu.com/explore/{id}
http://xhslink.com/o/{token}
https://xhslink.com/o/{token}
```

Also handle query strings safely.

For mobile share text pasted as a full paragraph, extract the first Xiaohongshu URL from the text before capture:

```text
http://xhslink.com/o/4ALz6kVmU1m
```

If the input is not a bare URL, the collector/API should either:

- extract the first valid XHS URL and proceed, or
- return a clear validation error telling the user to paste the URL only.

Prefer extracting the first valid XHS URL because mobile share text commonly includes surrounding copy.

Source ID must be stable and path-safe:

```text
xhs-{id}
```

For the provided URL:

```text
xhs-682eefa40000000003039a4b
```

For the mobile short link, the expected canonical source ID is the same:

```text
xhs-682eefa40000000003039a4b
```

Do not use the short-link token as the source ID:

```text
xhs-4ALz6kVmU1m
```

The source record should preserve both:

- original pasted URL/text or original URL,
- canonical `webpage_url` from `yt-dlp` metadata.

### 2. Metadata capture

Use `yt-dlp --dump-json --skip-download` in the adapter or a precise metadata use case to persist real metadata when available:

- title,
- description,
- tags,
- uploader ID if available,
- thumbnail,
- duration,
- post ID,
- extractor name.

Do not store large raw JSON blobs in card-facing source records unless needed. Keep card payload compact.

### 3. Media download

Use the existing media flow:

```text
POST /api/tasks/:taskId/download-media
```

or script:

```bash
npx tsx scripts/media/download-source-media.ts xhs-682eefa40000000003039a4b
```

Persist:

```text
data/sources/xhs-682eefa40000000003039a4b/media.mp4
data/sources/xhs-682eefa40000000003039a4b/media-manifest.json
```

Manifest should include:

```json
{
  "sourceId": "xhs-682eefa40000000003039a4b",
  "status": "downloaded",
  "platform": "xiaohongshu",
  "mediaKind": "video",
  "sourceUrl": "<original-url>",
  "localPath": "data/sources/xhs-682eefa40000000003039a4b/media.mp4",
  "ext": "mp4",
  "byteSize": 10122269,
  "durationSeconds": 63.252,
  "hasAudio": true
}
```

Probe downloaded file with `ffprobe` and persist `hasAudio`.

### 4. UI behavior

Xiaohongshu cards should behave as short-video cards:

- no media -> primary `下载视频`;
- media downloaded with audio -> primary `视频转字幕`;
- media downloaded without audio -> show `无音轨，不能转字幕`;
- transcript/document ready -> primary `阅读`.

### 5. Failure behavior

If `yt-dlp` fails due to token/cookie/platform changes:

- persist `media-manifest.json` with `status: failed`;
- include stderr summary in `errorMessage`;
- show the backend diagnostic inline in the card;
- do not claim readiness.

## Verification Commands

Run:

```bash
npm run build
npm run typecheck
yt-dlp --version
yt-dlp --list-extractors | rg -i "xiaohongshu|xhs|rednote"
```

Capture:

```bash
npx tsx scripts/collect/collect-xiaohongshu-url.ts 'https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=ABHCAnYqVSjMn7bympymavoiCpF6yYBbkWLE1mUCesu1A=&xsec_source=pc_share'
npx tsx scripts/collect/collect-xiaohongshu-url.ts 'http://xhslink.com/o/4ALz6kVmU1m'
npx tsx scripts/collect/collect-xiaohongshu-url.ts '千万不要陪孩子写作业！ 真的不用陪孩子写作业，既解... http://xhslink.com/o/4ALz6kVmU1m 把这段话复制下来，打开【小红书】查看。'
```

Expected ID:

```text
xhs-682eefa40000000003039a4b
```

Metadata probe:

```bash
yt-dlp --skip-download --print '%(id)s|%(title)s|%(duration)s|%(ext)s|%(acodec)s|%(vcodec)s|%(filesize)s' '<xhs-url>'
yt-dlp --skip-download --print '%(id)s|%(title)s|%(duration)s|%(webpage_url)s|%(original_url)s|%(extractor)s' 'http://xhslink.com/o/4ALz6kVmU1m'
```

Expected:

```text
682eefa40000000003039a4b|千万不要陪孩子写作业！|63.252|mp4|aac|h264|10122269
```

Download:

```bash
npx tsx scripts/media/download-source-media.ts xhs-682eefa40000000003039a4b
find data/sources/xhs-682eefa40000000003039a4b -maxdepth 1 -type f -print | sort
cat data/sources/xhs-682eefa40000000003039a4b/media-manifest.json
ffprobe -v error -show_streams -of json data/sources/xhs-682eefa40000000003039a4b/media.mp4
```

Optional transcription after media download:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/xhs-682eefa40000000003039a4b/transcribe-media
```

## Acceptance Criteria

- Provided `/discovery/item/{id}` XHS URL captures as `xhs-682eefa40000000003039a4b`.
- Provided mobile short link `http://xhslink.com/o/4ALz6kVmU1m` captures as `xhs-682eefa40000000003039a4b`.
- Mobile share text containing the short link is either parsed successfully or rejected with a clear "paste URL only" error. Prefer successful extraction.
- Long PC share URL and mobile short link dedupe to the same canonical source ID.
- Source record uses real title, duration, thumbnail when available.
- Media download produces `media.mp4` under canonical source directory.
- `media-manifest.json` records `platform: xiaohongshu`, `status: downloaded`, and `hasAudio: true` for this URL.
- UI shows XHS card with `下载视频`, then `视频转字幕`, then `阅读` after successful transcription.
- Failed extraction/download is persisted and visible in UI.
- `npm run build` passes.
- `npm run typecheck` passes.
- Generated media/audio/transcript data is not committed.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-29-xiaohongshu-video-download-support-report.md
```

Report must include:

- changed files,
- exact XHS URL tested,
- both PC long link and mobile short link test results,
- exact yt-dlp version,
- metadata command output summary,
- source record excerpt,
- generated file list,
- media manifest,
- ffprobe audio/video evidence,
- UI state summary,
- build/typecheck results,
- unresolved risks.
