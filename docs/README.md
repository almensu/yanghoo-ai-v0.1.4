# Yanghoo AI v0.3.0 Docs

This directory is the project command center. Codex keeps decisions and task priorities here; Gemini implements from stage plans and writes reports to `docs/plans/reports/`.

## Read Order

1. `docs/README.md`: current priorities and document map.
2. `docs/decisions/`: accepted architecture decisions.
3. `docs/plans/2026-04-26-priority-roadmap.md`: execution order.
4. `docs/plans/<stage>.md`: concrete Gemini task specs.
5. `docs/plans/reports/`: Gemini completion reports.

## Current Priority

| Priority | Stage | Status | Owner | Purpose |
| --- | --- | --- | --- | --- |
| P0 | Stage 1 apps/packages skeleton | Ready | Gemini | Move scaffold into `apps/` + `packages`, preserve scripts, establish package boundaries. |
| P1 | Stage 2 domain contracts | Planned | Codex then Gemini | Lock source, transcript, document, conversation, ID, and storage contracts. |
| P1 | Stage 3 URL collectors | Planned | Gemini | Implement YouTube and Xiaoyuzhou URL capture first. |
| P1 | Stage 4 transcript pipeline | Planned | Gemini | Fetch captions or use `mlx-audio`, then normalize/refine transcript assets. |
| P2 | Stage 5 reader workspace | Planned | Gemini | Build document-first source cards and timestamped reader. |
| P2 | Stage 6 LLM gateway | Planned | Gemini | Add unified local/API model entrypoint and source-scoped chat. |
| P3 | Stage 7 short-video adapters | Roadmap | Gemini | Add Douyin and Xiaohongshu after the core loop is stable. |

## Folder Roles

- `architecture/`: stable boundary notes and package responsibilities.
- `decisions/`: ADR files with accepted choices.
- `plans/`: Codex-authored task plans and roadmap.
- `plans/reports/`: Gemini-authored completion reports.

## Rules

- Decisions are source of truth; plans must reference relevant ADRs.
- Discussion drafts can inform plans, but task files control execution.
- New implementation work needs a stage plan before Gemini starts.
- Reports must include changed files, verification commands, results, and unresolved risks.
