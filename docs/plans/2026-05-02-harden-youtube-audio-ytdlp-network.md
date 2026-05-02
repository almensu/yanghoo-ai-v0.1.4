# Harden YouTube Audio yt-dlp Network Path

Date: 2026-05-02

## Goal

Fix recurring YouTube fallback audio download failures such as:

```text
yt-9E-DoP76U1s 音频下载失败：网络或 SSL 连接失败
```

The durable fix is to remove hard-coded direct yt-dlp connections and make production yt-dlp calls honor proxy, retry, timeout, IPv4, User-Agent, and cookies configuration.

## Non-goals

- Do not replace the Baoyu/InnerTube caption-first YouTube strategy.
- Do not route normal YouTube cards through generic video download.
- Do not fake transcript readiness when audio download still fails.

## Target Files

- `packages/application/src/ytDlpNetworkOptions.ts`
- `packages/application/src/index.ts`
- `packages/application/src/downloadSourceMediaUseCase.ts`
- `packages/application/src/resolveSourceMediaUseCase.ts`
- `packages/source-adapters/src/ytDlpMetadataOptions.ts`
- `packages/source-adapters/src/*Adapter.ts` for yt-dlp metadata calls
- `docs/GOTCHAS.md`
- `docs/README.md`
- `README.md`

## Layer Placement

- Application layer owns source-level use cases such as `fetchAudio`, `downloadMedia`, and `resolveMedia`.
- Source adapter layer owns platform metadata capture.
- Network subprocess details stay behind small yt-dlp helper modules. UI must not know about proxy flags or cookies.

## Acceptance Criteria

- YouTube no-caption fallback audio no longer invokes `yt-dlp --proxy ""` by default.
- `YTDLP_PROXY` controls yt-dlp proxy behavior:
  - URL value means use that proxy first.
  - `direct`, `none`, or `off` means force direct mode.
  - missing value defaults to `http://127.0.0.1:7897` with direct fallback.
- yt-dlp calls include socket timeout, retries, extractor retries, fragment retries where relevant, desktop User-Agent, optional IPv4, and optional cookies.
- Errors shown to users are concise and mention proxy configuration when the failure is proxy/network related.
- Docs explain the recommended environment variables and the need to restart the API after changes.

## Verification Commands

```bash
npm run typecheck -w @yanghoo/source-adapters
npm run typecheck -w @yanghoo/application
npm run build -w @yanghoo/source-adapters
npm run build -w @yanghoo/application
npm run typecheck
npm run build
yt-dlp --version
YTDLP_PROXY=http://127.0.0.1:7897 yt-dlp --simulate --no-playlist -x --audio-format mp3 'https://www.youtube.com/watch?v=9E-DoP76U1s'
```

## Expected Report

Report changed files, verification commands, and whether the exact YouTube source could be tested in the local network environment.
