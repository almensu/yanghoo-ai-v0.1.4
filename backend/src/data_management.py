import os
import logging
from typing import Dict, Any
# from pathlib import Path # Remove pathlib import

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# DATA_DIR can be passed as an argument or kept global if consistently used from main.py's context
# Let's assume it might be passed for flexibility
# DATA_DIR = 'backend/data'

def _delete_file_if_exists(file_path: str): # Argument type hint changed to str
    """Helper to delete a file, logging success or failure."""
    if os.path.exists(file_path): # Use os.path.exists
        try:
            os.remove(file_path) # Use os.remove
            logging.info(f"Deleted file: {file_path}")
            return True
        except OSError as e:
            logging.error(f"Error deleting file {file_path}: {e}")
            return False
    else:
        logging.warning(f"File not found, skipping deletion: {file_path}")
        return True # Treat non-existent file as a successful deletion for metadata update purposes

def delete_video_files_sync(uuid: str, entry: Dict[str, Any], data_dir: str) -> Dict[str, Any]: # Argument type hint changed to str
    """
    Deletes video files found in the entry's 'media_files' dictionary.
    Updates the 'media_files' in the entry dictionary only if deletion succeeds.
    Sets 'media_files' to an empty dict if all videos are successfully processed.
    Expects 'data_dir' to be a string path to the base data directory (e.g., /path/to/backend/data).
    """
    if 'media_files' in entry and isinstance(entry['media_files'], dict):
        media_files_dict = entry['media_files']
        keys_to_remove = []
        # Assume base_dir is the parent of data_dir (e.g., /path/to/backend)
        base_dir = os.path.dirname(data_dir) # Use os.path.dirname
        
        for quality, path_str in list(media_files_dict.items()):
            if path_str:
                # Construct path relative to the base_dir (backend directory)
                full_path = os.path.join(base_dir, path_str) # Use os.path.join
                if _delete_file_if_exists(full_path):
                    # Only mark for removal if deletion was successful or file didn't exist
                    keys_to_remove.append(quality)
                # else: If deletion failed (e.g., permissions), do not remove from metadata
            else:
                # If path was already null/empty, consider it processed for removal
                 keys_to_remove.append(quality)

        # Remove the keys for successfully processed/deleted files
        for key in keys_to_remove:
            if key in media_files_dict:
                 del media_files_dict[key]
                 
        # Set to empty dict only if all original keys were processed and removed
        # Note: This might leave the dict non-empty if some deletions failed
        # If the intention is to set to {} only if ALL are gone, this logic is okay.
        # If the dict becomes empty ONLY because all items were successfully processed...
        # A check might be needed here if partial failure should prevent setting to {}.
        # Current logic: if the dict ends up empty for any reason after removals, set to {}
        if not media_files_dict: 
            entry['media_files'] = {} 
        
    logging.info(f"Finished video file deletion process for UUID {uuid}. Keys removed: {keys_to_remove}")
    return entry

def delete_audio_file_sync(uuid: str, entry: Dict[str, Any], data_dir: str) -> Dict[str, Any]: # Argument type hint changed to str
    """
    Deletes the audio file specified in 'extracted_wav_path'.
    Updates 'extracted_wav_path' to None only if deletion succeeds.
    Expects 'data_dir' to be a string path to the base data directory (e.g., /path/to/backend/data).
    """
    deleted_successfully = False
    if 'extracted_wav_path' in entry and entry['extracted_wav_path']:
        path_str = entry['extracted_wav_path']
        # Assume base_dir is the parent of data_dir (e.g., /path/to/backend)
        base_dir = os.path.dirname(data_dir) # Use os.path.dirname
        # Construct path relative to the base_dir
        full_path = os.path.join(base_dir, path_str) # Use os.path.join
        if _delete_file_if_exists(full_path):
             deleted_successfully = True
        # else: If deletion failed, do not update metadata
    else:
        # If path was already None or empty, consider it a success for metadata purposes
        deleted_successfully = True
        
    # Update metadata only if deletion was successful or path was already null/empty
    if deleted_successfully:
        entry['extracted_wav_path'] = None
        logging.info(f"Successfully processed audio file for UUID {uuid}. Set path to None.")
    else:
        logging.warning(f"Failed to delete audio file for UUID {uuid}. Metadata unchanged.")

    return entry

# Removed the if __name__ == '__main__': block
# Example usage would now be handled by the caller (e.g., the API endpoint) 