# Codex Audit: Stage 23 English Scene Pack UI Integration

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-english-scene-pack-ui-report.md`
Plan Reviewed: `docs/plans/2026-05-06-stage23-english-scene-pack-ui.md`
Verdict: Rejected pending UI/data-integrity follow-up

## Scope

This audit reviewed:

- native English Scene Pack domain/storage/application implementation,
- `english-scene-packs` CLI import/list/show/delete,
- API list/get/delete routes,
- external skill `--import-yanghoo` workflow,
- English Search UI integration,
- Stage 23 and Stage 22 verification,
- typecheck and build,
- user-specific `kid-wake-up-morning` import.

## Checks Passed

The core structured artifact pipeline works.

Codex ran:

```bash
npx tsx scripts/ops/verify-stage23-english-scene-pack-ui.ts
```

Result: passed.

```bash
npx tsx scripts/ops/verify-stage22-yanghoo-english-balance-query-quality.ts
```

Result: passed.

```bash
npm run typecheck
```

Result: passed.

```bash
npm run build
```

Result: passed.

Codex also imported the user-requested pack:

```bash
npm run -s cli -- english-scene-packs import \
  --scene-brief /tmp/yanghoo-balance-kid-wake-up-morning-scene-brief.json \
  --evidence-pack /tmp/yanghoo-balance-kid-wake-up-morning-evidence-pack.json \
  --study-pack /Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/kid-wake-up-morning.md \
  --request "对小孩早上起床的场景做筛选" \
  --json
```

Then:

```bash
npm run -s cli -- english-scene-packs list --json
```

returned:

```json
{
  "packs": [
    {
      "id": "kid-wake-up-morning",
      "title": "Scene.KidWakeUpMorning",
      "scene": "Scene.KidWakeUpMorning",
      "request": "对小孩早上起床的场景做筛选",
      "queryCount": 12,
      "exampleCount": 15
    }
  ]
}
```

This confirms the user's specific generated study pack can now be imported as structured Yanghoo data.

## Findings

### P1 - Scene Pack save uses the stale single-search query

In `EnglishSentenceSearch.tsx`, scene-pack result cards display the per-example query:

```tsx
query={activePack ? (activePack.examples[index]?.query || '') : query}
```

But the save handler still calls:

```ts
const res = await saveEnglishExample(result, query);
```

where `query` is the component's single-search input, often the default `would have`, not the scene-pack example query such as `wake up` or `get dressed`.

Impact:

- Saving from Scene Pack mode can persist examples under the wrong query metadata.
- Saved/review workflows later lose the reason the sentence was selected for the scene.
- This violates the intent that scene-pack examples remain tied to their originating query.

Required fix:

- Pass an explicit query into `toggleSave`, or derive it from active pack example by index/result key.
- Verify saving a scene-pack example stores the pack example query, not the current search input.

### P1 - UI does not group Scene Pack examples by query

The Stage 23 plan required scene-pack mode to:

```text
show query chips,
group examples by query
```

The implementation shows query chips, but renders all examples through the existing flat result list. The only query association is passed into each result card for highlighting.

Impact:

- The UI does not reflect the study-pack structure from Markdown.
- For the user request "对小孩早上起床的场景做筛选", examples for `wake up`, `get dressed`, `brush teeth`, etc. are mixed in one flat queue.
- This makes scene-based study weaker than the existing Markdown organization.

Required fix:

- In Scene Pack mode, render sections per query.
- Preserve click-to-play and save/copy actions within each query group.
- Keep regular single-query search unchanged.

### P2 - Stage 23 verification deletes its imported pack and does not prove persistent UI state

`scripts/ops/verify-stage23-english-scene-pack-ui.ts` imports `morning-routine-stage23-audit`, validates CLI list/show, then deletes it.

This proves import/list/show/delete, but it does not leave a pack visible in the UI. It also does not verify the user's actual `kid-wake-up-morning` pack.

Codex manually imported `kid-wake-up-morning` after the verification script. That imported runtime data is under `data/` and is intentionally not committed.

Required fix:

- Add a non-destructive smoke path or a separate check that can verify a known pack remains visible.
- Do not rely on deleted test data as evidence of current UI state.

### P2 - Build artifacts are tracked in the Stage 23 commit

The Stage 23 commit includes changes to `*.tsbuildinfo` files, even though `.gitignore` contains:

```text
*.tsbuildinfo
```

Examples from `git show --stat HEAD`:

```text
apps/api/tsconfig.tsbuildinfo
packages/application/tsconfig.tsbuildinfo
packages/domain/tsconfig.tsbuildinfo
packages/storage/tsconfig.tsbuildinfo
```

Required cleanup:

- Remove tracked `*.tsbuildinfo` files from the repository index in a follow-up commit if they are not intentionally versioned.
- Keep future build outputs out of commits.

## Boundary Review

Passed:

- UI/API consume structured JSON, not Markdown.
- Markdown remains an export artifact.
- `Anything-to-English` is not added as a workspace/package dependency.
- No write to `Anything-to-English/canonical` was observed.
- Real examples remain Yanghoo evidence.

Runtime note:

- The imported `kid-wake-up-morning` pack is local data under `data/learning/english-scene-packs/` and is ignored by git, as expected.

## Decision

Rejected pending follow-up.

The core Stage 23 data pipeline is valuable and mostly implemented, but the UI/data-integrity issues above should be fixed before calling the user-facing learning experience complete.

Required next step:

1. Fix Scene Pack save query metadata.
2. Group Scene Pack examples by query in the UI.
3. Add verification for the save-query behavior and grouped scene-pack rendering, at least with component/DOM or browser evidence.
4. Clean tracked `*.tsbuildinfo` artifacts in a follow-up commit.
5. Re-run Stage 23, Stage 22, typecheck, and build.
