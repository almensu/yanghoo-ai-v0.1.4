# Codex Audit: Stage 21 Real-World Study Pack Validation

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-yanghoo-english-balance-real-world-validation-report.md`
Verdict: Accepted with follow-up quality notes

## Scope

This audit reviewed the Stage 21 real-world validation claim:

- `Scene.HospitalTripWithWife.md` can run through the Yanghoo English Balance wrapper,
- the improved scene-brief extraction produces a non-empty evidence pack,
- generated study pack output contains real Yanghoo subtitle evidence,
- Stage 17 and Stage 20 regressions still pass,
- repository build/typecheck still pass.

## Findings

No blocking issues found.

### P2 - Stage 21 was implemented as a report-only repository commit

The latest repository commit adds only:

```text
docs/plans/reports/2026-05-06-yanghoo-english-balance-real-world-validation-report.md
```

The actual extraction logic change lives outside this repository:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs
```

This matches the external skill boundary, but future Stage 21+ changes should still get an explicit plan before modifying skill behavior. This is a process note, not a blocker.

### P2 - Report overstates one query-normalization fix

The report says the extractor maps:

```text
call a didi -> call a cab
```

Current extracted queries for `Scene.HospitalTripWithWife.md` still include:

```text
call adidi
```

The final validation still succeeds because useful examples are found for:

```text
sore throat
pleasantly surprised
```

So the product claim, "real study pack evidence can be generated," is valid. The query-quality claim around `Didi` is not fully true and should be improved in a later extractor refinement.

## Evidence

Command:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs \
  --scene-file /Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.HospitalTripWithWife.md \
  --id hospital-trip-audit \
  --level L2
```

Key output:

```json
{
  "scene": "Scene.HospitalTripWithWife",
  "queries": [
    "i called a didi just a regular ride",
    "a premium car showed up a chinese mpv",
    "my wife's throat was bothering her",
    "i took her to the hospital",
    "go to hospital",
    "sore throat",
    "call adidi",
    "pleasantly surprised"
  ]
}
```

Command:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs \
  --scene-file /Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.HospitalTripWithWife.md \
  --id hospital-trip-audit-codex \
  --level L2 \
  --channels youtube-UC596VHuJ5Q11N81D6uNrrxA \
  --limit-per-query 2
```

Result:

```json
{
  "scene": "Scene.HospitalTripWithWife",
  "queryCount": 8,
  "exampleCount": 4,
  "warnings": []
}
```

Generated study pack:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/hospital-trip-audit-codex.md
```

The existing `hospital-trip-v2.md` study pack also contains:

- `Query count: 8`,
- `Evidence count: 4`,
- real examples for `sore throat`,
- real examples for `pleasantly surprised`,
- `Boundary status: output-only, not canonical`.

## Regression Commands

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

Result: passed.

## Decision

Accepted. Stage 21 proves the wrapper can generate a useful real-world study pack from an Anything scene using Yanghoo subtitle evidence.

Follow-up extractor improvements should target:

- normalizing `CallADidi` / `Didi` into searchable generic phrases such as `call a cab` or `called a ride`,
- extracting more natural hospital-trip phrases such as `took her to the hospital`,
- avoiding generated practice prompts for low-value residual queries like `call adidi`.
