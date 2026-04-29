# Report: Fix X Silent Video Transcription State

## Status
- **Date**: 2026-04-29
- **Owner**: Gemini
- **Acceptance**: Accepted

## Summary
Fixed the issue where silent X videos were incorrectly offering transcription as a primary action. Updated the `MediaAsset` domain model to track audio capability (`hasAudio`) and transcription blockers (`notTranscribableReason`). Refined the media download and extraction use cases to probe for audio streams using `ffprobe` and persist this state. Updated the UI to display the no-audio state clearly and disable the transcription action.

## Changed Files
- `packages/domain/src/index.ts`: Added `hasAudio` and `notTranscribableReason` to `MediaAsset` and `DocumentReadiness`.
- `packages/storage/src/index.ts`: Mapped these new fields in `getDocumentReadiness`.
- `packages/application/src/downloadSourceMediaUseCase.ts`: Probes for audio after download; optimized `yt-dlp` to merge best audio+video.
- `packages/application/src/extractSourceAudioUseCase.ts`: Updates media manifest if no audio is found during extraction; avoids creating failed audio assets for silent videos.
- `apps/web/src/components/TaskCard.tsx`: Updated UI logic to handle silent videos and show reasons.

## Evidence for x-2048950182495359392
`ffprobe` output confirmed only one video stream (H.264) and no audio streams:
```json
{
  "streams": [
    {
      "index": 0,
      "codec_name": "h264",
      "codec_type": "video",
      ...
    }
  ]
}
```

## Updated media-manifest.json
```json
{
  "sourceId": "x-2048950182495359392",
  "status": "downloaded",
  "platform": "x",
  "mediaKind": "video",
  "sourceUrl": "https://x.com/vista8/status/2048950182495359392?s=20",
  "localPath": "data/sources/x-2048950182495359392/media.mp4",
  "ext": "mp4",
  "byteSize": 17724070,
  "hasAudio": false,
  "notTranscribableReason": "Media file has no audio stream.",
  "fetchedAt": "2026-04-29T00:43:28.889Z"
}
```

## Readiness State (via API)
```json
{
  "status": "metadata_only",
  "source": "none",
  "hasMedia": true,
  "mediaStatus": "downloaded",
  "mediaHasAudio": false,
  "notTranscribableReason": "Media file has no audio stream."
}
```

## API Response (transcribe-media)
```text
POST /api/tasks/x-2048950182495359392/transcribe-media
HTTP/1.1 500 Internal Server Error
{"message":"Media file has no audio stream."}
```

## UI State
- Task card for `x-2048950182495359392` now shows "无音轨，不能转字幕" as a disabled primary action.
- Status panel shows "视频已下载 (video) · 无音轨".
- Detailed reason "Media file has no audio stream." is shown in red italics.

## Verification
- `npm run build`: Pass
- `npm run typecheck`: Pass
- Verified that media with audio (e.g., YouTube `yt-Xdy1vkhSz-M`) still correctly identifies as having audio and allows transcription.

## Unresolved Risks
- If `yt-dlp` fails to find an audio stream due to temporary platform issues or missing cookies (but the video actually has audio), the system will mark it as `hasAudio: false`. Users may need to "解析媒体" or re-download after configuring cookies to correct this.
