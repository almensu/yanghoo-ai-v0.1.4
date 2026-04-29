# Video Card Delete Assets and Retry

## Owner

Gemini implements. Codex reviews.

## Goal

Add a safe delete/reset action to video cards so users can remove unwanted generated assets and rerun download/transcription from a clean state.

User need:

```text
有些视频/音频/字幕资产不想要了，希望删掉后重来一次记录。
```

Primary UX:

- Keep normal card actions focused on `下载视频`, `视频转字幕`, `阅读`.
- Add delete/reset actions behind the card overflow menu.
- Deleting generated assets must refresh readiness so the card returns to the correct next action.

## Context

Current card menu includes:

- `解析媒体`
- `强制下载`
- `强制处理`
- `查看元数据`

There is no supported UI/API path to remove local media/audio/transcript/document assets. Users currently have to manually delete files under:

```text
data/sources/{sourceId}/
```

This is risky and error-prone.

## Reference and Decisions

Use:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`
- `docs/plans/2026-04-28-x-video-download-and-transcribe-ui.md`
- `docs/plans/2026-04-29-fix-x-silent-video-transcribe-state.md`

Layer placement:

- UI menu action belongs in `apps/web`.
- API route belongs in `apps/api`.
- Delete/reset orchestration belongs in `packages/application`.
- File deletion helpers belong in `packages/storage`.
- Path constants belong in `packages/domain`.

## Non-goals

- Do not delete the whole source record by default.
- Do not add bulk delete across the library.
- Do not delete files outside the canonical source directory.
- Do not hide destructive actions as primary card buttons.
- Do not use broad shell commands such as `rm -rf` on user-provided paths.
- Do not commit generated data or build metadata churn.

## Target Files

Likely:

- `packages/domain/src/storage.ts`
- `packages/storage/src/index.ts`
- `packages/application/src/deleteSourceAssetsUseCase.ts`
- `packages/application/src/index.ts`
- `apps/api/src/routes/tasks.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/TaskCard.tsx`
- `scripts/ops/delete-source-assets.ts` optional

Expected report:

- `docs/plans/reports/2026-04-29-video-card-delete-assets-retry-report.md`

Use precise names. Avoid vague `cleanupService.ts`, `deleteManager.ts`, or `handler.ts`.

## Required Behavior

### 1. Delete generated assets without deleting the source record

Add a use case that can delete selected generated assets for one source:

```ts
deleteSourceAssetsUseCase(sourceId, scope)
```

Recommended scopes:

```text
media        -> media file(s) + media-manifest.json
audio        -> audio file(s) + audio-manifest.json
transcript   -> transcript-raw.json, transcript-sentences.json, transcript.vtt, transcript-manifest.json, document.md, mlx output json
generated    -> media + audio + transcript/document generated assets
```

Default UI scope for video cards should be:

```text
generated
```

Preserve:

```text
record.json
```

This keeps the source URL, title, author, platform, and metadata so the user can rerun `下载视频`.

### 2. Safe filesystem deletion

Storage deletion must:

- resolve the source directory through the existing storage root logic,
- delete only known asset filenames or known filename prefixes under that source directory,
- never accept arbitrary relative paths from the API,
- tolerate missing files,
- return a list of deleted files and skipped missing files.

Known generated files include:

```text
media.*
media-manifest.json
audio.*
audio-manifest.json
transcript-raw.json
transcript-sentences.json
transcript.vtt
transcript-manifest.json
document.md
mlx_out_*.json
```

Do not delete:

```text
record.json
```

unless a separate future task adds explicit source deletion.

### 3. API route

Add a thin API route:

```text
DELETE /api/tasks/:taskId/assets
```

Body:

```json
{
  "scope": "generated"
}
```

Return:

```json
{
  "deleted": ["data/sources/<sourceId>/media.mp4"],
  "skipped": ["data/sources/<sourceId>/document.md"],
  "assets": {
    "status": "metadata_only",
    "source": "none",
    "hasMedia": false,
    "hasAudio": false,
    "hasMarkdown": false
  }
}
```

If the source does not exist, return 404.

If scope is invalid, return 400.

### 3.1 Best-practice API behavior

Deletion should be safe, predictable, and easy to audit:

- **Idempotent**: repeating the same delete request should succeed and report missing files as `skipped`, not fail.
- **Dry-run support**: support either `?dryRun=true` or body field `{ "dryRun": true }` to return the files that would be deleted without deleting them. Use this for confirmation UI if low-risk.
- **Explicit scope only**: do not default server-side to a broad delete when `scope` is missing. Missing scope should return 400.
- **No path input**: API must never accept a list of file paths from the frontend. Frontend sends only `scope`.
- **Processing guard**: if a card action is already running in the current UI, disable delete. Backend should still be safe if a stale request arrives.
- **Clear result**: return `deleted`, `skipped`, and `failed` arrays. If an individual file cannot be deleted, include the reason and do not hide it.
- **Readiness after deletion**: always include the recomputed readiness in the response.
- **No partial source deletion**: never remove `record.json` for this endpoint.

### 4. UI menu action

For video cards, add a destructive menu item:

```text
删除本地资产
```

Recommended placement:

- below a divider,
- red/destructive styling,
- not primary,
- disabled while another action is running.

Before deleting, show a native confirmation or lightweight in-card confirmation:

```text
删除这个来源的本地视频、音频、字幕和文档资产？源记录会保留，可以重新下载。
```

Preferred confirmation details:

- show the scope label, for example `本地视频、音频、字幕和文档资产`;
- state that the source record will remain;
- state that the next action will become `下载视频` or the appropriate source-specific next step;
- if dry-run is implemented, show the count/list summary of files that will be deleted.

After success:

- clear inline error,
- call `onRefresh`,
- card should return to `下载视频` when media is gone.

During deletion:

- disable all actions on that card;
- show `删除中...`;
- close the overflow menu;
- do not optimistically change readiness until the API confirms deletion.

After failure:

- show the backend error inline;
- keep the existing readiness visible;
- do not clear UI state as if deletion succeeded.

### 5. Optional narrower reset actions

If simple and low-risk, also add submenu/menu items:

- `仅删除字幕/文档`
- `仅删除音频`
- `仅删除视频`

If this complicates UI, skip them and report as follow-up. The required action is `删除本地资产` for generated assets.

### 6. Best-practice card actions to include

Add these menu actions when they naturally apply and keep them behind the overflow menu:

- `重新下载视频`: delete `media` scope, then let the card return to `下载视频`. Do not automatically start the download unless the user clicks `下载视频`.
- `重新转字幕`: delete `transcript` scope only, preserving media/audio when valid. The card should return to `视频转字幕` or `音频转字幕`.
- `删除本地资产`: delete `generated` scope.

If three menu items feel too crowded, implement only:

- `删除本地资产`
- `重新转字幕`

and report `重新下载视频` as a follow-up.

Do not add a one-click "delete and immediately rerun" action in this task. It is harder to diagnose failures and can hide accidental deletion. The best-practice flow is:

```text
delete/reset -> refreshed card state -> user starts next action intentionally
```

### 7. User-facing copy

Use concise Chinese labels:

```text
删除本地资产
重新转字幕
重新下载视频
删除中...
```

Avoid alarming copy like "永久删除全部数据" because the source record is preserved. Also avoid vague copy like "清理" without saying what is removed.

## Acceptance Criteria

- Video card menu includes `删除本地资产`.
- Video card menu includes `重新转字幕` when transcript/document assets exist or can exist.
- If implemented, `重新下载视频` deletes only media assets and returns the card to `下载视频`.
- Delete action asks for confirmation.
- Confirmation states that `record.json` / source record is preserved.
- Delete action calls an API route, not direct frontend file access.
- API deletes generated media/audio/transcript/document files for that source.
- API preserves `record.json`.
- API returns updated readiness plus `deleted`, `skipped`, and `failed` arrays.
- After deleting generated assets, the card refreshes and shows `下载视频` for X/Douyin-style video sources.
- After deleting only transcript/document assets, the card should keep downloaded media/audio state and show the appropriate transcription action.
- Deleting missing assets is not an error.
- Repeating the same delete request is safe and idempotent.
- Invalid scope returns a clear 400.
- Missing source returns 404.
- Delete actions are disabled while another card action is running.
- Failed delete requests show an inline error and do not fake a refreshed state.
- `npm run build` passes.
- `npm run typecheck` passes.

## Verification Commands

Run:

```bash
npm run build
npm run typecheck
```

Use an existing local video source, for example:

```text
x-2048950182495359392
```

Before deletion:

```bash
find data/sources/x-2048950182495359392 -maxdepth 1 -type f -print | sort
cat data/sources/x-2048950182495359392/record.json
cat data/sources/x-2048950182495359392/media-manifest.json
```

API deletion:

```bash
curl -sS -i -X DELETE http://127.0.0.1:8001/api/tasks/x-2048950182495359392/assets \
  -H 'Content-Type: application/json' \
  -d '{"scope":"generated"}'
```

After deletion:

```bash
find data/sources/x-2048950182495359392 -maxdepth 1 -type f -print | sort
test -f data/sources/x-2048950182495359392/record.json
test ! -f data/sources/x-2048950182495359392/media-manifest.json
```

Readiness:

```bash
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('x-2048950182495359392'), null, 2)))"
```

UI verification:

- Start `npm run dev`.
- Open a video card with generated assets.
- Use `删除本地资产`.
- Confirm the prompt.
- Verify the card returns to the expected next action, usually `下载视频`.
- Repeat the same delete request and verify it succeeds with skipped/missing files, not a server error.
- If `重新转字幕` is implemented, verify media/audio assets remain and transcript/document assets are removed.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-29-video-card-delete-assets-retry-report.md
```

Report must include:

- changed files,
- exact API request/response,
- before/after file lists,
- evidence that `record.json` remains,
- evidence for repeated/idempotent delete behavior,
- readiness before/after,
- UI state after deletion,
- confirmation copy used,
- build/typecheck results,
- unresolved risks.
