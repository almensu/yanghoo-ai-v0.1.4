# Codex Audit: Wire Local MLX Audio Runtime Follow-up

## Summary

Codex reviewed the updated Gemini work after the prior audit:

```text
docs/plans/reports/2026-04-28-codex-audit-wire-local-mlx-audio-runtime.md
```

Result: accepted for runtime wiring and output-path correction, with one remaining verification limitation.

Accepted:

- The MLX output path bug is fixed.
- Unrelated `package-lock.json` and `tsconfig.tsbuildinfo` churn has been removed from the worktree.
- `npm run build` passes.
- `npm run typecheck` passes.
- The local MLX Audio CLI shape is still verified as:

```text
--audio AUDIO --output-path OUTPUT_PATH --format {txt,srt,vtt,json}
```

Remaining limitation:

- Real ASR output is still not verified in this checkout because `data/` does not exist and no source/audio asset is available.

## Verification Performed

Codex ran:

```bash
git status --short
git diff -- packages/application/src/index.ts
npm run build
npm run typecheck
find data -maxdepth 4 -type f -print
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python -m mlx_audio.stt.generate --help
```

Observed:

- Worktree now only contains the intended application source change plus plan/report docs.
- `data/` is absent.
- Build passed.
- Typecheck passed.
- MLX Audio help confirms `--output-path` receives a base output path and the tool writes the selected extension.

## Code Review

The previous P0 is fixed in:

```text
packages/application/src/index.ts
```

Current code:

```ts
const outputJsonBase = path.join(outputDir, `mlx_out_${sourceId}`);
const outputJsonPath = `${outputJsonBase}.json`;
const cmd = `"${pythonExec}" -m mlx_audio.stt.generate --model "${model}" --audio "${absoluteAudioPath}" --output-path "${outputJsonBase}" --format json`;
```

This now matches local `mlx-audio` behavior, which appends `.json` internally.

## Findings

No blocking code findings remain for the scoped runtime wiring task.

### Residual Verification Gap

The report still cannot prove an end-to-end Xiaoyuzhou ASR transcript because there is no persisted source/audio input in this checkout. The endpoint test remains limited to missing-data behavior, not successful transcription.

Before claiming Xiaoyuzhou transcription support complete, Gemini must run against a real or controlled audio fixture and verify:

- generated MLX JSON output exists,
- transcript segments are parsed,
- `transcript-manifest.json` records `sourceType: mlx_audio`,
- `document.md` is generated from ASR text,
- readiness becomes `markdown_ready`.

## Decision

Accept this follow-up as fixing the local MLX runtime wiring defect.

Do not yet mark the Xiaoyuzhou ASR product path fully complete until a source/audio fixture is restored or created and the successful transcription path is verified.
