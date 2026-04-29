# Simplify Source Card Actions

## Goal

Make source card actions clear and user-facing. The card should not expose pipeline/debug operations as normal product actions.

Only these user-visible actions should remain:

- `下载视频`
- `下载字幕`
- `转录`
- `删除卡片`

`删除卡片` must delete the card and its local generated assets by default.

## Problem

Current cards can show both an overflow menu and a bottom primary button with unclear, overlapping actions:

- `解析媒体`
- `强制下载`
- `强制处理`
- `删除本地资产`
- `删除卡片`
- `查看元数据`
- bottom blue `下载视频`
- previous labels such as `视频转字幕` / `音频转字幕` if they are unclear for the current state

This exposes implementation details and makes the product feel like a media pipeline control panel instead of a transcript-first reader workflow.

## Non-Goals

- Do not add a general media/debug control panel.
- Do not expose separate local asset deletion as a normal user action.
- Do not expose metadata debugging in the production card UI.
- Do not rename descriptions, shownotes, chapters, or outlines as subtitles/transcripts.
- Do not route YouTube through the generic video download workflow.

## Required Product Logic

### Visible Actions

Each card should show at most the relevant subset of:

- `下载视频`
- `下载字幕`
- `转录`
- `删除卡片`

No normal card should show:

- `解析媒体`
- `强制下载`
- `强制处理`
- `删除本地资产`
- `查看元数据`

If internal/debug actions are still needed later, move them to a dedicated admin/debug surface, not the card.

Use `下载字幕` and `转录` as distinct user actions:

- `下载字幕`: fetch existing platform captions/subtitles without local media transcription.
- `转录`: create subtitles by transcribing already downloaded audio/video media.

### YouTube

YouTube follows the accepted Baoyu/YouTube InnerTube path:

```text
URL -> metadata/caption list -> 下载字幕 -> readable document
```

Rules:

- Show `下载字幕` when the document is not ready.
- Do not show `下载视频` as the primary YouTube action.
- `下载字幕` should call the existing ensure-transcript/caption path.
- The action should not require a downloaded video file.
- Do not show `转录` for YouTube unless a future task explicitly adds an audio fallback after caption failure.

### X / Xiaohongshu / Douyin

These platforms use `yt-dlp` for media:

```text
URL -> 下载视频 -> 转录 -> readable document
```

Rules:

- If no media exists, show `下载视频`.
- If media exists and has audio but no transcript/document exists, show `转录`.
- `转录` may internally run audio extraction and MLX transcription.
- If media exists but has no audio, disable `转录` and show the persisted no-audio reason.
- Do not show forced/retry/debug actions. Failed states should keep the same relevant action available as a retry, with the error shown inline.

### Delete Card

`删除卡片` should be the only destructive user action on the card.

Rules:

- It deletes the source card and local assets by default.
- The confirmation copy should clearly say the card and local generated assets will be deleted.
- It should call the full card deletion path, not only asset deletion.
- It must still encode task IDs in route URLs.

## Layer Placement

- UI layer owns visible labels, button layout, and confirmation copy.
- Application/storage layer owns deletion semantics.
- Platform adapters/application use cases own whether `下载字幕` means YouTube caption fetch or short-video transcription.

Boundary answers:

1. Card action presentation belongs to `apps/web/src/components/TaskCard.tsx`.
2. API client helpers in `apps/web/src/api/client.ts` may be used but should not gain business logic.
3. Source-specific execution stays in application use cases: `下载字幕` maps to caption fetch, `转录` maps to media/audio transcription.
4. The boundary would be violated if the card exposes `yt-dlp`, media resolving, force processing, or metadata debugging as product actions.
5. Verification must prove button labels and API behavior for YouTube and short-video records.

## Target Files

Likely files:

- `apps/web/src/components/TaskCard.tsx`
- `apps/web/src/api/client.ts` only if helper naming/usage needs cleanup
- `docs/GOTCHAS.md` only if a repeatable UI/action pitfall is discovered

Avoid backend changes unless the current delete-card endpoint does not already delete assets.

## Acceptance Criteria

- A YouTube card without a document shows `下载字幕`, not `下载视频`.
- An X/Xiaohongshu/Douyin card without media shows `下载视频`.
- An X/Xiaohongshu/Douyin card with media and audio but without transcript shows `转录`.
- The UI does not show ambiguous duplicate labels such as both `下载字幕` and `转录` for the same short-video state.
- A card with a readable document may show the existing read action if already required by the app, but must not show debug/force/media-resolve controls.
- The card UI no longer exposes `解析媒体`, `强制下载`, `强制处理`, `删除本地资产`, or `查看元数据`.
- `删除卡片` deletes the card and local assets by default.
- Failed download/transcription states show an inline error and keep the relevant simple action available for retry.
- The card remains document-readiness oriented.

## Verification Commands

Gemini should run:

```bash
npm run build
npm run typecheck
```

Manual/API verification should include:

```bash
curl -sS http://127.0.0.1:8001/api/tasks
```

And browser verification:

- Confirm YouTube card action text is `下载字幕`.
- Confirm X/Xiaohongshu/Douyin initial action text is `下载视频`.
- Confirm X/Xiaohongshu/Douyin action after media download is `转录`.
- Confirm no card menu exposes removed labels.
- Confirm `删除卡片` removes the source and generated assets.

## Expected Report

Write the Gemini report to:

```text
docs/plans/reports/2026-04-29-simplify-source-card-actions-report.md
```

The report must include:

- changed files,
- exact commands run,
- screenshot or concise browser-observed evidence of visible card actions,
- delete-card verification result,
- unresolved risks,
- whether `docs/GOTCHAS.md` was updated and why.
