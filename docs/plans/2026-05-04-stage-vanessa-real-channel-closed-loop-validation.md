# Stage 4.5 Plan: Vanessa Real Channel Closed-loop Validation

Date: 2026-05-04
Owner: Codex
Executor: Gemini
Status: Ready for execution

## Context

Stages 1 through 4 are accepted:

- Stage 1: YouTube channel capture and video manifest hardening.
- Stage 2: English-only channel caption acquisition without breaking default bilingual machine translation.
- Stage 3: greedy English caption sync with resume, retry, checkpoint, and report.
- Stage 4: English sentence JSONL index and CLI search.

Before building a Youglish-like UI, the project needs one real-channel closed-loop proof:

```text
Vanessa channel URL
-> channel manifest
-> bounded English caption sync
-> English sentence index
-> searchable timestamped sentence results
```

Target channel:

```text
https://www.youtube.com/@SpeakEnglishWithVanessa
```

Reference guidance used:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/review-checklists/ai-output-review.md`
- `docs/GOTCHAS.md`

## Goal

Run a bounded real-data validation on the Vanessa YouTube channel and prove that the accepted Stage 1-4 pipeline works end to end on local disk.

The goal is evidence, not new architecture.

## Non-goals

- Do not build UI.
- Do not add new product features unless the existing accepted commands cannot run.
- Do not perform unbounded full-channel sync.
- Do not download YouTube video, audio, or media.
- Do not run MLX Audio transcription.
- Do not request or persist `zh-Hans` in English-only channel mode.
- Do not generate translations in this validation.
- Do not remove or weaken the existing single-video machine translation feature.
- Do not rewrite Stage 1-4 modules for style.

## Operating Rules

Use the accepted CLI flows unless a real bug blocks validation.

Expected command shape:

```bash
npm run -s cli -- channel add "https://www.youtube.com/@SpeakEnglishWithVanessa" --limit 50 --json
npm run -s cli -- channel captions <channelId> --language en --batch-size 10 --resume --json
npm run -s cli -- channel captions <channelId> --language en --batch-size 10 --resume --json
npm run -s cli -- sentence-index build --channel <channelId> --language en --json
npm run -s cli -- sentence-index search "would have" --channel <channelId> --language en --limit 10 --json
```

Gemini may use a smaller bound if network/rate limits require it, but must document the reason. Preferred minimum is:

- channel manifest limit: 20 or more,
- caption sync attempts: at least 10 videos total,
- indexed successful sources: at least 3 if captions are available.

## Data Scope

Canonical data locations:

```text
data/channels/{channelId}/channel-manifest.json
data/channels/{channelId}/videos.json
data/channels/{channelId}/sync-checkpoint.json
data/channels/{channelId}/caption-sync-report.json
data/sources/yt-{videoId}/captions/en/
data/indexes/{channelId}/english-sentences.jsonl
data/indexes/{channelId}/english-sentences-manifest.json
```

Forbidden validation side effects:

```text
data/sources/yt-{videoId}/captions/zh-Hans/
data/sources/yt-{videoId}/translation/
data/sources/yt-{videoId}/audio.*
data/sources/yt-{videoId}/media.*
```

If any forbidden assets appear during this validation, stop and report the exact command that caused them.

## Required Evidence

Gemini's report must include:

- resolved `channelId`,
- channel title,
- `videos.json` count,
- number of caption sync invocations,
- total attempted videos,
- successes,
- skipped,
- failures,
- failure kinds if any,
- generated English caption source directories,
- index manifest path,
- index source count,
- index sentence count,
- search query results for at least 3 queries,
- proof no `zh-Hans`, `translation`, audio, or media assets were produced by English-only validation,
- exact commands run and summarized key output.

Recommended search queries:

```text
would have
because
kind of
I mean
pronunciation
```

At least 3 should be run. If a query has no hits, that is acceptable, but the report must show the zero-result evidence.

## Acceptance Criteria

- Channel add resolves a stable Vanessa channel id and writes `channel-manifest.json`.
- `videos.json` contains at least 20 videos unless network/channel limits block it.
- Caption sync attempts at least 10 videos total across bounded batches.
- One failed video does not stop validation.
- `caption-sync-report.json` records per-video statuses.
- At least 3 videos produce English caption sentence assets, unless the report proves the channel/API currently prevents this.
- English-only validation does not create `zh-Hans`, `translation`, audio, or media assets.
- Sentence index build writes `english-sentences.jsonl`.
- Sentence index build writes `english-sentences-manifest.json`.
- Index manifest `sentenceCount` is greater than 0.
- Search returns timestamped JSON results for at least one query.
- Search results include `youtubeTimestampUrl`.
- `npm run typecheck` passes.
- `npm run build` passes.

## Verification Commands

Gemini should run a real-data verification script if practical:

```bash
npx tsx scripts/ops/verify-stage45-vanessa-closed-loop.ts
```

If implementing a script would take longer than the validation itself, Gemini may run the CLI commands manually, but the report must include exact commands and key output.

Always run:

```bash
npm run typecheck
npm run build
```

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-04-vanessa-real-channel-closed-loop-report.md
```

The report must separate:

- real network/data results,
- local filesystem evidence,
- skipped checks and reasons,
- unresolved risks.

## Codex Audit Checklist

Codex should reject the report if:

- the validation used mock data while claiming real Vanessa results,
- caption sync was unbounded,
- English-only validation created `zh-Hans`, translation, audio, or media assets,
- index search scanned source transcripts instead of using the built index,
- the report omits exact commands,
- the report omits generated file evidence,
- build/typecheck were skipped without a concrete blocker,
- the existing machine translation feature was removed or disabled globally.
