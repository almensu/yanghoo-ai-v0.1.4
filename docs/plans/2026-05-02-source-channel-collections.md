# Source Channel Collections

Date: 2026-05-02

Owner: Codex

## Goal

Add a YouTube-like channel collection experience across supported platforms.

When a user clicks the channel/author on a card, the app should show all locally captured sources from the same platform and channel/author.

Examples:

- YouTube author -> all captured YouTube videos from that author.
- Bilibili UP -> all captured Bilibili videos from that UP.
- Xiaoyuzhou podcast -> all captured episodes from that podcast.
- Douyin/TikTok/X/Xiaohongshu creator -> all captured posts/videos from that creator.

## Non-goals

- Do not crawl remote channel pages yet.
- Do not create fake missing videos that have not been captured.
- Do not introduce a separate persisted collection store for the first version.
- Do not change media/transcript acquisition rules.

## Layer Placement

- `packages/application`: derive source channel collections from existing source records.
- `apps/api`: expose collection summaries for the web app.
- `apps/web`: render a compact collection filter and make card authors clickable.

The first implementation is read-only and derived from `sourceStorage.listSources()`.

## Grouping Rule

Use a deterministic local key:

```text
platform + normalized(channel identity)
```

Channel identity priority:

1. stored channel/uploader id or URL if a platform adapter provides it,
2. `source.author`,
3. `Unknown <platform>` fallback.

This keeps current data usable while leaving room for richer platform metadata later.

## Acceptance Criteria

- API exposes channel collection summaries with `id`, `platform`, `title`, `sourceIds`, and counts.
- Web app shows a compact collection strip.
- Card author text is clickable when a collection exists.
- Clicking a collection filters the grid to sources in that collection.
- The user can return to all sources.
- Typecheck and build pass.

## Verification

```bash
npm run typecheck
npm run build
```

Manual checks:

```bash
curl -sS http://127.0.0.1:8001/api/source-collections
```

Open the web app and click a card author/channel.
