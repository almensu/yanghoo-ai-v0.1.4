# Codex Audit: Stage 18 Yanghoo English Balance Study Pack

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-yanghoo-english-balance-study-pack-report.md`
Plan Reviewed: `docs/plans/2026-05-06-stage-yanghoo-english-balance-study-pack.md`
Verdict: Accepted

## Scope

This audit reviewed:

- external `build-study-pack.mjs`,
- Stage 18 verification script,
- generated study pack markdown,
- skill documentation updates,
- output path and cross-repository boundaries,
- Stage 16/17 regression compatibility.

## Findings

No blocking issues found.

## Evidence

### Study Pack Script

Reviewed:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/build-study-pack.mjs
```

The script:

- reads scene brief JSON,
- reads Yanghoo evidence pack JSON,
- validates `kind` values,
- validates `brief.id === evidence.briefId`,
- writes deterministic markdown,
- prints JSON containing `studyPackPath`, `scene`, and `exampleCount`.

### Generated Study Pack

Generated file:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/morning-routine-audit.md
```

The markdown contains required sections:

- `# Study Pack: Scene.MorningRoutine`
- `## Source`
- `## Scene Goal`
- `## Search Queries`
- `## Real Subtitle Evidence`
- `## Shadowing Queue`
- `## Practice Prompts`
- `## My Version`
- `## Boundary Note`

The real evidence section contains real Yanghoo subtitle examples with YouTube timestamp URLs, including examples for:

- `wake up`
- `brush my teeth`

The practice section explicitly states that prompts are not real subtitle evidence.

### Boundary Check

Anything-to-English status shows the new study pack only under:

```text
output/local/yanghoo/study-packs/
```

No write to:

```text
Anything-to-English/canonical/
Anything-to-English/source/
Yanghoo data copied into Anything canonical
```

No repository merge, submodule, workspace dependency, or package dependency was observed.

## Verification Commands

```bash
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
```

Result: passed.

```bash
npx tsx scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts
```

Result: passed.

```bash
npx tsx scripts/ops/verify-stage18-yanghoo-english-balance-study-pack.ts
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

## Residual Notes

- `build-study-pack.mjs` accepts an explicit `--output` path. Current verification proves the intended output path, but future hardening could enforce or warn when output is outside `Anything-to-English/output/local/yanghoo/study-packs/`.
- The `Shadowing Queue` currently uses generic checklist labels. Later stages can make it more useful by listing the actual evidence sentences.

These are quality improvements, not acceptance blockers.

