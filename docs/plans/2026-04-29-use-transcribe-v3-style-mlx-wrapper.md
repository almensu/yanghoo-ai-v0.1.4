# Rewrite Project-Native MLX Transcription Script

## Owner

Gemini implements. Codex reviews.

## Goal

Fix MLX transcription failures where the API falls back to the wrong Python executable:

```text
Attempted executable: python3
ModuleNotFoundError: No module named 'mlx_audio'
```

Also replace the fragile `python -m mlx_audio.stt.generate` CLI integration with a project-native, parameterized Python script owned by this repo.

The external script at `/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/transcribe_v3.py` is only evidence that the local MLX API works. Gemini must not import it, shell out to it, depend on its path, copy it wholesale, or require it at runtime. Re-implement the needed transcription behavior as a Yanghoo script with this project's input/output contract.

The application should continue to persist the existing Yanghoo assets:

```text
transcript-raw.json
transcript-sentences.json
transcript.vtt
transcript-manifest.json
document.md
```

## Immediate Environment Fact

Codex verified the working runtime:

```bash
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python -c "import sys; print(sys.executable); import mlx.core; print('mlx.core ok'); import mlx_audio; print('mlx_audio ok'); from mlx_audio.stt.generate import generate_transcription; print('generate_transcription ok')"
```

Observed:

```text
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python
mlx.core ok
mlx_audio ok
generate_transcription ok
```

The failing API process used:

```text
python3
```

That executable does not have `mlx_audio`.

## Required Rewrite

Write a new Yanghoo transcription script inside this repository.

The script may use the installed MLX package API:

```py
from mlx_audio.stt.generate import generate_transcription
```

but it must not use or reference:

```text
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/transcribe_v3.py
```

Runtime dependency must be:

```text
MLX_AUDIO_PYTHON + installed mlx_audio package
```

not any local lab script file.

The new script should implement only this project's needs:

- accept audio/model/output arguments;
- call MLX Audio;
- normalize segment output into JSON;
- emit clear stderr diagnostics;
- leave VTT/Markdown/document persistence to the Node application.

## Reference and Decisions

Use:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`
- `docs/plans/2026-04-28-wire-local-mlx-audio-runtime.md`
- `docs/plans/reports/2026-04-28-codex-audit-verify-mlx-audio-end-to-end-fixture.md`

## Non-goals

- Do not fake transcript output.
- Do not use shownotes, X post text, metadata, descriptions, or thumbnails as transcripts.
- Do not hard-code `/Users/a123/.../.venv/bin/python` as the only supported runtime.
- Do not write assets outside the canonical source directory.
- Do not copy the external reference script into this repo.
- Do not import, execute, or reference `/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/transcribe_v3.py` from production code or scripts.
- Do not commit generated audio/transcript/model cache data.

## Target Files

Likely:

- `packages/application/src/index.ts`
- `scripts/transcript/transcribe-audio-mlx.ts`
- new Python transcription script, for example:
  - `scripts/transcript/run-mlx-audio-transcription.py`
- `README.md`
- optional config helper:
  - `packages/config/src/index.ts`

Expected report:

- `docs/plans/reports/2026-04-29-use-transcribe-v3-style-mlx-wrapper-report.md`

## Required Implementation

### 1. Keep `MLX_AUDIO_PYTHON` as the explicit runtime

The API and scripts must use:

```text
process.env.MLX_AUDIO_PYTHON
```

If absent, fail with a concise, actionable message that includes:

- attempted executable,
- how to start the app correctly,
- the verified local runtime path.

Recommended message:

```text
MLX_AUDIO_PYTHON is not configured. Start the API with:
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev
```

Fallback to `python3` is acceptable only if the error clearly says fallback was used and failed. Prefer requiring the env var for MLX actions to avoid confusing production errors.

### 2. Add a project-native parameterized Python script

Create a repo-owned script such as:

```text
scripts/transcript/run-mlx-audio-transcription.py
```

Required CLI:

```bash
$MLX_AUDIO_PYTHON scripts/transcript/run-mlx-audio-transcription.py \
  --audio <absolute-audio-path> \
  --model mlx-community/whisper-large-v3-turbo-asr-fp16 \
  --output-json <absolute-output-json-path>
