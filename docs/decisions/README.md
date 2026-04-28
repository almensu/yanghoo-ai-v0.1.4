# Decisions

This directory contains accepted ADR-style decisions. Treat these as implementation constraints, not brainstorming notes.

## Current Decisions

- `0001-mvp-platform-scope.md`: MVP starts with YouTube and Xiaoyuzhou; Apple Podcasts, Douyin, Xiaohongshu, X, webpages, and Bilibili are roadmap items.
- `0002-llm-gateway-provider-model.md`: local and API models enter through one LLM gateway.
- `0003-apps-packages-architecture.md`: final shape is `apps/` + `packages`; top-level `frontend/` and `backend/` are transitional.
- `0004-source-classes-and-platform-adapters.md`: domain separates `sourceClass` from `platform`.
- `0005-script-entrypoint-naming.md`: scripts are small, single-responsibility entry points.

## Naming

Use short files named like:

```text
0006-local-asset-storage.md
0007-transcript-segment-schema.md
```

## Rules

- Add a decision when a choice affects future implementation or package boundaries.
- Keep ADRs short and final enough for Gemini to follow.
- If a plan conflicts with an ADR, update the ADR first or explicitly supersede it.
