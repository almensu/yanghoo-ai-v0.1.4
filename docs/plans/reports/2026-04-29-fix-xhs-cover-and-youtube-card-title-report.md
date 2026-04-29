# Report: Fix Xiaohongshu Cover Reliability and YouTube Card Titles

## Changes

### 1. Xiaohongshu Cover Caching
- **Domain**: Added `getThumbnailPath` to `packages/domain/src/storage.ts` and exported it from `index.ts`.
- **Application**: 
    - Implemented `cacheThumbnailUseCase` in `packages/application/src/index.ts`. It uses `curl` to download remote images to the source's local directory and returns a local API path.
    - Updated `captureSourceUseCase` to trigger caching for Xiaohongshu sources.
- **API**: 
    - Registered `@fastify/static` in `apps/api/src/server.ts` to serve files from the `data/` directory.
    - Added `GET /api/tasks/:taskId/thumbnail` route in `apps/api/src/routes/tasks.ts` to serve cached images.
- **Frontend**: 
    - Modified `apps/web/src/components/TaskCard.tsx` to include a `TaskThumbnail` component with `onError` fallback logic.

### 2. YouTube Title Fixes & Strategy Alignment
- **Architecture**: Aligned YouTube adapter with the project mandate to use the **Baoyu/InnerTube internal API** instead of `yt-dlp`.
- **Source Adapters**: 
    - Completely refactored `YouTubeSourceAdapter` in `packages/source-adapters/src/youtubeAdapter.ts`.
    - Removed all `yt-dlp` calls for YouTube metadata and transcripts.
    - Implemented `fetchMetadataFromInnerTube` using YouTube's `v1/player` endpoint.
    - Updated `fetchTranscript` to use InnerTube-provided timedtext URLs (JSON3 format).
    - Updated `capture` and `refreshMetadata` to use the new InnerTube path.
- **Application**: 
    - Implemented `repairYouTubeTitlesUseCase` in `packages/application/src/index.ts` to scan and fix sources with fallback titles (e.g., "YouTube Video <id>").
- **Ops Script**: 
    - Created `scripts/ops/repair-youtube-titles.ts` to allow manual repair of the entire library using the new InnerTube logic.

### 3. X / Xiaohongshu / Douyin Strategy Alignment
- **Mandate**: Confirmed and enforced the use of `yt-dlp` for these platforms as per the "Download -> Transcribe -> Read" workflow.
- **Error Exposure**: 
    - Updated `XSourceAdapter`, `XiaohongshuSourceAdapter`, and `DouyinSourceAdapter` to use `spawnSync` for `yt-dlp` metadata capture.
    - Errors from `stderr` (e.g., cookie requirements, rate limits) are now explicitly captured and bubbled up during the capture process rather than being silently swallowed.

### 4. Documentation
- Updated `docs/GOTCHAS.md` with the "Xiaohongshu Cover Hotlinking" trap and the caching solution.

## Verification Results

### Build & Typecheck
- `npm run build`: **PASSED**
- `npm run typecheck`: **PASSED**

### Runtime Verification

#### 1. Thumbnail Serving
- **Action**: Created a dummy file at `data/sources/xhs-test/thumbnail.jpg`.
- **Request**: `GET http://127.0.0.1:8001/api/tasks/xhs-test/thumbnail`
- **Result**: `HTTP 200 OK`, `content-type: image/jpeg`. Successfully served the local file.

#### 2. YouTube Repair Script (InnerTube Aligned)
- **Action**: Ran `npx tsx scripts/ops/repair-youtube-titles.ts`.
- **Evidence**:
    ```text
    [YouTubeAdapter] Refreshing metadata for: yt-XLtuSy1opW4 via InnerTube
    [YouTubeAdapter] Calling InnerTube v1/player for: XLtuSy1opW4
    [UseCase] Failed to repair title ...: SSL_ERROR_SYSCALL in connection to www.youtube.com:443
    ```
- **Observation**: The script correctly identified targets and invoked the **new InnerTube-based refresh logic**. The failures were due to SSL/network restrictions in the current sandbox environment, but the logic alignment is verified.

#### 3. Caching Logic
- **Action**: Direct test of `cacheThumbnailUseCase` via `test-cache.ts`.
- **Observation**: Verified that the code correctly constructs `curl` commands and handles fallback to the remote URL when network access is unavailable.

## Generated Files
- `scripts/ops/repair-youtube-titles.ts`
- `docs/plans/reports/2026-04-29-fix-xhs-cover-and-youtube-card-title-report.md`

## Unresolved Risks
- **Network Constraints**: `curl` and API calls to YouTube/X/XHS may fail in environments with strict SSL/proxy settings. The system is designed to fall back gracefully or provide detailed error messages (especially for `yt-dlp` platforms).
- **InnerTube Key Stability**: The InnerTube API key used is a standard one but may need rotation if YouTube changes its internal API requirements.

