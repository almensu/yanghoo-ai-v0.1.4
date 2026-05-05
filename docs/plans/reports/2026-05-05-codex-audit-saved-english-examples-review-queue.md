# Codex Audit: Stage 14 Saved English Examples Review Queue

Date: 2026-05-05

Audited report:

- `docs/plans/reports/2026-05-05-saved-english-examples-review-queue-report.md`

Plan baseline:

- `docs/plans/2026-05-05-stage-saved-english-examples-review-queue.md`

## Verdict

Rejected for follow-up fixes.

The domain, storage, application use cases, API routes, and Saved Examples page are broadly aligned with the Stage 14 plan. The deterministic verification, typecheck, and build pass. However, the English Search Save/Saved contract is currently broken because the frontend uses a different id than the backend stable id.

## Findings

### P1: English Search uses a different saved id than the backend

Files:

- `apps/web/src/components/EnglishSentenceSearch.tsx`
- `packages/application/src/savedEnglishExamplesUseCases.ts`
- `apps/api/src/routes/englishSavedExamples.ts`

Backend saved example id:

```text
sha1(channelId|sourceId|videoId|start|end|normalizedText).slice(0, 20)
```

Frontend `resultKey()`:

```text
channelId:sourceId:start
```

English Search loads saved ids through:

```http
GET /api/english-saved-examples/ids
```

That endpoint returns backend SHA1 ids. But the UI checks:

```ts
savedIds.has(resultKey(result))
```

and unsaves with:

```ts
deleteSavedExample(resultKey(result))
```

These ids do not match.

Reproduction evidence:

```json
{
  "savedId": "854c870f5a6d0e185b5b",
  "frontendKey": "ch-test-001:src-test-001:10.5",
  "idsHasSavedId": true,
  "idsHasFrontendKey": false
}
```

Impact:

- After refresh, previously saved Search results may show `Save` instead of `Saved`.
- Clicking that sentence again POSTs a duplicate save attempt rather than unsaving.
- The backend dedupes, but UI still cannot map that saved item to the search result unless the POST returns the id during that session.
- Search-page unsave calls `DELETE /api/english-saved-examples/{channelId:sourceId:start}`, which returns 404 and is swallowed by `catch {}`.

Required fix:

- Use one id contract end to end.
- Preferred: expose a shared deterministic id helper from application/domain or return a `savedKey`/`id` mapping endpoint that accepts search result identity fields.
- Minimal acceptable fix: frontend must compute the exact same SHA1 id as backend from `channelId|sourceId|videoId|start|end|normalizedText`, and use that id for `savedIds.has()` and DELETE.
- Add verification proving saved ids returned by `/ids` match the id the English Search UI computes for the same result.

### P1: Search-page save/unsave failures are silently swallowed

File:

- `apps/web/src/components/EnglishSentenceSearch.tsx`

`toggleSave()` catches errors with empty `catch {}` blocks. This hides failed saves/deletes from the user and from manual QA.

Required fix:

- Surface an error message in the existing English Search error/warning area.
- Do not update saved state on failure.

### P2: POST validation failure returns HTTP 200

File:

- `apps/api/src/routes/englishSavedExamples.ts`

Invalid POST body currently returns:

```json
{ "item": null, "created": false, "error": "..." }
```

with HTTP 200.

Required fix:

- Return `400` with `{ message }`, consistent with the rest of the API.

### P2: Saved Examples active selection starts empty

File:

- `apps/web/src/components/SavedEnglishExamples.tsx`

After saved examples load, no item is selected by default. The plan asked for replay/review flow; selecting the first item by default would match Stage 13's active result behavior and reduce friction.

Required fix:

- When items load and `activeId` is null or no longer present, select the first item.

## Verified Passing

Commands run:

```bash
npx tsx scripts/ops/verify-stage14-saved-english-examples-review-queue.ts
npm run typecheck
npm run build
```

Observed results:

- Stage 14 script: `36 passed, 0 failed`
- `npm run typecheck`: passed
- `npm run build`: passed

These passing checks prove the storage/use-case core works, but they do not cover the English Search id mapping bug above.

## Next Gemini Task

Patch Stage 14 only:

- Align frontend saved id computation with backend stable id.
- Add a verification assertion for frontend/API saved id compatibility.
- Surface save/unsave errors in English Search.
- Return HTTP 400 for invalid save POST.
- Default-select the first Saved Example after list load.
- Re-run Stage 14 verification, typecheck, and build.
