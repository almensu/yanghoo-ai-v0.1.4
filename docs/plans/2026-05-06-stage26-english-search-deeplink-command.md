# Stage 26 Plan: English Search Deeplink Command

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Draft for review

## Corrected User Request

The user does **not** want Yanghoo to open external YouTube/X search pages.

The desired model is:

```text
skill extracts keyword
-> Yanghoo builds an English Search URL
-> opening that URL lands on Yanghoo English Search
-> English Search automatically searches local English subtitle clips
-> user sees playable local results
```

Equivalent mental model:

```text
YouTube: https://www.youtube.com/results?search_query=linux
X:       https://x.com/search?q=Linux&src=typed_query
Yanghoo: http://127.0.0.1:3000/?view=english-search&q=Linux
```

The keyword extraction should come from:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance
```

The actual search results should come from Yanghoo's existing local English sentence index.

## Current System Findings

Current CLI:

- `npm run -s cli -- english-search <query> ...` already searches local English subtitle clips and returns JSON/text results.
- `npm run -s cli -- english-search batch <scene-brief.json> ...` already takes skill-generated queries and produces evidence packs.

Current Web:

- `App.tsx` stores active tab in React state:

  ```text
  workbench | channels | english-search | saved-examples
  ```

- `EnglishSentenceSearch.tsx` initializes:

  ```ts
  const [query, setQuery] = useState('would have');
  ```

- No current code reads `window.location.search` for `view=english-search` or `q=...`.
- Therefore a skill cannot currently generate a Yanghoo URL that opens English Search with a query prefilled and searched.

## Goal

Add a stable internal search URL contract and CLI helper:

```bash
npm run -s cli -- english-search url "Linux"
npm run -s cli -- english-search url "wake up child" --open
npm run -s cli -- english-search urls /tmp/scene-brief.json --json
```

Generated URL:

```text
http://127.0.0.1:3000/?view=english-search&q=Linux
```

When opened in the browser:

- Yanghoo switches to the `English Search` tab.
- Search box contains `Linux`.
- Existing English Search auto-search runs.
- Results are playable in the existing player panel.

## Non-Goals

- Do not scrape external search engines.
- Do not open YouTube/X search pages in this stage.
- Do not change the evidence-pack pipeline.
- Do not replace `english-search batch`.
- Do not add a full router library unless the current app structure requires it.
- Do not commit runtime `data/` files.

## Product Contract

### URL Format

Start with simple query parameters:

```text
/?view=english-search&q=<encoded query>
```

Optional parameters:

```text
limit=20
diversity=balanced|all|one_per_video
sort=recent|variety
captionKind=all|manual|auto
category=<learning channel category>
tag=<learning channel tag>
channels=<comma-separated channel ids>
```

Stage 26 should implement at least:

```text
view
q
limit
category
tag
channels
```

If a parameter is invalid, ignore it and use the existing UI default rather than crashing.

### Browser Behavior

Opening:

```text
http://127.0.0.1:3000/?view=english-search&q=wake%20up%20child
```

should:

- select `English Search` in the top nav,
- populate the search input with `wake up child`,
- clear active Scene Pack mode,
- select channels according to URL params if provided, otherwise use existing default indexed channels,
- run the normal English Search request,
- show result cards and player behavior unchanged.

### URL State Updates

Stage 26 can be one-way only:

```text
URL -> UI state
```

Do not require every UI interaction to push state back to the URL in this stage. A later stage can add shareable live URL updates if needed.

## CLI Shape

Extend existing `english-search` command with URL helpers instead of adding a separate command.

### Single Query URL

```bash
npm run -s cli -- english-search url "Linux"
```

Human output:

```text
English Search URL:
http://127.0.0.1:3000/?view=english-search&q=Linux
```

JSON output:

```bash
npm run -s cli -- english-search url "Linux" --json
```

```json
{
  "query": "Linux",
  "url": "http://127.0.0.1:3000/?view=english-search&q=Linux"
}
```

Options:

```text
--base-url <url>       default http://127.0.0.1:3000
--open                 open generated URL with macOS open
--limit <n>
--category <name>
--tag <name>
--channels <ids>
```

### Scene Brief Query URLs

For skill integration:

```bash
npm run -s cli -- english-search urls /tmp/scene-brief.json --json
```

Input must be a `scene-brief` JSON with `queries`.

Output:

```json
{
  "briefId": "kid-wake-up-morning",
  "scene": "Scene.KidWakeUpMorning",
  "urls": [
    {
      "query": "wake up",
      "url": "http://127.0.0.1:3000/?view=english-search&q=wake%20up"
    }
  ]
}
```

Options:

```text
--open-first
--base-url <url>
--limit <n>
--category <name>
--tag <name>
--channels <ids>
```

This lets `yanghoo-english-balance` extract keywords and present clickable Yanghoo local-search links without forcing a full evidence-pack generation.

## Skill Integration

Update:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/workflows.md
```

