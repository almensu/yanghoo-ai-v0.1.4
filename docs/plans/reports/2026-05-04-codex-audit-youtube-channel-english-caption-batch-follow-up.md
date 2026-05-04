# Codex Audit: YouTube Channel English Caption Batch Follow-up

Date: 2026-05-04

Reviewer: Codex

Result: Partially accepted, not ready for Stage 3 greedy sync.

## Evidence Reviewed

- `docs/plans/reports/2026-05-04-youtube-channel-english-caption-batch-report.md`
- `packages/application/src/ensureTranscriptUseCase.ts`
- `packages/application/src/syncChannelCaptionsUseCase.ts`
- `packages/source-adapters/src/youtubeAdapter.ts`
- `scripts/ops/verify-stage2-caption-batch.ts`

## Verification Run By Codex

```bash
npx tsx scripts/ops/verify-stage2-caption-batch.ts
npm run typecheck
npm run build
```

Results:

- `scripts/ops/verify-stage2-caption-batch.ts` passed.
- `npm run typecheck` passed.
- `npm run build` passed.

The verification script confirmed:

- `--language en --limit 2` processed 2 videos successfully.
- English caption assets were persisted.
- Primary transcript assets were persisted.
- No `captions/zh-Hans/*` files were persisted.
- No `translation/*` files were persisted.
- No audio/media files were persisted.
- `captions-manifest.json` is scoped to `requestedLanguages: ["en"]`.

## Findings

### P0: `--language en` still triggers zh-Hans network acquisition

Persistence is now English-only, but acquisition is not English-only.

During Codex verification, the command still logged for each video:

```text
Loading en transcript from InnerTube URL
Loading zh-Hans transcript from InnerTube URL
zh-Hans transcript attempts failed
```

The code confirms this behavior:

- `packages/application/src/ensureTranscriptUseCase.ts` calls `youtubeAdapter.fetchTranscriptBundle(videoId)` without passing the requested language.
- `packages/source-adapters/src/youtubeAdapter.ts` then runs both caption fetches:

```ts
const [english, simplifiedChinese] = await Promise.all([
  this.fetchCaptionVariant(videoId, captionTracks, translationLanguages, 'en'),
  this.fetchCaptionVariant(videoId, captionTracks, translationLanguages, 'zh-Hans')
]);
```

This violates the current product direction for this channel workflow:

```text
Only English captions are needed for English learning.
Do not request, translate, or persist Chinese assets during Stage 2 channel caption batches.
```

Why this matters:

- It doubles caption network work in the common case.
- It increases YouTube 429/rate-limit risk.
- It keeps noisy zh-Hans failure logs in an English-only workflow.
- It makes Stage 3 greedy sync riskier at hundreds/thousands of videos.

Required fix:

- Add a language-scoped adapter path, for example `fetchTranscriptBundle(videoId, { languages: ['en'] })` or `fetchTranscriptVariant(videoId, 'en')`.
- When `channel captions ... --language en` is used, only fetch English captions.
- Verification must assert logs or adapter counters do not include zh-Hans attempts, or the adapter API should be unit/contract-tested with a fake fetcher proving only English is requested.

### P1: Missing-caption failure path remains unverified

The report explicitly defers missing-caption verification. That is acceptable for a narrow "happy-path English batch" milestone, but not enough for greedy mode.

Required before Stage 3:

- Add a fake-adapter or fixture test proving one video can fail caption acquisition while the batch continues.
- Persist/report the failure truthfully in `failed[]` and any planned sync report/checkpoint.

## Accepted Parts

- English-only persisted assets are now correct for `--language en`.
- The new TypeScript verification script has real assertions.
- The circular import through `./index.js` was fixed for `ensureTranscriptUseCase`.
- No audio/media assets are created in the Stage 2 smoke test.
- Build and typecheck pass.

## Decision

Stage 2 is accepted only as an English asset persistence proof. It is not accepted as the final Stage 2 implementation for the greedy-channel roadmap because English-only acquisition still performs zh-Hans network requests.

Do not move to Stage 3 greedy sync until `--language en` is English-only at both the application and adapter acquisition layers.
