# Stage 2 Follow-up: Language-scoped Caption Acquisition Report

Date: 2026-05-04
Owner: Gemini
Reviewer: Codex
Status: Completed

## Execution Summary

Pushed language scoping from the application layer down to the adapter acquisition layer. When `--language en` is specified, the YouTube adapter no longer makes any zh-Hans network requests. The default bilingual path (`transcript ensure`) remains fully functional.

## Changes Made

### 1. `packages/source-adapters/src/youtubeAdapter.ts`
- Added `FetchTranscriptBundleOptions` interface with optional `languages: ('en' | 'zh-Hans')[]`.
- Updated `fetchTranscriptBundle(videoId, options?)` to accept the options parameter.
- When `languages` is provided, only the specified language variants are fetched. When omitted, defaults to `['en', 'zh-Hans']` (backward compatible).
- The `Promise.all` now conditionally includes only requested language fetches.

### 2. `packages/application/src/ensureTranscriptUseCase.ts`
- Derives `adapterLanguages` from the requested `language` option (single language or default bilingual).
- Passes `{ languages: adapterLanguages }` to `youtubeAdapter.fetchTranscriptBundle`.

### 3. `scripts/ops/verify-stage2-caption-batch.ts`
- Added Step 3: assertion that no `zh-Hans` text appears in adapter logs during English-only mode.
- Improved JSON parsing to handle mixed log/JSON output robustly.

### 4. `packages/application/src/syncChannelCaptionsUseCase.ts`
- No changes in this round (language was already passed through from previous fix).

## Verification Evidence

### Verification Command

```bash
npx tsx scripts/ops/verify-stage2-caption-batch.ts
npm run typecheck
npm run build
```

### Verification Output

```text
Running Stage 2 caption batch verification...
Step 1: channel add --limit 2
  -> Captured 2 videos
Step 2: channel captions --language en --limit 2
  -> Processed: 2, Success: 2, Failed: 0
  -> No zh-Hans network requests in logs
  -> Source directories: 2
  -> No duplicate source IDs
  -> English caption assets verified for all sources
  -> Primary transcript assets verified
  -> No zh-Hans files (correct for --language en)
  -> No translation files (correct for --language en)
  -> No audio/media files
  -> Caption manifests scoped to requested language

Stage 2 caption batch verification passed.
```

### Build Status

- `npm run typecheck`: Passed
- `npm run build`: Passed

## Evidence: English-only Mode Did Not Request zh-Hans

The verification script asserts no `zh-Hans` text in the captured logs. In previous runs, the logs showed `Loading zh-Hans transcript from InnerTube URL` and `zh-Hans transcript attempts failed`. After this fix, no zh-Hans request lines appear.

The adapter log now correctly reads `Fetching en InnerTube transcript for video: ...` instead of `Fetching bilingual InnerTube transcript for video: ...`.

## Evidence: Bilingual/Machine-Translation Capability Preserved

Tested default bilingual path:

```bash
tmpdir=$(mktemp -d)
DATA_DIR="$tmpdir" npm run -s cli -- source add 'https://www.youtube.com/watch?v=N_hNCnh1dxs' --json
DATA_DIR="$tmpdir" npm run -s cli -- transcript ensure yt-N_hNCnh1dxs --json
```

Result:

- `zh-Hans` files: 4 (transcript-raw.json, transcript-sentences.json, transcript.vtt, document.md)
- `translation` files: 2 (document.zh-Hans.md, translation-manifest.json)

The default `transcript ensure <sourceId>` command continues to request and persist both English and Simplified Chinese caption variants with YouTube machine translation.

## Acceptance Criteria

| Criterion | Status |
|-----------|--------|
| `channel captions --language en --limit 2 --json` passes with 2 successes | Passed |
| English assets exist for each source | Passed |
| No `captions/zh-Hans/*`, `translation/*`, audio, or media files | Passed |
| Verification proves no `zh-Hans` caption request made in English-only mode | Passed |
| Bilingual/machine-translation capability remains available | Passed (via `transcript ensure`) |
| `npm run typecheck` passes | Passed |
| `npm run build` passes | Passed |

## Unresolved Risks

- The adapter's `fetchCaptionVariant` method still accepts `'zh-Hans'` as a valid language. A future adapter improvement could type-narrow this based on the calling context.
- Missing-caption failure path remains unverified with a real no-caption video. Recommended before Stage 3 greedy sync.
