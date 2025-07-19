import os
import logging
from typing import Dict, Any
from pathlib import Path # Added pathlib import

# Add DATA_DIR definition
DATA_DIR = Path(os.environ.get("DATA_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "backend", "data")))

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def _delete_file_if_exists(file_path: Path): # Argument type hint changed to Path
    """Helper to delete a file, logging success or failure."""
    try:
        if file_path.exists(): # Use pathlib
            file_path.unlink() # Use pathlib
            logging.info(f"Deleted file: {file_path}")
            return True
        else:
            logging.warning(f"File not found, skipping deletion: {file_path}")
            return True # Treat non-existent file as a successful deletion
    except OSError as e:
        logging.error(f"Error deleting file {file_path}: {e}")
        return False

def delete_video_files_sync(uuid: str, entry: Dict[str, Any], data_dir: str) -> Dict[str, Any]:
    """
    Deletes video files found in the entry's 'media_files' dictionary.
    Updates the 'media_files' in the entry dictionary only if deletion succeeds.
    Sets 'media_files' to an empty dict if all videos are successfully processed.
    Expects 'data_dir' to be a string path to the base data directory.
    """
    if 'media_files' in entry and isinstance(entry['media_files'], dict):
        media_files_dict = entry['media_files']
        keys_to_remove = []
        # Assume base_dir is the parent of data_dir (e.g., /path/to/backend)
        # data_dir is typically backend/data, so its parent is backend
        base_path = Path(data_dir).parent # Use pathlib

        for quality, path_str in list(media_files_dict.items()):
            if path_str:
                # Construct path relative to the base_path (backend directory)
                full_path = base_path / path_str # Use pathlib
                if _delete_file_if_exists(full_path):
                    keys_to_remove.append(quality)
            else:
                keys_to_remove.append(quality)

        # Remove the keys for successfully processed/deleted files
        for key in keys_to_remove:
            if key in media_files_dict:
                 del media_files_dict[key]

        if not media_files_dict:
            entry['media_files'] = {}

    logging.info(f"Finished video file deletion process for UUID {uuid}. Keys removed: {keys_to_remove}")
    return entry

def delete_audio_file_sync(uuid: str, entry: Dict[str, Any], data_dir: str) -> Dict[str, Any]:
    """
    Deletes the audio file specified in 'extracted_wav_path'.
    Updates 'extracted_wav_path' to None only if deletion succeeds.
    Expects 'data_dir' to be a string path to the base data directory.
    """
    deleted_successfully = False
    if 'extracted_wav_path' in entry and entry['extracted_wav_path']:
        path_str = entry['extracted_wav_path']
        # Assume base_dir is the parent of data_dir
        base_path = Path(data_dir).parent # Use pathlib
        # Construct path relative to the base_path
        full_path = base_path / path_str # Use pathlib
        if _delete_file_if_exists(full_path):
             deleted_successfully = True
    else:
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