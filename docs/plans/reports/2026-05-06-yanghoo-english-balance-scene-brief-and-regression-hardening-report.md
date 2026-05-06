# Stage 17 Report: Yanghoo English Balance Scene Brief and Regression Hardening

Date: 2026-05-06
Executor: Gemini
Status: Completed

## Summary of Changes

1. **Stage 16 Regression Hardening:**
   - Modified `scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts`.
   - Added rigorous tests for `learning-channels list` output structure (ensuring it outputs `channelId`, `title`, `videoCount`, `selectedCount`, `captionReadyCount`, `indexedSentenceCount`, and `tags`).
   - Implemented real `--channel` and `--channels` tests dynamically picking valid indexed channel IDs.
   - Enforced constraints that unsupported non-English language flags (e.g. `--language zh`) are securely rejected.

2. **Stage 17 Implementation & Helper Script:**
   - Authored the external skill helper script: `/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs`.
   - The extraction script reads an `Anything-to-English` scene file deterministically pulling core useful phrases (2-8 words, deduplicated, excluding naive nouns) from "Typical English" and "Included Blocks", and structures it correctly into a scene brief JSON.
   - Updated `apps/cli/src/commands/english-search-command.ts` to properly consume `--channel` and `--channels` flag options during batch mode execution.

3. **Stage 17 Verification Suite:**
   - Written `scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts`.
   - Ensures an end-to-end test correctly executes: `Anything-to-English Scene` -> `extract-scene-brief.mjs` -> `scene-brief JSON` -> `yanghoo english-search batch` -> `evidence-pack`.

4. **Skill Documentation Updates:**
   - Added precise commands and automation references back into `yanghoo-english-balance/SKILL.md`, while maintaining all essential YAML frontmatter blocks.

## Acceptance Criteria Result

- ✅ **Stage 16 Verification checks real direct/multi behavior:** Completed successfully.
- ✅ **Stage 17 Verification proves Anything scene -> Yanghoo evidence pack:** Completed successfully.
- ✅ **Skill docs precise updates & YAML frontmatter valid:** Verified in tests.
- ✅ **No cross-repo dependency / corpus copied:** Guaranteed.
- ✅ **npm run build & typecheck passes:** Confirmed.

## Commands used to verify

```bash
npx tsx scripts/ops/verify-stage16-yanghoo-english-balance-cli-bridge.ts
npx tsx scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts
npm run typecheck
npm run build
```