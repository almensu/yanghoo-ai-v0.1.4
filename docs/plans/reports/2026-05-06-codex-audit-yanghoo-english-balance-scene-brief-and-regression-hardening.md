# Codex Audit: Stage 17 Yanghoo English Balance Scene Brief and Regression Hardening

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-yanghoo-english-balance-scene-brief-and-regression-hardening-report.md`
Plan Reviewed: `docs/plans/2026-05-06-stage-yanghoo-english-balance-scene-brief-and-regression-hardening.md`
Verdict: Accepted

## Scope

This audit reviewed:

- hardened Stage 16 verification,
- new Stage 17 scene-brief verification,
- external `yanghoo-english-balance` helper script,
- updated skill instructions,
- CLI batch support for `--channel` / `--channels`,
- cross-repository boundary safety.

## Findings

No blocking issues found.

## Evidence

### Scene Brief Extraction

Command:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs \
  --scene-file /Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.MorningRoutine.md \
  --id audit-morning \
  --level L2
```

Result included:

```json
{
  "kind": "scene-brief",
  "id": "audit-morning",
  "scene": "Scene.MorningRoutine",
  "level": "L2",
  "queries": [
    "wake up",
    "brush my teeth",
    "wash my face",
    "get dressed",
    "leave home for work",
    "i wake up at about 7",
    "i wash my face",
    "i leave home for work"
  ]
}
```

This proves the skill can read an `Anything-to-English` scene file and produce a small deterministic bridge artifact without importing that repository as a dependency.

### Evidence Pack

Command:

```bash
npm run -s cli -- english-search batch /tmp/stage17-scene-brief.json \
  --channels youtube-UC596VHuJ5Q11N81D6uNrrxA \
  --limit-per-query 1 \
  --json
```

Result:

- returned `kind: "yanghoo-evidence-pack"`,
- preserved `briefId: "morning-routine-audit"`,
- preserved scene and queries,
- returned real timestamped examples for `wake up` and `brush my teeth`,
- included `channelId`, `videoId`, `sourceId`, `start`, `youtubeTimestampUrl`, and `captionKind`.

### Verification Commands

```bash
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
```

Result: passed. The script now checks:

- learning channel output fields,
- direct `--channel` search,
- multi `--channels` search,
- empty category warning,
- batch empty category warning,
- non-English language rejection,
- skill frontmatter.

```bash
npx tsx scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts
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

No repository merge, submodule, workspace dependency, package dependency, or corpus copy was observed.

The external helper script lives under:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs
```

It reads `Anything-to-English` markdown files and emits JSON to stdout. That is acceptable for the balance-skill model because it is a bridge artifact generator, not a shared runtime dependency.

## Residual Notes

- The query extraction is intentionally simple and deterministic. It is good enough for Stage 17, but later scenes may need a richer phrase extractor.
- `wake up` is a two-word phrase and allowed, though more specific variants such as `wake up at` may often produce better corpus hits.

These are quality-improvement notes, not acceptance blockers.

