# backend/src/tasks/extract_audio.py
import asyncio
import ffmpeg
import os
from pathlib import Path # Import Path
from uuid import UUID
from ..schemas import TaskMetadata
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define standard audio parameters for transcription
AUDIO_CODEC = 'pcm_s16le' # Standard WAV codec
SAMPLE_RATE = 16000       # Common sample rate for speech recognition
AUDIO_CHANNELS = 1        # Mono audio

async def run_extract_audio(task_metadata: TaskMetadata, backend_dir_str: str, base_dir_str: str) -> str:
    """
    Extracts audio from a downloaded media file to WAV format using ffmpeg.

    Args:
        task_metadata: The metadata object for the task.
        backend_dir_str: The path to the backend root directory.
        base_dir_str: The base directory where task data is stored (e.g., backend/data).

    Returns:
        The relative path to the extracted WAV audio file (relative to backend dir).

    Raises:
        FileNotFoundError: If the task directory or a suitable media file is not found.
        ValueError: If no media files are found in metadata.
        ffmpeg.Error: If the ffmpeg command fails.
        Exception: For other unexpected errors.
    """
    base_dir = Path(base_dir_str)
    backend_dir = Path(backend_dir_str)
    task_uuid_str = str(task_metadata.uuid)
    uuid_dir = base_dir / task_uuid_str # Use pathlib

    if not uuid_dir.is_dir(): # Use pathlib
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    if not task_metadata.media_files:
        raise ValueError(f"No media files found in metadata for task {task_uuid_str}")

    # Strategy to find input media file:
    # 1. Prefer 'best' quality if available.
    # 2. Otherwise, take the first available media file path.
    input_media_rel_path_str = None
    if 'best' in task_metadata.media_files and task_metadata.media_files['best']:
        input_media_rel_path_str = task_metadata.media_files['best']
    else:
        # Find the first non-null path in the dict
        for path in task_metadata.media_files.values():
            if path:
                input_media_rel_path_str = path
                break

    if not input_media_rel_path_str:
         raise ValueError(f"Could not determine input media file path from metadata for task {task_uuid_str}")

    # Construct absolute input path using pathlib
    input_media_path_abs = base_dir / input_media_rel_path_str # <-- Correct base (data_dir)
    if not input_media_path_abs.is_file(): # Use pathlib
        raise FileNotFoundError(f"Input media file not found at expected path: {input_media_path_abs}")

    # Define output WAV file path using pathlib
    output_wav_filename = "audio.wav"
    output_wav_path_abs = uuid_dir / output_wav_filename # Use pathlib
    # Calculate the relative path using pathlib, store as string
    relative_wav_path = str(output_wav_path_abs.relative_to(base_dir)) # Use base_dir (data dir) as base

    logger.info(f"Attempting to extract audio from {input_media_path_abs} to {output_wav_path_abs}")

    loop = asyncio.get_event_loop()

    try:
        # Ensure the output directory exists (should already, but safety check)
        uuid_dir.mkdir(parents=True, exist_ok=True) # Use pathlib

        # Prepare ffmpeg command using string paths (ffmpeg-python needs strings)
        stream = ffmpeg.input(str(input_media_path_abs))
        stream = ffmpeg.output(
            stream,
            str(output_wav_path_abs),
            acodec=AUDIO_CODEC,
            ar=SAMPLE_RATE,
            ac=AUDIO_CHANNELS,
            vn=None # Disable video recording
        )
        # Use -y to overwrite output file if it exists
        # The overwrite_output=True flag in ffmpeg.run() handles this

        logger.info(f"Running ffmpeg command for task {task_uuid_str}")

        # Run ffmpeg command in executor
        # Note: ffmpeg.run() is blocking, so run_in_executor is appropriate
        # We capture stderr to check for errors
        process = await loop.run_in_executor(
            None,
            lambda: ffmpeg.run(stream, capture_stdout=True, capture_stderr=True, overwrite_output=True)
        )

        # ffmpeg.run raises ffmpeg.Error on non-zero exit code,
        # but let's log stderr for debugging anyway.
        stderr_output = process[1].decode('utf-8')
        if stderr_output:
             logger.debug(f"ffmpeg stderr for {task_uuid_str}:\n{stderr_output}")


        # Verify the output file was created using pathlib
        if not output_wav_path_abs.is_file() or output_wav_path_abs.stat().st_size == 0:
            raise FileNotFoundError(f"Audio extraction failed for {task_uuid_str}, output WAV file not found or is empty at {output_wav_path_abs}")

        logger.info(f"Successfully extracted audio to {output_wav_path_abs}")
        return relative_wav_path

    except ffmpeg.Error as e:
        stderr = e.stderr.decode('utf-8') if e.stderr else 'No stderr available'
        logger.error(f"ffmpeg error extracting audio for {task_uuid_str}: {e}\nffmpeg stderr:\n{stderr}")
        raise  # Re-raise the specific ffmpeg error
    except Exception as e:
        logger.error(f"Unexpected error during audio extraction for {task_uuid_str}: {e}")
        raise # Re-raise other exceptions 