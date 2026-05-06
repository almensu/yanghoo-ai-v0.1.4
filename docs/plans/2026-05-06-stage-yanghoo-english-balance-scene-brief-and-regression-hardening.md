# Stage 17 Plan: Yanghoo English Balance Scene Brief and Regression Hardening

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready

## Goal

Make the `yanghoo-english-balance` workflow reliable end to end:

```text
Anything-to-English scene file
-> deterministic scene brief
-> Yanghoo CLI batch search
-> evidence pack
```

Also harden Stage 16 verification so it can be trusted as a regression suite.

## Non-Goals

- Do not merge repositories.
- Do not add cross-repo packages, workspaces, submodules, or imports.
- Do not copy subtitle corpora into `Anything-to-English`.
- Do not write real examples into `Anything-to-English/canonical`.
- Do not add UI.
- Do not change subtitle sync/acquisition.

## Target Files

Yanghoo AI:

```text
scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts
docs/plans/reports/2026-05-06-yanghoo-english-balance-scene-brief-and-regression-hardening-report.md
```

External skill:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/scene-brief-schema.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/workflows.md
```

Optional helper script inside skill, only if it stays small and deterministic:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs
```

## Implementation Instructions

### 1. Harden Stage 16 Verification

Update:

```text
scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
```

Add assertions for:

- `learning-channels list --json` includes required fields:
  - `channelId`,
  - `title`,
  - `videoCount`,
  - `selectedCount`,
  - `captionReadyCount`,
  - `indexedSentenceCount`,
  - `tags`.
- direct `--channel` search returns non-empty real results when an indexed channel is available.
- multi `--channels` search returns valid JSON and result fields.
- empty category/tag returns warning.
- batch empty category returns `kind: "yanghoo-evidence-pack"` and warning.
- non-English language flag is rejected.
- skill frontmatter has `name: yanghoo-english-balance`.

Use currently available indexed channels from `learning-channels list` instead of hardcoding if possible. If no indexed channels exist, fail with a clear message.

### 2. Add Scene Brief Extraction Workflow

The skill should be able to read an Anything scene markdown file and create a small scene brief.

Input example:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs \
  --scene-file /Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.MorningRoutine.md \
  --id morning-routine-audit \
  --level L2
```

Output JSON:

```json
{
  "kind": "scene-brief",
  "id": "morning-routine-audit",
  "scene": "Scene.MorningRoutine",
  "level": "L2",
  "queries": ["wake up at", "brush my teeth", "get dressed", "leave home for work"],
  "source": {
    "repo": "Anything-to-English",
    "path": "canonical/block-system/scenes/Scene.MorningRoutine.md"
  }
}
```

Extraction rules:

- Read sections:
  - `Core Meaning`,
  - `Included Blocks`,
  - `Typical Chain`,
  - `Main Use`,
  - `Typical English`.
- Prefer phrase queries from `Typical English`.
- Convert block names like `Action.BrushTeeth` into `brush teeth` / `brush my teeth` when obvious.
- Keep max 12 queries.
- Keep query length 2-8 words.
- Deduplicate case-insensitively.
- Avoid broad single nouns.
- No LLM dependency.

If implementing a script feels too large, update `SKILL.md` with a precise manual extraction procedure and make the verification script create a scene brief fixture directly. Prefer the script if it stays under 150 lines.

### 3. Add Stage 17 Verification

Create:

```text
scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts
```

The script should:

1. Read:

```text
/Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.MorningRoutine.md
```

2. Produce a scene brief, either via helper script or deterministic in-script extraction.
3. Assert:
   - `kind === "scene-brief"`,
   - `scene === "Scene.MorningRoutine"`,
   - `queries.length > 0`,
   - queries include at least two useful phrases from the scene,
   - no query is a single broad noun.
4. Write the brief to `/tmp/stage17-scene-brief.json`.
5. Run:

```bash
npm run -s cli -- english-search batch /tmp/stage17-scene-brief.json --channels <indexedChannelIds> --limit-per-query 2 --json
```

6. Assert:
   - output `kind === "yanghoo-evidence-pack"`,
   - `briefId` matches,
   - `queries` match,
   - `examples` is an array,
   - if examples exist, required fields are present.

Do not require examples to be non-empty because current corpus may not match `MorningRoutine` phrases. Structure and CLI bridge correctness are required.

### 4. Update Skill Docs

Update `yanghoo-english-balance/SKILL.md`:

- Keep YAML frontmatter.
- Add exact command workflow:

```bash
node <skill>/scripts/extract-scene-brief.mjs --scene-file <scene.md> --id <id> --level L2 > /tmp/scene-brief.json
npm run -s cli -- english-search batch /tmp/scene-brief.json --channels <ids> --limit-per-query 5 --json
```

- Keep boundary rule:
  - no repo merge,
  - no corpus copy,
  - no canonical writes.

Add `references/workflows.md` if useful, but keep it concise.

## Verification

Run:

```bash
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
npx tsx scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts
npm run typecheck
npm run build
```

Manual smoke:

```bash
npm run -s cli -- learning-channels list --json
npm run -s cli -- english-search "would have" --channel <indexedChannelId> --limit 2 --json
npm run -s cli -- english-search batch /tmp/stage17-scene-brief.json --channels <indexedChannelIds> --limit-per-query 2 --json
```

## Acceptance Criteria

- Stage 16 verification now checks real direct/multi behavior and required fields.
- Stage 17 verification proves Anything scene -> scene brief -> Yanghoo evidence pack structure.
- `yanghoo-english-balance` has valid YAML frontmatter.
- Skill docs show exact commands for the workflow.
- No cross-repo dependency is introduced.
- No data corpus is copied across repos.
- `npm run typecheck` passes.
- `npm run build` passes.

## Gemini Prompt

Implement Stage 17 exactly as planned in:

```text
docs/plans/2026-05-06-stage-yanghoo-english-balance-scene-brief-and-regression-hardening.md
```

Do not merge repositories or add cross-repo dependencies. Harden Stage 16 verification, add deterministic scene-brief extraction for Anything scene markdown, prove the CLI bridge by generating an evidence pack, and update the external `yanghoo-english-balance` skill with exact commands. Write the report to:

```text
docs/plans/reports/2026-05-06-yanghoo-english-balance-scene-brief-and-regression-hardening-report.md
```