```

Output JSON shape:

```json
{
  "text": "...",
  "segments": [
    {
      "start": 0.0,
      "end": 2.4,
      "text": "..."
    }
  ],
  "metadata": {
    "model": "mlx-community/whisper-large-v3-turbo-asr-fp16",
    "audioFile": "audio.wav",
    "startedAt": "...",
    "finishedAt": "...",
    "elapsedSec": 12.34,
    "segmentsCount": 1
  }
}
```

Script requirements:

- import `generate_transcription` from `mlx_audio.stt.generate`;
- parse segment objects robustly without depending on external script code;
- if segment text looks like a dict string, parse it safely with `ast.literal_eval`;
- keep valid timestamps;
- create parent output directory if needed;
- exit non-zero with a clear stderr message on import/model/transcription failures;
- do not write project `document.md`; Node application remains responsible for Yanghoo asset persistence.
- do not print JSON to stdout as the primary contract; write the requested `--output-json` file and use stdout only for short progress logs.

### 3. Update `transcribeAudioUseCase`

Replace the direct CLI call:

```bash
python -m mlx_audio.stt.generate ...
```

with the project-native script:

```bash
$MLX_AUDIO_PYTHON scripts/transcript/run-mlx-audio-transcription.py \
  --audio <absolute-audio-path> \
  --model <model> \
  --output-json <outputJsonPath>
```

Then parse the script JSON and persist the existing Yanghoo transcript/document assets.

Continue to persist:

```text
sourceType: mlx_audio
engine: mlx-audio
model: mlx-community/whisper-large-v3-turbo-asr-fp16
```

only after real script output is parsed successfully.

### 4. Improve diagnostics in API/UI

When MLX runtime is missing, the error surfaced to the card should tell the user exactly how to restart:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev
```

Do not show only generic `500`.

### 5. Document how to start dev server

Update README with a short "MLX-enabled dev" command:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev
```

Also include script usage:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
npx tsx scripts/transcript/transcribe-audio-mlx.ts <sourceId>
```

## Verification Commands

Run:

```bash
npm run build
npm run typecheck
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python -c "import mlx.core; print('mlx.core ok'); import mlx_audio; print('mlx_audio ok'); from mlx_audio.stt.generate import generate_transcription; print('generate_transcription ok')"
```

Wrapper smoke test with a short audio fixture:

```bash
DATA_DIR=/tmp/yanghoo-mlx-script-test
rm -rf "$DATA_DIR"
mkdir -p "$DATA_DIR"
say -o "$DATA_DIR/audio.aiff" "hello yanghoo transcript test"
ffmpeg -y -i "$DATA_DIR/audio.aiff" "$DATA_DIR/audio.wav"

/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
  scripts/transcript/run-mlx-audio-transcription.py \
  --audio "$DATA_DIR/audio.wav" \
  --model mlx-community/whisper-large-v3-turbo-asr-fp16 \
  --output-json "$DATA_DIR/mlx-script-output.json"

cat "$DATA_DIR/mlx-script-output.json"
```

API/source verification:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/<sourceId>/transcribe-audio
```

or for downloaded media with audio:

```bash
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/<sourceId>/transcribe-media
```

Verify:

```bash
cat data/sources/<sourceId>/transcript-manifest.json
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('<sourceId>'), null, 2)))"
sed -n '1,80p' data/sources/<sourceId>/document.md
```

Negative verification:

Start without `MLX_AUDIO_PYTHON` and trigger transcription. The error must clearly say that MLX runtime is not configured and include the restart command.

## Acceptance Criteria

- API no longer silently uses plain `python3` for MLX transcription without a clear diagnostic.
- The repo-native MLX transcription script can run with the verified MLX Python runtime.
- Segment parsing preserves real text and timestamps.
- No production code imports, executes, or references the external `transcribe_v3.py`.
- Transcription persists Yanghoo transcript/document assets.
- `transcript-manifest.json` records `sourceType: mlx_audio`.
- UI receives and displays actionable MLX setup errors.
- `npm run build` passes.
- `npm run typecheck` passes.
- Generated fixture data and `tsconfig.tsbuildinfo` churn are not included in the final patch.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-29-use-transcribe-v3-style-mlx-wrapper-report.md
```

Report must include:

- changed files,
- exact project-native script command,
- script JSON excerpt,
- API command/response,
- generated transcript/document file list,
- readiness JSON,
- negative no-env diagnostic,
- build/typecheck results,
- unresolved risks.
