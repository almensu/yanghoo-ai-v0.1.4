import asyncio
import yt_dlp
import os
import glob
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

async def run_download_media(task_metadata: TaskMetadata, quality: str, base_dir: str) -> str:
    """
    Downloads the media file for a given task and quality using yt-dlp.

    Args:
        task_metadata: The metadata object for the task.
        quality: Desired quality ('best', '1080p', '720p', '360p').
        base_dir: The base directory where task data is stored (string path).

    Returns:
        The relative path to the downloaded media file (relative to backend dir).

    Raises:
        FileNotFoundError: If the task directory doesn't exist or download fails.
        ValueError: If the quality string is invalid (though currently defaults).
        yt_dlp.utils.DownloadError: If yt-dlp fails to download the media.
        Exception: For other unexpected errors.
    """
    task_uuid_str = str(task_metadata.uuid)
    url = task_metadata.url
    uuid_dir = os.path.join(base_dir, task_uuid_str)
    backend_dir = os.path.dirname(base_dir)

    if not os.path.isdir(uuid_dir):
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    format_string = get_format_string(quality)
    # Define output template including quality
    output_filename_base = f"video_{quality}"
    if quality == 'bestaudio':
        output_filename_base = f"audio_{quality}"

    # Construct absolute base path for output template
    output_template_base = os.path.join(uuid_dir, output_filename_base)
    # yt-dlp needs the template string including extension placeholder
    output_template = f"{output_template_base}.%(ext)s"

    ydl_opts = {
        'format': format_string,
        'outtmpl': output_template,
        'quiet': False,
        'no_warnings': True,
        'ignoreerrors': False,
        'merge_output_format': 'mp4',
    }

    loop = asyncio.get_event_loop()
    downloaded_file_path_abs = None

    try:
        logger.info(f"Attempting to download media for {url} (Quality: {quality}) to {uuid_dir}")
        
        await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_opts).download([url]))

        # Find the downloaded file using glob
        search_pattern = f"{output_template_base}.*"
        found_files_abs = glob.glob(search_pattern)
        
        if not found_files_abs:
             logger.warning(f"Could not find exact match for {search_pattern} - checking for any video/audio file.")
             # Simple check for common extensions if exact match fails
             extensions = ['.mp4', '.mkv', '.webm', '.m4a', '.mp3', '.wav']
             all_files_in_dir = os.listdir(uuid_dir)
             for filename in all_files_in_dir:
                 if any(filename.lower().endswith(ext) for ext in extensions):
                    found_path_abs = os.path.join(uuid_dir, filename)
                    found_files_abs = [found_path_abs] # Treat as list
                    logger.warning(f"Found potential match: {found_path_abs}")
                    break # Take the first one found
        
        if found_files_abs:
            # Assume the first match is the correct one
            downloaded_file_path_abs = found_files_abs[0]
            # Calculate relative path from backend_dir
            relative_path = os.path.relpath(downloaded_file_path_abs, backend_dir)
            logger.info(f"Successfully downloaded media to {downloaded_file_path_abs}")
            return relative_path
        else:
            raise FileNotFoundError(f"Media download failed for {url}, file not found in {uuid_dir} after download attempt.")

    except yt_dlp.utils.DownloadError as e:
        logger.error(f"yt-dlp error downloading media for {url} (Quality: {quality}): {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during download_media for {url} (Quality: {quality}): {e}")
        raise 