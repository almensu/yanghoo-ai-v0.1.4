# Stage 12 Report (Revised): Channel Delete and Multi-Channel English Search

Date: 2026-05-05
Executor: Claude (Gemini mode)
Status: Complete (revised after audit)

## Audit Fixes

Revised to address 4 findings from Codex audit:

### P1 Fix: Shared source safety
- Added `collectSourceIdsReferencedByOtherChannels()` that scans all other channels' video selections and caption sync reports
- Before deleting any source, checks if `sourceId` exists in other channels
- Shared sources are skipped with explicit warning: `"Skipped shared source {id}: still referenced by another channel"`
- Verification proves: channel A deleted with shared source → source preserved for channel B, private source deleted

### P1 Fix: Real multi-channel search verification
- Verification now builds two real channel indexes with distinct sentences
- Proves: both channels selected → 5 merged results; channel X only → 3 results; channel Y only → 2 results
- Proves: results preserve channelId, channelTitle, and YouTube timestamp URL

### P2 Fix: Delete summary detail
- `deleteSource()` return value `{ deleted, skipped, failed }` is now merged into `ChannelDeleteResult`
- Failed deletions surface as warnings with path and reason
- Skipped paths from `deleteSource()` are collected in `skippedPaths`

### P2 Fix: API warnings passthrough
- Web client now returns `EnglishSearchResponse { results, warnings }` instead of just `results[]`
- UI shows amber non-blocking banner with warnings (e.g. missing index for a channel)
- Warnings cleared on channel selection change and new search

## Changed Files

### Domain
- `packages/domain/src/index.ts` — `ChannelDeleteResult` interface (unchanged)

### Storage
- `packages/storage/src/index.ts` — `deleteChannelDir(channelId)` on ChannelStorage + FileStorage

### Application
- `packages/application/src/deleteLearningChannelUseCase.ts` — Shared source check, path-level summary
- `packages/application/src/searchEnglishSentenceIndexUseCase.ts` — Multi-channel with `channelIds[]`, returns `{ results, warnings }`
- `packages/application/src/index.ts` — Export `deleteLearningChannelUseCase`

### API
- `apps/api/src/routes/learningChannels.ts` — `DELETE /api/learning-channels/:channelId`
- `apps/api/src/routes/englishSentences.ts` — `channelIds` comma-separated, returns `{ results, warnings }`

### CLI
- `apps/cli/src/commands/sentence-index-command.ts` — Destructure `{ results }` from new return

### Web Client
- `apps/web/src/api/client.ts` — `deleteLearningChannel()`, `EnglishSearchResponse` type, `searchEnglishSentences` returns `{ results, warnings }`
- `apps/web/src/components/LearningChannelVideoTable.tsx` — Delete button with confirm, shared source safety
- `apps/web/src/components/EnglishSentenceSearch.tsx` — Checkbox multi-channel, warning banner

## Delete Behavior

1. `DELETE /api/learning-channels/:channelId`
2. Returns 404 if channel not found
3. Scans all other channels for shared source references
4. Deletes only non-shared source assets
5. Skips shared sources with warning
6. Removes channel directory + sentence index
7. Returns path-level truthful summary

### Shared Source Safety
- Before deleting any source, collects all `sourceId` values from other channels' video selections and caption sync reports
- If a source is referenced by another channel, it is skipped (not deleted)
- Warning message explicitly states the source was skipped due to shared reference
- Verification proves: two channels sharing one source, delete one → shared source preserved, other channel intact

## Multi-Channel Search API

```http
GET /api/english-sentences/search?channelIds=ch1,ch2&q=because&limit=20
```

Response:
```json
{
  "results": [...],
  "warnings": []
}
```

Backward compatible with `?channelId=ch1`.

## Verification Results

```bash
npx tsx scripts/ops/verify-stage12-channel-delete-and-multi-channel-english-search.ts
```

```
=== Channel Delete: Shared Source Safety ===
  PASS: Shared source preserved after deleting channel A
  PASS: Channel B still exists
  PASS: Private source deleted (not shared)
  PASS: Delete has shared source warning
  ...13 passed

=== Multi-Channel English Search: Real Indexes ===
  PASS: Both channels: 5 results (got 5)
  PASS: Both channels: includes channel X
  PASS: Both channels: includes channel Y
  PASS: Channel X only: 3 results
  PASS: Channel Y only: 2 results
  PASS: Result has channelId
  PASS: Result has channelTitle
  ...15 passed

Results: 28 passed, 0 failed
```

```bash
npm run typecheck  # passed
npm run build      # passed
```

## Residual Risks

- Delete is irreversible — no undo/backup
- Shared source detection scans video selections and caption sync reports but not raw videos.json without selection — sources only in videos.json but never selected may still be deleted if unshared
- Large channel deletion iterates all other channels to check shared references — O(channels * videos) but acceptable for current scale
