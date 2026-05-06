# Stage 20 Plan: Yanghoo English Balance CLI Wrapper

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready

## Goal

Collapse the current 3-step balance workflow into one skill-local wrapper command:

```text
scene file
-> scene brief
-> Yanghoo evidence pack
-> study pack markdown
```

The wrapper should make command-line use practical without installing a global command and without merging repositories.

## Non-Goals

- Do not install a global CLI command.
- Do not add packages, workspaces, submodules, or cross-repo imports.
- Do not move scripts into Yanghoo AI packages.
- Do not copy Yanghoo subtitle corpora into `Anything-to-English`.
- Do not write to `Anything-to-English/canonical`.
- Do not add UI.
- Do not change Yanghoo search/indexing/subtitle acquisition.

## Target Files

External skill:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/workflows.md
```

Yanghoo AI verification/report:

```text
scripts/ops/verify-stage20-yanghoo-english-balance-cli-wrapper.ts
docs/plans/reports/2026-05-06-yanghoo-english-balance-cli-wrapper-report.md
```

## Wrapper Command

Create:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs
```

Example:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs \
  --scene-file /Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.MorningRoutine.md \
  --id morning-routine \
  --level L2 \
  --channels youtube-UC596VHuJ5Q11N81D6uNrrxA \
  --limit-per-query 5
```

Required flags:

```text
--scene-file
--id
```

Optional flags:

```text
--level L2
--channel <channelId>
--channels <id,id>
--category <category>
--tag <tag>
--limit-per-query 5
--output <study-pack.md>
--keep-temp
```

Default behavior:

- `--level` defaults to `L2`.
- `--limit-per-query` defaults to `5`.
- If `--output` is omitted, write to:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/<id>.md
```

- If no channel selector is supplied, fail with a clear message:

```text
Provide --channel, --channels, --category, or --tag
```

## Internal Steps

The wrapper should call existing tools instead of duplicating logic:

1. Run:

```bash
node <skill>/scripts/extract-scene-brief.mjs --scene-file <scene.md> --id <id> --level <level>
```

2. Write scene brief to a temp path:

```text
/tmp/yanghoo-balance-<id>-scene-brief.json
```

3. Run Yanghoo CLI from repo root:

```bash
npm run -s cli -- english-search batch <brief.json> <selector flags> --limit-per-query <n> --json
```

Yanghoo repo root:

```text
/Users/a123/com/yanghoo205/yanghoo-ai/yanghoo-ai-v0.1.4
```

4. Write evidence pack to:

```text
/tmp/yanghoo-balance-<id>-evidence-pack.json
```

5. Run:

```bash
node <skill>/scripts/build-study-pack.mjs --scene-brief <brief.json> --evidence-pack <evidence.json> --output <output.md>
```

Do not pass `--allow-outside-output` in normal wrapper behavior.

6. Print clean JSON to stdout:

```json
{
  "scene": "Scene.MorningRoutine",
  "sceneBriefPath": "/tmp/yanghoo-balance-morning-routine-scene-brief.json",
  "evidencePackPath": "/tmp/yanghoo-balance-morning-routine-evidence-pack.json",
  "studyPackPath": "/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/morning-routine.md",
  "queryCount": 8,
  "exampleCount": 3,
  "warnings": []
}
```

All progress logs should go to stderr so stdout remains JSON-clean.

If `--keep-temp` is not set:

- either delete temp files after successful study-pack generation,
- or keep them only if their paths are needed in output.

Prefer keeping temp files for Stage 20 because the JSON output reports their paths.

## Error Handling

The wrapper should:

- exit non-zero when required args are missing,
- exit non-zero when no selector is provided,
- surface Yanghoo CLI failures with command and stderr,
- surface study-pack path guard failures,
- preserve JSON stdout only on success.

## Skill Docs

Update `SKILL.md` and `references/workflows.md`:

- show the new one-command workflow,
- keep the lower-level 3-command workflow as fallback,
- state no global install is required,
- state the wrapper is skill-local.

## Verification

Create:

```text
scripts/ops/verify-stage20-yanghoo-english-balance-cli-wrapper.ts
```

The script should:

1. Find an indexed learning channel via:

```bash
npm run -s cli -- learning-channels list --json
```

2. Run wrapper with:

```text
Scene.MorningRoutine
--channels <indexedChannelId>
--id morning-routine-wrapper-audit
--level L2
--limit-per-query 2
```

3. Assert stdout parses as JSON.
4. Assert JSON includes:
   - `scene`,
   - `sceneBriefPath`,
   - `evidencePackPath`,
   - `studyPackPath`,
   - `queryCount`,
   - `exampleCount`,
   - `warnings`.
5. Assert study pack file exists.
6. Assert study pack path is under:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/
```

7. Assert markdown contains:
   - `# Study Pack: Scene.MorningRoutine`,
   - `## Real Subtitle Evidence`,
   - `## Shadowing Queue`,
   - `Boundary status: output-only, not canonical`.
8. Run wrapper without selector and assert it fails with:

```text
Provide --channel, --channels, --category, or --tag
```

Run:

```bash
npx tsx scripts/ops/verify-stage20-yanghoo-english-balance-cli-wrapper.ts
npx tsx scripts/ops/verify-stage19-yanghoo-english-balance-study-pack-hardening.ts
npm run typecheck
npm run build
```

## Acceptance Criteria

- One wrapper command generates a study pack from an Anything scene file.
- Wrapper stdout is clean JSON on success.
- Progress/errors go to stderr.
- Missing selector fails clearly.
- Default output path is safe.
- Wrapper does not use `--allow-outside-output`.
- Skill docs show one-command workflow and fallback 3-command workflow.
- No global CLI install is introduced.
- No repository merge or cross-repo dependency is introduced.
- Stage 19 and Stage 20 verification pass.
- `npm run typecheck` and `npm run build` pass.

## Gemini Prompt

Implement Stage 20 exactly as planned in:

```text
docs/plans/2026-05-06-stage-yanghoo-english-balance-cli-wrapper.md
```

Keep the wrapper skill-local. Do not install a global command, do not merge repositories, do not add UI, and do not change Yanghoo search/indexing. The wrapper should call the existing extract, Yanghoo CLI batch search, and build-study-pack scripts. Write the report to:

```text
docs/plans/reports/2026-05-06-yanghoo-english-balance-cli-wrapper-report.md
```

