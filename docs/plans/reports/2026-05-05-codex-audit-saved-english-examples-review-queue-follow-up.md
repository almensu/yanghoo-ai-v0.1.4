# Codex Audit Follow-Up: Stage 14 Saved English Examples Review Queue

Date: 2026-05-05

Audited report:

- `docs/plans/reports/2026-05-05-saved-english-examples-review-queue-report.md`

Previous audit:

- `docs/plans/reports/2026-05-05-codex-audit-saved-english-examples-review-queue.md`

## Verdict

Rejected for one remaining UI state fix.

The four reported fixes were implemented:

- frontend/backend stable id formula now matches,
- save/unsave errors are surfaced,
- invalid save POST returns HTTP 400,
- Saved Examples default-selects the first loaded item.

The deterministic verification, typecheck, and build pass. However, the English Search saved-state rendering is still fragile because stable ids are computed asynchronously into a ref without triggering a re-render.

## Finding

### P1: Saved button can remain stale after async id prewarm

File:

- `apps/web/src/components/EnglishSentenceSearch.tsx`

Current flow:

```ts
const stableIdCache = useRef(new Map<string, string>());

const isResultSaved = (result) => {
  const cached = stableIdCache.current.get(resultKey(result));
  return cached ? savedIds.has(cached) : false;
};

useEffect(() => {
  if (results.length === 0 || savedIds.size === 0) return;
  for (const r of results) {
    const key = resultKey(r);
    if (!stableIdCache.current.has(key)) {
      void computeStableId(r.entry).then(id => stableIdCache.current.set(key, id));
    }
  }
}, [results, savedIds]);
```

The effect computes the correct ids, but it only mutates a ref. React does not re-render when `stableIdCache.current` changes.

Impact:

- If `/ids` and search results load before the SHA1 prewarm finishes, the first render sees no cached id and shows `Save`.
- When the async SHA1 finishes, the cache contains the right id, but the UI may still show `Save` until another unrelated state change triggers a render.
- This weakens the acceptance criterion: "User can see saved state in English Search."

Required fix:

- Store result stable ids in React state instead of only a ref, for example:

```ts
const [resultStableIds, setResultStableIds] = useState<Record<string, string>>({});
```

- On results change, compute ids with `Promise.all` and update state once.
- `isResultSaved()` should read from state so completion triggers a render.
- Keep the ref only as an optional memo cache, not as the source of rendered truth.
- Add a verification or component-level smoke note proving a saved result renders as `Saved` after `/ids` and results load.

## Verified Passing

Commands run:

```bash
npx tsx scripts/ops/verify-stage14-saved-english-examples-review-queue.ts
npm run typecheck
npm run build
```

Observed results:

- Stage 14 verification: `39 passed, 0 failed`
- `npm run typecheck`: passed
- `npm run build`: passed

These checks cover the storage/use-case/API contract, but not the asynchronous UI render state described above.

## Next Gemini Task

Patch Stage 14 UI only:

- Make English Search saved-state rendering state-driven after async stable id computation.
- Keep save/unsave using backend stable ids.
- Re-run Stage 14 verification, typecheck, and build.
