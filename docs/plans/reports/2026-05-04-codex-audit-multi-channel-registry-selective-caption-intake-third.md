# Codex Third Audit: Stage 6 Multi-channel Registry and Selective Caption Intake

Date: 2026-05-04
Reviewer: Codex
Gemini report: `docs/plans/reports/2026-05-04-multi-channel-registry-selective-caption-intake-report.md`
Prior audit: `docs/plans/reports/2026-05-04-codex-audit-multi-channel-registry-selective-caption-intake-follow-up.md`
Decision: Changes requested

## Verification Run by Codex

Codex ran:

```bash
npx tsx scripts/ops/verify-stage6-multi-channel-selective-intake.ts
npm run typecheck
npm run build
```

All three commands passed.

Codex also checked live API routes:

```bash
curl -sS 'http://127.0.0.1:8001/api/learning-channels'
curl -sS 'http://127.0.0.1:8001/api/learning-channels/youtube-UCxJGMJbjokfnr2-s4_RXPxQ/videos'
curl -sS 'http://127.0.0.1:8001/api/learning-channels/nonexistent/videos'
```

Observed:

- `GET /api/learning-channels`: 200
- Vanessa videos endpoint: 200, 30 videos
- nonexistent channel videos endpoint: 404

## Fixed Since Prior Audit

- The Stage 6 report now includes the requested API smoke evidence.
- The running API now exposes the learning-channel routes.
- The candidate filter no longer skips solely on `captionStatus === "caption_ready"`.
- The verification script now imports and calls real application use cases.
- `npm run typecheck` and `npm run build` pass.

## Remaining Finding

### P1: Real asset skip still happens after `captureSourceUseCase`, causing unnecessary YouTube network calls

File: `packages/application/src/syncSelectedEnglishCaptionsUseCase.ts`

The prior audit asked selected sync to derive skip/readiness from persisted English caption assets rather than stale selection state.

The stale state issue is fixed, but the skip check currently happens after this call:

```ts
const source = await captureSourceUseCase(video.url);
const sourceId = source.id;

if (!params.force && await hasEnglishCaptionAssets(sourceId)) {
  ...
}
```

Codex's verification run showed this is not just theoretical. The Stage 6 script printed:

```text
[UseCase] captureSourceUseCase for input: https://www.youtube.com/watch?v=st6vid001
[YouTubeAdapter] Fetching watch page: https://www.youtube.com/watch?v=st6vid001
[YouTubeAdapter] fetchHtml failed, using curl fallback: fetch failed
[YouTubeAdapter] Calling InnerTube v1/player for: st6vid001
[YouTubeAdapter] InnerTube call failed: Video unavailable: st6vid001
[UseCase] Source already exists: yt-st6vid001. Returning existing.
```

So the "already has English captions" path still performs a YouTube capture attempt before skipping. This is not acceptable for Stage 6 because the whole point of selected intake is controlled, bounded, low-risk acquisition. A ready selected video should not hit YouTube just to discover it can be skipped.

Required fix:

- Derive a candidate `sourceId` before capture, preferably from:
  - existing selection item `sourceId`,
  - existing caption-sync report item `sourceId`,
  - channel video record `id` when it is already canonical `yt-{videoId}`.
- If `force` is false and that sourceId has English caption assets, skip before calling `captureSourceUseCase`.
- Only call `captureSourceUseCase` when no ready local English caption assets are found.
- Update the verification script to assert the ready-skip path does not trigger YouTube network/capture logs. A simple way is to make the ready selected fixture use an obviously invalid video URL and require the skip path to pass without adapter logs/errors.

## Residual Risk

The current verification script now calls real use cases, but it still only covers the selected-sync skip path with pre-existing caption assets. It does not prove the network success path that fetches a new selected video's captions. That can be accepted as a residual risk after the pre-capture skip issue is fixed, because real network sync is expensive and was already covered by earlier Vanessa closed-loop work.

## Decision

Stage 6 is not accepted yet.

Gemini should move the real-asset skip check before `captureSourceUseCase` and update verification to prove ready selected videos are skipped without YouTube network/capture calls.
