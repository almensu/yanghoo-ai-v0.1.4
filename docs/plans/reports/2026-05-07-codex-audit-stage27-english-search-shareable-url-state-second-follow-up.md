# Codex Audit: Stage 27 English Search URL State Second Follow-up

Date: 2026-05-07
Auditor: Codex
Plan Reviewed: `docs/plans/2026-05-07-stage27-english-search-shareable-url-state-follow-up.md`
Prior Audit: `docs/plans/reports/2026-05-07-codex-audit-stage27-english-search-shareable-url-state-follow-up.md`
Report Reviewed: `docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-second-follow-up-report.md`
Verdict: Accepted with cleanup note

## Findings

No blocking findings remain for the Stage 27 restore-gating contract.

### P2 - Search guard should include complete React callback dependencies

`runSearch` now correctly returns early when `activePackId` is set:

```ts
if (activePackId) return;
```

Location:

- `apps/web/src/components/EnglishSentenceSearch.tsx:549`

However, `activePackId` is not included in the `runSearch` dependency array at `apps/web/src/components/EnglishSentenceSearch.tsx:589`.

Impact:

- The main scene-pack search race is mitigated by the additional trigger-effect guard at `apps/web/src/components/EnglishSentenceSearch.tsx:597` and `scheduleSearch` guard at `apps/web/src/components/EnglishSentenceSearch.tsx:591`.
- A stale callback risk remains around direct `runSearch` callers such as `loadMore`. In the current UI, `loadMore` is hidden in scene-pack rendering, so this is not an acceptance blocker.

Recommended cleanup:

- Add `activePackId` to the `runSearch` dependency array in a small hygiene pass.
- Consider clearing pending `timerRef` when `activePackId` becomes truthy.

## Checks Passed

Codex inspected the second follow-up implementation:

- `apps/web/src/components/EnglishSentenceSearch.tsx`
- `scripts/ops/verify-stage27-english-search-shareable-url-state.ts`
- `docs/GOTCHAS.md`
- `docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-second-follow-up-report.md`

The original P1 URL overwrite bug is addressed:

- `initialStateRef` captures incoming URL state once.
- URL writeback returns early while `isRestored` is false.
- `setIsRestored(true)` now runs only after `listLearningChannels()` completes channel restore or explicit fallback.
- Channel restore uses `initialStateRef.current`, not mutable `window.location.search`.

The original P1 scene-pack race is addressed for normal search triggers:

- `runSearch` returns early when `activePackId` is set.
- `scheduleSearch` returns early when `activePackId` is set.
- The search trigger effect returns early when `activePackId` is set.

Codex reran:

```bash
npx tsx scripts/ops/verify-stage27-english-search-shareable-url-state.ts
```

Result: all Stage 27 checks passed, including Test Cases 6, 7, and 8.

Codex reran:

```bash
npx vitest run apps/web/src/utils/englishSearchUrlState.test.ts
```

Result: 1 test file passed, 9 tests passed.

Codex reran:

```bash
npx tsx scripts/ops/verify-stage26-english-search-deeplink-command.ts
```

Result: 13 passed, 0 failed.

Codex reran:

```bash
npx tsx scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts
```

Result: 14 passed, 0 failed.

Codex reran:

```bash
npx tsx scripts/ops/verify-stage23-english-scene-pack-ui.ts
```

Result: Stage 23 verification passed.

Codex reran:

```bash
npm run typecheck
```

Result: passed across workspaces.

Codex reran:

```bash
npm run build
```

Result: passed across workspaces; web build transformed 1590 modules and completed successfully.

Codex checked:

```bash
git status --short -- data
```

Result: no `data/` changes shown.

## Model Battery Review

The report states that exact `/model` quota values were unavailable in the current environment:

```text
Model Battery: Pro usage is currently unavailable due to technical limitations in the current environment
```

This is not ideal, but the second follow-up explicitly records the limitation instead of substituting unrelated token estimates. Codex accepts this for the current follow-up because the remaining implementation scope was narrow and mechanically verifiable.

Future Gemini reports should still capture the exact Flash / Flash Lite / Pro usage percentages and reset times whenever the `/model` panel exposes them.

## Gotcha Decision

Gotcha update needed: yes

Status: completed

Target file:

```text
docs/GOTCHAS.md
```

Codex verified the new English Search URL State note now includes the durable async writeback rule:

- URL writeback must be blocked until all URL-dependent async initialization completes.
- `isRestored` or an equivalent restore-ready state must gate URL sync effects.

## Boundary Review

Passed:

- Stage 27 URL state remains in the Web UI layer.
- No new domain/application/storage/API changes were required for the second follow-up.
- Runtime `data/` files were not modified.
- The reference repository was used only as advisory guidance; no implementation was copied.

## Decision

Stage 27 is accepted with cleanup note.

The core shareable URL contract is now satisfied for the audited scope:

- query/filter/channel URL state is not overwritten before async channel restore,
- scene-pack mode suppresses normal query searches,
- verification exits non-zero on failed checks,
- Stage 23/25/26 regressions and build/typecheck pass.

Cleanup note:

- Add `activePackId` to the `runSearch` dependency array to remove the remaining stale-closure risk.
