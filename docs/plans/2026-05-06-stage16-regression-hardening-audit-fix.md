# Stage 16 Audit Fix: Deterministic Category/Tag Regression Hardening

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready

## Goal

Close the Stage 16 regression-hardening audit gap with an executable, deterministic verification script that proves:

```text
learning channel taxonomy fixture
-> category/tag channel resolution
-> positive english-search results
-> positive batch evidence-pack examples
-> required evidence fields
```

This is a verification hardening task. The current CLI bridge already works for direct `--channel` and `--channels`; the missing part is durable proof for positive `--category` / `--tag` searches and non-empty batch examples.

Reference note: `/Volumes/2T/com/yanghoo205/yanghoo-reference` is not mounted in this environment, so Codex could not re-read reference review checklists while writing this task. Use repository-local plans, audits, and existing verification scripts as the execution source of truth.

## Non-Goals

- Do not change product UI.
- Do not change subtitle acquisition or indexing.
- Do not require a global CLI install.
- Do not depend on hand-edited local taxonomy state.
- Do not leave permanent taxonomy mutations behind after verification.
- Do not copy data between Yanghoo AI and `Anything-to-English`.

## Target Files

Primary:

```text
scripts/ops/verify-stage16-regression-hardening.ts
docs/plans/reports/2026-05-06-stage16-regression-hardening-audit-fix-report.md
```

Allowed if cleaner:

```text
scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
```

Only update the existing Stage 16 script instead of adding a new script if the report clearly says so and the script name mismatch is corrected.

## Current Failed Evidence

Codex observed:

```bash
npm run -s cli -- english-search "would have" --category english-teacher --limit 2 --json
```

returned:

```json
{
  "query": "would have",
  "results": [],
  "warnings": ["No channels matched criteria for search"]
}
```

Same for:

```bash
npm run -s cli -- english-search "would have" --tag american --limit 2 --json
```

and batch category search produced an evidence pack with `examples: []`.

The reason is that current `learning-channels list --json` returned channels with empty `tags` arrays and no category values. The regression must not rely on pre-existing user taxonomy.

## Required Implementation

Create a deterministic verification script that:

1. Calls:

```bash
npm run -s cli -- learning-channels list --json
```

2. Selects one real indexed channel where:

```text
indexedSentenceCount > 0
```

Prefer a channel with known results for a common query such as:

```text
the
would have
because
```

3. Saves the channel's existing taxonomy state, if any.

Use application use cases directly from the verification script:

```ts
updateChannelTaxonomyUseCase
deleteChannelTaxonomyUseCase
listChannelTaxonomyUseCase
```

Do not write JSON files by hand unless no application use case is available.

4. Temporarily set deterministic taxonomy on that indexed channel:

```json
{
  "category": "stage16-audit-category",
  "tags": ["stage16-audit-tag"],
  "note": "temporary Stage 16 regression fixture"
}
```

5. Run and assert positive category search:

```bash
npm run -s cli -- english-search "the" --category stage16-audit-category --limit 2 --json
```

Assertions:

- JSON parses cleanly.
- `results.length > 0`.
- Every result has:
  - `channelId`,
  - `videoId`,
  - `sourceId`,
  - `title`,
  - `text`,
  - numeric `start`,
  - `youtubeTimestampUrl`,
  - `captionKind`.
- At least one result has `channelId` equal to the fixture channel.

6. Run and assert positive tag search:

```bash
npm run -s cli -- english-search "the" --tag stage16-audit-tag --limit 2 --json
```

Use the same required-field assertions.

7. Run and assert positive category+tag search:

```bash
npm run -s cli -- english-search "the" --category stage16-audit-category --tag stage16-audit-tag --limit 2 --json
```

Use the same required-field assertions.

8. Write a temporary scene brief under `/tmp`, for example:

```json
{
  "kind": "scene-brief",
  "id": "stage16-regression-audit",
  "scene": "Scene.Stage16RegressionAudit",
  "level": "L2",
  "queries": ["the", "because"]
}
```

9. Run and assert positive batch evidence:

```bash
npm run -s cli -- english-search batch /tmp/stage16-regression-audit-brief.json --category stage16-audit-category --limit-per-query 2 --json
```

Assertions:

- `kind === "yanghoo-evidence-pack"`.
- `briefId === "stage16-regression-audit"`.
- `examples.length > 0`.
- Every example has:
  - `query`,
  - `text`,
  - `channelId`,
  - `videoId`,
  - `sourceId`,
  - `title`,
  - numeric `start`,
  - `youtubeTimestampUrl`,
  - `captionKind`.
- No duplicate examples by:

```text
channelId + videoId + start + text
```

10. Restore the original taxonomy state in `finally`:

- If the channel had an existing taxonomy item, restore it exactly.
- If it did not, delete the temporary taxonomy item.
- The script must restore state even if an assertion fails.

## Layer Placement

- CLI verification belongs in `scripts/ops`.
- Search behavior remains in `apps/cli/src/commands/english-search-command.ts`.
- Taxonomy persistence must go through application use cases, not manual file writes.
- Domain and application layers should not depend on CLI or scripts.

## Acceptance Criteria

- The new or updated Stage 16 hardening script proves positive `--category`, positive `--tag`, positive category+tag, and positive batch evidence.
- The script is deterministic and self-cleaning.
- It does not require manually pre-seeded taxonomy.
- It does not leave `stage16-audit-*` taxonomy in local data after success or failure.
- `learning-channels list --json` still works.
- Direct `--channel` and `--channels` checks remain covered by existing Stage 16 verification or the new hardening script.
- Empty no-match selector behavior remains covered.
- `npm run typecheck` passes.
- `npm run build` passes.

## Verification Commands

Run:

```bash
npx tsx scripts/ops/verify-stage16-regression-hardening.ts
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
npm run typecheck
npm run build
```

If the existing Stage 16 script is updated instead of adding `verify-stage16-regression-hardening.ts`, run that script and explain the name choice in the report.

## Expected Report

Write:

```text
docs/plans/reports/2026-05-06-stage16-regression-hardening-audit-fix-report.md
```

The report must include:

- changed files,
- exact commands run,
- key output lines,
- fixture channel ID used,
- proof that taxonomy was restored,
- unresolved risks,
- any skipped commands with reasons.

## Gemini Prompt

Implement the Stage 16 audit fix exactly as planned in:

```text
docs/plans/2026-05-06-stage16-regression-hardening-audit-fix.md
```

Do not change production search behavior unless the deterministic verification reveals a real bug. Prefer a self-contained ops verification script that sets and restores taxonomy through application use cases. Then run the required verification commands and write the report to:

```text
docs/plans/reports/2026-05-06-stage16-regression-hardening-audit-fix-report.md
```
