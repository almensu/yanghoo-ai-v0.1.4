# backend/src/tasks/transcribe_youtube_vtt.py
import asyncio
import yt_dlp
from pathlib import Path
from uuid import UUID
from ..schemas import TaskMetadata
import logging
from typing import Dict, List

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Desired languages for subtitles
TARGET_LANGS = ["en", "zh-Hans"]

async def run_transcribe_youtube_vtt(task_metadata: TaskMetadata, base_dir: Path) -> Dict[str, str]:
    """
    Downloads available VTT subtitles (automatic captions) for a YouTube video using yt-dlp.

    Args:
        task_metadata: The metadata object for the task (must be YouTube platform).
        base_dir: The base directory where task data is stored.

    Returns:
        A dictionary mapping language codes (e.g., 'en', 'zh-Hans') to their
        relative VTT file paths. Returns an empty dict if no target subs are found.

    Raises:
        FileNotFoundError: If the task directory doesn't exist.
        ValueError: If the task platform is not YouTube.
        yt_dlp.utils.DownloadError: If yt-dlp fails during subtitle download.
        Exception: For other unexpected errors.
    """
    task_uuid_str = str(task_metadata.uuid)
    url = task_metadata.url
    uuid_dir = base_dir / task_uuid_str
    project_root = base_dir.parent

    if task_metadata.platform != Platform.YOUTUBE: # Use the Enum member
         raise ValueError(f"Cannot download VTT for non-YouTube task: {task_uuid_str}")

    if not uuid_dir.is_dir():
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    # Define output template for subtitles
    # Example: data/uuid/uuid_vtt.en.vtt
    # Corrected template placeholder - yt-dlp uses %(subtitles)s or similar, let's use a fixed name and rely on finding files
    output_filename_base = f"{task_uuid_str}_vtt"
    output_template = str(uuid_dir / f"{output_filename_base}.%(ext)s") # This might not capture language correctly, rely on post-download check

    ydl_opts = {
        'writesubtitles': False,        # Prefer automatic captions if manual aren't available
        'writeautomaticsub': True,     # Write automatic captions
        'subtitleslangs': TARGET_LANGS, # Specify desired languages
        'subtitlesformat': 'vtt',       # Desired format
        'skip_download': True,          # Don't download the video
        # yt-dlp's subtitle naming can be complex (%()s fields). 
        # It's often easier to let it name files and then find them.
        # Specify the output directory only.
        'outtmpl': str(uuid_dir / '%(id)s.%(ext)s'), # General template, focus on directory
        # We will rename files later if needed, or find by expected lang codes.
        'paths': {'home': str(uuid_dir)}, # Force output directory
        'quiet': False,
        'no_warnings': True,
        'ignoreerrors': True, # Continue even if some subs fail
    }

    loop = asyncio.get_event_loop()
    downloaded_subs: Dict[str, str] = {}

    try:
        logger.info(f"Attempting to download VTT subtitles ({', '.join(TARGET_LANGS)}) for {url} to {uuid_dir}")

        # Run yt-dlp download in executor
        await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_opts).download([url]))

        # Find and rename/store paths for downloaded VTT files
        for lang in TARGET_LANGS:
            # yt-dlp might create files like 'videoid.en.vtt' or 'videoid.zh-Hans.vtt'
            # Search for files matching the language code within the directory
            found_vtt = list(uuid_dir.glob(f'*.{lang}.vtt'))
            if found_vtt:
                original_path = found_vtt[0] # Take the first match if multiple somehow exist
                # Define a standardized name
                standard_filename = f"{task_uuid_str}_vtt.{lang}.vtt"
                standard_path = uuid_dir / standard_filename
                
                # Rename the file to our standard
                try:
                    # Only rename if it's not already the standard name
                    if original_path != standard_path:
                         original_path.rename(standard_path)
                         logger.info(f"Renamed {original_path.name} to {standard_path.name}")
                    else:
                         logger.info(f"Found subtitle with standard name: {standard_path.name}")

                    relative_path = standard_path.relative_to(project_root)
                    downloaded_subs[lang] = str(relative_path)
                    
                except OSError as e:
                    logger.error(f"Error renaming subtitle file {original_path} to {standard_path}: {e}")
                    # Store original path if rename fails?
                    # downloaded_subs[lang] = str(original_path.relative_to(project_root))
            else:
                 logger.warning(f"Subtitle file for lang '{lang}' not found in {uuid_dir}")

        if not downloaded_subs:
             logger.warning(f"No target VTT subtitles found or downloaded for task {task_uuid_str}")
             # It's not necessarily an error if subs don't exist, return empty dict

        return downloaded_subs

    except yt_dlp.utils.DownloadError as e:
        # Should be less likely with ignoreerrors=True, but possible for total failure
        logger.error(f"yt-dlp error downloading VTT subtitles for {url}: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during VTT download for {url}: {e}")
        raise

# Need Platform Enum from schemas
from ..schemas import Platform 