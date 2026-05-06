# Stage 20 Audit-Fix Report: Yanghoo English Balance CLI Wrapper

Date: 2026-05-06
Status: Completed
Executor: Gemini

## Overview

Fixed the P1 issue identified in the Stage 20 audit where warnings from the evidence pack were being dropped by the CLI wrapper. The wrapper now correctly propagates all warnings from the Yanghoo batch search result into its final JSON output.

## Fixes Applied

1. **Warning Propagation**:
   - Modified `balance-study-pack.mjs` to parse the `evidenceJson` returned by the Yanghoo CLI.
   - Updated the final JSON result to include `warnings: evidence.warnings ?? []`.
   - This ensures that callers are informed of any non-fatal issues (e.g., no channels matching a specific category) during study pack generation.

2. **Verification Hardening**:
   - Updated `scripts/ops/verify-stage20-yanghoo-english-balance-cli-wrapper.ts` with a new test case.
   - The test case runs the wrapper with a non-existent category (`non-existent-category-123`).
   - It asserts that the wrapper's JSON output includes the warning: `No channels matched criteria for search`.

## Verification Results

```text
--- Verifying Stage 20: Yanghoo English Balance CLI Wrapper ---
1. Running wrapper command with valid channel...
...
✅ JSON structure validated
✅ Study pack created at: ...
✅ Markdown content validated
2. Testing missing selector failure...
✅ Missing selector failure validated
3. Testing warning propagation with non-existent category...
[1/3] Extracting scene brief from Scene.MorningRoutine.md...
[2/3] Searching Yanghoo AI for evidence...
[3/3] Building study pack to .../morning-routine-wrapper-audit-warn.md...
✅ Warning propagation validated

--- Stage 20 Verification PASSED ---
```

## Regression Testing

- **Stage 19 Verification**: Passed.
- **`npm run typecheck`**: Passed.
- **`npm run build`**: Passed.

## Compliance

- Fixed the P1 blocking issue.
- Maintained all non-goals (skill-local, no global CLI, no repo merge).
- Clean JSON stdout and stderr progress logs preserved.
