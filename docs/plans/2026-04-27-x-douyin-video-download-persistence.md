# X and Douyin Video Download Persistence

## Owner

Gemini implements. Codex reviews.

## Goal

Implement real media download persistence for X and Douyin video sources, without depending on MLX transcription.

Core workflow:

```text
source URL -> platform adapter -> real metadata -> real media URL -> downloaded video file -> media manifest -> API/homepage readiness
```

## Non-goals

- Do not implement ASR/transcription in this task.
- Do not use `mlx-audio`; it is blocked on macOS 12.4 because `mlx` requires macOS >= 14.
- Do not generate fake media files or fake readiness.
- Do not build a broad media control panel.
- Do not hard-code one user sample URL.
- Do not store downloaded media outside the canonical root `data/sources/{sourceId}/`.

## Reference Rules Used

From `/Volumes/2T/com/yanghoo205/yanghoo-reference`:

- `decision-rules.md`: platform adapters belong in packages; app routes only call application use cases.
- `layer-boundaries.md`: network/subprocess/file writes must be explicit infrastructure/application behavior, not hidden in UI.
- `naming.md`: avoid broad `service/manager/handler`; use responsibility names.
- `test-strategy.md`: use adapter contract tests/fixtures and file-writing integration checks.

## Target Files

Expected files/directories:

- `packages/domain/src/index.ts`
- `packages/domain/src/storage.ts`
- `packages/source-adapters/src/douyinAdapter.ts`
- `packages/source-adapters/src/xAdapter.ts`
- `packages/source-adapters/src/index.ts`
- `packages/application/src/index.ts` or split into precise use case files if Gemini chooses
- `packages/storage/src/index.ts`
- `apps/api/src/routes/tasks.ts`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/TaskCard.tsx`
- `scripts/collect/collect-douyin-url.ts`
- `scripts/collect/collect-x-url.ts`
- `scripts/media/resolve-media-url.ts`
- `scripts/media/download-source-media.ts`
- report under `docs/plans/reports/`

If Gemini creates new files, names must state responsibility, for example:

- `resolveSourceMediaUseCase.ts`
- `downloadSourceMediaUseCase.ts`
- `douyinMediaResolver.ts`
- `xMediaResolver.ts`
- `mediaAssetManifest.ts`

Avoid vague `mediaService.ts` or `downloadManager.ts`.

## Data Contract

Add a general media asset contract separate from audio/transcript:

```ts
type MediaAssetStatus = 'missing' | 'resolved' | 'downloaded' | 'failed';

interface MediaAsset {
  sourceId: string;
  status: MediaAssetStatus;
  platform: Platform;
  mediaKind: 'video' | 'audio' | 'image' | 'unknown';
  sourceUrl?: string;
  resolvedUrl?: string;
  localPath?: string;
  ext?: string;
  mimeType?: string;
  byteSize?: number;
  durationSeconds?: number;
  fetchedAt?: string;
  errorMessage?: string;
}
```

Suggested paths:

```text
data/sources/{sourceId}/media.{ext}
data/sources/{sourceId}/media-manifest.json
```

Do not overload `audio-manifest.json` for video.

## Platform Requirements

### Douyin

Implement real Douyin URL handling:

- accept `https://www.douyin.com/video/{id}`
- accept short share URLs such as `https://v.douyin.com/.../`
- resolve redirects where needed
- persist real metadata when available: title, author, cover, duration, platform video ID
- resolve/download real video media when available
- if cookies or anti-bot restrictions block download, persist explicit failed media state with reason

Implementation may use `yt-dlp` as the first media resolver if it works in this environment:

```bash
yt-dlp --dump-json <url>
yt-dlp -o <target> <url>
```

Gemini must verify with actual commands and include output summaries.

### X

Implement an X adapter and collector:

- accept `https://x.com/{user}/status/{id}`
- accept `https://twitter.com/{user}/status/{id}`
- extract tweet/status ID
- persist real metadata when available
- resolve/download real video media if available
- handle common auth/cookie restrictions explicitly

If X requires cookies, Gemini must not fake success. The report should state:

```text
download failed: authentication/cookies required
```

and readiness should reflect `failed` or `metadata_only`, not `downloaded`.

## Application/API Requirements

Add use cases:

```text
resolveSourceMedia
downloadSourceMedia
```

Add API endpoints:

```text
POST /api/tasks/:taskId/resolve-media
POST /api/tasks/:taskId/download-media
```

Route logic should call application use cases only.

API task readiness should include media state, for example:

```json
{
  "hasMedia": true,
  "mediaStatus": "downloaded",
  "mediaKind": "video"
}
```

Do not mark transcript/document readiness from media download alone.

## Homepage UX

For X/Douyin cards:

- Primary action: `Download Video` if no media file exists and source supports media.
- Primary action: `Video Downloaded` or `Read Transcript` only when later transcript readiness exists.
- Secondary menu: `Resolve Media`, `Re-download Video`, `View Metadata`.

The card should show compact state:

- platform
- duration if known
- media downloaded/missing/failed
- transcript readiness separately

If download fails because auth/cookies are required, show a visible card error. Do not only log to console.

## Scripts

Implement scripts as one-action entry points:

```bash
npx tsx scripts/collect/collect-douyin-url.ts '<douyin-url>'
npx tsx scripts/collect/collect-x-url.ts '<x-url>'
npx tsx scripts/media/resolve-media-url.ts <sourceId>
npx tsx scripts/media/download-source-media.ts <sourceId>
```

Scripts should orchestrate package use cases. Business logic stays in packages.

## Verification Commands

Gemini must run:

```bash
npm run build
npm run typecheck
yt-dlp --version
npx tsx scripts/collect/collect-douyin-url.ts '<real-douyin-url>'
npx tsx scripts/media/resolve-media-url.ts <douyinSourceId>
npx tsx scripts/media/download-source-media.ts <douyinSourceId>
npx tsx scripts/collect/collect-x-url.ts '<real-x-video-url>'
npx tsx scripts/media/resolve-media-url.ts <xSourceId>
npx tsx scripts/media/download-source-media.ts <xSourceId>
```

Then verify generated files:

```bash
find data/sources/<sourceId> -maxdepth 1 -type f | sort
cat data/sources/<sourceId>/media-manifest.json
```

If local dev servers are running:

```bash
curl -sS http://127.0.0.1:8001/api/tasks
curl -sS http://127.0.0.1:3000/api/tasks
```

## Acceptance Criteria

- X has a real adapter and collector script.
- Douyin adapter no longer creates only placeholder metadata when real metadata can be resolved.
- Media download writes a real video file under canonical `data/sources/{sourceId}/`.
- `media-manifest.json` records resolved URL/local path/status/byte size/platform.
- API exposes media readiness separately from transcript/document readiness.
- Homepage shows a clear `Download Video` action for X/Douyin.
- Auth/cookie failures are explicit and visible; no fake success.
- `npm run build` and `npm run typecheck` pass.

## Expected Report

Write report to:

```text
docs/plans/reports/2026-04-27-x-douyin-video-download-persistence-report.md
```

Report must include:

- changed files
- platform URLs tested
- `yt-dlp` version and command outputs
- generated file lists
- manifest excerpts
- API/homepage readiness excerpts
- whether X required cookies/auth
- unresolved risks
