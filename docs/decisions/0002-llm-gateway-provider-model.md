# 0002 LLM Gateway Provider Model

## Status

Accepted.

## Decision

All LLM access goes through one unified LLM gateway. The gateway then routes to provider branches:

```text
LLMGateway
├── local providers
└── API providers
```

The frontend and domain layer must not call OpenAI, Gemini, Claude, Ollama, LM Studio, or other providers directly.

## Rationale

The product needs NotebookLM-like conversations over source documents. Model choice must remain swappable without changing chat UI or domain logic.

Local and API models have different auth, latency, streaming, and model discovery behavior, but the app-level contract should be stable:

```text
createConversation
sendMessage
generateDocument
streamAnswer
listModels
```

## Consequences

- Add `packages/llm-gateway` or equivalent application-facing package.
- Add provider adapters under `packages/llm-adapters`.
- Store provider config outside UI components.
- Conversation records should store provider id and model id, not provider-specific request bodies.
