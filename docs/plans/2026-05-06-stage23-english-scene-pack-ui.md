# Stage 23 Plan: English Scene Pack UI Integration

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready for review

## User Problem

The current `yanghoo-english-balance` skill can answer:

```text
对小孩早上起床的场景做筛选
```

by generating a Markdown study pack such as:

```text
/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/kid-wake-up-morning.md
```

That is not the desired learning experience. The user expects the scene answers to appear directly in Yanghoo's English Search UI so they can view, play, save, and study the sentence examples in the browser.

## Goal

Add a first-class Yanghoo "English Scene Pack" surface:

```text
scene request / scene file
-> scene brief
-> Yanghoo evidence pack
-> imported Yanghoo scene pack
-> English Search UI scene-pack mode
```

The UI should show the same learning material currently buried in Markdown:

- scene name,
- source request or scene source,
- search queries,
- real subtitle evidence grouped by query,
- shadowing queue,
- playable timestamped examples,
- save/review actions using existing saved-example behavior.

## Non-Goals

- Do not parse Markdown as the source of truth.
- Do not move `Anything-to-English` into Yanghoo.
- Do not copy Yanghoo subtitle corpora into `Anything-to-English`.
- Do not write to `Anything-to-English/canonical`.
- Do not add LLM query extraction inside Yanghoo runtime.
- Do not replace the existing English Search single-query workflow.
- Do not build a full spaced-repetition system in this stage.

## Product Direction

Markdown remains an export artifact. Yanghoo UI should consume structured artifacts:

```text
scene brief JSON + evidence pack JSON + optional study-pack metadata
```

The scene pack should feel like a curated learning queue inside English Search:

- left panel: scene packs and queries,
- center: evidence cards grouped by query,
- right panel: existing video player/context panel,
- actions: play, copy sentence, copy link, save sentence, mark reviewed if already saved.

## Target Files

Domain/application/storage:

```text
packages/domain/src/englishScenePack.ts
packages/domain/src/index.ts
packages/domain/src/storage.ts
packages/storage/src/englishScenePackStorage.ts
packages/storage/src/index.ts
packages/application/src/importEnglishScenePackUseCase.ts
packages/application/src/listEnglishScenePacksUseCase.ts
packages/application/src/getEnglishScenePackUseCase.ts
packages/application/src/index.ts
```

API:

```text
apps/api/src/routes/englishScenePacks.ts
apps/api/src/server.ts
```

CLI:

```text
apps/cli/src/commands/english-scene-packs-command.ts
apps/cli/src/cli-command-registry.ts
apps/cli/src/cli-output-renderer.ts
```

Web:

```text
apps/web/src/api/client.ts
apps/web/src/components/EnglishSentenceSearch.tsx
```

