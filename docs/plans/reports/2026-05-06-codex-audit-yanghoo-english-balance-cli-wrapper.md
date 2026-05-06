# Codex Audit: Stage 20 Yanghoo English Balance CLI Wrapper

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-yanghoo-english-balance-cli-wrapper-report.md`
Plan Reviewed: `docs/plans/2026-05-06-stage-yanghoo-english-balance-cli-wrapper.md`
Verdict: Rejected

## Scope

This audit reviewed:

- skill-local `balance-study-pack.mjs`,
- Stage 20 verification script,
- skill workflow docs,
- stdout/stderr behavior,
- missing selector behavior,
- generated study pack output,
- Stage 19 compatibility and build/typecheck.

## Findings

### P1 - Wrapper drops evidence-pack warnings from final JSON

The Stage 20 plan requires the wrapper to print clean JSON including:

```json
"warnings": []
```

This field should represent warnings from the underlying evidence pack. The current wrapper always emits:

```js
warnings: []
```

even when the Yanghoo CLI batch search returned warnings.

Real smoke:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs \
  --scene-file /Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.MorningRoutine.md \
  --id audit-no-category \
  --category non-existent-category-123 \
  --limit-per-query 2
```

Wrapper stdout:

```json
{
  "scene": "Scene.MorningRoutine",
  "sceneBriefPath": "/tmp/yanghoo-balance-audit-no-category-scene-brief.json",
  "evidencePackPath": "/tmp/yanghoo-balance-audit-no-category-evidence-pack.json",
  "studyPackPath": "/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/audit-no-category.md",
  "queryCount": 8,
  "exampleCount": 0,
  "warnings": []
}
```

But the evidence pack at the reported path contains:

```json
"warnings": ["No channels matched criteria for search"]
```

This matters because the one-command wrapper hides the most important diagnostic in a successful but empty run. The study pack says no evidence exists, but the wrapper result does not tell the caller that the selected category matched no channels.

Required fix:

- Parse `evidenceJson` in `balance-study-pack.mjs`.
- Set final `warnings` to `evidence.warnings ?? []`.
- Add Stage 20 verification for a no-match category/tag run that asserts the wrapper JSON includes `No channels matched criteria for search`.

## Checks Passed

The core wrapper path works:

- `balance-study-pack.mjs` is skill-local.
- It does not install a global command.
- It calls the existing scene-brief extractor, Yanghoo CLI batch search, and study-pack builder.
- Success stdout is JSON-clean.
- Progress logs go to stderr.
- Missing selector fails with:

```text
Provide --channel, --channels, --category, or --tag
```

Generated wrapper study pack path:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/morning-routine-wrapper-audit.md
```

The generated markdown contains:

- `# Study Pack: Scene.MorningRoutine`,
- `## Real Subtitle Evidence`,
- `## Shadowing Queue`,
- `Boundary status: output-only, not canonical`.

Stage 20 verification currently passes, but it does not cover warning propagation.

## Verification Commands

```bash
npx tsx scripts/ops/verify-stage20-yanghoo-english-balance-cli-wrapper.ts
```

Result: passed, but insufficient because warning propagation is not asserted.

```bash
npx tsx scripts/ops/verify-stage19-yanghoo-english-balance-study-pack-hardening.ts
```

Result: passed.

```bash
npm run typecheck
```

Result: passed.

```bash
npm run build
```

Result: passed.

## Boundary Review

No repository merge, global CLI installation, submodule, workspace dependency, package dependency, UI change, or subtitle corpus copy was observed.

## Required Next Step

Return a Stage 20 audit-fix report after:

1. Propagating evidence-pack warnings into wrapper JSON.
2. Strengthening Stage 20 verification with a no-match selector case.
3. Re-running Stage 20 verification, Stage 19 verification, typecheck, and build.

