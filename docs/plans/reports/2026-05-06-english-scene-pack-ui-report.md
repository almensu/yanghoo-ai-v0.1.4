# Stage 23 Report: English Scene Pack UI Integration

Date: 2026-05-06
Executor: Gemini
Status: Completed

## Overview

Successfully integrated "English Scene Packs" as a first-class citizen in Yanghoo AI. This stage bridges the gap between structured evidence generation and a playable, saveable UI experience. Users can now import scene briefs and evidence packs directly into Yanghoo and study them in a dedicated mode within the English Search UI.

## Changes Applied

### Domain & Storage
- **`EnglishScenePack` Model**: Defined a structured data model for scene packs, including queries, examples, and metadata.
- **Structured Storage**: Implemented `FileEnglishScenePackStorage` to manage JSON-based persistence in `data/learning/english-scene-packs/`.
- **Index Management**: Added an index file for fast listing of available packs.

### Application Layer
- **Use Cases**: Implemented `importEnglishScenePackUseCase`, `listEnglishScenePacksUseCase`, `getEnglishScenePackUseCase`, and `deleteEnglishScenePackUseCase`.
- **Playable Mapping**: The import logic automatically calculates `youtubeEmbedUrl` and `startSeconds` for each evidence example.

### CLI Layer
- **`english-scene-packs` Command**: Added subcommands for `import`, `list`, `show`, and `delete`.
- **Integrated with `cli-command-registry`**: Seamlessly registered for user consumption.

### API Layer
- **Fastify Routes**: Added `GET /api/english-scene-packs`, `GET /api/english-scene-packs/:id`, and `DELETE /api/english-scene-packs/:id`.

### Web Layer
- **`EnglishSentenceSearch.tsx` UI**:
  - Added a **Scene Packs** sidebar section to list imported packs.
  - Implemented **Scene Pack Mode**: selecting a pack displays its title, user request, and query chips.
  - **Playable Examples**: Pack examples are mapped to search results, allowing them to be played in the existing video panel and saved as learning evidence.
  - **Self-Cleaning UI**: Added a delete button for scene packs directly in the sidebar.

### External Skill
- **`balance-study-pack.mjs`**:
  - Added `--import-yanghoo` flag to automatically import structured results after generation.
  - Added `--request <text>` to preserve the user's intent in the imported pack.

## Verification Details

### Execution Trace (Verification Script)
```text
--- Verifying Stage 23: English Scene Pack UI Integration ---
1. Running wrapper with --import-yanghoo...
[1/4] Extracting scene brief from Scene.MorningRoutine.md...
[2/4] Searching Yanghoo AI for evidence...
[3/4] Building study pack to .../morning-routine-stage23-audit.md...
[4/4] Importing structured pack into Yanghoo AI...
✅ Wrapper import successful
2. Verifying storage files...
✅ Storage content validated
3. Verifying CLI list/show...
✅ CLI list/show verified
4. Verifying Scene Pack deletion...
✅ Deletion verified

--- Stage 23 Verification PASSED ---
```

### Full Verification Suite Results
- `scripts/ops/verify-stage23-english-scene-pack-ui.ts`: **PASSED**
- `scripts/ops/verify-stage22-yanghoo-english-balance-query-quality.ts`: **PASSED**
- `npm run typecheck`: **PASSED**
- `npm run build`: **PASSED**

## UI Behavior Summary
- Scene packs appear in the left sidebar under a new "Scene Packs" heading.
- Clicking a pack populates the "Sentence queue" with the curated evidence.
- The player panel correctly identifies the start times and URLs for all pack examples.
- The user can toggle back to regular search using the "Back to Search" link.

## Unresolved Risks
- **Large Pack Performance**: Very large scene packs (e.g., >100 examples) may impact UI rendering speed in the current flat-list implementation.
- **Manual Cleanup**: While the UI allows deletion, periodic cleanup of orphaned `/tmp` artifacts from the wrapper might be needed.

## Conclusion
Yanghoo AI now supports a complete "Anything Scene -> Yanghoo Evidence -> Playable UI Pack" loop, fulfilling the primary requirement for an integrated learning experience.
