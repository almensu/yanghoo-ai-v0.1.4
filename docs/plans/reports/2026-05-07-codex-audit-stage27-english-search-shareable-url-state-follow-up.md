# Codex Audit: Stage 27 English Search URL Restore Race Follow-up

Date: 2026-05-07
Auditor: Codex
Plan Reviewed: `docs/plans/2026-05-07-stage27-english-search-shareable-url-state-follow-up.md`
Report Reviewed: `docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-follow-up-report.md`
Verdict: Rejected pending second follow-up

## Findings

### P1 - URL writeback is still enabled before channel selection initialization completes

The follow-up added `initialStateRef` and changed channel initialization to use that preserved state. That fixes one part of the original bug: channel initialization no longer rereads a mutated `window.location.search`.

However, the follow-up plan also required:

```text
Do not run URL writeback until initial state restoration and channel selection initialization have completed.
```

Current code sets `isRestored` to true immediately after parsing scalar URL state:

- `apps/web/src/components/EnglishSentenceSearch.tsx:401` parses the URL.
- `apps/web/src/components/EnglishSentenceSearch.tsx:415` calls `setIsRestored(true)`.
- `apps/web/src/components/EnglishSentenceSearch.tsx:418` allows URL writeback once `isRestored` is true.
- `apps/web/src/components/EnglishSentenceSearch.tsx:436` starts async channel loading separately.
- `apps/web/src/components/EnglishSentenceSearch.tsx:445` restores URL `channels` only after `listLearningChannels()` returns.

Codex reproduced the remaining failure shape:

```bash
npx tsx -e "import { serializeEnglishSearchState } from './apps/web/src/utils/englishSearchUrlState.ts'; const afterInitialRestoreBeforeChannels = serializeEnglishSearchState({ q:'Linux', limit:50, diversity:'balanced', sort:'recent', captionKind:'all', category:'Education', tag:'Tutorial', channels:[], scenePack: undefined }).toString(); console.log(afterInitialRestoreBeforeChannels);"
```

Output:

```text
view=english-search&q=Linux&limit=50&category=Education&tag=Tutorial
```

Impact:

- The incoming URL's `channels=ch1%2Cch2` is still removed before channel initialization completes.
- The URL may eventually stabilize after channels load, but the task explicitly forbade first writeback before restore completion.
- A user copying the URL during slow channel loading can still get a broken share link without explicit channel constraints.
- The report's unresolved risk acknowledges this async timing gap, so this is not only theoretical.

Required fix:

- Replace `isRestored` with a restore state that only becomes true after channel selection initialization has completed.
- A simple shape would be `const [urlRestoreReady, setUrlRestoreReady] = useState(false);` and set it after `setSelectedChannelIds(...)` in the channel-loading effect.
- Ensure the no-channel/error path also resolves the gate intentionally.
- Keep using `initialStateRef` for channel restore.
- Add a verification case proving the first write is forbidden until the preserved initial channels have either been applied or intentionally fallen back.

### P1 - Scene-pack URL with `q` can still trigger normal search and overwrite scene-pack results

The follow-up contract required:

```text
If initial URL has scenePack:
- scenePack wins over q,
- normal query search must not overwrite scene-pack results after pack load.
```

Current search effect does not check `activePackId` or `activePack`:

- `apps/web/src/components/EnglishSentenceSearch.tsx:590` schedules a normal search whenever `selectedChannelIds.size > 0 && query.trim()`.
- `apps/web/src/components/EnglishSentenceSearch.tsx:482` loads the scene pack asynchronously and writes scene-pack results.
- `apps/web/src/components/EnglishSentenceSearch.tsx:560` normal search also writes `results`.

Impact:

- For a URL such as `/?view=english-search&scenePack=pack123&q=Linux`, both scene-pack loading and normal search can race.
- If the normal search resolves after the scene pack, `results` can contain normal search results while `activePack` remains set, causing grouped scene-pack rendering to pair pack queries with unrelated search results by index.
- This violates "scenePack wins over q."

Required fix:

- Suppress normal query search while `activePackId` is set.
- Optionally clear pending search timers when entering scene-pack mode.
- Add a verification or component-level proof that `scenePack + q` does not call normal search and scene-pack results remain authoritative.

