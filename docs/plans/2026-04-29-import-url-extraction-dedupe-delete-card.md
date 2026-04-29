# Import URL Extraction, Source Deduplication, and Delete Card

## Owner

Gemini implements. Codex reviews.

## Goal

Implement three user-facing requirements:

1. The input box should accept Xiaohongshu mobile share text and the backend must extract the URL automatically.
2. The homepage should not show duplicate cards for the same canonical source.
3. Clicking delete card should remove the card from the homepage, not only delete generated assets.

## Requirements

### Requirement 1: Extract URL from pasted share text

User may paste full Xiaohongshu mobile share text:

```text
千万不要陪孩子写作业！ 真的不用陪孩子写作业，既解... http://xhslink.com/o/4ALz6kVmU1m 
把这段话复制下来，打开【小红书】查看。
```

Backend must extract:

```text
http://xhslink.com/o/4ALz6kVmU1m
```

Do not force the user to manually extract the correct URL.

Current blocker:

```ts
const createTaskSchema = z.object({
  sourceUrl: z.string().url(),
  title: z.string().optional()
});
```

This rejects share text before `captureSourceUseCase` can normalize it.

Required behavior:

- Accept a field such as `sourceUrl` or `sourceInput`.
- Allow non-URL share text in the API body.
- Extract the first supported URL from the string in the backend/application layer.
- Supported URL extraction should include:
  - `http://xhslink.com/o/...`
  - `https://xhslink.com/o/...`
  - `https://www.xiaohongshu.com/discovery/item/...`
  - `https://www.xiaohongshu.com/explore/...`
  - existing supported YouTube/X/Douyin/Xiaoyuzhou URLs.
- If no supported URL is found, return a clear 400:

```json
{
  "message": "No supported source URL found in input."
}
```

Recommended file:

```text
packages/application/src/extractSupportedSourceUrl.ts
```

Avoid ad hoc parsing in React or route handlers. UI may trim input, but backend must own correctness.

### Requirement 2: Deduplicate same canonical source

If the user imports the same source through different URL forms, the homepage must not show a second card.

For Xiaohongshu:

```text
http://xhslink.com/o/4ALz6kVmU1m
https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b?...
```

must dedupe to:

```text
xhs-682eefa40000000003039a4b
```

Required behavior:

- Normalize/canonicalize URL before saving when possible.
- Source ID should be generated from canonical platform ID, not the raw pasted URL.
- Before saving a source, check whether `sourceStorage.getSource(source.id)` already exists.
- If existing source exists, return it instead of saving a duplicate.
- `POST /api/tasks` should return the existing task with a duplicate indicator if useful:

```json
{
  "task": { "...": "..." },
  "deduped": true
}
```

or keep current response shape but still refresh to one card. If response shape changes, update web client/types.

`GET /api/tasks` should also defend against accidental legacy duplicates if possible:

- prefer canonical IDs,
- do not show two cards for the same `platform + canonicalSourceId`.

Do not delete legacy duplicate directories automatically unless explicitly requested.

### Requirement 3: Delete card removes it from homepage

There are two separate actions:

```text
删除本地资产 -> keep source record/card, remove generated files
删除卡片 -> remove source record/card from homepage
```

Implement `删除卡片` as a destructive menu action.

Expected behavior:

- Confirmation text must clearly say the card/source record will be removed from the homepage.
- Deleting card should remove:
  - `record.json`
  - generated local assets for that source
  - source directory if empty
- After success, UI should remove the card immediately or refresh list so it disappears.
- If a reader modal is open for that source, close it.
- Missing source should return 404.
- Repeating delete after success should not leave stale card UI.

Suggested API:

```text
DELETE /api/tasks/:taskId
```

Suggested use case:

```text
deleteSourceUseCase(sourceId)
```

Storage deletion rules:

- Delete only under canonical source directory.
- Never accept arbitrary file paths from frontend.
- Return deleted/skipped/failed arrays.
- If `record.json` is removed, the source should no longer appear in `GET /api/tasks`.

## Reference and Decisions

