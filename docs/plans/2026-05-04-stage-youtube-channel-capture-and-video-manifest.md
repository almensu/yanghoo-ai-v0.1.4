# Stage 1: YouTube Channel Capture and Video Manifest

Date: 2026-05-04
Owner: Codex
Reviewer: Gemini
Status: Implementation Completed

## Goal
- Accept a YouTube channel URL (e.g., `https://www.youtube.com/@SpeakEnglishWithVanessa`).
- Resolve a stable channel identity.
- Persist channel metadata and video inventory.
- Ensure the capture can be bounded (`--limit`) to prevent infinite hangs.

## Acceptance Criteria
- Channel URL is treated as a channel source, not a single video.
- `channel-manifest.json` and `videos.json` are written to `data/channels/youtube-{channelId}/`.
- Re-running the same channel capture updates the manifest without duplicating records.
- No captions or videos are downloaded in this stage.
- The `channel add` command accepts a `--limit` flag to safely test and perform partial updates.
- Output JSON mode should be pure without mixed logging, protecting parsable streams.
- The target test target `https://www.youtube.com/@SpeakEnglishWithVanessa` works without timing out.

## Architecture & Layer Placement
- `packages/domain`: Added `ChannelManifest` and `ChannelVideo` interfaces with `isPartial` field.
- `packages/source-adapters`: Added channel resolution and video listing logic to `YouTubeSourceAdapter`.
- `packages/storage`: Added `channelStorage` capability to read/write `channel-manifest.json` and `videos.json`.
- `packages/application`: Created `captureChannelUseCase` application use case.
- `apps/cli`: Added `channel add` command.

## Decisions To Follow
- `AGENTS.md`
- `docs/plans/2026-05-04-youtube-channel-greedy-english-captions-youglish-roadmap.md`
- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/decision-rules.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`

## Target Files
- `docs/plans/2026-05-04-stage-youtube-channel-capture-and-video-manifest.md`
- `packages/domain/src/index.ts`
- `packages/storage/src/index.ts`
- `packages/source-adapters/src/youtubeAdapter.ts`
- `packages/application/src/captureChannelUseCase.ts`
- `packages/application/src/index.ts`
- `apps/cli/src/commands/channel-command.ts`
- `apps/cli/src/cli-command-registry.ts`

## Verification Commands
```bash
tmpdir=$(mktemp -d)
DATA_DIR="$tmpdir" npm run -s cli -- channel add 'https://www.youtube.com/@SpeakEnglishWithVanessa' --limit 20 --json
find "$tmpdir" -maxdepth 5 -type f | sort
cat "$tmpdir"/channels/*/channel-manifest.json
node -e "const fs=require('fs'); const p=process.argv[1]; const xs=JSON.parse(fs.readFileSync(p,'utf8')); console.log(xs.length); console.log(JSON.stringify(xs[0]));" "$tmpdir"/channels/*/videos.json
find "$tmpdir" -type f | grep -E 'caption|transcript|audio|media' && exit 1 || true
npm run typecheck
npm run build
```

## Report Path
`docs/plans/reports/2026-05-04-youtube-channel-capture-hardening-report.md`
