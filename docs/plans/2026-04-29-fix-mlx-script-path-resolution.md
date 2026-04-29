# Fix MLX Script Path Resolution

## Owner

Gemini implements. Codex reviews.

## Goal

Fix transcription failures caused by resolving the project-native MLX Python script from the API process working directory.

Current error:

```text
"/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python" \
"/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4/apps/api/scripts/transcript/run-mlx-audio-transcription.py" ...

can't open file '/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4/apps/api/scripts/transcript/run-mlx-audio-transcription.py': [Errno 2] No such file or directory
```

The real script exists at:

```text
/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4/scripts/transcript/run-mlx-audio-transcription.py
```

## Root Cause

`packages/application/src/index.ts` currently does:

```ts
const scriptPath = path.resolve(process.cwd(), 'scripts/transcript/run-mlx-audio-transcription.py');
```

When the API is launched with:

```bash
npm run dev -w @yanghoo/api
```

or equivalent workspace tooling, `process.cwd()` can be:

```text
.../apps/api
```

So the app incorrectly looks under:

```text
apps/api/scripts/transcript/run-mlx-audio-transcription.py
```

Do not copy the script into `apps/api/scripts` as a workaround. There must be one canonical script under the repository root `scripts/`.

## Reference and Decisions

Use:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0005-script-entrypoint-naming.md`
- `docs/plans/2026-04-29-use-transcribe-v3-style-mlx-wrapper.md`
- `docs/GOTCHAS.md`

## Non-goals

- Do not vendor or duplicate `run-mlx-audio-transcription.py`.
- Do not depend on `/Users/a123/...` as a hard-coded repo root.
- Do not revert the project-native MLX script work.
- Do not fake transcript output.
- Do not commit generated media/transcript data or `tsconfig.tsbuildinfo` churn.

## Target Files

Likely:

- `packages/application/src/index.ts`
- `docs/GOTCHAS.md`
- `docs/plans/reports/2026-04-29-fix-mlx-script-path-resolution-report.md`

Optional:

- a small helper in `packages/application/src/resolveProjectRoot.ts` if the logic is clearer there.

Avoid vague names such as `utils.ts`.

## Required Implementation

### 1. Resolve the repo root independent of cwd

Implement a robust path resolver for:

```text
scripts/transcript/run-mlx-audio-transcription.py
```

Acceptable approaches:

- derive from `import.meta.url` in `packages/application/src/index.ts` or a helper and walk up to the repo root;
- walk upward from `process.cwd()` until a directory contains both:
  - root `package.json` with workspace metadata, and
  - `scripts/transcript/run-mlx-audio-transcription.py`;
- allow an optional explicit override env var such as `YANGHOO_REPO_ROOT`, while still having a reliable default.

The chosen implementation must work when started from:

```text
repo root
apps/api
packages/application
```

### 2. Fail early with a clear diagnostic

Before invoking Python, check:

```ts
fs.existsSync(scriptPath)
```

If missing, throw an error that includes:

- resolved `scriptPath`,
- current `process.cwd()`,
- expected relative path,
- how to fix if the checkout is incomplete.

### 3. Preserve MLX runtime behavior

Keep requiring:

```text
MLX_AUDIO_PYTHON
```

Do not fall back silently to `python3`.

### 4. Update Gotchas

Add a note to `docs/GOTCHAS.md`:

- API workspace cwd may be `apps/api`;
- never resolve repo-root scripts by blindly appending to `process.cwd()`;
- use repo-root discovery or `import.meta.url`-based resolution.

## Verification Commands

Run:

```bash
npm run build
npm run typecheck
```

Verify path resolution from repo root:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
npx tsx scripts/transcript/transcribe-audio-mlx.ts <sourceId-with-audio>
```

Verify path resolution from `apps/api` cwd:

```bash
cd apps/api
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
npm run dev
```

Then from repo root in another terminal:

```bash
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/<sourceId-with-audio>/transcribe-audio
```

Expected:

- command no longer references `apps/api/scripts/...`;
- command references repo-root `scripts/transcript/run-mlx-audio-transcription.py`;
- if the source/audio is valid, transcription proceeds;
- if source/audio has another issue, the error should be about that issue, not script path missing.

## Acceptance Criteria

- No production path resolution depends on `process.cwd()` being the repo root.
- The app never tries to open `apps/api/scripts/transcript/run-mlx-audio-transcription.py`.
- The Python script remains in the canonical root `scripts/transcript/` directory.
- Missing script errors include cwd and resolved script path.
- `npm run build` passes.
- `npm run typecheck` passes.
- `docs/GOTCHAS.md` records this cwd/script-path trap.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-29-fix-mlx-script-path-resolution-report.md
```

Report must include:

- changed files,
- exact resolved script path from API run,
- commands run from repo root and `apps/api`,
- API response or script output,
- build/typecheck results,
- unresolved risks.
