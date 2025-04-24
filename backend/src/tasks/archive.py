import json
import os
import logging
from pathlib import Path
import threading
from typing import Dict, Optional, List

# Add imports for fetching data
import yt_dlp
import requests

logger = logging.getLogger(__name__)

# Use a single lock for simplicity, assuming archive/restore are less frequent
# If high concurrency is expected, consider separate locks per file.
metadata_lock = threading.Lock()

# Define expected structure for archived entry (simple dict)
ArchivedEntry = Dict[str, str | bool]

def archive_task_sync(task_uuid: str, metadata_file: str, archive_file: str):
    """
    Moves a task from the main metadata file to the archive file.

    Args:
        task_uuid: The UUID of the task to archive.
        metadata_file: Path to the main metadata JSON.
        archive_file: Path to the archive metadata JSON.
    
    Raises:
        FileNotFoundError: If the task UUID is not found in the main metadata.
        IOError: If file reading/writing fails.
        Exception: For other unexpected errors.
    """
    logger.info(f"Attempting to archive task {task_uuid}")
    with metadata_lock:
        # --- Load existing metadata --- 
        try:
            with open(metadata_file, 'r') as f:
                main_metadata = json.load(f)
        except FileNotFoundError:
             logger.error(f"Main metadata file not found: {metadata_file}")
             raise # Re-raise to be caught by endpoint
        except json.JSONDecodeError as e:
             logger.error(f"Error decoding main metadata file {metadata_file}: {e}")
             raise IOError(f"Error reading main metadata: {e}")

        # --- Load or initialize archive metadata ---
        archived_metadata: Dict[str, ArchivedEntry] = {}
        if Path(archive_file).exists():
            try:
                with open(archive_file, 'r') as f:
                    content = f.read()
                    if content.strip(): # Check if file is not empty
                        archived_metadata = json.loads(content)
            except json.JSONDecodeError as e:
                logger.error(f"Error decoding archive metadata file {archive_file}: {e}, starting fresh.")
            except IOError as e:
                 logger.error(f"Error reading archive metadata file {archive_file}: {e}, starting fresh.")
        
        # --- Check if task exists --- 
        if task_uuid not in main_metadata:
            logger.warning(f"Task UUID {task_uuid} not found in {metadata_file} for archiving.")
            raise FileNotFoundError(f"Task UUID {task_uuid} not found")
        
        task_to_archive = main_metadata[task_uuid]
        
        # --- Prepare archived entry --- 
        url_to_archive = task_to_archive.get("url")
        if not url_to_archive:
            logger.warning(f"Task {task_uuid} has no URL. Cannot check for duplicate URL in archive. Proceeding with caution.")
            # Or decide to raise an error if URL is mandatory for archiving
            # raise ValueError(f"Task {task_uuid} is missing a URL, cannot archive.")
        
        entry: ArchivedEntry = {
            "uuid": task_uuid,
            "url": url_to_archive or "URL_NOT_FOUND", # Use the retrieved URL
            "archived": True
            # Add any other essential fields you want to preserve, e.g., title
            # "title": task_to_archive.get("title", "TITLE_NOT_FOUND") 
        }
        
        # --- Check for Duplicate URL in Archive --- 
        if url_to_archive: # Only check if we have a URL
            for existing_uuid, existing_entry in archived_metadata.items():
                if existing_entry.get("url") == url_to_archive:
                    logger.warning(f"Archive failed: URL '{url_to_archive}' from task {task_uuid} already exists in archive under UUID {existing_uuid}.")
                    # Raise a specific error to be caught by the endpoint
                    raise ValueError(f"URL '{url_to_archive}' is already archived.") 
        
        # --- Update archive file data --- 
        archived_metadata[task_uuid] = entry
        try:
            with open(archive_file, 'w') as f:
                json.dump(archived_metadata, f, indent=4, ensure_ascii=False)
            logger.info(f"Updated archive file {archive_file} with task {task_uuid}")
        except IOError as e:
            logger.error(f"Failed to write updated archive metadata to {archive_file}: {e}")
            # Don't necessarily fail the whole operation if only archive write fails?
            # For now, let's still raise, but this could be reconsidered.
            raise # Re-raise to signal failure

        # --- Modify main metadata: Set archived flag --- 
        main_metadata[task_uuid]["archived"] = True # Set flag to true
        logger.info(f"Set archived=true for task {task_uuid} in main metadata.")
        
        try:
            with open(metadata_file, 'w') as f:
                # Assume main_metadata holds dicts compatible with TaskMetadata
                # If loaded/saved via Pydantic in endpoint, this direct dump might need pydantic_encoder
                # Let's stick to json.dump standard types for now
                json.dump(main_metadata, f, indent=4, ensure_ascii=False, default=str) 
            logger.info(f"Updated main metadata file {metadata_file} with archived status for {task_uuid}")
        except IOError as e:
            logger.error(f"Failed to write updated main metadata to {metadata_file}: {e}")
            # If this fails, the state is inconsistent (marked archived in memory, maybe written to archive, but not saved in main)
            # Attempting rollback is complex. Raising is the safest default.
            raise # Re-raise to signal failure
            
        # --- Return the modified task data --- 
        return main_metadata[task_uuid] # Return the updated dictionary

