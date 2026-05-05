# Codex Audit: Stage 12 Channel Delete and Multi-Channel English Search

Date: 2026-05-05

Audited report:

- `docs/plans/reports/2026-05-05-channel-delete-and-multi-channel-english-search-report.md`

Plan baseline:

- `docs/plans/2026-05-05-stage-channel-delete-and-multi-channel-english-search.md`

## Verdict

Rejected for follow-up fixes.

Stage 12 is directionally aligned with the requested UI and API shape, and the basic verification script, typecheck, and build pass. However, the current delete semantics can remove source assets still referenced by another channel. The verification also does not prove the core multi-channel search behavior across more than one indexed channel.

## Findings

### P1: Deleting one channel can remove shared source assets used by another channel

File:

- `packages/application/src/deleteLearningChannelUseCase.ts`

The use case iterates videos for the deleted channel and calls `sourceStorage.deleteSource(sourceId)` without checking whether the same source/video is referenced by another channel library.

This violates the Stage 12 safety requirement that deletion must not affect unrelated channels/source assets. In practice, a source can be related to the deleted channel and still be shared with another channel. Deleting the source breaks the remaining channel's subtitle/readiness assets.

Reproduction evidence:

```bash
DATA_DIR="$(mktemp -d)" npx tsx -e "<shared-source delete probe>"
```

Key output:

```json
{
  "before": true,
  "after": false,
  "channelB": true,
  "deletedSources": 1,
  "warnings": []
}
```

Interpretation:

- `channel-b` still exists.
- The shared source no longer exists.
- No warning was returned.

Required fix:

- Before deleting any source asset, scan channel manifests/videos/selections to determine whether another channel still references the same `sourceId` or same canonical YouTube video id.
- If referenced elsewhere, delete only the deleted channel directory/index state and skip the shared source asset with an explicit warning/summary item.
- Add a verification case where two channels reference the same source/video and deleting one preserves the shared source for the other.

### P1: Verification does not prove multi-channel search across multiple indexed channels

File:

- `scripts/ops/verify-stage12-channel-delete-and-multi-channel-english-search.ts`

The report claims multi-channel search is verified, but the current script mainly proves:

- empty `channelIds` returns empty results,
- nonexistent channels return warnings,
- legacy `channelId` remains compatible.

It does not build two real channel indexes with distinct searchable sentences and then prove:

- selecting both channels returns merged results,
- selecting only channel A excludes channel B,
- selecting only channel B excludes channel A,
- result rows preserve channel context.

Required fix:

- Add fixtures for at least two indexed channels with unique sentences.
- Assert multi-select and single-select behavior against real `buildEnglishSentenceIndexUseCase` output.

### P2: Delete summary is not fully truthful

File:

- `packages/application/src/deleteLearningChannelUseCase.ts`

`sourceStorage.deleteSource(sourceId)` returns detailed `{ deleted, skipped, failed }`, but the use case discards those paths and only increments `deletedSources`. The returned `deletedPaths` currently lists channel/index paths, while `skippedPaths` is never populated.

Required fix:

- Merge `deleteSource()` path-level results into the final `ChannelDeleteResult`.
- Surface failed path deletions as warnings or structured `failedPaths`.

### P2: API warnings are dropped by the web client

Files:

- `apps/api/src/routes/englishSentences.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/EnglishSentenceSearch.tsx`

The API returns `{ results, warnings }`, but the client helper returns only `data.results`. This makes missing-index or skipped-channel warnings invisible in the UI.

Required fix:

- Keep warnings in the client response type.
- Show a compact non-blocking warning state in English Search when warnings are returned.

## Verified Passing

Commands run:

```bash
npx tsx scripts/ops/verify-stage12-channel-delete-and-multi-channel-english-search.ts
npm run typecheck
npm run build
```

Observed results:

- Stage 12 script: `18/18` assertions passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.

These results prove the baseline implementation compiles and covers happy-path behavior, but they do not cover the shared-source deletion and real two-channel search cases above.

## Next Gemini Task

Fix the Stage 12 issues above before moving to Stage 13.

Acceptance criteria:

- Deleting a channel preserves source assets still referenced by any remaining channel.
- The delete response truthfully reports deleted, skipped, and failed paths.
- Multi-channel English Search verification uses two indexed channels and proves merged and single-channel filtering behavior.
- English Search UI does not silently drop API warnings.
- `npm run typecheck`, `npm run build`, and the revised Stage 12 verification script pass.
