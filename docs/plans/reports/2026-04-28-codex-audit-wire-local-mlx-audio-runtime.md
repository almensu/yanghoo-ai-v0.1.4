# Codex Audit: Wire Local MLX Audio Runtime

## Summary

Codex reviewed Gemini's report:

```text
docs/plans/reports/2026-04-28-wire-local-mlx-audio-runtime-report.md
```

Result: partially accepted, not ready for real transcription acceptance.

Accepted:

- `MLX_AUDIO_PYTHON` is now respected by `transcribeAudioUseCase`.
- The old unsupported `--output-format json` flag was removed.
- Local MLX runtime verification passes outside the sandbox:

```text
mlx.core ok
mlx_audio ok
```

- `npm run build` passes.
- `npm run typecheck` passes.

Not accepted:

- The output JSON path is wrong for the local `mlx-audio` CLI and will fail after successful ASR.
- The report did not exercise the new transcription branch because the checkout has no `data/` directory or target audio/source record.
- The worktree includes unrelated generated/build metadata churn that should not be part of the production patch.

## Verification Performed

Codex ran:

```bash
npm run build
npm run typecheck
find data -maxdepth 4 -type f -print
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python -c "import mlx.core; print('mlx.core ok'); import mlx_audio; print('mlx_audio ok')"
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python -m mlx_audio.stt.generate --help
```

Observed:

- Build passed.
- Typecheck passed.
- `data/` does not exist in this checkout.
- MLX runtime import passed outside the sandbox.
- CLI help confirms required shape:

```text
--audio AUDIO --output-path OUTPUT_PATH --format {txt,srt,vtt,json}
```

## Findings

### P0: Application reads the wrong JSON path after MLX ASR

Evidence:

- `packages/application/src/index.ts` constructs:

```ts
const outputJsonPath = path.join(outputDir, `mlx_out_${sourceId}.json`);
```

- Then invokes:

```ts
--output-path "${outputJsonPath}" --format json
```

- Then checks:

```ts
fs.existsSync(outputJsonPath)
```

However, the local MLX Audio implementation writes JSON as:

```py
open(f"{output_path}.json", "w", encoding="utf-8")
```

Source:

```text
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/mlx_audio/stt/generate.py
```

Impact:

If `outputJsonPath` is:

```text
.../mlx_out_xyz.json
```

MLX writes:

```text
.../mlx_out_xyz.json.json
```

but the app reads:

```text
.../mlx_out_xyz.json
```

So a successful ASR run will still fail with:

```text
Transcription completed but output JSON not found
```

Required fix:

Pass an output path without the `.json` suffix, then read `${outputBasePath}.json`, or pass `--output-path "-"` and parse stdout if verified.

### P1: New transcription path was not actually exercised

Gemini reported the endpoint returned:

```json
{"message":"Source not found: xyz-69a64629de29766da93331ec"}
```

That verifies missing data behavior only. It does not verify:

- `MLX_AUDIO_PYTHON` is used by the API process.
- the ASR command launches from `transcribeAudioUseCase`.
- JSON parsing works.
- `transcript-manifest.json` records `sourceType: mlx_audio`.
- Markdown is generated from ASR output.

This was partly expected because `data/` is absent, but it means the report cannot claim real runtime wiring is complete.

Required fix:

After fixing the output path, rerun with either restored target source/audio data or a small controlled audio fixture and report the generated files/readiness. Do not claim ASR completion from `Source not found`.

### P2: Worktree includes unrelated generated churn

Current diff includes:

```text
package-lock.json
apps/*/tsconfig*.tsbuildinfo
packages/*/tsconfig.tsbuildinfo
```

The task only required application runtime wiring. These files are not part of the logical change and should be removed from the Gemini patch unless there is a specific, documented reason.

Required fix:

Keep the production patch scoped to source/docs needed for this task. Do not include TypeScript build info churn or incidental `package-lock.json` peer metadata changes.

## Decision

Do not accept this report as completing Xiaoyuzhou MLX transcription support.

Gemini should submit a follow-up fix that:

- corrects the output path suffix behavior,
- removes unrelated generated file churn,
- reruns build/typecheck,
- verifies the API transcription path with an actual source/audio fixture or explicitly reports that real ASR remains unverified because runtime data is absent.
