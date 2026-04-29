# Verify MLX Audio End-to-End With Controlled Fixture

## Owner

Gemini implements verification and any strictly necessary minimal fix. Codex reviews.

## Goal

Close the remaining verification gap from:

```text
docs/plans/reports/2026-04-28-codex-audit-wire-local-mlx-audio-runtime-follow-up.md
```

Prove that the Xiaoyuzhou-style audio transcription path can run through the API with a real local audio input and persist transcript/document readiness derived from MLX ASR output.

This task is not complete until the report includes evidence from a successful `POST /api/tasks/:taskId/transcribe-audio` run or clearly identifies the real blocker that prevents success.

## Context

The previous follow-up accepted the runtime wiring fix:

- `MLX_AUDIO_PYTHON` is respected.
- The app uses the local CLI shape:

```bash
$MLX_AUDIO_PYTHON -m mlx_audio.stt.generate \
  --model mlx-community/whisper-large-v3-turbo-asr-fp16 \
  --audio <absolute-audio-path> \
  --output-path <absolute-json-output-base> \
  --format json
```

- The app reads `<absolute-json-output-base>.json`, matching the local `mlx-audio` behavior.

Remaining limitation:

- The checkout had no `data/` directory, source record, or audio asset, so only missing-data behavior was verified.

## Reference and Decisions

The reference repository under `/Volumes/2T/com/yanghoo205/yanghoo-reference` may still be unavailable. If it is mounted, consult the default test/verification guidance from:

- `reference/test-strategy.md`
- `reference/review-checklists/`
- `reference/Gotchas.md`

If the reference repository is unavailable, use this repo's accepted ADRs:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`

Relevant boundary rules:

- API route behavior belongs in `apps/api`.
- Use case orchestration belongs in `packages/application`.
- Storage persistence behavior belongs in `packages/storage`.
- Domain types and path contracts belong in `packages/domain`.
- Generated runtime data belongs under a local `DATA_DIR` or `data/`; do not commit real generated data.

## Non-goals

- Do not vendor `mlx-audio`.
- Do not copy code from the local MLX repository.
- Do not fake MLX JSON output and call it a successful ASR verification.
- Do not use Xiaoyuzhou shownotes as transcript text.
- Do not broaden product scope or rebuild a media control panel.
- Do not commit generated audio, transcript, Markdown, model cache files, or build info churn.

## Target Files

Primary expected file:

- `docs/plans/reports/2026-04-28-verify-mlx-audio-end-to-end-fixture-report.md`

Only if a real blocker is found, minimal source edits may touch:

- `packages/application/src/index.ts`
- `packages/storage/src/index.ts`
- `apps/api/src/routes/tasks.ts`

If a reusable verification helper is needed, prefer a script entry point with one action:

- `scripts/transcript/transcribe-audio-mlx.ts`

Do not add business logic to the script; it should orchestrate package/API behavior only.

## Required Verification Setup

Use an isolated local data root so this verification does not depend on or mutate the user's normal runtime data:

```bash
export DATA_DIR=/tmp/yanghoo-mlx-e2e-data
rm -rf "$DATA_DIR"
mkdir -p "$DATA_DIR/sources/fixture-mlx-audio-e2e"
```

Create a source record for a podcast-audio Xiaoyuzhou-style source:

```json
{
  "id": "fixture-mlx-audio-e2e",
  "sourceClass": "podcast_audio",
  "platform": "xiaoyuzhou",
  "url": "https://www.xiaoyuzhoufm.com/episode/fixture-mlx-audio-e2e",
  "title": "MLX Audio End-to-End Fixture",
  "author": "Yanghoo Test",
  "duration": 3,
  "capturedAt": "<current ISO timestamp>",
  "metadata": {
    "fixture": true
  }
}
```

Create or provide a very short real audio file at:

```text
$DATA_DIR/sources/fixture-mlx-audio-e2e/audio.wav
```

Preferred fixture properties:

