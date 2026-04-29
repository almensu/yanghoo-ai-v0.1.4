# Report: Rewrite Project-Native MLX Transcription Script

## Status
- **Date**: 2026-04-29
- **Owner**: Gemini
- **Acceptance**: Accepted

## Summary
Replaced the direct CLI call to `mlx_audio` with a project-native Python wrapper `scripts/transcript/run-mlx-audio-transcription.py`. Updated `transcribeAudioUseCase` to use this new script and enforced the requirement for `MLX_AUDIO_PYTHON` environment variable with clear, actionable error messages.

## Changed Files
- `scripts/transcript/run-mlx-audio-transcription.py`: New project-native Python transcription script.
- `packages/application/src/index.ts`: Updated `transcribeAudioUseCase` to use the new script and improved error handling.
- `README.md`: Updated with instructions for MLX-enabled dev server and script usage.

## Verification Results

### 1. Build and Typecheck
```bash
npm run build && npm run typecheck
```
**Result**: Pass.

### 2. Wrapper Smoke Test
Created a short audio fixture and ran the new Python script:
```bash
/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python \
  scripts/transcript/run-mlx-audio-transcription.py \
  --audio "tmp/yanghoo-mlx-script-test/audio.wav" \
  --model mlx-community/whisper-large-v3-turbo-asr-fp16 \
  --output-json "tmp/yanghoo-mlx-script-test/mlx-script-output.json"
```
**Output JSON**:
```json
{
  "text": " Hello Yanghou transcript test",
  "segments": [
    {
      "start": 0.0,
      "end": 2.24,
      "text": "Hello Yanghou transcript test"
    }
  ],
  "metadata": {
    "model": "mlx-community/whisper-large-v3-turbo-asr-fp16",
    "audioFile": "audio.wav",
    "startedAt": "2026-04-29T01:29:35Z",
    "finishedAt": "2026-04-29T01:29:39Z",
    "elapsedSec": 3.41,
    "segmentsCount": 1
  }
}
```

### 3. API/Source Verification
Tested full transcription flow with a dummy source:
```bash
export MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python
npx tsx scripts/transcript/transcribe-audio-mlx.ts test-mlx-source
```
**Generated Assets**:
- `transcript-manifest.json` (sourceType: mlx_audio)
- `transcript-raw.json`
- `transcript-sentences.json`
- `transcript.vtt`
- `document.md`

### 4. Negative Verification (Missing MLX_AUDIO_PYTHON)
```bash
unset MLX_AUDIO_PYTHON
npx tsx scripts/transcript/transcribe-audio-mlx.ts xyz-69a64629de29766da93331ec
```
**Error Output**:
```text
Transcription failed: MLX_AUDIO_PYTHON is not configured. Transcription requires a valid MLX Python runtime.
Resolution: Start the API with:
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev
```

## Unresolved Risks
- The Python script assumes `mlx_audio.stt.generate.generate_transcription` returns an object with `.text` and `.segments` or a compatible dict/list. Future updates to the `mlx-audio` package may require further adjustments.
