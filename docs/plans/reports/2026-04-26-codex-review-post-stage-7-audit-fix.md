# Codex Review: Post Stage 7 Audit Fix

## Summary

Codex reviewed Gemini's repair report:

```text
docs/plans/reports/2026-04-26-post-stage-7-audit-fix-bugs-report.md
```

The two P0 issues from the audit are resolved enough to unblock continued work:

- transcript sentence refinement no longer merges already-complete sentences
- API readiness is no longer hard-coded to `markdown_ready` after `ensure-transcript`

Stage 7 can move forward with follow-up cleanup items tracked below.

## Verification Performed

```bash
npm run build
npm run typecheck
npx tsx scripts/ops/verify-refiner-fix.ts
```

Results:

- `npm run build`: passed
- `npm run typecheck`: passed
- `npx tsx scripts/ops/verify-refiner-fix.ts`: passed after running outside the sandbox because `tsx` could not create its local IPC pipe under sandbox restrictions

Focused runtime checks:

```bash
node -e "import('@yanghoo/transcript').then(m=>{const out=m.refineTranscriptSentences([{start:0,end:5,text:'First sentence.'},{start:5,end:9,text:'Second sentence.'}]); console.log(out.length, JSON.stringify(out));})"
```

Observed:

```text
2 [{"start":0,"end":5,"text":"First sentence."},{"start":5,"end":9,"text":"Second sentence."}]
```

Readiness spot check:

```bash
node -e "import('@yanghoo/storage').then(async m=>{for (const id of ['yt-dQw4w9WgXcQ','dy-7312345678901234567']) console.log(id, await m.documentStorage.getDocumentReadiness(id));})"
```

Observed:

- `yt-dQw4w9WgXcQ`: `markdown_ready`, with Markdown, refined transcript, and VTT present
- `dy-7312345678901234567`: `metadata_only`, with no generated assets present

## Accepted Fixes

### P0 accepted: transcript refiner

Evidence:

- `packages/transcript/src/index.ts`
- `scripts/ops/verify-refiner-fix.ts`

The refiner now flushes the current segment immediately when the accumulated text ends with sentence punctuation. The focused verification covers complete sentences, merged fragments, Chinese punctuation, and unterminated final fragments.

### P0 accepted: no hard-coded markdown readiness

Evidence:

- `apps/api/src/routes/tasks.ts`
- `packages/storage/src/index.ts`

The API now calls `documentStorage.getDocumentReadiness()` and returns readiness derived from persisted asset files.

### P1 partially accepted: application no longer reads `fs` directly

Evidence:

- `packages/application/src/index.ts`
- `packages/storage/src/index.ts`

`packages/application` no longer imports or dynamically imports Node `fs` for chat context. Document content is read through `documentStorage.getDocument()`.

## Remaining Findings

### P1: readiness source is still not truthful

Evidence:

- `packages/domain/src/index.ts:93-100`
- `packages/storage/src/index.ts:84-98`
- `packages/storage/src/index.ts:156-164`

Problem:

`DocumentReadiness.source` is typed as `TranscriptSourceType`, but `getDocumentReadiness()` always returns `source: 'none'`, even when transcript assets exist. `getTranscript()` also reconstructs `sourceType: 'none'` from `transcript-sentences.json`.

Impact:

The readiness status is now truthful for file presence, but not for transcript source provenance. This matters because the product explicitly prioritizes transcript source selection.

Required follow-up:

Persist enough transcript metadata to recover `sourceType`, or derive it from a saved transcript manifest rather than from `transcript-sentences.json` alone.

### P2: frontend treats `refined_ready` as readable while Reader only renders Markdown

Evidence:

- `apps/web/src/components/TaskCard.tsx:35`
- `apps/web/src/components/Reader.tsx:85-94`

Problem:

`TaskCard` allows `Read Transcript` when status is `refined_ready`, but `Reader` only renders `task.content`, which is populated from `document.md`. A source with refined transcript but no Markdown will open the reader and show "No document available".

Required follow-up:

Either only treat `markdown_ready` / `enriched` as readable, or make the Reader render refined transcript segments when Markdown is missing.

### P2: existing generated fixture is stale

Evidence:

- `data/sources/yt-dQw4w9WgXcQ/transcript-sentences.json`
- readiness spot check returned `sentencesCount: 2`

Problem:

The old generated YouTube fixture still reflects the pre-fix refiner output. This is not a code blocker, but it can confuse manual UI checks.

Required follow-up:

Regenerate existing local sample assets after the fix, or document that existing `data/` contents are disposable local artifacts.

## Decision

Gemini's P0 repair is accepted. Continue with the remaining P1/P2 cleanup before claiming the reader/workspace is fully product-correct.
