# X Video Download and Transcription UI

## Owner

Gemini implements. Codex reviews.

## Goal

Fix the X source card workflow shown in the UI screenshot:

- X URL import currently leaves the card action area incomplete.
- The UI must expose a clear `下载视频` action for X video posts.
- After the video is downloaded, the UI must expose a clear `视频转字幕` action.
- The downloaded video, extracted audio, transcript, VTT, Markdown, and manifests must persist under the canonical data root.

Target workflow:

```text
X URL -> capture metadata -> download video -> extract audio -> MLX audio transcription -> transcript/document assets -> read
```

User-facing card actions should be:

```text
下载视频 -> 视频转字幕 -> 阅读
```

If X download requires cookies/auth, the UI and report must show that blocker clearly. Do not fake a downloaded video or transcript.

## Context

Current relevant code:

- `packages/source-adapters/src/xAdapter.ts` captures X URLs and attempts metadata via `yt-dlp`.
- `packages/application/src/downloadSourceMediaUseCase.ts` can download media with `yt-dlp`.
- `packages/application/src/resolveSourceMediaUseCase.ts` can write `media-manifest.json`.
- `apps/api/src/routes/tasks.ts` exposes:
  - `POST /api/tasks/:taskId/resolve-media`
  - `POST /api/tasks/:taskId/download-media`
  - `POST /api/tasks/:taskId/transcribe-audio`
- `apps/web/src/components/TaskCard.tsx` currently shows Chinese transcript/audio actions, but X/social video cards can end up with no visible primary action besides the menu.

Important screenshot symptom:

- X card status is `待处理`.
- It says `未下载音频`.
- The action area only shows the overflow menu.
- Users cannot discover that X video can be downloaded or transcribed.

## Reference and Decisions

Use this repo's accepted ADRs:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`

Relevant plans/reports:

- `docs/plans/2026-04-27-x-douyin-video-download-persistence.md`
- `docs/plans/reports/2026-04-27-codex-audit-x-douyin-video-download-readiness.md`
- `docs/plans/2026-04-28-ui-explicit-transcript-audio-actions.md`
- `docs/plans/reports/2026-04-28-codex-audit-verify-mlx-audio-end-to-end-fixture.md`

If `/Volumes/2T/com/yanghoo205/yanghoo-reference` is mounted, consult:

- `reference/test-strategy.md`
- `reference/review-checklists/`
- `reference/Gotchas.md`

If not mounted, use the ADRs above.

## Non-goals

- Do not build a full media control panel.
- Do not add destructive media management actions as primary card buttons.
- Do not use X post text, descriptions, thumbnails, or metadata as transcript content.
- Do not mark readiness `markdown_ready` until real transcription output is persisted.
- Do not fake X media download if `yt-dlp` is blocked by cookies/auth.
- Do not commit downloaded video/audio/transcript fixture data.
- Do not hard-code one X status ID as product logic.

## Target Files

Likely source files:

- `apps/web/src/components/TaskCard.tsx`
- `apps/web/src/api/client.ts`
- `apps/web/src/types.ts`
- `apps/api/src/routes/tasks.ts`
- `packages/application/src/downloadSourceMediaUseCase.ts`
- `packages/application/src/index.ts`
- `packages/domain/src/index.ts`
- `packages/domain/src/storage.ts`
- `packages/storage/src/index.ts`
- `scripts/media/download-source-media.ts`
- `scripts/media/extract-source-audio.ts`
- `scripts/transcript/transcribe-audio-mlx.ts`

Create precise new files if needed, for example:

- `packages/application/src/extractSourceAudioUseCase.ts`
- `packages/application/src/transcribeSourceMediaUseCase.ts`

Avoid vague names such as `mediaService.ts`, `videoManager.ts`, or `handler.ts`.

Expected report:

- `docs/plans/reports/2026-04-28-x-video-download-and-transcribe-ui-report.md`

## Required Behavior

### 1. X card UI must not have an empty action area

For X/social post video sources:

- If the document is ready, primary action is `阅读`.
- If no downloaded media exists, primary action is `下载视频`.
- If media is downloaded but no transcript document exists, primary action is `视频转字幕`.
- If video transcription is running, show `转写中...` and disable card actions.
- If video download is running, show `下载中...` and disable card actions.

The status panel should distinguish:

- transcript/document readiness,
- media state: `视频未下载`, `视频已下载`, or `视频下载失败`,
- audio state only when relevant.

Do not show `未下载音频` as the only actionable state on an X video card before the video has been downloaded.

### 2. Download X video to canonical storage

Use `yt-dlp` to download X video posts through `downloadSourceMediaUseCase`.

Persist:

```text
data/sources/{sourceId}/media.{ext}
data/sources/{sourceId}/media-manifest.json
```

`media-manifest.json` must record:

- `sourceId`
- `status: downloaded` or `failed`
- `platform: x`
- `mediaKind: video`
- `sourceUrl`
- `localPath`
- `ext`
- `byteSize`
- `fetchedAt`
- `errorMessage` if failed

If X requires cookies/auth, persist `status: failed` and include the actionable error message.

### 3. Convert downloaded video to transcript

Add a document-readiness-oriented flow for downloaded video:

```text
downloaded media -> extract audio -> audio-manifest.json -> transcribeAudioUseCase -> transcript/document assets
```

Recommended implementation:

1. Add an application use case that reads `media-manifest.json`.
2. Requires `status: downloaded` and a local video path.
3. Uses `ffmpeg` to extract audio into:

```text
data/sources/{sourceId}/audio.wav
```

or another explicit audio path supported by MLX.

4. Writes `audio-manifest.json` with:

