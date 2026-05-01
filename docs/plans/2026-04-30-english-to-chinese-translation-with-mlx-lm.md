# English to Simplified Chinese Translation with MLX LM

## Goal

Add an English-to-Simplified-Chinese translation workflow for transcript/document assets using local `mlx-lm`.

Target machine:

```text
macOS
Apple Silicon M1
16GB unified memory
```

Recommended initial model:

```text
Qwen/Qwen3-4B-MLX-4bit
```

Rationale:

- It is an official Qwen MLX 4-bit model.
- The model card describes Qwen3 as supporting multilingual instruction following and translation.
- The 4-bit model size is small enough for a 16GB M1 development machine while still being stronger than very small 1.5B/3B models for translation quality.

Fallback model if latency/memory is still too high:

```text
mlx-community/Qwen2.5-3B-Instruct-4bit
```

Do not start with 7B/8B models on this machine unless Gemini verifies acceptable memory and speed.

Model context note:

- Qwen3-4B has a native context length of 32,768 tokens.
- On M1 16GB, do not design around filling the whole context window. Use conservative chunking so the local process has room for the prompt, glossary, source text, generated Chinese, and runtime overhead.

## Required Prompt Management

Prompts must be document-backed and loaded by path.

Initial prompt file:

```text
docs/prompts/translation/en-to-zh-simplified.md
```

Initial glossary file:

```text
docs/prompts/translation/glossary-en-zh.md
```

Rules:

- Do not hard-code the translation prompt in TypeScript.
- Add a small prompt loader that reads a prompt document by stable ID/path.
- The translation use case should reference/import the prompt document.
- The translation use case should reference/import the glossary document when translating English to Chinese.
- Prompt edits should not require touching application logic.
- The report must state which prompt file was used.

## Baoyu Translate Reference

Use this local reference for workflow design:

```text
/Users/a123/claude-model/.claude-zhipu/skills/baoyu-translate
```

Read:

- `SKILL.md`
- `references/subagent-prompt-template.md`
- `references/refined-workflow.md`
- `references/glossary-en-zh.md`
- `scripts/chunk.ts`

Borrow these ideas:

- Analyze the whole document before chunk translation when possible.
- Extract recurring proper nouns, technical terms, acronyms, and culturally specific phrases.
- Build a compact job glossary.
- Save shared translation context as a document, equivalent to baoyu's `02-prompt.md`.
- Split Markdown by block boundaries rather than arbitrary character count.
- Translate chunks using the same shared context/glossary.
- Merge chunk outputs deterministically in source order.
- Preserve intermediate files for debugging.

Do not copy baoyu's full implementation or long-context defaults directly. This project uses a local `Qwen/Qwen3-4B-MLX-4bit` model with tighter practical context and memory limits.

## Non-Goals

- Do not use an external API provider for the first local translation path.
- Do not use an LLM to replace the transcript ASR pipeline.
- Do not summarize or rewrite the transcript while translating.
- Do not translate timestamps, code fences, URLs, commands, package names, file paths, or API route names.
- Do not make frontend components call `mlx-lm` directly.

## Architecture Placement

- UI layer: exposes translation action/state only.
- Application layer: owns `translateDocument` / `translateSourceDocument` use case.
- LLM adapter layer: owns the local `mlx-lm` invocation.
- Prompt loading belongs in application/config/support code, not UI.
- Domain layer remains provider-agnostic.

Respect `docs/decisions/0002-llm-gateway-provider-model.md`: all LLM access goes through a unified gateway/provider adapter. The frontend and domain layer must not call `mlx-lm` directly.

## Required Implementation

### 1. MLX LM Adapter

Create or extend a local LLM adapter for `mlx-lm`.

The adapter should invoke `mlx_lm.generate` or the supported `mlx-lm` CLI in a controlled way.

Suggested CLI shape to verify locally:

```bash
python -m mlx_lm.generate \
  --model Qwen/Qwen3-4B-MLX-4bit \
  --prompt "Translate this to Simplified Chinese: hello"
```

Gemini must verify the exact command supported by the installed `mlx-lm` environment.

If the repo already has a Python runtime convention, use an environment variable such as:

```text
MLX_LM_PYTHON
```

Do not reuse `MLX_AUDIO_PYTHON`; audio ASR and text LLM runtime should be configurable independently.

### 2. Prompt Loader

Add a prompt loader that reads:

```text
docs/prompts/translation/en-to-zh-simplified.md
```

The loader should:

- resolve from repo root, independent of `process.cwd()`;
- fail with a clear diagnostic if the prompt file is missing;
- return prompt sections or full prompt text in a predictable way.

### 3. Translation Use Case

Add an application use case, for example:

```text
translateSourceDocumentUseCase(sourceId, options)
```

Behavior:

- Read the existing `document.md` for the source.
- Load the translation prompt document.
- Send prompt + document text to the local `mlx-lm` adapter.
- Persist translated output under the same canonical source directory, for example:

```text
data/sources/{sourceId}/document.zh-Hans.md
```

- Keep the original document intact.
- Return translation asset metadata and path.

### 4. Chunking

Long transcripts can exceed local context windows.

Implement chunking before calling `mlx-lm`:

- chunk by transcript paragraphs or timestamp blocks;
- preserve timestamps and order;
- translate chunks independently;
- concatenate output deterministically;
- record chunk count and model in a manifest.

Use token-budget-based chunking, not baoyu's default 4000-5000 word chunks.

