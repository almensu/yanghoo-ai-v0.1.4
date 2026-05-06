# Codex Audit Follow-up: Stage 16 Yanghoo English Balance CLI Bridge

Date: 2026-05-06
Auditor: Codex
Previous Audit: `docs/plans/reports/2026-05-06-codex-audit-yanghoo-english-balance-cli-bridge.md`
Verdict: Accepted with residual verification gap

## Summary

The prior audit blockers were checked again.

Fixed:

- `yanghoo-english-balance/SKILL.md` YAML frontmatter is restored.
- Single-query `english-search` now returns a warning when category/tag resolution matches no channels.
- Stage 16 verification script now asserts warning behavior and skill frontmatter.

Not fully closed:

- The verification script still does not assert positive `--channel` / `--channels` search behavior.
- It does not prove positive category/tag search with a taxonomy fixture.
- It does not assert every required field on non-empty evidence-pack examples.

Codex ran supplementary real CLI smoke for direct and multi-channel search, so the bridge is acceptable for current use. The remaining gap should be tightened before treating Stage 16 verification as a durable regression suite.

## Evidence

### Skill Frontmatter

Checked:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
```

The file starts with:

```yaml
---
name: yanghoo-english-balance
description: Integrates Anything-to-English with Yanghoo CLI to construct evidence packs of real English subtitles for scenes.
---
```

### Empty Category Warning

Command:

```bash
npm run -s cli -- english-search "would have" --category non-existent-category-123 --limit 5 --json
```

Result includes:

```json
"warnings": ["No channels matched criteria for search"]
```

### Direct Channel Search

Command:

```bash
npm run -s cli -- english-search "would have" --channel youtube-UC596VHuJ5Q11N81D6uNrrxA --limit 2 --json
```

Result:

- returned 2 real timestamped examples,
- included `channelId`,
- included `videoId`,
- included `sourceId`,
- included `start`,
- included `youtubeTimestampUrl`,
- included `captionKind`.

### Multi-channel Search

Command:

```bash
npm run -s cli -- english-search "would have" --channels youtube-UC596VHuJ5Q11N81D6uNrrxA,youtube-UCxJGMJbjokfnr2-s4_RXPxQ --limit 2 --json
```

Result:

- returned 2 real timestamped examples,
- JSON stdout was clean.

### Batch Empty Category

Command:

```bash
npm run -s cli -- english-search batch /tmp/audit-stage16-brief.json --category non-existent-category-123 --limit-per-query 2 --json
```

Result:

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

## Verification Commands

```bash
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
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

## Residual Risk

`scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts` is improved but still too narrow as a long-term regression test. It should later add:

- direct `--channel` assertion with non-empty results,
- multi `--channels` assertion with non-empty results,
- fixture-backed positive `--category` / `--tag` assertion,
- required-field assertions for non-empty batch examples.

This does not block current Stage 16 usage because Codex manually verified direct and multi-channel CLI behavior with real indexed data.

