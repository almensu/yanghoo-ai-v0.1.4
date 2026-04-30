# Fix Apple Podcast Audio Download and Readiness

## Goal

Fix Apple Podcasts `下载音频` failure and the misleading readiness state for failed audio downloads.

Observed browser failure:

```text
POST /api/tasks/apple-podcast-1000551710062/fetch-audio 500
Command failed: curl -sL "<podcast-audio-url>" -o ".../data/sources/apple-podcast-1000551710062/audio.mp3"
```

Observed local source record:

```text
data/sources/apple-podcast-1000551710062/record.json
metadata.mediaUrl = https://pfx.vpixl.com/.../default.mp3?... 
```

Observed local redirect/TLS/timeout failure:

```text
curl -IL --max-time 20 -A "Mozilla/5.0" "$AUDIO_URL"
...
pfx.vpixl.com -> dts.podtrac.com -> pdst.fm -> prefix.up.audio
curl: (35) LibreSSL SSL_connect: SSL_ERROR_SYSCALL in connection to prefix.up.audio:443
```

The same class of failure may appear as a connection timeout:

```text
Operation timed out
Connection timed out
curl: (28)
ETIMEDOUT
```

Observed `yt-dlp` failure:

```text
ERROR: [generic] Unable to download webpage:
[SSL: UNEXPECTED_EOF_WHILE_READING] EOF occurred in violation of protocol
```

## Problem

There are three issues:

1. Podcast audio URLs can be tracking redirect chains that timeout or fail at intermediate HTTPS hosts.
2. The failed `audio-manifest.json` is currently enough for readiness to return `hasAudio: true`.
3. The frontend card receives raw shell command failure text instead of a concise user-facing error.

This makes the card action state unclear and may lead users toward transcription even when no audio file exists.

## Non-Goals

- Do not treat podcast descriptions or shownotes as transcripts.
- Do not claim `markdown_ready` from metadata-only podcast records.
- Do not bypass paid/private/authenticated podcast content.
- Do not expose raw shell commands or full signed/tracking URLs in card error text.
- Do not implement a generic `podcastSourceAdapter`; keep `applePodcastAdapter` concrete.

## Required Behavior

### Audio Download

`fetchAudioUseCase` must support podcast audio URLs more robustly:

- Use a downloader appropriate for direct audio URLs and redirect chains.
- Include timeout, retry, redirect-following, User-Agent, and HTTP failure checks.
- Validate that the final file exists and has non-zero size before writing `status: fetched`.
- If download fails, write a failed manifest with a concise `errorMessage`.

Recommended user-facing errors:

- `音频下载失败：网络或 SSL 连接失败`
- `音频下载失败：连接超时，请稍后重试或检查代理`
- `音频下载失败：远程文件不可访问`
- `音频下载失败：没有可用音频地址`
- `音频下载失败：下载后文件为空`

Server logs may include detailed stderr/redirect diagnostics.

### Readiness

Update readiness logic:

- `hasAudio` must mean audio is actually fetched and usable.
- Parse `audio-manifest.json`.
- Return `hasAudio: true` only if:
  - `status === "fetched"`,
  - `localPath` is present,
  - the resolved local file exists,
  - file size is greater than zero.
- If `status === "failed"`, expose enough state for the UI to keep `下载音频` available as retry and show the concise error.

If needed, extend `DocumentReadiness` with:

```ts
audioStatus?: AudioStatus;
audioErrorMessage?: string;
```

### Frontend

Card behavior for Apple Podcasts:

- metadata only -> show `下载音频`,
- failed audio download -> keep `下载音频` available as retry and show concise inline error,
- fetched audio -> show `转录`,
- document ready -> show `阅读`.

Do not show raw `curl` or `yt-dlp` commands in the card.

### Running Dev Server

The browser error shows an old `curl -sL` implementation, while current local source contains a `yt-dlp` downloader path. Gemini should verify the running API process is restarted after code changes and report the API PID/command if relevant.

## Target Files

Likely files:

- `packages/application/src/index.ts` for `fetchAudioUseCase`
- `packages/storage/src/index.ts` for readiness
- `packages/domain/src/index.ts` if readiness fields are added
- `apps/api/src/routes/tasks.ts` if error mapping needs cleanup
- `apps/web/src/components/TaskCard.tsx` if failed audio state/error rendering needs cleanup
- `docs/GOTCHAS.md` if new traps are discovered

## Acceptance Criteria

- `audio-manifest.json` with `status: failed` does not make `/api/tasks/:id` return `documentAssets.hasAudio: true`.
- Connection timeout is mapped to a concise timeout error, not a raw command string.
- Failed Apple Podcast audio download keeps the card on `下载音频`, not `转录`.
- The card shows a concise error, not a raw shell command or full tracking URL.
- Successful audio download writes a non-empty audio file and `audio-manifest.json` with `status: fetched`, `localPath`, `size`, and `fetchedAt`.
- `下载音频` remains retryable after a failed attempt.
- No transcript/document assets are created from failed audio download.
- `npm run build` and `npm run typecheck` pass.

## Verification Commands

Gemini should run:

```bash
npm run build
npm run typecheck
```

Focused checks:

```bash
cat data/sources/apple-podcast-1000551710062/record.json
cat data/sources/apple-podcast-1000551710062/audio-manifest.json
curl -sS http://127.0.0.1:8001/api/tasks/apple-podcast-1000551710062
curl -sS -i -X POST http://127.0.0.1:8001/api/tasks/apple-podcast-1000551710062/fetch-audio
```

Redirect diagnostics:

```bash
AUDIO_URL=$(node -e "console.log(JSON.parse(require('fs').readFileSync('data/sources/apple-podcast-1000551710062/record.json','utf8')).metadata.mediaUrl)")
curl -IL --connect-timeout 10 --max-time 30 -A "Mozilla/5.0" "$AUDIO_URL"
yt-dlp --proxy "" --no-playlist --simulate "$AUDIO_URL"
```

If the local network cannot reach the final podcast audio host, verify the failure path rather than claiming success.
If the failure is a timeout, verify the card shows `音频下载失败：连接超时，请稍后重试或检查代理` or equivalent concise wording.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-29-fix-apple-podcast-audio-download-readiness-report.md
```

The report must include:

- changed files,
- exact commands run,
- before/after `/api/tasks/:id` readiness,
- failed and/or successful `audio-manifest.json`,
- generated file list,
- browser-observed card action state,
- unresolved network/proxy risks.
