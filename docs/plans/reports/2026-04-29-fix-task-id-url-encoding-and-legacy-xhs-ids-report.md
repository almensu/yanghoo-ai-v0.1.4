# Report: Fix Task ID URL Encoding and Legacy XHS IDs

## Changes

### 1. Frontend: URL Encoding for Task IDs
- Modified `apps/web/src/api/client.ts` to use `encodeURIComponent(taskId)` in all task-specific routes.
- Introduced `taskPath(taskId: string)` helper to centralize URL construction.
- Covered routes: `getTaskDetail`, `ensureTranscript`, `fetchAudio`, `transcribeAudio`, `resolveMedia`, `downloadMedia`, `transcribeMedia`, `deleteAssets`, `deleteTask`.

### 2. Backend: Xiaohongshu Adapter Sanitization
- Modified `packages/source-adapters/src/xiaohongshuAdapter.ts` to strip query strings (`?`) and fragments (`#`) from `postId`.
- Ensures new imports create canonical, path-safe IDs like `xhs-682eefa40000000003039a4b`.

### 3. Backend: Storage Deduplication & Compatibility
- Updated `packages/storage/src/index.ts`:
    - `listSources` now normalizes Xiaohongshu keys by stripping query strings during deduplication.
    - If both a clean ID (new) and a dirty ID (legacy) exist for the same canonical post, the clean one is preferred.
    - Legacy dirty IDs remain compatible with `getSource` and `deleteSource` as long as the frontend encodes them correctly.

### 4. API: Hardened Error Handling
- Updated `apps/api/src/routes/tasks.ts`:
    - `POST /api/tasks` now returns HTTP 400 (instead of 500) for "No supported source URL found in input" and "Unsupported platform" errors.
    - Used more robust string matching (`includes`) for error messages.

## Verification Results

### Build & Typecheck
- `npm run build`: **PASSED**
- `npm run typecheck`: **PASSED**

### Runtime Tests

#### 1. Invalid Input 400
- **Command**: `curl -sS -i -X POST http://127.0.0.1:8001/api/tasks -H 'Content-Type: application/json' -d '{"sourceUrl":"这不是链接"}'`
- **Result**: `HTTP/1.1 400 Bad Request`, `{"message":"No supported source URL found in input."}`

#### 2. Clean XHS Import
- **Input URL**: `https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b?source=webshare&...`
- **Result**: Returned ID `xhs-682eefa40000000003039a4b` (Clean, no query string).

#### 3. Legacy Dirty ID Deletion
- **Setup**: Created dummy record at `data/sources/xhs-dirty?q=1/record.json`.
- **Action**: `DELETE /api/tasks/xhs-dirty%3Fq%3D1`
- **Result**: `HTTP/1.1 200 OK`, `{"deleted":["data/sources/xhs-dirty?q=1/record.json","data/sources/xhs-dirty?q=1"], ...}`

#### 4. Deduplication
- **Setup**: Created `xhs-123` (clean) and `xhs-123?q=1` (dirty) records.
- **Action**: `GET /api/tasks`
- **Result**: Only `xhs-123` returned (Clean preferred).
- **Secondary Test**: Deleted clean record; dirty record then appeared and was deletable.

## Unresolved Risks
- None identified. Encoding is applied consistently across all task routes. Normalization in storage handles the primary deduplication concern for legacy data.
