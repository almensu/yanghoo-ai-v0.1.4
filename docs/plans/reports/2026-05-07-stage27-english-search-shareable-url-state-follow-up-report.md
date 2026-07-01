# Stage 27 Follow-up Report: Fix English Search URL Restore Race

Date: 2026-05-07
Executor: Gemini
Status: Completed

## Model Battery

- `gemini --yolo`: Confirmed
- `/model`: Gemini 2.0 Flash Thinking
- Local Time: 2026-05-07 12:20 (Thursday)
- Usage Percentage: 
  - Input: ~30% (Estimated from session history)
  - Output: ~20% (Estimated from session history)
- Reset Time: Not explicitly provided by system; assuming standard cycle.
- Model Decision: Implement `isRestored` flag and `initialStateRef` to solve initialization race condition in `EnglishSentenceSearch.tsx`.
- Reason: The audit found that default component states could overwrite incoming shared URL parameters on first mount before restoration effects could finish.

## Summary

Repaired the Stage 27 URL synchronization logic to prevent default states from overwriting deep-linked parameters on initial mount. 

Key improvements:
- **Initialization Guard**: Added `isRestored` state flag to `EnglishSentenceSearch.tsx` to block URL writebacks until initial restore is complete.
- **State Preservation**: Introduced `initialStateRef` to capture `window.location.search` exactly once on mount, ensuring consistent restoration of channels, categories, and tags even after the URL starts being updated.
- **Robust Channel Restore**: Refactored `listLearningChannels` effect to use `initialStateRef`, preventing race conditions with the URL-writing effect.
- **Non-zero Exit**: Updated `scripts/ops/verify-stage27-english-search-shareable-url-state.ts` to exit with code 1 if any assertion fails.

## Changed Files

- `apps/web/src/components/EnglishSentenceSearch.tsx`: Implemented `isRestored` guard and `initialStateRef` logic.
- `scripts/ops/verify-stage27-english-search-shareable-url-state.ts`: Strengthened assertions and added non-zero exit code on failure.

## Behavior Evidence

### Initial URL Preservation
The `isRestored` flag ensures that the first `useEffect` (restoration) finishes before the second `useEffect` (sync) can call `updateUrl`. This protects the incoming query string.

### Channel Restore from Initial State
By using `initialStateRef.current` inside the `listLearningChannels` callback, the component correctly filters and selects channels based on the *original* URL, even if the address bar has already been updated by other state changes.

## Verification

All tests passed with zero regressions:

```text
--- Stage 27 Verification: English Search Shareable URL State ---
  PASS: Parse Stage 26 basic query
  PASS: Serialize full state
  PASS: Parse Scene Pack + q
  PASS: Precedence Check: scenePack is present
  PASS: Invalid enums fallback (should be empty)
  PASS: Omit default values in serialization
--- Verification Complete: ALL PASSED ---

Stage 26 Verification: English Search Deeplink Command
Results: 13 passed, 0 failed

Stage 23 Verification: English Scene Pack UI Integration
✅ Wrapper import successful
✅ Storage content validated
✅ CLI list/show verified
✅ Saved example verified with query: brush my teeth
✅ Deletion and cleanup verified
--- Stage 23 Verification PASSED ---

Stage 25 Verification: Scene Pack Saved Example Provenance
Results: 14 passed, 0 failed

npm run typecheck: PASS
npm run build: PASS (dist/assets/index-j73M0_hK.js built)
```

## Data / Artifact Evidence

- `apps/web/src/components/EnglishSentenceSearch.tsx`: Lines 401-460 show the refined hook orchestration.
- `scripts/ops/verify-stage27-english-search-shareable-url-state.ts`: Lines 59-62 implement the `process.exit(1)` failure signaling.

## Unresolved Risks

- **Async Timing**: While `isRestored` prevents immediate overwrite, if `listLearningChannels` takes an extremely long time, some partial state updates might still occur. However, since `selectedChannelIds` is part of the sync dependency, the URL will eventually stabilize correctly.

## Gotcha Decision

No new durable gotchas discovered in the follow-up. The existing Stage 27 note in `docs/GOTCHAS.md` remains accurate.
