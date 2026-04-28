# 0004 Source Classes and Platform Adapters

## Status

Accepted.

## Decision

Model internet inputs with two separate fields:

```text
sourceClass: long_video | podcast_audio | short_video | webpage | social_post | channel | feed
platform: youtube | xiaoyuzhou | apple_podcast | douyin | xiaohongshu | x | webpage | bilibili | other
```

`sourceClass` describes the processing shape. `platform` describes the concrete adapter.

Initial platform roadmap:

- `long_video`: YouTube.
- `podcast_audio`: Xiaoyuzhou first; Apple Podcasts later.
- `short_video`: Douyin and Xiaohongshu.
- `social_post` / `webpage`: X/Twitter and generic webpages.

Each platform gets a URL collector and source adapter. The user-facing early goal is:

```text
save platform URL -> fetch metadata -> obtain transcript text -> refine into document assets
```

## Rationale

Xiaoyuzhou should not be hidden behind a vague `podcast` platform name. It is a concrete platform in the same class as Apple Podcasts.

Douyin and Xiaohongshu should not be treated as special one-off downloaders. They are short-video platforms with the same product pipeline as other media sources: collect URL, obtain media or captions, transcribe when needed, then produce text.

Separating source class from platform keeps the domain stable while platform adapters evolve independently.

## Consequences

- `packages/domain` owns source class and platform enums.
- `packages/source-adapters` is organized by platform, not by UI page.
- `packages/transcript` only receives normalized media/caption inputs and should not know platform-specific URL rules.
- UI pages can filter by source class while still showing platform-specific badges.
- Gemini must not implement a generic `podcastSourceAdapter` as the canonical adapter name; use `xiaoyuzhouSourceAdapter` for the first podcast-class platform.
