# Codex Audit: Xiaoyuzhou Shownotes vs MLX Audio

## Summary

Gemini successfully improved Xiaoyuzhou metadata capture for episode:

```text
https://www.xiaoyuzhoufm.com/episode/69a64629de29766da93331ec
```

However, the current "shownotes-as-transcript" path is not a real audio transcription path. It should be treated as chapter/notes metadata, not as a transcript asset equivalent to ASR output.

The next stage must implement real audio download and MLX-based transcription using:

```text
mlx-community/whisper-large-v3-turbo-asr-fp16
```

## Current Code Findings

### Xiaoyuzhou shownotes are being treated as transcript segments

Evidence:

- `packages/source-adapters/src/xiaoyuzhouAdapter.ts`
- `packages/application/src/index.ts`

Current behavior:

- Adapter parses Xiaoyuzhou metadata.
- Adapter extracts timestamp-looking lines from `episode.shownotes`.
- Application prioritizes `source.metadata.initialSegments`.
- Application writes these segments as transcript/document assets with `sourceType: platform_caption`.

Problem:

Shownotes are not full transcript content. They are closer to chapters, outline, notes, or episode description. Treating shownotes as `platform_caption` inflates readiness and hides the missing ASR step.

### MLX audio command is not installed in current PATH

Checked:

```bash
which mlx_audio.stt || true
which mlx_audio.transcribe || true
which mlx-audio || true
```

Observed:

```text
mlx_audio.stt not found
mlx_audio.transcribe not found
mlx-audio not found
```

So Gemini must install or otherwise provision `mlx-audio` before claiming MLX transcription works.

## External Reference

The `Blaizzy/mlx-audio` README documents installation with:

```bash
pip install mlx-audio
```

and an OpenAI-compatible STT API endpoint:

```bash
curl -X POST http://localhost:8000/v1/audio/transcriptions \
  -F "file=@audio.wav" \
  -F "model=mlx-community/whisper-large-v3-turbo-asr-fp16"
```

The Hugging Face model card for `mlx-community/whisper-large-v3-turbo-asr-fp16` documents CLI usage with:

```bash
python -m mlx_audio.stt.generate --model mlx-community/whisper-large-v3-turbo-asr-fp16 --audio "audio.wav"
```

Gemini must verify the actual installed command shape in this repository environment and document it in the report.

## Decision

Do not accept Xiaoyuzhou transcript readiness as complete until audio is downloaded and transcribed by a real ASR path. Shownotes may remain useful, but they must be modeled separately from transcript assets.

## Gemini Follow-up

Gemini must implement:

```text
docs/plans/2026-04-27-xiaoyuzhou-mlx-audio-transcription-and-card-actions.md
```

Gemini must report to:

```text
docs/plans/reports/2026-04-27-xiaoyuzhou-mlx-audio-transcription-and-card-actions-report.md
```
