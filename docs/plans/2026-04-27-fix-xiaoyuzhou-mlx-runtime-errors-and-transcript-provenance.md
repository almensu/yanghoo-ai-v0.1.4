# Fix Xiaoyuzhou MLX Runtime Errors and Transcript Provenance

## Owner

Gemini implements. Codex reviews.

## Goal

Make Xiaoyuzhou audio transcription either work end-to-end with MLX Audio or fail with clear, actionable UI/API state. Also fix transcript provenance so MLX ASR output is never labeled as `platform_caption`.

Target source:

```text
xyz-69a64629de29766da93331ec
```

## Non-goals

- Do not fake ASR output.
- Do not use shownotes as transcript content.
- Do not mark readiness as `markdown_ready` unless ASR-generated Markdown exists.
- Do not add a broad media control panel.

## Findings to Fix

### 1. Provision working MLX runtime

Current failure:

```text
ModuleNotFoundError: No module named 'mlx'
```

Tasks:

- Install or configure the missing `mlx` core dependency in the active Python environment used by the app.
- Verify the actual command works:

```bash
python3 -c "import mlx.core; print('mlx.core ok')"
python3 -m mlx_audio.stt.generate --help
```

- Then run transcription using:

```text
mlx-community/whisper-large-v3-turbo-asr-fp16
```

If local hardware/Python version prevents MLX from working, persist a clear setup failure state and report exact blockers.

### 2. Surface backend error messages in frontend

Target files:

- `apps/web/src/api/client.ts`
- `apps/web/src/components/TaskCard.tsx`

Requirements:

- Parse JSON error responses from API.
- Show the backend `message` to the user.
- Prefer inline card error state over `alert()`.

Acceptance:

When MLX is unavailable, the card should show:

```text
Real transcription engine (mlx-audio) is not correctly installed or compatible with this environment.
```

not just:

```text
Failed to transcribe audio: 500
```

### 3. Fix transcript source provenance

Target file:

- `packages/application/src/index.ts`

Requirements:

- `transcribeAudioUseCase` must persist `sourceType: mlx_audio`.
- `ensureTranscriptUseCase` must not label Xiaoyuzhou MLX output as `platform_caption`.
- Prefer routing Xiaoyuzhou `ensureTranscriptUseCase` to the staged flow:

```text
fetch audio if missing -> transcribe audio if possible
```

or return a clear error instructing the user to use `Fetch Audio` / `Transcribe Audio`.

### 4. Remove shownotes-as-transcript semantics

Target files:

- `packages/source-adapters/src/xiaoyuzhouAdapter.ts`
- domain/storage files if adding chapter/notes fields
- API mapper if needed

Requirements:

- Do not put shownotes timestamp lines in `metadata.initialSegments`.
- Do not send huge shownotes HTML in `/api/tasks` list responses.
- If preserving shownotes, store them as notes/chapters/outline and keep them out of transcript readiness.

## Verification Commands

Gemini must run:

```bash
npm run build
npm run typecheck
python3 -c "import mlx.core; print('mlx.core ok')"
python3 -m mlx_audio.stt.generate --help
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/xyz-69a64629de29766da93331ec/transcribe-audio
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('xyz-69a64629de29766da93331ec'), null, 2)))"
curl -sS http://127.0.0.1:8001/api/tasks
curl -sS http://127.0.0.1:3000/api/tasks
```

If transcription succeeds, verify:

- `transcript-manifest.json` has `sourceType: mlx_audio`
- `model: mlx-community/whisper-large-v3-turbo-asr-fp16`
- `document.md` exists and is ASR-derived

If transcription cannot succeed, verify:

- no fake transcript/document assets are generated
- frontend displays the specific backend setup error
- readiness remains non-markdown-ready

## Expected Report

Write report to:

```text
docs/plans/reports/2026-04-27-fix-xiaoyuzhou-mlx-runtime-errors-and-transcript-provenance-report.md
```

Report must include:

- changed files
- MLX installation/provisioning result
- exact command output for `import mlx.core`
- exact `transcribe-audio` response
- readiness output
- whether ASR succeeded or failed
- UI error display behavior
- unresolved risks
