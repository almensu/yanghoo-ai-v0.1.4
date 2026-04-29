# Fix X Silent Video Transcription State

## Owner

Gemini implements. Codex reviews.

## Goal

Fix the X video transcription failure reported from the UI:

```text
POST /api/tasks/x-2048950182495359392/transcribe-media -> 500
Media file has no audio stream to extract.
```

The app must distinguish these states:

```text
video downloaded with audio -> 视频转字幕
video downloaded without audio -> 无音轨，不能转字幕
video download failed -> 下载失败，可重试
```

Do not keep offering `视频转字幕` as the primary action for a media file that has already been proven to have no audio stream.

## Evidence

Source:

```text
x-2048950182495359392
https://x.com/vista8/status/2048950182495359392?s=20
```

Observed browser error:

```text
Failed to load resource: the server responded with a status of 500
transcribeVideo failed: Error: Media file has no audio stream to extract.
```

Observed local files:

```text
data/sources/x-2048950182495359392/media.mp4
data/sources/x-2048950182495359392/media-manifest.json
data/sources/x-2048950182495359392/audio-manifest.json
```

Observed `media-manifest.json`:

```json
{
  "sourceId": "x-2048950182495359392",
  "status": "downloaded",
  "platform": "x",
  "mediaKind": "video",
  "sourceUrl": "https://x.com/vista8/status/2048950182495359392?s=20",
  "localPath": "data/sources/x-2048950182495359392/media.mp4",
  "ext": "mp4",
  "byteSize": 17724070
}
```

Codex verified:

```bash
ffprobe -hide_banner -show_streams -of json data/sources/x-2048950182495359392/media.mp4
```

Result:

- one H.264 video stream
- no audio stream

Codex also checked formats:

```bash
yt-dlp -F 'https://x.com/vista8/status/2048950182495359392?s=20'
```

Result:

- HLS formats are listed as `video only`.
- A small HTTP format probe also produced an MP4 with no audio stream.

This specific X post appears to be silent video. The product should report that clearly instead of treating it as a transcribable media item.

## Reference and Decisions

Use:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`
- `docs/decisions/0005-script-entrypoint-naming.md`
- `docs/plans/2026-04-28-x-video-download-and-transcribe-ui.md`
- `docs/plans/reports/2026-04-28-x-video-download-and-transcribe-ui-report.md`

If `/Volumes/2T/com/yanghoo205/yanghoo-reference` is mounted, consult:

- `reference/test-strategy.md`
- `reference/review-checklists/`
- `reference/Gotchas.md`

## Non-goals

- Do not fake transcript text for silent video.
- Do not use X post text or metadata as transcript.
- Do not mark readiness `markdown_ready` when no transcript exists.
- Do not commit downloaded X media or generated fixture data.
- Do not add broad media-management UI.

## Target Files

Likely:

- `packages/domain/src/index.ts`
- `packages/storage/src/index.ts`
- `packages/application/src/downloadSourceMediaUseCase.ts`
- `packages/application/src/extractSourceAudioUseCase.ts`
- `packages/application/src/transcribeSourceMediaUseCase.ts`
- `apps/web/src/components/TaskCard.tsx`
- `apps/web/src/types.ts`
- `scripts/media/extract-source-audio.ts`

Expected report:

- `docs/plans/reports/2026-04-29-fix-x-silent-video-transcribe-state-report.md`

## Required Fix

### 1. Record media audio capability

Extend the persisted media state so the UI can know whether a downloaded video has audio.

Acceptable approaches:

- Add optional fields to `MediaAsset`:

```ts
hasAudio?: boolean;
audioStreamCount?: number;
```

or:

```ts
transcribable?: boolean;
notTranscribableReason?: string;
```

Use names that are explicit and domain-readable.

After media download succeeds, run `ffprobe` against the downloaded media and persist whether an audio stream exists.

For `x-2048950182495359392`, expected manifest state should include the equivalent of:

```json
{
  "status": "downloaded",
  "mediaKind": "video",
  "hasAudio": false,
  "notTranscribableReason": "Media file has no audio stream."
}
```

### 2. Do not write `audio-manifest.json` as `failed` for a normal silent video

Silent video is a media capability issue, not an audio asset fetch failure.

If `extractSourceAudioUseCase` finds no audio stream:

- do not claim an audio asset exists,
- do not leave the UI in a state that suggests retrying transcription will help,
- update media metadata or return a clear typed/domain error that the route can expose.

If an `audio-manifest.json` with `status: failed` already exists from this exact no-audio case, Gemini may remove it during verification fixture cleanup, but must not delete unrelated user data.

### 3. UI state must not show `视频转字幕` for no-audio media

Update `TaskCard` rules:

```text
mediaStatus downloaded + hasAudio true + no readable document:
  primary action: 视频转字幕

