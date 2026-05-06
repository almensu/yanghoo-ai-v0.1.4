# Stage 22 Report: Yanghoo English Balance Query Quality Hardening

Date: 2026-05-06
Executor: Gemini
Status: Completed

## Overview

Successfully hardened the query extraction quality for the Yanghoo English Balance skill. The `extract-scene-brief.mjs` script now produces high-quality, idiomatic English queries by applying domain mappings, improving CamelCase normalization, and filtering low-value technical tokens.

## Changes Applied

### External Skill
- **`extract-scene-brief.mjs`**:
  - Implemented careful CamelCase and acronym normalization (e.g., `CallADidi` -> `call a didi`).
  - Added a domain mapping layer to transform Anything-specific terms into natural English (e.g., `call a didi` -> `called a cab`, `throat problem` -> `sore throat`).
  - Improved `Typical English` extraction by adding more natural splitters (`so`, `but`, `because`, `,`, `—`).
  - Implemented a blacklist for low-value technical substrings (`state.`, `action.`, etc.).
  - Added priority sorting to prefer longer, more specific phrases (3-6 words) while maintaining a 15-query limit.

## Validation Results: Scene.HospitalTripWithWife

### Query List Comparison

| Source | Before (Stage 21) | After (Stage 22) |
| :--- | :--- | :--- |
| **Blocks** | `state.throat problem`, `call adidi`, `state.pleasantly surprised` | `sore throat`, `called a cab`, `pleasantly surprised` |
| **Typical English** | `i called a didi just a regular ride`, `go to hospital` | `took her to the hospital`, `just a regular ride`, `a premium car showed up a chinese mpv`, `my wife's throat was bothering her` |

### Extractor Output (Stage 22)
```json
[
  "a premium car showed up a chinese mpv",
  "my wife's throat was bothering her",
  "i took her to the hospital",
  "took her to the hospital",
  "just a regular ride",
  "called a cab",
  "sore throat",
  "pleasantly surprised"
]
```

### Wrapper Result Summary
- **Scene**: `Scene.HospitalTripWithWife`
- **Queries**: 8
- **Evidence Found**: 4 (High-quality spoken examples for `sore throat` and `pleasantly surprised`)
- **Study Pack Path**: `/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/hospital-trip-stage22-audit.md`

## Verification Command Results

- `npx tsx scripts/ops/verify-stage22-yanghoo-english-balance-query-quality.ts`: **PASSED**
- `npx tsx scripts/ops/verify-stage17-yanghoo-english-balance-scene-brief.ts`: **PASSED**
- `npx tsx scripts/ops/verify-stage20-yanghoo-english-balance-cli-wrapper.ts`: **PASSED**
- `npm run typecheck`: **PASSED**
- `npm run build`: **PASSED**

## Compliance & Non-Goals
- No LLM or network calls used at runtime.
- No changes to Yanghoo production search behavior.
- No global CLI installations.
- Repository integrity maintained (typecheck/build passed).
- **Skill Documentation**: No changes were required to `workflows.md` as the command interface remains identical; the improvements are internal to the extraction logic.

## Unresolved Risks
- **Heuristic Sensitivity**: While mappings for `didi` -> `cab` are effective, other scene-specific idioms might still require manual mapping as they are discovered.
