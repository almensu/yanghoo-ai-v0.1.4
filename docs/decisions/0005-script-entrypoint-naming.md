# 0005 Script Entrypoint Naming

## Status

Accepted.

## Decision

Operational scripts are planned under `scripts/` as small entry points. They follow a Linux-style single-responsibility model:

```text
one script -> one action -> explicit input/output -> composable pipeline
```

Script names use kebab-case and begin with a verb. Examples:

- `collect-xiaoyuzhou-url.ts`
- `fetch-youtube-captions.ts`
- `transcribe-audio-mlx.ts`
- `refine-transcript-sentences.ts`
- `generate-from-source.ts`

Platform-specific behavior must stay in platform-specific scripts. Shared transcript, document, storage, and LLM behavior must stay platform-neutral.

## Rationale

The project will support YouTube, Xiaoyuzhou, Apple Podcasts, Douyin, Xiaohongshu, X, and webpages. A monolithic downloader or importer would quickly mix URL parsing, metadata fetching, media handling, transcription, storage, and LLM calls.

Small scripts make Gemini tasks easier to assign and Codex audits easier to verify.

## Consequences

- Empty script files may be committed as naming placeholders.
- Implementation should call `packages/*` modules instead of embedding business logic in scripts.
- A script that grows beyond one responsibility should be split before implementation continues.
- Pipeline composition should happen in application use cases or explicit orchestration scripts, not inside platform collectors.
