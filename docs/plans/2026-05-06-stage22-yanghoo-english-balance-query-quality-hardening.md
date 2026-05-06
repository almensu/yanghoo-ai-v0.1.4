# Stage 22 Plan: Yanghoo English Balance Query Quality Hardening

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready

## Goal

Improve the external `yanghoo-english-balance` scene-brief extractor so real Anything scenes produce more searchable English queries.

Stage 21 proved the workflow can generate real evidence, but it also exposed query-quality defects:

```text
Action.CallADidi -> call adidi
```

and some useful natural phrases are not prioritized consistently.

This stage hardens extraction for `Scene.HospitalTripWithWife.md` while preserving the existing Stage 17/20 workflow.

## Non-Goals

- Do not change Yanghoo production search behavior unless a real bug is found.
- Do not change subtitle acquisition, indexing, or channel data.
- Do not add UI.
- Do not write to `Anything-to-English/canonical`.
- Do not copy Yanghoo corpora into `Anything-to-English`.
- Do not use an LLM at runtime for query extraction.

## Target Files

External skill:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/workflows.md
```

Yanghoo AI verification/report:

```text
scripts/ops/verify-stage22-yanghoo-english-balance-query-quality.ts
docs/plans/reports/2026-05-06-yanghoo-english-balance-query-quality-hardening-report.md
```

If skill docs do not need changes, state that explicitly in the report.

## Current Failure Evidence

Command:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs \
  --scene-file /Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.HospitalTripWithWife.md \
  --id hospital-trip-audit \
  --level L2
```

Current problematic queries include:

```text
i called a didi just a regular ride
call adidi
```

Stage 21 report also claimed `call a didi -> call a cab`, but the current implementation only maps the exact phrase `call a didi`; `Action.CallADidi` becomes `call adidi`, so the mapping does not fire.

## Required Extractor Improvements

Update `extract-scene-brief.mjs` so it:

1. Normalizes CamelCase and acronym-like tokens more carefully:

```text
CallADidi -> call a didi
CallDidi -> call didi
GoToHospital -> go to hospital
ThroatProblem -> throat problem
PleasantlySurprised -> pleasantly surprised
```

2. Applies domain mappings after normalization:

```text
call a didi -> call a cab
call didi -> call a cab
called a didi -> called a cab
i called a didi -> called a cab
go to hospital -> go to the hospital
throat problem -> sore throat
```

3. Extracts natural subphrases from `Typical English`, including:

```text
sore throat
took her to the hospital
called a ride
called a cab
premium car showed up
pleasantly surprised
```

The exact query list can include a subset of these, but it must include at least:

```text
sore throat
took her to the hospital
call a cab OR called a cab OR called a ride
pleasantly surprised
```

4. Filters low-value residual queries:

```text
call adidi
i called a didi just a regular ride
state.throat problem
state.pleasantly surprised
```

5. Keeps deterministic behavior:

- no network calls,
- no LLM calls,
- stable ordering,
- max 15 queries.

## Verification Script Requirements

Create:

```text
scripts/ops/verify-stage22-yanghoo-english-balance-query-quality.ts
```

The script must:

1. Run the external extractor on:

```text
/Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.HospitalTripWithWife.md
```

2. Assert:

- `kind === "scene-brief"`,
- `scene === "Scene.HospitalTripWithWife"`,
- `queries.length > 0`,
- `queries.length <= 15`,
- includes `sore throat`,
- includes `took her to the hospital`,
- includes one of `call a cab`, `called a cab`, `called a ride`,
- includes `pleasantly surprised`,
- does not include `call adidi`,
- does not include any query containing `state.`,
- does not include any query containing `action.`,

3. Run the wrapper:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs \
  --scene-file /Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.HospitalTripWithWife.md \
  --id hospital-trip-stage22-audit \
  --level L2 \
  --channels <indexedChannelId> \
  --limit-per-query 2
```

Find `<indexedChannelId>` from:

```bash
npm run -s cli -- learning-channels list --json
```

Choose a channel with `indexedSentenceCount > 0`.

4. Assert wrapper stdout parses as JSON and:

- `scene === "Scene.HospitalTripWithWife"`,
- `queryCount > 0`,
- `exampleCount > 0`,
- `warnings` is an array,
- `studyPackPath` exists.

5. Read the generated study pack and assert it includes:

- `# Study Pack: Scene.HospitalTripWithWife`,
- `## Real Subtitle Evidence`,
- `Boundary status: output-only, not canonical`.

## Regression Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage22-yanghoo-english-balance-query-quality.ts
npx tsx scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts
npx tsx scripts/ops/verify-stage20-yanghoo-english-balance-cli-wrapper.ts
npm run typecheck
npm run build
```

## Acceptance Criteria

- Stage 22 verification passes.
- Stage 17 and Stage 20 verification still pass.
- Typecheck and build pass.
- `call adidi` is gone from `Scene.HospitalTripWithWife` extracted queries.
- Natural hospital-trip phrases are present.
- Wrapper still generates a non-empty study pack.
- Report includes exact commands, key outputs, changed files, unresolved risks, and skipped commands.

## Expected Report

Write:

```text
docs/plans/reports/2026-05-06-yanghoo-english-balance-query-quality-hardening-report.md
```

The report must include:

- before/after query list for `Scene.HospitalTripWithWife`,
- wrapper result JSON summary,
- generated study pack path,
- verification command results,
- whether skill docs changed,
- unresolved risks.

## Gemini Prompt

Implement Stage 22 exactly as planned in:

```text
docs/plans/2026-05-06-stage22-yanghoo-english-balance-query-quality-hardening.md
```

Modify only the external `yanghoo-english-balance` skill extractor unless the verification script requires repository changes. Add the Stage 22 verification script in `scripts/ops`, run all required verification commands, and write the report to:

```text
docs/plans/reports/2026-05-06-yanghoo-english-balance-query-quality-hardening-report.md
```
