# Stage 1 Hardening: YouTube Channel Capture and Video Manifest

Date: 2026-05-04

Owner: Gemini

Reviewer: Codex

Status: Ready for Gemini

Report path:

```text
docs/plans/reports/2026-05-04-youtube-channel-capture-hardening-report.md
```

## Goal

Fix the Stage 1 YouTube channel capture implementation so it is safe and verifiable for the target use case:

```text
https://www.youtube.com/@SpeakEnglishWithVanessa
```

Stage 1 remains metadata/video-manifest only. It must not fetch captions or download videos.

## Blocking Audit

Address every P0/P1 finding in:

```text
docs/plans/reports/2026-05-04-codex-audit-youtube-channel-capture-stage-1.md
```

## Decisions To Follow

- `AGENTS.md`
- `docs/plans/2026-05-04-youtube-channel-greedy-english-captions-youglish-roadmap.md`
- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/decision-rules.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`

## Non-goals

- Do not implement Stage 2 caption acquisition.
- Do not download YouTube video or audio.
- Do not add the Youglish-like search UI.
- Do not add broad helper, service, manager, or utils modules.
- Do not leave ad hoc test scripts that import package source files directly.

## Target Files

Expected files to update:

- `docs/plans/2026-05-04-stage-youtube-channel-capture-and-video-manifest.md`
- `packages/source-adapters/src/youtubeAdapter.ts` or a specifically named YouTube channel adapter file
- `packages/application/src/captureChannelUseCase.ts`
- `packages/storage/src/index.ts`
- `apps/cli/src/commands/channel-command.ts`
- `packages/domain/src/index.ts` if the channel manifest contract needs partial/checkpoint fields

Expected cleanup:

- Remove `scripts/test-channel.ts` unless it is replaced by a properly planned and named verification entrypoint.
- Do not include generated `tsconfig.tsbuildinfo` churn in the intended patch.

## Required Behavior

Channel capture must support a bounded first pass.

Minimum acceptable CLI behavior:

```bash
npm run -s cli -- channel add 'https://www.youtube.com/@SpeakEnglishWithVanessa' --limit 20 --json
```

The command should:

- resolve a stable channel identity,
- write `data/channels/youtube-{channelId}/channel-manifest.json`,
- write `data/channels/youtube-{channelId}/videos.json`,
- include exactly the bounded video list for `--limit 20`, or fewer only if the adapter truthfully reports fewer available videos,
- mark whether the manifest is complete or partial,
- avoid captions, audio, and video download.

If the adapter cannot support reliable full-channel enumeration in one call, that is acceptable for Stage 1. The important behavior is bounded, resumable manifest acquisition that does not hang on large channels.

## Acceptance Criteria

- `channel add <url> --limit 20 --json` succeeds for the Vanessa channel in a temporary `DATA_DIR`.
- Generated manifest has stable `id`, `platform: "youtube"`, original `url`, `title`, and `capturedAt`.
- Generated `videos.json` contains video records with `id`, `videoId`, `title`, and `url`.
- Re-running the same command updates without duplicate records and preserves appropriate prior metadata.
- No captions, audio, or video files are created.
- CLI JSON mode emits parseable JSON without human progress logs polluting stdout.
- Stage plan contains reviewer, target files, verification commands, and report path.
- Gemini report includes exact commands, key output, generated files, counts, and unresolved risks.

## Verification Commands

Use an isolated data root:

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

If any command is skipped, the report must state why.
