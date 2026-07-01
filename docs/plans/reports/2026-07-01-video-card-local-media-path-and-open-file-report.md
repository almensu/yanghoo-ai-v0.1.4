# Video Card Local Media Path and Open Folder Report

## Summary

Implemented local downloaded video actions for task cards:

- `复制视频路径` fetches the backend-derived absolute local video path and copies it to the clipboard.
- `打开本地文件夹` calls a guarded backend use case that opens the source folder containing the persisted downloaded video file.
- The actions appear only in the card overflow menu when readiness reports downloaded video media.

## Changed Files

- `packages/storage/src/index.ts`
- `packages/application/src/getSourceMediaFileUseCase.ts`
- `packages/application/src/openSourceMediaFolderUseCase.ts`
- `packages/application/src/index.ts`
- `apps/api/src/routes/tasks.ts`
- `apps/api/src/types.ts`
- `apps/web/src/types.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/TaskCard.tsx`
- `docs/plans/reports/screenshots/video-card-local-media-folder-menu.png`

## Architecture Notes

- Frontend never constructs or submits a local file path.
- API routes derive the path from `mediaStorage.getMedia(sourceId)`.
- Storage now exposes `resolveStoragePath(logicalPath)` instead of requiring new code to use private `(as any).resolvePath`.
- Application validates source existence, downloaded status, video media kind, file existence, and path containment inside `data/sources/{sourceId}`.
- Folder opening uses `spawnSync('open', [sourceDir], ...)`, not shell interpolation.

Reference status:

- `/Volumes/2T/com/yanghoo205/yanghoo-reference` was not mounted during implementation.
- Read local mirror guidance from `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`, `naming.md`, and `test-strategy.md`.
- Also followed local ADRs `docs/decisions/0003-apps-packages-architecture.md`, `docs/decisions/0004-source-classes-and-platform-adapters.md`, and `docs/GOTCHAS.md`.

## Verification

### Build and Typecheck

```bash
npm run build -w @yanghoo/storage
npm run build -w @yanghoo/application
npm run typecheck -w @yanghoo/web
npm run typecheck -w @yanghoo/api
npm run typecheck
npm run build
```

Key output:

```text
@yanghoo/storage build: tsc
@yanghoo/application build: tsc
@yanghoo/web typecheck: tsc -p tsconfig.json --noEmit
@yanghoo/api typecheck: tsc -p tsconfig.json --noEmit
root typecheck: all workspaces passed
root build: API, CLI, web, application, config, domain, adapters, storage, transcript, ui passed
Vite built 1590 modules successfully
```

### API Smoke

Health:

```bash
curl -sS http://127.0.0.1:8001/api/health
```

```json
{"ok":true,"service":"yanghoo-transcript-backend"}
```

Success path:

```bash
curl -sS "http://127.0.0.1:8001/api/tasks/x-2053805272507048287/media-file"
```

```json
{"sourceId":"x-2053805272507048287","mediaKind":"video","logicalPath":"data/sources/x-2053805272507048287/media.mp4","absolutePath":"/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4/data/sources/x-2053805272507048287/media.mp4","byteSize":2098771,"exists":true}
```

Open folder path:

```bash
curl -sS -X POST "http://127.0.0.1:8001/api/tasks/x-2053805272507048287/media-file/open"
```

```json
{"sourceId":"x-2053805272507048287","folderAbsolutePath":"/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4/data/sources/x-2053805272507048287","mediaAbsolutePath":"/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4/data/sources/x-2053805272507048287/media.mp4","opened":true}
```

Negative API path without downloaded media:

```bash
curl -i -sS "http://127.0.0.1:8001/api/tasks/yt-uz2C3bQot6o/media-file"
```

```text
HTTP/1.1 409 Conflict
{"message":"Media is not downloaded","code":"MEDIA_NOT_DOWNLOADED"}
```

Missing-file application check with isolated `DATA_DIR`:

```text
SourceMediaFileError:MEDIA_FILE_NOT_FOUND:Downloaded video file not found
```

Path-escape application check with isolated `DATA_DIR`:

```text
SourceMediaFileError:MEDIA_FILE_NOT_FOUND:Downloaded video file not found
```

### Browser Verification

Used Playwright against `http://127.0.0.1:3000` and the running API on `8001`.

Result:

```json
{"sourceId":"x-2053805272507048287","copyVisible":true,"openFolderVisible":true,"screenshot":"/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4/docs/plans/reports/screenshots/video-card-local-media-folder-menu.png"}
```

Screenshot:

```text
docs/plans/reports/screenshots/video-card-local-media-folder-menu.png
```

Note: visible-browser Playwright mode closed immediately in this local environment, so the final browser verification ran headless.

## GOTCHAS

No `docs/GOTCHAS.md` update was needed. The implementation used already documented patterns: encode task IDs, keep long-running media actions out of synchronous card actions, and use guarded local open behavior.

## Risks

- Existing unrelated worktree changes were present before this task. This report covers only the files listed above.
- Clipboard behavior was not directly asserted in Playwright because browser clipboard permissions are environment-sensitive; the API path retrieval and menu visibility were verified, and the UI uses `navigator.clipboard.writeText` with an inline fallback.
