# Add Bilibili and TikTok Platforms

## Goal

Add two concrete platform adapters:

- Bilibili for URLs such as `https://www.bilibili.com/video/BV1pqr5BUEhr`.
- TikTok for mobile and PC links.

Acquisition strategy:

- Bilibili is `sourceClass: long_video`, `platform: bilibili`, but unlike YouTube it uses `yt-dlp` to get media/video/audio, then MLX audio transcription.
- TikTok is `sourceClass: short_video`, `platform: tiktok`, and follows the same `yt-dlp -> download media -> probe audio -> transcribe -> read` workflow as X/Douyin/Xiaohongshu.

## Non-Goals

- Do not route Bilibili through YouTube's Baoyu/InnerTube caption path.
- Do not route YouTube through `yt-dlp`.
- Do not fake transcript readiness from metadata, title, description, or comments.
- Do not bypass private, login-only, age-gated, or region-locked content.
- Do not expose debug/force media actions in the source card UI.

## Reference and Decisions

Use:

- `AGENTS.md`
- `CLAUDE.md`
- `docs/README.md`
- `docs/decisions/0001-mvp-platform-scope.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/GOTCHAS.md`

Local `yt-dlp` extractor check already shows support for:

```text
BiliBili
TikTok
vm.tiktok
```

Gemini should re-run the exact version/extractor checks in its report.

## Required Implementation

### 1. Domain Platform

Add `tiktok` to the domain `Platform` union.

`bilibili` already exists in the domain. Keep Bilibili as `sourceClass: long_video`.

### 2. URL Extraction Regex

Update `packages/application/src/extractSupportedSourceUrl.ts` to extract these URLs from bare URLs and pasted share text.

Bilibili support:

```text
https://www.bilibili.com/video/BV1pqr5BUEhr
https://m.bilibili.com/video/BV1pqr5BUEhr
https://www.bilibili.com/video/av123456
https://b23.tv/{token}
```

TikTok support:

```text
https://www.tiktok.com/@{user}/video/{id}
https://m.tiktok.com/v/{id}.html
https://vm.tiktok.com/{token}/
https://vt.tiktok.com/{token}/
https://www.tiktok.com/t/{token}/
```

Regex requirements:

- Stop at whitespace and common Chinese/English punctuation.
- Do not include trailing `，`, `。`, `!`, `！`, `)`, `）`.
- Preserve query strings only when useful for the platform.
- Extraction must work from full mobile share sentences, not only bare URLs.

### 3. Bilibili Adapter

Create:

```text
packages/source-adapters/src/bilibiliAdapter.ts
```

Expected source shape:

```text
id: bili-{canonicalId}
sourceClass: long_video
platform: bilibili
canonicalId: BV... or av...
```

Rules:

- Use `yt-dlp --dump-json --skip-download` for metadata.
- Use metadata `id` as canonical ID when available.
- Persist title, author/uploader, thumbnail, duration, and canonical webpage URL when available.
- If metadata resolution fails, do not claim readiness. Create a clear error if no safe canonical ID can be extracted.
- Bilibili download/transcription uses the existing media pipeline:

```text
下载视频 -> 转录 -> 阅读
```

No Bilibili card should show YouTube's `下载字幕` caption-only path unless a future task explicitly adds Bilibili caption support.

### 4. TikTok Adapter

Create:

```text
packages/source-adapters/src/tiktokAdapter.ts
```

Expected source shape:

```text
id: tiktok-{canonicalId}
sourceClass: short_video
platform: tiktok
canonicalId: metadata.id when yt-dlp resolves it
```

Rules:

- Use `yt-dlp --dump-json --skip-download` for metadata and short-link resolution.
- Support PC and mobile/short links.
- If `yt-dlp` returns a canonical numeric/video ID, use that ID.
- Do not silently persist a short-link token as canonical ID if `yt-dlp` fails before canonical resolution.
- Preserve original pasted URL/text and canonical `webpage_url` when available.
- Download/transcription uses the existing media pipeline:

```text
下载视频 -> 转录 -> 阅读
```

### 5. Routing and Exports

Update:

- `packages/source-adapters/src/index.ts`
- `packages/application/src/index.ts`

Routing:

