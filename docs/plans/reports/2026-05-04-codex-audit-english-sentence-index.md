# Codex Audit: Stage 4 English Sentence Index

Date: 2026-05-04
Reviewer: Codex
Gemini report: `docs/plans/reports/2026-05-04-english-sentence-index-report.md`
Decision: Changes requested

## Scope Reviewed

Plan:

- `docs/plans/2026-05-04-stage-english-sentence-index.md`

Implementation/report files reviewed:

- `docs/plans/reports/2026-05-04-english-sentence-index-report.md`
- `packages/domain/src/englishSentenceIndex.ts`
- `packages/domain/src/storage.ts`
- `packages/storage/src/englishSentenceIndexStorage.ts`
- `packages/application/src/buildEnglishSentenceIndexUseCase.ts`
- `packages/application/src/searchEnglishSentenceIndexUseCase.ts`
- `apps/cli/src/commands/sentence-index-command.ts`
- `apps/cli/src/cli-command-registry.ts`
- `scripts/ops/verify-stage4-english-sentence-index.ts`

Reference guidance considered:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/review-checklists/ai-output-review.md`
- `docs/GOTCHAS.md`

## Verification Run by Codex

Codex reran:

```bash
npx tsx scripts/ops/verify-stage4-english-sentence-index.ts
npm run typecheck
npm run build
```

All three commands passed.

Codex also ran a targeted malformed-input check using a temporary `DATA_DIR` with:

- a valid channel manifest,
- one valid source record,
- a broken `sources/yt-bad/captions/en/transcript-sentences.json`.

The build command exited successfully but produced:

```json
{
  "sourceCount": 0,
  "sentenceCount": 0,
  "skippedCount": 1,
  "failedCount": 0,
  "warnings": []
}
```

## Findings

### P1: Malformed transcript files are silently skipped instead of reported

File: `packages/application/src/buildEnglishSentenceIndexUseCase.ts`

The plan requires:

```text
Missing or malformed source transcript files are reported in the manifest warnings/failures and do not crash the whole index build.
```

Current behavior:

- `readEnglishSentences()` catches JSON parse errors and returns `null`.
- The caller treats `null` as a normal skipped source.
- `warnings` remains empty.
- `failedCount` remains `0`.

This means a corrupted sentence asset can disappear from the index without any audit trail. For a greedy channel corpus, that is risky because the user may believe the channel was fully indexed.

Required fix:

- Distinguish at least these states:
  - no source captured yet: skipped
  - no English sentence asset found: skipped or warning, depending on expected sync state
  - malformed sentence JSON: warning and/or failed
  - sentence JSON parsed but is not an array: warning and/or failed
- Add a deterministic verification assertion that a malformed sentence file appears in `english-sentences-manifest.json` warnings or increments `failedCount`.

### P2: Application layer bypasses the storage boundary for index input reads

File: `packages/application/src/buildEnglishSentenceIndexUseCase.ts`

The use case directly imports `fs` and `path`, reads transcript files itself, and gets the storage root via:

```ts
const storage = sourceStorage as any;
return storage.dataRoot as string;
```

The Stage 4 plan placed filesystem index artifact behavior in storage and application orchestration in application. The current implementation works, but it weakens the boundary and relies on a private storage implementation detail.

Required fix:

- Prefer adding explicit storage methods for reading source sentence assets and transcript metadata, or expose a typed storage root/path contract instead of `(sourceStorage as any).dataRoot`.
- If Gemini intentionally keeps this shortcut for Stage 4, the report must call it out as technical debt and explain why it is acceptable temporarily.

### P2: Search language validation is asymmetric

File: `packages/application/src/searchEnglishSentenceIndexUseCase.ts`

Build rejects non-English language values, but search does not. Searching with `--language fr` silently returns no results from an English index.

Required fix:

- Reuse the same Stage 4 language validation for search, or document why search accepts arbitrary language filters.

## Accepted Behavior

The following behavior is acceptable in this round:

- Stage 4 does not fetch YouTube, captions, audio, media, transcription, or translation.
- Index files are written under `data/indexes/{channelId}/`.
- Search reads from the prebuilt JSONL index.
- The deterministic happy-path verification passes.
- Build is idempotent for the fixture.
- Phrase and word search work for the fixture.
- Existing single-video machine translation behavior is not removed by this stage.

## Decision

Stage 4 is not accepted yet.

Gemini should fix the malformed-input reporting gap, preferably also tightening the storage boundary and search language validation, then update:

```text
docs/plans/reports/2026-05-04-english-sentence-index-report.md
```

Codex should re-audit after the new report is available.
