# Report: Support Short Links and Apple Podcast URLs

## Changes

### 1. URL Extraction
- **File**: `packages/application/src/extractSupportedSourceUrl.ts`
- Updated `SUPPORTED_PATTERNS` regex to correctly extract URLs from raw text/share text by ignoring trailing punctuation `[^\s，,。！!）)]+`.
- **Supported Cases Added**:
  - Xiaohongshu: `http://xhslink.com/o/{token}`
  - Douyin: `https://v.douyin.com/{token}/`, `https://www.iesdouyin.com/share/video/{id}`
  - Apple Podcasts: `https://podcasts.apple.com/{country}/podcast/{slug}/id{showId}?i={episodeId}`

### 2. Xiaohongshu Adapter (`xiaohongshuAdapter.ts`)
- Configured adapter to use `yt-dlp --dump-json` to resolve the canonical ID from short links like `xhslink.com`.
- Binds to `xhs-{canonicalId}` avoiding duplicate tokens.

### 3. Douyin Adapter (`douyinAdapter.ts`)
- Added robust error handling: if `yt-dlp` fails to resolve the canonical ID from a short link (e.g., due to cookie/mobile header restrictions), it now explicitly throws `Douyin metadata capture failed (likely needs cookies or mobile headers): {stderr}` instead of creating a ghost card.
- Deduplicates using the true video ID.

### 4. Apple Podcast Adapter (`applePodcastAdapter.ts`)
- Created a concrete `applePodcastSourceAdapter` for `sourceClass: podcast_audio` and `platform: apple_podcast`.
- Generates canonical IDs using `apple-podcast-{episodeId}` based on the `?i=` query parameter.
- **iTunes API Integration**: Refactored to query the iTunes Search API (`https://itunes.apple.com/lookup?id={showId}&entity=podcastEpisode`) to reliably extract episode-level metadata.
- Successfully resolves the true episode `title`, `duration`, `thumbnailUrl`, and the direct MP3 `mediaUrl`.
- Falls back to HTML `og:` tag scraping only if the API fails or the episode is not found in the results.
- Exposed in `packages/source-adapters/src/index.ts` and wired into `captureSourceUseCase` in `packages/application/src/index.ts`.

### 5. Collect Script
- Created `scripts/collect/collect-apple-podcast-url.ts` to allow testing via CLI.

## Verification Results

### Build & Typecheck
- `npm run build`: **PASSED**
- `npm run typecheck`: **PASSED**

### Runtime Verification & Generated Source IDs

#### Xiaohongshu Short Link
- **Command**: `HTTPS_PROXY=... npx tsx scripts/collect/collect-xiaohongshu-url.ts 'http://xhslink.com/o/4ALz6kVmU1m'`
- **Generated ID**: `xhs-682eefa40000000003039a4b` (Successfully resolved from `yt-dlp`)
- **Status**: Media download readiness handled correctly via short video pipeline.

#### Douyin Short Link (Error Exposure)
- **Command**: `HTTPS_PROXY=... npx tsx scripts/collect/collect-douyin-url.ts 'https://v.douyin.com/lA8EkVfCRAw/'`
- **Result**: Successfully caught and surfaced the `yt-dlp` error: `Douyin metadata capture failed (likely needs cookies or mobile headers): WARNING: [Douyin] 7634058868200410383: Fresh cookies (not necessarily logged in) are needed`.
- **Status**: Ghost card creation prevented.

#### Apple Podcasts
- **Command**: `HTTPS_PROXY=... npx tsx scripts/collect/collect-apple-podcast-url.ts 'https://podcasts.apple.com/us/podcast/blackjack/id201671138?i=1000551710062'`
- **Generated ID**: `apple-podcast-1000551710062`
- **Excerpt (`data/sources/apple-podcast-1000551710062/record.json`)**:
  ```json
  {
    "id": "apple-podcast-1000551710062",
    "sourceClass": "podcast_audio",
    "platform": "apple_podcast",
    "url": "https://podcasts.apple.com/us/podcast/blackjack/id201671138?i=1000551710062",
    "title": "Blackjack",
    "author": "Unknown Podcast",
    "thumbnailUrl": "https://is1-ssl.mzstatic.com/image/thumb/.../600x600bb.jpg",
    "duration": 3876,
    "canonicalId": "1000551710062",
    "metadata": {
      "showId": "201671138",
      "episodeId": "1000551710062",
      "mediaUrl": "https://pfx.vpixl.com/6qj4J/dts.podtrac.com/redirect.mp/pdst.fm/e/prefix.up.audio/s/npr.simplecastaudio.com/.../default.mp3"
    }
  }
  ```
- **Status**: Audio download readiness handled correctly via podcast audio pipeline. The `mediaUrl` was successfully resolved using the iTunes Search API, allowing the "Fetch Audio" action to download the MP3 directly.

## Unresolved Risks
- **Douyin Short Links**: `yt-dlp` currently fails on Douyin short links in this environment because it strictly requires fresh cookies or mobile headers (`Fresh cookies... are needed`). The adapter correctly handles this by failing the task cleanly, but operators must provide cookies to `yt-dlp` if they want Douyin imports to succeed.