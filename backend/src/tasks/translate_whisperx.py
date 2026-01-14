"""
WhisperX Translation Task - Generate Chinese Subtitles

Translates audio content from source language to Chinese using WhisperX.
Generates VTT format output with Chinese text and original timestamps.

Author: YangHoo AI
Date: 2026-01-14
"""

import os
import sys
import json
import argparse
import logging
from pathlib import Path
import torch
import whisperx
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def format_timestamp(seconds: float) -> str:
    """Format seconds to VTT timestamp format HH:MM:SS.mmm"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    millis = int((seconds % 1) * 1000)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}.{millis:03d}"


def segments_to_vtt(segments: list, output_path: str) -> int:
    """
    Convert WhisperX segments to VTT format.

    Args:
        segments: List of segment dictionaries with 'start', 'end', 'text' keys
        output_path: Path to output VTT file

    Returns:
        Number of segments written
    """
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("WEBVTT\n\n")

        for i, segment in enumerate(segments):
            start_time = format_timestamp(segment['start'])
            end_time = format_timestamp(segment['end'])
            text = segment['text'].strip()

            if text:  # Only write non-empty segments
                f.write(f"{start_time} --> {end_time}\n")
                f.write(f"{text}\n\n")

    return len(segments)


def translate_audio(
    audio_path: str,
    output_vtt_path: str,
    target_language: str = "zh",
    model_name: str = "large-v3",
    device: str = "cuda"
) -> dict:
    """
    Translate audio to target language using WhisperX.

    Args:
        audio_path: Path to input audio file
        output_vtt_path: Path to output VTT file
        target_language: Target language code (default: "zh" for Chinese)
        model_name: WhisperX model to use
        device: Device to use ("cuda" or "cpu")

    Returns:
        Dictionary with translation results
    """
    logger.info(f"Starting translation: {audio_path} -> {output_vtt_path}")
    logger.info(f"Target language: {target_language}")
    logger.info(f"Model: {model_name}")
    logger.info(f"Device: {device}")

    # Check if audio file exists
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    # Check device availability
    if device == "cuda" and not torch.cuda.is_available():
        logger.warning("CUDA not available, falling back to CPU")
        device = "cpu"

    # Load WhisperX model with float32 for CPU compatibility
    logger.info(f"Loading WhisperX model {model_name}...")
    model = whisperx.load_model(
        model_name,
        device=device,
        compute_type="float32" if device == "cpu" else "float16"
    )

    # Transcribe and translate in one step
    logger.info("Transcribing and translating audio...")
    audio = whisperx.load_audio(audio_path)

    # Use transcribe with translate task
    result = model.transcribe(
        audio,
        language=None,  # Auto-detect source language
        task="translate",  # Translation task
        language_target=target_language  # Target language for translation
    )

    # Align with original audio (optional, improves timestamp accuracy)
    logger.info("Aligning timestamps...")
    model_a, metadata = whisperx.load_align_model(
        language_code=target_language,
        device=device
    )
    result = whisperx.align(
        result["segments"],
        model_a,
        metadata,
        audio,
        device,
    )

    # Filter out empty segments
    segments = [s for s in result["segments"] if s["text"].strip()]

    # Convert to VTT
    logger.info(f"Writing {len(segments)} segments to VTT...")
    segment_count = segments_to_vtt(segments, output_vtt_path)

    logger.info(f"Translation complete: {output_vtt_path}")

    return {
        "success": True,
        "segments_count": segment_count,
        "source_language": result.get("language", "unknown"),
        "target_language": target_language,
        "output_file": output_vtt_path
    }


def main():
    """Command-line interface for WhisperX translation."""
    parser = argparse.ArgumentParser(
        description='Translate audio to Chinese using WhisperX',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Translate from metadata UUID
  python translate_whisperx.py --uuid 9a276afd-4624-427d-b62c-8d6424c1c6e8

  # Translate specific audio file
  python translate_whisperx.py --audio path/to/audio.wav --output zh.vtt

  # Use different model
  python translate_whisperx.py --uuid UUID --model medium.en
        """
    )

    parser.add_argument('--uuid', help='Task UUID from metadata.json')
    parser.add_argument('--audio', help='Direct path to audio file')
    parser.add_argument('--output', help='Output VTT path (required with --audio)')
    parser.add_argument('--language', default='zh', help='Target language (default: zh for Chinese)')
    parser.add_argument('--model', default='large-v3',
                       choices=['tiny', 'tiny.en', 'base', 'base.en', 'small', 'small.en',
                               'medium', 'medium.en', 'large-v2', 'large-v3'],
                       help='WhisperX model (default: large-v3)')
    parser.add_argument('--device', default='cuda', choices=['cuda', 'cpu'],
                       help='Device to use (default: cuda)')

    args = parser.parse_args()

    # Validate arguments
    if not args.uuid and not args.audio:
        parser.error("Either --uuid or --audio must be provided")

    if args.audio and not args.output:
        parser.error("--output is required when using --audio")

    try:
        if args.uuid:
            # Use metadata to find audio file
            script_path = Path(__file__).resolve()
            tasks_dir = script_path.parent
            src_dir = tasks_dir.parent
            backend_dir = src_dir.parent
            data_dir = backend_dir / 'data'
            metadata_path = data_dir / 'metadata.json'

            # Load metadata
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)

            if args.uuid not in metadata:
                print(f"Error: UUID {args.uuid} not found in metadata", file=sys.stderr)
                sys.exit(1)

            task_metadata = metadata[args.uuid]
            task_dir = data_dir / args.uuid

            # Find audio file
            audio_path = None
            for key in ['extracted_wav_path', 'downloaded_audio_path', 'media_files']:
                if key in task_metadata and task_metadata[key]:
                    if key == 'media_files':
                        # Get first available quality
                        for quality, path in task_metadata[key].items():
                            if path:
                                audio_path = data_dir / path
                                break
                    else:
                        audio_path = data_dir / task_metadata[key]
                    break

            if not audio_path or not audio_path.exists():
                # Try to find any audio/video file in task directory
                audio_files = list(task_dir.glob("*.wav")) + list(task_dir.glob("*.mp3")) + list(task_dir.glob("*.mp4"))
                if audio_files:
                    audio_path = audio_files[0]
                else:
                    print(f"Error: No audio file found for task {args.uuid}", file=sys.stderr)
                    sys.exit(1)

            output_vtt = str(task_dir / f"transcript_{args.language}.vtt")

        else:
            # Direct audio file
            audio_path = Path(args.audio)
            output_vtt = args.output

        # Perform translation
        result = translate_audio(
            audio_path=str(audio_path),
            output_vtt_path=output_vtt,
            target_language=args.language,
            model_name=args.model,
            device=args.device
        )

        # Update metadata if using UUID
        if args.uuid:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)

            if args.uuid in metadata:
                # Add to vtt_files
                if "vtt_files" not in metadata[args.uuid]:
                    metadata[args.uuid]["vtt_files"] = {}

                # Store relative path
                relative_path = f"{args.uuid}/transcript_{args.language}.vtt"
                metadata[args.uuid]["vtt_files"][args.language] = relative_path

                # Update last_modified
                from datetime import datetime
                metadata[args.uuid]["last_modified"] = datetime.now().isoformat()

                # Write back
                with open(metadata_path, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, indent=4, ensure_ascii=False, default=str)

            print(f"✓ Metadata updated: {relative_path}")

        # Print results
        print(f"✓ Translation complete!")
        print(f"  Segments: {result['segments_count']}")
        print(f"  Source language: {result['source_language']}")
        print(f"  Target language: {result['target_language']}")
        print(f"  Output: {result['output_file']}")

        sys.exit(0)

    except FileNotFoundError as e:
        print(f"✗ Error: {e}", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"✗ Unexpected error: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
