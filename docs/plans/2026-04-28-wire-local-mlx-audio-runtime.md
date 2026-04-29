# Wire Local MLX Audio Runtime

## Owner

Gemini implements. Codex reviews.

## Goal

Make the existing Xiaoyuzhou `transcribe-audio` path use the locally working MLX Audio runtime and the actual CLI shape discovered on this machine.

Working local runtime:

```text
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python
```

Target model:

```text
mlx-community/whisper-large-v3-turbo-asr-fp16
```

## Current Findings

Codex verified outside the sandbox:

```bash
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python -c "import sys; print(sys.executable); import mlx.core; print('mlx.core ok'); import mlx_audio; print('mlx_audio ok')"
```

Observed:

```text
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python
mlx.core ok
mlx_audio ok
```

Codex also verified:

```bash
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python -m mlx_audio.stt.generate --help
```

The local CLI requires:

```text
--audio AUDIO --output-path OUTPUT_PATH --format {txt,srt,vtt,json}
```

The current application code in `packages/application/src/index.ts` still calls:

```text
python3 -m mlx_audio.stt.generate --model ... --audio ... --output-format json
```

This is incompatible with the local `mlx-audio` CLI because `--output-format` is not accepted and `--output-path` is required.

The current default `python3` is also not the MLX runtime:

```text
/opt/homebrew/bin/python3
```

It does not have `mlx` or `mlx_audio`.

## Reference and Decisions

Reference repository files under `/Volumes/2T/com/yanghoo205/yanghoo-reference/reference/` were not available in this session because `/Volumes/2T` is not mounted. Use this repo's accepted ADRs instead:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`

Relevant boundary:

- Application orchestration belongs in `packages/application`.
- Domain provenance remains `sourceType: mlx_audio` only after real MLX ASR succeeds.
- Scripts, if added, must be entry points only. Business logic stays in packages.

## Non-goals

- Do not copy code from `/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio`.
- Do not vendor `mlx-audio` into this repo.
- Do not fake transcript output.
- Do not use Xiaoyuzhou shownotes as transcript content.
- Do not mark readiness as `markdown_ready` unless ASR output produced transcript/document assets.
- Do not hard-code a user-specific MLX path as the only supported path.

## Target Files

Primary:

- `packages/application/src/index.ts`

Optional if needed:

- `packages/config/src/index.ts`
- `scripts/transcribe-audio-mlx.ts`
- docs/report file listed below

## Required Implementation

1. Add a configurable MLX Python command.

Use an environment variable such as:

```text
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python
```

Fallback may remain `python3`, but the error message must state which executable was tried.

2. Replace the old CLI invocation.

Use the actual CLI shape:

```bash
$MLX_AUDIO_PYTHON -m mlx_audio.stt.generate \
  --model mlx-community/whisper-large-v3-turbo-asr-fp16 \
  --audio <absolute-audio-path> \
  --output-path <absolute-json-output-path> \
  --format json
```

Do not rely on stdout containing JSON unless the verified local CLI documents that behavior.

3. Parse the generated JSON robustly.

Accept the local JSON shape produced by this CLI. If the JSON does not contain `segments`, fail with a clear diagnostic that includes the output path and top-level keys.

4. Keep transcript provenance strict.

Persist:

```text
sourceType: mlx_audio
engine: mlx-audio
model: mlx-community/whisper-large-v3-turbo-asr-fp16
```

only after real ASR output is parsed.

5. Preserve clear failure behavior.

If MLX import, CLI help, model load, model download, or transcription fails, return a backend error message that includes:

- attempted Python executable
- command phase that failed
- stderr/stdout summary
- no fake transcript generated

## Acceptance Criteria

- `MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev` starts the app with the correct runtime available to the API.
- `POST /api/tasks/:taskId/transcribe-audio` no longer fails because of `ModuleNotFoundError: No module named 'mlx'`.
- The app no longer uses `--output-format json`.
- If target audio exists, transcription produces transcript and Markdown assets derived from MLX ASR.
- `transcript-manifest.json` records `sourceType: mlx_audio`.
- If the current checkout has no `data/` directory or no audio asset, the report must say so and verify the expected "audio not fetched" failure instead.

## Verification Commands

Gemini must run:

```bash
npm run build
npm run typecheck
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
  /Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python -c "import mlx.core; print('mlx.core ok'); import mlx_audio; print('mlx_audio ok')"
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
  /Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python -m mlx_audio.stt.generate --help
```

If `data/sources/xyz-69a64629de29766da93331ec/audio.m4a` exists, Gemini must also run:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/xyz-69a64629de29766da93331ec/transcribe-audio
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('xyz-69a64629de29766da93331ec'), null, 2)))"
```

If the target audio does not exist, Gemini must verify with:

```bash
find data -maxdepth 4 -type f -print
```

and report the missing local runtime assets before attempting a destructive or broad data recreation.

## Expected Report

Write report to:

```text
docs/plans/reports/2026-04-28-wire-local-mlx-audio-runtime-report.md
```

Report must include:

- changed files
- exact MLX Python executable used
- exact CLI command shape used
- build/typecheck results
- transcribe endpoint response
- readiness output
- generated transcript/document file list when transcription succeeds
- unresolved risks
