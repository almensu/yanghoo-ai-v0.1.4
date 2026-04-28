# 0003 Apps and Packages Architecture

## Status

Accepted.

## Decision

The new project formally adopts an `apps/` + `packages/` architecture. The existing greenfield `frontend/` and `backend/` scaffolds are transitional and should be migrated. The final architecture should not retain the old top-level `frontend/` and `backend/` app structure.

Target shape:

```text
.
├── apps/
│   ├── web/
│   └── api/
├── packages/
│   ├── domain/
│   ├── application/
│   ├── transcript/
│   ├── source-adapters/
│   ├── llm-gateway/
│   ├── llm-adapters/
│   ├── storage/
│   ├── ui/
│   └── config/
├── docs/
├── tests/
├── examples/
└── data/
```

## Rationale

The product has several long-term extension surfaces:

- Web app and API app.
- Source adapters for concrete platforms: YouTube, Xiaoyuzhou, Apple Podcasts, Douyin, Xiaohongshu, X, webpages, and feeds.
- Transcript engines such as Baoyu/InnerTube and `mlx-audio`.
- LLM local/API providers.
- Shared domain rules and UI primitives.

Keeping everything under `frontend/` and `backend/` would recreate the v0.2.0 pattern where product concerns and infrastructure concerns gradually mix.

## Consequences

- Gemini implementation tasks must migrate scaffolding into `apps/web` and `apps/api`.
- Shared types and rules should move into `packages/domain`.
- Use cases should move into `packages/application`.
- Provider-specific code belongs in adapter packages.
- UI primitives belong in `packages/ui`; app-specific screens remain in `apps/web`.
