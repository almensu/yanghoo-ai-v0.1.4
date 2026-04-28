# Script Entry Points

This directory contains planned operational entry points. The script files are intentionally empty until Gemini receives an implementation task.

## Naming Rules

- Use kebab-case filenames.
- Start with a verb: `collect`, `fetch`, `import`, `normalize`, `resolve`, `download`, `extract`, `transcribe`, `refine`, `export`, `build`, `list`, `chat`, `generate`, `read`, `write`, `audit`, `verify`.
- Keep one responsibility per script. If a name needs "and", split it.
- Platform-specific behavior stays in platform-specific scripts, for example `collect-xiaoyuzhou-url.ts`.
- Shared transcript work stays platform-neutral, for example `transcribe-audio-mlx.ts`.

## Directory Roles

- `collect/`: save URLs or collection URLs only.
- `metadata/`: fetch metadata only.
- `captions/`: fetch, import, or normalize caption files only.
- `media/`: resolve, download, or extract media only.
- `transcript/`: transcribe, normalize, refine, or export transcript assets only.
- `document/`: build readable or generated documents only.
- `llm/`: list models, chat, or generate through the unified LLM gateway only.
- `storage/`: read/write persisted records only.
- `ops/`: audit and verification helpers only.

## Contract

Scripts should behave like Unix tools: explicit input, explicit output, predictable exit codes, and no hidden cross-step side effects. Business logic belongs in `packages/*`; scripts should orchestrate package calls.