External skill:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/workflows.md
```

Verification/report:

```text
scripts/ops/verify-stage23-english-scene-pack-ui.ts
docs/plans/reports/2026-05-06-english-scene-pack-ui-report.md
```

## Data Model

Add domain model:

```ts
export interface EnglishScenePack {
  version: 1;
  id: string;
  title: string;
  scene: string;
  request?: string;
  level: string;
  source: {
    kind: 'anything-scene' | 'ad-hoc-request';
    path?: string;
    repo?: string;
  };
  queries: string[];
  examples: EnglishScenePackExample[];
  warnings: string[];
  studyPackPath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EnglishScenePackExample {
  query: string;
  text: string;
  channelId: string;
  videoId: string;
  sourceId: string;
  title?: string;
  start: number;
  end?: number;
  youtubeTimestampUrl: string;
  youtubeEmbedUrl: string;
  startSeconds: number;
  captionKind?: string;
  captionLanguage: 'en';
}
```

Storage path:

```text
data/learning/english-scene-packs/<packId>.json
data/learning/english-scene-packs/index.json
```

Index entries should include:

```text
id, title, scene, request, queryCount, exampleCount, updatedAt
```

## Import Semantics

Add CLI:

```bash
npm run -s cli -- english-scene-packs import \
  --scene-brief /tmp/yanghoo-balance-kid-wake-up-morning-scene-brief.json \
  --evidence-pack /tmp/yanghoo-balance-kid-wake-up-morning-evidence-pack.json \
  --study-pack /Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/kid-wake-up-morning.md \
  --request "对小孩早上起床的场景做筛选" \
  --json
```

Output:

```json
{
  "pack": {
    "id": "kid-wake-up-morning",
    "scene": "Scene.KidWakeUpMorning",
    "queryCount": 12,
    "exampleCount": 15,
    "studyPackPath": "/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/kid-wake-up-morning.md"
  }
}
```

Add list/show commands:

```bash
npm run -s cli -- english-scene-packs list --json
npm run -s cli -- english-scene-packs show kid-wake-up-morning --json
```

Rules:

- Import must use structured `scene-brief` and `yanghoo-evidence-pack` JSON, not Markdown parsing.
- If `evidence.examples` is empty, still import the pack with warnings.
- Convert each example into UI-playable fields, including `youtubeEmbedUrl` and `startSeconds`.
- Upsert by pack id.
- Do not mutate saved examples automatically. Saving remains a user action in UI.

## External Skill Workflow

Update `balance-study-pack.mjs` to optionally import into Yanghoo:

```bash
node /Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs \
  --scene-file <scene.md> \
  --id kid-wake-up-morning \
  --channels <ids> \
  --request "对小孩早上起床的场景做筛选" \
  --import-yanghoo
```

Wrapper stdout should then include:

```json
{
  "scene": "Scene.KidWakeUpMorning",
  "scenePackId": "kid-wake-up-morning",
  "scenePackImported": true,
  "studyPackPath": ".../kid-wake-up-morning.md",
  "queryCount": 12,
  "exampleCount": 15,
  "warnings": []
}
```

Keep default behavior backward compatible:

- Without `--import-yanghoo`, generate Markdown only.
- With `--import-yanghoo`, generate Markdown and import structured pack.

## API

Add endpoints:

```text
GET /api/english-scene-packs
GET /api/english-scene-packs/:id
DELETE /api/english-scene-packs/:id
```

Optional for this stage:

```text
POST /api/english-scene-packs/import
```

Prefer CLI import first. API import can be deferred unless needed by verification.

Response shapes should be web-ready:

```json
{
  "packs": [
    {
      "id": "kid-wake-up-morning",
      "title": "Scene.KidWakeUpMorning",
      "scene": "Scene.KidWakeUpMorning",
      "request": "对小孩早上起床的场景做筛选",
      "queryCount": 12,
      "exampleCount": 15,
      "updatedAt": "..."
    }
  ]
}
```

`GET /api/english-scene-packs/:id` returns the full pack.

## UI Requirements

Enhance `EnglishSentenceSearch.tsx` with a scene-pack mode, not a separate app page.

Minimum UI:

1. Add a top or left-panel section:

```text
Scene Packs
```

2. Show imported packs:

```text
Kid Wake Up Morning
12 queries · 15 examples
```

3. Selecting a pack should:

- switch center panel from "single-query search results" to "scene pack results",
- show scene title and request,
- show query chips,
- group examples by query,
- allow clicking any example to use the existing player panel,
- allow Save/Sentence/Link actions using existing result-card behavior.

4. Keep single-query search intact.

5. Empty states:

- no packs imported,
- pack has no evidence examples,
- evidence references missing channel/source.

6. Do not show generated practice prompts as real evidence.

## UI Mapping From Evidence Example To Existing Result

Scene-pack examples should be adapted to existing `EnglishSentenceSearchResult` shape:

```ts
{
  entry: {
    sourceId,
    videoId,
    channelId,
    title,
    start,
    end,
    text,
    normalizedText,
    captionKind,
    captionLanguage: 'en'
  },
  youtubeTimestampUrl,
  youtubeEmbedUrl,
  startSeconds
}
```

This lets existing:

- player panel,
- save button,
- copy sentence/link,
- context fetch,
- selected active result

be reused.

## Verification

Create:

```text
scripts/ops/verify-stage23-english-scene-pack-ui.ts
```

The verification should:

1. Use existing `kid-wake-up-morning` temp artifacts if present, or generate them through wrapper with `--keep-temp`.
2. Import the scene pack through the new CLI.
3. Assert `data/learning/english-scene-packs/<id>.json` exists.
4. Assert list CLI includes the pack.
5. Assert show CLI returns:
   - request,
   - queries,
   - examples,
   - playable URLs.
6. Start API in-process if existing verification patterns allow, or use application use cases directly to assert list/get behavior.
7. Run a lightweight web build/typecheck to prove UI compiles.

Required commands:

```bash
npx tsx scripts/ops/verify-stage23-english-scene-pack-ui.ts
npx tsx scripts/ops/verify-stage22-yanghoo-english-balance-query-quality.ts
npm run typecheck
npm run build
```

If browser evidence is practical, capture one screenshot of English Search with `kid-wake-up-morning` selected. If not practical, state that browser visual QA is skipped and provide DOM/API evidence.

## Acceptance Criteria

- User can import a Yanghoo balance result into Yanghoo as a structured scene pack.
- `kid-wake-up-morning` appears in Yanghoo UI.
- User can inspect the pack's queries and real subtitle examples in English Search UI.
- User can click an example and use the existing player panel.
- User can save an example from the scene-pack view.
- Markdown remains available but is not the UI source of truth.
- Existing English Search single-query behavior still works.
- Existing Stage 22 verification still passes.
- Typecheck and build pass.

## Rejection Conditions

Reject if:

- UI parses Markdown instead of structured JSON.
- Imported examples cannot be played in the existing player panel.
- Generated practice prompts are displayed as real evidence.
- Import mutates saved examples without user action.
- `Anything-to-English` becomes a package/workspace/runtime dependency.
- The implementation writes into `Anything-to-English/canonical`.

## Expected Report

Write:

```text
docs/plans/reports/2026-05-06-english-scene-pack-ui-report.md
```

The report must include:

- changed files,
- exact commands run,
- imported pack id,
- generated storage files,
- API/CLI output summary,
- UI behavior summary,
- screenshots if available,
- unresolved risks,
- skipped checks and reasons.

## Gemini Prompt

Implement Stage 23 exactly as planned in:

```text
docs/plans/2026-05-06-stage23-english-scene-pack-ui.md
```

The user expectation is: when they ask the `yanghoo-english-balance` skill "对小孩早上起床的场景做筛选", the result should not only be a Markdown file. It should appear inside Yanghoo's English Search UI as a scene learning pack with playable, saveable real subtitle examples.

Keep the architecture boundaries:

- Yanghoo owns real subtitle evidence and UI.
- `Anything-to-English` owns scene definitions.
- The external skill coordinates and imports structured artifacts.
- Markdown is export only, not the UI source of truth.

Run the required verification commands and write the report to:

```text
docs/plans/reports/2026-05-06-english-scene-pack-ui-report.md
```