Use:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`
- `docs/plans/2026-04-29-xiaohongshu-video-download-support.md`
- `docs/plans/2026-04-29-video-card-delete-assets-retry.md`
- `docs/GOTCHAS.md`

## Non-goals

- Do not require users to paste only clean URLs.
- Do not create duplicate cards for short-link and long-link variants.
- Do not treat descriptions/share text as transcript.
- Do not delete unrelated source directories.
- Do not implement bulk delete.
- Do not commit generated runtime data or `tsconfig.tsbuildinfo` churn.

## Target Files

Likely:

- `apps/api/src/routes/tasks.ts`
- `apps/web/src/App.tsx`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/TaskCard.tsx`
- `apps/web/src/types.ts`
- `packages/application/src/index.ts`
- `packages/application/src/extractSupportedSourceUrl.ts`
- `packages/application/src/deleteSourceUseCase.ts`
- `packages/storage/src/index.ts`
- `packages/source-adapters/src/xiaohongshuAdapter.ts`
- `packages/domain/src/index.ts` only if new canonical metadata fields are needed

Expected report:

- `docs/plans/reports/2026-04-29-import-url-extraction-dedupe-delete-card-report.md`

## UI Requirements

### Import box

- Placeholder should mention URL or share text, for example:

```text
粘贴视频链接或分享文本...
```

- On import failure, show inline error near the input, not only console logs.
- After import success:
  - clear input,
  - refresh task list,
  - if deduped, do not create a second card.

### Card menu

Keep both actions distinct:

- `删除本地资产`: keeps card/source record.
- `删除卡片`: removes card/source record.

`删除卡片` should be styled destructive and placed below a divider.

Confirmation copy:

```text
删除这个卡片和本地资产？这会从首页移除该来源记录。
```

After success:

- card disappears from homepage.

## Verification Commands

Run:

```bash
npm run build
npm run typecheck
```

### Share text extraction

```bash
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"sourceUrl":"千万不要陪孩子写作业！ 真的不用陪孩子写作业，既解... http://xhslink.com/o/4ALz6kVmU1m 把这段话复制下来，打开【小红书】查看。"}'
```

Expected:

- 201 or 200 success,
- source/task ID is `xhs-682eefa40000000003039a4b`,
- no URL validation error.

### Deduplication

Import both:

```bash
curl -sS -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"sourceUrl":"http://xhslink.com/o/4ALz6kVmU1m"}'

curl -sS -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"sourceUrl":"https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=ABHCAnYqVSjMn7bympymavoiCpF6yYBbkWLE1mUCesu1A=&xsec_source=pc_share"}'
```

Then:

```bash
curl -sS http://127.0.0.1:8001/api/tasks | node -e "let s='';process.stdin.on('data',d=>s+=d);process.stdin.on('end',()=>{const xs=JSON.parse(s).filter(t=>t.id==='xhs-682eefa40000000003039a4b'); console.log(xs.length)})"
```

Expected:

```text
1
```

### Delete card

```bash
curl -sS -i -X DELETE http://127.0.0.1:8001/api/tasks/xhs-682eefa40000000003039a4b
curl -sS http://127.0.0.1:8001/api/tasks | rg 'xhs-682eefa40000000003039a4b' || true
```

Expected:

- DELETE returns success,
- `GET /api/tasks` no longer contains that ID,
- UI card disappears after refresh/delete.

## Acceptance Criteria

- Backend extracts `http://xhslink.com/o/4ALz6kVmU1m` from the full mobile share text.
- User can paste the full share text into the UI import box.
- PC long link and mobile short link dedupe to one source/card.
- `GET /api/tasks` does not show duplicate cards for the same canonical source.
- `删除本地资产` keeps the card.
- `删除卡片` removes the card from homepage.
- Deleting a card removes the source record and generated assets for that source only.
- UI shows import errors inline.
- `npm run build` passes.
- `npm run typecheck` passes.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-29-import-url-extraction-dedupe-delete-card-report.md
```

Report must include:

- changed files,
- exact share text extraction test,
- dedupe test results,
- delete-card API response,
- before/after task list evidence,
- UI behavior summary,
- build/typecheck results,
- unresolved risks.
