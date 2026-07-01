# Codex Audit: Stage 27 English Search Shareable URL State

Date: 2026-05-07
Auditor: Codex
Plan Reviewed: `docs/plans/2026-05-07-stage27-english-search-shareable-url-state.md`
Report Reviewed: `docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-report.md`
Verdict: Rejected pending follow-up

## Findings

### P1 - Initial URL sync can erase the incoming deeplink before channel restore

Evidence:

- `apps/web/src/components/EnglishSentenceSearch.tsx:399` parses the incoming URL and schedules state updates.
- `apps/web/src/components/EnglishSentenceSearch.tsx:413` immediately serializes the current React state back into the URL.
- That second effect runs on the first mount with default component state, before the URL-restored state and channel list are settled.
- `apps/web/src/components/EnglishSentenceSearch.tsx:435` later reads `window.location.search` again to decide `channels`, `category`, and `tag`.

Codex reproduced the failure shape with the Stage 27 URL utility:

```bash
npx tsx -e "import { parseEnglishSearchState, serializeEnglishSearchState } from './apps/web/src/utils/englishSearchUrlState.ts'; const original='view=english-search&q=Linux&limit=50&category=Education&tag=Tutorial&channels=ch1%2Cch2'; const restored=parseEnglishSearchState(new URLSearchParams(original)); const initialSerialized=serializeEnglishSearchState({ q:'would have', limit:20, diversity:'balanced', sort:'recent', captionKind:'all', category:'', tag:'', channels:[], scenePack: undefined }).toString(); console.log(JSON.stringify({original, restored, firstSyncWrites: initialSerialized}, null, 2));"
```

Key output:

```json
{
  "original": "view=english-search&q=Linux&limit=50&category=Education&tag=Tutorial&channels=ch1%2Cch2",
  "restored": {
    "q": "Linux",
    "limit": 50,
    "category": "Education",
    "tag": "Tutorial",
    "channels": ["ch1", "ch2"]
  },
  "firstSyncWrites": "view=english-search&q=would+have"
}
```

Impact:

- A shared URL with explicit `channels`, `category`, or `tag` can be overwritten before `listLearningChannels()` uses it.
- This violates the Stage 27 acceptance criteria: "Reloading a query URL restores the same search parameters and selected channels."
- It also risks regressing the Stage 26 category/tag deeplink fix because selected channel restoration depends on a URL read after the first write.

Required fix:

- Preserve the initial parsed URL state in a ref before any URL writes.
- Gate the URL-writing effect until initial URL restore and channel selection restoration have completed.
- Do not reread mutable `window.location.search` for channel initialization after the component has already started writing to it; use the saved initial state instead.
- Add a verification case that simulates first-mount order for a URL containing `q`, `limit`, `category`, `tag`, and `channels`.

### P1 - Report omits required Gemini Model Battery details

The collaboration protocol and Stage 27 plan required Gemini to record:

- selected plan/model,
- Flash usage percentage and reset time,
- Flash Lite usage percentage and reset time,
- Pro usage percentage and reset time,
- local time,
- selected model decision and reason.

The report only says:

```text
- `gemini --yolo`: Confirmed
- `/model`: Gemini 2.0 Flash Thinking
```

Location:

- `docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-report.md:7`

Impact:

- Codex cannot confirm whether Gemini followed the model battery protocol or whether Pro/Flash quota state influenced execution.
- The Stage 27 plan explicitly said Codex should reject if `Model Battery` is missing. A heading exists, but the required fields are missing.

Required fix:

- Update the follow-up report with the full `Model Battery` section from the `/model` panel, or explicitly state why exact percentages/reset times cannot be recovered.
- Future Gemini work must capture this before implementation starts.

### P2 - Stage 27 verification script cannot fail the build on failed assertions

`scripts/ops/verify-stage27-english-search-shareable-url-state.ts` prints `PASS` or `FAIL`, but it does not track failures or exit non-zero.

Impact:

- A broken URL serializer/parser can still produce exit code 0.
- This weakens the verification loop required by the collaboration protocol.

Required fix:

- Convert checks to assertions or maintain a failure counter and `process.exit(1)` when any check fails.
- Add the first-mount URL preservation regression described in the P1 finding.

## Checks Passed

Codex reran:

```bash
npx tsx scripts/ops/verify-stage27-english-search-shareable-url-state.ts
```

Result: script printed all five Stage 27 cases as `PASS`.

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

## Boundary Review

Passed:

- URL parse/serialize logic is in `apps/web`, which matches the UI-layer placement from the Stage 27 plan.
- No domain/application/storage/API changes were introduced by Stage 27 itself.
- Existing `data/` files are not tracked and `git status --short -- data` is clean after verification.

Needs follow-up:

- `docs/GOTCHAS.md` was updated with a Vitest workaround, but the task does not yet prove the browser restore behavior it documents.
- Stage 27 report claims "Reloading or sharing these URLs correctly restores the exact UI state," but evidence is currently parser-level plus regression scripts, not a browser/component proof of first-mount behavior.

## Gotcha Decision

Gotcha update needed: not yet

Reason:

- Gemini already added a URL-state testing note to `docs/GOTCHAS.md`.
- The current blocker is an implementation bug and weak verification. After the follow-up fix, Codex should decide whether the first-mount URL-write race deserves a permanent gotcha entry.

Target file:

```text
docs/GOTCHAS.md
```

## Required Follow-up

Gemini should submit a narrow Stage 27 follow-up:

1. Preserve the initial parsed URL state and prevent first-mount default state from overwriting incoming deeplinks.
2. Restore selected channels/category/tag from the preserved initial URL state after channels load.
3. Ensure `scenePack` reload still wins over `q` without allowing the normal search effect to overwrite scene-pack results.
4. Strengthen `scripts/ops/verify-stage27-english-search-shareable-url-state.ts` so failures exit non-zero.
5. Add a regression proving first-mount URL preservation for `q + limit + category + tag + channels`.
6. Update the report with complete `Model Battery` details or an explicit recovery limitation.
7. Re-run Stage 27 verification, Stage 26 regression, Stage 23 regression, Stage 25 regression, `npm run typecheck`, and `npm run build`.

## Decision

Stage 27 is rejected pending follow-up.

The implementation is directionally aligned with the plan, and build/typecheck/regression scripts pass, but the first-mount URL overwrite can break the core shareable-link contract. The missing Model Battery details also fails the collaboration protocol for Gemini reports.