- 2 to 5 seconds long.
- Contains audible spoken words, for example "hello yanghoo transcript test".
- Small enough to run quickly.
- Generated locally for this verification, not committed.

If `say` is available on macOS, one acceptable fixture method is:

```bash
say -o "$DATA_DIR/sources/fixture-mlx-audio-e2e/audio.aiff" "hello yanghoo transcript test"
```

Then convert to WAV if a local tool such as `ffmpeg` is available:

```bash
ffmpeg -y -i "$DATA_DIR/sources/fixture-mlx-audio-e2e/audio.aiff" "$DATA_DIR/sources/fixture-mlx-audio-e2e/audio.wav"
```

If `ffmpeg` is unavailable but MLX accepts the generated AIFF directly, use `audio.aiff` and record that decision in the report.

Create the audio manifest:

```json
{
  "sourceId": "fixture-mlx-audio-e2e",
  "status": "fetched",
  "localPath": "data/sources/fixture-mlx-audio-e2e/audio.wav",
  "url": "fixture://local-audio",
  "fetchedAt": "<current ISO timestamp>"
}
```

If the audio extension is not WAV, set `localPath` to the actual fixture file.

## Required API Verification

Use the known working MLX runtime:

```bash
export MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python
```

Verify the runtime:

```bash
$MLX_AUDIO_PYTHON -c "import sys; print(sys.executable); import mlx.core; print('mlx.core ok'); import mlx_audio; print('mlx_audio ok')"
$MLX_AUDIO_PYTHON -m mlx_audio.stt.generate --help
```

Start the API with both environment variables:

```bash
DATA_DIR=/tmp/yanghoo-mlx-e2e-data \
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
npm run dev -w apps/api
```

Then call:

```bash
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/fixture-mlx-audio-e2e/transcribe-audio
```

Verify persisted readiness:

```bash
DATA_DIR=/tmp/yanghoo-mlx-e2e-data \
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('fixture-mlx-audio-e2e'), null, 2)))"
```

Verify generated files:

```bash
find /tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e -maxdepth 1 -type f -print | sort
cat /tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/transcript-manifest.json
sed -n '1,80p' /tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/document.md
```

Expected successful readiness:

```json
{
  "status": "markdown_ready",
  "source": "mlx_audio",
  "hasMarkdown": true,
  "hasRefined": true,
  "hasVtt": true,
  "hasAudio": true
}
```

The exact `sentencesCount` may vary, but it must be greater than zero.

## Acceptance Criteria

- Build passes:

```bash
npm run build
```

- Typecheck passes:

```bash
npm run typecheck
```

- The API process uses:

```text
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python
DATA_DIR=/tmp/yanghoo-mlx-e2e-data
```

- The `transcribe-audio` endpoint returns success for `fixture-mlx-audio-e2e`.
- The generated MLX JSON output exists next to the fixture audio.
- `transcript-raw.json`, `transcript-sentences.json`, `transcript.vtt`, `transcript-manifest.json`, and `document.md` are generated.
- `transcript-manifest.json` records:

```json
{
  "sourceType": "mlx_audio",
  "engine": "mlx-audio",
  "model": "mlx-community/whisper-large-v3-turbo-asr-fp16"
}
```

- `document.md` is derived from ASR text, not shownotes or mock data.
- No generated fixture data is committed.

## Failure Handling

If the endpoint fails, the report must include:

- exact HTTP status and response body,
- API stderr/stdout summary,
- exact MLX command phase that failed,
- whether the MLX JSON file was generated,
- generated file list under the isolated `DATA_DIR`,
- the smallest proposed code fix or a clear external-runtime blocker.

Do not convert a failure into a fake success by writing transcript assets manually.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-28-verify-mlx-audio-end-to-end-fixture-report.md
```

Report must include:

- changed files,
- exact fixture creation commands,
- exact MLX Python executable,
- exact API start command,
- exact `curl` response,
- readiness JSON,
- generated file list,
- transcript manifest JSON,
- short excerpt or summary of `document.md`,
- build/typecheck results,
- unresolved risks.
