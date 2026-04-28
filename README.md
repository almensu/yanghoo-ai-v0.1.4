# Yanghoo AI v0.3.0

Greenfield transcript-first workbench for turning videos and URLs into readable, timestamped document assets.

## Product Principle

The app has one primary user action:

```text
Ensure Transcript
```

The system decides the best source:

```text
YouTube/Baoyu transcript -> existing VTT/SRT -> mlx-audio fallback -> manual upload
```

Users should see document readiness, not internal pipeline complexity.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS, lucide-react
- Backend: Node.js, TypeScript, Fastify, filesystem asset store
- Transcription adapters: Baoyu/InnerTube first, mlx-audio fallback via worker command

## Structure

```text
.
├── frontend/          # React + Vite + Tailwind UI
├── backend/           # Fastify API and transcript pipeline services
├── docs/              # Product and architecture notes
├── data/              # Local runtime assets, ignored by git
├── AGENTS.md          # Contributor/agent guide
└── agent.md           # Short agent entrypoint
```

## Development

Install dependencies after choosing the package manager:

```bash
npm install
npm run dev
```

Build both apps:

```bash
npm run build
```
