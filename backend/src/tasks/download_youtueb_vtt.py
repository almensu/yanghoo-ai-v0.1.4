import json
import os
import requests
import logging
from pathlib import Path
import threading
import asyncio

# Assuming fetch_info_json is in the same directory or adjust path
from .fetch_info_json import run_fetch_info_json
from ..schemas import TaskMetadata # Import TaskMetadata

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Use a lock for metadata file operations to prevent race conditions if run concurrently
metadata_lock = threading.Lock()

# Make the function async and accept TaskMetadata
async def download_youtube_vtt(task_meta: TaskMetadata, metadata_file: str = "backend/data/metadata.json") -> dict:
    """
    Downloads VTT subtitles for a given YouTube video TaskMetadata.
    Attempts to parse info.json, download VTTs. If a 404 occurs,
    attempts to refresh info.json and retry the download once.

    Args:
        task_meta: The metadata object for the task.
        metadata_file: Path to the main metadata JSON file.
    """
    video_uuid = str(task_meta.uuid)
    logging.info(f"Attempting to download VTT for UUID: {video_uuid}")

    downloaded_files = {} # Store successfully downloaded files
    base_dir = Path(metadata_file).parent # data directory
    video_dir = base_dir / video_uuid

    try:
        # Use task_meta directly
        if task_meta.platform != "youtube":
            logging.warning(f"Video {video_uuid} is not from YouTube. Skipping VTT download.")
            return {}

        # Function to get VTT URLs from current info.json
        def get_vtt_urls_from_info(info_json_path: Path) -> dict:
            urls = {}
            target_langs = {"zh-Hans": ["zh-Hans"], "en": ["en", "en-orig"]}
            try:
                if not info_json_path.exists():
                    logging.warning(f"Info JSON file not found at {info_json_path} during URL extraction.")
                    return {}
                with open(info_json_path, 'r') as f:
                    info_data = json.load(f)
                
                captions = info_data.get("automatic_captions", {}) 
                if not captions:
                    logging.warning(f"No automatic captions found in {info_json_path}.")
                    return {}

                for target_code, potential_keys in target_langs.items():
                    found_url = None
                    for key in potential_keys:
                        if key in captions and isinstance(captions[key], list):
                            for entry in captions[key]:
                                if entry.get("ext") == "vtt" and entry.get("url"):
                                    found_url = entry["url"]
                                    break 
                            if found_url:
                                break
                    if found_url:
                        urls[target_code] = found_url
                    else:
                        logging.warning(f"Could not find VTT URL for '{target_code}' in {info_json_path}")
                return urls
            except (json.JSONDecodeError, IOError) as e:
                logging.error(f"Error reading/parsing {info_json_path}: {e}")
                return {}

        # --- Initial Attempt --- 
        info_json_path_str = task_meta.info_json_path
        if not info_json_path_str:
            logging.error(f"info_json_path not set in metadata for video {video_uuid}. Cannot proceed.")
            return {}
            
        info_json_abs_path = base_dir.parent / info_json_path_str # Path relative to backend dir
        initial_vtt_urls = get_vtt_urls_from_info(info_json_abs_path)

        if not initial_vtt_urls:
            logging.warning(f"No VTT URLs found in initial info.json ({info_json_abs_path}) for {video_uuid}. Cannot download.")
            # Attempt refresh anyway?
            # Let's proceed, the refresh logic might fix it if info.json was missing/bad

        target_langs_to_try = list(initial_vtt_urls.keys()) if initial_vtt_urls else ["zh-Hans", "en"] # Try both if initial parse failed

        for lang_code in target_langs_to_try:
            url_to_download = initial_vtt_urls.get(lang_code)
            if not url_to_download:
                logging.warning(f"No initial URL for {lang_code}, skipping first attempt.")
                # Trigger refresh logic below if needed?
                # For now, just skip if no initial URL
                continue 

            output_filename = f"transcript_{lang_code}.vtt"
            output_path = video_dir / output_filename
            relative_output_path = Path("data") / video_uuid / output_filename

            try:
                logging.info(f"Attempt 1: Downloading {lang_code} VTT from {url_to_download} to {output_path}")
                response = requests.get(url_to_download, timeout=30)
                response.raise_for_status()
                with open(output_path, 'wb') as f:
                    f.write(response.content)
                downloaded_files[lang_code] = str(relative_output_path).replace("\\", "/")
                logging.info(f"Attempt 1: Successfully downloaded {lang_code} VTT for {video_uuid}")

            except requests.exceptions.RequestException as e:
                is_404 = isinstance(e, requests.exceptions.HTTPError) and e.response.status_code == 404
                if is_404:
                    logging.warning(f"Attempt 1: Failed to download {lang_code} VTT (404 Not Found). Refreshing info.json and retrying...")
                    try:
                        # --- Refresh info.json --- 
                        await run_fetch_info_json(task_meta, str(base_dir))
                        logging.info(f"Refreshed info.json for {video_uuid}")

                        # --- Re-read and Re-extract URL --- 
                        refreshed_vtt_urls = get_vtt_urls_from_info(info_json_abs_path)
                        new_url = refreshed_vtt_urls.get(lang_code)

                        if new_url:
                            logging.info(f"Attempt 2: Retrying download for {lang_code} with new URL: {new_url}")
                            try:
                                response = requests.get(new_url, timeout=30)
                                response.raise_for_status()
                                with open(output_path, 'wb') as f:
                                    f.write(response.content)
                                downloaded_files[lang_code] = str(relative_output_path).replace("\\", "/")
                                logging.info(f"Attempt 2: Successfully downloaded {lang_code} VTT for {video_uuid}")
                            except requests.exceptions.RequestException as e2:
                                logging.error(f"Attempt 2: Failed to download {lang_code} VTT after refresh: {e2}")
                            except IOError as e2:
                                logging.error(f"Attempt 2: Failed to save {lang_code} VTT file after refresh: {e2}")
                        else:
                             logging.error(f"Attempt 2: Could not find URL for {lang_code} even after refreshing info.json.")
                    except Exception as refresh_err:
                        logging.error(f"Error during info.json refresh or retry for {lang_code}: {refresh_err}")
                else:
                    # Initial download failed with non-404 error
                    logging.error(f"Attempt 1: Failed to download {lang_code} VTT (non-404 error): {e}")
            except IOError as e:
                 logging.error(f"Attempt 1: Failed to save {lang_code} VTT file to {output_path}: {e}")

        # --- Update Metadata ---
        if downloaded_files:
            with metadata_lock:
                # Re-read metadata within the lock to ensure we have the latest version
                try:
                    with open(metadata_file, 'r') as f:
                        current_metadata = json.load(f)
                except (FileNotFoundError, json.JSONDecodeError) as e:
                    logging.error(f"Error reading metadata file {metadata_file} before update: {e}")
                    return {} # Cannot update if we can't read

                if video_uuid in current_metadata:
                    if "vtt_files" not in current_metadata[video_uuid] or not isinstance(current_metadata[video_uuid]["vtt_files"], dict) :
                         current_metadata[video_uuid]["vtt_files"] = {}

                    # Update with newly downloaded files
                    current_metadata[video_uuid]["vtt_files"].update(downloaded_files)

                    try:
                        with open(metadata_file, 'w') as f:
                            json.dump(current_metadata, f, indent=4, ensure_ascii=False)
                        logging.info(f"Successfully updated metadata for {video_uuid} with VTT paths: {downloaded_files}")
                    except IOError as e:
                        logging.error(f"Failed to write updated metadata to {metadata_file}: {e}")
                else:
                    logging.error(f"Video UUID {video_uuid} disappeared from metadata between read and write. Update failed.")

        # Return the dictionary of successfully downloaded files (relative paths)
        return downloaded_files

    except FileNotFoundError:
        logging.error(f"Metadata file not found at {metadata_file}")
        return {} # Return empty dict on error
    except json.JSONDecodeError:
        logging.error(f"Error decoding JSON from {metadata_file} or info.json")
        return {} # Return empty dict on error
    except Exception as e:
        logging.error(f"An unexpected error occurred during VTT download for {video_uuid}: {e}", exc_info=True)
        return {} # Return empty dict on unexpected error


# Example Usage (you would call this from your main application logic/API endpoint)
if __name__ == '__main__':
    # Make sure the example UUID exists in your metadata.json
    example_uuid = "fba84152-918a-4f4b-a22f-86775cc32d68"
    metadata_path = Path(__file__).parent.parent.parent / "data" / "metadata.json" # Adjust path relative to this script

    if not metadata_path.exists():
         print(f"Error: metadata.json not found at expected location: {metadata_path}")
    else:
         print(f"Running example download for UUID: {example_uuid} using metadata: {metadata_path}")
         download_youtube_vtt(example_uuid, metadata_file=str(metadata_path))
         print("Example download process finished.")
