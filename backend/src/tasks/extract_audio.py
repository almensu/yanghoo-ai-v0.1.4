# backend/src/tasks/extract_audio.py
import asyncio
import ffmpeg
import os
from uuid import UUID
from ..schemas import TaskMetadata
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define standard audio parameters for transcription
AUDIO_CODEC = 'pcm_s16le' # Standard WAV codec
SAMPLE_RATE = 16000       # Common sample rate for speech recognition
AUDIO_CHANNELS = 1        # Mono audio

async def run_extract_audio(task_metadata: TaskMetadata, base_dir: str) -> str:
    """
    Extracts audio from a downloaded media file to WAV format using ffmpeg.

    Args:
        task_metadata: The metadata object for the task.
        base_dir: The base directory where task data is stored (string path).

    Returns:
        The relative path to the extracted WAV audio file (relative to backend dir).

    Raises:
        FileNotFoundError: If the task directory or a suitable media file is not found.
        ValueError: If no media files are found in metadata.
        ffmpeg.Error: If the ffmpeg command fails.
        Exception: For other unexpected errors.
    """
    task_uuid_str = str(task_metadata.uuid)
    uuid_dir = os.path.join(base_dir, task_uuid_str)
    backend_dir = os.path.dirname(base_dir) 

    if not os.path.isdir(uuid_dir):
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    if not task_metadata.media_files:
        raise ValueError(f"No media files found in metadata for task {task_uuid_str}")

    # Strategy to find input media file:
    # 1. Prefer 'best' quality if available.
    # 2. Otherwise, take the first available media file path.
    input_media_rel_path_str = None
    if 'best' in task_metadata.media_files:
        input_media_rel_path_str = task_metadata.media_files['best']
    else:
        # Get the first value from the media_files dictionary
        input_media_rel_path_str = next(iter(task_metadata.media_files.values()), None)

    if not input_media_rel_path_str:
         raise ValueError(f"Could not determine input media file path from metadata for task {task_uuid_str}")

    # Construct absolute input path relative to the backend directory
    input_media_path_abs = os.path.join(backend_dir, input_media_rel_path_str)
    if not os.path.isfile(input_media_path_abs):
        raise FileNotFoundError(f"Input media file not found at expected path: {input_media_path_abs}")

    # Define output WAV file path using os.path
    output_wav_filename = "audio.wav" # Simple, fixed filename
    output_wav_path_abs = os.path.join(uuid_dir, output_wav_filename)
    # Calculate the relative path from the backend directory
    relative_wav_path = os.path.relpath(output_wav_path_abs, backend_dir)

    logger.info(f"Attempting to extract audio from {input_media_path_abs} to {output_wav_path_abs}")

    loop = asyncio.get_event_loop()

    try:
        # Ensure the output directory exists (should already, but safety check)
        os.makedirs(uuid_dir, exist_ok=True)

        # Prepare ffmpeg command using string paths
        stream = ffmpeg.input(input_media_path_abs)
        stream = ffmpeg.output(
            stream,
            output_wav_path_abs,
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


        # Verify the output file was created using os.path
        if not os.path.isfile(output_wav_path_abs) or os.path.getsize(output_wav_path_abs) == 0:
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