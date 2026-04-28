# Architecture Notes

This directory records stable system boundaries, dependency direction, and module placement notes. Use ADRs for decisions and `docs/plans/` for executable tasks.

## Target Layers

```text
apps/web -> packages/application -> packages/domain
apps/api -> packages/application -> packages/domain
packages/application -> package ports -> packages/* adapters
```

Domain code must remain independent of React, Fastify, filesystem access, subprocess execution, and provider SDKs.

## Package Responsibilities

- `packages/domain`: source classes, platforms, IDs, statuses, transcript/document/conversation types.
- `packages/application`: use cases such as capture source, ensure transcript, create conversation, generate document.
- `packages/source-adapters`: platform-specific URL, metadata, captions, and media discovery.
- `packages/transcript`: caption import, audio transcription contracts, segment normalization, sentence refinement, export.
- `packages/llm-gateway`: provider-neutral model and conversation interface.
- `packages/llm-adapters`: local/API provider implementations.
- `packages/storage`: filesystem or future database persistence.
- `packages/ui`: reusable UI primitives; app-specific screens stay in `apps/web`.

## Current Priority

Architecture work is blocked on Stage 1 migration. Do not implement real adapters until `packages/domain` and package boundaries exist.
