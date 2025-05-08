import json
import os
import requests
import logging
from pathlib import Path
import threading
import asyncio
import aiofiles # Import aiofiles for async file operations

# Assuming fetch_info_json is in the same directory or adjust path
from .fetch_info_json import run_fetch_info_json
from ..schemas import TaskMetadata # Import TaskMetadata
from ..utils.vtt_utils import normalize_vtt_content # Import the normalization function

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Use an asyncio Lock for metadata file operations
metadata_lock = asyncio.Lock()

# Make the function async and accept TaskMetadata
async def download_youtube_vtt(task_meta: TaskMetadata, metadata_file: str = "backend/data/metadata.json") -> dict:
    """
    Downloads VTT subtitles for a given YouTube video TaskMetadata.
    Attempts to parse info.json, download VTTs. If a 404 occurs,
    attempts to refresh info.json and retry the download once.
    **Also normalizes the downloaded VTT content immediately.**

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

        # --- Refactored download and normalize function --- 
        async def download_and_normalize(lang: str, url: str, output_path: Path):
            """Downloads, normalizes, and saves the VTT file."""
            try:
                response = await asyncio.to_thread(requests.get, url, timeout=30)
                response.raise_for_status()
                # Read content, normalize it
                original_content = response.text # Use .text for string content
                normalized_content = normalize_vtt_content(original_content)
                
                # Write normalized content back to the file asynchronously
                async with aiofiles.open(output_path, 'w', encoding='utf-8') as f:
                    await f.write(normalized_content)
                return True
            except requests.exceptions.RequestException as e:
                logging.error(f"Failed to download {lang} VTT from {url}: {e}")
                # Re-raise specific errors for retry logic if needed
                if isinstance(e, requests.exceptions.HTTPError) and e.response.status_code == 404:
                    raise e # Re-raise 404 for the retry mechanism
                return False
            except IOError as e:
                logging.error(f"Failed to save normalized {lang} VTT file to {output_path}: {e}")
                return False
            except Exception as e:
                logging.error(f"Unexpected error during download/normalization for {lang} at {output_path}: {e}", exc_info=True)
                return False
        # --- End refactored function --- 

        # Function to get VTT URLs from current info.json
        def get_vtt_urls_from_info(info_json_path: Path) -> dict:
            urls = {}
            target_langs = {"zh-Hans": ["zh-Hans"], "en": ["en-orig", "en"]}
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
            
        info_json_abs_path = base_dir / info_json_path_str # Path relative to data dir (base_dir)
        initial_vtt_urls = get_vtt_urls_from_info(info_json_abs_path)

        if not initial_vtt_urls:
            logging.warning(f"No VTT URLs found in initial info.json ({info_json_abs_path}) for {video_uuid}. Attempting refresh.")
            # Attempt refresh logic will handle this case

        target_langs_to_try = list(initial_vtt_urls.keys()) if initial_vtt_urls else ["zh-Hans", "en"] # Try both if initial parse failed

        for lang_code in target_langs_to_try:
            url_to_download = initial_vtt_urls.get(lang_code)
            output_filename = f"transcript_{lang_code}.vtt"
            output_path = video_dir / output_filename
            relative_output_path = output_path.relative_to(base_dir)

            if not url_to_download:
                logging.warning(f"No initial URL for {lang_code}, attempting refresh...")
                # Fall through to retry logic
                needs_retry = True
            else:
                logging.info(f"Attempt 1: Downloading and normalizing {lang_code} VTT from {url_to_download} to {output_path}")
                try:
                    success = await download_and_normalize(lang_code, url_to_download, output_path)
                    if success:
                        downloaded_files[lang_code] = str(relative_output_path).replace("\\", "/")
                        logging.info(f"Attempt 1: Successfully downloaded and normalized {lang_code} VTT for {video_uuid}")
                        needs_retry = False # Success, no retry needed
                    else:
                        # Download failed, but might not be 404, check exception type if needed
                        needs_retry = False # Assume non-404 failures don't need retry here
                except requests.exceptions.HTTPError as e:
                    # Explicitly catch re-raised 404
                    if e.response.status_code == 404:
                        logging.warning(f"Attempt 1: Failed to download {lang_code} VTT (404 Not Found). Refreshing info.json and retrying...")
                        needs_retry = True
                    else:
                        logging.error(f"Attempt 1: HTTP error for {lang_code}: {e}")
                        needs_retry = False # Other HTTP errors, don't retry
                except Exception as e:
                    # Catch potential errors from download_and_normalize itself
                    logging.error(f"Unexpected error during Attempt 1 for {lang_code}: {e}")
                    needs_retry = False

            # --- Retry Logic --- 
            if needs_retry:
                 try:
                    logging.info(f"Attempting info.json refresh for {video_uuid} before retrying {lang_code}...")
                    await run_fetch_info_json(task_meta, str(base_dir))
                    logging.info(f"Refreshed info.json for {video_uuid}")

                    refreshed_vtt_urls = get_vtt_urls_from_info(info_json_abs_path)
                    new_url = refreshed_vtt_urls.get(lang_code)

                    if new_url:
                        logging.info(f"Attempt 2: Retrying download and normalization for {lang_code} with new URL: {new_url}")
                        success_retry = await download_and_normalize(lang_code, new_url, output_path)
                        if success_retry:
                             downloaded_files[lang_code] = str(relative_output_path).replace("\\", "/")
                             logging.info(f"Attempt 2: Successfully downloaded and normalized {lang_code} VTT for {video_uuid}")
                        else:
                             logging.error(f"Attempt 2: Failed to download/normalize {lang_code} VTT after refresh.")
                    else:
                         logging.error(f"Attempt 2: Could not find URL for {lang_code} even after refreshing info.json.")
                 except Exception as refresh_err:
                    logging.error(f"Error during info.json refresh or retry for {lang_code}: {refresh_err}")

        # --- Update Metadata (Using Async Lock) ---
        if downloaded_files:
            async with metadata_lock:
                try:
                    # Use aiofiles for async read/write
                    async with aiofiles.open(metadata_file, 'r', encoding='utf-8') as f:
                        content = await f.read()
                        current_metadata = json.loads(content)
                except (FileNotFoundError, json.JSONDecodeError) as e:
                    logging.error(f"Error reading metadata file {metadata_file} before update: {e}")
                    return {} 

                if video_uuid in current_metadata:
                    if "vtt_files" not in current_metadata[video_uuid] or not isinstance(current_metadata[video_uuid]["vtt_files"], dict) :
                         current_metadata[video_uuid]["vtt_files"] = {}

                    current_metadata[video_uuid]["vtt_files"].update(downloaded_files)

                    try:
                        async with aiofiles.open(metadata_file, 'w', encoding='utf-8') as f:
                            # Use default=str for Path objects if any sneak in, though shouldn't here
                            await f.write(json.dumps(current_metadata, indent=4, ensure_ascii=False, default=str))
                        logging.info(f"Successfully updated metadata for {video_uuid} with VTT paths: {downloaded_files}")
                    except IOError as e:
                        logging.error(f"Failed to write updated metadata to {metadata_file}: {e}")
                else:
                    logging.error(f"Video UUID {video_uuid} disappeared from metadata between read and write. Update failed.")

        return downloaded_files

    except FileNotFoundError:
        logging.error(f"Metadata file not found at {metadata_file}")
        return {} 
    except json.JSONDecodeError:
        logging.error(f"Error decoding JSON from {metadata_file} or info.json")
        return {} 
    except Exception as e:
        logging.error(f"An unexpected error occurred during VTT download for {video_uuid}: {e}", exc_info=True)
        return {} 


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
