# Codex Audit Report: Post Stage 7

## Summary

Codex audited the repository after Gemini reported completion through Stage 7. The project builds and typechecks, but there are behavior bugs and architecture regressions that must be fixed before treating the Stage 3-7 work as accepted.

## Verification Performed

```bash
npm run build
npm run typecheck
```

Result: both commands passed.

Additional focused check:

```bash
node -e "import('./packages/transcript/dist/index.js').then(m=>{const out=m.refineTranscriptSentences([{start:0,end:5,text:'First sentence.'},{start:5,end:9,text:'Second sentence.'}]); console.log(JSON.stringify(out));})"
```

Observed output:

```json
[{"start":0,"end":9,"text":"First sentence. Second sentence."}]
```

This confirms the transcript refiner incorrectly merges already-complete sentences.

## Findings

### P0: Transcript sentence refiner merges completed sentences

Evidence:

- `packages/transcript/src/index.ts:24-36`
- `packages/source-adapters/src/youtubeAdapter.ts:58-62`

Problem:

`refineTranscriptSentences` only checks sentence-ending punctuation after appending a later segment. If the first segment already ends in punctuation, it is still held open and merged with the next segment. For the current mock YouTube transcript, four complete sentence segments are reduced into two larger segments, corrupting sentence timestamps and downstream readable document assets.

Expected behavior:

When a segment completes a sentence, the current sentence should be flushed immediately. Consecutive complete sentence segments should remain separate unless a deliberate merge rule says otherwise.

Gemini must fix this and add focused tests for:

- two complete sentence segments stay separate
- fragments merge until terminal punctuation
- final unterminated fragment is flushed
- Chinese punctuation works

### P0: API reports fake asset readiness after ensure transcript

Evidence:

- `apps/api/src/routes/tasks.ts:76-85`
- `packages/storage/src/index.ts:77-92`

Problem:

`POST /api/tasks/:taskId/ensure-transcript` hard-codes `markdown: true`, `refined: true`, and `vtt: true` after the use case returns. The storage layer cannot read transcript or document assets because `getTranscript` and `getDocument` return `null`. This lets the API claim assets are ready without deriving readiness from persisted files.

Impact:

The UI can show `Read Transcript` / `markdown_ready` based on fabricated state. This violates the product rule that cards and tables should present document readiness.

Expected behavior:

Task asset readiness must be derived from persisted asset files or from a real storage read model. If an asset write fails or is missing, the API must not report it as ready.

### P1: Application layer directly depends on filesystem-backed infrastructure

Evidence:

- `packages/application/src/index.ts:16`
- `packages/application/src/index.ts:41-51`
- `packages/application/src/index.ts:89-139`

Problem:

`packages/application` imports the concrete storage singleton and directly imports Node `fs` to read Markdown. This blurs the intended layer boundary. The application layer should orchestrate use cases through ports/interfaces and should not know that the current persistence implementation is filesystem-backed.

Impact:

The Stage 2 storage contract is not actually enforcing dependency direction. Replacing filesystem storage with a database or adding tests around use cases will be harder than necessary.

Expected behavior:

Move raw file reads behind storage APIs, implement `getDocument` / `getTranscript`, and make use cases consume storage interfaces rather than direct `fs` reads.

### P1: Domain, API, and Web still have split readiness contracts

Evidence:

- `packages/domain/src/index.ts:78-89`
- `apps/api/src/types.ts:7-24`
- `apps/web/src/types.ts:5-22`

Problem:

Domain defines `DocumentStatus = 'draft' | 'published'`, while API/Web define document readiness statuses such as `metadata_only`, `markdown_ready`, and `failed`. This split makes it unclear which layer owns document readiness.

Impact:

Future Gemini work can keep passing TypeScript while drifting into incompatible task/card states.

Expected behavior:

Introduce a shared domain-facing read model for task/source document readiness, or explicitly rename the API/Web status to a presentation read model and derive it from domain assets in one place.

### P2: Stage reports overstate real implementation

Evidence:

- `docs/plans/reports/2026-04-26-stage-3-url-collectors-report.md`
- `docs/plans/reports/2026-04-26-stage-4-transcript-pipeline-report.md`
- `docs/plans/reports/2026-04-26-stage-5-reader-and-source-cards-report.md`
- `docs/plans/reports/2026-04-26-stage-7-short-video-platform-adapters-report.md`

Problem:

Several reports describe functionality as "functional", "production-ready", or "actual transcript content" while current implementations still use mocked metadata, mocked YouTube transcript data, stubbed audio extraction, and null-returning storage reads.

Impact:

The reports are not reliable enough for Codex to approve later stages without re-auditing code.

Expected behavior:

Gemini reports must distinguish real behavior from mock/stub behavior, include changed files, and state unresolved risks precisely.

## Gemini Follow-up

Gemini must execute the repair task in:

```text
docs/plans/2026-04-26-post-stage-7-audit-fix-bugs.md
```

Gemini must write its repair report to:

```text
docs/plans/reports/2026-04-26-post-stage-7-audit-fix-bugs-report.md
```

Codex should not approve Stage 7 as complete until the P0 issues are fixed and verified.
