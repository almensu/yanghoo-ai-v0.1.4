# Stage 5: Reader and Source Cards

## Owner

Gemini implements. Codex reviews.

## Goal

Build the first functional UI pages using the data generated in previous stages.

## Non-goals

- Do not implement real-time transcription progress bars yet.
- Do not implement complex layout shifts or animations.
- Do not implement LLM chat in this stage.

## Tasks

### 1. Update API Routes

Update `apps/api/src/routes/tasks.ts` to:
- Use `captureSourceUseCase` for creating sources.
- Use `ensureTranscriptUseCase` for triggering the pipeline.
- Return real data from `sourceStorage`.

### 2. Implement API Source List in Frontend

Update `apps/web/src/App.tsx`:
- Fetch real sources from `/api/tasks`.
- Support triggering "Ensure Transcript" from the card.

### 3. Implement Reader Component

Create `apps/web/src/components/Reader.tsx`:
- Display Markdown content.
- Display refined sentence segments.
- Handle "Read" action from the card.

### 4. Enhance Source Cards

Update `apps/web/src/components/TaskCard.tsx`:
- Correctly show processing status.
- Add "Read" button when document is ready.

## Acceptance Criteria

- User can paste a YouTube URL and see a new card appearing.
- User can click "Ensure Transcript" on a card and see it progress (after refresh).
- User can click "Read" and see the transcript text in a reader view.
- Project passes `npm run typecheck` and `npm run build`.

## Verification Commands

```bash
# Start API and Web
# In terminal 1: npm run dev -w @yanghoo/api
# In terminal 2: npm run dev -w @yanghoo/web
```
