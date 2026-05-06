# Codex Follow-Up Audit: Stage 20 Yanghoo English Balance CLI Wrapper

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-yanghoo-english-balance-cli-wrapper-report.md`
Prior Audit: `docs/plans/reports/2026-05-06-codex-audit-yanghoo-english-balance-cli-wrapper.md`
Plan Reviewed: `docs/plans/2026-05-06-stage-yanghoo-english-balance-cli-wrapper.md`
Verdict: Accepted

## Scope

This follow-up audit reviewed the Stage 20 audit fix for:

- warning propagation from the Yanghoo evidence pack into wrapper stdout JSON,
- Stage 20 verification coverage for a selector with no matching channels,
- Stage 19 compatibility,
- clean stdout/stderr behavior,
- build and typecheck results.

Reference library note: the configured reference repository path `/Volumes/2T/com/yanghoo205/yanghoo-reference` was not mounted during this follow-up audit, so reference review-checklist files could not be re-read. The audit therefore used the Stage 20 plan, prior Codex audit, local repository rules, and direct verification evidence.

## Findings

No blocking issues found.

The prior P1 issue is fixed. The wrapper now parses `evidenceJsonStr` and emits:

```js
warnings: evidence.warnings ?? []
```

The Stage 20 verification now runs a no-match category case with:

```text
--category non-existent-category-123
```

and asserts that wrapper JSON includes:

```text
No channels matched criteria for search
```

## Verification Commands

```bash
npx tsx scripts/ops/verify-stage20-yanghoo-english-balance-cli-wrapper.ts
```

Result: passed. Key lines:

```text
✅ JSON structure validated
✅ Study pack created at: /Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/morning-routine-wrapper-audit.md
✅ Markdown content validated
✅ Missing selector failure validated
✅ Warning propagation validated
--- Stage 20 Verification PASSED ---
```

```bash
npx tsx scripts/ops/verify-stage19-yanghoo-english-balance-study-pack-hardening.ts
```

Result: passed. Key lines:

```text
✅ Default output path guard works
✅ Explicit override --allow-outside-output works
✅ Stage 19 verification passed!
```

```bash
npm run typecheck
```

Result: passed.

```bash
npm run build
```

Result: passed. The web build completed with:

```text
✓ 1589 modules transformed.
✓ built in 1.21s
```

## Boundary Review

The Stage 20 fix preserves the intended boundary:

- no global CLI installation,
- no workspace/package/submodule merge with `Anything-to-English`,
- no copy of Yanghoo subtitle corpora into `Anything-to-English`,
- no write to `Anything-to-English/canonical`,
- generated study packs remain under `Anything-to-English/output/local/yanghoo/study-packs/`.

## Decision

Accepted. Stage 20 can proceed as complete.
