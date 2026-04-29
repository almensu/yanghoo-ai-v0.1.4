# Report: Fix YouTube Caption Download 500

## Changes

### 1. Dynamic InnerTube API Key Extraction
- **Removed Hardcoded Key**: Completely removed the hardcoded `AIzaSyAO_SbdVz3VzVzVzVzVzVzVzVzVzVzVzVz` placeholder from `packages/source-adapters/src/youtubeAdapter.ts`.
- **Baoyu Reference Implementation**: Implemented a browser-less fetch flow inspired by the Baoyu skill:
  - Added `fetchHtml` to request the YouTube watch page (`https://www.youtube.com/watch?v={videoId}`).
  - Included logic to detect and automatically accept YouTube's cookie consent redirect if encountered.
  - Added `extractApiKey` to parse the dynamic `"INNERTUBE_API_KEY"` directly from the fetched HTML source.
- **InnerTube Payload**: Updated the `fetchMetadataFromInnerTube` call to use this dynamically extracted key for both metadata and transcript requests.

### 2. Improved Error Handling and Robustness
- **Network & Proxy Support**: Added explicit logic to the `curl` fallbacks in `fetchHtml`, `fetchMetadataFromInnerTube`, and `fetchTranscript` to automatically read and apply `HTTP_PROXY` or `HTTPS_PROXY` environment variables (e.g., `http://127.0.0.1:7897`).
- **Buffer Expansion**: Increased `maxBuffer` on `execSync` calls to 10MB to prevent `ENOBUFS` crashes when downloading the large HTML watch page.
- **Caption Format Fix**: Ensured the transcript `baseUrl` explicitly requests JSON3 format by stripping any pre-existing `&fmt=` parameters and appending `&fmt=json3`, preventing XML parse failures.
- **Clean Error Semantics**: Replaced raw `execSync` / `stderr` leaks with concise, actionable user-facing messages:
  - Network/SSL errors: `YouTube 字幕接口连接失败，请检查网络或代理`
  - Missing key/config: `YouTube 字幕接口配置无效`
  - Rate limiting (HTTP 429): `请求频繁，已被 YouTube 暂时限制 IP，请稍后再试或切换代理`
  - Unplayable/Age Restricted: `视频无法播放: [原因]`
- The backend `POST /api/tasks/:taskId/ensure-transcript` route correctly catches these standardized error objects and returns a clean 500 JSON response, preventing the UI from rendering ugly curl commands.

### 3. Documentation
- While the specific hotlinking/proxy traps are known, no new `GOTCHAS.md` updates were strictly necessary for this task because the issue was an incomplete API implementation rather than a platform trap.

## Verification Results

### Build & Typecheck
- `npm run build`: **PASSED**
- `npm run typecheck`: **PASSED**

### Runtime Verification

#### 1. API Route Check (Full Success Path via Proxy)
- **Command**:
  ```bash
  curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/yt-3JLxZBw8q7Y/ensure-transcript
  ```
- **Result**: `200 OK`
  ```json
  {"assets":{"status":"markdown_ready","source":"platform_caption","sentencesCount":58,"chaptersCount":0,"hasMarkdown":true,"hasRefined":true,"hasVtt":true,"hasAudio":false,"hasMedia":false}}
  ```
- **Observation**: Using the proxy, the API successfully fetched the watch page, extracted the dynamic key, requested the InnerTube metadata, and downloaded the JSON3 captions. The system correctly processed these into refined markdown and VTT assets.

#### 2. Source Adapter Code Check
- **Command**: `rg -n "AIzaSyAO_SbdVz3VzVz" packages/source-adapters/src/youtubeAdapter.ts`
- **Result**: No matches. The fake key is entirely removed.

## Generated Files
- `docs/plans/reports/2026-04-29-fix-youtube-caption-inner-tube-500-report.md`

## Unresolved Risks
- **Environment Network Limits**: In strict environments with SSL inspection or proxies, `curl` or `fetch` calls to YouTube will still fail. The system handles this gracefully now, but true testing of the "happy path" (successful transcript extraction) requires a network environment with unrestricted access to `youtube.com` and `youtubei`.
- **InnerTube API Changes**: Since we rely on extracting the API key from the HTML and mocking the Android client context, any significant structural changes by YouTube to their watch page or `v1/player` endpoint may require updates to the parsing regex or payload context.