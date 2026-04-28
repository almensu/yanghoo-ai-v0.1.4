# Fix Storage Root and Homepage Assets

## Owner

Gemini implements. Codex reviews.

## Goal

Make scripts, API, and homepage use the same canonical data root so real persisted assets render on the homepage.

The immediate verification target is:

```text
yt-Xdy1vkhSz-M
```

The homepage/API must show the real caption-derived asset with `sentencesCount: 147`, not the stale app-local mock asset with `sentencesCount: 4`.

## Non-goals

- Do not reintroduce mock transcript fallback.
- Do not duplicate data between `data/` and `apps/api/data/`.
- Do not hard-code `yt-Xdy1vkhSz-M` in frontend or API.
- Do not redesign the full UI.

## Target Files

- `packages/domain/src/storage.ts`
- `packages/storage/src/index.ts`
- `apps/api/src/config.ts`
- `apps/api/src/server.ts` if config wiring is needed
- `apps/web/src/App.tsx` for visible empty/error states
- `scripts/*` only if script output messaging needs to reference the canonical data root
- report under `docs/plans/reports/`

## Requirements

### 1. Introduce a canonical storage root

Storage must resolve all asset paths from one root shared by scripts and API.

Preferred behavior:

- default data root is the repository root `data/`
- optional `DATA_DIR` can override it
- no code should accidentally write to `apps/api/data/` just because the API process cwd is `apps/api`

### 2. Make storage path helpers root-aware

Current path helpers return relative strings like:

```text
data/sources/{sourceId}/record.json
```

Gemini must adjust the storage implementation so file reads/writes resolve against the canonical root. Keep domain path contracts clean; do not leak API-specific config into domain.

### 3. Remove or quarantine app-local stale data

The duplicate app-local path:

```text
apps/api/data/sources/yt-Xdy1vkhSz-M/
```

must not be used by the running API. If Gemini deletes local generated stale data, do it intentionally and report it. If Gemini keeps it, the API must ignore it.

### 4. Verify running API and Vite proxy

After the fix, these commands must return the real root asset:

```bash
curl -sS http://127.0.0.1:8001/api/tasks
curl -sS http://127.0.0.1:3000/api/tasks
```

Expected for `yt-Xdy1vkhSz-M`:

```json
{
  "documentAssets": {
    "status": "markdown_ready",
    "source": "platform_caption",
    "sentencesCount": 147,
    "hasMarkdown": true,
    "hasRefined": true,
    "hasVtt": true
  }
}
```

### 5. Add homepage diagnostics

If task loading fails, homepage should show a visible error message. If the API returns no tasks, homepage should show a visible empty state. Console-only errors are not enough.

## Verification Commands

Gemini must run:

```bash
npm run build
npm run typecheck
npx tsx scripts/collect/collect-youtube-url.ts 'https://www.youtube.com/watch?v=Xdy1vkhSz-M'
npx tsx scripts/transcript/refine-transcript-sentences.ts yt-Xdy1vkhSz-M
curl -sS http://127.0.0.1:8001/api/tasks
curl -sS http://127.0.0.1:3000/api/tasks
```

If local dev servers are already running, restart them after the storage root fix before checking `curl`.

## Acceptance Criteria

- Scripts and API read/write the same source directory for `yt-Xdy1vkhSz-M`.
- Running API returns `sentencesCount: 147` for `yt-Xdy1vkhSz-M`.
- Vite proxy returns the same API data.
- Homepage renders the `yt-Xdy1vkhSz-M` card from the real persisted asset.
- Homepage visibly reports API load failures and empty asset state.
- No stale app-local mock data is used by API.

## Expected Report

Write report to:

```text
docs/plans/reports/2026-04-27-fix-storage-root-and-homepage-assets-report.md
```

Report must include:

- changed files
- canonical data root behavior
- whether app-local stale data was removed or ignored
- API `/api/tasks` output excerpt showing `sentencesCount: 147`
- Vite proxy `/api/tasks` output excerpt showing the same
- build/typecheck results
- unresolved risks
