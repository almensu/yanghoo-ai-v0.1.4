# Stage 18 Plan: Yanghoo English Balance Study Pack

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready

## Goal

Extend `yanghoo-english-balance` from evidence retrieval to a usable learning artifact:

```text
Anything scene
-> scene brief
-> Yanghoo evidence pack
-> study pack markdown
```

The study pack should help yanghoo learn English from real subtitle evidence while keeping both repositories independent.

## Non-Goals

- Do not merge repositories.
- Do not add cross-repo packages, workspaces, submodules, or imports.
- Do not copy subtitle corpora into `Anything-to-English`.
- Do not write real examples into `Anything-to-English/canonical`.
- Do not add UI.
- Do not change Yanghoo subtitle acquisition, indexing, or search behavior.
- Do not require an LLM.

## Target Files

External skill:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/workflows.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/study-pack-schema.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/build-study-pack.mjs
```

Yanghoo AI:

```text
scripts/ops/verify-stage18-yanghoo-english-balance-study-pack.ts
docs/plans/reports/2026-05-06-yanghoo-english-balance-study-pack-report.md
```

Anything-to-English output target for smoke only:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/
```

## Study Pack Requirements

Input:

```text
scene brief JSON
evidence pack JSON
```

Output:

```text
Markdown study pack
```

Required sections:

```text
# Study Pack: <scene>

## Source
- Scene:
- Scene brief:
- Evidence pack:
- Generated at:

## Scene Goal

## Search Queries

## Real Subtitle Evidence

## Shadowing Queue

## Practice Prompts

## My Version

## Boundary Note
```

Rules:

- Clearly label real subtitle examples as real Yanghoo evidence.
- Include timestamp URLs when available.
- Do not present generated prompts as real corpus examples.
- Keep the pack compact.
- If evidence examples are empty, still create a useful pack with queries and practice prompts.
- Write only to `output/local/yanghoo/study-packs/` unless the user explicitly asks for a different layer.

## Implementation Instructions

### 1. Add `build-study-pack.mjs`

Create:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/build-study-pack.mjs
```

CLI:

```bash
node <skill>/scripts/build-study-pack.mjs \
  --scene-brief /tmp/stage17-scene-brief.json \
  --evidence-pack /tmp/stage17-evidence-pack.json \
  --output /Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/morning-routine-audit.md
```

Behavior:

- Read both JSON files.
- Validate:
  - scene brief `kind === "scene-brief"`,
  - evidence pack `kind === "yanghoo-evidence-pack"`,
  - `briefId` matches scene brief `id`.
- Generate markdown.
- Create output directory if needed.
- Print output path as JSON:

```json
{
  "studyPackPath": "...",
  "scene": "Scene.MorningRoutine",
  "exampleCount": 2
}
```

Keep script deterministic and under 200 lines if possible.

### 2. Update Skill Workflow

Update `SKILL.md` with exact end-to-end commands:

```bash
node <skill>/scripts/extract-scene-brief.mjs --scene-file <scene.md> --id <id> --level L2 > /tmp/scene-brief.json
npm run -s cli -- english-search batch /tmp/scene-brief.json --channels <ids> --limit-per-query 5 --json > /tmp/evidence-pack.json
node <skill>/scripts/build-study-pack.mjs --scene-brief /tmp/scene-brief.json --evidence-pack /tmp/evidence-pack.json --output <output.md>
```

Also state:

- study pack is output, not canonical,
- real examples remain labeled as Yanghoo evidence,
- generated practice prompts are not real subtitle evidence.

### 3. Add Verification

Create:

```text
scripts/ops/verify-stage18-yanghoo-english-balance-study-pack.ts
```

The verification should:

1. Use the existing Stage 17 helper to generate a `Scene.MorningRoutine` brief.
2. Run Yanghoo CLI batch search with an indexed channel.
3. Save evidence pack to `/tmp/stage18-evidence-pack.json`.
4. Run `build-study-pack.mjs`.
5. Assert the markdown exists.
6. Assert markdown contains:
   - `# Study Pack: Scene.MorningRoutine`,
   - `## Real Subtitle Evidence`,
   - `## Shadowing Queue`,
   - `## Practice Prompts`,
   - `## Boundary Note`,
   - at least one query from the scene brief.
7. If evidence examples exist, assert a YouTube timestamp URL appears.
8. Assert output path is under:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/
```

### 4. Report

Write:

```text
docs/plans/reports/2026-05-06-yanghoo-english-balance-study-pack-report.md
```

Report must include:

- changed files,
- exact commands,
- generated study pack path,
- summarized evidence example count,
- verification results,
- boundary statement.

## Verification Commands

Run:

```bash
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
npx tsx scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts
npx tsx scripts/ops/verify-stage18-yanghoo-english-balance-study-pack.ts
npm run typecheck
npm run build
```

## Acceptance Criteria

- Study pack script produces deterministic markdown from scene brief + evidence pack.
- Study pack is written only under `Anything-to-English/output/local/yanghoo/study-packs/` during smoke.
- Real subtitle examples are clearly labeled and include timestamp URLs when present.
- Generated practice prompts are clearly not labeled as real evidence.
- Skill docs show exact end-to-end commands.
- No repository merge or cross-repo dependency is introduced.
- No corpus is copied across repos.
- Stage 16, 17, 18 verification scripts pass.
- `npm run typecheck` and `npm run build` pass.

## Gemini Prompt

Implement Stage 18 exactly as planned in:

```text
docs/plans/2026-05-06-stage-yanghoo-english-balance-study-pack.md
```

Keep repositories independent. Add only the external skill study-pack script, update skill docs, and add Yanghoo-side verification/report. Do not add UI, do not change subtitle search, and do not write to Anything canonical. Write the report to:

```text
docs/plans/reports/2026-05-06-yanghoo-english-balance-study-pack-report.md
```

