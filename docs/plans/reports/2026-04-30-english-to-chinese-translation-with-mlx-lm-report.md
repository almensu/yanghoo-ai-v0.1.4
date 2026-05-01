# English to Chinese Translation with MLX LM Report

Date: 2026-04-30

## Summary

Implemented the local English-to-Simplified-Chinese translation workflow for readable source documents.

The workflow now loads document-backed prompts/glossary, builds translation artifacts under `data/sources/{sourceId}/translation/`, chunks Markdown by a conservative token budget, calls local `mlx-lm` through the LLM gateway, normalizes output to Simplified Chinese, and exposes API/UI actions for translation.

## Changed Files

- `packages/domain/src/storage.ts`
- `packages/domain/src/index.ts`
- `packages/storage/src/index.ts`
- `packages/application/src/promptLoader.ts`
- `packages/application/src/translateSourceDocumentUseCase.ts`
- `packages/llm-adapters/src/mlxLmAdapter.ts`
- `scripts/llm/run-mlx-lm-generate.py`
- `apps/api/src/routes/tasks.ts`
- `apps/web/src/components/Reader.tsx`
- `apps/web/src/components/TaskCard.tsx`
- `apps/web/src/types.ts`
- `docs/GOTCHAS.md`
- `docs/plans/reports/2026-04-30-english-to-chinese-translation-with-mlx-lm-report.md`

## Model

Default model:

```text
Qwen/Qwen3-4B-MLX-4bit
```

Reason: it matches the plan's initial target for an M1 Mac with 16GB memory. The workflow keeps the per-call budget conservative instead of attempting to fill the full model context.

Fallback kept available in the adapter model list:

```text
mlx-community/Qwen2.5-3B-Instruct-4bit
```

## Prompt Files

Prompt file used by the application:

```text
docs/prompts/translation/en-to-zh-simplified.md
```

Glossary file used by the application:

```text
docs/prompts/translation/glossary-en-zh.md
```

The prompt loader now parses:

- `System Prompt`
- `Shared Context Prompt`
- `Token Budget Guidance for Qwen3-4B-MLX-4bit`
- `Single-Chunk User Prompt Template`
- `Chunk Merge Rule`

## Artifact Layout

The translation use case writes:

```text
data/sources/{sourceId}/translation/
├── 01-analysis.md
├── 02-prompt.md
├── chunks/
│   ├── chunk-001.md
│   ├── chunk-001.zh-Hans.md
│   └── ...
├── document.zh-Hans.md
└── translation-manifest.json
```

Manifest records:

- provider and model
- prompt path and glossary path
- analysis and assembled prompt paths
- chunk count and per-chunk paths
- token budgets
- translated output path
- failure status and error message when generation fails

## Token Budget

Defaults implemented:

```text
max request tokens: 12000
shared prompt + glossary budget: 2000
source chunk target: 4000
reserved output tokens: 5000
safety margin: 1000
```

Chunking is sequential by default and splits Markdown on block boundaries first, then oversized blocks by lines/sentences/approximate length.

## API and UI

Added/updated:

```text
POST /api/tasks/:taskId/translate
GET /api/tasks/:taskId/translation
```

UI:

- Task cards show `翻译中文` when a readable document exists.
- Reader shows an `原文` / `中文译文` toggle when translated content exists.

## Verification

Prompt file checks:

```bash
test -f docs/prompts/translation/en-to-zh-simplified.md
test -f docs/prompts/translation/glossary-en-zh.md
```

Result:

```text
prompt ok
glossary ok
```

MLX import check:

```bash
test -x /Users/a123/Yanghoo-lab/MLX-Community/mlx-lm/.venv/bin/python && /Users/a123/Yanghoo-lab/MLX-Community/mlx-lm/.venv/bin/python -c "import mlx_lm; print('mlx-lm ok')"
```

Result:

```text
mlx-lm ok
```

Build/typecheck:

```bash
npm run typecheck
npm run build
```

Result:

```text
npm run typecheck: passed
npm run build: passed
```

MLX generation smoke command attempted:

```bash
/Users/a123/Yanghoo-lab/MLX-Community/mlx-lm/.venv/bin/python scripts/llm/run-mlx-lm-generate.py --model Qwen/Qwen3-4B-MLX-4bit --system-prompt "You translate English to Simplified Chinese. Return only the translation." --user-prompt "Translate to Simplified Chinese: Hello, world." --max-tokens 64 --temp 0.1 --output-json /tmp/yanghoo-mlx-lm-smoke.json
```

Result:

```text
Fetching 7 files: 0%|          | 0/7 [00:00<?, ?it/s]
```

The first model fetch did not complete in a few minutes and was stopped. No `/tmp/yanghoo-mlx-lm-smoke.json` output was created.

Observed local cache after stopping:

```text
~/.cache/huggingface/hub/models--Qwen--Qwen3-4B-MLX-4bit: 79M
```

This means the Python runtime is valid, but the selected model still needs a completed first download before real translation can run.

## Memory and Speed Notes

No real inference timing was captured because the first model download did not complete. The implementation keeps generation sequential and uses 4,000 estimated source tokens per chunk to reduce memory pressure on M1 16GB.

## Unresolved Risks

- The first `Qwen/Qwen3-4B-MLX-4bit` model download must finish before the UI translation action can produce output.
- Long-document translation quality still needs real end-to-end validation after the model is cached.
- The chunk token estimator is conservative but approximate; tokenizer-based counting can be added later if `mlx-lm` exposes an efficient local tokenizer path.
