# Stage 16 Plan: Yanghoo English Balance CLI Bridge

Date: 2026-05-06
Owner: Codex
Executor: Gemini
Status: Ready

## Goal

Make `yanghoo-english-balance` able to:

```text
read an Anything-to-English scene
-> extract compact search queries
-> call Yanghoo AI CLI
-> produce a real subtitle evidence pack
```

Keep both repositories independent. This is a CLI bridge and skill workflow, not a repo merge.

## Non-Goals

- Do not merge `Anything-to-English` into Yanghoo AI.
- Do not add submodules, workspaces, packages, or runtime imports across repos.
- Do not copy Yanghoo subtitle corpora into `Anything-to-English`.
- Do not write real subtitle examples into `Anything-to-English/canonical`.
- Do not build a new UI in this stage.
- Do not change subtitle acquisition logic.

## Current Baseline

Yanghoo CLI already has:

```bash
npm run -s cli -- channel add <url> --limit <n> --json
npm run -s cli -- channel captions <channelId> --language en --batch-size <n> --resume --json
npm run -s cli -- channel refresh <channelId> --latest <n> --json
npm run -s cli -- sentence-index build --channel <channelId> --language en --json
npm run -s cli -- sentence-index search "query" --channel <channelId> --language en --limit 20 --json
```

Needed for this bridge:

```bash
npm run -s cli -- learning-channels list --json
npm run -s cli -- english-search "query" --channel <channelId> --limit 20 --json
npm run -s cli -- english-search "query" --channels <id,id> --limit 20 --json
npm run -s cli -- english-search "query" --category <category> --tag <tag> --limit 20 --json
npm run -s cli -- english-search batch <scene-brief.json> --limit-per-query 10 --json
```

## Target Files

Yanghoo AI:

```text
apps/cli/src/cli-command-registry.ts
apps/cli/src/cli-output-renderer.ts
apps/cli/src/commands/learning-channels-command.ts
apps/cli/src/commands/english-search-command.ts
packages/application/src/searchEnglishSentenceIndexUseCase.ts
scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
docs/plans/reports/2026-05-06-yanghoo-english-balance-cli-bridge-report.md
```

External skill:

```text
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/scene-brief-schema.md
/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/evidence-pack-schema.md
```

## Implementation Instructions

### 1. Add `learning-channels list`

Add CLI command:

```bash
npm run -s cli -- learning-channels list --json
```

Output shape:

```json
{
  "channels": [
    {
      "channelId": "youtube-...",
      "title": "English is EZ",
      "category": "english-teacher",
      "tags": ["american", "beginner"],
      "videoCount": 236,
      "selectedCount": 100,
      "captionReadyCount": 80,
      "indexedSentenceCount": 12000
    }
  ]
}
```

Use existing application use cases. Do not read files directly from CLI.

### 2. Add `english-search`

Add CLI command:

```bash
npm run -s cli -- english-search "would have" --channel youtube-... --limit 20 --json
npm run -s cli -- english-search "would have" --channels youtube-a,youtube-b --limit 20 --json
npm run -s cli -- english-search "would have" --category english-teacher --tag american --limit 20 --json
```

Rules:

- Language is always `en`.
- Reject non-English language flags if supplied.
- `--channel` searches one channel.
- `--channels` searches multiple channel IDs.
- `--category` / `--tag` resolves matching indexed learning channels first.
- Empty channel resolution returns `{ "query": "...", "results": [], "warnings": [...] }`, not a crash.
- Preserve timestamp URLs and source metadata.

Output shape:

```json
{
  "query": "would have",
  "results": [
    {
      "channelId": "youtube-...",
      "videoId": "...",
      "sourceId": "youtube-...",
      "title": "...",
      "text": "...",
      "start": 123.4,
      "youtubeTimestampUrl": "https://www.youtube.com/watch?v=...&t=123s",
      "captionKind": "manual"
    }
  ],
  "warnings": []
}
```

### 3. Add `english-search batch`

Input:

```bash
npm run -s cli -- english-search batch /tmp/scene-brief.json --category english-teacher --limit-per-query 10 --json
```

Accept scene brief:

```json
{
  "kind": "scene-brief",
  "id": "hospital-trip-with-child-2026-05-06",
  "scene": "Scene.HospitalTripWithChild",
  "level": "L2",
  "queries": ["keep him calm", "what should we watch for"]
}
```

Output evidence pack:

```json
{
  "kind": "yanghoo-evidence-pack",
  "briefId": "hospital-trip-with-child-2026-05-06",
  "scene": "Scene.HospitalTripWithChild",
  "queries": ["keep him calm", "what should we watch for"],
  "examples": [],
  "warnings": []
}
```

Each example must include:

```text
query, text, channelId, videoId, sourceId, title, start, youtubeTimestampUrl, captionKind
```

Deduplicate by:

```text
channelId + videoId + start + text
```

### 4. Update CLI help

Add to help:

```text
yanghoo learning-channels list
yanghoo english-search <query>
yanghoo english-search batch <scene-brief.json>
```

### 5. Update `yanghoo-english-balance` Skill

Add a concise workflow:

```text
Read Anything scene -> create scene brief -> call:
npm run -s cli -- english-search batch <brief.json> --category <category> --limit-per-query 10 --json
-> produce evidence pack -> optionally compose study pack
```

Keep boundary rules:

- skill can read both repos,
- skill can call Yanghoo CLI,
- skill cannot merge repos or copy corpora,
- skill cannot write real examples into Anything canonical.

## Query Extraction Guidance For Skill

When reading Anything scene files, extract search queries from:

```text
Core Meaning
Included Blocks
Typical Chain
Main Use
Typical English
```

Prefer:

```text
verb phrases: keep him calm, get dressed
collocations: waited for almost, turned out
sentence frames: I was trying to, What should we watch for
scene intents: explain symptoms, ask follow-up questions
```

Avoid broad single nouns:

```text
doctor, child, morning, thing, good
```

Keep first version deterministic and simple:

- max 12 queries per scene,
- query length 2-8 words,
- no LLM dependency required.

## Verification

Run:

```bash
npm run build -w @yanghoo/application
npm run typecheck
npm run build
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
```

Manual smoke with real data:

```bash
npm run -s cli -- learning-channels list --json
npm run -s cli -- english-search "would have" --category english-teacher --limit 5 --json
npm run -s cli -- english-search batch /tmp/scene-brief.json --category english-teacher --limit-per-query 5 --json
```

Report must include:

- exact commands,
- summarized key JSON fields,
- changed files,
- generated skill files,
- unresolved risks.

## Acceptance Criteria

- `learning-channels list --json` returns taxonomy and indexed counts.
- `english-search` works for one channel, multiple channels, and category/tag selection.
- `english-search batch` returns a valid evidence pack from a scene brief.
- JSON mode is clean stdout.
- Empty channel/filter results are graceful.
- Existing UI/API behavior is unchanged.
- Existing Stage 15 verification still passes.
- `npm run typecheck` and `npm run build` pass.

## Gemini Prompt

Implement Stage 16 exactly as planned in:

```text
docs/plans/2026-05-06-stage-yanghoo-english-balance-cli-bridge.md
```

Keep the two repositories independent. Add only Yanghoo CLI bridge commands and update the external `yanghoo-english-balance` skill workflow. Do not build UI, do not change subtitle acquisition, and do not copy data across repos. Verify with typecheck, build, the new Stage 16 script, and a real CLI smoke. Write the report to:

```text
docs/plans/reports/2026-05-06-yanghoo-english-balance-cli-bridge-report.md
```

