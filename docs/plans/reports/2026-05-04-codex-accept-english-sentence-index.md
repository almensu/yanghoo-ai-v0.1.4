# Codex Acceptance Audit: Stage 4 English Sentence Index Revision 2

Date: 2026-05-04
Reviewer: Codex
Gemini report: `docs/plans/reports/2026-05-04-english-sentence-index-report.md`
Prior audit: `docs/plans/reports/2026-05-04-codex-audit-english-sentence-index.md`
Decision: Accepted

## Scope Reviewed

Plan:

- `docs/plans/2026-05-04-stage-english-sentence-index.md`

Implementation/report files reviewed:

- `packages/domain/src/englishSentenceIndex.ts`
- `packages/domain/src/storage.ts`
- `packages/storage/src/index.ts`
- `packages/storage/src/englishSentenceIndexStorage.ts`
- `packages/application/src/buildEnglishSentenceIndexUseCase.ts`
- `packages/application/src/searchEnglishSentenceIndexUseCase.ts`
- `apps/cli/src/commands/sentence-index-command.ts`
- `apps/cli/src/cli-command-registry.ts`
- `scripts/ops/verify-stage4-english-sentence-index.ts`
- `docs/plans/reports/2026-05-04-english-sentence-index-report.md`

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

All commands passed.

Key verification evidence:

- Stage 4 script reports `40 passed, 0 failed`.
- Build creates `english-sentences.jsonl`.
- Build creates `english-sentences-manifest.json`.
- Manifest counts match JSONL row count.
- Fixture indexes 2 sources and 5 sentences.
- Fixture records 1 skipped source and 1 failed malformed source.
- Malformed source warning mentions `vid004` and `malformed`.
- Rebuild is idempotent.
- Phrase search finds `"would have"`.
- Word search finds `"because"`.
- `--limit 1` caps results.
- Build rejects unsupported language.
- Search rejects unsupported language.
- `npm run typecheck` passes across workspaces.
- `npm run build` passes across workspaces.

Codex also reran the prior hand-written malformed-input check with a temporary `DATA_DIR`. The revised implementation now produces:

```json
{
  "sourceCount": 0,
  "sentenceCount": 0,
  "skippedCount": 0,
  "failedCount": 1,
  "warnings": [
    "Source yt-bad: malformed caption sentences: ..."
  ]
}
```

## Prior Findings

### P1: Malformed transcript files are silently skipped

Status: Fixed.

`ReadSentencesResult` now distinguishes parse errors and invalid shapes from normal missing assets. Malformed caption sentence files increment `failedCount` and write a warning to the index manifest.

### P2: Application layer bypasses storage boundary

Status: Fixed enough for Stage 4.

`IndexInputStorage` provides typed input reads for caption sentences, top-level sentences, transcript manifests, and configured data root. The application use case no longer imports `fs`/`path` or uses `(sourceStorage as any).dataRoot`.

### P2: Search language validation is asymmetric

Status: Fixed.

Build and search both reject non-`en` language values for this English-learning stage.

## Acceptance Findings

No blocking findings remain.

The implementation satisfies the Stage 4 goal:

- It builds a local English JSONL sentence index from already-persisted transcript sentence assets.
- It does not fetch YouTube, captions, audio, media, transcription, or translation.
- It stores index artifacts under canonical `data/indexes/{channelId}/`.
- It searches the prebuilt JSONL index rather than scanning every source transcript at query time.
- It preserves source/video/channel identity, timestamps, text, normalized text, caption language, and caption kind where available.
- It preserves the existing single-video translation capability by leaving translation paths untouched.

## Residual Risks

- Search currently loads JSONL into memory. This was accepted in the Stage 4 plan but should be revisited once the corpus grows beyond comfortable local memory.
- Search sorting uses `publishedAt`, then `videoId`, then sentence start. Later Youglish-like UX may need source manifest order, relevance ranking, or per-video diversity.
- `getDataRoot()` is now typed but still exposes a storage-root concern to application orchestration. This is acceptable for the first JSONL index stage; a future storage facade could hide path construction fully.

## Decision

Stage 4 English sentence index revision 2 is accepted.

Gemini can proceed to the next stage after the user chooses the direction:

- run greedy caption sync on the real Vanessa channel and build the first real index, or
- plan Stage 5 Youglish-like search/learning surface.
