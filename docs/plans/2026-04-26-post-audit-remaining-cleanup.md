# Post Audit Remaining Cleanup

## Owner

Gemini implements. Codex reviews.

## Goal

Address the remaining architectural and behavioral issues found in the post-Stage 7 audit review.

## Tasks

### 1. Truthful Transcript Source Persistence (P1)

- Create a `transcript-manifest.json` structure to store transcript metadata (`sourceType`, `engine`, `language`).
- Update `packages/storage` to save this manifest during `saveTranscript`.
- Update `packages/storage` `getDocumentReadiness` to read this manifest and return the true `source`.

### 2. Frontend Readable Sync (P2)

- Update `apps/web/src/components/TaskCard.tsx` to only enable the "Read Transcript" action when the status is `markdown_ready` or `enriched`.
- This ensures the Reader modal doesn't open to an empty state.

### 3. Cleanup Stale Fixtures (P2)

- Re-run the transcription pipeline for the demo YouTube source (`yt-dQw4w9WgXcQ`) to ensure its `sentencesCount` reflects the fixed refiner logic.

## Acceptance Criteria

- `getDocumentReadiness().source` returns `platform_caption` for YouTube sources after transcription.
- `TaskCard` button correctly toggles between "Ensure" and "Read" based on *Markdown* presence.
- `yt-dQw4w9WgXcQ` record shows 4 sentences in the UI.
- Project passes `npm run typecheck`.

## Verification Commands

```bash
# Verify readiness source
node -e "import('@yanghoo/storage').then(async m=>console.log(await m.documentStorage.getDocumentReadiness('yt-dQw4w9WgXcQ')))"

# Regenerate fixture
npx tsx scripts/transcript/refine-transcript-sentences.ts yt-dQw4w9WgXcQ
```

## Report

Write report to:
`docs/plans/reports/2026-04-26-post-audit-remaining-cleanup-report.md`
