# YouTube Channel Greedy English Captions and Youglish-like Learning Roadmap

Date: 2026-05-04

Owner: Codex

Status: Discussion / roadmap. Do not implement directly until promoted into concrete stage plans.

Reference read:

- `AGENTS.md`
- `docs/decisions/0001-mvp-platform-scope.md`
- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`
- `docs/decisions/0006-cli-first-product-shell.md`
- `docs/plans/2026-05-02-source-channel-collections.md`
- `docs/plans/2026-05-02-youtube-bilingual-captions-machine-translation.md`
- `docs/plans/2026-05-02-background-jobs-for-long-actions.md`
- `docs/GOTCHAS.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/index.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/architecture.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/repo-conventions.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/decision-rules.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/project-skeleton-checklist.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/review-checklists/ai-output-review.md`

Reference repository note:

- The repository-local `AGENTS.md` still mentions `/Volumes/2T/com/yanghoo205/yanghoo-reference`.
- The actual readable reference path for this machine is `/Users/a123/com/yanghoo205/yanghoo-reference`.
- Structural stage plans should use the readable path above unless the repo guideline is corrected.

## Goal

Build toward a Youglish-like English learning workflow from YouTube channels.

Primary user flow:

```text
submit YouTube channel URL
-> mark channel as greedy English-caption mode
-> discover channel videos
-> batch persist English captions for hundreds or thousands of videos
-> index timestamped sentences
-> search words/phrases
-> open real video examples with context
-> discuss sentences for English learning
```

Initial target channel:

```text
https://www.youtube.com/@SpeakEnglishWithVanessa
```

## Non-goals

- Do not download YouTube videos for normal channel caption acquisition.
- Do not route YouTube through the generic short-video `yt-dlp` media workflow.
- Do not make audio transcription the default greedy channel behavior.
- Do not claim descriptions, chapters, shownotes, or outlines are transcripts.
- Do not build the final learning UI before channel caption persistence and sentence indexing are stable.
- Do not copy implementation from the reference repository.

## Product Rules

YouTube channel greedy mode is caption-first and English-first.

Accepted source priority for this roadmap:

```text
YouTube InnerTube/Baoyu captions
-> subtitle-only fallback when needed
-> record missing/failed English caption state
-> optional single-video audio transcription only when explicitly requested later
```

Default greedy channel mode should:

- discover and persist the channel video list,
- create or update one local source per video,
- acquire English caption assets when available,
- preserve caption provenance, including native vs auto-generated tracks,
- continue after individual video failures,
- support checkpointed resume,
- avoid duplicate source records and duplicate caption downloads.

Simplified Chinese caption or translation assets may be acquired later, but English caption persistence is the primary acceptance path for this goal.

## Layer Placement

- `packages/domain`: channel source, greedy mode, batch job status, caption manifest concepts, sentence index contracts.
- `packages/application`: use cases such as capture channel, sync channel videos, ensure channel captions, build sentence index, search sentence index.
- `packages/source-adapters`: YouTube channel/video discovery and caption-track acquisition.
- `packages/storage`: canonical persistence for channels, sources, captions, checkpoints, indexes, and job reports.
- `apps/api`: endpoints for channel capture, greedy sync jobs, progress, and sentence search.
- `apps/cli`: scriptable commands for channel sync, retry, indexing, and search.
- `apps/web`: later channel progress and Youglish-like learning surface.

Domain must not import UI, Fastify, filesystem, or subprocess modules. Infrastructure behavior must stay behind adapters and application use cases.

Reference constraints to preserve:

- Entry layers are shells: CLI, API, and Web should receive input, assemble dependencies, call application use cases, and render output only.
- Network access, file writes, subprocess calls, and automated long-running jobs are high-risk capabilities. They must be explicit in adapters, infrastructure, or job orchestration modules, not hidden in broad helper files.
- New file names must state object and responsibility. Avoid vague names such as `utils.ts`, `service.ts`, `manager.ts`, or `handler.ts`.
- Any module that writes files, calls YouTube, runs `yt-dlp`, or launches background work needs an explicit test surface.

## Proposed Persistence Shape

Channel-level assets:

```text
data/channels/youtube-{channelId}/channel-manifest.json
data/channels/youtube-{channelId}/videos.json
data/channels/youtube-{channelId}/sync-checkpoint.json
data/channels/youtube-{channelId}/caption-sync-report.json
```

Per-video source assets should continue using the canonical source root:

```text
data/sources/yt-{videoId}/source.json
data/sources/yt-{videoId}/captions/captions-manifest.json
data/sources/yt-{videoId}/captions/en.raw.json
data/sources/yt-{videoId}/captions/en.vtt
data/sources/yt-{videoId}/transcript-manifest.json
data/sources/yt-{videoId}/transcript-raw.json
data/sources/yt-{videoId}/transcript-sentences.json
data/sources/yt-{videoId}/transcript.vtt
data/sources/yt-{videoId}/document.md
```

Search/index assets:

```text
data/indexes/english-sentences.jsonl
data/indexes/english-sentences-manifest.json
```

The first index may be JSONL. Promote to SQLite FTS5 or another search engine only after the JSONL path proves the desired sentence schema and search behavior.

## Sentence Index Contract

Each indexed sentence should preserve enough data to reproduce a Youglish-like result without re-reading every source file.

Example:

```json
{
  "sourceId": "yt-v4F1gFy-hqg",
  "videoId": "v4F1gFy-hqg",
  "channelId": "youtube-channel-id",
  "channelTitle": "Speak English With Vanessa",
  "title": "Video title",
  "publishedAt": "2026-01-01T00:00:00.000Z",
  "start": 123.45,
  "end": 127.8,
  "text": "I would have done it differently.",
  "normalizedText": "i would have done it differently",
  "captionKind": "auto",
  "captionLanguage": "en"
}
```

## Execution Roadmap

### Stage 1: Channel Capture and Video Manifest

Goal:

- Accept a YouTube channel URL such as `https://www.youtube.com/@SpeakEnglishWithVanessa`.
- Resolve a stable channel identity.
- Persist channel metadata and video inventory.

