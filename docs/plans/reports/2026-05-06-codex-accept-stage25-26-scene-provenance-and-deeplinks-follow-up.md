# Codex Acceptance: Stage 25-26 Follow-up

Date: 2026-05-06
Auditor: Codex
Follow-up Reviewed:

- `scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts`
- `apps/web/src/components/EnglishSentenceSearch.tsx`
- `docs/plans/reports/2026-05-06-stage25-scene-pack-saved-example-provenance-report.md`
- `docs/plans/reports/2026-05-06-stage26-english-search-deeplink-command-report.md`
- `/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md`

Verdict: Accepted with cleanup note

## Checks Passed

Codex reran:

```bash
npx tsx scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts
```

Result: passed, 14/14 checks.

Codex reran:

```bash
npx tsx scripts/ops/verify-stage26-english-search-deeplink-command.ts
```

Result: passed, 13/13 checks.

Codex reran:

```bash
npm run typecheck
```

Result: passed across all workspaces.

Codex reran:

```bash
npm run build
```

Result: passed across all workspaces.

Codex checked:

```bash
git ls-files '*.tsbuildinfo'
```

Result: no tracked `*.tsbuildinfo` files.

## Follow-up Findings

### Stage 25 destructive verification fixed

The Stage 25 script no longer truncates the entire saved examples file. It now removes only test records with:

```ts
i.sourceId !== 'src-test-025'
```

Codex reran the script successfully. The canonical saved examples file was restored to its pre-screenshot state after browser evidence capture:

```text
data/learning/english-saved-examples.json
```

Current file remains empty, matching the pre-evidence state observed during audit:

```json
{
  "version": 1,
  "items": []
}
```

Residual note:

- The script still updates file-level `updatedAt` when it cleans test rows. This is acceptable for this stage because it no longer deletes non-test items, but a future hardening pass should add an explicit non-test preservation assertion.

### Stage 26 category/tag deeplink behavior fixed

`EnglishSentenceSearch.tsx` now applies URL `category` and `tag` params while initializing selected channels when `channels=` is absent. This closes the prior bug where category/tag only affected sidebar visibility while the search still used all indexed channels.

### External skill documentation updated

Codex verified `/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md` now includes:

- `Discovery Links (Web UI Deeplinks)`,
- `npm run -s cli -- english-search url ...`,
- `npm run -s cli -- english-search urls ...`,
- `view=english-search`.

### Stage 25 browser evidence captured

Codex captured the missing browser evidence after seeding a temporary saved example and then restoring the original saved examples file.

Screenshot:

```text
docs/plans/reports/screenshots/stage25-scene-pack-provenance.png
```

The screenshot shows:

- Saved page selected,
- `All Scene Packs` filter dropdown,
- saved item provenance label,
- detail pane `Scene Pack` provenance with pack title, scene, and query.

## Cleanup Note

There is an untracked temporary file:

```text
tmp/SKILL.md
```

It appears to be a copy of the external skill file. It should not be included in a commit. This is a cleanup note, not a Stage 25/26 acceptance blocker.

## Decision

Stage 25 and Stage 26 are accepted after follow-up.

The remaining work is ordinary commit hygiene:

- exclude or delete `tmp/SKILL.md`,
- include the Stage 25 screenshot artifact if committing the acceptance evidence,
- keep runtime `data/` files out of commits.
