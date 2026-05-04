# Stage 4 Plan: English Sentence Index

Date: 2026-05-04
Owner: Codex
Executor: Gemini
Status: Ready for implementation

## Context

Stage 1 through Stage 3 are accepted for the YouTube channel greedy English-caption workflow:

- Channel capture persists channel metadata and `videos.json`.
- Small-batch English caption acquisition persists English caption assets only when requested with `--language en`.
- Greedy sync supports resume, skip, retry-failed, checkpointing, and per-video report updates.

The next product step is a Youglish-like searchable English sentence corpus over already-persisted caption assets. This stage should not fetch YouTube again. It should read local transcript assets and build a reusable index.

Reference guidance used for this plan:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/review-checklists/ai-output-review.md`
- `docs/GOTCHAS.md`

## Goal

Build a local English sentence index from persisted `transcript-sentences.json` files so the user can search words and phrases across a YouTube channel without loading every source file at query time.

Target first command shape:

```bash
npm run -s cli -- sentence-index build --channel youtube-UCxJGMJbjokfnr2-s4_RXPxQ --language en
npm run -s cli -- sentence-index search "would have" --channel youtube-UCxJGMJbjokfnr2-s4_RXPxQ --language en --limit 20 --json
```

If the current CLI command registry prefers another naming convention, Gemini may adjust the exact command name, but the report must document the final command.

## Non-goals

- Do not fetch new YouTube metadata.
- Do not fetch captions.
- Do not download YouTube video, audio, or media.
- Do not run MLX Audio transcription.
- Do not generate Chinese captions or translations.
- Do not remove or weaken the existing single-video machine translation feature.
- Do not build the final web learning UI in this stage.
- Do not introduce SQLite, FTS5, Meilisearch, Tantivy, or another search engine yet.
- Do not copy source files or implementation from the reference repository.

## Product Rules

This stage is English-learning channel mode only.

The indexer must:

- include only English sentence assets for this stage,
- preserve video timestamp data,
- preserve enough video/channel metadata to render search results later,
- preserve caption provenance when available,
- be repeatable and idempotent,
- never claim a sentence is indexed if the source file cannot be parsed,
- report skipped and failed source assets truthfully.

Global/default bilingual and machine-translation behavior must remain available outside this English sentence index path.

## Target Persistence

Use canonical root-level `data/indexes/`. Do not create app-local data directories.

Recommended first persistence shape:

```text
data/indexes/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/
  english-sentences.jsonl
  english-sentences-manifest.json
```

The manifest should include:

```json
{
  "indexId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ-en",
  "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
  "language": "en",
  "createdAt": "2026-05-04T00:00:00.000Z",
  "updatedAt": "2026-05-04T00:00:00.000Z",
  "sourceCount": 5,
  "sentenceCount": 420,
  "skippedCount": 0,
  "failedCount": 0,
  "sourceIds": ["yt-example"],
  "warnings": []
}
```

Each JSONL row should be one sentence:

```json
{
  "indexVersion": 1,
  "sourceId": "yt-v4F1gFy-hqg",
  "videoId": "v4F1gFy-hqg",
  "channelId": "youtube-UCxJGMJbjokfnr2-s4_RXPxQ",
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

If some metadata is not available yet, use `null` or omit optional fields consistently. Do not fabricate values.

## Layer Placement

### Domain

Own pure contracts and transformations:

- `EnglishSentenceIndexEntry`
- `EnglishSentenceIndexManifest`
- query normalization rules
- sentence text normalization

Suggested files:

```text
packages/domain/src/englishSentenceIndex.ts
```

Avoid vague names such as `types.ts` or `utils.ts`.

### Storage

Own filesystem reads/writes for index artifacts:

- write JSONL atomically enough for local CLI use,
- read manifest,
- stream or read indexed JSONL for search,
- keep paths under canonical `DATA_DIR`/repo `data`.

Suggested files:

```text
packages/storage/src/englishSentenceIndexStorage.ts
```

### Application

Own orchestration:

- discover channel videos from `data/channels/{channelId}/videos.json`,
- map video IDs to source IDs,
- read `data/sources/{sourceId}/transcript-sentences.json`,
- enrich sentences with source/channel/video metadata,
- build index and manifest,
- search the built JSONL index.

Suggested files:

```text
packages/application/src/buildEnglishSentenceIndexUseCase.ts
packages/application/src/searchEnglishSentenceIndexUseCase.ts
```

### CLI

Own argument parsing and output only:

```text
apps/cli/src/commands/sentence-index-command.ts
```

The CLI must delegate to application use cases and must not implement indexing rules directly.

## Search Behavior

Minimum search behavior for Stage 4:

- Case-insensitive search.
- Exact phrase search by normalized substring.
- Word query search should avoid obvious false positives where feasible.
- Results sorted by stable order: published date if available, then source/video order from channel manifest, then sentence start time.
- `--limit` must cap output.
- `--json` must produce parseable JSON without npm noise when run via `npm run -s cli -- ...`.

Search may read the JSONL index file into memory for now. The acceptance requirement is that it reads the prebuilt index, not every `data/sources/*/transcript-sentences.json` file at query time.

## Implementation Tasks for Gemini

1. Add domain contracts and pure normalization.
2. Add storage functions for index manifest and JSONL read/write.
3. Add `buildEnglishSentenceIndexUseCase`.
4. Add `searchEnglishSentenceIndexUseCase`.
5. Add CLI command wiring for build/search.
6. Add a deterministic verification script under `scripts/ops/`.
7. Run required verification and write the implementation report.

Recommended verification script:

```text
scripts/ops/verify-stage4-english-sentence-index.ts
```

The script should use a controlled small channel fixture or existing local generated data with assertions. It must not depend on network access.

## Acceptance Criteria

- Build command creates `english-sentences.jsonl`.
- Build command creates `english-sentences-manifest.json`.
- Manifest counts match the generated JSONL row count.
- Each indexed row includes `sourceId`, `videoId`, `channelId`, `title`, timestamp fields, `text`, `normalizedText`, `captionLanguage`.
- Rows are limited to English assets for `--language en`.
- Re-running build is idempotent and does not duplicate rows.
- Search command reads from the built index, not from every source transcript file.
- Search supports a phrase query such as `"would have"` when matching data exists.
- Search supports a single-word query such as `"because"` when matching data exists.
- Search returns timestamped results with enough fields to later open a YouTube timestamp URL.
- Missing or malformed source transcript files are reported in the manifest warnings/failures and do not crash the whole index build.
- No `zh-Hans`, translation, audio, or media assets are generated by this stage.
- `npm run typecheck` passes.
- `npm run build` passes.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage4-english-sentence-index.ts
npm run build -w @yanghoo/domain
npm run build -w @yanghoo/storage
npm run build -w @yanghoo/application
npm run typecheck
npm run build
```

If a workspace package name differs, use the actual package name and document the substitution.

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-04-english-sentence-index-report.md
```

The report must include:

- changed files,
- final CLI command names,
- generated index file paths,
- exact verification commands,
- summarized key output,
- skipped commands with reasons,
- unresolved risks.

## Codex Audit Checklist

Codex should reject the report if:

- search scans source transcript files instead of the prebuilt JSONL index,
- indexing triggers network, caption fetch, audio download, transcription, or translation,
- CLI contains core indexing/search rules instead of delegating to application use cases,
- index rows omit timestamps or source/video identity,
- build is not idempotent,
- malformed source data can crash the whole channel index,
- Stage 4 removes or breaks existing single-video machine translation behavior.
