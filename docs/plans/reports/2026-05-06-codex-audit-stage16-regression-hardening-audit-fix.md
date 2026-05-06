# Codex Audit: Stage 16 Regression Hardening Audit Fix

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-stage16-regression-hardening-audit-fix-report.md`
Plan Reviewed: `docs/plans/2026-05-06-stage16-regression-hardening-audit-fix.md`
Verdict: Accepted with residual verification tightening

## Scope

This audit reviewed whether the Stage 16 audit-fix implementation closes the prior category/tag verification gap:

- deterministic taxonomy fixture on a real indexed channel,
- positive `--category` search,
- positive `--tag` search,
- positive category+tag search,
- positive batch evidence-pack examples,
- taxonomy restoration,
- Stage 16 baseline verification,
- typecheck and build.

## Findings

No blocking issues found.

### P2 - Field assertions only check representative items

The verification script checks full required fields on the first category-search result and first batch example. It does not yet assert every returned result/example across category, tag, category+tag, and batch paths.

This is not a blocker for this audit because:

- the core missing behavior was positive category/tag channel resolution,
- the deterministic fixture now proves that behavior end-to-end,
- batch evidence is non-empty,
- the mapper for result fields is shared,
- duplicate detection covers all batch examples.

Recommended future tightening:

- extract `assertSearchResultFields()` and apply it to every result in category, tag, and category+tag outputs,
- extract `assertEvidenceExampleFields()` and apply it to every batch example.

## Evidence

Created:

```text
scripts/ops/verify-stage16-regression-hardening.ts
```

The script:

- finds a real channel with `indexedSentenceCount > 0`,
- saves original taxonomy,
- sets temporary taxonomy with `stage16-audit-category` and `stage16-audit-tag`,
- verifies positive category/tag/category+tag searches,
- verifies positive batch evidence,
- restores or deletes taxonomy in `finally`.

Fixture channel used during audit:

```text
youtube-UC596VHuJ5Q11N81D6uNrrxA
English is EZ with Connor
```

## Verification Commands

```bash
npx tsx scripts/ops/verify-stage16-regression-hardening.ts
```

Result: passed. Key lines:

```text
✅ category search verified
✅ tag search verified
✅ category+tag search verified
✅ batch search verified
--- Stage 16 Regression Hardening PASSED ---
Deleted temporary taxonomy (no original existed).
```

```bash
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
```

Result: passed. Key lines:

```text
✅ english-search --channel works
✅ english-search --channels works
✅ empty category warning works
✅ english-search batch works
✅ non-English flag rejected
✅ skill file frontmatter verified
Stage 16 verification passed!
```

```bash
npm run -s cli -- learning-channels list --json | rg -n "stage16-audit|UC596VHuJ5Q11N81D6uNrrxA|category|tags"
```

Result: no `stage16-audit-*` taxonomy remained. The fixture channel was present with:

```json
"tags": []
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
✓ built in 1.13s
```

## Decision

Accepted. The Stage 16 deterministic category/tag regression gap is closed for current planning purposes.

Carry the P2 assertion tightening as a future test-quality improvement, not as a blocker.
