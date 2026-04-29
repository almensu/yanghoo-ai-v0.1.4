# Codex Audit: Verify MLX Audio End-to-End Fixture

## Summary

Codex reviewed Gemini's report:

```text
docs/plans/reports/2026-04-28-verify-mlx-audio-end-to-end-fixture-report.md
```

Result: functionally accepted for the MLX audio end-to-end verification goal, but not patch-clean until generated build metadata is removed from the worktree.

Accepted:

- A controlled Xiaoyuzhou-style fixture was created under isolated `DATA_DIR=/tmp/yanghoo-mlx-e2e-data`.
- The fixture uses a real generated audio file, not shownotes or mock transcript JSON.
- The API transcription path returned `markdown_ready` in the report.
- Persisted readiness currently reports `source: "mlx_audio"` and `sentencesCount: 1`.
- Generated transcript and document assets exist under the isolated fixture source directory.
- `transcript-manifest.json` records `sourceType: mlx_audio`, `engine: mlx-audio`, and the expected Whisper model.
- `npm run build` passes.
- `npm run typecheck` passes.

Not accepted as final patch scope:

- The worktree contains modified `tsconfig.tsbuildinfo` files. These are generated build artifacts and must be removed from the Gemini patch unless there is a documented reason to commit them.

## Verification Performed

Codex ran:

```bash
git status --short
git diff -- packages/application/src/index.ts
find /tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e -maxdepth 1 -type f -print | sort
cat /tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/transcript-manifest.json
DATA_DIR=/tmp/yanghoo-mlx-e2e-data node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('fixture-mlx-audio-e2e'), null, 2)))"
sed -n '1,80p' /tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/document.md
npm run build
npm run typecheck
```

Observed generated files:

```text
/tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/audio-manifest.json
/tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/audio.aiff
/tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/audio.wav
/tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/document.md
/tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/mlx_out_fixture-mlx-audio-e2e.json
/tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/record.json
/tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/transcript-manifest.json
/tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/transcript-raw.json
/tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/transcript-sentences.json
/tmp/yanghoo-mlx-e2e-data/sources/fixture-mlx-audio-e2e/transcript.vtt
```

Observed manifest:

```json
{
  "sourceType": "mlx_audio",
  "engine": "mlx-audio",
  "model": "mlx-community/whisper-large-v3-turbo-asr-fp16",
  "generatedAt": "2026-04-28T10:51:19.281Z",
  "rawSegmentsCount": 1,
  "refinedSegmentsCount": 1
}
```

Observed readiness:

```json
{
  "status": "markdown_ready",
  "source": "mlx_audio",
  "sentencesCount": 1,
  "chaptersCount": 0,
  "hasMarkdown": true,
  "hasRefined": true,
  "hasVtt": true,
  "hasAudio": true,
  "hasMedia": false
}
```

Observed document excerpt:

```markdown
# MLX Audio End-to-End Fixture

**[0:00]** Hello Yanghou transcript test
```

Build and typecheck both passed.

Codex also attempted to replay the API `curl` against port `8001`, but the request did not return within the review window and was interrupted. That replay was not counted as audit evidence because the already-running server environment could not be verified. The persisted fixture outputs and Gemini's recorded HTTP 200 response are sufficient for accepting the verification result.

## Findings

### P1: Generated TypeScript build info files remain modified

Evidence from `git status --short`:

```text
 M apps/api/tsconfig.tsbuildinfo
 M packages/application/tsconfig.tsbuildinfo
 M packages/config/tsconfig.tsbuildinfo
 M packages/domain/tsconfig.tsbuildinfo
 M packages/llm-adapters/tsconfig.tsbuildinfo
 M packages/llm-gateway/tsconfig.tsbuildinfo
 M packages/source-adapters/tsconfig.tsbuildinfo
 M packages/storage/tsconfig.tsbuildinfo
 M packages/transcript/tsconfig.tsbuildinfo
 M packages/ui/tsconfig.tsbuildinfo
```

Impact:

These files are unrelated to the MLX runtime wiring or fixture verification. Keeping them in the patch obscures the real production and documentation changes.

Required fix:

Remove generated `tsconfig.tsbuildinfo` churn from the final patch, unless Gemini can provide a specific reason they are intentionally tracked and must change.

## Decision

The end-to-end MLX audio verification is accepted.

Before final handoff or commit, clean the worktree so the patch contains only:

- the intentional `packages/application/src/index.ts` runtime wiring change,
- the relevant task/report/audit docs.

Do not include generated build metadata churn.
