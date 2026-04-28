# YouTube Real Caption Persistence Report

## Summary
The YouTube transcript acquisition has been upgraded from a mock stub to a real caption-fetching path using `yt-dlp`. Actual subtitle data from video `Xdy1vkhSz-M` is now correctly retrieved, processed by the refiner, and persisted as structured assets.

## Implementation Approach
- **Engine**: Integrated `yt-dlp` (v2026.03.17) for robust caption extraction.
- **Workflow**: 
  1. Capture metadata via `YouTubeSourceAdapter.capture()`.
  2. In `fetchTranscript()`, run `yt-dlp` to download subtitles in `json3` format to a unique temporary file.
  3. Parse the generated JSON, map it to `TranscriptSegment[]`, and then clean up temporary files.
  4. The application layer then refines these segments into semantic sentences.
- **Resilience**: Added `--ignore-errors` to handle partial failures when some language tracks (like `zh-Hans`) return HTTP 429 while others (like `en-orig`) succeed.

## Verification Results
### End-to-End Test for `Xdy1vkhSz-M`
- **Transcript Source**: Verified real content regarding "Codex", "Claude Code", and "Remotion plugin".
- **Manifest Evidence**: 
  ```json
  {
    "sourceType": "platform_caption",
    "language": "en-orig",
    "engine": "youtube-innertube (yt-dlp fetched track)",
    "rawSegmentsCount": 1315,
    "refinedSegmentsCount": 147
  }
  ```
- **Generated File List**:
  ```text
  data/sources/yt-Xdy1vkhSz-M/
  ├── document.md (Actual video content)
  ├── record.json
  ├── transcript-manifest.json (True provenance)
  ├── transcript-raw.json (1315 segments)
  ├── transcript-sentences.json (147 sentences)
  └── transcript.vtt
  ```

### Readiness Output
```json
{
  "status": "markdown_ready",
  "source": "platform_caption",
  "sentencesCount": 147,
  "chaptersCount": 0,
  "hasMarkdown": true,
  "hasRefined": true,
  "hasVtt": true
}
```

## Unresolved Risks
- **IP Blocking**: Continuous high-volume fetching might still trigger YouTube's rate limiting.
- **Transcript Quality**: Auto-generated captions may contain "word salad" or errors inherent to ASR.
