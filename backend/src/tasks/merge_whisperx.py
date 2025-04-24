# backend/src/tasks/merge_whisperx.py
import asyncio
import json
from pathlib import Path
from uuid import UUID
from ..schemas import TaskMetadata, Platform
import logging
from typing import List, Dict, Any
import aiofiles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_merge_whisperx(task_metadata: TaskMetadata, base_dir: Path) -> tuple[str, List[str]]:
    """
    Merges text segments from a WhisperX JSON file into a markdown file.

    Args:
        task_metadata: Metadata object containing WhisperX JSON file path.
        base_dir: Base directory for task data.

    Returns:
        A tuple containing:
            - Relative path to the merged markdown file.
            - List containing the absolute path of the source JSON file used.

    Raises:
        FileNotFoundError: If task directory or source JSON file is missing.
        ValueError: If task is YouTube or no WhisperX JSON path is in metadata.
        Exception: For file I/O, JSON parsing, or other errors.
    """
    task_uuid_str = str(task_metadata.uuid)
    uuid_dir = base_dir / task_uuid_str
    project_root = base_dir.parent

    if task_metadata.platform == Platform.YOUTUBE:
        raise ValueError(f"WhisperX merging is not applicable to YouTube tasks: {task_uuid_str}")

    if not uuid_dir.is_dir():
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    if not task_metadata.whisperx_json_path:
        raise ValueError(f"No WhisperX JSON file path found in metadata for task {task_uuid_str}")

    json_path = project_root / task_metadata.whisperx_json_path
    if not json_path.is_file():
         raise FileNotFoundError(f"WhisperX JSON file not found at expected path: {json_path}")

    # Define output MD file path
    # Incorporate model name if available for clarity, otherwise use generic name
    model_name_suffix = f"_{task_metadata.transcription_model}" if task_metadata.transcription_model else ""
    output_md_filename = f"{task_uuid_str}_merge_whisperx{model_name_suffix}.md"
    output_md_path = uuid_dir / output_md_filename
    relative_md_path = Path(task_uuid_str) / output_md_filename

    merged_lines = []
    source_files_used = [str(json_path)] # Store absolute path of the source JSON

    try:
        logger.info(f"Loading WhisperX JSON: {json_path}")
        async with aiofiles.open(json_path, mode='r', encoding='utf-8') as f:
            content = await f.read()
            whisperx_data = json.loads(content)

        if not isinstance(whisperx_data, dict) or 'segments' not in whisperx_data:
            raise ValueError(f"Invalid WhisperX JSON format in {json_path}: 'segments' key missing or not a dict.")

        segments: List[Dict[str, Any]] = whisperx_data.get('segments', [])

        if not segments:
            logger.warning(f"No segments found in WhisperX JSON file: {json_path}")
            # Create an empty file or raise error? Let's create an empty file.
            merged_lines.append(f"# WhisperX Transcript ({task_metadata.transcription_model or 'Unknown Model'})\n")
            merged_lines.append("\n*No text segments found in the source JSON.*")

        else:
             merged_lines.append(f"# WhisperX Transcript ({task_metadata.transcription_model or 'Unknown Model'})\n")
             # Extract text from each segment
             for i, segment in enumerate(segments):
                 text = segment.get('text', '').strip()
                 if text:
                     merged_lines.append(text)
                 # Add a newline between segments for readability, unless it's the last one
                 # if text and i < len(segments) - 1:
                 #    merged_lines.append("") # Add empty line for separation

        # Write the merged content to the markdown file
        logger.info(f"Writing merged WhisperX content to {output_md_path}")
        async with aiofiles.open(output_md_path, mode='w', encoding='utf-8') as f:
            # Join with single newline, as segments usually represent paragraphs or sentences
            await f.write("\n".join(merged_lines))

        # Verify creation
        if not output_md_path.is_file(): # Check size only if content expected
             if segments: # Only raise if we expected content
                 raise FileNotFoundError(f"Merged WhisperX markdown file not found after saving: {output_md_path}")
             else: # File might be empty if no segments, which is okay
                 logger.info(f"Merged WhisperX markdown file created but is empty (no segments found): {output_md_path}")


        logger.info(f"Successfully merged WhisperX transcript to {output_md_path}")
        return str(relative_md_path), source_files_used

    except json.JSONDecodeError as e:
        logger.error(f"Error decoding WhisperX JSON file {json_path}: {e}")
        raise ValueError(f"Invalid JSON format in {json_path}") from e
    except Exception as e:
        logger.error(f"Error processing or writing merged WhisperX markdown file {output_md_path}: {e}")
        raise 