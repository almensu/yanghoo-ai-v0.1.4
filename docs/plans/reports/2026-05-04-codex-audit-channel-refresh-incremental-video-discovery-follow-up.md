# Codex Audit: Stage 7 Channel Refresh Incremental Discovery Follow-Up

Date: 2026-05-04
Auditor: Codex
Plan: `docs/plans/2026-05-04-stage-channel-refresh-incremental-video-discovery-audit-fix.md`
Gemini Report: `docs/plans/reports/2026-05-04-channel-refresh-incremental-video-discovery-audit-fix-report.md`
Result: Accepted

## Commands Run

```bash
npx tsx scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts
npm run typecheck
npm run build
npx tsx -e "import { mergeChannelVideos } from './packages/application/src/refreshChannelVideosUseCase.ts'; const v=(id:string,title=id)=>({id:'yt-'+id,videoId:id,title,url:'https://youtu.be/'+id}); const cases=[mergeChannelVideos([], [v('new1','A'), v('new2','B'), v('new1','A dup')], 'latest'), mergeChannelVideos([v('old','Old')], [v('new1','A'), v('new2','B'), v('old','Old')], 'latest')]; console.log(JSON.stringify(cases.map(r=>({ids:r.merged.map(x=>x.videoId), added:r.addedVideos.map(x=>x.videoId)})), null, 2));"
```

## Verification Result

- Stage 7 verification script passed: 50/50 assertions.
- `npm run typecheck` passed.
- `npm run build` passed.
- Additional duplicate/order probe passed:

```json
[
  {
    "ids": ["new1", "new2"],
    "added": ["new1", "new2"]
  },
  {
    "ids": ["new1", "new2", "old"],
    "added": ["new1", "new2"]
  }
]
```

## Findings

No blocking issues remain.

The follow-up fixes address the earlier rejection points:

- `packages/application/src/refreshChannelVideosUseCase.ts:20` now tracks `seenVideoIds` from local videos.
- `packages/application/src/refreshChannelVideosUseCase.ts:27` skips repeated remote new IDs after the first occurrence.
- `packages/application/src/refreshChannelVideosUseCase.ts:59` preserves remote order for newly discovered videos by collecting them first and prepending the final array.
- `apps/web/src/components/LearningChannelVideoTable.tsx:171` and `apps/web/src/components/LearningChannelVideoTable.tsx:180` expose both `Refresh latest {N}` and `Full refresh`.
- `scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts` now covers duplicate-new-ID rejection and multi-new order preservation.

## Residual Risks

1. Concurrent refresh calls can still race on `videos.json`. This is acceptable for the current single-user workflow.
2. The refresh flow still depends on yt-dlp ordering for the fetched window, but the merge logic is now order-safe within that window.
3. A live API smoke test was not rerun in this audit; deterministic verification and build/typecheck were sufficient for acceptance here.

## Summary

Stage 7 audit-fix work is ready for acceptance. The duplicate-new-ID bug is closed, new video ordering is preserved, and the web UI now exposes both refresh modes required by the plan.
