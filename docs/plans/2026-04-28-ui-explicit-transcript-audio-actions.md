# UI Explicit Transcript and Audio Actions

## Owner

Gemini implements. Codex reviews.

## Goal

Make the source card UI clearly expose the transcript-first workflow:

```text
load captions -> download audio -> audio to captions -> read document
```

In user-facing Chinese UI, show these actions as:

```text
载字幕
下载音频
音频转字幕
阅读
```

The UI should make it obvious which action is available now, which actions are already complete, and which actions require a prior step.

## Context

The current `TaskCard` already has backend wiring for:

- `ensureTranscript(taskId)` -> `POST /api/tasks/:taskId/ensure-transcript`
- `fetchAudio(taskId)` -> `POST /api/tasks/:taskId/fetch-audio`
- `transcribeAudio(taskId)` -> `POST /api/tasks/:taskId/transcribe-audio`

Current issue:

- The card mostly presents one automatic primary action and hides other steps in a menu.
- Users cannot clearly see the staged choices: load available captions, download audio, then transcribe audio.
- Xiaoyuzhou/podcast flows need staged actions because audio download and MLX transcription are expensive and failure-prone.

## Reference and Decisions

Use this repo's accepted ADRs:

- `docs/decisions/0003-apps-packages-architecture.md`
- `docs/decisions/0004-source-classes-and-platform-adapters.md`

Relevant prior plans/reviews:

- `docs/plans/2026-04-27-xiaoyuzhou-mlx-audio-transcription-and-card-actions.md`
- `docs/plans/reports/2026-04-27-codex-review-xiaoyuzhou-mlx-audio-transcription-and-card-actions.md`
- `docs/plans/reports/2026-04-28-codex-audit-verify-mlx-audio-end-to-end-fixture.md`

Reference repository under `/Volumes/2T/com/yanghoo205/yanghoo-reference` may be unavailable. If mounted, consult:

- `reference/test-strategy.md`
- `reference/review-checklists/`
- `reference/Gotchas.md`

## Non-goals

- Do not rebuild a general media control panel.
- Do not expose destructive maintenance actions as primary card buttons.
- Do not label shownotes, descriptions, chapters, or outlines as captions.
- Do not fake transcript readiness.
- Do not add a model selector or broad ASR configuration UI in this task.
- Do not add new backend behavior unless the existing API response shape is insufficient for the UI state.

## Target Files

Primary:

- `apps/web/src/components/TaskCard.tsx`
- `apps/web/src/api/client.ts` only if error display needs adjustment
- `apps/web/src/types.ts` only if existing types block clear state handling

Optional:

- `apps/web/src/styles.css`

Expected report:

- `docs/plans/reports/2026-04-28-ui-explicit-transcript-audio-actions-report.md`

## UX Requirements

### 1. Card status should remain document-readiness oriented

Keep the compact readiness panel, but make it clearer:

- document status: `未就绪`, `字幕已载入`, `文档可读`, etc.
- transcript source: `平台字幕`, `MLX 音频转写`, or `无字幕`
- sentence count
- audio state: `音频已下载` or `未下载音频`

Do not display raw pipeline internals such as file paths or command names on the card.

### 2. Show explicit staged actions

Replace the single automatic processing button with a compact action row or grouped controls that can show:

- `阅读` when `markdown_ready` or `enriched`
- `载字幕` for sources where a platform caption path is plausible, especially YouTube
- `下载音频` for podcast/audio sources when audio is not fetched and an audio URL/media URL is present
- `音频转字幕` when audio is fetched but document transcript is not ready

Recommended visibility rules:

```text
阅读:
  visible/enabled when readiness is markdown_ready or enriched

载字幕:
  visible for YouTube and other caption-capable platforms
  enabled when no readable document exists
  calls ensureTranscript(task.id)

下载音频:
  visible for xiaoyuzhou/podcast_audio or sources with metadata.mediaUrl/audioUrl
  enabled when no readable document exists and hasAudio is false
  calls fetchAudio(task.id)

音频转字幕:
  visible for xiaoyuzhou/podcast_audio or sources with hasAudio
  enabled when hasAudio is true and no readable document exists
  calls transcribeAudio(task.id)
```

For disabled actions, show a disabled button with concise state implied by the label and icon. Avoid visible help text that explains the whole workflow.

### 3. Keep a primary path

The most likely next action should still have primary styling:

- readable document -> `阅读`
- audio fetched but no document -> `音频转字幕`
- audio source without fetched audio -> `下载音频`
- caption-capable source without document -> `载字幕`

Other visible actions should use secondary styling.

### 4. Menus stay for low-frequency operations

Keep the menu for:

- resolve media,
- force/retry pipeline,
- force download,
- inspect metadata.

Rename menu labels to user-facing Chinese if the card actions are Chinese. Keep debug-like actions secondary.

### 5. Errors must surface backend diagnostics

If an action fails, the inline card error should display the backend `message` when present.

Do not use `alert()` for action failure.

Existing `handleResponse()` already tries to parse JSON response errors. Verify that card errors show meaningful messages for:

- missing audio,
- missing MLX runtime,
- ASR command failure,
- missing platform captions.

### 6. Loading state must identify the action

When an action is running, disable all action buttons for that card and show a loading label tied to the action, for example:

```text
载入中...
下载中...
转写中...
```

Do not leave multiple buttons clickable during a long transcription request.

## Design Constraints

- Keep cards compact and scannable.
- Use lucide icons already available in the app:
  - `FileText` or `Captions` if available for `载字幕`
  - `Download` for `下载音频`
  - `Mic` for `音频转字幕`
  - `Play` for `阅读`
- Do not use oversized hero/marketing layout.
- Do not put cards inside cards.
- Ensure button labels do not overflow on mobile card widths.
- Use existing visual language from `TaskCard` and `styles.css`.

## Acceptance Criteria

- A YouTube-style card without a readable document shows a visible `载字幕` action.
- A Xiaoyuzhou/podcast card without audio shows a visible `下载音频` action when an audio URL or media URL is available.
- A Xiaoyuzhou/podcast card with `hasAudio: true` and no readable document shows a visible `音频转字幕` action.
- A card with `markdown_ready` or `enriched` shows `阅读` as the primary action.
- Running any action disables the card's action buttons and shows an action-specific loading label.
- Failed actions show backend diagnostic text inline in the card.
- The UI still refreshes task readiness after successful actions.
- `npm run build` passes.
- `npm run typecheck` passes.

## Verification Commands

Run:

```bash
npm run build
npm run typecheck
```

Start the app:

```bash
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev
```

Verify via UI and/or API-backed browser state:

- a YouTube source shows `载字幕`,
- a Xiaoyuzhou source before audio shows `下载音频`,
- a Xiaoyuzhou source after audio shows `音频转字幕`,
- a ready source shows `阅读`,
- forced MLX failure shows the backend diagnostic inline.

If no real local data exists for one state, create an isolated `DATA_DIR` fixture and document it in the report. Do not commit generated fixture data.

## Expected Report

Write:

```text
docs/plans/reports/2026-04-28-ui-explicit-transcript-audio-actions-report.md
```

Report must include:

- changed files,
- screenshots or concise UI state descriptions for each action state,
- exact verification commands and results,
- any fixture data created under isolated `DATA_DIR`,
- unresolved risks.
