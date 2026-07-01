# Video Card Local Media Path and Open File

## Owner

Gemini implements. Codex reviews.

## Goal

Let a video card expose the downloaded local video file in two user-facing ways:

- copy or inspect the absolute path of the local video file,
- open the local video file from the card.

This is for already downloaded media assets. The feature should make local assets easier to use without turning the card back into a general media/debug control panel.

## User Need

```text
希望可以通过视频卡片，获取本地视频的绝对路径。
追加可以通过视频卡片 open 文件。
```

Primary UX:

- If a card has a downloaded video media file, show a small overflow-menu action:
  - `复制视频路径`
  - `打开视频文件`
- If no downloaded video media file exists, do not show enabled local-file actions.
- If the media manifest exists but the file is missing, show a concise error after action attempt and refresh card readiness.

## Context

Current cards are document-readiness oriented:

- YouTube primarily uses `下载字幕`.
- Short-video and Bilibili/TikTok style sources use `下载视频 -> 转录`.
- `DocumentReadiness` currently exposes `hasMedia`, `mediaStatus`, `mediaKind`, `mediaHasAudio`, and `notTranscribableReason`, but not the local absolute file path.
- `MediaAsset.localPath` is persisted in `data/sources/{sourceId}/media-manifest.json` after `downloadSourceMediaUseCase`.
- `packages/storage/src/index.ts` has private storage-root path resolution that can turn logical storage paths into absolute paths.
- `openNotebookLmExportDirUseCase` already demonstrates a guarded macOS `open` pattern for a generated local artifact.

## Reference and Decisions

