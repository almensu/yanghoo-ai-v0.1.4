#!/usr/bin/env python3
import os
import sys
import json
import argparse
import time
from pathlib import Path
import torch
import whisperx
import numpy as np

def main():
    # Parse command line arguments
    parser = argparse.ArgumentParser(description='Transcribe audio using WhisperX')
    parser.add_argument('--uuid', required=True, help='Content UUID from metadata.json')
    parser.add_argument('--model', default='large-v3', choices=['tiny.en', 'small.en', 'medium.en', 'large-v3'], help='WhisperX model to use')
    args = parser.parse_args()
    
    # Define paths relative to the script location
    script_path = Path(__file__).resolve()
    tasks_dir = script_path.parent
    src_dir = tasks_dir.parent
    backend_dir = src_dir.parent
    data_dir = backend_dir / 'data'  # This is our DATA_DIR base
    metadata_path = data_dir / 'metadata.json'
    # storage_root = backend_dir / 'storage' / 'content-studio' # Legacy, might not be needed

    # Load metadata
    try:
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
    except FileNotFoundError:
        print(json.dumps({"status": "error", "message": f"Metadata file not found at {metadata_path}"}), file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError:
        print(json.dumps({"status": "error", "message": f"Error decoding JSON from {metadata_path}"}), file=sys.stderr)
        sys.exit(1)

    if args.uuid not in metadata:
        print(json.dumps({"status": "error", "message": f"UUID {args.uuid} not found in metadata"}), file=sys.stderr)
        sys.exit(1)
    
    content_metadata = metadata[args.uuid]
    
    # Determine absolute audio path based on relative path in metadata (now relative to data_dir)
    audio_rel_path_str = content_metadata.get('downloaded_audio_path') or content_metadata.get('extracted_wav_path')
    
    if not audio_rel_path_str:
        print(json.dumps({"status": "error", "message": f"No downloaded_audio_path or extracted_wav_path found in metadata for {args.uuid}"}), file=sys.stderr)
        sys.exit(1)

    # Construct absolute path using data_dir as base
    audio_abs_path = (data_dir / audio_rel_path_str).resolve()

    # Define output directory relative to data_dir
    transcripts_dir = data_dir / args.uuid / 'transcripts' / 'whisperx'
    
    # Make sure transcripts directory exists
    transcripts_dir.mkdir(parents=True, exist_ok=True)
    
    # Check if audio file exists using absolute path
    if not audio_abs_path.exists():
        print(json.dumps({"status": "error", "message": f"Audio file not found at {audio_abs_path}"}), file=sys.stderr)
        sys.exit(1)
    
    # Print progress
    print(json.dumps({"status": "started", "percent": 0}), flush=True)
    
    try:
        # Determine device
        device = "cuda" if torch.cuda.is_available() else "cpu"
        print(json.dumps({"status": "loading_model", "percent": 5, "device": device}), flush=True)
        
        # Load model based on selected option
        model_name = args.model
        compute_type = "float16" if device == "cuda" else "int8"
        
        # Display selected model info
        print(json.dumps({
            "status": "loading_model", 
            "percent": 10, 
            "model": model_name, 
            "compute_type": compute_type
        }), flush=True)
        
        # Load ASR model
        model = whisperx.load_model(model_name, device, compute_type=compute_type)
        
        # Transcribe audio using absolute path
        print(json.dumps({"status": "transcribing", "percent": 20}), flush=True)
        audio = whisperx.load_audio(str(audio_abs_path))
        
        # Run initial transcription
        result = model.transcribe(audio, batch_size=16)
        # transcription = result["segments"] # This variable is not used later
        
        # Report progress
        print(json.dumps({"status": "aligning", "percent": 50}), flush=True)
        
        # Load alignment model
        # Check if language code exists, handle if not (e.g., default to 'en')
        language_code = result.get("language")
        if not language_code:
             print(json.dumps({"status": "warning", "message": "Language not detected by Whisper, defaulting to 'en' for alignment model."}), file=sys.stderr)
             language_code = 'en' # Or handle error appropriately

        model_a, metadata_align = whisperx.load_align_model(language_code=language_code, device=device)
        
        # Align whisper output with audio
        result = whisperx.align(
            result["segments"],
            model_a,
            metadata_align,
            audio,
            device,
            return_char_alignments=True  # Return character-level alignments
        )
        
        # Extract word timestamps
        print(json.dumps({"status": "extracting_word_timestamps", "percent": 80}), flush=True)
        
        # Count total words
        word_count = 0
        for segment in result["segments"]:
            word_count += len(segment.get("words", []))
        
        # Prepare output file path
        output_path = transcripts_dir / 'transcribe_WhisperX.json'
        
        # Augment result with model info
        final_result = {
            "model_info": {
                "model_name": model_name,
                "device": device,
                "compute_type": compute_type,
                "language": result.get("language", language_code), # Use detected or default lang
                "process_time": time.time() # Consider calculating actual duration
            },
            "text": " ".join([segment["text"].strip() for segment in result["segments"]]), # Add strip()
            "segments": result["segments"],
            "word_count": word_count,
            "segment_count": len(result["segments"])
        }
        
        # Write output to file
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(final_result, f, indent=2, ensure_ascii=False)

        # Calculate the correct relative path from data_dir
        relative_output_path = output_path.relative_to(data_dir)

        # Print completion status and the RELATIVE path to stdout
        print(json.dumps({
            "status": "completed",
            "percent": 100,
            "relative_path": str(relative_output_path) # Use the correct relative path
        }), flush=True)

    except Exception as e:
        # Add more specific error reporting if possible
        import traceback
        print(json.dumps({
            "status": "error",
            "message": str(e),
            "traceback": traceback.format_exc()
        }), file=sys.stderr)
        sys.exit(1)

if __name__ == '__main__':
    main() 