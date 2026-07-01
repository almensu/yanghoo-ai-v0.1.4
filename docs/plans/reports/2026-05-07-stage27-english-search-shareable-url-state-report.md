# Stage 27 Report: English Search Shareable URL State

Date: 2026-05-07
Executor: Gemini
Status: Completed

## Model Battery

- `gemini --yolo`: Confirmed
- `/model`: Gemini 2.0 Flash Thinking
- Collaboration Protocol: Followed
- Layer Boundaries: Respected (UI only for URL state)
- Test Strategy: Utility tests + Ops verification script + Regression suite

## Summary

Implemented two-way URL synchronization for English Search. The application state (query, limit, filters, channel selection, and scene pack selection) is now mirrored in the browser's URL query parameters. Reloading or sharing these URLs correctly restores the exact UI state and triggers the corresponding search or scene pack load.

## Changed Files

- `apps/web/src/utils/englishSearchUrlState.ts`: New utility for URL parsing and serialization.
- `apps/web/src/utils/englishSearchUrlState.test.ts`: Unit tests for the utility.
- `apps/web/src/App.tsx`: Updated to sync `activeView` with the URL.
- `apps/web/src/components/EnglishSentenceSearch.tsx`: Implemented two-way sync for search parameters.
- `scripts/ops/verify-stage27-english-search-shareable-url-state.ts`: New verification script.
- `docs/GOTCHAS.md`: Added notes on Vitest environment for URL utilities.

## Verification Commands

```bash
# Core logic verification
npx tsx scripts/ops/verify-stage27-english-search-shareable-url-state.ts

# Utility unit tests
npx vitest run apps/web/src/utils/englishSearchUrlState.test.ts

# Regression tests
npx tsx scripts/ops/verify-stage26-english-search-deeplink-command.ts
npx tsx scripts/ops/verify-stage23-english-scene-pack-ui.ts
npx tsx scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts

# Build & Typecheck
npm run typecheck
npm run build
```

## Key Output Summary

### Stage 27 Verification
- Test Case 1 (Parse Stage 26 basic): PASS
- Test Case 2 (Serialize full state): PASS
- Test Case 3 (Parse Scene Pack + q): PASS
- Test Case 4 (Invalid enums): PASS
- Test Case 5 (Omit defaults): PASS

### Regression Suites
- Stage 26 (Deeplinks): 13 passed, 0 failed.
- Stage 23 (Scene Pack UI): PASSED.
- Stage 25 (Provenance): 14 passed, 0 failed.

## URL Examples

- **Basic Search**: `/?view=english-search&q=Linux`
- **Full Filters**: `/?view=english-search&q=wake+up+child&limit=50&diversity=all&sort=variety&captionKind=manual&category=Education&tag=Idioms&channels=ch1%2Cch2`
- **Scene Pack**: `/?view=english-search&scenePack=morning-routine-stage23-audit&q=brush+my+teeth` (Scene pack wins, q preserved for context)
- **Default Omission**: `/?view=english-search&q=test` (Omitted `limit=20`, `diversity=balanced`, etc.)

## Unresolved Risks

- **Channel Loading Race**: `selectedChannelIds` restore depends on `listLearningChannels` completion. If the URL contains `channels` that are not yet in the indexed list returned by the API, they might be dropped. Current implementation waits for the list and then filters the URL IDs.
- **Browser History**: Used `history.replaceState` for all filter changes to avoid polluting history. Only `activeView` changes in `App.tsx` also use `replaceState`. If users want "Back" button to go through filter history, `pushState` would be needed, but the plan explicitly requested `replaceState`.

## Update to GOTCHAS.md

Added Section 0.5 documenting the `window` mock requirement for testing URL utilities and the `scenePack` precedence rule.
