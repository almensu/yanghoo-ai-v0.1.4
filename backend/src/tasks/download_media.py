import asyncio
import yt_dlp
from pathlib import Path
from uuid import UUID
from ..schemas import TaskMetadata
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_format_string(quality: str) -> str:
    """Gets the yt-dlp format string for the desired quality."""
    quality_map = {
        'best': 'bestvideo+bestaudio/best',
        '1080p': 'bestvideo[height<=1080]+bestaudio/best[height<=1080]',
        '720p': 'bestvideo[height<=720]+bestaudio/best[height<=720]',
        '360p': 'bestvideo[height<=360]+bestaudio/best[height<=360]',
        # Add other formats if needed
    }
    # Default to 'best' if quality string is not recognized
    return quality_map.get(quality, quality_map['best'])

async def run_download_media(task_metadata: TaskMetadata, quality: str, base_dir: Path) -> str:
    """
    Downloads the media file for a given task and quality using yt-dlp.

    Args:
        task_metadata: The metadata object for the task.
        quality: Desired quality ('best', '1080p', '720p', '360p').
        base_dir: The base directory where task data is stored.

    Returns:
        The relative path to the downloaded media file.

    Raises:
        FileNotFoundError: If the task directory doesn't exist.
        ValueError: If the quality string is invalid (though currently defaults).
        yt_dlp.utils.DownloadError: If yt-dlp fails to download the media.
        Exception: For other unexpected errors.
    """
    task_uuid_str = str(task_metadata.uuid)
    url = task_metadata.url
    uuid_dir = base_dir / task_uuid_str

    if not uuid_dir.is_dir():
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    format_string = get_format_string(quality)
    # Define output template including quality, removing UUID from filename
    output_filename_base = f"video_{quality}" # Example: video_best, video_1080p
    # If quality is 'bestaudio', maybe use a different prefix?
    if quality == 'bestaudio':
        output_filename_base = f"audio_{quality}" # Example: audio_bestaudio

    output_template = str(uuid_dir / f"{output_filename_base}.%(ext)s")

    ydl_opts = {
        'format': format_string,
        'outtmpl': output_template,
        'quiet': False, # Set to False to see progress/errors
        'no_warnings': True,
        'ignoreerrors': False,
        'merge_output_format': 'mp4', # Preferred format after merging video/audio
        # 'overwrites': True, # yt-dlp default is usually not to overwrite
        # Consider adding progress hooks if needed later
    }

    loop = asyncio.get_event_loop()
    downloaded_file_path = None

    try:
        logger.info(f"Attempting to download media for {url} (Quality: {quality}) to {uuid_dir}")
        
        # Run yt-dlp download in executor
        await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_opts).download([url]))

        # Find the downloaded file using the simplified base name
        found_files = list(uuid_dir.glob(f"{output_filename_base}.*"))
        if not found_files:
             # Check if maybe format selection failed and it defaulted to something else?
             # This part might need refinement based on yt-dlp behavior
             logger.warning(f"Could not find exact match for {output_filename_base}.* - checking for any video file.")
             # Simple check for common video extensions
             for ext in ['mp4', 'mkv', 'webm']: 
                 found_files = list(uuid_dir.glob(f"*.{ext}"))
                 if found_files:
                     logger.warning(f"Found potential match: {found_files[0]}")
                     break # Take the first one found
        
        if found_files:
            downloaded_file_path = found_files[0]
            relative_path = downloaded_file_path.relative_to(base_dir.parent)
            logger.info(f"Successfully downloaded media to {downloaded_file_path}")
            return str(relative_path)
        else:
            raise FileNotFoundError(f"Media download failed for {url}, file not found in {uuid_dir} after download attempt.")

    except yt_dlp.utils.DownloadError as e:
        logger.error(f"yt-dlp error downloading media for {url} (Quality: {quality}): {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during download_media for {url} (Quality: {quality}): {e}")
        raise 