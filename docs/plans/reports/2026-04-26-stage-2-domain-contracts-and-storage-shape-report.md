# Stage 2 Completion Report: Domain Contracts and Storage Shape

## Summary
The core domain models and storage path contracts have been locked. This stage ensures that all subsequent platform-specific implementations (collectors, transcribers) follow a unified data structure and storage convention.

## Key Changes
- **Domain Refinement**: Expanded `Source`, `TranscriptAsset`, and `DocumentAsset` with fields for metadata, engine info, and status tracking.
- **Storage Contracts**: Defined `packages/domain/src/storage.ts` with helper functions for canonical file paths:
  - Records: `data/sources/{id}/record.json`
  - Transcripts: `transcript-raw.json`, `transcript-sentences.json`, `transcript.vtt`
  - Documents: `document.md`
- **Application Logic**: Updated use case stubs in `packages/application` to comply with new type definitions.
- **Storage Interface**: Created `packages/storage` interface skeletons for Source, Transcript, and Document persistence.
- **App Alignment**: Synchronized `apps/api` and `apps/web` types, ensuring the entire workbench is ready for real data ingestion.

## Verification Output
### npm run build
```text
(All packages and apps built successfully in the correct dependency order)
```

### npm run typecheck
```text
(Project-wide typecheck passed)
```

## Next Steps
- Codex should review this report and prepare the Stage 3 plan for **URL Collectors** (starting with YouTube and Xiaoyuzhou).
