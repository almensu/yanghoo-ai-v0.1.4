# Stage 27 Follow-up Plan: Fix English Search URL Restore Race

Date: 2026-05-07
Owner: Codex
Executor: Gemini
Status: Ready for executor

## Reference Context

Read first:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/codex-gemini-glm-collaboration-protocol.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/gemini-model-battery-protocol.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `AGENTS.md`
- `CLAUDE.md`
- `docs/plans/2026-05-07-stage27-english-search-shareable-url-state.md`
- `docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-report.md`
- `docs/plans/reports/2026-05-07-codex-audit-stage27-english-search-shareable-url-state.md`

Reference path note:

- Use `/Users/a123/com/yanghoo205/yanghoo-reference` for this follow-up. The older `/Volumes/2T/...` reference path was unavailable during Codex audit.

## Project Agent Instructions

Relevant constraints:

- Codex plans and audits; Gemini implements.
- Gemini must start with `gemini --yolo`, run `/model`, and capture the full `Model Battery` data before editing.
- Gemini must write the expected follow-up report.
- Codex acceptance is required before Stage 27 is complete.
- Stay inside the assigned write scope unless a blocker requires an explicit report.

## User Problem

The Stage 27 implementation is close, but Codex found that the URL-writing effect can run on initial mount with default state and overwrite the incoming shared URL before channel restoration reads it.

Example incoming URL:

```text
/?view=english-search&q=Linux&limit=50&category=Education&tag=Tutorial&channels=ch1%2Cch2
```

Risky first write observed by Codex:

```text
/?view=english-search&q=would+have
```

This breaks the main Stage 27 promise:

```text
copied URL -> reload -> same search/filter/channel state
```

## Goal

Repair Stage 27 without expanding scope:

- preserve incoming URL state across first mount,
- restore channels/category/tag from the preserved initial state,
- prevent default state from overwriting deeplinks before restore completes,
- strengthen verification so failures exit non-zero,
- update the report with complete protocol-compliant `Model Battery`.

## Non-Goals

- Do not add a router library.
- Do not add new product controls.
- Do not change Stage 25 saved-example provenance behavior.
- Do not change Stage 26 CLI URL helpers except if a regression proves they broke.
- Do not modify external skills.
- Do not edit `data/`.
- Do not introduce app/domain/application/storage/API changes.

## Target Files

Implementation:

```text
apps/web/src/components/EnglishSentenceSearch.tsx
apps/web/src/utils/englishSearchUrlState.ts
apps/web/src/utils/englishSearchUrlState.test.ts
```

Verification/report:

```text
scripts/ops/verify-stage27-english-search-shareable-url-state.ts
docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-follow-up-report.md
```

Only edit `docs/GOTCHAS.md` if the follow-up discovers a durable gotcha not already covered by the current Stage 27 note.

## Do Not Edit

```text
packages/domain/
packages/application/
packages/storage/
apps/api/
apps/cli/
apps/web/src/api/client.ts
apps/web/src/components/SavedEnglishExamples.tsx
data/
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/
/Users/a123/com/yanghoo205/Anything-to-English/
tmp/
```

## Layer Placement

- Fix belongs in `apps/web` because URL state is browser/UI state.
- Parser/serializer helpers may stay in `apps/web/src/utils`.
- Do not move URL query names into domain/application layers.

## Data / Behavior Contract

### Initial URL Preservation

On component mount:

1. Parse `window.location.search` exactly once into a stable initial state.
2. Use that stable state to restore:
   - `q`,
   - `limit`,
   - `diversity`,
   - `sort`,
   - `captionKind`,
   - `category`,
   - `tag`,
   - `channels`,
   - `scenePack`.
3. Do not run URL writeback until initial state restoration and channel selection initialization have completed.
4. Do not reread mutable `window.location.search` for channel initialization after writeback can occur.

### Channel Restore

If initial URL has `channels`:

- filter them to indexed channels after `listLearningChannels()` returns,
- preserve valid channel IDs,
- if none are valid, fall back to existing category/tag/default rules.

If initial URL has no `channels` but has `category` or `tag`:

- select indexed channels matching those filters.

### Scene Pack Restore

If initial URL has `scenePack`:

- activate that scene pack,
- `scenePack` wins over `q`,
- normal query search must not overwrite scene-pack results after pack load.

When the user clicks "Back to Search":

- remove `scenePack` from URL.

### URL Writeback

After initial restore is complete:

- write state changes with `history.replaceState`,
- preserve Stage 27 serializer behavior for default omission,
- keep Stage 26 URLs valid.

## Acceptance Criteria

- Reloading a full query URL with `q + limit + category + tag + channels` restores those values instead of writing defaults.
- Reloading a scene-pack URL restores scene-pack mode.
- Stage 26 basic deeplink behavior remains intact.
- Verification script exits non-zero on failed checks.
- `Model Battery` in the follow-up report includes usage percentages, reset times, local time, model decision, and reason, or explicitly states why exact values cannot be recovered.
- `npm run typecheck` passes.
- `npm run build` passes.

## Verification

Run:

```bash
npx tsx scripts/ops/verify-stage27-english-search-shareable-url-state.ts
npx vitest run apps/web/src/utils/englishSearchUrlState.test.ts
npx tsx scripts/ops/verify-stage26-english-search-deeplink-command.ts
npx tsx scripts/ops/verify-stage23-english-scene-pack-ui.ts
npx tsx scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts
npm run typecheck
npm run build
```

The Stage 27 verification must include a regression for this exact case:

```text
input:  view=english-search&q=Linux&limit=50&category=Education&tag=Tutorial&channels=ch1%2Cch2
first URL write before restore completion: forbidden
restored channel initializer input: preserved initial state, not mutated location.search
```

Implementation may prove this with extracted helper logic if browser automation is unavailable. If Gemini uses browser automation, include the exact URL and observed final URL.

## Expected Report

Write:

```text
docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-follow-up-report.md
```

Required sections:

- `Model Battery`
- `Summary`
- `Changed Files`
- `Behavior Evidence`
- `Verification`
- `Data / Artifact Evidence`
- `Unresolved Risks`
- `Skipped Commands`
- `Gotcha Decision`

Codex should reject the follow-up if:

- first-mount URL overwrite is still possible,
- the verification script still exits 0 on failed assertions,
- Stage 26 query deeplinks regress,
- scene-pack reload is claimed without evidence,
- `Model Battery` is incomplete again.
