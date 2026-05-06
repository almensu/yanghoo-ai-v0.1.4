# Codex Audit: Stage 16 Regression Hardening

Date: 2026-05-06
Auditor: Codex
Related Prior Audit: `docs/plans/reports/2026-05-06-codex-audit-yanghoo-english-balance-cli-bridge-follow-up.md`
Verdict: Rejected for the claimed hardening scope

## Scope

This audit reviewed the claimed Stage 16 quality hardening:

- existence of `verify-stage16-regression-hardening.ts`,
- positive `--channel` / `--channels` required-field assertions,
- positive `--category` and `--tag` filtering,
- batch evidence-pack example required-field assertions,
- typecheck and build results.

## Findings

### P1 - Claimed regression-hardening script is missing

The report claims a script named:

```text
verify-stage16-regression-hardening.ts
```

No such file exists in the repository. The only Stage 16 verification script found is:

```text
scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
```

That script does cover:

- `learning-channels list --json`,
- positive `--channel`,
- positive `--channels`,
- empty category warning,
- empty batch category warning,
- non-English language rejection,
- external skill frontmatter.

It does not cover the full claimed hardening scope.

### P1 - Positive category/tag verification does not currently pass

Manual smoke tests for the claimed positive category/tag paths returned no matching channels.

Command:

```bash
npm run -s cli -- english-search "would have" --category english-teacher --limit 2 --json
```

Result:

```json
{
  "query": "would have",
  "results": [],
  "warnings": ["No channels matched criteria for search"]
}
```

Command:

```bash
npm run -s cli -- english-search "would have" --tag american --limit 2 --json
```

Result:

```json
{
  "query": "would have",
  "results": [],
  "warnings": ["No channels matched criteria for search"]
}
```

Command:

```bash
npm run -s cli -- english-search batch /tmp/audit-stage16-positive-brief.json --category english-teacher --limit-per-query 2 --json
```

Result:

```json
{
  "kind": "yanghoo-evidence-pack",
  "briefId": "audit-stage16-positive",
  "scene": "Scene.Audit",
  "queries": ["would have", "because"],
  "examples": [],
  "warnings": ["No channels matched criteria for search"]
}
```

Current channel list output also shows empty `tags` arrays and no category values, so there is no durable positive taxonomy fixture for this regression claim.

### P2 - Existing Stage 16 verification still passes for its narrower scope

The existing Stage 16 verification is useful and passes, but it is narrower than the claimed hardening.

## Verification Commands

```bash
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
```

Result: passed.

```text
✅ learning-channels list works
✅ english-search --channel works
✅ english-search --channels works
✅ empty category warning works
✅ english-search batch works
✅ non-English flag rejected
✅ skill file frontmatter verified
Stage 16 verification passed!
```

```bash
npm run typecheck
```

Result: passed.

```bash
npm run build
```

Result: passed.

## Decision

Rejected for the claimed Stage 16 regression-hardening scope.

Required next step:

1. Add the missing regression-hardening script or update the existing Stage 16 script in place.
2. Seed or set deterministic taxonomy for at least one indexed channel during the verification, then assert positive `--category` and `--tag` results.
3. Assert required fields on non-empty single-query and batch evidence examples, including `videoId`, `sourceId`, `channelId`, `text`, `start`, `youtubeTimestampUrl`, and `title` where applicable.
4. Re-run the Stage 16 hardening script, typecheck, and build, then return a corrected report.
