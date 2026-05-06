# Codex Audit: Stage 24 Scene Pack Browser Evidence And Status Checkpoint

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-stage24-scene-pack-browser-evidence-and-status-report.md`
Plan Reviewed: `docs/plans/2026-05-06-stage24-scene-pack-browser-evidence-and-status.md`
Verdict: Rejected pending browser-evidence follow-up

## Scope

This audit reviewed:

- Stage 24 report content,
- latest commits through `cbb6715 docs: Stage 24 verification report and status rollup`,
- screenshot artifacts under `docs/plans/reports/screenshots/`,
- Stage 22 and Stage 23 verification scripts,
- typecheck/build,
- tracked `*.tsbuildinfo` state.

## Checks Passed

The underlying Stage 22 and Stage 23 implementation remains healthy.

Codex ran:

```bash
npx tsx scripts/ops/verify-stage23-english-scene-pack-ui.ts
```

Result: passed. Key line:

```text
✅ Saved example verified with query: brush my teeth
--- Stage 23 Verification PASSED ---
```

Codex ran:

```bash
npx tsx scripts/ops/verify-stage22-yanghoo-english-balance-query-quality.ts
```

Result: passed.

Codex ran:

```bash
npm run typecheck
```

Result: passed across all workspaces.

Codex ran:

```bash
npm run build
```

Result: passed across all workspaces.

Codex ran:

```bash
git ls-files '*.tsbuildinfo'
```

Result: no tracked `*.tsbuildinfo` files.

Codex ran:

```bash
git status --short
```

Result: clean before this audit report was written.

## Findings

### P1 - Stage 24 does not include browser evidence

The Stage 24 plan required browser evidence for:

- scene-pack list visible in the sidebar,
- selected pack header visible,
- query chips visible,
- examples grouped by query section headers,
- at least one playable example selected with the player panel populated,
- save/readback proving the saved query came from the scene-pack example.

The Stage 24 report provides API-level and code-level assertions, but no browser URL, no screenshot paths, and no Playwright/browser transcript.

Codex checked:

```bash
find docs/plans/reports/screenshots -maxdepth 1 -type f | sort | tail -40
```

Only Stage 15 screenshots were present. No Stage 24 screenshots were created.

Impact:

- Stage 24 was specifically created to close the gap between code-level acceptance and user-facing browser evidence.
- API readback proves the data path, but it does not prove the English Search UI actually renders a real scene pack grouped by query or shows a playable selected example.

Required fix:

- Start or reuse local dev servers.
- Open the English Search UI in a browser.
- Select the real `kid-wake-up-morning` scene pack, or a documented replacement if that pack is unavailable.
- Capture screenshots under `docs/plans/reports/screenshots/`, with filenames that identify Stage 24.
- Include screenshot paths and the exact URL used in the follow-up report.

### P2 - Stage 21-24 status rollup is embedded and has inaccurate detail

The Stage 24 plan expected:

```text
docs/plans/reports/2026-05-06-codex-rollup-stage21-24-status.md
```

The latest commit only added:

```text
docs/plans/reports/2026-05-06-stage24-scene-pack-browser-evidence-and-status-report.md
```

It embeds a rollup section, which is acceptable as a report convenience, but the rollup says Stage 21 was:

```text
Validated with Vanessa real-world channel data.
```

Stage 21's actual audited validation centered on:

```text
Scene.HospitalTripWithWife
```

and the accepted audit carried quality notes around query normalization.

Required fix:

- Add the standalone Stage 21-24 rollup file requested by the plan, or explicitly update the plan/report to justify keeping the rollup embedded.
- Correct Stage 21 wording to match the accepted report and audit.
- Record Stage 22's hard-coded-channel and near-duplicate-query notes as minor follow-up notes, not as blockers.

## Decision

Stage 24 is rejected pending a browser-evidence follow-up.

This does not reopen Stage 23. The Stage 23 implementation and follow-up remain accepted based on automated verification and the prior Codex acceptance report. The remaining gap is that Stage 24 promised user-facing browser evidence and did not produce it.
