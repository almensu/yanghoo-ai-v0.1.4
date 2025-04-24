# backend/src/tasks/merge_vtt.py
import re
import asyncio
import os
from pathlib import Path
from uuid import UUID
from ..schemas import TaskMetadata, Platform
import logging
from typing import List, Tuple
import aiofiles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Simple regex to find VTT text lines (ignoring timestamps, cues, etc.)
# Matches lines that don't start with 'WEBVTT', 'NOTE', 'STYLE', 'REGION', '-->', or are empty.
# It also avoids lines containing only digits (cue identifiers).
VTT_TEXT_PATTERN = re.compile(r"^(?!(?:WEBVTT|NOTE|STYLE|REGION|\d+$|.*-->)).+$")

async def parse_vtt_file(file_path: Path) -> List[str]:
    """Parses a VTT file and extracts text lines."""
    text_lines = []
    if not file_path.is_file():
        logger.warning(f"VTT file not found: {file_path}")
        return []
    try:
        async with aiofiles.open(file_path, mode='r', encoding='utf-8') as f:
            lines = await f.readlines()
            for line in lines:
                line = line.strip()
                if VTT_TEXT_PATTERN.match(line):
                    # Further clean potential HTML tags sometimes found in VTT
                    line = re.sub(r'<[^>]+>', '', line)
                    text_lines.append(line)
        # Remove duplicates while preserving order (simple approach)
        seen = set()
        unique_lines = [x for x in text_lines if not (x in seen or seen.add(x))]
        return unique_lines
    except Exception as e:
        logger.error(f"Error parsing VTT file {file_path}: {e}")
        return [] # Return empty list on error


async def run_merge_vtt(task_metadata: TaskMetadata, base_dir_str: str, backend_dir_str: str) -> Tuple[str, List[str]]:
    """
    Merges text content from specified VTT files (e.g., en, zh-Hans) into a markdown file.

    Args:
        task_metadata: Metadata object containing VTT file paths.
        base_dir_str: Base directory for task data (string path, e.g., backend/data).
        backend_dir_str: Backend root directory (string path, e.g., backend).

    Returns:
        A tuple containing:
            - Relative path to the merged markdown file (relative to backend dir).
            - List of absolute paths of the source VTT files used (as strings).

    Raises:
        FileNotFoundError: If task directory or source VTT files are missing.
        ValueError: If task is not YouTube or no VTT files are in metadata.
        Exception: For file I/O or other errors.
    """
    base_dir = Path(base_dir_str)
    backend_dir = Path(backend_dir_str)
    task_uuid_str = str(task_metadata.uuid)
    # Construct paths using pathlib
    uuid_dir = base_dir / task_uuid_str

    if task_metadata.platform != Platform.YOUTUBE:
        raise ValueError(f"VTT merging is only applicable to YouTube tasks: {task_uuid_str}")

    if not uuid_dir.is_dir():
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    if not task_metadata.vtt_files:
        raise ValueError(f"No VTT files found in metadata for task {task_uuid_str}")

    # Define output path using pathlib
    output_md_filename = f"{task_uuid_str}_merge_vtt.md"
    output_md_path_abs = uuid_dir / output_md_filename
    # Calculate relative path from backend dir using pathlib, convert to string
    relative_md_path = str(output_md_path_abs.relative_to(backend_dir))

    merged_content = []
    source_files_used: List[str] = [] # Store absolute paths as strings

    # Process English VTT first if available
    if 'en' in task_metadata.vtt_files:
        en_vtt_path_str = task_metadata.vtt_files['en']
        if en_vtt_path_str:
            # Assume path is relative to backend_dir
            en_vtt_path_abs = backend_dir / en_vtt_path_str # Use pathlib
            if en_vtt_path_abs.is_file(): # Use pathlib
                logger.info(f"Parsing English VTT: {en_vtt_path_abs}")
                en_lines = await parse_vtt_file(en_vtt_path_abs)
                if en_lines:
                    merged_content.append("## English Transcript\n")
                    merged_content.extend(en_lines)
                    merged_content.append("\n")
                    source_files_used.append(str(en_vtt_path_abs)) # Store string path
            else:
                logger.warning(f"English VTT file path in metadata, but not found: {en_vtt_path_abs}")

    # Process Chinese VTT if available
    if 'zh-Hans' in task_metadata.vtt_files:
        zh_vtt_path_str = task_metadata.vtt_files['zh-Hans']
        if zh_vtt_path_str:
            # Assume path is relative to backend_dir
            zh_vtt_path_abs = backend_dir / zh_vtt_path_str # Use pathlib
            if zh_vtt_path_abs.is_file(): # Use pathlib
                logger.info(f"Parsing Chinese VTT: {zh_vtt_path_abs}")
                zh_lines = await parse_vtt_file(zh_vtt_path_abs)
                if zh_lines:
                    merged_content.append("## Chinese Transcript (中文)\n")
                    merged_content.extend(zh_lines)
                    merged_content.append("\n")
                    source_files_used.append(str(zh_vtt_path_abs)) # Store string path
            else:
                logger.warning(f"Chinese VTT file path in metadata, but not found: {zh_vtt_path_abs}")

    if not merged_content:
        # Changed error to warning, maybe create empty file?
        logger.warning(f"Could not extract text from any source VTT files for task {task_uuid_str}. Merged file will be empty.")
        # Allow empty file creation
        merged_content.append(f"# Merged VTT Transcripts for {task_uuid_str}")
        merged_content.append("\n*No valid text content found in source VTT files.*")

    # Write the merged content to the markdown file
    logger.info(f"Writing merged VTT content to {output_md_path_abs}")
    try:
        # aiofiles works with Path objects
        async with aiofiles.open(output_md_path_abs, mode='w', encoding='utf-8') as f:
            await f.write("\n".join(merged_content))

        # Verify creation using pathlib
        if not output_md_path_abs.is_file(): # Just check existence
            raise FileNotFoundError(f"Merged VTT markdown file failed to save: {output_md_path_abs}")

        logger.info(f"Successfully merged VTT transcripts to {output_md_path_abs}")
        return relative_md_path, source_files_used # Return relative path (str) and absolute source paths (list[str])

    except Exception as e:
        logger.error(f"Error writing merged VTT markdown file {output_md_path_abs}: {e}")
        raise 