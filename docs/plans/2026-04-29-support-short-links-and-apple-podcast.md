# Support Short Links and Apple Podcast URLs

## Goal

Extend URL capture so the app accepts common pasted share URLs/text for:

- Xiaohongshu short links, including `xhslink.com`.
- Douyin short links, including `https://v.douyin.com/lA8EkVfCRAw/`.
- Apple Podcasts episode URLs, including `https://podcasts.apple.com/us/podcast/blackjack/id201671138?i=1000551710062`.

The imported cards must route into the existing transcript-first workflow:

- short-video platforms use `yt-dlp` media acquisition,
- podcast platforms use audio fetch/transcription,
- no metadata-only record should claim transcript readiness.

## Non-Goals

- Do not route YouTube through `yt-dlp`.
- Do not create a generic `podcastSourceAdapter` as the canonical adapter. Apple Podcasts needs a concrete `applePodcastSourceAdapter`.
- Do not fake transcript/document assets from podcast descriptions or show notes.
- Do not bypass private, login-only, or region-blocked content.
- Do not expose debug/force actions in the source card UI.

## Reference and Decisions

Use:

- `docs/decisions/0001-mvp-platform-scope.md`
- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`
- `docs/GOTCHAS.md`

Relevant accepted rules:

- `apple_podcast` is a concrete platform under `sourceClass: podcast_audio`.
- Xiaoyuzhou and Apple Podcasts share the podcast-audio workflow, but they should remain separate platform adapters.
- X, Xiaohongshu, and Douyin use `yt-dlp` for metadata/media acquisition.

## Required Implementation

### 1. URL Extraction Regex

Update `packages/application/src/extractSupportedSourceUrl.ts` so pasted text can extract the first supported URL.

Support at least:

```text
http://xhslink.com/o/{token}
https://xhslink.com/o/{token}
https://www.xiaohongshu.com/discovery/item/{id}
https://www.xiaohongshu.com/explore/{id}

https://v.douyin.com/{token}/
http://v.douyin.com/{token}/
https://www.douyin.com/video/{id}
https://www.douyin.com/share/video/{id}
https://www.iesdouyin.com/share/video/{id}

