#!/usr/bin/env python3
import subprocess
import json
from pathlib import Path
import sys
import shutil # For removing temporary chunk directory
import argparse

# Assuming merge_jsons.py is in the 'tasks' subdirectory relative to 'src'
from tasks.merge_jsons import merge_transcription_chunks

def run_command(command_parts, step_name="Command", timeout_seconds=7200):
    """Helper to run a subprocess command and handle its output."""
    print(f"Orchestrator: Running {step_name} -> CMD: '{' '.join(command_parts)}'", flush=True)
    try:
        process = subprocess.Popen(command_parts, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, encoding='utf-8')
        stdout, stderr = process.communicate(timeout=timeout_seconds) 

        # Print stdout line by line to see progress JSON messages from sub-scripts
        if stdout:
            print(f"Orchestrator ({step_name} STDOUT):\n{stdout.strip()}", flush=True)
        
        if process.returncode != 0:
            print(f"Orchestrator: Error during {step_name}. Return code: {process.returncode}", file=sys.stderr, flush=True)
            if stderr:
                print(f"Orchestrator ({step_name} STDERR):\n{stderr.strip()}", file=sys.stderr, flush=True)
            return False, None # Indicate failure and no specific result
        
        # Try to parse the last non-empty line of stdout as JSON for status/paths
        last_json_line_data = None
        if stdout:
            lines = stdout.strip().splitlines()
            for line in reversed(lines):
                if line.strip(): # Ensure line is not empty or just whitespace
                    try:
                        last_json_line_data = json.loads(line.strip())
                        # print(f"Orchestrator: Parsed last JSON from {step_name}: {last_json_line_data}", flush=True)
                        break 
                    except json.JSONDecodeError:
                        # print(f"Orchestrator: Line from {step_name} was not JSON: {line.strip()}", flush=True)
                        continue # Not a json line
        return True, last_json_line_data # Indicate success and the parsed last JSON line

    except subprocess.TimeoutExpired:
        print(f"Orchestrator: {step_name} timed out after {timeout_seconds} seconds.", file=sys.stderr, flush=True)
        if process and process.poll() is None: # Check if process still running
             process.kill()
             process.communicate() # Clean up
        return False, None
    except Exception as e:
        print(f"Orchestrator: Exception during {step_name}: {e}", file=sys.stderr, flush=True)
        return False, None