Repo decisions to follow:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/plans/2026-04-29-simplify-source-card-actions.md`
- `docs/plans/2026-04-29-video-card-delete-assets-retry.md`
- `docs/GOTCHAS.md`

Reference repository guidance:

- Required reference path from `AGENTS.md`, `/Volumes/2T/com/yanghoo205/yanghoo-reference`, was not mounted during Codex planning on 2026-07-01.
- Use the readable local mirror for principles unless the mounted reference becomes available before implementation:
  - `/Users/a123/com/yanghoo205/yanghoo-reference/reference/index.md`
  - `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
  - `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
  - `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`

Reference-derived rules:

- Entry points render UI or route requests; they do not own filesystem safety policy.
- Risky local actions such as opening files must be explicit and guarded.
- Use precise names. Avoid vague `utils.ts`, `manager.ts`, `service.ts`, or `handler.ts`.
- Test the narrowest contract that proves the feature, with at least one negative path for file-opening safety.

## Layer Placement

- UI label, overflow menu placement, clipboard interaction, and toast/error display belong in `apps/web/src/components/TaskCard.tsx`.
- API client helper belongs in `apps/web/src/api/client.ts`.
- API route belongs in `apps/api/src/routes/tasks.ts` and should stay thin.
- Local media lookup and open-file orchestration belong in `packages/application`.
- Absolute path resolution and file-existence validation should use storage-owned path resolution. Do not let the frontend submit arbitrary paths.
- Domain types may define a stable DTO if reused, but domain should not depend on filesystem or macOS `open`.

Boundary answers:

1. Behavior owner: local downloaded media lookup/open is application behavior over persisted `MediaAsset`.
2. Package/app: `packages/application` coordinates; `packages/storage` provides media manifest and path resolution; `apps/api` exposes endpoints; `apps/web` renders actions.
3. Allowed dependencies: application may depend on domain/storage and Node filesystem/process APIs; UI may call API and clipboard APIs.
4. Boundary risk: violated if `TaskCard` guesses `data/sources/.../media.*`, or if API accepts an arbitrary path to open.
5. Verification: prove downloaded media exposes the exact absolute path, missing media is rejected, and open-file only targets persisted media under the canonical data root.

## Non-Goals

- Do not add a generic file browser.
- Do not add arbitrary path open support.
- Do not expose `解析媒体`, `强制下载`, `强制处理`, or `查看元数据` as normal card controls.
- Do not change YouTube caption-first behavior.
- Do not route YouTube through generic `下载视频` unless the existing caption-missing fallback already requires it.
- Do not duplicate files into `apps/*/data`.
- Do not commit generated media files under `data/`.

## Proposed API Contract

Add a local media file read endpoint:

```text
GET /api/tasks/:taskId/media-file
```

Success response:

```json
{
  "sourceId": "x-123",
  "mediaKind": "video",
  "logicalPath": "data/sources/x-123/media.mp4",
  "absolutePath": "/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4/data/sources/x-123/media.mp4",
  "byteSize": 123456,
  "exists": true
}
```

Expected failures:

- `404 Source not found`
- `404 Downloaded video file not found`
- `409 Media is not downloaded`
- `409 Downloaded media is not video`

Add an open endpoint:

```text
POST /api/tasks/:taskId/media-file/open
```

Success response:

```json
{
  "sourceId": "x-123",
  "absolutePath": "/Users/a123/.../data/sources/x-123/media.mp4",
  "opened": true
}
```

Safety requirements:

- The endpoint derives the file path from `mediaStorage.getMedia(taskId)`.
- It must reject missing, non-downloaded, non-video, or file-missing media.
- It must resolve the absolute path and confirm the result is inside the configured data root/source directory.
- It must not accept a path in the request body.
- Use `spawnSync('open', [absolutePath], { encoding: 'utf-8', timeout: 10_000 })` or the existing project style. Do not build a shell string.

## Target Files

Likely:

- `packages/application/src/getSourceMediaFileUseCase.ts`
- `packages/application/src/openSourceMediaFileUseCase.ts`
- `packages/application/src/index.ts`
- `packages/storage/src/index.ts`
- `apps/api/src/types.ts`
- `apps/api/src/routes/tasks.ts`
- `apps/web/src/types.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/TaskCard.tsx`
- `docs/GOTCHAS.md` only if implementation discovers a repeatable local-file/open pitfall

Expected report:

- `docs/plans/reports/2026-07-01-video-card-local-media-path-and-open-file-report.md`

Recommended names:

- `getSourceMediaFileUseCase`
- `openSourceMediaFileUseCase`
- `TaskLocalMediaFile`
- `getTaskMediaFile`
- `openTaskMediaFile`

Avoid:

- `fileUtils.ts`
- `openManager.ts`
- `mediaHandler.ts`
- `pathService.ts`

## Implementation Notes

### 1. Application use cases

Add a use case that returns a local media file DTO from a source ID.

It should:

- read the source to return `404`-equivalent errors clearly,
- read `mediaStorage.getMedia(sourceId)`,
- require `status === "downloaded"`,
- require `mediaKind === "video"`,
- require `localPath`,
- resolve `localPath` through storage path resolution,
- verify the resolved file exists and is a file,
- verify the resolved file is inside the canonical data root/source directory,
- return logical and absolute paths.

Add a second use case that calls the lookup use case, then opens the returned `absolutePath`.

### 2. Storage path support

Prefer adding an explicit storage helper instead of using `(mediaStorage as any).resolvePath` from new application code.

Acceptable options:

- Add an interface method such as `resolveStoragePath(logicalPath: string): string`.
- Or add a narrower method such as `getMediaFileInfo(sourceId: string)`.

Keep arbitrary path validation in storage/application, not UI.

### 3. API

Add thin routes:

- `GET /api/tasks/:taskId/media-file`
- `POST /api/tasks/:taskId/media-file/open`

Encode `taskId` on the frontend when constructing paths. This repo already has a gotcha for unencoded task IDs.

Route error handling should map known user states to 404/409 rather than returning every failure as 500.

### 4. UI

In `TaskCard` overflow menu:

- Show `复制视频路径` only when `assets.hasMedia && assets.mediaStatus === "downloaded" && assets.mediaKind === "video"`.
- Show `打开视频文件` under the same condition.
- Keep these as secondary overflow actions, not primary buttons.
- Use a copy icon and an external/open icon from `lucide-react` if available.
- Use `navigator.clipboard.writeText(absolutePath)` after fetching the path endpoint.
- If clipboard is unavailable, display the path in an inline error/success message or prompt-style fallback.
- On open failure, show a concise inline error and call `onRefresh?.()`.

Do not show the full absolute path as always-visible card text; it is long and will make the card hard to scan.

## Acceptance Criteria

- A downloaded short-video card exposes `复制视频路径` in the overflow menu.
- Clicking `复制视频路径` writes the absolute local video path to the clipboard.
- A downloaded short-video card exposes `打开视频文件` in the overflow menu.
- Clicking `打开视频文件` opens the persisted local video file through the backend use case.
- The backend refuses to open paths supplied by the frontend.
- If `media-manifest.json` says downloaded but the file is missing, the API returns a clear failure and the UI shows a concise error.
- Non-video media does not show enabled video-file actions.
- Cards without downloaded media do not show enabled local video file actions.
- The card remains document-readiness oriented and does not reintroduce debug controls.
- `npm run build` passes.
- `npm run typecheck` passes.

## Verification Commands

Gemini should run:

```bash
npm run build
npm run typecheck
```

API smoke checks with an existing downloaded media source:

```bash
curl -sS "http://127.0.0.1:8001/api/tasks/<encodedTaskId>/media-file"
curl -sS -X POST "http://127.0.0.1:8001/api/tasks/<encodedTaskId>/media-file/open"
```

Negative API checks:

```bash
curl -i "http://127.0.0.1:8001/api/tasks/<sourceWithoutDownloadedMedia>/media-file"
curl -i -X POST "http://127.0.0.1:8001/api/tasks/<sourceWithoutDownloadedMedia>/media-file/open"
```

Browser verification:

- Start the app with the normal local dev setup.
- Use a card with downloaded video media.
- Open the card overflow menu.
- Verify `复制视频路径` copies an absolute path.
- Verify `打开视频文件` opens the file.
- Verify a card without downloaded video media does not present enabled local-file actions.
- Capture a screenshot of the menu state and include it in the report if browser verification is run.

## Report Requirements

Gemini report must include:

- changed files,
- exact build/typecheck commands and key output,
- API smoke command output for success and failure paths,
- browser verification notes or a clear reason if skipped,
- whether `/Volumes/2T/com/yanghoo205/yanghoo-reference` was available during implementation,
- any update made to `docs/GOTCHAS.md`, or an explicit statement that no new repeatable pitfall was discovered.

## Codex Review Checklist

Codex should reject the report if:

- frontend constructs local file paths manually,
- API accepts arbitrary paths to open,
- file opening is implemented with shell string interpolation,
- local-file actions appear as primary document-readiness actions,
- YouTube caption-first behavior is changed,
- generated media files are committed,
- build/typecheck or negative-path evidence is missing without explanation.
