# Codex Audit: Stage 6 Multi-channel Registry and Selective Caption Intake

Date: 2026-05-04
Reviewer: Codex
Plan: `docs/plans/2026-05-04-stage-multi-channel-registry-selective-caption-intake.md`
Decision: Changes requested

## Scope Reviewed

Files reviewed:

- `apps/api/src/routes/learningChannels.ts`
- `apps/api/src/server.ts`
- `apps/web/src/App.tsx`
- `apps/web/src/api/client.ts`
- `apps/web/src/components/LearningChannelLibrary.tsx`
- `apps/web/src/components/LearningChannelVideoTable.tsx`
- `apps/web/src/components/EnglishSentenceSearch.tsx`
- `packages/domain/src/channelVideoSelection.ts`
- `packages/domain/src/storage.ts`
- `packages/storage/src/index.ts`
- `packages/application/src/listLearningChannelsUseCase.ts`
- `packages/application/src/getLearningChannelVideosUseCase.ts`
- `packages/application/src/updateChannelVideoSelectionUseCase.ts`
- `packages/application/src/syncSelectedEnglishCaptionsUseCase.ts`

Reference guidance considered:

- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/layer-boundaries.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/naming.md`
- `/Users/a123/com/yanghoo205/yanghoo-reference/reference/test-strategy.md`
- `docs/GOTCHAS.md`

## Verification Run by Codex

Codex ran:

```bash
npm run typecheck
npm run build
```

Both commands passed.

Codex also checked for the expected Stage 6 Gemini report:

```text
docs/plans/reports/2026-05-04-multi-channel-registry-selective-caption-intake-report.md
```

The report was not found.

Codex checked for a Stage 6 verification script such as:

```text
scripts/ops/verify-stage6-multi-channel-selective-intake.ts
```

No Stage 6 verification script was found.

## Findings

### P0: Required Gemini report is missing

The Stage 6 plan requires a report at:

```text
docs/plans/reports/2026-05-04-multi-channel-registry-selective-caption-intake-report.md
```

No such report exists. Without it, Codex cannot verify:

- exact commands run,
- generated file evidence,
- selected vs unselected processing evidence,
- side-effect scan evidence,
- frontend verification evidence,
- skipped checks and unresolved risks.

Required fix:

- Gemini must write the Stage 6 report with the required evidence.

### P0: No deterministic Stage 6 verification proves selected-only behavior

The plan requires deterministic proof that selected sync processes only selected videos and leaves unselected videos untouched.

Current repo has no Stage 6 verification script and no equivalent report evidence.

Required fix:

- Add `scripts/ops/verify-stage6-multi-channel-selective-intake.ts`, or provide equivalent API/CLI evidence in the report.
- The proof must show:
  - selection writes `video-selection.json`,
  - deselection persists,
  - selected sync only attempts selected videos,
  - unselected videos do not get new English caption assets,
  - no `zh-Hans`, translation, audio, or media assets are created.

### P1: Selected sync does not update `caption-sync-report.json`

File: `packages/application/src/syncSelectedEnglishCaptionsUseCase.ts`

The Stage 6 plan requires:

```text
Sync selected writes truthful per-video status and errors.
```

It also says selected sync should update selection status and the existing `caption-sync-report.json`.

Current behavior:

- updates `video-selection.json`,
- does not read or write `caption-sync-report.json`,
- does not record attempts,
- does not record failure kind,
- does not preserve the same reporting surface used by greedy channel sync.

This weakens auditability and makes the selected sync path diverge from Stage 3's accepted reporting model.

Required fix:

- Update `caption-sync-report.json` for selected sync items, or document a separate accepted report path with equivalent per-video status, attempts, and errors.
- Prefer reusing the Stage 3 report schema.

### P1: Selected sync bypasses Stage 3 skip/readiness semantics

File: `packages/application/src/syncSelectedEnglishCaptionsUseCase.ts`

Current skip behavior relies on `video-selection.json` item state:

```ts
if (!params.force && item.captionStatus === 'caption_ready') return false;
```

If a source already has English caption assets but the selection item is missing or stale, selected sync can reprocess it. The accepted Stage 3 path checks actual English caption/readiness assets.

Required fix:

- Before syncing, detect existing English caption assets or document readiness, not only selection status.
- Preserve selected state, but derive caption readiness from persisted source/caption assets where possible.

### P1: English Search channel switching does not automatically refresh results

File: `apps/web/src/components/EnglishSentenceSearch.tsx`

The UI now loads indexed channels and allows selecting a channel. However, changing the selected channel only updates `activeChannelId`, title, and sentence count. It does not re-run the current search query or clear stale results.

User-visible failure:

- Search results from Channel A can remain visible after switching to Channel B until the user triggers another search.

Required fix:

- On channel change, either:
  - automatically rerun the current query for the new channel, or
  - clear results and show an explicit empty state for the new channel.

### P2: Current API smoke endpoint was not live in the running server

Codex hit the currently running API server:

```bash
curl -sS http://127.0.0.1:8001/api/learning-channels
```

It returned:

```json
{"message":"Route GET:/api/learning-channels not found","error":"Not Found","statusCode":404}
```

This likely means the local API process was started before the new route was registered. It is not proof the code is wrong because `npm run build` passed, but the Stage 6 report must include a clean dev-server restart and route smoke evidence.

Required fix:

- Restart API with the current code.
- Include API smoke outputs for the new routes in the report.

## Accepted Behavior

The following pieces are directionally acceptable:

- New route file delegates to application use cases rather than directly implementing filesystem logic.
- `video-selection.json` persistence support exists in storage.
- Domain selection/status contracts exist.
- Web adds a `Channels` surface.
- English Search is no longer strictly Vanessa-only; it loads indexed channels.
- `ensureTranscriptUseCase(sourceId, { language: 'en' })` preserves the English-only path and should not request `zh-Hans` when used correctly.
- `npm run typecheck` and `npm run build` pass.

## Decision

Stage 6 is not accepted yet.

Gemini should:

1. Write the required Stage 6 report.
2. Add deterministic verification or equivalent API/CLI evidence.
3. Update selected sync reporting to write `caption-sync-report.json` or an equivalent accepted report.
4. Make selected sync derive skip/readiness from persisted English caption assets, not only selection state.
5. Fix English Search channel-switch stale results.
6. Restart the API and include smoke outputs for the new routes.

Codex should re-audit after the updated report is available.
