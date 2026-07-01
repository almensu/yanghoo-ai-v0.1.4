# Stage 27 Plan: English Search Shareable URL State

Date: 2026-05-07
Owner: Codex
Executor: Gemini
Status: Ready for executor

## Reference Context

Read first:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/codex-gemini-glm-collaboration-protocol.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/gemini-model-battery-protocol.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/index.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/repo-conventions.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/decision-rules.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/plans/2026-05-06-stage26-english-search-deeplink-command.md`
- `docs/plans/reports/2026-05-06-codex-accept-stage25-26-scene-provenance-and-deeplinks-follow-up.md`

Reference path note:

- Project instructions still mention `/Volumes/2T/com/yanghoo205/yanghoo-reference`.
- On 2026-05-07 Codex found that path unavailable and used `/Users/a123/com/yanghoo205/yanghoo-reference`, which is the path requested by the user for the collaboration protocol.

## Project Agent Instructions

Read before work:

- `AGENTS.md`
- `CLAUDE.md`

Relevant constraints for this task:

- Codex owns planning and audit; Gemini owns implementation.
- Gemini must write the expected report before Codex acceptance.
- Codex acceptance is required before Stage 27 is complete.
- Follow UI -> application -> domain dependency direction.
- Scripts remain entry points only; business logic belongs in `packages/*` when shared.
- Do not commit or depend on runtime `data/` contents.
- Do not copy implementation from the reference repository.
- Before implementation, Gemini must start `gemini --yolo`, run `/model`, and include `Model Battery` in the report.

## User Problem

Stated request:

```text
根据 codex-gemini-glm-collaboration-protocol 推进下一个任务
```

Observed workaround:

- Stage 26 added one-way URLs such as `/?view=english-search&q=Linux`.
- The generated link opens English Search correctly, but after the user changes query, limit, category, tag, channels, diversity, sort, caption kind, or scene pack selection in the UI, the browser URL remains stale.
- Users or skills must manually reconstruct links instead of copying the current browser URL.

Product workflow to formalize:

```text
open Yanghoo English Search
-> adjust filters or choose a scene pack
-> browser URL becomes the shareable state
-> reload/open copied URL
-> Yanghoo restores the same search or scene-pack view
```

## Goal

Make English Search URL state two-way and reload-safe for the current Stage 26 surface.

The URL should be a stable product contract, not just an initial boot parameter:

```text
UI state -> URL -> restored UI state
```

This closes the Stage 26 unresolved risk while keeping the implementation narrow and browser-local.

## Non-Goals

- Do not add a router library unless the current app structure cannot support this safely.
- Do not add auth, accounts, server-side shared links, or short-link persistence.
- Do not change the English sentence search backend contract except where a verification helper needs existing request observability.
- Do not change scene-pack import semantics.
- Do not modify the external `yanghoo-english-balance` skill in this stage.
- Do not touch runtime `data/` files except through temp-directory verification.
- Do not implement production code outside the listed target files without reporting why.

## Target Files

Likely implementation files:

```text
apps/web/src/App.tsx
apps/web/src/components/EnglishSentenceSearch.tsx
```

Optional, only if useful to keep URL parsing/building testable and out of the component:

```text
apps/web/src/utils/englishSearchUrlState.ts
apps/web/src/utils/englishSearchUrlState.test.ts
```

Verification:

```text
scripts/ops/verify-stage27-english-search-shareable-url-state.ts
docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-report.md
```

Browser evidence, if Gemini changes visible UI controls or adds a copy-link button:

```text
docs/plans/reports/screenshots/stage27-english-search-shareable-url-state.png
```

## Do Not Edit

```text
packages/domain/
packages/application/
packages/storage/
apps/api/
data/
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/
/Users/a123/com/yanghoo205/Anything-to-English/
tmp/SKILL.md
```

If a file outside the target list is truly required, stop and record the reason before editing it.

## Layer Placement

- URL parsing/building belongs in the Web UI layer because it is browser navigation state.
- English Search API calls remain unchanged and continue to use existing client functions.
- Scene-pack data remains owned by the existing scene-pack domain/application/API/storage layers.
- No domain model should know about `window.location`, `history`, or query-string names.

Boundary answers:

1. Behavior owner: Web UI navigation state.
2. Package/app: `apps/web`.
3. Allowed dependencies: React hooks, browser `URLSearchParams`, browser `history`, existing web API client/types.
4. Boundary risk: moving URL state into domain/application would leak browser concerns inward.
5. Verification: parser/build assertions plus browser or component-level reload/deeplink evidence.

## Data / Behavior Contract

### URL Parameters

Support these parameters as the shareable contract:

```text
view=english-search
q=<query>
limit=20|50|100
diversity=balanced|all|one_per_video
sort=recent|variety
captionKind=all|manual|auto
category=<category>
tag=<tag>
channels=<comma-separated channel ids>
scenePack=<scene pack id>
```

Rules:

- `view=english-search` must be present whenever the active view is English Search.
- Plain search mode should omit `scenePack`.
- Scene-pack mode should include `scenePack=<id>` and may omit `q`.
- Invalid enum values must be ignored and replaced by existing defaults.
- Empty strings must not produce noisy parameters.
- `channels` must preserve explicit user selection when at least one selected indexed channel exists.
- If `channels` is absent, existing category/tag/default selection rules still apply.
- URL writes should use `history.replaceState` for normal typing/filter changes to avoid filling browser history.
- If Gemini adds explicit copy/open actions, those actions may use `pushState`, but normal filter interaction should not.

### Restore Behavior

Reloading a copied URL should restore:

- English Search tab selection,
- query text,
- result limit,
- diversity,
- sort,
- caption kind,
- category,
- tag,
- selected channels when `channels` is provided,
- scene-pack mode when `scenePack` is provided,
- normal search mode when `q` is provided and `scenePack` is absent.

When both `scenePack` and `q` are present:

- `scenePack` wins.
- Query text may remain visible, but active results must come from the scene pack.
- Document the exact chosen behavior in the report.

### Search Trigger Behavior

- For query URLs, restore should trigger the same normal English Search request as Stage 26.
- For scene-pack URLs, restore should load the scene pack and map examples into playable results.
- Changing filters in plain search mode should update the URL before or at the same time as the next search state becomes visible.
- Back to Search from scene-pack mode should remove `scenePack` from the URL.

## Acceptance Criteria

- Browser URL updates when the user changes query, limit, diversity, sort, caption kind, category, tag, channel selection, or scene-pack selection.
- Reloading a query URL restores the same search parameters and selected channels.
- Reloading a scene-pack URL restores scene-pack mode.
- URL updates do not cause infinite effects, repeated searches, or visible input lag.
- Stage 26 deeplink behavior remains intact.
- No runtime `data/` files are committed or destructively rewritten.
- `npm run typecheck` passes.
- `npm run build` passes.

## Verification

Gemini should create a focused verification script:

```bash
npx tsx scripts/ops/verify-stage27-english-search-shareable-url-state.ts
```

Minimum assertions:

- A helper or component-level URL builder emits the expected query string for all supported params.
- Invalid enum params fall back without throwing.
- `scenePack` and `q` conflict behavior matches the contract above.
- Stage 26 query URL examples still parse:
  - `/?view=english-search&q=Linux`
  - `/?view=english-search&q=wake%20up%20child&limit=50&category=Education&channels=ch1%2Cch2`
- URL serialization omits empty/default noise where the implementation chooses to omit defaults.

Regression commands:

```bash
npx tsx scripts/ops/verify-stage26-english-search-deeplink-command.ts
npx tsx scripts/ops/verify-stage23-english-scene-pack-ui.ts
npx tsx scripts/ops/verify-stage25-scene-pack-saved-example-provenance.ts
npm run typecheck
npm run build
```

Browser evidence:

- If a browser automation setup is available, open a URL with `view=english-search&q=Linux&limit=50`, change at least one filter, and report the final browser URL.
- If no browser automation is available, report why and provide script/component evidence instead.

## Expected Report

Write:

```text
docs/plans/reports/2026-05-07-stage27-english-search-shareable-url-state-report.md
```

The report must include:

- `Model Battery`
- changed files,
- exact commands run,
- summarized key output,
- URL before/after examples,
- browser evidence or explicit reason it was skipped,
- whether `docs/GOTCHAS.md` needed an update,
- unresolved risks,
- skipped commands.

Codex should reject the report if:

- `Model Battery` is missing,
- Stage 26 query deeplinks regress,
- scene-pack reload is claimed without evidence,
- URL writes create an infinite update loop,
- report uses "works as expected" without concrete URL/readback evidence.
