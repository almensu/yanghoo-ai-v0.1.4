# Stage 6: LLM Gateway and NotebookLM-like Workspace

## Owner

Gemini implements. Codex reviews.

## Goal

Implement the unified LLM gateway and add a chat interface to the reader, enabling source-scoped conversations.

## Non-goals

- Do not implement complex RAG (Retrieval-Augmented Generation) yet (use full document context for MVP).
- Do not implement real-time streaming to the frontend in the first iteration (simple JSON response is enough).
- Do not require real API keys for the first successful run (provide a mock adapter).

## Tasks

### 1. Define LLM Gateway Interfaces

In `packages/llm-gateway`, define the core provider interface and gateway class:
- `LLMProvider`: `generateContent`, `listModels`.
- `LLMGateway`: Registry for providers and routing logic.

### 2. Implement Mock LLM Adapter

In `packages/llm-adapters`, create a `MockAdapter` that returns simulated responses based on the source content.

### 3. Update Application Use Cases

In `packages/application`:
- Implement `chatWithSourceUseCase`: Orchestrates reading the document and calling the LLM gateway.
- Update `createConversationUseCase` if needed.

### 4. Implement Chat API Routes

Update `apps/api/src/routes/tasks.ts` or create `apps/api/src/routes/chat.ts`:
- `POST /api/chat`: Send a message scoped to a source.
- `GET /api/models`: List available models from the gateway.

### 5. Build Frontend Chat Sidebar

Update `apps/web/src/components/Reader.tsx`:
- Add a split-pane or sidebar for chat.
- Implement message listing and sending.

## Acceptance Criteria

- User can open the Reader for a source and see a chat input.
- Sending a message returns a simulated response that mentions the source title.
- The LLM Gateway correctly routes calls through the Mock Adapter.
- Project passes `npm run typecheck`.

## Verification Commands

```bash
# Verify API response
curl -X POST http://localhost:3000/api/chat -H "Content-Type: application/json" -d '{"taskId": "yt-dQw4w9WgXcQ", "message": "What is this about?"}'
```