https://podcasts.apple.com/{country}/podcast/{slug}/id{showId}?i={episodeId}
https://podcasts.apple.com/podcast/{slug}/id{showId}?i={episodeId}
```

Regex requirements:

- Stop at whitespace and common Chinese/English punctuation.
- Preserve query parameters needed for canonical IDs, especially Apple Podcasts `?i=`.
- Do not include trailing punctuation such as `，`, `。`, `!`, `！`, `)`, `）`.
- Include tests or script evidence for share-text inputs, not only bare URLs.

### 2. Xiaohongshu Short Links

Ensure Xiaohongshu capture supports short-link download:

```text
http://xhslink.com/o/{token}
https://xhslink.com/o/{token}
```

Rules:

- Use `yt-dlp --dump-json --skip-download` to resolve the canonical post ID.
- Do not use the short-link token as `source.id` if `yt-dlp` returns a canonical ID.
- Long URL and short URL for the same post must dedupe to the same `xhs-{postId}`.
- Preserve the original pasted URL/text in metadata.
- Download uses the existing `download-source-media` / `/download-media` path.

### 3. Douyin Short Links and Regex Matching

Support the provided short link:

```text
https://v.douyin.com/lA8EkVfCRAw/
```

Rules:

- `extractSupportedSourceUrl` must match it from both a bare URL and a full share sentence.
- `DouyinSourceAdapter` must accept short links and use `yt-dlp` to resolve canonical metadata.
- If `yt-dlp` returns a canonical numeric video ID, use `dy-{id}`.
- If `yt-dlp` fails before canonical resolution, return a clear capture error instead of silently creating a card with the short-link token as the canonical ID.
- Preserve original URL and canonical webpage URL from metadata when available.
- Download uses the existing short-video `yt-dlp` media path.

### 4. Apple Podcasts Episode Support

Add a concrete Apple Podcasts adapter, not a generic podcast adapter:

```text
packages/source-adapters/src/applePodcastAdapter.ts
```

Capture URL:

```text
https://podcasts.apple.com/us/podcast/blackjack/id201671138?i=1000551710062
```

Expected source shape:

```text
sourceClass: podcast_audio
platform: apple_podcast
id: apple-podcast-{episodeId}
canonicalId: {episodeId}
```

Metadata requirements:

- title: episode title if available, otherwise podcast/title fallback.
- author: podcast/show author if available.
- thumbnailUrl: artwork image if available.
- audioUrl or `metadata.mediaUrl`: direct episode audio URL if discoverable.
- metadata should include show ID and episode ID.

Implementation guidance:

- Prefer Apple Podcasts/iTunes lookup or page metadata that can resolve episode metadata and audio enclosure URL.
- If the page only provides show metadata and no episode audio URL, create a truthful metadata-only source but make `下载音频` fail with a clear "audio URL not found" message rather than claiming readiness.
- Do not use shownotes/description as transcript.
- The card should follow podcast flow: `下载音频` -> `转录` -> `阅读`.

### 5. Routing

Update `captureSourceUseCase` routing:

- `xhslink.com` and `xiaohongshu.com` -> Xiaohongshu adapter.
- `v.douyin.com`, `douyin.com`, and `iesdouyin.com` -> Douyin adapter.
- `podcasts.apple.com` -> Apple Podcasts adapter.

Export the Apple adapter from `packages/source-adapters/src/index.ts`.

Add a script if consistent with existing naming:

```text
scripts/collect/collect-apple-podcast-url.ts
```

## Target Files

Likely files:

- `packages/application/src/extractSupportedSourceUrl.ts`
- `packages/application/src/index.ts`
- `packages/source-adapters/src/douyinAdapter.ts`
- `packages/source-adapters/src/xiaohongshuAdapter.ts`
- `packages/source-adapters/src/applePodcastAdapter.ts`
- `packages/source-adapters/src/index.ts`
- `scripts/collect/collect-douyin-url.ts`
- `scripts/collect/collect-xiaohongshu-url.ts`
- `scripts/collect/collect-apple-podcast-url.ts`
- focused tests if the repo has a suitable test harness
- `docs/GOTCHAS.md` if a repeatable short-link or Apple metadata trap is discovered

## Acceptance Criteria

- Xiaohongshu short links can be imported and downloaded through the existing media path.
- Douyin short link `https://v.douyin.com/lA8EkVfCRAw/` is extracted by regex and routed to Douyin.
- Douyin share text containing the short link is extracted correctly.
- Douyin capture either resolves a canonical ID through `yt-dlp` or fails clearly; it must not silently persist `dy-lA8EkVfCRAw` as canonical when resolution fails.
- Apple Podcasts URL imports as `sourceClass: podcast_audio` and `platform: apple_podcast`.
- Apple Podcasts source has stable `apple-podcast-{episodeId}` identity for the provided `?i=1000551710062` URL.
- Apple Podcasts card follows audio/podcast workflow and does not claim transcript readiness until audio is fetched and transcribed.
- Existing YouTube, Xiaoyuzhou, X, Xiaohongshu, and long Douyin URLs still extract correctly.
- `npm run build` and `npm run typecheck` pass.

## Verification Commands

Gemini should run:

```bash
npm run build
npm run typecheck
```

URL extraction/API checks:

```bash
curl -sS -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  --data-binary '{"sourceUrl":"https://v.douyin.com/lA8EkVfCRAw/"}'

curl -sS -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  --data-binary '{"sourceUrl":"复制这条抖音内容 https://v.douyin.com/lA8EkVfCRAw/ 打开抖音查看"}'

curl -sS -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  --data-binary '{"sourceUrl":"http://xhslink.com/o/4ALz6kVmU1m"}'

curl -sS -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  --data-binary '{"sourceUrl":"https://podcasts.apple.com/us/podcast/blackjack/id201671138?i=1000551710062"}'
```

Direct scripts:

```bash
npx tsx scripts/collect/collect-douyin-url.ts 'https://v.douyin.com/lA8EkVfCRAw/'
npx tsx scripts/collect/collect-xiaohongshu-url.ts 'http://xhslink.com/o/4ALz6kVmU1m'
npx tsx scripts/collect/collect-apple-podcast-url.ts 'https://podcasts.apple.com/us/podcast/blackjack/id201671138?i=1000551710062'
```

`yt-dlp` evidence for short-video platforms:

```bash
yt-dlp --version
yt-dlp --dump-json --skip-download 'https://v.douyin.com/lA8EkVfCRAw/'
yt-dlp --dump-json --skip-download 'http://xhslink.com/o/4ALz6kVmU1m'
```

Apple evidence:

```bash
cat data/sources/apple-podcast-1000551710062/record.json
```

Report whether `audioUrl` / `metadata.mediaUrl` was found for the Apple Podcasts episode.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-29-support-short-links-and-apple-podcast-report.md
```

The report must include:

- changed files,
- exact regex cases covered,
- exact URLs tested,
- `yt-dlp` version and short-link metadata results,
- Apple Podcasts record excerpt,
- generated source IDs,
- download/transcription readiness status for each platform,
- build/typecheck output,
- unresolved risks and skipped commands.
