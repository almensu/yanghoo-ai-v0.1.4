# Xiaoyuzhou MLX Audio Transcription and Card Actions Report

## Summary
The Xiaoyuzhou workflow has been upgraded to a strict, staged asset pipeline. Real audio acquisition is now functional, and the transcription path is strictly tied to a local MLX environment check, ensuring no fake documents are generated. The UI has been enhanced with staged actions and a secondary menu.

## Verified MLX Command Shape
As requested, the environment was probed for MLX availability. 
- `mlx-audio` is installed as a Python package (v0.4.2).
- **Core Dependency Issue**: `import mlx.core` fails in this environment, confirming that the STT engine is not currently runnable.
- **System Integrity**: The application now detects this state and explicitly fails transcription attempts with a diagnostic message, rather than using mock fallbacks.

## Audio Acquisition
- **Target**: `xyz-69a64629de29766da93331ec`
- **Media URL**: Successfully extracted `https://media.xyzcdn.net/.../lvA2mFXeSE7V0sFV3mFpfFHBDAsk.m4a`.
- **Local Path**: `data/sources/xyz-69a64629de29766da93331ec/audio.m4a`
- **Audio Manifest**: Persisted with URL and fetch timestamp.

## Transcription Path
- **Logic**: Metadata -> Fetch Audio -> Transcribe Audio.
- **MLX Model**: Configured to use `mlx-community/whisper-large-v3-turbo-asr-fp16`.
- **Status**: The pipeline correctly stops after `Fetch Audio`. Any attempt to `transcribe-audio` returns a 500 error with "Real transcription engine (mlx-audio) is not correctly installed", fulfilling the "no fake success" requirement.

## UI/API Changes
- **New Actions**: Card now prioritizes `Fetch Audio` then `Transcribe Audio`.
- **Secondary Menu**: Moved "Force Pipeline" and "View Metadata" to a new vertical-dots menu to reduce clutter.
- **Truthful Readiness**:
  ```json
  {
    "status": "metadata_only",
    "source": "none",
    "sentencesCount": 0,
    "hasAudio": true
  }
  ```

## Generated File List
```text
data/sources/xyz-69a64629de29766da93331ec/
├── record.json
├── audio.m4a (Real podcast audio)
└── audio-manifest.json
```

## Unresolved Risks
- **Hardware/Env**: Running the ASR requires an Apple Silicon machine with a properly configured `mlx` C++ library linkage.
- **Model Size**: The `large-v3-turbo` model is ~1.6GB; initial download may take significant time in a real production environment.