mediaStatus downloaded + hasAudio false:
  no primary transcribe action
  show compact state: 视频无音轨
  keep menu actions secondary if needed

mediaStatus downloaded + hasAudio unknown:
  either probe on download or allow one attempted transcribe, but after no-audio failure persist the no-audio state and stop offering primary transcribe
```

For the reported source, after refresh the card should show:

```text
视频已下载 · 视频无音轨
```

and should not show `视频转字幕` as the main button.

### 4. Improve download format selection where possible

For sources that do have separate audio/video formats, `downloadSourceMediaUseCase` should prefer a format that includes audio or merges best video and best audio:

```bash
yt-dlp -f "bv*+ba/b" --merge-output-format mp4 ...
```

But this must not create a fake audio stream for silent X videos. If `yt-dlp -F` exposes no audio-bearing format, persist the no-audio state.

### 5. Preserve clear API errors

If `POST /api/tasks/:taskId/transcribe-media` is called on a no-audio media item, return a clear non-generic error message, for example:

```json
{
  "message": "Downloaded media has no audio stream; cannot transcribe this video."
}
```

The UI should display that backend message inline if the user reaches this route through a menu action.

## Verification Commands

Run:

```bash
npm run build
npm run typecheck
yt-dlp -F 'https://x.com/vista8/status/2048950182495359392?s=20'
ffprobe -hide_banner -show_streams -of json data/sources/x-2048950182495359392/media.mp4
```

Verify source state after the fix:

```bash
cat data/sources/x-2048950182495359392/media-manifest.json
DATA_DIR=data node -e "import('@yanghoo/storage').then(async m=>console.log(JSON.stringify(await m.documentStorage.getDocumentReadiness('x-2048950182495359392'), null, 2)))"
```

Start the app and verify UI:

```bash
npm run dev
```

Expected:

- X card no longer offers `视频转字幕` as primary action for `x-2048950182495359392`.
- Card shows a compact no-audio state.
- No transcript/document assets are generated for this silent video.

Also verify a positive case with a known media file that has audio, if available:

```bash
ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 <media-with-audio>
```

Expected:

- media with audio still shows `视频转字幕`,
- extraction writes `audio-manifest.json`,
- MLX transcription can proceed when runtime is configured.

## Acceptance Criteria

- No-audio X media is persisted as downloaded but not transcribable.
- `audio-manifest.json` is not used as the primary source of no-audio state.
- UI does not show `视频转字幕` as the primary action for known no-audio media.
- API returns a clear diagnostic if `transcribe-media` is called anyway.
- Media with audio remains transcribable.
- `npm run build` passes.
- `npm run typecheck` passes.
- Generated data and `tsconfig.tsbuildinfo` churn are not included in the final patch.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-29-fix-x-silent-video-transcribe-state-report.md
```

Report must include:

- changed files,
- exact `ffprobe` evidence for `x-2048950182495359392`,
- updated `media-manifest.json`,
- UI state description after refresh,
- API response for `transcribe-media` on the silent video,
- positive media-with-audio verification if available,
- build/typecheck results,
- unresolved risks.
