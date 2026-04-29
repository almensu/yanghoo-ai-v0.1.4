# Fix Task ID URL Encoding and Legacy XHS IDs

## Owner

Gemini implements. Codex reviews.

## Goal

Fix delete actions and other task actions for source IDs that contain URL-reserved characters such as `?`, `&`, and `=`.

User-observed failures:

```text
DELETE http://127.0.0.1:3000/api/tasks/xhs-682eefa40000000003039a4b?source=webshare&... 404
deleteTask failed: Source not found: xhs-682eefa40000000003039a4b

DELETE http://127.0.0.1:3000/api/tasks/xhs-682eefa40000000003039a4b?source=.../assets 404
deleteAssets failed: Source not found: xhs-682eefa40000000003039a4b
```

Root cause:

- Legacy XHS records were created with dirty IDs containing query strings.
- Frontend interpolates `taskId` directly into URLs.
- Browser treats `?source=...` as the request query string, so the backend receives only:

```text
xhs-682eefa40000000003039a4b
```

but the old stored record ID is:

```text
xhs-682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=...
```

## Evidence

Current local dirty directories:

```text
data/sources/xhs-682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=ABHCAnYqVSjMn7bympymavoiCpF6yYBbkWLE1mUCesu1A
data/sources/xhs-682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=ABHCAnYqVSjMn7bympymavoiCpF6yYBbkWLE1mUCesu1A=&xsec_source=pc_share
```

Current client code interpolates raw IDs:

```ts
fetch(`${API_BASE}/api/tasks/${taskId}`)
fetch(`${API_BASE}/api/tasks/${taskId}/assets`)
```

## Reference and Decisions

Use:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/plans/2026-04-29-import-url-extraction-dedupe-delete-card.md`
- `docs/plans/reports/2026-04-29-codex-audit-import-url-extraction-dedupe-delete-card.md`
- `docs/GOTCHAS.md`

## Non-goals

- Do not recreate frontend/backend top-level folders.
- Do not delete user data silently during list/read.
- Do not keep generating dirty XHS IDs.
- Do not require users to manually remove query strings.
- Do not commit runtime data or `tsconfig.tsbuildinfo` churn.

## Target Files

Likely:

- `apps/web/src/api/client.ts`
- `packages/storage/src/index.ts`
- `packages/application/src/index.ts`
- `packages/source-adapters/src/xiaohongshuAdapter.ts`
- `apps/api/src/routes/tasks.ts` only if route decoding needs explicit handling
- `docs/GOTCHAS.md`

Expected report:

- `docs/plans/reports/2026-04-29-fix-task-id-url-encoding-and-legacy-xhs-ids-report.md`

## Required Fixes

### 1. Encode task IDs in every web client task route

Add a helper:

```ts
function taskPath(taskId: string): string {
  return `${API_BASE}/api/tasks/${encodeURIComponent(taskId)}`;
}
```

Use it for all task ID routes:

- `getTaskDetail`
- `ensureTranscript`
- `fetchAudio`
- `transcribeAudio`
- `resolveMedia`
- `downloadMedia`
- `transcribeMedia`
- `deleteAssets`
- `deleteTask`

This is required even after canonical ID fixes because route params should always be URL-encoded.

### 2. Keep new XHS IDs canonical and path-safe

Ensure current XHS adapter always creates:

```text
xhs-682eefa40000000003039a4b
```

for:

```text
http://xhslink.com/o/4ALz6kVmU1m
https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b?...
```

Do not allow `?source=...` into `source.id`.

### 3. Handle legacy dirty XHS records

The app must let users delete old dirty cards that already exist.

Minimum required compatibility:

- encoded task IDs from the frontend must allow `DELETE /api/tasks/:taskId` and `DELETE /api/tasks/:taskId/assets` to find the exact legacy record.

Recommended additional cleanup:

- When listing sources, derive a canonical key for legacy XHS records whose IDs contain query strings.
- Prevent duplicate display between:

```text
xhs-682eefa40000000003039a4b
xhs-682eefa40000000003039a4b?source=...
```

If both canonical and dirty records exist, prefer the canonical clean record in `GET /api/tasks`.

Do not automatically delete the dirty directory during list. Deletion should happen only from explicit `删除卡片`.

### 4. API invalid input fix from prior audit

Also fix the previous audit finding:

```text
POST /api/tasks {"sourceUrl":"这不是链接"} -> 500
```

Expected:

```text
HTTP 400
{"message":"No supported source URL found in input."}
```

### 5. Favicon 404 is optional

Browser also reports:

```text
/favicon.ico 404
```

This is not blocking task behavior. Gemini may add a minimal favicon only if low-risk; otherwise report as a follow-up.

## Verification Commands

Run:

```bash
npm run build
npm run typecheck
```

### Encode legacy ID deletion

Use an isolated or existing legacy fixture with an ID containing `?`:

```text
xhs-682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=ABHCAnYqVSjMn7bympymavoiCpF6yYBbkWLE1mUCesu1A=&xsec_source=pc_share
```

From browser/client or curl:

```bash
node -e "console.log(encodeURIComponent('xhs-682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=ABHCAnYqVSjMn7bympymavoiCpF6yYBbkWLE1mUCesu1A=&xsec_source=pc_share'))"
```

Then:

```bash
curl -sS -i -X DELETE "http://127.0.0.1:8001/api/tasks/<encoded-task-id>"
```

Expected:

- route does not truncate at `?`;
- backend deletes the exact legacy source;
- card disappears from homepage after refresh.

### Asset delete for legacy ID

```bash
curl -sS -i -X DELETE "http://127.0.0.1:8001/api/tasks/<encoded-task-id>/assets" \
  -H 'Content-Type: application/json' \
  -d '{"scope":"generated"}'
```

Expected:

- no 404 caused by query-string truncation.

### Invalid input 400

```bash
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"sourceUrl":"这不是链接"}'
```

Expected:

```text
HTTP/1.1 400 Bad Request
```

### New XHS import remains clean

```bash
curl -sS -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"sourceUrl":"88 【千万不要陪孩子写作业！ - 樊登 | 小红书】 https://www.xiaohongshu.com/discovery/item/682eefa40000000003039a4b?source=webshare&xhsshare=pc_web&xsec_token=ABHCAnYqVSjMn7bympymavoiCpF6yYBbkWLE1mUCesu1A=&xsec_source=pc_share"}'
```

Expected returned ID:

```text
xhs-682eefa40000000003039a4b
```

## Acceptance Criteria

- All frontend task-specific API calls URL-encode `taskId`.
- Existing dirty XHS cards can be deleted from the UI.
- Existing dirty XHS assets can be deleted from the UI.
- New XHS imports never create IDs containing `?`, `&`, or `=`.
- Long-link and short-link XHS imports dedupe to the same canonical card.
- Invalid import text returns HTTP 400, not 500.
- `npm run build` passes.
- `npm run typecheck` passes.
- No generated `tsconfig.tsbuildinfo` churn in final patch.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-29-fix-task-id-url-encoding-and-legacy-xhs-ids-report.md
```

Report must include:

- changed files,
- exact encoded legacy ID test,
- delete card response for legacy dirty ID,
- delete assets response for legacy dirty ID,
- invalid input 400 response,
- clean XHS import response,
- build/typecheck results,
- unresolved risks.
