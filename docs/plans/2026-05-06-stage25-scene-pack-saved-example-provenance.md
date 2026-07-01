# Stage 25 Plan: Scene Pack Saved Example Provenance

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready for Gemini

## Reference Context

Codex attempted earlier in Stage 24 to read the configured advisory reference repository:

```text
/Volumes/2T/com/yanghoo205/yanghoo-reference
```

The path was unavailable on this machine. Gemini should use it if mounted during execution, especially:

- `reference/index.md`
- `reference/architecture.md`
- `reference/repo-conventions.md`
- `reference/decision-rules.md`
- `reference/layer-boundaries.md`
- `reference/test-strategy.md`
- `reference/review-checklists/`

If still unavailable, continue from this repo's accepted ADRs and record the missing reference path in the report.

Local repo references:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/plans/2026-05-05-stage-saved-english-examples-review-queue.md`
- `docs/plans/2026-05-06-stage23-english-scene-pack-ui.md`
- `docs/plans/reports/2026-05-06-codex-rollup-stage21-24-status.md`
- `docs/GOTCHAS.md` if starting dev servers or taking browser evidence

## User Problem

Stage 23/24 made scene packs playable and saveable, but saved examples are still mostly indistinguishable from ordinary English Search saves after they enter the Saved page. A user studying `Scene.KidWakeUpMorning` should be able to return to saved examples from that scene pack and see why each sentence was saved.

Current saved-example metadata preserves the query string, but not the originating scene pack:

```text
query: "wake up"
```

Needed:

```text
scenePackId: "kid-wake-up-morning"
scenePackTitle: "Scene.KidWakeUpMorning"
scenePackScene: "Scene.KidWakeUpMorning"
scenePackQuery: "wake up"
```

## Goal

When saving from Scene Pack mode:

```text
Scene Pack example -> Save -> Saved Examples
```

the saved item should retain scene-pack provenance and the Saved page should expose that provenance for filtering and review.

## Non-Goals

- Do not change scene-pack import semantics.
- Do not parse Markdown.
- Do not add account sync or cloud persistence.
- Do not implement spaced repetition.
- Do not change ordinary English Search save behavior except to keep it compatible with the new optional provenance fields.
- Do not commit runtime `data/` files.

## Target Files

Likely files:

```text
packages/domain/src/index.ts
packages/application/src/savedEnglishExamplesUseCases.ts
packages/storage/src/savedEnglishExampleStorage.ts
apps/api/src/routes/englishSavedExamples.ts
apps/web/src/api/client.ts
apps/web/src/components/EnglishSentenceSearch.tsx
apps/web/src/components/SavedEnglishExamples.tsx
scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts
docs/plans/reports/2026-05-06-stage25-scene-pack-saved-example-provenance-report.md
```

Only touch additional files if required by local imports/exports.

## Layer Placement

- Domain owns optional saved-example provenance fields.
- Application owns save/read/update behavior and duplicate-save merge rules.
- API transports optional provenance from frontend to application.
- Web owns passing provenance from active scene-pack UI and displaying/filtering it on Saved.
- Storage remains JSON file persistence under the canonical `data/` root.

Do not let UI or API import `fs`. Do not let domain import API, React, filesystem, or subprocess modules.

## Data Model

Extend `SavedEnglishExample` with optional scene-pack provenance:

```ts
scenePackId?: string;
scenePackTitle?: string;
scenePackScene?: string;
scenePackRequest?: string;
scenePackQuery?: string;
```

Rules:

- Ordinary English Search saves leave these fields undefined.
- Scene Pack saves set `scenePackQuery` to the example's query.
- `query` should remain populated for backward compatibility and should equal the saved search/pack query used for review.
- Duplicate save of an already-saved sentence should not create a new item.
- If a duplicate save comes from a scene pack and the existing item lacks scene provenance, update the existing item to add provenance and refresh `updatedAt`.
- If an existing item already has different scene provenance, do not destructively overwrite it without a clear rule. Prefer preserving the existing provenance and returning a warning/unchanged note in the report, or add a conservative `scenePackIds?: string[]` only if the codebase shape makes that clearly better. Keep the first implementation simple.

## API Semantics

Extend `POST /api/english-saved-examples` request body with optional provenance:

```json
{
  "result": { "...": "EnglishSentenceSearchResult" },
  "query": "wake up",
  "scenePack": {
    "id": "kid-wake-up-morning",
    "title": "Scene.KidWakeUpMorning",
    "scene": "Scene.KidWakeUpMorning",
    "request": "对小孩早上起床的场景做筛选",
    "query": "wake up"
  }
}
```

Validate with existing route patterns. Reject malformed non-string provenance values, but do not require `scenePack` for ordinary saves.

## Web Requirements

### English Search

When active scene-pack mode saves from:

- a result card,
- the player panel,

pass the active pack provenance and the specific example query to `saveEnglishExample`.

### Saved Examples

Add a small, workbench-style provenance surface:

- show a compact scene-pack label on saved items that have provenance,
- add a filter control for scene pack, based on provenance present in loaded saved examples,
- keep current text/status/tag filters working,
- selecting a filtered saved example should still populate the player panel,
- ordinary non-scene saved examples should remain visible under "All".

Do not make the Saved page a marketing page or a new dashboard. Keep it dense and utilitarian.

## Verification

Add:

```bash
npx tsx scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts
```

The script should:

1. Ensure or import a small scene pack fixture.
2. Save one scene-pack example with provenance through the application/API-equivalent path.
3. Assert persisted saved example has:
   - `query` equal to the pack example query,
   - `scenePackId`,
   - `scenePackTitle`,
   - `scenePackScene`,
   - `scenePackQuery`.
4. Save the same sentence again without provenance and assert no duplicate is created and provenance is not lost.
5. Save the same sentence again with provenance if the first save lacked it and assert provenance is added.
6. Clean up only the saved test item(s), not user runtime scene packs unless the script created a dedicated test pack.

Run:

```bash
npx tsx scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts
npx tsx scripts/ops/verify-stage23-english-scene-pack-ui.ts
npm run typecheck
npm run build
git status --short
git ls-files '*.tsbuildinfo'
```

If browser UI is changed, include at least one screenshot under:

```text
docs/plans/reports/screenshots/
```

showing a saved scene-pack example label and scene-pack filter.

## Acceptance Criteria

- Saving from Scene Pack mode persists scene provenance.
- Existing ordinary saves remain compatible.
- Duplicate save behavior remains idempotent and does not drop provenance.
- Saved page can filter/show scene-pack saved examples.
- No runtime `data/` files are committed.
- No `*.tsbuildinfo` files are tracked.
- Stage 23 verification still passes.
- Typecheck and build pass.

## Expected Report

Write:

```text
docs/plans/reports/2026-05-06-stage25-scene-pack-saved-example-provenance-report.md
```

The report must include:

- changed files,
- exact commands run and results,
- saved example id used for verification,
- before/after duplicate-save behavior,
- screenshot paths if UI changed,
- reference repository availability,
- unresolved risks and skipped commands.

Codex will audit the report before Stage 25 is accepted.
