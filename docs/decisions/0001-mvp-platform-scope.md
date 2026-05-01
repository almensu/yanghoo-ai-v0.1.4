# 0001 MVP Platform Scope

## Status

Accepted.

## Decision

The MVP supports the first two platform adapters:

- YouTube URLs as the first `long_video` platform.
- Xiaoyuzhou URLs as the first `podcast_audio` platform.

Apple Podcasts belongs to the same `podcast_audio` source class as Xiaoyuzhou, but it is not the first adapter unless explicitly pulled into the MVP.

Douyin and Xiaohongshu belong to the `short_video` source class. Their product logic is the same at the high level:

```text
collect short-video URL -> fetch media/metadata -> obtain audio -> transcribe -> refine transcript
```

They are planned platform adapters, but not part of the first build unless Stage 1 finishes early and the scope is expanded.

X/Twitter, TikTok, generic webpages, Bilibili, RSS expansion, Apple Podcasts, Douyin, Xiaohongshu, and advanced channel automation are deferred from the first MVP implementation.

## Rationale

The project's first version must prove the core loop:

```text
collect URL -> ensure transcript -> generate document -> chat/generate with LLM
```

YouTube and Xiaoyuzhou cover both transcript-first and audio-fallback paths:

- YouTube validates Baoyu/InnerTube transcript priority.
- Xiaoyuzhou validates podcast/audio collection and `mlx-audio` fallback.

Adding more platforms before this loop is stable would expand source parsing complexity too early. The architecture must still name them now so the first package boundaries do not hard-code YouTube-only assumptions.

## Consequences

- First source adapters: `youtubeSourceAdapter` and `xiaoyuzhouSourceAdapter`.
- Domain models must separate `sourceClass` from `platform`.
- Planned platforms should be represented as adapter extension points: `applePodcast`, `douyin`, `xiaohongshu`, `x`, `tiktok`, `webpage`, and `bilibili`.
- UI can show channel/feed concepts, but deep multi-platform automation is not part of MVP.
- Early product goal is platform URL collectors first, then reliable transcript acquisition.
