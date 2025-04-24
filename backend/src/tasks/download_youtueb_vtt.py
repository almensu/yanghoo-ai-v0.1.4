import json
import os
import requests
import logging
from pathlib import Path
import threading

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Use a lock for metadata file operations to prevent race conditions if run concurrently
metadata_lock = threading.Lock()

def download_youtube_vtt(video_uuid: str, metadata_file: str = "backend/data/metadata.json"):
    """
    Downloads VTT subtitles for a given YouTube video UUID.

    Args:
        video_uuid: The UUID of the video.
        metadata_file: Path to the main metadata JSON file.
    """
    logging.info(f"Attempting to download VTT for UUID: {video_uuid}")

    try:
        with metadata_lock:
            with open(metadata_file, 'r') as f:
                metadata = json.load(f)

        video_data = metadata.get(video_uuid)

        if not video_data:
            logging.error(f"Video UUID {video_uuid} not found in metadata.")
            return

        if video_data.get("platform") != "youtube":
            logging.warning(f"Video {video_uuid} is not from YouTube. Skipping VTT download.")
            return

        info_json_path_str = video_data.get("info_json_path")
        if not info_json_path_str:
            logging.error(f"info_json_path not found for video {video_uuid}.")
            return

        info_json_path = Path(info_json_path_str)
        if not info_json_path.exists():
             # Adjust path relative to metadata file if necessary
             base_dir = Path(metadata_file).parent
             info_json_path = (base_dir / info_json_path_str).resolve()
             if not info_json_path.exists():
                 logging.error(f"Info JSON file not found at {info_json_path_str} or {info_json_path}")
                 return


        with open(info_json_path, 'r') as f:
            info_data = json.load(f)

        captions = info_data.get("automatic_captions", {})
        if not captions:
            logging.warning(f"No automatic captions found in info.json for {video_uuid}.")
            # Optionally check requested_subtitles here too if yt-dlp schema includes them separately
            # captions.update(info_data.get("requested_subtitles", {}))
            # if not captions:
            #     logging.warning(f"No automatic or requested captions found for {video_uuid}.")
            #     return


        # --- VTT Selection Logic ---
        vtt_urls_to_download = {} # lang_code: url
        target_langs = {"zh-Hans": ["zh-Hans"], "en": ["en", "en-orig"]} # Target codes and their potential keys in info.json

        # Find best match for each target language
        for target_code, potential_keys in target_langs.items():
            found_url = None
            for key in potential_keys:
                if key in captions and isinstance(captions[key], list):
                    for entry in captions[key]:
                        if entry.get("ext") == "vtt" and entry.get("url"):
                            found_url = entry["url"]
                            logging.info(f"Found VTT URL for standard code '{target_code}' (searched using key: {key}) for {video_uuid}")
                            break # Take the first valid VTT entry for this key
                    if found_url:
                        break # Found URL for this target_code via one of its potential_keys
            if found_url:
                vtt_urls_to_download[target_code] = found_url
            else:
                logging.warning(f"Could not find suitable VTT URL for target standard code '{target_code}' for {video_uuid}")


        if not vtt_urls_to_download:
            logging.warning(f"No suitable VTT URLs found to download for {video_uuid}.")
            return

        # --- Download and Save ---
        downloaded_files = {}
        video_dir = info_json_path.parent

        for lang_code, url in vtt_urls_to_download.items():
            output_filename = f"transcript_{lang_code}.vtt"
            output_path = video_dir / output_filename
            relative_output_path = Path("data") / video_uuid / output_filename # Path relative to backend dir for metadata

            try:
                logging.info(f"Downloading {lang_code} VTT from {url} to {output_path}")
                response = requests.get(url, timeout=30)
                response.raise_for_status() # Raise an exception for bad status codes

                with open(output_path, 'wb') as f: # Write in binary mode
                    f.write(response.content)

                downloaded_files[lang_code] = str(relative_output_path).replace("\\", "/") # Store relative path with forward slashes

                logging.info(f"Successfully downloaded {lang_code} VTT for {video_uuid}")

            except requests.exceptions.RequestException as e:
                logging.error(f"Failed to download {lang_code} VTT for {video_uuid}: {e}")
            except IOError as e:
                logging.error(f"Failed to save {lang_code} VTT file for {video_uuid} to {output_path}: {e}")


        # --- Update Metadata ---
        if downloaded_files:
            with metadata_lock:
                # Re-read metadata within the lock to ensure we have the latest version
                try:
                    with open(metadata_file, 'r') as f:
                        current_metadata = json.load(f)
                except (FileNotFoundError, json.JSONDecodeError) as e:
                    logging.error(f"Error reading metadata file {metadata_file} before update: {e}")
                    return # Cannot update if we can't read

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

    except FileNotFoundError:
        logging.error(f"Metadata file not found at {metadata_file}")
    except json.JSONDecodeError:
        logging.error(f"Error decoding JSON from {metadata_file} or info.json")
    except Exception as e:
        logging.error(f"An unexpected error occurred during VTT download for {video_uuid}: {e}", exc_info=True)


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
