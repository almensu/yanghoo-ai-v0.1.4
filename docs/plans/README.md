# Plans

Plans are Codex-authored execution documents for Gemini. Keep them ordered, scoped, and tied to accepted decisions.

## Plan Types

- `*-priority-roadmap.md`: current execution order and dependencies.
- `*-stage-N-*.md`: actionable Gemini task specs.
- `*-discussion.md`: product or architecture thinking; not executable unless promoted into a stage plan.
- `reports/`: Gemini completion reports.

## Current Files

- `2026-04-26-priority-roadmap.md`: active priority map.
- `2026-04-26-stage-1-apps-packages-skeleton-migration.md`: next executable task.
- `2026-04-26-requirements-and-architecture-discussion.md`: product requirements discussion.
- `2026-04-26-transcript-studio-greenfield-plan.md`: early greenfield sketch; superseded by ADRs and roadmap where conflicts exist.

## Stage Rules

Each stage plan must include:

- owner and reviewer
- goal and non-goals
- decisions to follow
- target files/directories
- acceptance criteria
- verification commands
- report path

Gemini should not implement roadmap items until Codex creates or updates a concrete stage plan.
