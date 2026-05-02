# Background Jobs for Long Actions

Date: 2026-05-02

Owner: Codex

## Goal

Let users keep browsing cards while expensive actions run in the background.

Target actions:

- download captions,
- fetch audio,
- download media/video,
- transcribe audio/media,
- translate document.

## Problem

The previous UI awaited long action endpoints directly. Some backend use cases call blocking subprocesses, so long downloads, transcription, or translation can make the app feel stuck while the user waits.

## Decision

Add an API-level in-memory background job runner.

The API accepts a job request, returns `202` with a `jobId`, and runs the actual work in a separate CLI subprocess:

```text
API request -> /api/jobs/task-action -> npm run -s cli -- <command>
```

This keeps the main Fastify process responsive while the child process performs blocking work.

## Scope

Implemented:

- in-memory job registry,
- job status polling,
- estimated progress,
- in-app toast notifications,
- automatic task refresh after job completion,
- duplicate running job reuse for the same task/action.

Not implemented yet:

- durable job persistence across API restarts,
- cancellation,
- true engine-level progress from yt-dlp, MLX Audio, or MLX LM,
- multi-worker concurrency control.

## UI Behavior

- Clicking a long action starts a background job immediately.
- The card shows a compact task progress strip.
- A bottom-right toast shows status and a progress bar.
- The user can keep browsing cards, opening readers, or switching channels.
- When a job finishes, the task list refreshes without a full page reload.

## Verification

```bash
npm run typecheck
npm run build
```

API smoke test:

```bash
curl -sS http://127.0.0.1:8001/api/jobs
```

Starting a real job should be tested with a known source card from the web UI.
