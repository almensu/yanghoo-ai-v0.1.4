# Codex Acceptance: YouTube Channel Language-scoped Caption Acquisition

Date: 2026-05-04

Reviewer: Codex

Result: Accepted for Stage 2 language-scoped caption acquisition.

## Evidence Reviewed

- `docs/plans/2026-05-04-stage-youtube-channel-language-scoped-caption-acquisition.md`
- `docs/plans/reports/2026-05-04-youtube-channel-language-scoped-caption-acquisition-report.md`
- `packages/source-adapters/src/youtubeAdapter.ts`
- `packages/application/src/ensureTranscriptUseCase.ts`
- `packages/application/src/syncChannelCaptionsUseCase.ts`
- `scripts/ops/verify-stage2-caption-batch.ts`

## Verification Run By Codex

```bash
npx tsx scripts/ops/verify-stage2-caption-batch.ts
npm run typecheck
npm run build
```

Results:

```text
Stage 2 caption batch verification passed.
```

`npm run typecheck` passed across workspaces.

`npm run build` passed across workspaces.

Codex also ran a default single-video smoke to verify bilingual / machine-translation behavior was preserved:

```bash
tmpdir=$(mktemp -d)
DATA_DIR="$tmpdir" npm run -s cli -- source add 'https://www.youtube.com/watch?v=N_hNCnh1dxs' --json
DATA_DIR="$tmpdir" npm run -s cli -- transcript ensure yt-N_hNCnh1dxs --json
find "$tmpdir/sources" -path '*/captions/zh-Hans/*' -type f | sort
find "$tmpdir/sources" -path '*/translation/*' -type f | sort
```

Observed bilingual assets:

```text
captions/zh-Hans/document.md
captions/zh-Hans/transcript-raw.json
captions/zh-Hans/transcript-sentences.json
captions/zh-Hans/transcript.vtt
translation/document.zh-Hans.md
translation/translation-manifest.json
```

## Accepted Fixes

- `channel captions <channelId> --language en --limit 2 --json` now runs English-only at the adapter acquisition layer.
- The verification script asserts there are no `zh-Hans` request logs in English-only channel mode.
- English-only channel mode persists English caption assets and primary transcript/document assets.
- English-only channel mode does not persist `captions/zh-Hans/*`, `translation/*`, audio, or media assets.
- Default `transcript ensure <sourceId>` still preserves bilingual / machine-translation behavior.
- Typecheck and build pass.

## Remaining Follow-ups

- Before Stage 3 greedy sync, add a fake-adapter or fixture test proving missing-caption failures are recorded per video while the batch continues.
- Consider validating CLI `--language` values so unsupported values fail early instead of flowing through as adapter language options.
- Greedy sync should remain bounded, resumable, and checkpointed; do not reuse Stage 2 directly as an unbounded full-channel command.

## Decision

Stage 2 language-scoped caption acquisition is accepted. The project may now plan Stage 3 greedy/resumable English-caption sync, with missing-caption failure verification as a prerequisite.
