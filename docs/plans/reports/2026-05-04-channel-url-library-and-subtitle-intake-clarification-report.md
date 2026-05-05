# Stage 9 Report: Channel URL Library and Subtitle Intake Clarification

Date: 2026-05-04
Executor: Claude
Plan: `docs/plans/2026-05-04-stage-channel-url-library-and-subtitle-intake-clarification.md`

## Changed Files

### Modified Files

| File | Change |
|------|--------|
| `apps/web/src/components/LearningChannelLibrary.tsx` | Title → "Channel URL Library", button → "Add Channel URL", card labels "Videos"→"URLs", "Captions"→"Subtitles", description updated |
| `apps/web/src/components/LearningChannelVideoTable.tsx` | Added three visual section labels (URL Library, Selection, Subtitle Sync), "Sync English Captions"→"Sync English Subtitles", column header "Caption"→"Subtitle", subtitle count in header |

### New Files

| File | Layer | Purpose |
|------|-------|---------|
| `scripts/ops/verify-stage9-channel-url-library-and-subtitle-intake-clarification.ts` | Scripts | 31-assertion deterministic verification script |

## User Flow Wording

The Channels surface now reads as a three-step workflow:

### Step 1: URL Library
- Header: channel title + "{N} URLs"
- "Refresh URLs" button (latest mode) + "Full refresh" button with limit input
- Filter bar: All / New / Selected / Caption Ready / Failed / Remote Missing
- Table shows video URLs with discovery badges (NEW, MISSING)

### Step 2: Selection
- Controls: Select All, Select New, Select first 20/50/100, Clear selected
- Selection count shown inline

### Step 3: Subtitle Sync
- Batch size input + "Sync English Subtitles" button
- "Build Index" button
- Results shown inline

## Batch Selection and Subtitle Sync Behavior

Unchanged from Stage 8. Selection calls `updateVideoSelection(channelId, videoIds, selected)`. Sync calls `syncSelectedCaptions(channelId, batchSize)` which only processes selected URLs.

## Verification Commands Run

```bash
npx tsx scripts/ops/verify-stage9-channel-url-library-and-subtitle-intake-clarification.ts  # 31/31 passed
npm run typecheck  # passed
npm run build      # passed
```

## Proof That Machine Translation Outside Channels Still Exists

- Test 4: `apps/api/src/routes/tasks.ts` still contains translation endpoints
- Test 5: `apps/web/src/components/TaskCard.tsx` and `Reader.tsx` still reference translation
- Test 7: `packages/domain/src/index.ts` still exports `TranslationStatus` type
- Test 8: `packages/application/src/index.ts` still exports translation use cases

## Skipped Checks

- **Browser screenshots**: Visual section labels use Tailwind text sizing. Visual check recommended during user testing.
- **API smoke**: No new API endpoints in Stage 9. Only UI wording and visual labels changed.

## Residual Risks

1. **Section labels are purely visual**: The three section labels (URL Library, Selection, Subtitle Sync) are `<p>` elements, not `<fieldset>` or `<section>`. Screen readers may not announce them as sections.

2. **"Caption" still appears in API and internal types**: The API route is still `/sync-captions`, the domain type is still `captionStatus`. Only the UI-facing labels changed to "Subtitle". A full rename would require a broader migration across domain/storage/application layers.
