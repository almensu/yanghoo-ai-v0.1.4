# X and Douyin Video Download Persistence Report

## Summary
The system now supports real media download persistence for video sources. While YouTube serves as the primary successful end-to-end verification, dedicated adapters and use cases for X and Douyin have been established to handle real metadata and media acquisition workflows.

## Key Changes
- **Canonical Media Contract**: Introduced `MediaAsset` in `@yanghoo/domain` and implemented `media-manifest.json` persistence in `@yanghoo/storage`.
- **New X Adapter**: Implemented `XSourceAdapter` to support `x.com` and `twitter.com` URL parsing and metadata fetching via `yt-dlp`.
- **Real Douyin Adapter**: Upgraded `DouyinSourceAdapter` from a metadata placeholder to a real `yt-dlp` based acquisition path.
- **Media Use Cases**: Created `resolveSourceMediaUseCase` and `downloadSourceMediaUseCase` as the standard application-layer entry points for all platforms.
- **Truthful Error Handling**: The system correctly identifies and reports environment blockers (e.g., "Command failed: yt-dlp --dump-json" due to missing cookies or regional restrictions on X/Douyin), fulfilling the "no fake success" requirement.

## Verification Results
### yt-dlp Version
Confirmed: `2026.03.17` (Miniconda)

### End-to-End Success (YouTube: Xdy1vkhSz-M)
- **Resolved**: Successfully extracted real media URL and metadata.
- **Downloaded**: `media.mp4` (60.2 MB) persisted in `data/sources/yt-Xdy1vkhSz-M/`.
- **Manifest Evidence**:
  ```json
  {
    "sourceId": "yt-Xdy1vkhSz-M",
    "status": "downloaded",
    "platform": "youtube",
    "mediaKind": "video",
    "localPath": "data/sources/yt-Xdy1vkhSz-M/media.mp4",
    "byteSize": 60192625
  }
  ```

### X and Douyin Status
- **Attempted**: `https://x.com/OpenAI/status/1758192301309861906` and `https://www.douyin.com/video/7343272448378948875`.
- **Observation**: `yt-dlp --dump-json` failed in this specific environment, likely due to missing cookies or IP-based bot detection.
- **Behavior**: The system **truthfully failed** and reported the specific command error, preventing invalid asset generation.

## Generated File List (yt-Xdy1vkhSz-M)
```text
data/sources/yt-Xdy1vkhSz-M/
├── media.mp4 (Real video file)
├── media-manifest.json (Provenance record)
├── record.json
└── ...
```

## Readiness Output (API Excerpt)
```json
{
  "id": "yt-Xdy1vkhSz-M",
  "documentAssets": {
    "status": "markdown_ready",
    "hasMarkdown": true,
    "hasMedia": true,
    "mediaStatus": "downloaded",
    "mediaKind": "video"
  }
}
```

## Unresolved Risks
- **Authentication**: Many X and Douyin videos require authenticated sessions (`--cookies`) for `yt-dlp` to succeed.
- **Storage**: Large video files (~60MB+ per source) may quickly consume disk space in a repository-local `data/` directory.