```json
{
  "sourceId": "<sourceId>",
  "status": "fetched",
  "localPath": "data/sources/<sourceId>/audio.wav",
  "url": "media://data/sources/<sourceId>/media.<ext>",
  "fetchedAt": "<ISO timestamp>"
}
```

5. Calls the existing `transcribeAudioUseCase(sourceId)` so transcript provenance remains:

```text
sourceType: mlx_audio
engine: mlx-audio
model: mlx-community/whisper-large-v3-turbo-asr-fp16
```

Suggested endpoint:

```text
POST /api/tasks/:taskId/transcribe-media
```

Alternative endpoint names are acceptable if they are clear, but the UI label must be `视频转字幕`.

### 4. Preserve clear failure behavior

Failures must be visible in the card inline error:

- missing downloaded media,
- `yt-dlp` auth/cookie failure,
- missing `ffmpeg`,
- missing or incompatible MLX runtime,
- MLX transcription failure.

Do not reduce backend diagnostic messages to generic `500` text.

### 5. Keep source metadata usable in cards

For X cards:

- title should be clamped and not overflow,
- thumbnail should render when available,
- missing thumbnail should still keep a stable card aspect ratio,
- buttons should fit inside the card at desktop and mobile widths.

The screenshot state must be fixed: an X card must not show only the overflow menu when a next action exists.

## API Requirements

Keep routes thin. Route logic should call application use cases only.

Expected routes after this task:

```text
POST /api/tasks/:taskId/download-media
POST /api/tasks/:taskId/transcribe-media
```

`download-media` should return updated readiness including `hasMedia`, `mediaStatus`, and `mediaKind`.

`transcribe-media` should return updated readiness after extracting audio and transcribing, or a clear error.

## UI Requirements

Update `TaskCard` action decision rules:

```text
X/social_post with no readable document and no downloaded media:
  show enabled primary 下载视频

X/social_post with mediaStatus downloaded and no readable document:
  show enabled primary 视频转字幕

X/social_post with mediaStatus failed:
  show 下载视频 as retry and show failed state/error if available

Ready document:
  show 阅读
```

Keep secondary menu for:

- `解析媒体`
- `强制下载`
- `强制处理`
- metadata inspection

But do not rely on the menu for the normal X workflow.

## Scripts

Implement or update one-action scripts as needed:

```bash
npx tsx scripts/media/download-source-media.ts <sourceId>
npx tsx scripts/media/extract-source-audio.ts <sourceId>
npx tsx scripts/transcript/transcribe-audio-mlx.ts <sourceId>
```

Scripts must orchestrate package use cases. Do not put business logic only in scripts.

## Verification Commands

Run:

```bash
npm run build
npm run typecheck
yt-dlp --version
ffmpeg -version
```

Use the X URL from the screenshot or another real X video URL. Report the exact URL used.

Capture/import:

```bash
npx tsx scripts/collect/collect-x-url.ts '<x-video-url>'
```

Download:

```bash
npx tsx scripts/media/download-source-media.ts <xSourceId>
find data/sources/<xSourceId> -maxdepth 1 -type f -print | sort
cat data/sources/<xSourceId>/media-manifest.json
```

Transcribe media:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
npx tsx scripts/media/extract-source-audio.ts <xSourceId>

MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
npx tsx scripts/transcript/transcribe-audio-mlx.ts <xSourceId>
```

or, if implemented as API route:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/<xSourceId>/download-media
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/<xSourceId>/transcribe-media
```

Verify readiness:

```bash
node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('<xSourceId>'), null, 2)))"
find data/sources/<xSourceId> -maxdepth 1 -type f -print | sort
cat data/sources/<xSourceId>/transcript-manifest.json
sed -n '1,80p' data/sources/<xSourceId>/document.md
```

UI verification:

- Start `npm run dev`.
- Import an X video URL.
- Confirm the X card shows `下载视频` instead of only the overflow menu.
- After video download succeeds, confirm the card shows `视频转字幕`.
- After transcription succeeds, confirm the card shows `阅读`.
- If X download or MLX transcription fails, confirm the card shows the backend diagnostic inline.

## Acceptance Criteria

- X card no longer has an empty primary action area after URL import.
- X card can trigger video download from the main card action.
- Downloaded X video persists under `data/sources/{sourceId}/media.{ext}`.
- `media-manifest.json` accurately reports `downloaded` or `failed`.
- Downloaded X video can be converted into an audio asset under the same source directory.
- `audio-manifest.json` is written only after real audio extraction succeeds.
- MLX transcription writes:

```text
transcript-raw.json
transcript-sentences.json
transcript.vtt
transcript-manifest.json
document.md
```

- `transcript-manifest.json` records `sourceType: mlx_audio`.
- Readiness becomes `markdown_ready` only after real transcript/document assets exist.
- UI shows `阅读` after transcription succeeds.
- `npm run build` passes.
- `npm run typecheck` passes.
- Generated media/audio/transcript data is not committed.

## Failure Acceptance

If X media download is blocked by cookies/auth, this task can still be partially accepted only if:

- `media-manifest.json` records `status: failed`,
- the API returns a clear diagnostic,
- the UI shows that diagnostic inline,
- the report includes exact `yt-dlp` output summary,
- no transcript/document readiness is falsely claimed.

However, the UI empty-action bug must still be fixed.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-28-x-video-download-and-transcribe-ui-report.md
```

Report must include:

- changed files,
- exact X URL tested,
- UI state before/after descriptions or screenshots,
- exact commands run,
- `yt-dlp` and `ffmpeg` versions,
- API responses if routes were used,
- generated file list,
- `media-manifest.json`,
- `audio-manifest.json` if extraction succeeds,
- `transcript-manifest.json` and readiness output if transcription succeeds,
- unresolved risks and blockers.
