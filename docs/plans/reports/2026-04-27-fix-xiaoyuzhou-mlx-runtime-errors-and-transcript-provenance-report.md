# Fix Xiaoyuzhou MLX Runtime Errors and Transcript Provenance Report

## Summary
Critical architectural and UI regressions in the Xiaoyuzhou workflow have been addressed. The system now strictly separates shownotes from transcript data, ensures correct provenance for MLX-based transcription, and surfaces actionable backend diagnostics to the user interface.

## MLX Runtime & Provisioning
- **Status**: Environment confirmed as `arm64` (Apple Silicon). 
- **Blocker**: `pip install mlx` continues to fail with "ResolutionImpossible", likely due to PyPI index restrictions or environment configuration. 
- **Diagnostic**: `python3 -c "import mlx.core"` accurately reports `ModuleNotFoundError: No module named 'mlx'`.
- **Integrity**: The application now performs a strict environment check. In accordance with the "no fake success" mandate, transcription attempts will explicitly fail with a detailed troubleshooting guide until a working MLX runtime is provisioned manually.

## Transcript Provenance (P1)
- **Use Case Refactoring**: Updated `ensureTranscriptUseCase` in `packages/application`.
  - For Xiaoyuzhou, it no longer attempts to "fake" a transcript from shownotes.
  - It now routes strictly to the staged audio-first flow or calls `transcribeAudioUseCase` (which uses the real MLX path).
- **Correct Labeling**: `transcribeAudioUseCase` is now the single source of truth for MLX ASR, ensuring `sourceType: mlx_audio` is recorded in the manifest only when the real engine succeeds.

## UI Error Reporting (P1)
- **API Client**: Upgraded `apps/web/src/api/client.ts` to parse JSON error bodies. Generic `500` alerts are replaced by real backend error messages.
- **TaskCard UI**: Added inline error display. When transcription fails due to environment issues, the card now shows the specific diagnostic: 
  > "Real transcription engine (mlx-audio) is not correctly installed or compatible with this environment. Note: Local ASR requires an Apple Silicon Mac and the 'mlx' core library."

## Data Integrity (P2)
- **Shownotes Separation**: Updated `XiaoyuzhouSourceAdapter`.
  - Removed `initialSegments` extraction from metadata.
  - Introduced a dedicated `shownotes` field in the `Source` model.
  - This prevents huge HTML payloads from bloating the task list and contaminating transcript readiness.

## Verification Results
### API Response (transcribe-audio)
```json
{
  "message": "Real transcription engine (mlx-audio) is not correctly installed or compatible with this environment. \n     Note: Local ASR requires an Apple Silicon Mac and the 'mlx' core library.\n     Current status: ModuleNotFoundError: No module named 'mlx'\n     Resolution: Please run 'pip install mlx-audio mlx' in a compatible environment."
}
```

### Readiness Output
Verified for `xyz-69a64629de29766da93331ec`:
```json
{
  "status": "metadata_only",
  "source": "none",
  "sentencesCount": 0,
  "hasAudio": true
}
```
Result: **Fulfills the requirement**. No fake document generated.

## Unresolved Risks
- **Env Lock**: Automated installation of `mlx` core remains blocked in this specific sandbox. Manual environment setup by the system owner is required for full ASR functionality.
