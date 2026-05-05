# Codex Audit Final: Stage 14 Saved English Examples Review Queue

Date: 2026-05-05

Audited report:

- `docs/plans/reports/2026-05-05-saved-english-examples-review-queue-report.md`

Previous audits:

- `docs/plans/reports/2026-05-05-codex-audit-saved-english-examples-review-queue.md`
- `docs/plans/reports/2026-05-05-codex-audit-saved-english-examples-review-queue-follow-up.md`

## Verdict

Accepted.

Stage 14 now satisfies the saved English examples plan:

- saved examples persist under `data/learning/english-saved-examples.json`,
- save is idempotent with a stable SHA1 id,
- English Search uses the same stable id contract as the backend,
- saved state rendering is React state-driven after async id computation,
- save/unsave errors surface in the UI,
- invalid save POST returns HTTP 400,
- Saved Examples defaults to the first item after load,
- deleting a saved example does not delete source/channel/index assets.

## Final Fix Review

The final UI fix replaced ref-only rendered state with:

```ts
const [resultStableIds, setResultStableIds] = useState<Map<string, string>>(new Map());
```

Current search results compute stable ids with `Promise.all`, then call `setResultStableIds(next)`. `isResultSaved()` now reads from this state map, so completed SHA1 computation triggers a React re-render and the `Save` / `Saved` button state becomes stable.

`toggleSave()` also writes fallback-computed ids back into `resultStableIds`, keeping later renders consistent.

## Verification

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

## Residual Risks

- No browser screenshot/UI automation was included in this audit.
- Saved examples remain a single local JSON file with no write locking, which is acceptable for the current local-first workflow.
