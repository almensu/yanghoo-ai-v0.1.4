# Codex Audit: Stage 25-26 Scene Provenance And English Search Deeplinks

Date: 2026-05-06
Auditor: Codex
Reports Reviewed:

- `docs/plans/reports/2026-05-06-stage25-scene-pack-saved-example-provenance-report.md`
- `docs/plans/reports/2026-05-06-stage26-english-search-deeplink-command-report.md`

Plans Reviewed:

- `docs/plans/2026-05-06-stage25-scene-pack-saved-example-provenance.md`
- `docs/plans/2026-05-06-stage26-english-search-deeplink-command.md`

Verdict: Rejected pending follow-up

## Scope

This audit reviewed:

- saved-example provenance changes in domain/application/API/web,
- Stage 25 verification script and report claims,
- English Search URL parsing and CLI URL helper changes,
- Stage 26 verification script and report claims,
- local ADR `docs/decisions/0003-apps-packages-architecture.md`,
- reference repository availability,
- tracked artifact state and ignored runtime data state.

The configured advisory reference path was unavailable during audit:

```text
/Volumes/2T/com/yanghoo205/yanghoo-reference
```

Codex therefore used the local ADR and existing repo patterns for boundary review.

## Checks Passed

Codex ran:

```bash
npm run typecheck
```

Result: passed across all workspaces.

Codex ran:

```bash
npx tsx scripts/ops/verify-stage26-english-search-deeplink-command.ts
```

Result: passed, 13/13 checks.

Codex did not rerun the Stage 25 verification script because the script currently rewrites the canonical local saved examples file under `data/learning/`.

Codex checked:

```bash
git ls-files '*.tsbuildinfo'
```

Result: no tracked `*.tsbuildinfo` files.

## Findings

### P1 - Stage 25 verification destructively clears the user's saved examples

`scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts` writes an empty saved examples file before each test section and again during cleanup:

```ts
await savedEnglishExampleStorage.writeSavedEnglishExamples({ version: 1, updatedAt: new Date().toISOString(), items: [] });
```

Locations:

- line 62,
- line 85,
- line 132.

The storage implementation resolves to the canonical repo data root when `DATA_DIR` is not overridden, so the script writes:

```text
data/learning/english-saved-examples.json
```

Codex observed the file currently contains:

```json
{
  "version": 1,
  "updatedAt": "2026-05-06T12:34:15.165Z",
  "items": []
}
```

Impact:

- This violates the Stage 25 plan requirement to clean up only saved test items, not user runtime data.
- The verification itself can erase real saved examples.
- The reported "Cleaned up saved examples file" is not acceptable evidence; it is destructive cleanup.

Required fix:

- Run the verification against a temporary `DATA_DIR`, or snapshot and restore the original file exactly.
- Prefer a dedicated test scene pack id instead of `kid-wake-up-morning`, which overlaps with the user's real pack.
- Add an assertion that pre-existing non-test saved examples survive the verification.
- Re-run Stage 25 verification after this is fixed.

### P1 - Stage 26 category/tag deeplinks do not constrain the actual search

The Stage 26 contract says URL parameters should initialize search parameters, including category and tag. The CLI emits URLs such as:

```text
/?view=english-search&q=Linux&category=Education&tag=Tutorial
```

The web implementation parses those params into `taxonomyCategory` and `taxonomyTag`, but channel selection remains all indexed channels unless `channels=` is also present:

- `apps/web/src/components/EnglishSentenceSearch.tsx:397` parses `category` and `tag`.
- `apps/web/src/components/EnglishSentenceSearch.tsx:412` selects URL channels if provided, otherwise selects all indexed channels.
- `apps/web/src/components/EnglishSentenceSearch.tsx:527` searches `selectedChannelIds`, not `visibleChannels`.

Impact:

- A generated URL with `--category` or `--tag` appears filtered in the sidebar but searches every indexed channel.
- The CLI helper's filter flags are misleading for discovery links.
- The Stage 26 verification only checks that the URL string contains params; it does not prove browser search behavior.

Required fix:

- When URL category/tag params are present and `channels` is absent, initialize `selectedChannelIds` to indexed channels matching those filters.
- If no channels match, show the existing no-channel state rather than silently searching all channels.
- Add a UI-level or component-level verification that inspects the search request channel ids for a category/tag deeplink.

### P2 - Stage 26 skill integration was planned but not implemented or reported

The Stage 26 plan explicitly required updating:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/workflows.md
```

Codex checked those files for:

```text
english-search url
english-search urls
view=english-search
interactive discovery
```

Result: no matches.

Impact:

- The stated skill workflow cannot discover or advertise the new internal Yanghoo deeplink command.
- Stage 26's user-facing integration path is incomplete even though the repo-local CLI helper exists.

Required fix:

- Either update the external skill files as planned, or explicitly amend the Stage 26 plan/report to defer skill integration.
- Include exact changed external file paths and verification evidence in the follow-up report.

### P2 - Stage 25 UI changes lack required browser/screenshot evidence

The Stage 25 plan said that if browser UI is changed, include at least one screenshot showing:

- a saved scene-pack example label,
- the scene-pack filter.

The implementation changed `SavedEnglishExamples.tsx`, but the Stage 25 report contains no screenshot path. Codex checked recent files in:

```text
docs/plans/reports/screenshots/
```

No Stage 25 screenshot was present.

Impact:

- The report proves application-layer persistence but not the user-facing Saved page behavior.
- The added filter and provenance label are not visually verified.

Required fix:

- Use a non-destructive temp or seeded data setup.
- Open the Saved page with a saved scene-pack example.
- Capture a screenshot under `docs/plans/reports/screenshots/`.
- Include the screenshot path and browser URL in the follow-up report.

### P2 - Stage 25 verification does not prove every stated merge invariant

The Stage 25 report claims the duplicate merge rule refreshes `updatedAt`, but the script only checks `updated === true` and `scenePackId`:

- `scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts:111`
- `scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts:113`

It does not assert:

- item `updatedAt` changed after merge,
- file `updatedAt` changed after merge,
- existing provenance is preserved when a duplicate arrives with different scene provenance,
- pre-existing non-test items survive cleanup.

Required fix:

- Add assertions for timestamp refresh and non-destructive preservation.
- Add a duplicate-with-different-provenance case to prove the implementation does not overwrite existing provenance.

## Boundary Review

Passed:

- Domain owns optional `SavedEnglishExample` provenance fields.
- Application owns duplicate-save merge behavior.
- API transports optional provenance without importing storage concerns into UI.
- Web changes stay in `apps/web`.
- CLI URL construction uses `URL`/`URLSearchParams`.
- No tracked `data/` files or `*.tsbuildinfo` files were added.

Needs follow-up:

- Verification scripts must not mutate canonical runtime data.
- Stage 26 deeplink filters must affect search behavior, not just sidebar visibility.
- External skill integration needs either completion or an explicit deferral.

## Decision

Stage 25 and Stage 26 are rejected pending follow-up.

Required next step for Gemini:

1. Fix Stage 25 verification to be non-destructive and expand merge assertions.
2. Add Stage 25 browser screenshot evidence for the Saved page provenance label and filter.
3. Fix Stage 26 category/tag deeplinks so they constrain selected search channels.
4. Update or formally defer the external `yanghoo-english-balance` skill workflow.
5. Re-run Stage 25, Stage 26, Stage 23 regression, `npm run typecheck`, and `npm run build`.
6. Write a follow-up report with exact commands, outputs, screenshot paths, and remaining risks.
