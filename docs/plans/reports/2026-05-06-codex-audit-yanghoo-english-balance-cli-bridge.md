# Codex Audit: Stage 16 Yanghoo English Balance CLI Bridge

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-yanghoo-english-balance-cli-bridge-report.md`
Plan Reviewed: `docs/plans/2026-05-06-stage-yanghoo-english-balance-cli-bridge.md`
Verdict: Rejected

## Scope

This audit reviewed:

- new Yanghoo CLI commands,
- JSON command behavior,
- batch evidence-pack behavior,
- `yanghoo-english-balance` skill update,
- Stage 16 verification report and script,
- boundary compliance between Yanghoo AI and `Anything-to-English`.

## Findings

### P0 - `yanghoo-english-balance/SKILL.md` lost required skill frontmatter

The external skill file was rewritten without YAML frontmatter:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
```

It now starts with:

```text
# Skill: yanghoo-english-balance
```

The original skill format requires frontmatter with at least:

```yaml
---
name: yanghoo-english-balance
description: ...
---
```

This is a blocker because the skill is the core Stage 16 artifact. Without frontmatter, Claude skill discovery/triggering may fail or degrade.

Required fix:

- Restore valid YAML frontmatter.
- Preserve the useful new workflow text.
- Keep the boundary rules and schema references discoverable from `SKILL.md`.

### P1 - Category/tag CLI smoke does not prove the required workflow

The plan required:

```bash
npm run -s cli -- english-search "would have" --category english-teacher --limit 5 --json
```

as real smoke evidence. In the current workspace, this returns no results:

```json
{
  "query": "would have",
  "results": [],
  "warnings": []
}
```

`learning-channels list --json` also currently shows channels with no `category` values and empty `tags` arrays. Therefore the report's category-based smoke claim does not prove category/tag selection works with real data.

There is also a behavior mismatch: when no channels match a single-query category/tag search, the plan required warnings, but the command returns an empty warning array.

Required fix:

- For single `english-search`, return a warning when category/tag/channel resolution produces no channel IDs.
- Verification must set or fixture taxonomy before category/tag tests, or use an existing category from `learning-channels list`.
- Prove category/tag search returns either real results or a truthful warning with the selected criteria.

### P1 - Verification script is too weak for acceptance

`scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts` only checks that command stdout parses as JSON. It does not assert:

- `learning-channels list` includes required fields,
- `english-search` supports `--channel`,
- `english-search` supports `--channels`,
- category/tag resolution works,
- empty channel resolution includes warnings,
- batch output has `kind: "yanghoo-evidence-pack"`,
- batch examples contain required fields,
- skill frontmatter is valid.

This lets broken or empty behavior pass as "Verification passed".

Required fix:

- Add real assertions for all Stage 16 acceptance criteria.
- Include at least one direct-channel search that returns real results, for example the current successful smoke:

```bash
npm run -s cli -- english-search "would have" --channel youtube-UC596VHuJ5Q11N81D6uNrrxA --limit 3 --json
```

- Assert the external skill frontmatter exists and contains `name: yanghoo-english-balance`.

## Checks Passed

The new direct-channel and multi-channel search paths work with real indexed data:

```bash
npm run -s cli -- english-search "would have" --channel youtube-UC596VHuJ5Q11N81D6uNrrxA --limit 3 --json
```

Returned 3 timestamped examples.

```bash
npm run -s cli -- english-search "would have" --channels youtube-UC596VHuJ5Q11N81D6uNrrxA,youtube-UCxJGMJbjokfnr2-s4_RXPxQ --limit 2 --json
```

Returned 2 timestamped examples.

Batch mode returns the expected top-level evidence-pack shape when no category matches:

```json
{
  "kind": "yanghoo-evidence-pack",
  "briefId": "audit-brief",
  "scene": "Scene.Audit",
  "queries": ["would have", "because"],
  "examples": [],
  "warnings": ["No channels matched criteria for search"]
}
```

Engineering checks rerun by Codex:

```bash
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
```

Result: passed, but insufficient as noted above.

```bash
npm run typecheck
```

Result: passed.

```bash
npm run build
```

Result: passed.

## Boundary Review

No repository merge, submodule, workspace dependency, or subtitle corpus copy was observed in this audit. The implementation stayed in Yanghoo CLI and the external skill directory.

## Required Next Step

Return a Stage 16 audit-fix report after:

1. Restoring valid `SKILL.md` frontmatter.
2. Fixing single-query empty category/tag warnings.
3. Strengthening the verification script with structural and behavior assertions.
4. Re-running typecheck, build, Stage 16 verification, and real CLI smoke.

