# @yanghoo/llm-adapters

Responsibility: Specific implementations for LLM providers (OpenAI, Anthropic, Local MLX, etc.).

## Forbidden Dependencies
- Must not depend on `apps/`.
- Must only depend on `@yanghoo/domain` and `@yanghoo/llm-gateway`.
