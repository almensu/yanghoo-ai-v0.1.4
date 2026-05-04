# Stage 2: YouTube Channel English Caption Batch Acquisition

Date: 2026-05-04
Owner: Gemini
Reviewer: Codex
Status: In Progress

## Goal
- Take the first small batch of channel videos and persist English captions.

## Acceptance Criteria
- Batch size is configurable via CLI (e.g., `--limit`), with a safe default such as 10 or 20.
- Each video processes creates or updates `data/sources/yt-{videoId}` via the standard `captureSourceUseCase` and `ensureTranscriptUseCase` or equivalent workflow.
- Available English captions generate raw, VTT, transcript, sentence, and document assets using existing transcript pipelines.
- Missing captions are recorded truthfully (e.g. `transcriptStatus: 'failed'` or explicitly handled).
- One failed video does not fail the whole batch (error boundary per video).
- No YouTube video media is downloaded (handled by specifying caption-only paths or skipping media download).

## Decisions to Follow
- Use existing `captureSourceUseCase` logic internally, but adapt for batching.
- The command should be `channel captions <channelId>` or similar. The roadmap suggested:
  `npm run -s cli -- channel captions youtube-{channelId} --language en --limit 20 --json`
- Must not use short-video media downloads.

## Target Files
- `packages/application/src/syncChannelCaptionsUseCase.ts` (new)
- `packages/application/src/index.ts` (export new use case)
- `apps/cli/src/commands/channel-command.ts` (add `captions` subcommand)

## Verification Commands
```bash
tmpdir=$(mktemp -d)
DATA_DIR="$tmpdir" npm run -s cli -- channel add 'https://www.youtube.com/@SpeakEnglishWithVanessa' --limit 5 --json
DATA_DIR="$tmpdir" npm run -s cli -- channel captions youtube-UCxJGMJbjokfnr2-s4_RXPxQ --language en --limit 5 --json
# Verify that source directories were created
find "$tmpdir/sources" -maxdepth 1 | wc -l
# Verify caption files
find "$tmpdir/sources" -name "transcript-sentences.json" | wc -l
npm run typecheck
npm run build
rm -rf "$tmpdir"
```

## Report Path
`docs/plans/reports/2026-05-04-youtube-channel-english-caption-batch-report.md`
