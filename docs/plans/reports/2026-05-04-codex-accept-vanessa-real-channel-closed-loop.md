# Codex Acceptance Audit: Stage 4.5 Vanessa Real Channel Closed-loop Validation

Date: 2026-05-04
Reviewer: Codex
Gemini report: `docs/plans/reports/2026-05-04-vanessa-real-channel-closed-loop-report.md`
Plan: `docs/plans/2026-05-04-stage-vanessa-real-channel-closed-loop-validation.md`
Decision: Accepted

## Scope Reviewed

This audit reviewed the real-data closed-loop validation for:

```text
https://www.youtube.com/@SpeakEnglishWithVanessa
```

Files and generated artifacts checked:

- `data/channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/channel-manifest.json`
- `data/channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/videos.json`
- `data/channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/sync-checkpoint.json`
- `data/channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/caption-sync-report.json`
- `data/indexes/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/english-sentences.jsonl`
- `data/indexes/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/english-sentences-manifest.json`
- the 20 source directories listed in Gemini's report

Reference guidance considered:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/review-checklists/ai-output-review.md`
- `docs/GOTCHAS.md`

## Verification Run by Codex

Codex checked local JSON artifacts directly and reran:

```bash
npm run typecheck
npm run build
```

Both commands passed.

Codex also reran search smoke checks for:

- `would have`
- `because`
- `kind of`
- `I mean`
- `pronunciation`

Each query returned timestamped JSON results with `youtubeTimestampUrl`.

## Evidence Confirmed

Channel:

- `channelId`: `youtube-UCxJGMJbjokfnr2-s4_RXPxQ`
- title: `Speak English With Vanessa`
- `videos.json`: 30 entries
- `isPartial`: true

Caption sync:

- checkpoint `nextIndex`: 20
- checkpoint `processed`: 20
- checkpoint `succeeded`: 20
- checkpoint `failed`: 0
- checkpoint `skipped`: 0
- caption sync report items: 20
- report status counts: 20 `success`

Index:

- manifest `sourceCount`: 20
- manifest `sentenceCount`: 3246
- manifest `skippedCount`: 10
- manifest `failedCount`: 0
- JSONL row count: 3246
- manifest `warnings`: none

Side effects:

- Forbidden asset scan over the 20 validation-created sources found 0 matches for:
  - `captions/zh-Hans/`
  - `translation/`
  - `audio.*`
  - `media.*`
- Each validation-created `captions-manifest.json` has exactly one variant: `en`.

## Acceptance Findings

No blocking findings remain.

The real-data loop is proven:

```text
Vanessa channel URL
-> channel manifest and videos.json
-> 20 English caption source assets
-> English sentence index
-> timestamped search results
```

The validation stayed within the English-learning channel boundary:

- no Chinese caption acquisition,
- no translation generation,
- no audio/media download,
- no MLX transcription.

The existing machine translation feature is not removed; the validation only proves English-only channel mode avoids translation side effects.

## Residual Risks

- This validation did not exercise real missing-caption or rate-limit failures because all 20 attempted videos succeeded. Stage 3 fixture coverage remains the proof for retry/failure behavior.
- The channel manifest is partial by design. Full-channel greedy sync should continue in bounded batches with checkpoint/resume.
- The JSONL index is still rebuilt as a whole. This is acceptable now, but incremental indexing will matter once the channel corpus grows.

## Decision

Stage 4.5 Vanessa real-channel closed-loop validation is accepted.

Recommended next stage:

```text
Stage 5: Youglish-like English Search Learning Surface
```

The first UI should consume the accepted sentence index and expose search results with sentence text, video title, timestamp link, and nearby context without introducing new acquisition behavior.
