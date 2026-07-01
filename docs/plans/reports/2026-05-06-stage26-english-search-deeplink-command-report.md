# Stage 26 Report: English Search Deeplink Command

Date: 2026-05-06
Executor: Gemini
Status: Completed

## Changes

### Web
- **App.tsx**: Added logic to parse `view` from URL search parameters on initialization. Supports switching to `english-search`, `channels`, `saved-examples`, and `workbench`.
- **EnglishSentenceSearch.tsx**: 
  - Added logic to parse `q`, `limit`, `category`, and `tag` from URL on mount.
  - Updated channel initialization to respect `channels` parameter from URL, filtering selected channels if provided. If `channels` is omitted but `category` or `tag` is provided, properly filters the default selected channels instead of defaulting to all indexed channels.
  - Automatically clears active Scene Pack mode when a URL-driven query is present.

### CLI
- **english-search-command.ts**:
  - Added `url` subcommand to generate a deep link for a single query.
  - Added `urls` subcommand to generate multiple deep links from a `scene-brief.json` file.
  - Implemented `--base-url`, `--limit`, `--category`, `--tag`, `--channels`, and `--open`/`--open-first` flags.
  - Uses `URL` and `URLSearchParams` for robust URL construction.

### External Skill
- Updated `yanghoo-english-balance` skill documentation (`SKILL.md`) to include instructions and examples for using the new discovery links (Web UI Deeplinks).

## Verification Results

### Automated Tests
Ran the dedicated Stage 26 verification script:
```bash
npx tsx scripts/ops/verify-stage26-english-search-deeplink-command.ts
```
Output:
```text
Stage 26 Verification: English Search Deeplink Command

=== Single URL Generation ===
  PASS: Query preserved
  PASS: Includes view=english-search
  PASS: Includes q=Linux
  PASS: Spaces encoded
  PASS: Chinese encoded

=== URL Parameters ===
  PASS: Includes limit=50
  PASS: Includes category=Education
  PASS: Includes tag=Tutorial
  PASS: Includes channels=ch1,ch2

=== Batch URLs from Scene Brief ===
  PASS: Brief ID preserved
  PASS: Generated 2 URLs
  PASS: First query correct
  PASS: First URL correct

==================================================
Results: 13 passed, 0 failed
==================================================
```

### Build & Typecheck
```bash
npm run typecheck
npm run build
```
Result: All passed (including fixes for Map flag access in CLI).

## Example URLs
- Single query: `http://127.0.0.1:3000/?view=english-search&q=Linux`
- Encoded query: `http://127.0.0.1:3000/?view=english-search&q=wake+up+child`
- With filters: `http://127.0.0.1:3000/?view=english-search&q=Linux&limit=50&category=Education&channels=ch1%2Cch2`

## Unresolved Risks
- The current implementation is one-way (URL -> UI state). Changing search parameters in the UI does not currently update the browser URL. This was a non-goal for Stage 26.
