# Codex Audit: Stage 22 Yanghoo English Balance Query Quality Hardening

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-yanghoo-english-balance-query-quality-hardening-report.md`
Plan Reviewed: `docs/plans/2026-05-06-stage22-yanghoo-english-balance-query-quality-hardening.md`
Verdict: Accepted with minor follow-up notes

## Scope

This audit reviewed:

- external skill `extract-scene-brief.mjs`,
- Stage 22 verification script,
- `Scene.HospitalTripWithWife` extracted queries,
- wrapper study-pack generation,
- Stage 17 and Stage 20 regressions,
- typecheck and build.

## Findings

No blocking issues found.

### P2 - Verification script uses a hard-coded channel

The Stage 22 plan asked the verification script to choose an indexed channel from:

```bash
npm run -s cli -- learning-channels list --json
```

The implemented script hard-codes:

```text
youtube-UC596VHuJ5Q11N81D6uNrrxA
```

This is not a blocker on this machine because the channel exists and is indexed, and the wrapper smoke passed. For durability, a later test cleanup should select an indexed channel dynamically or at least assert that the hard-coded channel is currently indexed before use.

### P2 - Query list still contains near-duplicate hospital phrases

The new output includes both:

```text
i took her to the hospital
took her to the hospital
```

This is acceptable for Stage 22 because the critical low-quality query `call adidi` is removed, and the wrapper still finds real evidence. A later refinement can normalize pronoun-prefixed variants or deduplicate by suffix similarity.

## Evidence

Command:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs \
  --scene-file /Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.HospitalTripWithWife.md \
  --id codex-stage22-audit \
  --level L2
```

Key output:

```json
{
  "scene": "Scene.HospitalTripWithWife",
  "queries": [
    "a premium car showed up a chinese mpv",
    "my wife's throat was bothering her",
    "i took her to the hospital",
    "took her to the hospital",
    "just a regular ride",
    "called a cab",
    "sore throat",
    "pleasantly surprised"
  ]
}
```

The output includes:

- `sore throat`,
- `took her to the hospital`,
- `called a cab`,
- `pleasantly surprised`.

The output does not include:

- `call adidi`,
- `state.*`,
- `action.*`.

Generated study pack:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/hospital-trip-stage22-audit.md
```

The study pack includes:

- `Query count: 8`,
- `Evidence count: 4`,
- `## Real Subtitle Evidence`,
- real examples for `sore throat`,
- real examples for `pleasantly surprised`,
- `Boundary status: output-only, not canonical`.

## Verification Commands

```bash
npx tsx scripts/ops/verify-stage22-yanghoo-english-balance-query-quality.ts
```

Result: passed.

```bash
npx tsx scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts
```

Result: passed.

```bash
npx tsx scripts/ops/verify-stage20-yanghoo-english-balance-cli-wrapper.ts
```

Result: passed.

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
✓ built in 1.15s
```

## Decision

Accepted. Stage 22 closes the Stage 21 query-quality issue for `Scene.HospitalTripWithWife` and preserves the accepted workflow.

Carry the hard-coded-channel and near-duplicate-query notes as future test/quality cleanup, not current blockers.