Acceptance criteria:

- Channel URL is treated as a channel source, not a single video.
- `channel-manifest.json` and `videos.json` are written.
- Re-running the same channel capture updates the manifest without duplicating records.
- No captions or videos are downloaded in this stage.

Expected follow-up plan:

```text
docs/plans/2026-05-04-stage-youtube-channel-capture-and-video-manifest.md
```

### Stage 2: Small-batch English Caption Acquisition

Goal:

- Take the first small batch of channel videos and persist English captions.

Acceptance criteria:

- Batch size is configurable, with a safe default such as 10 or 20.
- Each video creates or updates `data/sources/yt-{videoId}`.
- Available English captions generate raw, VTT, transcript, sentence, and document assets.
- Missing captions are recorded truthfully.
- One failed video does not fail the whole batch.
- No YouTube video download occurs.

Expected follow-up plan:

```text
docs/plans/2026-05-04-stage-youtube-channel-english-caption-batch.md
```

### Stage 3: Greedy Mode, Resume, and Retry

Goal:

- Make channel greedy caption sync safe for hundreds or thousands of videos.

Acceptance criteria:

- Channel can be marked as greedy English-caption mode.
- Sync writes a checkpoint after each batch.
- Sync can resume from checkpoint.
- Sync skips already successful caption assets unless forced.
- Failed items are tracked with reasons and retry counts.
- Rate-limit, 429, network, and empty-caption states are distinguishable in reports.

Expected follow-up plan:

```text
docs/plans/2026-05-04-stage-youtube-channel-greedy-caption-sync.md
```

### Stage 4: Sentence Index

Goal:

