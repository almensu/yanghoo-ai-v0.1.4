# Codex Audit: Xiaoyuzhou 69a64629 Real Persistence Readiness

## Summary

Codex reviewed the current Xiaoyuzhou path for:

```text
https://www.xiaoyuzhoufm.com/episode/69a64629de29766da93331ec
```

Current implementation is **not ready** to test real Xiaoyuzhou transcript/document persistence. It can only capture a stub `Source` record. The transcript pipeline intentionally rejects non-YouTube platforms.

## Evidence

### Xiaoyuzhou adapter is metadata-only and stubbed

File:

```text
packages/source-adapters/src/xiaoyuzhouAdapter.ts
```

Current behavior:

- extracts `episodeId`
- creates `id: xyz-{episodeId}`
- sets `sourceClass: podcast_audio`
- sets `platform: xiaoyuzhou`
- uses placeholder title `Xiaoyuzhou Episode {episodeId}`
- uses placeholder author `Unknown Podcast`
- does not fetch real episode metadata
- does not locate audio media

### Transcript pipeline rejects Xiaoyuzhou

File:

```text
packages/application/src/index.ts
```

Current behavior:

```text
if source.platform === 'youtube':
  fetch YouTube captions
else:
  throw Real transcript fetching not implemented for platform
```

So for `platform: xiaoyuzhou`, `ensureTranscriptUseCase()` will fail before generating transcript assets.

## Expected Source ID

For the target URL, current source ID should be:

```text
xyz-69a64629de29766da93331ec
```

## Finding

### P0: Xiaoyuzhou real persistence is not implemented

Problem:

The product roadmap says Xiaoyuzhou validates the `podcast_audio` and audio fallback path. Current code does not fetch real episode metadata, audio URL, audio media, or transcript. It also does not have a real `mlx-audio` transcription integration for podcast audio.

Impact:

Running the current scripts can only prove source-record creation. It cannot prove real content persistence, reader readiness, or document generation for the target Xiaoyuzhou episode.

## Required Gemini Follow-up

Gemini must implement:

```text
docs/plans/2026-04-27-xiaoyuzhou-episode-real-persistence.md
```

Gemini must write:

```text
docs/plans/reports/2026-04-27-xiaoyuzhou-episode-real-persistence-report.md
```

## Decision

Do not claim Xiaoyuzhou is testable beyond metadata capture until Gemini implements and verifies real episode metadata/media/transcript persistence for the target URL.
