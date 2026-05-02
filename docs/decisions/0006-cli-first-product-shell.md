# 0006 CLI-first Product Shell

Date: 2026-05-02

Status: Accepted

## Context

This repo is moving toward a transcript-first workflow that prepares URL, Markdown, and transcript assets for downstream tools such as NotebookLM. The web UI remains useful for reading and previewing, but the core product operations should be available from a stable command line interface.

The reference repository guidance says product shells should be thin entry points, while orchestration and domain behavior stay in packages. For this repo, that means the CLI must call application use cases directly instead of duplicating API or UI logic.

## Decision

Add `apps/cli` as the primary operator shell for local workflows.

The CLI owns:

- parsing commands and flags,
- rendering human-readable or JSON output,
- returning predictable exit codes,
- invoking application use cases.

The CLI does not own:

- transcript source selection rules,
- media download logic,
- transcription implementation,
- NotebookLM export rules,
- storage path conventions beyond passing explicit user options.

Those behaviors remain in `packages/application`, `packages/domain`, and infrastructure/storage packages.

## Command Shape

The first stable command surface is:

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

All commands should support `--json` for scripts and automation.

## Consequences

- Web and API become companion shells, not the only way to operate the project.
- Long-running or expensive work can be run explicitly from terminal sessions.
- NotebookLM supply workflows can be scripted without opening the browser.
- Future CLI expansion must keep business rules in package-level use cases.

## Verification

The CLI package must pass:

```bash
npm run typecheck -w @yanghoo/cli
npm run build -w @yanghoo/cli
npm run cli -- doctor
```

Cross-package changes should still pass:

```bash
npm run typecheck
npm run build
```
