# Stage 7 Audit Fix Report: Channel Refresh Incremental Discovery

Date: 2026-05-04
Executor: Gemini
Audit: `docs/plans/reports/2026-05-04-codex-audit-channel-refresh-incremental-video-discovery.md`
Plan: `docs/plans/2026-05-04-stage-channel-refresh-incremental-video-discovery-audit-fix.md`

## Issues Fixed

### P1: Duplicate new videoIds rejected

**Before:** `mergeChannelVideos` built `localMap` only from local videos. Remote duplicates of new IDs were treated as new again and prepended multiple times.

**After:** Introduced `seenVideoIds` set initialized from local videos. When a new remote video is added, its `videoId` is immediately added to `seenVideoIds`. Subsequent remote occurrences skip the new path.

**Evidence (Test 12):**
```
Input:  local=[], remote=[new1, new2, new1]
Output: merged=[new1, new2], addedVideos=[new1, new2]
        2 merged (not 3), no duplicates
```

### P2: Multiple new videos preserve remote order

**Before:** `merged.unshift(remote)` per new video reversed order: `[newest, secondNewest]` → prepended as `[secondNewest, newest, ...local]`.

**After:** New remote videos collected in `newRemoteVideos` array in iteration order, then `merged = [...newRemoteVideos, ...localVideos]` preserves remote order.

**Evidence (Test 13):**
```
Input:  local=[old1], remote=[newA, newB, old1]
Output: merged=[newA, newB, old1]
        newA first, newB second, old1 last — remote order preserved
```

### P2 (UI): Both refresh modes exposed

**Before:** Single "Refresh Videos" button hardcoded to `mode: 'latest', limit: 50`.

**After:** Two buttons + limit input:
- "Refresh latest {N}" — bounded incremental refresh
- "Full refresh" — full inventory scan with remote-missing detection
- Limit input (1-500, default 50)

## Changed Files

| File | Change |
|------|--------|
| `packages/application/src/refreshChannelVideosUseCase.ts` | Rewrote merge to use `seenVideoIds` + `newRemoteVideos` array |
| `apps/web/src/components/LearningChannelVideoTable.tsx` | Two refresh buttons + limit input |
| `scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts` | Added Test 12 (duplicate new IDs) and Test 13 (multi-new order) |

## Verification Commands

```bash
npx tsx scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts  # 50/50 passed
npm run typecheck  # passed
npm run build      # passed
```

Full output:
```
Test 12: Duplicate new remote IDs rejected
  PASS: no duplicate new IDs: 2 total = 2 unique
  PASS: 2 added (not 3) (got 2)
  PASS: 2 in merged (got 2)

Test 13: Multiple new videos preserve remote order
  PASS: 3 merged (got 3)
  PASS: first is newA (remote order preserved)
  PASS: second is newB (remote order preserved)
  PASS: third is old1 (local preserved)

Results: 50 passed, 0 failed
ALL TESTS PASSED
```

## Skipped Checks

- **Browser screenshots**: Two-button refresh UI uses responsive Tailwind. Visual check recommended during user testing.
- **API smoke**: Requires running server + YouTube network. Merge logic proven by deterministic tests.

## Residual Risks

1. **Concurrent refresh**: Two simultaneous refreshes could race on `videos.json`. Acceptable for single-user MVP.
2. **yt-dlp ordering**: Assumes `--flat-playlist` returns newest first. Merge is order-independent after the fix.
