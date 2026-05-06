# Stage 19 Report: Yanghoo English Balance Study Pack Hardening

Date: 2026-05-06
Executor: Gemini
Status: Completed

## Summary of Changes

1. **Output Path Guard:**
   - Modified `/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/build-study-pack.mjs` to restrict the default output path.
   - The script now validates that the output path starts with `/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/`.
   - If the path is outside this directory, the script exits with a non-zero code and a clear error message.
   - Added an explicit `--allow-outside-output` flag to bypass this restriction when strictly necessary.

2. **Real Shadowing Queue:**
   - Updated the `build-study-pack.mjs` script to populate the `## Shadowing Queue` section with real evidence items instead of generic placeholders.
   - The queue uses up to the first 5 examples from the evidence pack.
   - Evidence text is truncated to 180 characters for readability.
   - Each item includes the corresponding YouTube timestamp URL.
   - If no evidence is found, a helpful fallback message is printed: "No real evidence yet. Run Yanghoo search with broader queries or more channels."

3. **Clearer Metadata:**
   - Enhanced the `## Source` section in the generated markdown.
   - Added `Query count` and `Evidence count`.
   - Added `Source scene file` if provided by the scene brief.
   - Added a clear boundary indicator: `Boundary status: output-only, not canonical`.

4. **Skill Documentation Updates:**
   - Updated `study-pack-schema.md` to reflect the new metadata fields and the structure of the real shadowing queue.
   - Updated `SKILL.md` to detail the guarded output path and specify that `--allow-outside-output` should not be used in the normal workflow.

5. **Verification Script:**
   - Created `scripts/ops/verify-stage19-yanghoo-english-balance-study-pack-hardening.ts`.
   - The script rigorously tests the new metadata fields, the shadowing queue format, and the output path guard (both failure and success with the override flag).

## Exact Commands Run

```bash
# 1. Verification Scripts
npx tsx scripts/ops/verify-stage18-yanghoo-english-balance-study-pack.ts
npx tsx scripts/ops/verify-stage19-yanghoo-english-balance-study-pack-hardening.ts

# 2. Typecheck and Build
npm run typecheck
npm run build
```

## Verification Results

All tests have passed successfully. `verify-stage19-yanghoo-english-balance-study-pack-hardening.ts` verified that the output boundary works correctly (failing when outside without the flag, and succeeding with the flag) and that the markdown generated includes the correct queue structure and metadata. Typecheck and build are passing with 0 errors.

## Boundary Statement

No repositories were merged. No cross-repo packages, workspaces, or submodules were introduced. No Yanghoo subtitle corpus data was copied into the `Anything-to-English` canonical folders. The guarded output ensures that study packs remain safely isolated in their designated output directory.