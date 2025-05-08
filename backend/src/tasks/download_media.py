import asyncio
import yt_dlp
import os
import glob
from pathlib import Path
from uuid import UUID
from ..schemas import TaskMetadata
import logging
import shutil

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

async def run_download_media(task_metadata: TaskMetadata, quality: str, base_dir_str: str) -> str:
    """
    Downloads the media file for a given task and quality using yt-dlp.

    Args:
        task_metadata: The metadata object for the task.
        quality: Desired quality ('best', '1080p', '720p', '360p').
        base_dir_str: The base directory where task data is stored (string path).

    Returns:
        The relative path to the downloaded media file (relative to backend dir).

    Raises:
        FileNotFoundError: If the task directory doesn't exist or download fails.
        ValueError: If the quality string is invalid (though currently defaults).
        yt_dlp.utils.DownloadError: If yt-dlp fails to download the media.
        Exception: For other unexpected errors.
    """
    base_dir = Path(base_dir_str)
    task_uuid_str = str(task_metadata.uuid)
    url = task_metadata.url
    uuid_dir = base_dir / task_uuid_str
    backend_dir = base_dir.parent

    if not uuid_dir.is_dir():
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    format_string = get_format_string(quality)
    # Define output template including quality
    output_filename_base = f"video_{quality}"
    if quality == 'bestaudio':
        output_filename_base = f"audio_{quality}"

    # Construct absolute base path for output template
    output_template_base_path = uuid_dir / output_filename_base
    # yt-dlp needs the template string including extension placeholder
    output_template_str = f"{str(output_template_base_path)}.%(ext)s"

    ydl_opts = {
        'format': format_string,
        'outtmpl': output_template_str,
        'quiet': False,
        'no_warnings': True,
        'ignoreerrors': False,
        'merge_output_format': 'mp4',
        # 'external_downloader': 'aria2c', # Removed as per user request
        # 'external_downloader_args': ['-x', '16', '-s', '16', '-k', '1M'], # Removed for HLS compatibility
    }

    loop = asyncio.get_event_loop()
    downloaded_file_path_abs: Path | None = None

    try:
        logger.info(f"Attempting to download media for {url} (Quality: {quality}) to {uuid_dir}")
        
        await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_opts).download([url]))

        # Find the downloaded file using pathlib.glob
        search_pattern = f"{output_filename_base}.*"
        found_files_abs = list(uuid_dir.glob(search_pattern))
        
        if not found_files_abs:
             logger.warning(f"Could not find exact match for {search_pattern} - checking for any video/audio file.")
             # Simple check for common extensions if exact match fails
             extensions = ['.mp4', '.mkv', '.webm', '.m4a', '.mp3', '.wav']
             for item in uuid_dir.iterdir():
                 if item.is_file() and item.suffix.lower() in extensions:
                    found_files_abs = [item] # Treat as list
                    logger.warning(f"Found potential match: {item}")
                    break # Take the first one found
        
        if found_files_abs:
            # Assume the first match is the correct one
            downloaded_file_path_abs = found_files_abs[0]
            # Calculate relative path from backend_dir using pathlib, store as string
            relative_path = str(downloaded_file_path_abs.relative_to(backend_dir))
            logger.info(f"Successfully downloaded media to {downloaded_file_path_abs}")

            # logger.info(f"Download complete. File info: {info_dict}") # info_dict not available here

            # --- Determine final filename and path --- 
            # Use the path we found after download, not from info_dict
            original_filename = downloaded_file_path_abs 
            original_extension = original_filename.suffix # e.g., .mp4, .m4a

            # --- REMOVED: Custom Naming Logic for Xiaoyuzhou --- 
            # The final extension will now always be the original extension from yt-dlp
            final_extension = original_extension 
            
            # Determine filename stem based on quality
            final_filename_stem = f"video_{quality}"
            if quality == 'bestaudio': # Keep this check if bestaudio is a possible quality
                 final_filename_stem = f"audio_{quality}"
            
            final_filename = f"{final_filename_stem}{final_extension}"
            final_absolute_path = uuid_dir / final_filename
            final_relative_path = final_absolute_path.relative_to(base_dir)

            # --- Rename/Move downloaded file --- 
            # Ensure we are comparing resolved absolute paths
            if original_filename.resolve() != final_absolute_path.resolve():
                try:
                    # Ensure parent directory exists (should already, but safe)
                    final_absolute_path.parent.mkdir(parents=True, exist_ok=True)
                    # Move using string paths
                    shutil.move(str(original_filename), str(final_absolute_path))
                    logger.info(f"Renamed/Moved downloaded file to {final_absolute_path}")
                except (OSError, shutil.Error) as move_err:
                     logger.error(f"Error moving/renaming downloaded file from {original_filename} to {final_absolute_path}: {move_err}")
                     # If move fails, delete the original temporary file if possible?
                     if original_filename.exists():
                          try: original_filename.unlink() 
                          except OSError: pass
                     raise IOError(f"Failed to finalize downloaded file: {move_err}") from move_err
            else:
                 logger.info(f"Downloaded file path {original_filename} already matches final path: {final_absolute_path}")

            # Return the relative path with the potentially modified extension
            return str(final_relative_path).replace("\\", "/")

        else:
            raise FileNotFoundError(f"Media download failed for {url}, file not found in {uuid_dir} after download attempt.")

    except yt_dlp.utils.DownloadError as e:
        logger.error(f"yt-dlp error downloading media for {url} (Quality: {quality}): {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error during download_media for {url} (Quality: {quality}): {e}")
        raise 