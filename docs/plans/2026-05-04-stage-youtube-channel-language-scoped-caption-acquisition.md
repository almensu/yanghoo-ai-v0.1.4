# Stage 2 Follow-up: YouTube Channel Language-scoped Caption Acquisition

Date: 2026-05-04

Owner: Gemini

Reviewer: Codex

Status: Ready for Gemini

Report path:

```text
docs/plans/reports/2026-05-04-youtube-channel-language-scoped-caption-acquisition-report.md
```

## Goal

Keep the existing bilingual / machine-translation capability, but make channel batch caption acquisition respect the requested language at the adapter acquisition layer.

The current product boundary is:

```text
transcript ensure <sourceId>
  default behavior may keep bilingual acquisition:
  en + zh-Hans / YouTube machine translation

channel captions <channelId> --language en
  English-learning batch mode:
  fetch English only
  persist English only
  do not request zh-Hans
  do not trigger YouTube machine translation

future explicit bilingual mode
  may request en + zh-Hans deliberately
```

This follow-up is not about removing machine translation. It is about avoiding accidental Chinese-caption requests when the user explicitly asks for English-only channel acquisition.

## Blocking Audit

Address the P0 finding in:

```text
docs/plans/reports/2026-05-04-codex-audit-youtube-channel-english-caption-batch-follow-up.md
```

## Decisions To Follow

- `AGENTS.md`
- `docs/plans/2026-05-04-youtube-channel-greedy-english-captions-youglish-roadmap.md`
- `docs/plans/2026-05-04-stage-youtube-channel-english-caption-batch.md`
- `docs/plans/2026-05-02-youtube-bilingual-captions-machine-translation.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/decision-rules.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`

## Non-goals

- Do not remove `zh-Hans` or machine-translation support globally.
- Do not remove bilingual behavior from the default single-video `transcript ensure <sourceId>` path unless explicitly required by another plan.
- Do not implement full Stage 3 greedy resume/checkpoint/reporting.
- Do not download YouTube video, audio, or media.
- Do not rebuild the reader or Youglish-like UI.

## Target Files

Expected files:

- `packages/source-adapters/src/youtubeAdapter.ts`
- `packages/application/src/ensureTranscriptUseCase.ts`
- `packages/application/src/syncChannelCaptionsUseCase.ts`
- `scripts/ops/verify-stage2-caption-batch.ts`
- `docs/plans/reports/2026-05-04-youtube-channel-language-scoped-caption-acquisition-report.md`

Only update other files if necessary, and explain why in the report.

## Required Behavior

### English-only Channel Mode

This command:

```bash
npm run -s cli -- channel captions youtube-UCxJGMJbjokfnr2-s4_RXPxQ --language en --limit 2 --json
```

must:

- fetch only English caption variants,
- persist only English caption assets,
- create no `captions/zh-Hans/*`,
- create no `translation/*`,
- create no audio/media assets,
- produce no logs showing a `zh-Hans` caption request,
- keep `captions-manifest.json` scoped to `requestedLanguages: ["en"]`.

### Default / Bilingual Capability

The existing machine-translation capability must remain available.

At minimum, verify that the default or explicit bilingual path still has a way to request `zh-Hans`. Acceptable surfaces:

- existing `transcript ensure <sourceId>` default behavior still requests `en` and `zh-Hans`, or
- a documented explicit call path such as `ensureTranscriptUseCase(sourceId, { language: 'zh-Hans' })`, or
- a planned CLI mode such as `channel captions <channelId> --language bilingual`.

Do not claim bilingual support is preserved unless the report states the exact path and command/API used.

## Implementation Guidance

Prefer adding a language-scoped adapter API instead of filtering only after acquisition.

Examples:

```ts
youtubeAdapter.fetchTranscriptBundle(videoId, { languages: ['en'] })
youtubeAdapter.fetchTranscriptBundle(videoId, { languages: ['en', 'zh-Hans'] })
youtubeAdapter.fetchTranscriptVariant(videoId, 'en')
```

Then `ensureTranscriptUseCase(sourceId, { language: 'en' })` should pass the English-only request to the adapter.

The adapter should not call `fetchCaptionVariant(..., 'zh-Hans')` when only English is requested.

## Acceptance Criteria

- `channel captions --language en --limit 2 --json` passes with exactly 2 successes on the Vanessa channel.
- English assets exist for each processed source:
  - `captions/en/transcript-raw.json`
  - `captions/en/transcript-sentences.json`
  - `captions/en/transcript.vtt`
  - `captions/en/document.md`
  - root `transcript-raw.json`
  - root `transcript-sentences.json`
  - root `transcript.vtt`
  - root `document.md`
- No `captions/zh-Hans/*`, `translation/*`, audio, or media files exist in the English-only smoke test.
- Verification proves no `zh-Hans` caption request is made in English-only mode. Use one of:
  - captured stderr/stdout assertion with no `zh-Hans` request logs,
  - adapter-level unit/contract test with a fake fetch function and request counter,
  - explicit instrumentation in the verification script.
- Bilingual/machine-translation capability remains available and is documented in the report.
- `npm run typecheck` passes.
- `npm run build` passes.

## Verification Commands

```bash
npx tsx scripts/ops/verify-stage2-caption-batch.ts
npm run typecheck
npm run build
```

The verification script must fail if English-only mode attempts `zh-Hans`, creates `captions/zh-Hans`, creates `translation`, or creates audio/media assets.

## Report Requirements

Gemini report must include:

- changed files,
- exact commands run,
- key output,
- generated file list or verified file classes,
- evidence that English-only mode did not request `zh-Hans`,
- evidence that machine-translation capability was not removed,
- unresolved risks,
- skipped commands with reasons.
