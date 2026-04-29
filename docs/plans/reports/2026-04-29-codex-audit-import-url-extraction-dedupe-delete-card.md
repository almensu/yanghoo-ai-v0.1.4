# Codex Audit: Import URL Extraction, Deduplication, and Delete Card

## Summary

Codex reviewed Gemini's report:

```text
docs/plans/reports/2026-04-29-import-url-extraction-dedupe-delete-card-report.md
```

Result: functionally accepted for the three user-facing requirements, with one API error-code fix required before final acceptance.

Accepted:

- Full Xiaohongshu mobile share text is accepted by the API and the short URL is extracted.
- Mobile short link and PC long link dedupe to one canonical source ID.
- `DELETE /api/tasks/:taskId` removes the source record and the card no longer appears in `GET /api/tasks`.
- Full card deletion also deletes generated local assets before removing `record.json`.
- UI now has separate actions for `删除本地资产` and `删除卡片`.
- `npm run build` passes.
- `npm run typecheck` passes.

Required follow-up:

- Invalid import text with no supported URL returns HTTP 500. It should return HTTP 400 with a clear message.
- Generated `tsconfig.tsbuildinfo` churn remains in the worktree and should not be part of the final patch.

## Verification Performed

Codex ran:

```bash
npm run build
npm run typecheck
DATA_DIR=/tmp/yanghoo-audit-import-dedupe PORT=8011 MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev -w @yanghoo/api
```

Then verified share text import:

```bash
curl -sS -i -X POST http://127.0.0.1:8011/api/tasks \
  -H 'Content-Type: application/json' \
  --data-binary '{"sourceUrl":"千万不要陪孩子写作业！ 真的不用陪孩子写作业，既解... http://xhslink.com/o/4ALz6kVmU1m 把这段话复制下来，打开【小红书】查看。"}'
```

Observed:

```json
{
  "id": "xhs-682eefa40000000003039a4b",
  "platform": "xiaohongshu",
  "url": "http://xhslink.com/o/4ALz6kVmU1m",
  "title": "千万不要陪孩子写作业！",
  "duration": 63.252,
  "canonicalId": "682eefa40000000003039a4b"
}
```

Then imported the PC long URL and counted cards:

```bash
curl -sS http://127.0.0.1:8011/api/tasks
```

Observed count for `xhs-682eefa40000000003039a4b`:

```text
1
```

Then verified card deletion:

```bash
curl -sS -i -X DELETE http://127.0.0.1:8011/api/tasks/xhs-682eefa40000000003039a4b
curl -sS http://127.0.0.1:8011/api/tasks
```

Observed:

- DELETE returned success.
- `GET /api/tasks` returned `[]`.
- Source directory was removed when only `record.json` existed.

Codex also created fake generated files under the isolated `DATA_DIR` and re-ran `DELETE /api/tasks/:taskId`. Observed deleted files included:

```text
media-manifest.json
media.mp4
audio-manifest.json
audio.wav
transcript-manifest.json
transcript-raw.json
transcript-sentences.json
transcript.vtt
document.md
mlx-script-output-xhs-682eefa40000000003039a4b.json
record.json
```

So full card deletion does remove generated assets before removing the record.

## Findings

### P1: Invalid import text returns 500 instead of 400

Evidence:

```bash
curl -sS -i -X POST http://127.0.0.1:8011/api/tasks \
  -H 'Content-Type: application/json' \
  -d '{"sourceUrl":"这不是链接"}'
```

Observed:

```http
HTTP/1.1 500 Internal Server Error
```

Body:

```json
{
  "statusCode": 500,
  "error": "Internal Server Error",
  "message": "No supported source URL found in input."
}
```

Expected per task:

```http
HTTP/1.1 400 Bad Request
```

with:

```json
{
  "message": "No supported source URL found in input."
}
```

Required fix:

Wrap `POST /api/tasks` route logic in `try/catch` and map unsupported/no-URL input errors to HTTP 400. Preserve 500 for unexpected server failures.

### P2: Generated TypeScript build metadata remains modified

`git status --short` still shows multiple modified `tsconfig.tsbuildinfo` files.

Required fix:

Remove generated build metadata churn from the final patch unless there is an explicit reason to commit it.

## Decision

The implementation satisfies the main behavior:

- share text import works,
- canonical dedupe works,
- delete card removes the card.

Do not mark the task fully accepted until the invalid-input HTTP 400 behavior is fixed and generated build metadata churn is cleaned from the patch.
