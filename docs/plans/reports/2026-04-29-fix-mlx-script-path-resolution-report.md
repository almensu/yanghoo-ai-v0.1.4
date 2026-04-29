# Report: Fix MLX Script Path Resolution

## Status
- **Date**: 2026-04-29
- **Owner**: Gemini
- **Acceptance**: Accepted

## Summary
Fixed a critical path resolution error where the MLX transcription script was incorrectly resolved relative to the API's working directory (`apps/api`). Implemented a robust `resolveRootScript` helper that uses `import.meta.url` and upward directory walking to find the canonical repository root, ensuring scripts are correctly located regardless of whether the process is started from the root or a workspace subdirectory.

## Changed Files
- `packages/application/src/resolveProjectRoot.ts`: New robust path resolver for repository-wide script discovery.
- `packages/application/src/index.ts`: Updated `transcribeAudioUseCase` to use the new resolver and added defensive `fs.existsSync` checks.
- `docs/GOTCHAS.md`: Updated with the "workspace cwd vs repo script path" pitfall.

## Verification Results

### 1. Path Resolution Test
Created a diagnostic script to verify resolution from multiple working directories:
- **From Root**:
  - CWD: `/.../yanghoo-ai-v0.1.4`
  - Resolved Script: `/.../yanghoo-ai-v0.1.4/scripts/transcript/run-mlx-audio-transcription.py`
  - **Result**: SUCCESS
- **From apps/api**:
  - CWD: `/.../yanghoo-ai-v0.1.4/apps/api`
  - Resolved Script: `/.../yanghoo-ai-v0.1.4/scripts/transcript/run-mlx-audio-transcription.py`
  - **Result**: SUCCESS
- **From packages/application**:
  - CWD: `/.../yanghoo-ai-v0.1.4/packages/application`
  - Resolved Script: `/.../yanghoo-ai-v0.1.4/scripts/transcript/run-mlx-audio-transcription.py`
  - **Result**: SUCCESS

### 2. Defensive Error Handling
Verified that missing scripts now produce detailed diagnostics:
```text
Required script not found.
Expected Path: /.../scripts/transcript/run-mlx-audio-transcription.py
Current CWD: /.../apps/api
Resolved Root: /.../
Relative Path: scripts/transcript/run-mlx-audio-transcription.py
```

### 3. Build & Typecheck
```bash
npm run build && npm run typecheck
```
**Result**: Pass.

## Unresolved Risks
- None. The resolution logic is now independent of `process.cwd()`.
