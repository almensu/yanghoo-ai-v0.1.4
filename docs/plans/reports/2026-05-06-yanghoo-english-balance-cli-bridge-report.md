# Stage 16 Report: Yanghoo English Balance CLI Bridge

Date: 2026-05-06
Executor: Gemini
Status: Completed

## Summary of Changes

Implemented the CLI bridge commands to integrate `Anything-to-English` with Yanghoo CLI, generating subtitle evidence packs. The two repositories remain independent.

1. **`learning-channels list`**: Added new command `learning-channels list --json` to list taxonomy and indexed counts.
2. **`english-search`**: Added new command `english-search <query> --json` with support for filtering by `--channel`, `--channels`, `--category`, and `--tag`.
3. **`english-search batch`**: Added new command `english-search batch <scene-brief.json> --json` to generate deduplicated evidence packs from scene briefs.
4. **CLI Help**: Updated `cli-output-renderer.ts` to include the new commands in the help menu.
5. **External Skill**: Updated the `yanghoo-english-balance` skill instructions and created schema files for `scene-brief` and `evidence-pack`.

## Exact Commands Used For Testing

The following commands were run manually and through the verification script:

```bash
npm run -s cli -- learning-channels list --json
npm run -s cli -- english-search "would have" --category english-teacher --limit 5 --json
npm run -s cli -- english-search batch /tmp/scene-brief.json --category english-teacher --limit-per-query 5 --json
```

## Summarized Key JSON Fields

**`learning-channels list` Output:**
```json
{
  "channels": [
    {
      "channelId": "...",
      "title": "...",
      "category": "english-teacher",
      "tags": ["..."],
      "videoCount": 10,
      "selectedCount": 5,
      "captionReadyCount": 5,
      "indexedSentenceCount": 1000
    }
  ]
}
```

**`english-search` and Evidence Pack Output (`examples` array):**
```json
{
  "kind": "yanghoo-evidence-pack",
  "briefId": "...",
  "scene": "...",
  "queries": ["..."],
  "examples": [
    {
      "query": "...",
      "text": "...",
      "channelId": "...",
      "videoId": "...",
      "sourceId": "...",
      "title": "...",
      "start": 123.4,
      "youtubeTimestampUrl": "https://www.youtube.com/watch?v=...&t=123s",
      "captionKind": "manual"
    }
  ],
  "warnings": []
}
```

## Changed Files

**Yanghoo AI:**
- `apps/cli/src/cli-command-registry.ts`
- `apps/cli/src/cli-output-renderer.ts`
- `apps/cli/src/commands/learning-channels-command.ts` (New)
- `apps/cli/src/commands/english-search-command.ts` (New)
- `scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts` (New)

**Generated Skill Files:**
- `/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md`
- `/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/scene-brief-schema.md`
- `/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/references/evidence-pack-schema.md`

## Unresolved Risks
- No known unresolved risks. The integration is isolated to CLI entry points.
