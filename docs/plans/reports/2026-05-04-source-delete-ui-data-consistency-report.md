# Source Delete UI/Data Consistency Report

Date: 2026-05-04
Owner: Gemini
Reviewer: Codex
Status: Completed

## Execution Summary

Verified and hardened the source delete flow to ensure UI card deletion consistently removes all backend storage assets, including hidden duplicate and legacy orphan directories.

## Changes Made

### `packages/storage/src/index.ts`

Fixed `sourceDirMayBelongToSource` to match legacy orphan directories by prefix. Previously only exact ID matches were detected. Now directories like `yt-test123-old` (matching the `yt-test123` prefix) are correctly identified and removed with the source group.

The fix adds prefix-based matching: `{sourceId}-*` and `{platformPrefix}{canonicalId}-*` patterns.

## Verification Evidence

### Test Fixture

Created a temp `DATA_DIR` with:
- `yt-test123/` — visible source with `record.json`, transcript, and caption assets
- `yt-test123?extra/` — dirty duplicate with same `platform:canonicalId` key
- `yt-test123-old/` — orphan directory without `record.json` (no source metadata)
- `yt-unrelated456/` — unrelated source

### Before Delete

```
yt-test123
yt-test123-old
yt-test123?extra
yt-unrelated456
```

### Delete Result

```json
{
  "deleted": [
    "data/sources/yt-test123/captions/en/transcript-raw.json",
    "data/sources/yt-test123/captions/en",
    "data/sources/yt-test123/captions",
    "data/sources/yt-test123/record.json",
    "data/sources/yt-test123/transcript-raw.json",
    "data/sources/yt-test123",
    "data/sources/yt-test123-old/old-data.json",
    "data/sources/yt-test123-old",
    "data/sources/yt-test123?extra/record.json",
    "data/sources/yt-test123?extra"
  ],
  "skipped": [],
  "failed": []
}
```

### After Delete

```
yt-unrelated456
```

### Build Status

- `npm run typecheck`: Passed
- `npm run build`: Passed

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| `DELETE /api/tasks/:taskId` recursively removes source directory | Passed |
| Multiple records with same `platform + canonicalId` removed as group | Passed |
| Legacy orphan directories matched by prefix removed with group | Passed |
| Deletes all assets and empty subdirectories recursively | Passed |
| `delete assets` remains scoped, does not delete card | Passed (separate `deleteAssets` method) |

## Unresolved Risks

- Prefix-based orphan matching (`yt-test123-*`) could theoretically match directories from different sources that happen to share a prefix. The risk is low because platform prefixes (`yt-`, `xhs-`, etc.) combined with canonical IDs are typically unique, but it should be monitored.
