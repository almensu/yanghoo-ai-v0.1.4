#!/usr/bin/env python3
import os
import sys
import json
import argparse
import time
import subprocess
from pathlib import Path
import shutil
import logging
from typing import List, Dict, Any, Optional

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "backend.log"))
    ]
)
logger = logging.getLogger("split_transcribe_whisperx")

def update_metadata(metadata_path: Path, uuid: str, update_data: Dict[str, Any]) -> bool:
    """Update the metadata file with new information."""
    try:
        with open(metadata_path, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
        
        if uuid not in metadata:
            logger.error(f"UUID {uuid} not found in metadata")
            return False
            
        metadata[uuid].update(update_data)
        
        with open(metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
            
        return True
    except Exception as e:
        logger.error(f"Error updating metadata: {e}")
        return False

def split_audio(input_path: Path, output_dir: Path, segment_duration: int = 600) -> Optional[List[Path]]:
    """Split audio file into segments of the specified duration."""
    try:
        logger.info(f"Splitting audio file: {input_path}")
        logger.info(f"Output directory: {output_dir}")
        
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # Prepare the ffmpeg command
        output_pattern = output_dir / "chunk_%03d.wav"
        command = [
            "ffmpeg",
            "-i", str(input_path),
            "-f", "segment",
            "-segment_time", str(segment_duration),
            "-c", "copy",
            str(output_pattern)
        ]
        
        logger.info(f"Running command: {' '.join(command)}")
        
        # Execute the command
        process = subprocess.Popen(
            command, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            text=True
        )
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            logger.error(f"Error splitting audio: {stderr}")
            return None
            
        # Get the list of created chunks
        chunks = sorted(list(output_dir.glob("chunk_*.wav")))
        logger.info(f"Created {len(chunks)} audio chunks")
        
        return chunks
    except Exception as e:
        logger.error(f"Error in split_audio: {e}")
        return None

def transcribe_chunk(chunk_path: Path, output_dir: Path, model: str) -> Optional[Path]:
    """Transcribe an audio chunk using WhisperX."""
    try:
        logger.info(f"Transcribing chunk: {chunk_path}")
        
        # Create output filename based on input chunk name
        chunk_name = chunk_path.stem
        output_file = output_dir / f"{chunk_name}.json"
        
        # Prepare the WhisperX command
        script_path = Path(__file__).parent / "transcribe_whisperx_chunk.py"
        
        command = [
            "python", str(script_path),
            "--input", str(chunk_path),
            "--output", str(output_file),
            "--model", model
        ]
        
        logger.info(f"Running command: {' '.join(command)}")
        
        # Execute the command
        process = subprocess.Popen(
            command, 
            stdout=subprocess.PIPE, 
            stderr=subprocess.PIPE, 
            text=True
        )
        stdout, stderr = process.communicate()
        
        if process.returncode != 0:
            logger.error(f"Error transcribing chunk: {stderr}")
            return None
            
        if not output_file.exists():
            logger.error(f"Output file not created: {output_file}")
            return None
            
        logger.info(f"Transcription successful: {output_file}")
        return output_file
    except Exception as e:
        logger.error(f"Error in transcribe_chunk: {e}")
        return None

def merge_transcripts(transcript_files: List[Path], output_file: Path) -> bool:
    """Merge multiple transcript JSON files into a single JSON file."""
    try:
        logger.info(f"Merging {len(transcript_files)} transcript files")
        
        if not transcript_files:
            logger.error("No transcript files to merge")
            return False
            
        # Load all transcripts
        all_segments = []
        model_info = None
        total_duration = 0
        
        for i, file_path in enumerate(transcript_files):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    
                # Save model info from first file
                if i == 0:
                    model_info = data.get("model_info", {})
                
                # Get segments and adjust timestamps based on chunk position
                segments = data.get("segments", [])
                
                # Skip empty segments
                if not segments:
                    continue
                    
                # Calculate time offset for this chunk
                chunk_offset = total_duration
                
                # Update segment timestamps
                for segment in segments:
                    segment["start"] = segment.get("start", 0) + chunk_offset
                    segment["end"] = segment.get("end", 0) + chunk_offset
                    
                    # Update word timestamps if they exist
                    if "words" in segment:
                        for word in segment["words"]:
                            word["start"] = word.get("start", 0) + chunk_offset
                            word["end"] = word.get("end", 0) + chunk_offset
                
                # Add adjusted segments to our list
                all_segments.extend(segments)
                
                # Update total duration for next chunk's offset
                # Use the end time of the last segment as the duration
                if segments:
                    chunk_duration = segments[-1].get("end", 0)
                    total_duration += chunk_duration
                    
            except Exception as e:
                logger.error(f"Error processing transcript file {file_path}: {e}")
                continue
        
        if not all_segments:
            logger.error("No valid segments found in any transcript file")
            return False
            
        # Create merged transcript
        merged_transcript = {
            "model_info": model_info or {},
            "text": " ".join([segment.get("text", "").strip() for segment in all_segments]),
            "segments": all_segments,
            "word_count": sum(len(segment.get("words", [])) for segment in all_segments),
            "segment_count": len(all_segments),
            "merged_from_chunks": True,
            "total_duration": total_duration
        }
        
        # Write merged transcript to file
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(merged_transcript, f, indent=2, ensure_ascii=False)
            
        logger.info(f"Merged transcript written to: {output_file}")
        return True
    except Exception as e:
        logger.error(f"Error in merge_transcripts: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="Split audio into chunks, transcribe with WhisperX, and merge results")
    parser.add_argument("--uuid", required=True, help="UUID of the content to process")
    parser.add_argument("--model", default="large-v3", help="WhisperX model to use")
    parser.add_argument("--segment_duration", type=int, default=600, help="Duration of each segment in seconds (default: 600 for 10 minutes)")
    args = parser.parse_args()
    
    try:
        # Get paths
        script_dir = Path(__file__).resolve().parent
        backend_dir = script_dir.parent.parent
        data_dir = backend_dir / "data"
        metadata_path = data_dir / "metadata.json"
        
        # Check metadata file
        if not metadata_path.exists():
            logger.error(f"Metadata file not found: {metadata_path}")
            sys.exit(1)
            
        # Load metadata
        try:
            with open(metadata_path, 'r', encoding='utf-8') as f:
                metadata = json.load(f)
        except json.JSONDecodeError:
            logger.error(f"Error decoding metadata JSON from {metadata_path}")
            sys.exit(1)
            
        # Check if UUID exists in metadata
        if args.uuid not in metadata:
            logger.error(f"UUID {args.uuid} not found in metadata")
            sys.exit(1)
            
        content_metadata = metadata[args.uuid]
        
        # Update status in metadata
        update_metadata(metadata_path, args.uuid, {
            "transcription_status": "processing",
            "transcription_model": args.model
        })
        
        # Get audio path
        audio_rel_path = content_metadata.get('downloaded_audio_path') or content_metadata.get('extracted_wav_path')
        if not audio_rel_path:
            logger.error(f"No audio path found in metadata for {args.uuid}")
            update_metadata(metadata_path, args.uuid, {"transcription_status": "error", "transcription_error": "No audio path found"})
            sys.exit(1)
            
        audio_path = data_dir / audio_rel_path
        if not audio_path.exists():
            logger.error(f"Audio file not found: {audio_path}")
            update_metadata(metadata_path, args.uuid, {"transcription_status": "error", "transcription_error": "Audio file not found"})
            sys.exit(1)
            
        # Define cache directories
        cache_dir = data_dir / args.uuid / ".cache"
        chunks_dir = cache_dir / "chunks"
        transcripts_dir = cache_dir / "transcripts"
        
        # Create directories if they don't exist
        for directory in [cache_dir, chunks_dir, transcripts_dir]:
            directory.mkdir(parents=True, exist_ok=True)
            
        # Define output paths
        whisperx_dir = data_dir / args.uuid / "transcripts" / "whisperx"
        whisperx_dir.mkdir(parents=True, exist_ok=True)
        output_json = whisperx_dir / "transcribe_WhisperX.json"
        
        # Step 1: Split audio into chunks
        logger.info(f"Step 1: Splitting audio file {audio_path} into {args.segment_duration}s chunks")
        update_metadata(metadata_path, args.uuid, {"transcription_status": "splitting"})
        
        chunks = split_audio(audio_path, chunks_dir, args.segment_duration)
        if not chunks:
            logger.error("Failed to split audio into chunks")
            update_metadata(metadata_path, args.uuid, {"transcription_status": "error", "transcription_error": "Failed to split audio"})
            sys.exit(1)
            
        # Step 2: Transcribe each chunk
        logger.info(f"Step 2: Transcribing {len(chunks)} chunks with WhisperX")
        update_metadata(metadata_path, args.uuid, {"transcription_status": "transcribing"})
        
        transcript_files = []
        for i, chunk in enumerate(chunks):
            logger.info(f"Transcribing chunk {i+1}/{len(chunks)}: {chunk.name}")
            
            # Update progress in metadata
            progress = int((i / len(chunks)) * 100)
            update_metadata(metadata_path, args.uuid, {"transcription_progress": progress})
            
            # Transcribe chunk
            transcript_file = transcribe_chunk(chunk, transcripts_dir, args.model)
            if transcript_file:
                transcript_files.append(transcript_file)
            else:
                logger.error(f"Failed to transcribe chunk: {chunk}")
                
        if not transcript_files:
            logger.error("Failed to transcribe any chunks")
            update_metadata(metadata_path, args.uuid, {"transcription_status": "error", "transcription_error": "Failed to transcribe chunks"})
            sys.exit(1)
            
        # Step 3: Merge transcripts
        logger.info(f"Step 3: Merging {len(transcript_files)} transcripts")
        update_metadata(metadata_path, args.uuid, {"transcription_status": "merging"})
        
        if merge_transcripts(transcript_files, output_json):
            # Update metadata with success
            relative_output_path = output_json.relative_to(data_dir)
            update_metadata(metadata_path, args.uuid, {
                "transcription_status": "completed",
                "whisperx_json_path": str(relative_output_path),
                "transcription_progress": 100
            })
            logger.info(f"Transcription completed successfully: {output_json}")
        else:
            logger.error("Failed to merge transcripts")
            update_metadata(metadata_path, args.uuid, {"transcription_status": "error", "transcription_error": "Failed to merge transcripts"})
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Error in main: {e}")
        update_metadata(metadata_path, args.uuid, {"transcription_status": "error", "transcription_error": str(e)})
        sys.exit(1)

if __name__ == "__main__":
    main() 