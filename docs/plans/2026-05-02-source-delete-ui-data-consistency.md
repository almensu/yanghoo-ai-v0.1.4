# Source Delete UI/Data Consistency

Date: 2026-05-02

## Goal

Make the UI card list the source of truth for deletion. When the user deletes a visible card, backend storage must delete the corresponding local source assets consistently, including hidden duplicate or legacy directories that are not shown in UI because of canonical deduplication.

## Problem

The UI lists deduplicated sources through `listSources()`, while local `data/sources/` may contain more directories:

```text
data/sources directories: 17
UI/API cards: 11
```

Some hidden directories have no `record.json`; others may be legacy dirty duplicates. A delete action that removes only one `sourceId` leaves backend assets behind.

## Non-goals

- Do not make orphan directories visible as valid cards.
- Do not change document readiness rules.
- Do not delete unrelated source directories.

## Target Files

- `packages/storage/src/index.ts`
- `packages/application/src/deleteSourceUseCase.ts`
- `docs/GOTCHAS.md`

## Acceptance Criteria

- `DELETE /api/tasks/:taskId` recursively removes the source directory for the visible card.
- If multiple records share the same `platform + canonicalId`, deleting the visible card removes the whole group.
- Legacy orphan directories whose name matches the same source id/canonical prefix are removed with the group.
- Deleting a card removes unknown future assets and empty subdirectories, not only currently known manifest files.
- `delete assets` remains scoped and does not delete the card.

## Verification

Use a temporary `DATA_DIR` fixture with:

- a visible source directory,
- a dirty duplicate directory,
- an orphan directory without `record.json`,
- an unrelated source directory.

Deleting the visible source must leave only the unrelated source directory.
