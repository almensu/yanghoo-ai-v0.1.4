# Yanghoo AI v0.3.0 Docs

This directory is the project command center. Codex keeps decisions and task priorities here; Gemini implements from stage plans and writes reports to `docs/plans/reports/`.

## Read Order

1. `docs/README.md`: current priorities and document map.
2. `docs/decisions/`: accepted architecture decisions.
3. `docs/plans/2026-04-26-priority-roadmap.md`: execution order.
4. `docs/plans/<stage>.md`: concrete Gemini task specs.
5. `docs/plans/reports/`: Gemini completion reports.

## Current Priority

| Priority | Stage | Status | Owner | Purpose |
| --- | --- | --- | --- | --- |
| P0 | Stage 1 apps/packages skeleton | Ready | Gemini | Move scaffold into `apps/` + `packages`, preserve scripts, establish package boundaries. |
| P1 | Stage 2 domain contracts | Planned | Codex then Gemini | Lock source, transcript, document, conversation, ID, and storage contracts. |
| P1 | Stage 3 URL collectors | Planned | Gemini | Implement YouTube and Xiaoyuzhou URL capture first. |
| P1 | Stage 4 transcript pipeline | Planned | Gemini | Fetch captions or use `mlx-audio`, then normalize/refine transcript assets. |
| P2 | Stage 5 reader workspace | Planned | Gemini | Build document-first source cards and timestamped reader. |
| P2 | Stage 6 LLM gateway | Planned | Gemini | Add unified local/API model entrypoint and source-scoped chat. |
| P3 | Stage 7 short-video adapters | Roadmap | Gemini | Add Douyin and Xiaohongshu after the core loop is stable. |

## Folder Roles

- `architecture/`: stable boundary notes and package responsibilities.
- `decisions/`: ADR files with accepted choices.
- `prompts/`: versioned prompt documents loaded by application/LLM workflows instead of hard-coded prompt strings.
- `plans/`: Codex-authored task plans and roadmap.
- `plans/reports/`: Gemini-authored completion reports.

## Rules

- Decisions are source of truth; plans must reference relevant ADRs.
- Discussion drafts can inform plans, but task files control execution.
- New implementation work needs a stage plan before Gemini starts.
- Reports must include changed files, verification commands, results, and unresolved risks.
- User-facing Chinese transcript assets should be Simplified Chinese. Normalize in the transcript pipeline, not only in frontend rendering.

## Platform Acquisition Strategy

- YouTube uses the Baoyu/YouTube InnerTube internal API path for metadata and captions. It must support caption-only transcript generation without downloading video.
- YouTube cards should present `Ensure Transcript` / `载字幕` before any media-download action.
- If InnerTube confirms that a YouTube video has no caption tracks or returns an empty caption result, record the caption failure and switch that card to `下载音频 -> 转录`. This is a narrow fallback for missing captions, not a replacement for the Baoyu/InnerTube caption path.
- X, Xiaohongshu, Douyin, Bilibili, and TikTok use `yt-dlp` for metadata/media acquisition, followed by audio extraction/probing and MLX transcription when media has audio.
- Do not route YouTube through the generic short-video `yt-dlp` download workflow. The accepted `yt-dlp` YouTube fallback is audio extraction for videos without platform captions.

## Implementation References

- YouTube captions and cover reference: `/Users/a123/claude-model/.claude-zhipu/skills/baoyu-youtube-transcript`.
  - Read `SKILL.md` first for supported behavior and CLI contract.
  - Use `scripts/main.ts` as the Baoyu/InnerTube implementation reference.
  - The reference states that no API key or browser is required. It fetches the YouTube watch page, extracts `INNERTUBE_API_KEY`, calls `youtubei/v1/player`, validates playability/caption tracks, and fetches transcript snippets from the selected caption `baseUrl`.
  - Treat this as a reference implementation and decision guide. Do not vendor the whole external skill into this repo.
- English-to-Chinese translation workflow reference: `/Users/a123/claude-model/.claude-zhipu/skills/baoyu-translate`.
  - Read `SKILL.md`, `references/subagent-prompt-template.md`, `references/refined-workflow.md`, and `scripts/chunk.ts` for workflow ideas.
  - Reuse the principles: analyze first, build a compact glossary, save shared prompt context, split Markdown by block boundaries, translate chunks, then merge in order.
  - Adapt chunk sizing for local Qwen3 MLX 4-bit models; `Qwen/Qwen3-8B-MLX-4bit` should use smaller chunks than `Qwen/Qwen3-4B-MLX-4bit` on M1 16GB.
  - Treat it as a reference and decision guide. Do not vendor the whole external skill into this repo.
