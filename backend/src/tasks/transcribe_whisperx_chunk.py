#!/usr/bin/env python3
import sys
import json
import argparse
import time
from pathlib import Path
import torch
import whisperx
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger("transcribe_whisperx_chunk")

def transcribe_audio_chunk(input_path: Path, output_path: Path, model_name: str = "large-v3") -> bool:
    """
    Transcribe an audio chunk using WhisperX and save the results to a JSON file.
    
    Args:
        input_path: Path to the input audio file
        output_path: Path to save the output JSON file
        model_name: WhisperX model to use
        
    Returns:
        bool: True if transcription was successful, False otherwise
    """
    try:
        logger.info(f"Transcribing audio chunk: {input_path}")
        logger.info(f"Output path: {output_path}")
        logger.info(f"Using model: {model_name}")
        
        # Determine device
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}")
        
        # Set compute type based on device
        compute_type = "float16" if device == "cuda" else "int8"
        logger.info(f"Using compute type: {compute_type}")
        
        # Load ASR model
        logger.info("Loading WhisperX model...")
        model = whisperx.load_model(model_name, device, compute_type=compute_type)
        
        # Load audio
        logger.info("Loading audio...")
        audio = whisperx.load_audio(str(input_path))
        
        # Transcribe audio
        logger.info("Transcribing audio...")
        start_time = time.time()
        result = model.transcribe(audio, batch_size=16)
        transcription_time = time.time() - start_time
        logger.info(f"Transcription completed in {transcription_time:.2f} seconds")
        
        # Load alignment model
        language_code = result.get("language", "en")
        logger.info(f"Detected language: {language_code}")
        logger.info("Loading alignment model...")
        model_a, metadata_align = whisperx.load_align_model(language_code=language_code, device=device)
        
        # Align whisper output with audio
        logger.info("Aligning transcription with audio...")
        result = whisperx.align(
            result["segments"],
            model_a,
            metadata_align,
            audio,
            device,
            return_char_alignments=True
        )
        
        # Count words
        word_count = 0
        for segment in result["segments"]:
            word_count += len(segment.get("words", []))
        
        # Prepare final result
        final_result = {
            "model_info": {
                "model_name": model_name,
                "device": device,
                "compute_type": compute_type,
                "language": language_code,
                "process_time": transcription_time
            },
            "text": " ".join([segment["text"].strip() for segment in result["segments"]]),
            "segments": result["segments"],
            "word_count": word_count,
            "segment_count": len(result["segments"])
        }
        
        # Write output to file
        logger.info(f"Writing transcription to {output_path}")
        output_path.parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(final_result, f, indent=2, ensure_ascii=False)
            
        if not output_path.exists():
            logger.error(f"Failed to write output file: {output_path}")
            return False
            
        logger.info(f"Transcription successful: {output_path}")
        return True
    except Exception as e:
        logger.error(f"Error in transcribe_audio_chunk: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description='Transcribe audio chunk using WhisperX')
    parser.add_argument('--input', required=True, help='Path to input audio chunk')
    parser.add_argument('--output', required=True, help='Path to output JSON file')
    parser.add_argument('--model', default='large-v3', choices=['tiny.en', 'small.en', 'medium.en', 'large-v3'], help='WhisperX model to use')
    args = parser.parse_args()
    
    try:
        input_path = Path(args.input)
        output_path = Path(args.output)
        
        if not input_path.exists():
            logger.error(f"Input file not found: {input_path}")
            sys.exit(1)
            
        if transcribe_audio_chunk(input_path, output_path, args.model):
            logger.info("Transcription completed successfully")
            sys.exit(0)
        else:
            logger.error("Transcription failed")
            sys.exit(1)
    except Exception as e:
        logger.error(f"Error in main: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 