def restore_archived_tasks_sync(metadata_file: str, archive_file: str) -> Optional[List[str]]:
    """
    Restores tasks from the archive file to the main metadata file,
    ONLY if the main metadata file is empty.

    Args:
        metadata_file: Path to the main metadata JSON.
        archive_file: Path to the archive metadata JSON.

    Returns:
        List of restored task UUIDs on success.
        None if the main metadata file was not empty.
        Empty list [] if archive is empty or non-existent.
    
    Raises:
        IOError: If critical file reading/writing fails.
        Exception: For other unexpected errors.
    """
    logger.info(f"Attempting to restore tasks from {archive_file} to {metadata_file}")
    with metadata_lock:
        # --- Check if main metadata is empty --- 
        main_metadata = {}
        if Path(metadata_file).exists():
            try:
                with open(metadata_file, 'r') as f:
                    content = f.read()
                    if content.strip(): # Check if not empty
                        main_metadata = json.loads(content)
                        if main_metadata: # Double check if it parsed to a non-empty dict/list
                            logger.warning(f"Restore aborted: Main metadata file {metadata_file} is not empty.")
                            return None # Indicate non-empty state
            except json.JSONDecodeError as e:
                 logger.error(f"Error decoding potentially non-empty main metadata {metadata_file}: {e}. Treating as non-empty.")
                 return None # Abort if main file is corrupt/non-empty
            except IOError as e:
                logger.error(f"Error reading main metadata file {metadata_file}: {e}")
                raise # Re-raise as it's unexpected
        
        # --- Load archive metadata --- 
        archived_metadata: Dict[str, ArchivedEntry] = {}
        try:
            if Path(archive_file).exists():
                 with open(archive_file, 'r') as f:
                    content = f.read()
                    if content.strip():
                        archived_metadata = json.loads(content)
        except FileNotFoundError:
             logger.warning(f"Archive file {archive_file} not found. Nothing to restore.")
             return [] # Return empty list
        except json.JSONDecodeError as e:
            logger.error(f"Error decoding archive metadata file {archive_file}: {e}. Cannot restore.")
            return [] # Return empty list 
        except IOError as e:
             logger.error(f"Error reading archive metadata file {archive_file}: {e}")
             raise # Re-raise critical error

        if not archived_metadata:
            logger.info("Archive metadata is empty. Nothing to restore.")
            return [] # Return empty list

        # --- Restore tasks --- 
        restored_uuids: List[str] = [] # List to store UUIDs
        ydl_opts = {
            'quiet': True,
            'skip_download': True, 
            'extract_flat': True, 
            'force_generic_extractor': False, 
        }
        base_data_dir = Path(metadata_file).parent

        for task_uuid, archived_entry in archived_metadata.items():
            if task_uuid in main_metadata:
                logger.warning(f"Skipping restore for {task_uuid} as it already exists in main metadata (should not happen).")
                continue
            
            url = archived_entry.get("url")
            if not url:
                logger.warning(f"Skipping restore for {task_uuid} as it has no URL in archive.")
                continue
                
            # Prepare defaults
            task_title = f"Restored Task {task_uuid[:8]}"
            task_thumbnail_rel_path = None
            task_platform = "unknown"
            task_dir = base_data_dir / task_uuid
            task_dir.mkdir(parents=True, exist_ok=True) # Ensure directory exists

            logger.info(f"Processing restore for {task_uuid} (URL: {url})")
            try:
                # Attempt to fetch basic info
                with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                    info_dict = ydl.extract_info(url, download=False)
                    
                    # Update title if found
                    fetched_title = info_dict.get('title')
                    if fetched_title:
                        task_title = fetched_title
                        logger.info(f"  -> Fetched title: {task_title}")
                    else:
                        logger.warning(f"  -> Could not extract title for {task_uuid}")
                        
                    # Update platform if possible
                    extractor_key = info_dict.get('extractor_key', '').lower()
                    if 'youtube' in extractor_key:
                        task_platform = "youtube"
                    elif 'twitter' in extractor_key:
                         task_platform = "twitter"
                    # Add other platforms if needed
                    else:
                         task_platform = extractor_key if extractor_key else "unknown"
                    logger.info(f"  -> Deduced platform: {task_platform}")
                        
                    # Attempt to download thumbnail if URL exists
                    thumbnail_url = info_dict.get('thumbnail')
                    if thumbnail_url:
                        logger.info(f"  -> Found thumbnail URL: {thumbnail_url}")
                        try:
                            thumb_response = requests.get(thumbnail_url, stream=True, timeout=15)
                            thumb_response.raise_for_status()
                            
                            # Basic extension guessing (can be improved)
                            content_type = thumb_response.headers.get('content-type', '').lower()
                            if 'webp' in content_type:
                                ext = ".webp"
                            elif 'jpeg' in content_type or 'jpg' in content_type:
                                ext = ".jpg"
                            elif 'png' in content_type:
                                 ext = ".png"
                            else:
                                 ext = ".jpg" # Default fallback
                                 logger.warning(f"  -> Unknown thumbnail content type '{content_type}', defaulting to .jpg")
                            
                            thumb_filename = f"thumbnail{ext}"
                            thumb_abs_path = task_dir / thumb_filename
                            
                            with open(thumb_abs_path, 'wb') as f_thumb:
                                for chunk in thumb_response.iter_content(chunk_size=8192):
                                    f_thumb.write(chunk)
                                    
                            task_thumbnail_rel_path = str(Path("data") / task_uuid / thumb_filename).replace("\\", "/")
                            logger.info(f"  -> Successfully downloaded thumbnail to {task_thumbnail_rel_path}")
                            
                        except requests.exceptions.RequestException as thumb_e:
                             logger.warning(f"  -> Failed to download thumbnail for {task_uuid}: {thumb_e}")
                        except IOError as thumb_ioe:
                             logger.warning(f"  -> Failed to save thumbnail for {task_uuid}: {thumb_ioe}")
                    else:
                        logger.info(f"  -> No thumbnail URL found in info for {task_uuid}")
                        
            except yt_dlp.utils.DownloadError as ydl_e:
                 logger.warning(f"Failed to extract info for {url} (task {task_uuid}): {ydl_e}. Using placeholders.")
            except Exception as e:
                 logger.error(f"Unexpected error processing {url} (task {task_uuid}): {e}", exc_info=True)
                 # Continue with placeholders

            # Create the entry for main_metadata
            main_metadata[task_uuid] = {
                "uuid": task_uuid,
                "url": url,
                "platform": task_platform, # Use deduced or 'unknown'
                "title": task_title, # Use fetched or placeholder
                "thumbnail_path": task_thumbnail_rel_path, # Use downloaded path or None
                # Set other fields to default/empty states
                "info_json_path": None,
                "media_files": {},
                "extracted_wav_path": None,
                "vtt_files": {},
                "whisperx_json_path": None,
                "transcription_model": None,
                "merged_vtt_md_path": None,
                "merged_whisperx_md_path": None,
                "archived": False # Restored tasks are not archived by default
            }
            restored_uuids.append(task_uuid) # Add UUID to the list
        
        if restored_uuids: # Check if list is not empty
            try:
                with open(metadata_file, 'w') as f:
                    json.dump(main_metadata, f, indent=4, ensure_ascii=False)
                logger.info(f"Successfully wrote {len(restored_uuids)} restored tasks to {metadata_file}")
            except IOError as e:
                logger.error(f"Failed to write restored metadata to {metadata_file}: {e}")
                raise # Re-raise critical error
        
        return restored_uuids # Return the list of UUIDs 