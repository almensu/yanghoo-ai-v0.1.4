# Codex Audit: YouTube Channel Capture Hardening

Date: 2026-05-04

Reviewer: Codex

Result: Not accepted. Do not proceed to Stage 2 yet.

## Evidence Reviewed

- `docs/plans/2026-05-04-stage-youtube-channel-capture-hardening.md`
- `docs/plans/reports/2026-05-04-youtube-channel-capture-hardening-report.md`
- `apps/cli/src/commands/channel-command.ts`
- `packages/application/src/captureChannelUseCase.ts`
- `packages/domain/src/index.ts`
- `packages/source-adapters/src/youtubeAdapter.ts`
- generated verification helpers in the worktree

## Reproduction

Codex reran the hardening smoke test with an isolated data root:

```bash
tmpdir=$(mktemp -d)
DATA_DIR="$tmpdir" npm run -s cli -- channel add 'https://www.youtube.com/@SpeakEnglishWithVanessa' --limit 20 --json > "$tmpdir/out.json"
node -e "const fs=require('fs'); JSON.parse(fs.readFileSync(process.argv[1],'utf8')); console.log('ok')" "$tmpdir/out.json"
find "$tmpdir" -maxdepth 5 -type f | sort
cat "$tmpdir"/channels/*/channel-manifest.json
node -e "const fs=require('fs'); const p=process.argv[1]; const xs=JSON.parse(fs.readFileSync(p,'utf8')); console.log(xs.length); console.log(JSON.stringify(xs[0]));" "$tmpdir"/channels/*/videos.json
find "$tmpdir" -type f | grep -E 'caption|transcript|audio|media' || true
```

Observed result:

```json
{
  "manifest": {
    "id": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
    "platform": "youtube",
    "url": "https://www.youtube.com/@SpeakEnglishWithVanessa",
    "title": "Speak English With Vanessa",
    "capturedAt": "2026-05-04T02:32:38.782Z",
    "isPartial": true
  },
  "videosCount": 60
}
```

Generated files:

```text
channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/channel-manifest.json
channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/videos.json
```

`videos.json` contained 60 records, not 20.

No caption, transcript, audio, or media files were generated.

## Findings

### P0: `--limit 20` does not bound the persisted video list to 20

The hardening plan required:

```text
include exactly the bounded video list for --limit 20
```

Codex observed `videosCount: 60` and `videos.json` length `60` after running `--limit 20`.

`packages/source-adapters/src/youtubeAdapter.ts` uses `yt-dlp --playlist-end 20`, but channel URLs can emit multiple playlist/tab streams, so this does not guarantee a final bounded persisted list. The application or adapter must enforce the limit after parsing and before persistence.

Required fix:

- Apply the requested limit to the final normalized `ChannelVideo[]` before saving.
- Deduplicate by `videoId`.
- Add report evidence that `videos.json` length is exactly 20 for `--limit 20`.

### P1: Report claims log cleanup that is not reflected in the code

The Gemini report says diagnostic logs were removed from `youtubeAdapter.ts`, but the current diff still includes:

```ts
console.log(`[YouTubeAdapter] Capturing channel: ${url}`);
```

During Codex verification, diagnostic lines such as `ARGS:` and `Time taken:` also appeared in command output. They did not pollute the redirected JSON stdout in this run, but the report does not match the code state.

Required fix:

- Remove or route adapter diagnostics through a proper logger that respects JSON mode.
- Update the report to match actual code and observed output.

### P1: Temporary verification files remain in the worktree

The original audit asked to remove ad hoc test scripts. `scripts/test-channel.ts` appears removed, but new temporary files remain:

```text
scripts/verify-hardening.sh
test-exec.js
```

These are not part of the hardening plan's target files and should not remain unless explicitly promoted into a planned verification entrypoint.

Required fix:

- Remove temporary verification files, or document and name them as official scripts in the stage plan.

### P1: No automated test surface was added

The hardening plan allowed scripted verification, but this feature still touches network, subprocess execution, and file writes. The report does not include application/storage tests with fake adapters or temp dirs.

Required fix:

- At minimum, provide a repeatable scripted verification that enforces assertions, including `videos.length === 20`.
- Prefer adding focused tests for CLI option parsing, limit normalization, storage writes, and malformed URL rejection.

## Accepted Parts

- The target channel no longer times out in bounded mode.
- JSON stdout is parseable in the reproduced `--json` run.
- Channel manifest and videos files are written to the isolated data root.
- No caption, transcript, audio, or media assets were created during the smoke test.

## Decision

Stage 1 hardening is close but not accepted. Fix the final limit enforcement and cleanup/report drift before moving to Stage 2 caption acquisition.
