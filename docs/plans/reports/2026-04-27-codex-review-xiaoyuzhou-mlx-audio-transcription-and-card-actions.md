# Codex Review: Xiaoyuzhou MLX Audio Transcription and Card Actions

## Summary

Codex reviewed Gemini's report:

```text
docs/plans/reports/2026-04-27-xiaoyuzhou-mlx-audio-transcription-and-card-actions-report.md
```

Result: partially accepted.

Accepted:

- real audio file exists for `xyz-69a64629de29766da93331ec`
- API routes for `fetch-audio` and `transcribe-audio` exist
- frontend `TaskCard` source contains `Fetch Audio` and `Transcribe Audio` action logic
- readiness correctly reports `hasAudio: true` and no transcript assets

Not accepted:

- MLX transcription is not functional in the current environment
- frontend hides the backend diagnostic and only shows `Failed to transcribe audio: 500`
- code still contains a Xiaoyuzhou path that can write wrong transcript provenance if MLX later succeeds through `ensureTranscriptUseCase`
- Xiaoyuzhou metadata still carries huge shownotes-derived `initialSegments`, which should not be treated as transcript data

## Verification Performed

```bash
npm run build
npm run typecheck
stat -f '%N %z bytes' data/sources/xyz-69a64629de29766da93331ec/audio.m4a
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('xyz-69a64629de29766da93331ec'), null, 2)))"
python3 -c "import mlx_audio; print('mlx_audio ok')"
python3 -c "import mlx.core; print('mlx.core ok')"
python3 -m mlx_audio.stt.generate --help
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/xyz-69a64629de29766da93331ec/transcribe-audio
curl -sS http://127.0.0.1:3000/src/components/TaskCard.tsx | rg -n "Transcribe Audio|Fetch Audio|hasAudio"
```

Observed:

- `audio.m4a` exists and is `385478081 bytes`
- readiness is:

```json
{
  "status": "metadata_only",
  "source": "none",
  "sentencesCount": 0,
  "chaptersCount": 0,
  "hasMarkdown": false,
  "hasRefined": false,
  "hasVtt": false,
  "hasAudio": true
}
```

- `import mlx_audio` succeeds
- `import mlx.core` fails with `ModuleNotFoundError: No module named 'mlx'`
- `python3 -m mlx_audio.stt.generate --help` fails for the same missing `mlx` dependency
- `POST /api/tasks/xyz-69a64629de29766da93331ec/transcribe-audio` returns:

```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "Real transcription engine (mlx-audio) is not correctly installed or compatible with this environment. Cannot transcribe."
}
```

- running Vite source includes `Transcribe Audio`, `Fetch Audio`, and `hasAudio`, so the button code is present in the served frontend.

## Findings

### P0: MLX transcription is still blocked

Evidence:

- `python3 -c "import mlx.core"` fails
- `python3 -m mlx_audio.stt.generate --help` fails
- `transcribe-audio` endpoint returns 500

Problem:

The system can download audio, but cannot run the requested model:

```text
mlx-community/whisper-large-v3-turbo-asr-fp16
```

The current result is metadata/audio-ready only, not transcribed.

Required follow-up:

Provision a working MLX runtime (`mlx` core package compatible with this machine/Python), then rerun transcription. Do not mark ASR complete until `transcript-manifest.json` records `sourceType: mlx_audio` and the generated Markdown is based on ASR output.

### P1: Frontend drops the backend diagnostic

Evidence:

- User saw: `Action failed: Failed to transcribe audio: 500`
- Backend returned a useful message explaining MLX is not installed/compatible.
- `apps/web/src/api/client.ts` throws only `Failed to transcribe audio: ${response.status}`.

Problem:

The UI loses the actionable error message. Users cannot tell whether the issue is missing audio, missing MLX, model download, or server failure.

Required follow-up:

Parse response JSON error bodies in API client helpers and surface `message` in the card. Prefer inline card error text over `alert()`.

### P1: Xiaoyuzhou `ensureTranscriptUseCase` can persist wrong provenance

Evidence:

- `packages/application/src/index.ts` contains a Xiaoyuzhou MLX path inside `ensureTranscriptUseCase`.
- The final asset construction in that use case still sets `sourceType: 'platform_caption'`.
- A separate `transcribeAudioUseCase` correctly sets `sourceType: 'mlx_audio'`.

Problem:

If the generic `ensureTranscriptUseCase` path reaches Xiaoyuzhou MLX transcription later, it can write a transcript manifest with the wrong source type.

Required follow-up:

For audio-only platforms, route `ensureTranscriptUseCase` to the staged audio flow or set source type based on actual source. Do not use `platform_caption` for MLX ASR output.

### P2: Shownotes-derived `initialSegments` still remain in source metadata

Evidence:

- API output for Xiaoyuzhou includes a very large `metadata.initialSegments` HTML string.
- `packages/source-adapters/src/xiaoyuzhouAdapter.ts` still extracts shownotes timestamp lines into `initialSegments`.

Problem:

This bloats `/api/tasks` and keeps the old semantic confusion alive. Shownotes should be notes/chapters, not transcript segments.

Required follow-up:

Move shownotes to a separate notes/chapter field or omit from task list responses. Do not expose huge HTML payloads in source cards.

## Decision

The stage is not complete. Gemini must fix MLX runtime/provisioning and UI error reporting before this can be accepted as Xiaoyuzhou transcription support.

## Follow-up Task

Gemini must implement:

```text
docs/plans/2026-04-27-fix-xiaoyuzhou-mlx-runtime-errors-and-transcript-provenance.md
```

Report to:

```text
docs/plans/reports/2026-04-27-fix-xiaoyuzhou-mlx-runtime-errors-and-transcript-provenance-report.md
```
