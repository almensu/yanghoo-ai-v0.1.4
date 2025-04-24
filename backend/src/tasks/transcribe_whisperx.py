# backend/src/tasks/transcribe_whisperx.py
import asyncio
import whisperx
import torch
from pathlib import Path
from uuid import UUID
from ..schemas import TaskMetadata, Platform
import logging
import os
import json
import gc # Garbage collector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration (Consider making these configurable)
DEFAULT_BATCH_SIZE = 16
DEFAULT_COMPUTE_TYPE = "float16" # "int8" uses less VRAM, "float32" for CPU

def get_device_and_compute_type():
    """Determine the best device (GPU/CPU) and compute type."""
    if torch.cuda.is_available():
        logger.info("CUDA is available, using GPU.")
        # Check GPU capability for float16/int8? For now, default to float16 on GPU
        return "cuda", DEFAULT_COMPUTE_TYPE
    else:
        logger.info("CUDA not available, using CPU.")
        return "cpu", "float32" # float32 is generally better for CPU

async def run_transcribe_whisperx(task_metadata: TaskMetadata, model_name: str, base_dir: Path) -> str:
    """
    Transcribes an audio file using WhisperX and saves word-level timings.

    Args:
        task_metadata: The metadata object for the task.
        model_name: Name of the Whisper model to use (e.g., 'large-v3').
        base_dir: The base directory where task data is stored.

    Returns:
        The relative path to the saved WhisperX JSON output file.

    Raises:
        FileNotFoundError: If the task directory or extracted WAV file is not found.
        ValueError: If the task platform is YouTube or WAV path is missing.
        Exception: For errors during transcription or alignment.
    """
    task_uuid_str = str(task_metadata.uuid)
    uuid_dir = base_dir / task_uuid_str
    project_root = base_dir.parent

    if task_metadata.platform == Platform.YOUTUBE:
        raise ValueError(f"WhisperX transcription is not intended for YouTube tasks: {task_uuid_str}")

    if not uuid_dir.is_dir():
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    if not task_metadata.extracted_wav_path:
         raise FileNotFoundError(f"Extracted WAV file path not found in metadata for task {task_uuid_str}")

    # Construct absolute path for the WAV file
    wav_path = project_root / task_metadata.extracted_wav_path
    if not wav_path.is_file():
        raise FileNotFoundError(f"Extracted WAV file not found at expected path: {wav_path}")

    # Define output JSON file path
    output_json_filename = f"{task_uuid_str}_whisperx_{model_name}.json"
    output_json_path = uuid_dir / output_json_filename
    relative_json_path = Path(task_uuid_str) / output_json_filename

    device, compute_type = get_device_and_compute_type()
    logger.info(f"Using device: {device}, compute_type: {compute_type} for model: {model_name}")

    # --- Load Models --- 
    # Clear CUDA cache before loading models to potentially free VRAM
    if device == "cuda":
        torch.cuda.empty_cache()
        gc.collect()

    audio_file = str(wav_path)
    result = None
    model = None
    model_a = None
    diarize_model = None # Not using diarization for now
    audio = None # Define audio variable outside try block

    try:
        logger.info(f"Loading Whisper model '{model_name}'...")
        model = whisperx.load_model(model_name, device, compute_type=compute_type)

        logger.info(f"Loading audio file: {audio_file}")
        audio = whisperx.load_audio(audio_file)

        logger.info(f"Transcribing audio for task {task_uuid_str}...")
        # Transcribe
        result = model.transcribe(audio, batch_size=DEFAULT_BATCH_SIZE)
        logger.info(f"Transcription complete for task {task_uuid_str}.")

        # --- Alignment ---
        # Check if language is supported for alignment
        if result["language"] not in whisperx.alignment.DEFAULT_ALIGN_MODELS_HF:
             logger.warning(f"Alignment model not available for language '{result['language']}'. Skipping alignment.")
        else:
            # Clear CUDA cache again before loading alignment model
            if device == "cuda":
                # Unload whisper model explicitly? WhisperX doesn't seem to provide an unload function easily.
                # Rely on gc and cache clearing for now.
                del model
                torch.cuda.empty_cache()
                gc.collect()
                model = None # Ensure model is None after del

            logger.info("Loading alignment model...")
            model_a, metadata = whisperx.load_align_model(language_code=result["language"], device=device)
            logger.info(f"Aligning transcript for task {task_uuid_str}...")
            result = whisperx.align(result["segments"], model_a, metadata, audio, device, return_char_alignments=False)
            logger.info(f"Alignment complete for task {task_uuid_str}.")
            del model_a # Clean up alignment model immediately
            model_a = None
            if device == "cuda":
                torch.cuda.empty_cache()
            gc.collect()

        # --- Save Result ---
        logger.info(f"Saving transcription result to {output_json_path}")
        # Use Pydantic models or simple dict conversion if needed before saving
        # WhisperX result is already dictionary-like
        # Need to handle non-serializable types if any (rare for whisperx output)
        with open(output_json_path, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)

        # Verify file creation
        if not output_json_path.is_file() or output_json_path.stat().st_size == 0:
             raise FileNotFoundError(f"WhisperX JSON output file not found or empty after saving: {output_json_path}")

        logger.info(f"Successfully transcribed and saved WhisperX output for task {task_uuid_str}")
        return str(relative_json_path)

    except Exception as e:
        logger.error(f"Error during WhisperX transcription/alignment for task {task_uuid_str}: {e}", exc_info=True)
        raise
    finally:
        # --- Cleanup ---
        # Attempt to explicitly delete models and clear cache
        # Important for GPU memory management if running multiple tasks sequentially
        if model:
            del model
        if model_a:
            del model_a
        # del diarize_model # If used
        if result:
            del result
        if audio:
             del audio # Explicitly delete potentially large audio tensor
        if device == "cuda":
            logger.info("Clearing CUDA cache post-transcription.")
            torch.cuda.empty_cache()
        gc.collect()
        logger.info("WhisperX task cleanup finished.") 