### P1 - Model Battery remains non-compliant

The follow-up report still does not include the fields required by `reference/gemini-model-battery-protocol.md`:

- Flash usage percentage and reset time,
- Flash Lite usage percentage and reset time,
- Pro usage percentage and reset time,
- selected mode decision based on those values.

Instead it reports:

```text
Usage Percentage:
  - Input: ~30% (Estimated from session history)
  - Output: ~20% (Estimated from session history)
Reset Time: Not explicitly provided by system; assuming standard cycle.
```

Location:

- `docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-follow-up-report.md:7`

Impact:

- This is still not the protocol's Model Battery. Input/output token estimates are not a substitute for Gemini CLI model quota usage.
- The follow-up plan explicitly said Codex should reject if `Model Battery` is incomplete again.

Required fix:

- If Gemini can still access `/model`, update the report with the exact panel values.
- If exact values cannot be recovered, state that explicitly under `Model Battery` and include a process correction for the next Gemini task. Do not replace it with unrelated token estimates.

### P2 - Stage 27 verification still lacks the required first-mount regression

The follow-up plan required a regression for:

```text
input:  view=english-search&q=Linux&limit=50&category=Education&tag=Tutorial&channels=ch1%2Cch2
first URL write before restore completion: forbidden
restored channel initializer input: preserved initial state, not mutated location.search
```

Current `scripts/ops/verify-stage27-english-search-shareable-url-state.ts` only covers parser/serializer cases and failure exit behavior. It does not simulate restore gating or channel initialization.

Passed improvement:

- The script now exits non-zero when `failed` is true.

Remaining gap:

- It still would not catch either P1 behavior bug above.

Required fix:

- Extract small pure helpers if needed, for example:
  - `shouldWriteEnglishSearchUrl({ restoreReady })`,
  - `deriveInitialSelectedChannels(initialState, indexedChannels)`.
- Test the exact first-mount case with assertions.

## Checks Passed

Codex reran:

```bash
npx tsx scripts/ops/verify-stage27-english-search-shareable-url-state.ts
```

Result: all existing Stage 27 parser/serializer checks passed.

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

Result: no tracked or untracked `data/` changes shown.

## Boundary Review

Passed:

- Follow-up implementation stayed in the Stage 27 target area: `apps/web/src/components/EnglishSentenceSearch.tsx` and Stage 27 verification.
- No new domain/application/storage/API changes were introduced by the follow-up itself.

Needs follow-up:

- URL restore readiness is still modeled too coarsely. It marks scalar URL parsing complete, not full URL restore complete.
- Scene-pack mode still shares the normal query search effect without a guard.

## Gotcha Decision

Gotcha update needed: yes, after the code fix

Reason:

- This is now the second review cycle for the same first-mount URL writeback class of bug.
- Once the implementation is corrected, `docs/GOTCHAS.md` should record the durable rule: URL writeback effects must be gated until all async URL-dependent initialization has completed, especially channel lists or other indexed resources.

Target file:

```text
docs/GOTCHAS.md
```

## Required Second Follow-up

Gemini should submit a second narrow follow-up:

1. Gate URL writeback until channel selection initialization has completed, not just scalar URL parsing.
2. Preserve `channels` in the URL until valid channel IDs have been applied or an explicit fallback has been chosen.
3. Suppress normal query search while `activePackId` is set, so `scenePack + q` cannot race and overwrite pack results.
4. Add verification for the exact first-mount case required by the follow-up plan.
5. Add verification that `scenePack + q` does not run normal search or overwrite scene-pack results.
6. Correct the `Model Battery` section with exact `/model` data or an explicit unrecoverable-data note plus process correction.
7. Update `docs/GOTCHAS.md` with the async URL-writeback gotcha if the implementation confirms the pattern.
8. Re-run Stage 27 verification, Stage 26 regression, Stage 23 regression, Stage 25 regression, `npm run typecheck`, and `npm run build`.

## Decision

Stage 27 remains rejected pending a second follow-up.

The follow-up improved preserved-state usage and non-zero verification exits, and all build/regression commands passed. It does not yet satisfy the core restore-gating contract, and it leaves a scene-pack search race plus an incomplete Model Battery report.
