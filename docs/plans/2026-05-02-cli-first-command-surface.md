# CLI-first Command Surface

Date: 2026-05-02

Owner: Codex

Reference read:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/index.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/architecture.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/repo-conventions.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/decision-rules.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`

Local gotchas read:

- `docs/GOTCHAS.md`

## Goal

Make the project operable from the command line, with a clear Chinese usage manual in `README.md`.

The CLI should support the current transcript-first workflow:

```text
source url -> source card -> transcript/media/audio -> readable document -> NotebookLM export
```

## Non-goals

- Do not replace the web reading UI.
- Do not rebuild the old all-purpose media control panel.
- Do not copy implementation from the reference repository.
- Do not put media, transcript, or export business logic inside CLI command files.

## Layer Placement

- `apps/cli`: command parsing, output rendering, process exit codes.
- `packages/application`: use cases such as capture source, ensure transcript, download media, transcribe, translate, search, and export.
- `packages/storage`: source and document asset persistence.
- `packages/domain`: source/task/document concepts and status rules.

## Target Files

- `apps/cli/package.json`
- `apps/cli/tsconfig.json`
- `apps/cli/src/main.ts`
- `apps/cli/src/cli-command-registry.ts`
- `apps/cli/src/cli-runtime-config.ts`
- `apps/cli/src/cli-output-renderer.ts`
- `apps/cli/src/cli-error-presenter.ts`
- `apps/cli/src/commands/*`
- `README.md`
- `docs/decisions/0006-cli-first-product-shell.md`

## Accepted Command Surface

```text
yanghoo doctor
yanghoo source add <url>
yanghoo source list
yanghoo source show <sourceId>
yanghoo transcript ensure <sourceId>
yanghoo media download <sourceId>
yanghoo audio fetch <sourceId>
yanghoo transcribe <sourceId>
yanghoo translate <sourceId> --model <modelName>
yanghoo search <query>
yanghoo export notebooklm <sourceId...> --mode markdown|url-list --open
```

For local development, the command is run through npm:

```bash
npm run cli -- <command>
```

## Acceptance Criteria

- Root `README.md` contains a Chinese CLI manual with command examples and comments.
- `apps/cli` builds as a workspace package.
- `npm run cli -- doctor` prints local dependency status.
- `npm run cli -- source list --json` returns script-friendly JSON.
- NotebookLM export can be triggered from CLI using existing application use cases.
- CLI command files remain thin and do not duplicate platform-specific media logic.

## Verification Commands

```bash
npm run typecheck -w @yanghoo/cli
npm run build -w @yanghoo/cli
npm run cli -- doctor
npm run cli -- source list --json
npm run typecheck
npm run build
```

If full workspace verification is skipped, the final report must state why.

## Risks

- Some commands can trigger expensive downloads or transcription. Keep those commands explicit.
- `MLX_AUDIO_PYTHON` and `MLX_LM_PYTHON` are local machine settings; `doctor` should report them clearly instead of hiding failures.
- Future command growth should promote repeated orchestration into `packages/application` instead of expanding CLI command files.
