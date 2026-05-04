# Stage 4 Implementation Report: English Sentence Index (Revision 2)

Date: 2026-05-04
Executor: Gemini
Plan: `docs/plans/2026-05-04-stage-english-sentence-index.md`
Audit: `docs/plans/reports/2026-05-04-codex-audit-english-sentence-index.md`

## Audit Response

This revision addresses all three findings from the Codex audit:

| Finding | Fix |
|---------|-----|
| P1: malformed transcripts silently skipped | `ReadSentencesResult` discriminated union distinguishes `parse_error`, `invalid_shape`, `no_asset`, `no_source`. Malformed data increments `failedCount` and adds a descriptive warning. Verification script asserts the malformed source appears in warnings. |
| P2: application bypasses storage boundary | Added `IndexInputStorage` interface with `readCaptionSentences`, `readTopLevelSentences`, `readTranscriptManifest`, `getDataRoot`. Application no longer imports `fs`/`path` or accesses `(sourceStorage as any).dataRoot`. |
| P2: search lacks language validation | `searchEnglishSentenceIndexUseCase` now rejects non-`en` language with the same error message as build. Verification script asserts this. |

## Changed Files

### New Files

| File | Layer | Purpose |
|------|-------|---------|
| `packages/domain/src/englishSentenceIndex.ts` | Domain | Types: `EnglishSentenceIndexEntry`, `EnglishSentenceIndexManifest`, `normalizeSearchText` |
| `packages/storage/src/englishSentenceIndexStorage.ts` | Storage | Read/write JSONL index and manifest |
| `packages/application/src/buildEnglishSentenceIndexUseCase.ts` | Application | Build index from local transcript assets via `IndexInputStorage` |
| `packages/application/src/searchEnglishSentenceIndexUseCase.ts` | Application | Search prebuilt JSONL index with language validation |
| `apps/cli/src/commands/sentence-index-command.ts` | CLI | Build/search subcommands |
| `scripts/ops/verify-stage4-english-sentence-index.ts` | Scripts | 4-part deterministic verification including malformed-input negative test |

### Modified Files

| File | Change |
|------|--------|
| `packages/domain/src/index.ts` | Added `export * from './englishSentenceIndex.js'` |
| `packages/domain/src/storage.ts` | Added `getIndexDir`, `getEnglishSentencesJsonlPath`, `getEnglishSentencesManifestPath` |
| `packages/storage/src/index.ts` | Added `ReadSentencesResult`, `TranscriptManifestData`, `IndexInputStorage` interface; implemented on `FileStorage`; exported `indexInputStorage` singleton |
| `packages/application/src/index.ts` | Added exports for build and search use cases |
| `apps/cli/src/cli-command-registry.ts` | Added `sentence-index` command routing |

## Final CLI Commands

```bash
# Build sentence index from local transcript assets
npm run -s cli -- sentence-index build --channel <channelId> [--language en]

# Search prebuilt index
npm run -s cli -- sentence-index search "query phrase" --channel <channelId> [--language en] [--limit 20] [--json]
```

## Generated Index File Paths

```text
data/indexes/{channelId}/english-sentences.jsonl
data/indexes/{channelId}/english-sentences-manifest.json
```

## Verification Commands Run

```bash
npx tsx scripts/ops/verify-stage4-english-sentence-index.ts
npm run build -w @yanghoo/domain
npm run build -w @yanghoo/storage
npm run build -w @yanghoo/application
npm run typecheck
npm run build
```

## Key Verification Output

```
=== Part 1: Build Index ===
  PASS: Build command exits 0
  PASS: english-sentences.jsonl exists
  PASS: english-sentences-manifest.json exists
  PASS: Manifest sourceCount is 2
  PASS: Manifest sentenceCount > 0 (got 5)
  PASS: Manifest skippedCount is 1
  PASS: Manifest failedCount is 1
  PASS: Manifest has warnings for malformed source (got 1)
  PASS: Warning mentions vid004 and malformed
  PASS: JSONL lines match sentenceCount (5 vs 5)
  PASS: Entry has indexVersion 1, sourceId, videoId, channelId, timestamps, text, normalizedText, captionLanguage

=== Part 2: Idempotent Build ===
  PASS: Second build exits 0
  PASS: JSONL row count matches manifest after rebuild (5)

=== Part 3: Search ===
  PASS: Phrase "would have" finds 3 results
  PASS: Result has entry + youtubeTimestampUrl with t= parameter
  PASS: Word "because" finds 2 results
  PASS: Limit 1 returns 1 result

=== Part 4: Error Handling ===
  PASS: Search on nonexistent channel fails
  PASS: Build with unsupported language fails
  PASS: Error message mentions English/en requirement
  PASS: Search with unsupported language fails

=== Results: 40 passed, 0 failed ===
```

All builds and typecheck pass cleanly.

## Key Design Decisions

1. **Discriminated union for read results**: `ReadSentencesResult` uses a `status` field to distinguish `ok`, `no_source`, `no_asset`, `parse_error`, `invalid_shape`. The build use case maps each status to the correct manifest field: `no_source` and `no_asset` → skipped, `parse_error` and `invalid_shape` → failed + warning.

2. **`IndexInputStorage` interface**: Sits on `FileStorage` alongside existing storage interfaces. Application reads sentence data through typed methods rather than raw filesystem access. The `getDataRoot()` method replaces `(sourceStorage as any).dataRoot`.

3. **Dual path resolution**: Build checks `captions/en/transcript-sentences.json` first, then falls back to top-level `transcript-sentences.json` if the manifest confirms `language: "en"`. Both paths report parse errors.

4. **Symmetric language validation**: Both build and search reject non-`en` languages with the same error message.

5. **`process.stdout.write` for JSON output**: The `--json` flag triggers `withJsonSafeLogs` which redirects `console.log` to stderr. Search results use `process.stdout.write` to ensure JSON lands on stdout.

## Skipped Commands

None. All plan-specified verification commands ran successfully.

## Unresolved Risks

1. **No real channel data yet**: The UCxJGMJ channel has 712 videos but none have been captured/synced, so building an index for it produces an empty result. The index is ready for use once greedy caption sync populates source directories.

2. **JSONL loaded into memory for search**: Per plan, search reads the full JSONL into memory. This is acceptable for current scale but will need streaming or an external index for channels with >100K sentences.

3. **Sort stability for cross-video results**: Sorting by `publishedAt` desc, then `videoId`, then `start` time. If `publishedAt` is missing, empty strings sort first, which means undated entries cluster at the end.