def main_orchestration(long_audio_file_path_str: str, uuid: str, data_root_str: str, 
                       scripts_dir_str: str, model_name: str = "medium.en", segment_duration_sec: int = 600,
                       cleanup_chunks: bool = True):
    
    long_audio_file = Path(long_audio_file_path_str)
    data_root = Path(data_root_str)
    # scripts_dir is the directory containing split_audio.py, transcribe_whisperx.py
    # For orchestrator.py itself, it might be called from backend/src, so scripts_dir would be ./tasks
    # If orchestrator.py is IN tasks/, then scripts_dir is just its own directory.
    # Let's assume scripts_dir_str is the path to the 'tasks' directory.
    scripts_dir = Path(scripts_dir_str)

    print(f"Orchestrator: Initiating process for UUID: {uuid}", flush=True)
    print(f"Orchestrator: Long audio file: {long_audio_file}", flush=True)
    print(f"Orchestrator: Data root: {data_root}", flush=True)
    print(f"Orchestrator: Scripts directory: {scripts_dir}", flush=True)

    # Define paths
    base_uuid_dir = data_root / uuid
    cache_dir = base_uuid_dir / ".cache" # Cache for chunk JSONs and potentially audio chunks
    audio_chunks_output_dir = cache_dir / "audio_chunks" # Subdir for audio chunks themselves
    final_transcription_output_dir = base_uuid_dir / "transcripts" / "whisperx"
    final_merged_json_path = final_transcription_output_dir / f"{uuid}_merged_transcription.json"

    # Ensure base directories exist
    base_uuid_dir.mkdir(parents=True, exist_ok=True)
    cache_dir.mkdir(parents=True, exist_ok=True) # For chunk JSONs
    audio_chunks_output_dir.mkdir(parents=True, exist_ok=True) # For audio chunks
    final_transcription_output_dir.mkdir(parents=True, exist_ok=True)

    # --- Step 1: Split Audio --- #
    print(f"Orchestrator: --- Starting Step 1: Splitting Audio for {long_audio_file.name} ---", flush=True)
    split_script_path = scripts_dir / "split_audio.py"
    split_command = [
        sys.executable, str(split_script_path),
        "--input_wav", str(long_audio_file),
        "--output_dir", str(audio_chunks_output_dir),
        "--segment_duration", str(segment_duration_sec)
    ]
    success, split_result_json = run_command(split_command, "Audio Splitting", timeout_seconds=3600) # 1hr timeout for splitting
    if not success:
        print("Orchestrator: Audio splitting failed. Aborting.", file=sys.stderr, flush=True)
        return {"status": "error", "stage": "split_audio", "message": "Audio splitting script failed."}
    
    # Verify chunks were created (split_audio.py also prints count, but good to check file system)
    audio_chunk_files = sorted(list(audio_chunks_output_dir.glob("output_chunk_*.wav")))
    if not audio_chunk_files:
        print(f"Orchestrator: No audio chunks found in {audio_chunks_output_dir} after splitting step reported success.", file=sys.stderr, flush=True)
        return {"status": "error", "stage": "split_audio", "message": "Audio splitting script reported success but no chunks found."}
    print(f"Orchestrator: Audio splitting completed. Found {len(audio_chunk_files)} chunks.", flush=True)

    # --- Step 2: Transcribe Audio Chunks --- #
    print(f"Orchestrator: --- Starting Step 2: Transcribing {len(audio_chunk_files)} Audio Chunks ---", flush=True)
    transcribe_script_path = scripts_dir / "transcribe_whisperx.py"
    all_chunk_transcriptions_successful = True
    
    for i, audio_chunk_path in enumerate(audio_chunk_files):
        # Chunk JSONs will be stored directly in the .cache directory, not in audio_chunks subdir
        chunk_json_filename = f"chunk_{i:03d}_transcription.json" 
        chunk_output_json_path = cache_dir / chunk_json_filename 
        
        print(f"Orchestrator: Transcribing chunk {i+1}/{len(audio_chunk_files)}: {audio_chunk_path.name} -> {chunk_output_json_path}", flush=True)
        transcribe_command = [
            sys.executable, str(transcribe_script_path),
            "--input_audio", str(audio_chunk_path),
            "--output_json", str(chunk_output_json_path),
            "--model", model_name,
            "--uuid", f"{uuid}_chunk_{i:03d}" # Pass a modified UUID for context in model_info
        ]
        # Timeout for transcription can be longer per chunk, e.g., 1 hour for a 10-min chunk
        success, _ = run_command(transcribe_command, f"Transcription Chunk {i+1}", timeout_seconds=3600) 
        if not success:
            print(f"Orchestrator: Transcription failed for chunk {audio_chunk_path.name}. Recording failure.", file=sys.stderr, flush=True)
            all_chunk_transcriptions_successful = False
            # Decide if you want to stop on first failure or try all chunks
            # For now, let's try all chunks and report overall failure if any fails.
            # break # Uncomment to stop on first failure
    
    if not all_chunk_transcriptions_successful:
        print("Orchestrator: One or more chunk transcriptions failed. Aborting before merge.", file=sys.stderr, flush=True)
        return {"status": "error", "stage": "transcribe_chunks", "message": "One or more chunk transcriptions failed."}
    
    print("Orchestrator: All chunks transcription process completed (or attempted).", flush=True)

    # --- Step 3: Merge Transcriptions --- #
    print("Orchestrator: --- Starting Step 3: Merging Transcriptions ---", flush=True)
    # Chunks JSONs are in `cache_dir` (which is `transcribed_chunks_json_dir` logic)
    merge_success = merge_transcription_chunks(
        str(cache_dir), 
        str(final_merged_json_path),
        segment_duration_sec
    )
    if not merge_success:
        print("Orchestrator: Merging transcriptions failed. Aborting.", file=sys.stderr, flush=True)
        return {"status": "error", "stage": "merge_transcriptions", "message": "Merging transcriptions script failed."}
    
    print(f"Orchestrator: Merging completed. Final output at: {final_merged_json_path}", flush=True)

    # --- Step 4: Cleanup (Optional) --- #
    if cleanup_chunks:
        print("Orchestrator: --- Starting Step 4: Cleaning up temporary chunk files ---", flush=True)
        try:
            if audio_chunks_output_dir.exists():
                shutil.rmtree(audio_chunks_output_dir)
                print(f"Orchestrator: Removed audio chunk directory: {audio_chunks_output_dir}", flush=True)
            
            # Also remove individual chunk JSONs from the .cache directory
            cleaned_jsons = 0
            for chunk_json_file in cache_dir.glob('chunk_*_transcription.json'):
                chunk_json_file.unlink()
                cleaned_jsons += 1
            print(f"Orchestrator: Removed {cleaned_jsons} individual chunk JSONs from: {cache_dir}", flush=True)

        except Exception as e:
            print(f"Orchestrator: Error during cleanup: {e}", file=sys.stderr, flush=True)
            # Don't let cleanup failure fail the whole process if main parts succeeded

    print("Orchestrator: --- Orchestration Completed Successfully! ---", flush=True)
    return {"status": "success", "output_file": str(final_merged_json_path), "uuid": uuid}


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Orchestrate audio splitting, transcription, and merging.")
    parser.add_argument("--long_audio", required=True, help="Path to the long input WAV audio file.")
    parser.add_argument("--uuid", required=True, help="UUID for this processing task.")
    parser.add_argument("--data_root", required=True, help="Path to the 'backend/data' directory.")
    # scripts_dir should point to the 'tasks' directory where split_audio.py etc. are located
    parser.add_argument("--scripts_dir", required=True, help="Path to the directory containing helper scripts (e.g., backend/src/tasks).")
    parser.add_argument("--model", default="medium.en", help="WhisperX model to use for transcription.")
    parser.add_argument("--segment_duration", type=int, default=600, help="Segment duration in seconds for splitting (default: 600s = 10 minutes).")
    parser.add_argument("--no_cleanup", action="store_true", help="If set, temporary audio and JSON chunks will not be deleted.")

    args = parser.parse_args()

    print(f"Orchestrator CLI: Starting with UUID: {args.uuid}", flush=True)
    result = main_orchestration(
        long_audio_file_path_str=args.long_audio,
        uuid=args.uuid,
        data_root_str=args.data_root,
        scripts_dir_str=args.scripts_dir,
        model_name=args.model,
        segment_duration_sec=args.segment_duration,
        cleanup_chunks=not args.no_cleanup
    )
    
    print("Orchestrator CLI Result (JSON):", flush=True)
    # Print result as a single JSON line for easier parsing if this script is wrapped
    print(json.dumps(result), flush=True)

    if result.get("status") != "success":
        sys.exit(1) 