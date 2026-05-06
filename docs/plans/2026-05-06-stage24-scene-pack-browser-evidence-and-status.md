# Stage 24 Plan: Scene Pack Browser Evidence And Status Checkpoint

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready for Gemini

## Reference Context

Codex attempted to read the configured advisory reference repository:

```text
/Volumes/2T/com/yanghoo205/yanghoo-reference
```

The path was not mounted or available on this machine during plan creation. Gemini should use it if it is available in the execution environment, especially:

- `reference/index.md`
- `reference/architecture.md`
- `reference/repo-conventions.md`
- `reference/decision-rules.md`
- `reference/test-strategy.md`
- `reference/review-checklists/`

If the reference repository is still unavailable, continue using this repo's accepted ADRs and record the missing reference path in the report. This plan relies on:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/GOTCHAS.md`
- `docs/plans/2026-05-06-stage23-english-scene-pack-ui.md`
- `docs/plans/reports/2026-05-06-codex-audit-english-scene-pack-ui.md`
- `docs/plans/reports/2026-05-06-codex-accept-stage23-english-scene-pack-ui-follow-up.md`

## Goal

Turn Stage 23 from code-level acceptance into a reproducible user-facing checkpoint:

```text
real scene pack imported -> visible in browser -> grouped by query -> playable -> save persists correct query -> status docs reflect accepted Stage 21-23
```

This stage should produce evidence that the user can trust without relying on a deleted test pack or only command-line assertions.

## Non-Goals

- Do not add a new learning system or spaced-repetition workflow.
- Do not change `Anything-to-English` canonical files.
- Do not parse Markdown as the scene-pack source of truth.
- Do not rebuild the English Search UI layout.
- Do not commit runtime data under `data/`.
- Do not expand platform acquisition behavior.

## Target Files

Primary expected files:

```text
docs/plans/reports/2026-05-06-stage24-scene-pack-browser-evidence-and-status-report.md
docs/plans/reports/2026-05-06-codex-rollup-stage21-24-status.md
docs/plans/reports/screenshots/
```

Only change production code if browser verification exposes a real defect that blocks the goal. If production code changes are needed, keep them scoped to:

```text
apps/web/src/components/EnglishSentenceSearch.tsx
apps/web/src/api/client.ts
scripts/ops/verify-stage23-english-scene-pack-ui.ts
```

## Layer Placement

- UI behavior and screenshots belong to `apps/web`.
- API calls must use existing `apps/api` routes.
- Scene-pack import/list/show/delete remain application/storage behavior through existing use cases.
- Runtime scene-pack JSON belongs under the canonical repo data root `data/learning/english-scene-packs/` and must not be committed.
- Reports and screenshots belong under `docs/plans/reports/`.

## Required Work

1. Commit or otherwise account for the Stage 23 Codex acceptance report before starting browser evidence, so `git status --short` begins from a known state.
2. Ensure a real scene pack exists for browser validation. Prefer the user's current pack if present:

   ```text
   kid-wake-up-morning
   ```

   If it is missing, import it from the existing structured artifacts if available. If those artifacts are missing, use the Stage 23 verification fixture but do not delete the browser-evidence pack before screenshots are taken.

3. Start the local app using the repository's dev-server gotchas:

   ```bash
   lsof -nP -iTCP:3000 -sTCP:LISTEN || true
   lsof -nP -iTCP:8001 -sTCP:LISTEN || true
   npm run dev
   ```

   If ports are occupied, report the existing processes and use the already-running servers if they are healthy.

4. Capture browser evidence for the English Search scene-pack workflow:

   - scene-pack list visible in the sidebar,
   - selected pack header visible,
   - query chips visible,
   - examples grouped by query section headers,
   - at least one playable example selected with the player panel populated,
   - saving one scene-pack example persists the pack example query, not the global search input.

5. Write an updated rollup for Stage 21 through Stage 24 so stale rejected audits are not mistaken for current blockers.

## Acceptance Criteria

- Stage 23 remains accepted after browser validation.
- A screenshot shows a real scene pack selected in the English Search UI.
- A screenshot or API/readback evidence shows examples grouped by query.
- A save/readback check proves the saved example query equals the scene-pack example query.
- `data/` runtime pack files are not committed.
- `*.tsbuildinfo` files remain untracked.
- The Stage 21-24 rollup states:
  - Stage 21 accepted with quality notes,
  - Stage 22 accepted with minor follow-up notes,
  - Stage 23 accepted after follow-up,
  - Stage 24 accepted or blocked with concrete evidence.

## Verification Commands

Gemini must run and report exact results:

```bash
npx tsx scripts/ops/verify-stage23-english-scene-pack-ui.ts
npx tsx scripts/ops/verify-stage22-yanghoo-english-balance-query-quality.ts
npm run typecheck
npm run build
git status --short
git ls-files '*.tsbuildinfo'
```

For browser/API evidence, include the exact URL used and either screenshot paths or summarized API readback output.

## Expected Report

Write:

```text
docs/plans/reports/2026-05-06-stage24-scene-pack-browser-evidence-and-status-report.md
```

The report must include:

- changed files,
- commands run,
- screenshot paths,
- imported pack id,
- saved example id and saved query,
- whether the reference repository was available,
- unresolved risks,
- skipped commands with reasons.

Codex will audit the report before any new product stage is assigned.
