# Codex Audit: YouTube Channel English Caption Batch

Date: 2026-05-04

Reviewer: Codex

Result: Not accepted. Do not proceed to greedy/full-channel caption sync yet.

## Evidence Reviewed

- `docs/plans/2026-05-04-stage-youtube-channel-english-caption-batch.md`
- `docs/plans/reports/2026-05-04-youtube-channel-english-caption-batch-report.md`
- `packages/application/src/syncChannelCaptionsUseCase.ts`
- `apps/cli/src/commands/channel-command.ts`
- `scripts/ops/verify-stage2.sh`
- Generated files from a fresh isolated `DATA_DIR` smoke test

## Verification Run By Codex

Codex ran a smaller real smoke test to limit network cost:

```bash
tmpdir=$(mktemp -d)
DATA_DIR="$tmpdir" npm run -s cli -- channel add 'https://www.youtube.com/@SpeakEnglishWithVanessa' --limit 1 --json > "$tmpdir/add.json"
DATA_DIR="$tmpdir" npm run -s cli -- channel captions youtube-UCxJGMJbjokfnr2-s4_RXPxQ --language en --limit 1 --json > "$tmpdir/captions.json"
find "$tmpdir" -maxdepth 5 -type f | sort
find "$tmpdir/sources" -name transcript-sentences.json | wc -l
find "$tmpdir/sources" -path '*/captions/zh-Hans/*' -type f | sort
npm run typecheck
npm run build
```

Observed command result:

```json
{
  "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
  "processed": 1,
  "success": ["N_hNCnh1dxs"],
  "failed": []
}
```

`npm run typecheck` passed.

`npm run build` passed.

## Findings

### P0: `--language en` is accepted but ignored

The Stage 2 command accepts:

```bash
channel captions <channelId> --language en --limit 1
```

But `packages/application/src/syncChannelCaptionsUseCase.ts` passes only `source.id` to `ensureTranscriptUseCase(source.id)`. The requested language is not used to constrain transcript acquisition.

In the Codex smoke test, the logs showed:

```text
Loading en transcript from InnerTube URL
Loading zh-Hans transcript from InnerTube URL
```

The resulting manifest also recorded:

```json
"requestedLanguages": ["en", "zh-Hans"]
```

This violates the Stage 2 scope, which is small-batch English caption acquisition. It also makes the command more expensive and more rate-limit-prone than requested.

Required fix:

- Make `--language en` actually request/persist English-only caption assets for this Stage 2 command.
- If `ensureTranscriptUseCase` currently always performs bilingual acquisition, add an application-level option or a separate English-only channel caption path.
- Stage 2 must not create `captions/zh-Hans/*` or `translation/*` when invoked with `--language en`.

### P0: English-only verification fails by inspection

The Codex smoke test with `--language en --limit 1` generated these files:

```text
sources/yt-N_hNCnh1dxs/captions/zh-Hans/document.md
sources/yt-N_hNCnh1dxs/captions/zh-Hans/transcript-raw.json
sources/yt-N_hNCnh1dxs/captions/zh-Hans/transcript-sentences.json
sources/yt-N_hNCnh1dxs/captions/zh-Hans/transcript.vtt
sources/yt-N_hNCnh1dxs/translation/document.zh-Hans.md
sources/yt-N_hNCnh1dxs/translation/translation-manifest.json
```

These assets are outside the English-only Stage 2 acceptance path.

Required fix:

- Add explicit verification that no `captions/zh-Hans`, `translation`, `audio`, or `media` assets exist after an English-only channel caption sync.

### P1: Verification script is too weak

`scripts/ops/verify-stage2.sh` only prints counts:

```bash
find "$tmpdir/sources" -maxdepth 1 | wc -l
find "$tmpdir/sources" -name "transcript-sentences.json" | wc -l
```

It does not assert:

- JSON output parses,
- processed/success/failed counts match expectations,
- exactly the requested number of source directories exists,
- English caption assets exist for each source,
- no zh-Hans/translation/audio/media assets exist for `--language en`,
- no duplicate source IDs were produced.

Required fix:

- Replace the shell script with a proper assertion script, similar to `scripts/ops/verify-channel-capture-hardening.ts`, or add assertions to the script.

### P1: Missing-caption behavior is not actually verified

The report marks "Missing captions recorded truthfully" as passed, but the evidence uses five successful Vanessa videos and `failed: []`. That does not prove the failure path.

Required fix:

- Add a fixture/fake-adapter test or a controlled source in which `ensureTranscriptUseCase` fails, then prove the channel batch records the failure and continues.
- If a real no-caption YouTube video is used, state the exact ID and generated failure manifest/report.

### P2: Stage 2 includes unrelated storage deletion changes

The report includes a change to `packages/storage/src/index.ts` for orphan directory deletion. That is not part of the Stage 2 caption batch target files or acceptance criteria.

Required fix:

- Separate unrelated storage deletion work into its own report/plan, or clearly mark it as pre-existing and outside the Stage 2 acceptance scope.

### P2: Use case imports through package index

`packages/application/src/syncChannelCaptionsUseCase.ts` imports use cases from `./index.js`. This can create avoidable module cycles because `index.ts` exports the new use case.

Required fix:

- Prefer direct imports from concrete use case modules where available, or document why the current package shape forces this import.

## Accepted Parts

- Batch command exists as `channel captions <channelId> --language en --limit N`.
- Per-video try/catch boundaries exist, so one failed video should not stop the loop.
- A real `--limit 1` smoke test created a source directory and English transcript assets.
- No media/audio files were created in the Codex smoke test.
- `npm run typecheck` and `npm run build` pass.

## Decision

Stage 2 is close but not accepted. Fix language scoping first: `--language en` must be English-only and must not request or persist zh-Hans/translation assets. Then rerun verification with explicit assertions before moving to greedy/full-channel sync.