- Build a reusable English sentence index from persisted caption assets.

Acceptance criteria:

- Index command scans canonical `data/sources/*/transcript-sentences.json`.
- Index output includes video, channel, title, timestamp, text, and caption provenance.
- Search supports exact words and phrase queries.
- Search returns timestamped sentence hits without needing to load all source files at request time.

Expected follow-up plan:

```text
docs/plans/2026-05-04-stage-english-sentence-index.md
```

### Stage 5: Youglish-like Learning Surface

Goal:

- Expose a learner-first interface for searching real video examples.

Acceptance criteria:

- User can search a word or phrase.
- Results show sentence text, video title, channel, and timestamp.
- Clicking a result opens the video at the sentence start time.
- The view shows neighboring sentence context.
- The interface emphasizes reading/listening examples, not internal processing steps.

Expected follow-up plan:

```text
docs/plans/2026-05-04-stage-youglish-like-search-ui.md
```

### Stage 6: Sentence Discussion and Learning Notes

Goal:

- Add AI-assisted English learning around indexed sentences.

Acceptance criteria:

- User can ask about meaning, grammar, phrase usage, pronunciation cues, and similar examples.
- Discussion is anchored to a specific sentence and nearby context.
- Notes or favorites can be persisted separately from transcript assets.
- AI discussion remains a learning layer and does not alter transcript provenance.

Expected follow-up plan:

```text
docs/plans/2026-05-04-stage-sentence-discussion-learning-notes.md
```

## Suggested CLI Shape

The exact command names should be validated against the existing CLI plan before implementation.

Potential commands:

```bash
npm run -s cli -- channel add 'https://www.youtube.com/@SpeakEnglishWithVanessa' --greedy-captions --language en --json
npm run -s cli -- channel sync youtube-{channelId} --videos-only --json
npm run -s cli -- channel captions youtube-{channelId} --language en --limit 20 --json
npm run -s cli -- channel captions youtube-{channelId} --language en --resume --json
npm run -s cli -- index sentences --language en --json
npm run -s cli -- search 'get used to' --json
```

Commands must stay thin. Business logic belongs in `packages/application`.

## Verification Strategy

Each executable stage plan should include:

```bash
npm run typecheck
npm run build
```

Stage-specific smoke checks should include exact generated file lists and key JSON report fields. For user-facing "it works" claims, Gemini reports must include:

- exact commands run,
- summarized key output,
- generated files,
- caption counts and failure counts,
- readiness output,
- unresolved risks and skipped commands.

Do not accept reports that describe mock/stub captions as real YouTube caption persistence.

Minimum test surface by stage:

- Domain concepts: unit tests for channel greedy mode, caption status, retry state, and sentence index record validation.
- Application use cases: integration tests with fake YouTube/channel adapters and temp storage.
- YouTube adapters: contract tests using stored response fixtures for channel pages, continuation pages, caption tracks, empty captions, and rate-limit errors.
- Storage/file writes: temp-directory integration tests for channel manifests, checkpoints, reports, and sentence indexes.
- CLI/API entrypoints: smoke tests proving argument/request wiring without duplicating business rules.
- Risk behavior: negative tests for malformed channel URLs, path traversal-like IDs, failed network calls, partial batch failures, and retry limits.

## Risks and Open Questions

- YouTube may rate-limit aggressive caption fetching. Batch size, retries, cookies, proxy settings, and checkpointing must be explicit.
- Channel video enumeration may require a different acquisition path than single-video captions.
- Very large local indexes may outgrow JSONL; start simple, then promote after schema validation.
- English auto captions are valuable for learning examples but should be marked as auto-generated.
- Some channel videos may have no English captions. Greedy mode should record that fact instead of silently falling back to expensive audio transcription.
- The repo guideline still references the old `/Volumes/2T/...` reference path. Future documentation should either update `AGENTS.md` or consistently note the machine-local `/Users/a123/...` path in stage plans.
