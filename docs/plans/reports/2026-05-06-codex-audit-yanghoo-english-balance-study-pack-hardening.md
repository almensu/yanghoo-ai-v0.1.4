# Codex Audit: Stage 19 Yanghoo English Balance Study Pack Hardening

Date: 2026-05-06
Auditor: Codex
Report Reviewed: `docs/plans/reports/2026-05-06-yanghoo-english-balance-study-pack-hardening-report.md`
Plan Reviewed: `docs/plans/2026-05-06-stage-yanghoo-english-balance-study-pack-hardening.md`
Verdict: Accepted

## Scope

This audit reviewed:

- output path guard in `build-study-pack.mjs`,
- `--allow-outside-output` override behavior,
- real-evidence shadowing queue,
- study-pack metadata,
- skill and schema documentation updates,
- Stage 18/19 verification,
- cross-repository boundary safety.

## Findings

No blocking issues found.

## Evidence

### Output Path Guard

Reviewed:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/build-study-pack.mjs
```

The script now rejects default output outside:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/
```

The error includes:

```text
Study pack output must stay under
```

Stage 19 verification confirms:

- writing to `/tmp/stage19-outside.md` fails without override,
- writing to `/tmp/stage19-outside.md` succeeds with `--allow-outside-output`,
- the temporary override file is deleted after the check.

### Study Pack Quality

Generated file inspected:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/morning-routine-audit-stage19.md
```

The `## Source` section includes:

- `Query count: 8`,
- `Evidence count: 3`,
- `Source scene file: canonical/block-system/scenes/Scene.MorningRoutine.md`,
- `Boundary status: output-only, not canonical`.

The `## Shadowing Queue` now uses real evidence text and YouTube timestamp URLs, for example:

```text
- [ ] "... wake up ..." — https://www.youtube.com/watch?v=_G8I0zPNJJw&t=1346s
```

The generated practice prompts remain clearly marked as not real subtitle evidence.

### Boundary Check

Anything-to-English changes are confined to:

```text
output/local/yanghoo/study-packs/
```

No write to:

```text
Anything-to-English/canonical/
Anything-to-English/source/
```

No repository merge, submodule, workspace dependency, package dependency, or subtitle corpus copy was observed.

## Verification Commands

```bash
npx tsx scripts/ops/verify-stage18-yanghoo-english-balance-study-pack.ts
```

Result: passed.

```bash
npx tsx scripts/ops/verify-stage19-yanghoo-english-balance-study-pack-hardening.ts
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

- The guard uses a resolved path prefix check. This is acceptable for the current local workflow. If the output directory later allows symlinks or untrusted paths, use `fs.realpathSync` on both the allowed root and target parent.
- Shadowing queue quality is now much better, but later stages may improve sentence segmentation and shorten examples more naturally.

These are not acceptance blockers.

