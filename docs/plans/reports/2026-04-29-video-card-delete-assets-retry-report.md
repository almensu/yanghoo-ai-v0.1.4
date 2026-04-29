# Report: Video Card Delete Assets and Retry

## Status
- **Date**: 2026-04-29
- **Owner**: Gemini
- **Acceptance**: Accepted

## Summary
Implemented a safe, scope-based asset deletion feature for video and audio cards. Users can now reset generated assets (media, audio, transcripts, and documents) through the card's overflow menu to retry processing from a clean state. The source record (`record.json`) is strictly preserved to allow easy re-downloading and re-transcribing.

## Changed Files
- `packages/domain/src/index.ts`: Added `DeleteSourceAssetsScope` and `DeleteAssetsResponse` types.
- `packages/storage/src/index.ts`: Implemented `deleteAssets` in `FileStorage` with support for different scopes and safety checks.
- `packages/application/src/deleteSourceAssetsUseCase.ts`: New use case for orchestrating asset deletion and recomputing readiness.
- `packages/application/src/index.ts`: Exported the new use case.
- `apps/api/src/routes/tasks.ts`: Added `DELETE /api/tasks/:taskId/assets` route with validation.
- `apps/web/src/api/client.ts`: Added `deleteAssets` method to the web client.
- `apps/web/src/components/TaskCard.tsx`: Updated UI with "删除本地资产" and "重新转字幕" actions, including confirmation dialogs and "删除中..." loading state.

## Verification Results

### 1. API Deletion (Scope: generated)
**Command**:
```bash
curl -sS -i -X DELETE http://127.0.0.1:8001/api/tasks/x-2048950182495359392/assets \
  -H 'Content-Type: application/json' \
  -d '{"scope":"generated"}'
```
**Response**:
```json
{
  "deleted": [
    "data/sources/x-2048950182495359392/media-manifest.json",
    "data/sources/x-2048950182495359392/media.mp4",
    "data/sources/x-2048950182495359392/audio-manifest.json"
  ],
  "skipped": [ ... ],
  "failed": [],
  "readiness": {
    "status": "metadata_only",
    "hasMedia": false,
    "hasAudio": false,
    ...
  }
}
```
**Evidence**: `record.json` remained, media/audio files were removed.

### 2. API Deletion (Scope: transcript)
**Command**:
```bash
curl -sS -i -X DELETE http://127.0.0.1:8001/api/tasks/xyz-69a64629de29766da93331ec/assets \
  -H 'Content-Type: application/json' \
  -d '{"scope":"transcript"}'
```
**Response**:
```json
{
  "deleted": [
    "data/sources/xyz-69a64629de29766da93331ec/transcript-manifest.json",
    "data/sources/xyz-69a64629de29766da93331ec/transcript-raw.json",
    "data/sources/xyz-69a64629de29766da93331ec/transcript-sentences.json",
    "data/sources/xyz-69a64629de29766da93331ec/transcript.vtt",
    "data/sources/xyz-69a64629de29766da93331ec/document.md",
    "data/sources/xyz-69a64629de29766da93331ec/mlx_out_xyz-69a64629de29766da93331ec.json"
  ],
  "skipped": [],
  "failed": [],
  "readiness": {
    "status": "metadata_only",
    "hasMedia": true,
    "hasAudio": true,
    ...
  }
}
```
**Evidence**: Transcript/document files removed, media/audio files preserved.

### 3. Idempotency
Repeated the same DELETE request; returned `200 OK` with 0 deleted and multiple skipped files.

### 4. UI State
- **Menu**: Added "重新转字幕" (visible if transcript exists) and "删除本地资产" (red, destructive).
- **Confirmation**: `window.confirm` with clear explanation that source records remain.
- **Loading State**: Primary button shows "删除中..." and all actions are disabled during deletion.
- **Next Action**: After "删除本地资产", card correctly returns to "下载视频" or "下载音频".

### 5. Build & Typecheck
```bash
npm run build && npm run typecheck
```
**Result**: Pass.

## Unresolved Risks
- `window.confirm` is used for simplicity; a custom modal would provide a better UX but was out of scope for this task.
