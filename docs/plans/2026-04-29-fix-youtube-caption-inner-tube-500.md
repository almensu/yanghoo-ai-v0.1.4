# Fix YouTube Caption Download 500

## Goal

Fix the current YouTube `下载字幕` failure:

```text
POST /api/tasks/yt-3JLxZBw8q7Y/ensure-transcript 500
YouTube InnerTube API connection failed
curl ... youtubei/v1/player?key=AIzaSyAO_SbdVz3VzVzVzVzVzVzVzVzVzVzVzVz
```

The card should either generate captions/documents through the accepted Baoyu/YouTube InnerTube path or show a clear, actionable no-caption/network error. It must not crash into an opaque 500 caused by a placeholder API key.

## Problem

Current `packages/source-adapters/src/youtubeAdapter.ts` appears to call YouTube InnerTube directly with a hard-coded placeholder key:

```text
AIzaSyAO_SbdVz3VzVzVzVzVzVzVzVzVzVzVzVz
```

This is not a reliable implementation of the accepted "Baoyu/YouTube InnerTube internal API" strategy. The backend returns 500 and the frontend only displays the raw command failure.

The browser console lines about React DevTools and Chrome Built-In AI are unrelated. The real failure is the backend `ensure-transcript` call.

## Required Reference

Use this local Baoyu YouTube transcript skill as the implementation reference:

```text
/Users/a123/claude-model/.claude-zhipu/skills/baoyu-youtube-transcript
```

Read:

- `SKILL.md` for supported behavior, inputs, outputs, cache shape, and error categories.
- `scripts/main.ts` for the InnerTube flow.

Important reference rules from that skill:

- It requires no fixed API key and no browser.
- It fetches the YouTube watch page.
- It extracts `INNERTUBE_API_KEY` from the page HTML.
- It calls `https://www.youtube.com/youtubei/v1/player?key=<extracted-key>`.
- It validates playability and caption track presence.
- It builds a transcript list from `playerCaptionsTracklistRenderer.captionTracks`.
- It fetches transcript snippets from the selected track `baseUrl`.
- It handles consent, blocked IP, no transcript, unavailable video, and age restriction as distinct errors.

Use the algorithm and response-shape expectations from this reference. Do not copy or vendor the entire external skill into this repository.

## Non-Goals

- Do not switch YouTube back to the generic `yt-dlp` video-download workflow.
- Do not require video download before YouTube caption generation.
- Do not fake transcript readiness when caption download fails.
- Do not store descriptions, shownotes, chapters, or outlines as `platform_caption`.
- Do not hide the failure with a frontend-only success state.

## Required Behavior

### YouTube Caption Path

Use a real, maintainable Baoyu/YouTube InnerTube implementation:

- Follow `/Users/a123/claude-model/.claude-zhipu/skills/baoyu-youtube-transcript/scripts/main.ts` for the InnerTube flow.
- Remove the placeholder key. The direct InnerTube call should derive the API key from YouTube watch HTML as the Baoyu reference does, or use a project-approved wrapper that does the same.
- Validate the response shape before assuming captions exist.
- Select caption tracks predictably:
  - prefer Chinese tracks,
  - then English,
  - then first usable caption track.
- Fetch timed text from the selected caption `baseUrl` and convert snippets into real `TranscriptSegment[]`.

### Error Semantics

Errors should distinguish:

- no caption tracks found,
- network/SSL/proxy failure,
- YouTube API/client/key extraction failure,
- invalid caption response,
- empty transcript.

The API may still return non-2xx on failure, but the message shown on the card should be concise and actionable, not a raw curl command with an internal placeholder key.

Recommended user-facing messages:

- `没有可下载字幕`
- `YouTube 字幕接口连接失败，请检查网络或代理`
- `YouTube 字幕接口配置无效`
- `字幕响应格式异常`

Log detailed diagnostics server-side.

### Frontend

The YouTube action label remains:

```text
下载字幕
```

On failure:

- keep `下载字幕` available as a retry,
- show the concise error inline,
- do not expose debug commands in the card UI.

## Layer Placement

- `packages/source-adapters` owns YouTube metadata/caption acquisition.
- `packages/application` owns `ensureTranscriptUseCase` behavior and transcript/document persistence.
- `apps/api` owns mapping domain/application errors to appropriate HTTP responses.
- `apps/web` owns concise inline error rendering only.

Boundary answers:

1. The failing behavior belongs to the YouTube source adapter and `ensureTranscriptUseCase`.
2. The UI should not know about InnerTube keys, curl commands, or caption URL details.
3. Domain remains unaware of YouTube API/client mechanics.
4. The boundary would be violated if the card invokes YouTube directly or if the backend creates fake transcript assets on failure.
5. Verification must prove real captions are persisted or a truthful no-caption/network error is shown.

## Target Files

Likely files:

- `packages/source-adapters/src/youtubeAdapter.ts`
- `packages/application/src/index.ts`
- `apps/api/src/routes/tasks.ts`
- `apps/web/src/components/TaskCard.tsx` only if error wording needs mapping
- `docs/GOTCHAS.md` if the placeholder key/network/proxy trap should be recorded
- `/Users/a123/claude-model/.claude-zhipu/skills/baoyu-youtube-transcript/SKILL.md` and `scripts/main.ts` as read-only references only

## Acceptance Criteria

- `youtubeAdapter` no longer contains the placeholder key `AIzaSyAO_SbdVz3VzVzVzVzVzVzVzVzVzVzVzVz`.
- `youtubeAdapter` derives or obtains InnerTube access according to the Baoyu reference rather than hard-coding a fake key.
- YouTube `下载字幕` does not require a downloaded video file.
- Successful caption download writes real transcript/document assets and returns `platform_caption` readiness.
- Failure returns a clear error category/message without leaking raw curl command strings into the card.
- The card keeps `下载字幕` available for retry after failure.
- No fake transcript/document readiness is created on failure.
- YouTube remains separate from the `yt-dlp` X/Xiaohongshu/Douyin media path.

## Verification Commands

Gemini should run:

```bash
npm run build
npm run typecheck
```

Focused verification:

```bash
rg -n "AIzaSyAO_SbdVz3VzVz|curl -s -X POST.*youtubei" packages/source-adapters/src/youtubeAdapter.ts
curl -sS -X POST http://127.0.0.1:8001/api/tasks/yt-3JLxZBw8q7Y/ensure-transcript
curl -sS http://127.0.0.1:8001/api/tasks/yt-3JLxZBw8q7Y
```

If the local environment cannot reach YouTube, verify the failure path:

- status/message clearly says network/proxy/API config failure,
- no transcript/document assets are written,
- report includes the exact server-side diagnostic.

If the environment can reach YouTube, verify success:

- `transcript-raw.json`,
- `transcript-sentences.json`,
- `transcript.vtt`,
- `document.md`,
- readiness shows `platform_caption`.

## Expected Report

Write the Gemini report to:

```text
docs/plans/reports/2026-04-29-fix-youtube-caption-inner-tube-500-report.md
```

The report must include:

- changed files,
- exact commands run,
- API response before/after,
- generated asset list or explicit no-asset failure verification,
- whether `docs/GOTCHAS.md` was updated and why,
- unresolved risks around YouTube API/client/key/network access.