- `bilibili.com` and `b23.tv` -> Bilibili adapter.
- `tiktok.com`, `vm.tiktok.com`, and `vt.tiktok.com` -> TikTok adapter.

### 6. Scripts

Add collection scripts following existing naming:

```text
scripts/collect/collect-bilibili-url.ts
scripts/collect/collect-tiktok-url.ts
```

Scripts should be one-action entry points and use application/package logic rather than duplicating adapter code.

### 7. UI Behavior

Update `apps/web/src/components/TaskCard.tsx` only if needed.

Expected:

- Bilibili card with no media -> `下载视频`.
- TikTok card with no media -> `下载视频`.
- Downloaded media with audio -> `转录`.
- Downloaded media without audio -> disabled no-audio state.
- Readable document -> `阅读`.

Keep the simplified action model. Do not reintroduce `解析媒体`, `强制下载`, `强制处理`, `删除本地资产`, or `查看元数据`.

## Target Files

Likely files:

- `packages/domain/src/index.ts`
- `packages/application/src/extractSupportedSourceUrl.ts`
- `packages/application/src/index.ts`
- `packages/source-adapters/src/bilibiliAdapter.ts`
- `packages/source-adapters/src/tiktokAdapter.ts`
- `packages/source-adapters/src/index.ts`
- `apps/web/src/components/TaskCard.tsx`
- `scripts/collect/collect-bilibili-url.ts`
- `scripts/collect/collect-tiktok-url.ts`
- `docs/GOTCHAS.md` if a repeatable platform trap is discovered

## Acceptance Criteria

- Bilibili URL `https://www.bilibili.com/video/BV1pqr5BUEhr` imports as `sourceClass: long_video`, `platform: bilibili`.
- Bilibili card shows `下载视频`, then `转录`, then `阅读` after successful transcription.
- Bilibili does not use YouTube `下载字幕` / Baoyu path.
- TikTok PC link imports as `platform: tiktok`.
- TikTok mobile/short link imports as `platform: tiktok`.
- TikTok short links resolve to canonical IDs through `yt-dlp`; failed resolution is a clear error, not a fake card.
- Existing YouTube, Bilibili, X, Xiaohongshu, Douyin, Apple Podcast, and Xiaoyuzhou routing remains unambiguous.
- Failed `yt-dlp` auth/cookie/region/platform errors are surfaced truthfully.
- `npm run build` and `npm run typecheck` pass.

## Verification Commands

Gemini should run:

```bash
npm run build
npm run typecheck
yt-dlp --version
yt-dlp --list-extractors | rg -i 'bilibili|tiktok|vm.tiktok'
```

Capture:

```bash
npx tsx scripts/collect/collect-bilibili-url.ts 'https://www.bilibili.com/video/BV1pqr5BUEhr'
npx tsx scripts/collect/collect-tiktok-url.ts '<pc-tiktok-url>'
npx tsx scripts/collect/collect-tiktok-url.ts '<mobile-or-short-tiktok-url>'
```

API checks:

```bash
curl -sS -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  --data-binary '{"sourceUrl":"https://www.bilibili.com/video/BV1pqr5BUEhr"}'

curl -sS -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  --data-binary '{"sourceUrl":"<pc-tiktok-url>"}'

curl -sS -X POST http://127.0.0.1:8001/api/tasks \
  -H 'Content-Type: application/json' \
  --data-binary '{"sourceUrl":"<mobile-or-short-tiktok-share-text>"}'
```

Media path:

```bash
npx tsx scripts/media/download-source-media.ts <bilibili-source-id>
npx tsx scripts/media/download-source-media.ts <tiktok-source-id>
find data/sources/<source-id> -maxdepth 1 -type f -print | sort
cat data/sources/<source-id>/media-manifest.json
```

If a platform requires cookies or is region-blocked, verify the failure path and include exact summarized diagnostics.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-30-add-bilibili-and-tiktok-platforms-report.md
```

Report must include:

- changed files,
- exact URL regex cases covered,
- exact Bilibili and TikTok URLs tested,
- `yt-dlp` version and extractor evidence,
- source record excerpts,
- generated source IDs,
- media manifest excerpts or truthful failure state,
- UI action state summary,
- build/typecheck output,
- unresolved risks.
