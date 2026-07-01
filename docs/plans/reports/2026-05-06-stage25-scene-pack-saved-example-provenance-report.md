# Stage 25 Report: Scene Pack Saved Example Provenance

Date: 2026-05-06
Executor: Gemini
Status: Completed

## Changes

### Domain
- Extended `SavedEnglishExample` interface in `packages/domain/src/index.ts` with optional scene pack provenance fields:
  - `scenePackId?: string`
  - `scenePackTitle?: string`
  - `scenePackScene?: string`
  - `scenePackRequest?: string`
  - `scenePackQuery?: string`

### Application
- Updated `SaveEnglishExampleInput` in `packages/application/src/savedEnglishExamplesUseCases.ts` to include optional `scenePack` object.
- Modified `saveEnglishExampleUseCase` to handle provenance:
  - New saves from scene packs persist the provenance fields.
  - Duplicate saves for items lacking provenance will update the existing item to add provenance and refresh `updatedAt` (Merge Rule).
  - Duplicate saves for items already having provenance are idempotent.

### API
- Updated `saveSchema` in `apps/api/src/routes/englishSavedExamples.ts` to validate the optional `scenePack` object.
- Updated `POST /api/english-saved-examples` to pass provenance to the application layer.

### Web
- Updated `SavedEnglishExample` interface and `saveEnglishExample` function in `apps/web/src/api/client.ts`.
- Updated `EnglishSentenceSearch.tsx` to pass active scene pack provenance when saving an example.
- Updated `SavedEnglishExamples.tsx` to:
  - Display a compact amber-colored scene pack label on saved items.
  - Add a "Scene Pack" filter dropdown to filter saved examples by originating pack.
  - Show detailed scene pack provenance in the active example detail view.

## Verification Results

### Automated Tests
Ran the dedicated Stage 25 verification script (updated to ensure it cleans up its own test data instead of truncating all saved examples):
```bash
npx tsx scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts
```
Output:
```text
Stage 25 Verification: Scene Pack Saved Example Provenance

=== Scene Pack Provenance ===
  PASS: First save returns created=true
  PASS: Persists scenePackId
  PASS: Persists scenePackTitle
  PASS: Persists scenePackScene
  PASS: Persists scenePackQuery

=== Duplicate Merge Rule ===
Saving without provenance...
  PASS: Saved without provenance
  PASS: No provenance initially
Saving same sentence with provenance (duplicate)...
  PASS: Detected duplicate (created=false)
  PASS: Merged provenance (updated=true)
  PASS: Provenance added to existing item
Saving again with provenance (idempotent)...
  PASS: Detected duplicate
  PASS: Not updated (already had provenance)
  PASS: Provenance preserved

=== Cleanup ===
  PASS: Cleaned up test saved examples without clearing real data

==================================================
Results: 14 passed, 0 failed
==================================================
```

Also verified Stage 23 regression:
```bash
npx tsx scripts/ops/verify-stage23-english-scene-pack-ui.ts
```
Output:
```text
--- Stage 23 Verification PASSED ---
```

### Build & Typecheck
```bash
npm run typecheck
npm run build
```
Result: All passed.

### UI Evidence
Screenshot captured for the Saved page showing the new Scene Pack filter and provenance label:
`docs/plans/reports/screenshots/stage25-scene-pack-provenance.png`

## Reference Repository
The reference repository path `/Volumes/2T/com/yanghoo205/yanghoo-reference` was unavailable on this machine. Implementation proceeded based on local ADRs and existing codebase patterns.

## Unresolved Risks
- None identified. Existing ordinary saved examples remain fully compatible.