Add an optional workflow:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs \
  --scene-file <scene.md> \
  --id <id> \
  --level L2 > /tmp/scene-brief.json

npm run -s cli -- english-search urls /tmp/scene-brief.json \
  --category "English Teacher" \
  --json
```

Rules:

- These URLs search Yanghoo's local English subtitle index.
- They are interactive discovery links, not external evidence.
- Real evidence still comes from local search results, saved examples, or evidence packs.
- Prefer 1-5 high-signal query links in human-facing output.

## Target Files

Likely repo files:

```text
apps/web/src/App.tsx
apps/web/src/components/EnglishSentenceSearch.tsx
apps/cli/src/commands/english-search-command.ts
apps/cli/src/cli-output-renderer.ts
scripts/ops/verify-stage26-english-search-deeplink-command.ts
docs/plans/reports/2026-05-06-stage26-english-search-deeplink-command-report.md
```

External skill docs:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/workflows.md
```

Optional only if useful:

```text
packages/application/src/buildEnglishSearchUrlUseCase.ts
packages/application/src/index.ts
```

Keep the first implementation small. A CLI-local helper is acceptable if only the CLI needs URL rendering.

## Implementation Notes

### Web

Add a small URL parser helper, preferably close to `App.tsx` or `EnglishSentenceSearch.tsx`:

```ts
const params = new URLSearchParams(window.location.search);
```

In `App.tsx`:

- if `view=english-search`, initialize `activeView` to `english-search`.

In `EnglishSentenceSearch.tsx`:

- accept optional initial state props from `App`, or read URL params locally.
- initialize `query` from `q` when present.
- apply `limit`, `category`, `tag`, `channels` after channels load.
- when URL-driven query is present, clear `activePackId` so normal search mode runs.

Be careful that selected channels load asynchronously. URL channel/category/tag filtering should run after `listLearningChannels()` resolves.

### CLI

Use `URL` and `URLSearchParams`, not manual string concatenation.

Opening:

- Use `spawnSync('open', [url])` on macOS.
- Automated verification should not open a browser by default.
- Add a dry-run path if needed.

## Verification

Add:

```bash
npx tsx scripts/ops/verify-stage26-english-search-deeplink-command.ts
```

The script should assert:

- `english-search url Linux --json` returns `view=english-search` and `q=Linux`.
- spaces encode/decode correctly: `wake up child`.
- Chinese query encodes/decodes correctly: `小孩 起床`.
- scene-brief `urls` command returns one URL per query.
- optional `limit/category/tag/channels` appear as URL params.

Run:

```bash
npx tsx scripts/ops/verify-stage26-english-search-deeplink-command.ts
npm run -s cli -- english-search url Linux --json
npm run -s cli -- english-search urls /tmp/<test-scene-brief>.json --json
npm run typecheck
npm run build
git status --short
```

If browser behavior changes, include browser evidence:

```text
docs/plans/reports/screenshots/stage26-english-search-deeplink-linux.png
```

Screenshot should show:

- English Search tab selected,
- search box populated from URL,
- results loaded or a clear no-results state for that query.

## Acceptance Criteria

- A Yanghoo English Search URL can be generated from a keyword.
- Opening that URL lands on English Search and runs local English clip search.
- Skill-generated scene brief queries can be converted into multiple English Search URLs.
- Existing `english-search <query>` and `english-search batch` behavior remains unchanged.
- `yanghoo-english-balance` docs describe the new interactive discovery workflow.
- Typecheck/build pass.
- No runtime `data/` files or `*.tsbuildinfo` files are committed.

## Expected Report

Write:

```text
docs/plans/reports/2026-05-06-stage26-english-search-deeplink-command-report.md
```

Include:

- changed files,
- exact command outputs,
- generated example URLs,
- browser screenshot path if captured,
- skill documentation updates,
- unresolved risks and skipped commands.
