# @yanghoo/llm-gateway

Responsibility: Unified interface for LLM calls, providing a provider-agnostic model.

## Forbidden Dependencies
- Must not depend on `apps/` or specific adapter implementations.
- Must only depend on `@yanghoo/domain`.