Default budget for `Qwen/Qwen3-4B-MLX-4bit` on M1 16GB:

```text
model native context: 32768 tokens
max total per generation request: 12000 tokens
shared prompt + glossary budget: 2000 tokens
source chunk target: 4000 tokens
reserved output budget: 5000 tokens
safety margin: 1000 tokens
```

If output is truncated, slow, or memory pressure is high, reduce source chunk target:

```text
source chunk target: 2500-3000 tokens
reserved output budget: 4000 tokens
```

Chunking rules:

- Estimate tokens conservatively if tokenizer access is unavailable.
- Prefer model tokenizer counts if `mlx-lm` or tokenizer package exposes them.
- Split on Markdown block boundaries first.
- Keep timestamped transcript paragraphs intact where possible.
- If a single block exceeds the target budget, split by timestamp paragraph, then sentence, then line.
- Keep frontmatter as a separate preserved block.
- Do not run local chunk generations concurrently by default on M1 16GB; run sequentially unless performance testing proves safe.

### 4.1 Shared Context Artifacts

For each translation job, persist intermediate context files under a translation output directory, for example:

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

`02-prompt.md` should be assembled from:

- `docs/prompts/translation/en-to-zh-simplified.md`
- `docs/prompts/translation/glossary-en-zh.md`
- extracted job glossary from the source document
- short content background from `01-analysis.md` if analysis is implemented

Keep `02-prompt.md` compact enough to fit the shared prompt budget.

Suggested manifest:

```text
data/sources/{sourceId}/translation/translation-manifest.json
```

Fields:

```json
{
  "sourceId": "...",
  "status": "translated",
  "sourcePath": "data/sources/.../document.md",
  "translatedPath": "data/sources/.../translation/document.zh-Hans.md",
  "provider": "mlx-lm",
  "model": "Qwen/Qwen3-4B-MLX-4bit",
  "promptPath": "docs/prompts/translation/en-to-zh-simplified.md",
  "glossaryPath": "docs/prompts/translation/glossary-en-zh.md",
  "chunksCount": 0,
  "sourceChunkTargetTokens": 4000,
  "maxRequestTokens": 12000,
  "generatedAt": "..."
}
```

### 5. API and UI

Add API route only if needed by current UI workflow, for example:

```text
POST /api/tasks/:taskId/translate
GET /api/tasks/:taskId/translation
```

UI should show a simple action such as:

```text
翻译中文
```

Only show it when a readable source document exists.

## Target Files

Likely files:

- `docs/prompts/translation/en-to-zh-simplified.md`
- `packages/llm-adapters/src/*`
- `packages/llm-gateway/src/*`
- `packages/application/src/*`
- `packages/storage/src/*`
- `apps/api/src/routes/*`
- `apps/web/src/components/*` only if adding UI action
- `docs/GOTCHAS.md` if local `mlx-lm` setup has repeatable traps

## Acceptance Criteria

- Translation prompt is stored in `docs/prompts/translation/en-to-zh-simplified.md`.
- Glossary prompt context is stored in `docs/prompts/translation/glossary-en-zh.md`.
- Application code loads the prompt from the file, not from a hard-coded string.
- Application code loads glossary/context files from disk, not from hard-coded strings.
- Default local model is `Qwen/Qwen3-4B-MLX-4bit`.
- `MLX_LM_PYTHON` or equivalent runtime config is documented and validated.
- Translating an English `document.md` creates `translation/document.zh-Hans.md` or an equivalent clearly documented path.
- Original `document.md` is not overwritten.
- Translation output is Simplified Chinese.
- Markdown headings, timestamps, links, code fences, and inline code are preserved.
- Long documents are chunked by token budget and Markdown block boundaries, then merged in order.
- Translation manifest records model, prompt path, glossary path, chunk count, token budget, and generated path.
- Default chunk target is around 4000 source tokens, not baoyu's 4000-5000 word default.
- `npm run build` and `npm run typecheck` pass.

## Verification Commands

Gemini should run:

```bash
npm run build
npm run typecheck
```

MLX LM environment checks:

```bash
python -c "import mlx_lm; print('mlx-lm ok')"
python -m mlx_lm.generate --model Qwen/Qwen3-4B-MLX-4bit --prompt "Translate to Simplified Chinese: Hello, world."
```

If using `MLX_LM_PYTHON`:

```bash
$MLX_LM_PYTHON -c "import mlx_lm; print('mlx-lm ok')"
$MLX_LM_PYTHON -m mlx_lm.generate --model Qwen/Qwen3-4B-MLX-4bit --prompt "Translate to Simplified Chinese: Hello, world."
```

Prompt loader check:

```bash
test -f docs/prompts/translation/en-to-zh-simplified.md
test -f docs/prompts/translation/glossary-en-zh.md
```

Pipeline check:

```bash
curl -sS -X POST http://127.0.0.1:8001/api/tasks/<taskId>/translate
find data/sources/<taskId> -maxdepth 1 -type f -print | sort
cat data/sources/<taskId>/translation-manifest.json
```

## Expected Report

Write:

```text
docs/plans/reports/2026-04-30-english-to-chinese-translation-with-mlx-lm-report.md
```

Report must include:

- changed files,
- selected model and why,
- exact `mlx-lm` command tested,
- prompt file path used,
- glossary file path used,
- chunk token budget used,
- translation input/output excerpt,
- generated files and manifest,
- build/typecheck results,
- memory/speed observations on the M1 16GB machine,
- unresolved risks.
