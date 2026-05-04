# Codex Audit: YouTube Channel Capture Stage 1

Date: 2026-05-04

Reviewer: Codex

Result: Not accepted. Do not proceed to Stage 2 until the blocking issues below are fixed and reported.

## Evidence Reviewed

- `docs/plans/2026-05-04-youtube-channel-greedy-english-captions-youglish-roadmap.md`
- `docs/plans/2026-05-04-stage-youtube-channel-capture-and-video-manifest.md`
- `packages/domain/src/index.ts`
- `packages/domain/src/storage.ts`
- `packages/application/src/captureChannelUseCase.ts`
- `packages/source-adapters/src/youtubeAdapter.ts`
- `packages/storage/src/index.ts`
- `apps/cli/src/cli-command-registry.ts`
- `apps/cli/src/commands/channel-command.ts`
- `scripts/test-channel.ts`

Verification run:

```bash
npm run typecheck
npm run build
```

Both passed.

Real smoke test with isolated data root:

```bash
tmpdir=$(mktemp -d)
DATA_DIR="$tmpdir" npm run -s cli -- channel add 'https://www.youtube.com/@SpeakEnglishWithVanessa' --json
```

Result:

```json
{
  "ok": false,
  "error": "yt-dlp channel capture failed: spawnSync yt-dlp ETIMEDOUT"
}
```

No `channel-manifest.json` or `videos.json` evidence was produced by this smoke test.

## Findings

### P0: Target channel capture does not complete within the adapter timeout

`packages/source-adapters/src/youtubeAdapter.ts:632` runs a blocking `execFileSync('yt-dlp', ...)` with a 300 second timeout for the whole channel. The required target channel, `https://www.youtube.com/@SpeakEnglishWithVanessa`, timed out in the Stage 1 smoke test.

This fails the Stage 1 acceptance criteria because the system did not write `channel-manifest.json` or `videos.json` for the target channel. It also creates a poor foundation for Stage 2 because large channels are exactly the primary use case.

Required fix:

- Make channel capture incremental or bounded.
- Add a small default `--limit` or page/batch mode for initial manifest capture.
- Persist partial progress only when the result is structurally valid and explicitly marked partial.
- Provide a real smoke result for the target channel or a clearly documented smaller fixture plus a target-channel bounded run.

### P0: Stage 1 lacks the required Gemini completion report

There is no new report under `docs/plans/reports/` for this implementation. The repository workflow requires Gemini reports to state changed files, exact commands, outputs, generated files, unresolved risks, and skipped commands.

Required fix:

- Gemini must write a completion report before Codex can accept the stage.
- The report must include generated channel file paths and key JSON fields, not just build/typecheck output.

### P1: Temporary test script should not be left as a production-facing script

`scripts/test-channel.ts:1` imports directly from `../packages/source-adapters/src/youtubeAdapter.js` and hard-codes the Vanessa channel. This bypasses package boundaries and creates an ad hoc script outside the planned CLI/application use case.

Required fix:

- Remove `scripts/test-channel.ts`, or replace it with a properly named script only if a later plan explicitly calls for it.
- Verification should use the CLI or tests, not a source-file import script.

### P1: The stage plan is incomplete for execution governance

`docs/plans/2026-05-04-stage-youtube-channel-capture-and-video-manifest.md` has no reviewer, decisions to follow, target files, verification commands, or expected report path. This falls below the repo's stage plan rules.

Required fix:

- Update the stage plan with the standard sections before the next Gemini pass.

### P1: No explicit tests were added for high-risk behavior

The implementation adds network access, file writes, subprocess execution, and long-running channel automation, but no test files were added. Build/typecheck are necessary but not enough for this feature.

Required fix:

- Add at least application/storage tests using fake adapters and temp directories, or record why the test harness is not yet available and provide equivalent scripted verification.
- Add negative coverage for malformed channel URLs and failed adapter calls.

### P2: Worktree includes generated build metadata and unrelated changes

The current worktree includes multiple `tsconfig.tsbuildinfo` changes and unrelated changes such as `packages/application/src/deleteSourceUseCase.ts` and `docs/GOTCHAS.md`. These may be valid from another task, but they are not part of the Stage 1 channel-capture scope.

Required fix:

- Gemini's report must separate Stage 1 changes from unrelated pre-existing or parallel changes.
- Do not include generated build metadata in the intended patch unless the repo explicitly tracks those files.

## Accepted Parts

- Domain has initial `ChannelManifest` and `ChannelVideo` shapes.
- Storage has initial channel manifest/video read-write methods.
- CLI has a thin `channel add` entrypoint.
- `npm run typecheck` and `npm run build` pass.

## Decision

Stage 1 is not stable enough to hand off to Stage 2. The next task should be a Stage 1 hardening/fix task focused on bounded channel capture, report discipline, temporary script cleanup, and verification evidence.
