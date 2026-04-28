# Transcript Studio Greenfield Plan

## Goal

Build a clean transcript-first workbench. A user imports a video URL or local media file, the system finds the best transcript source, refines it into sentence-level assets, and presents a readable timestamped document.

## Pipeline

```text
ingest source
-> fetch metadata
-> ensure transcript
-> refine sentence timestamps
-> generate markdown and vtt
-> read and manage document assets
```

## Transcript Source Priority

1. Baoyu/YouTube InnerTube transcript.
2. Existing VTT/SRT subtitles.
3. `mlx-audio` local transcription.
4. Manual subtitle upload.

## MVP

- Import YouTube URL.
- Fetch metadata and thumbnail.
- Fetch transcript if available.
- Fall back to `mlx-audio` when no subtitle exists.
- Generate `transcript-raw.json`, `transcript-sentences.json`, `transcript.md`, and `transcript.vtt`.
- Show document-first task cards.
- Open a reader with timestamp jump support.

## Deferred

- AI chat.
- Keyframes.
- ASS subtitle styling.
- Multi-engine transcription UI.
- Complex table operations.
