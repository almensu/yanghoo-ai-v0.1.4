# Stage 9 Plan: Channel URL Library and Subtitle Intake Clarification

Date: 2026-05-04
Owner: Codex
Executor: Gemini
Status: Ready

## Context

The current `Channels` surface is functionally correct but still too easy to misread as a generic "download" workflow. The user mental model should be simpler:

```text
input channel URL
-> collect all video URLs into a library
-> browse and choose the videos to study
-> sync English subtitles for the chosen URLs
```

That is the learning workflow. It should not feel like a media downloader, and it should not mix subtitle collection with video or audio acquisition.

## Goal

Make the Channels experience explicit and intuitive for English study:

- collect channel video URLs first,
- show the full URL library and how many videos are available,
- let the user choose the subset they want,
- sync English subtitles only for the selected URLs,
- keep the existing machine-translation workflow available elsewhere in the product.

Primary scenario:

```text
channel has 236 videos
-> user adds the channel URL once
-> all 236 video URLs are visible in the channel library
-> user filters/selects a batch
-> only selected URLs sync English subtitles
```

## Non-Goals

- Do not remove or weaken the existing machine translation feature outside Channels.
- Do not add video downloads to the Channels flow.
- Do not add audio downloads to the Channels flow.
- Do not add `zh-Hans` subtitle collection to the Channels flow.
- Do not redesign the rest of the app into a general media manager.
- Do not introduce a database.

## Product Rules

Channels should answer these questions clearly:

1. What URLs exist in this channel library?
2. Which ones are new, selected, caption ready, or failed?
3. Which URLs should be synced next?
4. What was actually synced?

The user should not have to infer whether a button means:

- collect URLs,
- sync subtitles,
- refresh inventory,
- or download media.

The main language for the Channels workflow is English subtitle intake.

## Target Files

- `apps/web/src/components/LearningChannelLibrary.tsx`
- `apps/web/src/components/LearningChannelVideoTable.tsx`
- `apps/web/src/api/client.ts`
- `apps/api/src/routes/learningChannels.ts`
- `packages/application/src/getLearningChannelVideosUseCase.ts`
- `packages/application/src/syncSelectedEnglishCaptionsUseCase.ts`
- `packages/domain/src/channelVideoSelection.ts`
- `packages/domain/src/index.ts`
- `scripts/ops/verify-stage9-channel-url-library-and-subtitle-intake-clarification.ts`
- `docs/plans/reports/2026-05-04-channel-url-library-and-subtitle-intake-clarification-report.md`

## Layer Placement

- Domain owns stable selection and discovery status contracts.
- Application owns the URL-library and subtitle-sync workflow semantics.
- API exposes the clear channel actions.
- Web owns the wording, grouping, and order of the user actions.
- Scripts own deterministic verification of the new interaction model.

## Required Behavior

### URL Library First

The channel detail view should present the channel as a URL library:

- total URLs available,
- new URLs discovered since the last refresh,
- selected URLs,
- caption-ready URLs,
- failed URLs.

### Subtitle Intake Second

The user should be able to:

- filter the URL library,
- select a batch in a stable order,
- sync English subtitles only for the selected URLs,
- review which URLs were processed.

### Clear Action Names

Use action labels that match the workflow:

- `Add channel URL`
- `Refresh URL library`
- `Show new URLs`
- `Select batch`
- `Sync English subtitles`

Avoid labels that sound like generic downloads unless the action truly downloads media.

## UI Guidance

The Channels view should visually separate:

1. URL library management
2. selection controls
3. subtitle sync actions

The user should be able to scan the page and immediately know:

- what is already in the library,
- what is new,
- what is selected,
- what will be synced next.

## Verification Strategy

Use deterministic fixtures first.

Recommended script:

```text
scripts/ops/verify-stage9-channel-url-library-and-subtitle-intake-clarification.ts
```

The script should prove:

- a channel URL is collected into a URL library,
- the library shows all known video URLs,
- the user can select a batch from the library,
- only selected URLs are synced,
- machine translation behavior outside Channels is untouched,
- no video or audio downloads are introduced by the new flow.

## Acceptance Criteria

- The Channels page reads like a URL library, not a media downloader.
- The user can see how many URLs are available in a channel.
- The user can batch-select URLs before sync.
- The user can sync only English subtitles for selected URLs.
- The UI wording is clear enough that subtitle intake is not confused with video download.
- Existing machine translation behavior elsewhere in the product remains intact.
- `npm run typecheck` passes.
- `npm run build` passes.
- The deterministic verification script passes.

## Verification Commands

Gemini must run:

```bash
npx tsx scripts/ops/verify-stage9-channel-url-library-and-subtitle-intake-clarification.ts
npm run typecheck
npm run build
```

## Expected Report Path

Gemini must write:

```text
docs/plans/reports/2026-05-04-channel-url-library-and-subtitle-intake-clarification-report.md
```

The report must include:

- changed files,
- the new user flow wording,
- batch selection and subtitle sync behavior,
- verification commands and results,
- proof that machine translation outside Channels still exists,
- skipped checks and reasons,
- residual risks.

## Audit Checklist

Codex should reject the report if:

- the Channels flow still reads like a downloader,
- subtitle syncing is still mixed with media acquisition,
- the UI does not clearly separate URL library and subtitle intake,
- the verification does not prove the selection-to-sync path,
- typecheck or build are skipped without a concrete blocker.
