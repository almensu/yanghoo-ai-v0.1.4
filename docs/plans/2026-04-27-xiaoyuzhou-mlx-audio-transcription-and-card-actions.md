# Xiaoyuzhou MLX Audio Transcription and Card Actions

## Owner

Gemini implements. Codex reviews.

## Goal

For Xiaoyuzhou episode:

```text
https://www.xiaoyuzhoufm.com/episode/69a64629de29766da93331ec
```

download the real episode audio, transcribe it with MLX Audio using:

```text
mlx-community/whisper-large-v3-turbo-asr-fp16
```

and make the homepage card expose clear actions for audio acquisition and transcription.

Expected source ID:

```text
xyz-69a64629de29766da93331ec
```

## Non-goals

- Do not use shownotes as transcript content.
- Do not generate fake `document.md` if ASR fails.
- Do not hard-code behavior for only this one episode.
- Do not introduce a broad media control panel. Keep actions document-readiness oriented.
- Do not commit downloaded audio or real generated media/transcript data unless repository policy explicitly allows it.

## Design Direction

### Recommended Approach

Use a staged asset workflow:

```text
capture metadata -> download audio -> transcribe audio -> refine transcript -> generate document
```

This keeps long-running work explicit and gives the homepage meaningful actions without exposing every internal script.

Alternative approaches considered:

- Single `Ensure Transcript` action only: simpler UI, but hides expensive audio download/transcription work and makes errors opaque.
- Full pipeline dashboard: too close to the old v0.2.0 media control panel and conflicts with the transcript-first direction.

Recommendation: keep `Ensure Transcript` as the primary action, but for audio-only sources expose secondary card actions: `Fetch Audio` and `Transcribe Audio`.

## Requirements

### 1. Correct asset semantics

Shownotes must not be persisted as `platform_caption` transcript assets.

Model shownotes separately as one of:

- `chapters`
- `sourceNotes`
- `episodeOutline`
- `document sections`

Acceptance:

- If only shownotes exist, readiness must not be `markdown_ready` for transcript.
- Shownotes may render in the reader as notes/chapters, but not as ASR transcript.

### 2. Audio acquisition

Implement a Xiaoyuzhou audio acquisition path:

- read real audio URL from captured metadata
- download audio into canonical source directory
- preserve original extension when possible
- write an audio asset manifest with URL, local path, byte size if known, and fetched timestamp

Suggested path contract:

```text
data/sources/{sourceId}/audio.{ext}
data/sources/{sourceId}/audio-manifest.json
```

Do not use app-local `apps/api/data`.

### 3. MLX Audio integration

Provision and verify `mlx-audio`.

Official references currently show these possible STT paths:

```bash
pip install mlx-audio
python -m mlx_audio.stt.generate --model mlx-community/whisper-large-v3-turbo-asr-fp16 --audio "audio.wav"
```

and API mode:

```bash
mlx_audio.server --host 0.0.0.0 --port 8000
curl -X POST http://localhost:8000/v1/audio/transcriptions \
  -F "file=@audio.wav" \
  -F "model=mlx-community/whisper-large-v3-turbo-asr-fp16"
```

Gemini must verify which command works in the local environment and implement that path. If both are available, prefer a direct CLI/subprocess call for the first version.

### 4. Transcription output contract

Convert MLX transcription output into existing `TranscriptSegment[]`:

```ts
{
  start: number;
  end: number;
  text: string;
}
```

Persist:

```text
transcript-raw.json
transcript-sentences.json
transcript.vtt
document.md
transcript-manifest.json
```

Manifest must include:

- `sourceType: mlx_audio`
- `engine: mlx-audio`
- `model: mlx-community/whisper-large-v3-turbo-asr-fp16`
- source audio path
- raw segment count
- refined segment count
- generated timestamp

### 5. API actions

Add explicit API endpoints for source-level actions:

```text
POST /api/tasks/:taskId/fetch-audio
POST /api/tasks/:taskId/transcribe-audio
```

These should be application use cases, not direct route logic.

Expected route behavior:

- `fetch-audio`: returns updated audio/readiness state
- `transcribe-audio`: requires audio asset, runs MLX ASR, returns updated document readiness
- clear error if source has no audio URL
- clear error if `mlx-audio` is unavailable

### 6. Card UX

For Xiaoyuzhou/podcast cards, add concise actions:

- Primary: `Read Transcript` when `markdown_ready`
- Primary: `Transcribe Audio` when audio exists but transcript does not
- Primary: `Fetch Audio` when audio does not exist but `mediaUrl` exists
- Secondary menu: re-fetch audio, re-transcribe, inspect metadata

Card should also show compact state:

- metadata captured
- audio fetched / missing
- ASR model when transcript exists
- sentence count
- duration

Do not turn the card into a low-level media control panel.

### 7. Suggested Optimizations

Implement only if low risk in this stage, otherwise list as follow-ups:

- progress state for long transcription: queued/running/done/failed
- resumable audio download or skip if file already exists
- audio file size/duration display
- transcript quality warning when segments are missing timestamps
- language selection or auto-detect display
- re-transcribe with model selector later, behind a menu
- split long podcast transcription into chunks if MLX/Whisper cannot process the full file reliably
- cache model availability and show setup error in UI
- delete/retry failed asset action in a menu, not on primary card

## Verification Commands

Gemini must run:

```bash
npm run build
npm run typecheck
which mlx_audio.stt || true
which mlx_audio.transcribe || true
which mlx-audio || true
python -m mlx_audio.stt.generate --help || true
npx tsx scripts/collect/collect-xiaoyuzhou-url.ts 'https://www.xiaoyuzhoufm.com/episode/69a64629de29766da93331ec'
```

Then run the implemented audio/transcription commands or API endpoints, for example:

```bash
curl -X POST http://127.0.0.1:8001/api/tasks/xyz-69a64629de29766da93331ec/fetch-audio
curl -X POST http://127.0.0.1:8001/api/tasks/xyz-69a64629de29766da93331ec/transcribe-audio
```

Finally verify readiness:

```bash
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('xyz-69a64629de29766da93331ec'), null, 2)))"
curl -sS http://127.0.0.1:8001/api/tasks
curl -sS http://127.0.0.1:3000/api/tasks
```

## Acceptance Criteria

- Xiaoyuzhou shownotes are no longer represented as transcript source `platform_caption`.
- Real audio file is downloaded to the canonical source directory.
- MLX Audio transcribes the downloaded episode audio using `mlx-community/whisper-large-v3-turbo-asr-fp16`.
- Generated Markdown is based on ASR output, not shownotes.
- `transcript-manifest.json` records `sourceType: mlx_audio`, model, engine, and segment counts.
- Homepage card shows correct staged actions for Xiaoyuzhou.
- If `mlx-audio` is unavailable, UI/API shows a clear setup error and does not fake success.
- API and Vite proxy return the same canonical readiness.

## Expected Report

Write report to:

```text
docs/plans/reports/2026-04-27-xiaoyuzhou-mlx-audio-transcription-and-card-actions-report.md
```

Report must include:

- changed files
- installed/verified `mlx-audio` command shape
- audio download path and manifest excerpt
- ASR command/API invocation
- generated file list
- readiness output
- homepage/API visibility result
- unresolved risks, especially duration/chunking/model download time
