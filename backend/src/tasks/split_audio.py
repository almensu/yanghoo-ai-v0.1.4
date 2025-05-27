#!/usr/bin/env python3
import subprocess
import argparse
from pathlib import Path
import json
import sys

def split_audio_ffmpeg(input_audio_path: Path, output_chunk_dir: Path, segment_time_seconds: int = 600):
    """
    Splits an audio file into segments音乐 using ffmpeg.

    Args:
        input_audio_path (Path): Path to the input audio file.
        output_chunk_dir (Path): Directory to save the audio chunks.
        segment_time_seconds (int): Duration of each segment in seconds.

    Returns:
        list: A list of paths to the generated audio chunks, or None if failed.
    """
    if not input_audio_path.exists():
        print(json.dumps({"status": "error", "message": f"Input audio file not found: {input_audio_path}"}), file=sys.stderr)
        return None

    output_chunk_dir.mkdir(parents=True, exist_ok=True)
    
    output_pattern = output_chunk_dir / "output_chunk_%03d.wav"

    command = [
        "ffmpeg",
        "-i", str(input_audio_path),
        "-f", "segment",
        "-segment_time", str(segment_time_seconds),
        "-c", "copy",
        str(output_pattern)
    ]

    print(json.dumps({"status": "splitting", "message": f"Executing: {' '.join(command)}"}), flush=True)

    try:
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        stdout, stderr = process.communicate(timeout=3600) # Timeout after 1 hour for safety

        if process.returncode == 0:
            generated_chunks = sorted(list(output_chunk_dir.glob("output_chunk_*.wav")))
            print(json.dumps({"status": "completed", "chunk_count": len(generated_chunks), "output_directory": str(output_chunk_dir)}), flush=True)
            return generated_chunks
        else:
            print(json.dumps({"status": "error", "message": "ffmpeg command failed.", "ffmpeg_stderr": stderr}), file=sys.stderr)
            return None
    except subprocess.TimeoutExpired:
        print(json.dumps({"status": "error", "message": "ffmpeg command timed out."}), file=sys.stderr)
        process.kill()
        stdout, stderr = process.communicate()
        return None
    except Exception as e:
        print(json.dumps({"status": "error", "message": f"An error occurred during ffmpeg execution: {e}"}), file=sys.stderr)
        return None

def main():
    parser = argparse.ArgumentParser(description="Split a WAV audio file into 10-minute (600s) chunks.")
    parser.add_argument("--input_wav", required=True, help="Path to the input WAV file.")
    parser.add_argument("--output_dir", required=True, help="Directory to save the output WAV chunks.")
    parser.add_argument("--segment_duration", type=int, default=600, help="Duration of each segment in seconds (default: 600 for 10 minutes).")
    
    args = parser.parse_args()

    input_file = Path(args.input_wav)
    output_directory = Path(args.output_dir)

    print(f"Starting audio splitting for: {input_file}")
    print(f"Output directory for chunks: {output_directory}")
    
    chunk_paths = split_audio_ffmpeg(input_file, output_directory, args.segment_duration)

    if chunk_paths:
        print(f"Audio splitting successful. {len(chunk_paths)} chunks created in {output_directory}")
        # Output chunk paths as JSON for potential programmatic use
        # print(json.dumps({"status": "success", "chunks": [str(p) for p in chunk_paths]}))
    else:
        print("Audio splitting failed.")
        # print(json.dumps({"status": "failure"}))
        sys.exit(1)

if __name__ == "__main__":
    main() 