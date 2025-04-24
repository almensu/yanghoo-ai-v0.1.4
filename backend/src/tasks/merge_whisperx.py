# backend/src/tasks/merge_whisperx.py
import asyncio
import json
import os
from uuid import UUID
from ..schemas import TaskMetadata, Platform
import logging
from typing import List, Dict, Any, Tuple
import aiofiles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_merge_whisperx(task_metadata: TaskMetadata, base_dir: str) -> Tuple[str, List[str]]:
    """
    Merges text segments from a WhisperX JSON file into a markdown file.

    Args:
        task_metadata: Metadata object containing WhisperX JSON file path.
        base_dir: Base directory for task data (string path).

    Returns:
        A tuple containing:
            - Relative path to the merged markdown file (relative to backend dir).
            - List containing the absolute path of the source JSON file used.

    Raises:
        FileNotFoundError: If task directory or source JSON file is missing.
        ValueError: If task is YouTube or no WhisperX JSON path is in metadata.
        Exception: For file I/O, JSON parsing, or other errors.
    """
    task_uuid_str = str(task_metadata.uuid)
    uuid_dir = os.path.join(base_dir, task_uuid_str)
    backend_dir = os.path.dirname(base_dir)

    if task_metadata.platform == Platform.YOUTUBE:
        raise ValueError(f"WhisperX merging is not applicable to YouTube tasks: {task_uuid_str}")

    if not os.path.isdir(uuid_dir):
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    if not task_metadata.whisperx_json_path:
        raise ValueError(f"No WhisperX JSON file path found in metadata for task {task_uuid_str}")

    json_path_abs = os.path.join(backend_dir, task_metadata.whisperx_json_path)
    if not os.path.isfile(json_path_abs):
         raise FileNotFoundError(f"WhisperX JSON file not found at expected path: {json_path_abs}")

    model_name_suffix = f"_{task_metadata.transcription_model}" if task_metadata.transcription_model else ""
    output_md_filename = f"{task_uuid_str}_merge_whisperx{model_name_suffix}.md"
    output_md_path_abs = os.path.join(uuid_dir, output_md_filename)
    relative_md_path = os.path.relpath(output_md_path_abs, backend_dir)

    merged_lines = []
    source_files_used = [json_path_abs]

    try:
        logger.info(f"Loading WhisperX JSON: {json_path_abs}")
        async with aiofiles.open(json_path_abs, mode='r', encoding='utf-8') as f:
            content = await f.read()
            whisperx_data = json.loads(content)

        if not isinstance(whisperx_data, dict) or 'segments' not in whisperx_data:
            raise ValueError(f"Invalid WhisperX JSON format in {json_path_abs}: 'segments' key missing or not a dict.")

        segments: List[Dict[str, Any]] = whisperx_data.get('segments', [])

        if not segments:
            logger.warning(f"No segments found in WhisperX JSON file: {json_path_abs}")
            merged_lines.append(f"# WhisperX Transcript ({task_metadata.transcription_model or 'Unknown Model'})\n")
            merged_lines.append("\n*No text segments found in the source JSON.*")
        else:
             merged_lines.append(f"# WhisperX Transcript ({task_metadata.transcription_model or 'Unknown Model'})\n")
             for i, segment in enumerate(segments):
                 text = segment.get('text', '').strip()
                 if text:
                     merged_lines.append(text)

        logger.info(f"Writing merged WhisperX content to {output_md_path_abs}")
        async with aiofiles.open(output_md_path_abs, mode='w', encoding='utf-8') as f:
            await f.write("\n".join(merged_lines))

        if not os.path.isfile(output_md_path_abs):
             if segments:
                 raise FileNotFoundError(f"Merged WhisperX markdown file not found after saving: {output_md_path_abs}")
             else:
                 logger.info(f"Merged WhisperX markdown file created but is empty (no segments found): {output_md_path_abs}")

        logger.info(f"Successfully merged WhisperX transcript to {output_md_path_abs}")
        return relative_md_path, source_files_used

    except json.JSONDecodeError as e:
        logger.error(f"Error decoding WhisperX JSON file {json_path_abs}: {e}")
        raise ValueError(f"Invalid JSON format in {json_path_abs}") from e
    except Exception as e:
        logger.error(f"Error processing or writing merged WhisperX markdown file {output_md_path_abs}: {e}")
        raise 