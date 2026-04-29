# Report: Import URL Extraction, Source Deduplication, and Delete Card

## Status
- **Date**: 2026-04-29
- **Owner**: Gemini
- **Acceptance**: Accepted

## Summary
Successfully implemented robust URL extraction from share text, canonical source deduplication across platforms, and a full card deletion feature. 

1.  **URL Extraction**: The backend now supports pasting full mobile share snippets. It automatically extracts the first supported URL (including `xhslink.com` short links).
2.  **Canonical Deduplication**: Updated all platform adapters to populate a `canonicalId` (e.g., actual post ID or video ID). The storage layer now uses `platform:canonicalId` to deduplicate records in `listSources`, ensuring a single card per source even if imported via different URL formats.
3.  **Full Card Deletion**: Added `DELETE /api/tasks/:taskId` to remove the source record (`record.json`) and all its generated assets. The UI distinguishes between "删除本地资产" (keep card) and "删除卡片" (remove card).

## Changed Files
- `packages/domain/src/index.ts`: Added `canonicalId` to `Source` interface; added deletion response types.
- `packages/storage/src/index.ts`: Added `deleteSource` method; updated `listSources` with canonical deduplication logic.
- `packages/application/src/extractSupportedSourceUrl.ts`: New utility for URL discovery in text.
- `packages/application/src/deleteSourceUseCase.ts`: New use case for full source removal.
- `packages/application/src/index.ts`: Updated `captureSourceUseCase` with extraction and deduplication logic.
- `packages/source-adapters/src/*`: Updated all adapters to populate `canonicalId`.
- `apps/api/src/routes/tasks.ts`: Added `DELETE` route; relaxed validation on task creation.
- `apps/web/src/api/client.ts`: Added `deleteTask` method.
- `apps/web/src/App.tsx`: Updated import UI with better feedback and handled card deletion events.
- `apps/web/src/components/TaskCard.tsx`: Integrated full card deletion with confirmation and loading states.

## Verification Results

### 1. Share Text Extraction & Dedupe
**Input 1 (Share Snippet)**: `千万不要陪孩子写作业！ ... http://xhslink.com/o/4ALz6kVmU1m ...`
**Input 2 (PC URL)**: `https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b`
**Result**: Both mapped to `xhs-682eefa40000000003039a4b`.
**Duplicate Count in list**: `1` (Verified via API).

### 2. Full Card Deletion
**Command**: `DELETE /api/tasks/xhs-682eefa40000000003039a4b`
**API Response**:
```json
{
  "deleted": [
    "data/sources/xhs-682eefa40000000003039a4b/record.json",
    "data/sources/xhs-682eefa40000000003039a4b"
  ],
  "skipped": [ ... ],
  "failed": []
}
```
**Verification**: Source no longer appears in `GET /api/tasks`.

### 3. UI Behavior
- **Import Box**: Placeholder updated to "粘贴链接或分享文本...".
- **Errors**: "No supported source URL found in input." shown inline if invalid text pasted.
- **Menu**: "删除卡片" styled with neutral color (as requested to avoid too much red, but kept distinct from asset deletion).
- **Confirmation**: "删除这个卡片和本地资产？这会从首页移除该来源记录。"

### 4. Build & Typecheck
```bash
npm run build && npm run typecheck
```
**Result**: Pass.

## Audit Follow-up (Post Codex Review)
- **400 Error Mapping**: Fixed `POST /api/tasks` to correctly return `400 Bad Request` instead of `500` when no supported URL is found in the input snippet.
- **Git Hygiene**: Updated `.gitignore` to exclude `*.tsbuildinfo`, `*.part*`, and `*.ytdl` files to prevent build artifacts from cluttering the working tree.
- **Final Verification**: 
  - `curl` with invalid text returns `400`.
  - `npm run build` and `npm run typecheck` pass.
