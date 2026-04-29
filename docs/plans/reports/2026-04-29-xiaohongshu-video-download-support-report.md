# Report: Xiaohongshu Video Download Support

## Status
- **Date**: 2026-04-29
- **Owner**: Gemini
- **Acceptance**: Accepted

## Summary
Implemented reliable capture and download support for Xiaohongshu (XHS) videos. Updated the `XiaohongshuSourceAdapter` to support both `/explore/`, `/discovery/item/` long URLs, and `xhslink.com` short links. The adapter now robustly extracts the first XHS URL from any input text (such as mobile share snippets) and uses `yt-dlp` to resolve the canonical post ID. PC long links and mobile short links for the same post now deduplicate to a consistent `xhs-{id}` source ID. Integrated XHS into the existing short-video workflow. Added `--proxy ""` to all `yt-dlp` calls for better environment compatibility.

## Changed Files
- `packages/source-adapters/src/xiaohongshuAdapter.ts`: Implemented URL extraction from text, short link support, and canonical ID deduplication.
- `packages/application/src/index.ts`: Updated `captureSourceUseCase` to recognize `xhslink.com` and handle mixed-text inputs.
- (Other files as previously reported with `--proxy ""` and YouTube metadata updates)

## Verification Results

### 1. Mobile Share Snippet Support
**Input Text**: `78 千万不要陪孩子写作业！  http://xhslink.com/o/4ALz6kVmU1m ，复制本条信息，打开【小红书】App查看精彩内容！`
**Extracted URL**: `http://xhslink.com/o/4ALz6kVmU1m`
**Canonical ID Resolution**: `yt-dlp` resolved to `682eefa40000000003039a4b`.
**Result Source ID**: `xhs-682eefa40000000003039a4b`

### 2. PC Long Link Support
**Input URL**: `https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b`
**Result Source ID**: `xhs-682eefa40000000003039a4b`

### 3. Deduplication Verified
Both the mobile snippet and the PC link correctly mapped to the same ID, ensuring no duplicate source records are created for the same content.

### 3. Media Download
**Command**: `npx tsx scripts/media/download-source-media.ts xhs-682eefa40000000003039a4b`
**Result**: **Success**.
```json
{
  "sourceId": "xhs-682eefa40000000003039a4b",
  "status": "downloaded",
  "platform": "xiaohongshu",
  "mediaKind": "video",
  "localPath": "data/sources/xhs-682eefa40000000003039a4b/media.mp4",
  "ext": "mp4",
  "byteSize": 10122269,
  "hasAudio": true
}
```

### 4. Audio Extraction
**Command**: `npx tsx scripts/media/extract-source-audio.ts xhs-682eefa40000000003039a4b`
**Result**: **Success**. Extracted `audio.wav` (2.0MB).

### 5. UI State
- Initial: Card shows `下载视频` as primary action.
- After Download: Card shows `视频转字幕` as primary action (due to `hasAudio: true`).
- After Transcription: Card shows `阅读` as primary action.

### 6. Build & Typecheck
```bash
npm run build && npm run typecheck
```
**Result**: Pass.

## Unresolved Risks
- **XHS Anti-scraping**: XHS may update its site structure or require cookies for certain items. The `--proxy ""` flag helped in the current environment but might need adjustment for users with different network setups.
- **Author Metadata**: `yt-dlp` currently returns `uploader_id` but not always a friendly `uploader` name for XHS without cookies.
