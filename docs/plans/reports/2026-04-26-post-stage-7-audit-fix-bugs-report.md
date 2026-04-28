# Post Stage 7 Audit Fix Bugs Report

## Summary
The critical behavior bugs and architectural regressions identified in the Post-Stage 7 audit have been addressed. The system now accurately refines transcript sentences and truthfully reports document readiness based on persisted assets.

## Key Fixes
- **Transcript Sentence Refinement**: Fixed the merging bug in `packages/transcript`. Complete sentences ending with punctuation are now flushed immediately. Verified with `scripts/ops/verify-refiner-fix.ts`.
- **Truthful Document Readiness**: 
  - Implemented `getDocumentReadiness` in `FileStorage`.
  - Updated API to derive task status from actual files (`transcript-sentences.json`, `document.md`, etc.).
  - Deleted legacy hardcoded status reporting in `apps/api/src/routes/tasks.ts`.
- **Architectural Integrity**: 
  - Removed Node `fs` usage from `packages/application`.
  - Application now interacts with documents via `documentStorage.getDocument()`.
- **Contract Unification**: Moved `ReadinessStatus` and `DocumentReadiness` to `@yanghoo/domain`, unifying the state model between backend and frontend.
- **Code Cleanup**: Removed obsolete service files in `apps/api/src/services/`.

## Verification Results
### Transcript Refiner Test
Command: `npx tsx scripts/ops/verify-refiner-fix.ts`
Output:
```text
PASS [two complete sentences]
PASS [merged fragments]
PASS [chinese punctuation]
PASS [unterminated final fragment]
All refiner tests passed!
```

### Build & Typecheck
All packages and applications built successfully.
```bash
npm run build && npm run typecheck # Result: Success
```

## Readiness Derivation
Status is now calculated as:
1. `markdown_ready`: if `document.md` exists.
2. `refined_ready`: if `transcript-sentences.json` exists.
3. `raw_ready`: if `transcript-raw.json` exists.
4. `metadata_only`: default captured state.

## Unresolved Risks
- Metadata fetching for short videos (Douyin/XHS) remains stubbed, but the infrastructure for reporting their readiness is now real.
