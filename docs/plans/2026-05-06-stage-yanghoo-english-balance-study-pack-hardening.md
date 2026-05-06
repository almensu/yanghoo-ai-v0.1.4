# Stage 19 Plan: Yanghoo English Balance Study Pack Hardening

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready

## Goal

Harden Stage 18 study packs so they are safer and more useful:

```text
scene brief + evidence pack
-> guarded study pack output
-> real-evidence shadowing queue
-> clearer metadata
```

Keep both repositories independent.

## Non-Goals

- Do not merge repositories.
- Do not add cross-repo package/workspace/submodule dependencies.
- Do not copy subtitle corpora into `Anything-to-English`.
- Do not write to `Anything-to-English/canonical`.
- Do not add UI.
- Do not change Yanghoo subtitle search/indexing.
- Do not require an LLM.

## Target Files

External skill:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/build-study-pack.mjs
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/study-pack-schema.md
```

Yanghoo AI:

```text
scripts/ops/verify-stage19-yanghoo-english-balance-study-pack-hardening.ts
docs/plans/reports/2026-05-06-yanghoo-english-balance-study-pack-hardening-report.md
```

## Required Changes

### 1. Output Path Guard

`build-study-pack.mjs` must only write under:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/
```

Default behavior:

- If `--output` resolves outside this directory, exit non-zero.
- Error message must include:

```text
Study pack output must stay under
```

Optional override:

```bash
--allow-outside-output
```

Only this flag allows outside paths. The normal skill workflow must not use it.

### 2. Real Shadowing Queue

Replace generic shadowing items:

```text
- [ ] Shadow evidence example 1
- [ ] Shadow evidence example 2
```

with real evidence items:

```text
- [ ] "<evidence text>" — <youtubeTimestampUrl>
```

Rules:

- Use first 5 evidence examples max.
- Keep text readable; truncate very long evidence text to about 180 characters.
- Preserve YouTube timestamp URL.
- If there are no examples, write:

```text
No real evidence yet. Run Yanghoo search with broader queries or more channels.
```

### 3. Metadata

Add to `## Source`:

```text
- Query count:
- Evidence count:
- Source scene file:
- Boundary status: output-only, not canonical
```

If scene brief has:

```json
"source": { "repo": "Anything-to-English", "path": "..." }
```

include it as source scene file.

### 4. Skill Docs

Update `SKILL.md` and `study-pack-schema.md`:

- mention guarded output path,
- show normal command without `--allow-outside-output`,
- state that shadowing queue uses real Yanghoo evidence,
- state that outside output is only for explicit user override.

## Verification

Create:

```text
scripts/ops/verify-stage19-yanghoo-english-balance-study-pack-hardening.ts
```

The script should:

1. Generate a scene brief using `extract-scene-brief.mjs`.
2. Generate an evidence pack using Yanghoo CLI batch search.
3. Run `build-study-pack.mjs` to the allowed output directory.
4. Assert markdown contains:
   - `Query count:`,
   - `Evidence count:`,
   - `Boundary status: output-only, not canonical`,
   - `## Shadowing Queue`.
5. If evidence examples exist, assert the shadowing queue contains at least one YouTube timestamp URL.
6. Attempt to write to `/tmp/stage19-outside.md` without override and assert failure.
7. Attempt to write to `/tmp/stage19-outside.md` with `--allow-outside-output` and assert success, then delete the temp file.

Run:

```bash
npx tsx scripts/ops/verify-stage18-yanghoo-english-balance-study-pack.ts
npx tsx scripts/ops/verify-stage19-yanghoo-english-balance-study-pack-hardening.ts
npm run typecheck
npm run build
```

## Acceptance Criteria

- Default study-pack output is guarded to `Anything-to-English/output/local/yanghoo/study-packs/`.
- Outside output fails unless `--allow-outside-output` is supplied.
- Shadowing queue uses real evidence text and timestamp URLs when examples exist.
- Empty evidence packs still produce a useful no-evidence shadowing message.
- Metadata includes query count, evidence count, source scene file, and boundary status.
- Skill docs reflect the guarded workflow.
- No repository merge or cross-repo dependency is introduced.
- Stage 18 and Stage 19 verification pass.
- `npm run typecheck` and `npm run build` pass.

## Gemini Prompt

Implement Stage 19 exactly as planned in:

```text
docs/plans/2026-05-06-stage-yanghoo-english-balance-study-pack-hardening.md
```

Keep both repositories independent. Harden only the external study-pack script, skill docs, schema docs, and verification. Do not change Yanghoo search/indexing, do not add UI, and do not write to Anything canonical. Write the report to:

```text
docs/plans/reports/2026-05-06-yanghoo-english-balance-study-pack-hardening-report.md
```

