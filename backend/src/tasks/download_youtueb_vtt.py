import json
import os
import logging
from pathlib import Path
import asyncio
import subprocess
from typing import List, Dict

# Import TaskMetadata
from ..schemas import TaskMetadata
from ..utils.vtt_utils import normalize_vtt_content

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Use an asyncio Lock for metadata file operations
metadata_lock = asyncio.Lock()

async def download_youtube_vtt(task_meta: TaskMetadata, metadata_file: str = "backend/data/metadata.json") -> dict:
    """
    Downloads VTT subtitles for a given YouTube video using yt-dlp with precise commands.
    Priority order: en-orig, en, zh-Hans
    Renames downloaded files to transcript_{lang}.vtt format.

    Args:
        task_meta: The metadata object for the task.
        metadata_file: Path to the main metadata JSON file.

    Returns:
        Dictionary mapping language codes to relative paths of downloaded VTT files.
    """
    video_uuid = str(task_meta.uuid)
    logging.info(f"Attempting to download VTT for UUID: {video_uuid}")

    downloaded_files = {}  # Store successfully downloaded files
    base_dir = Path(metadata_file).parent  # data directory
    video_dir = base_dir / video_uuid

    # Ensure video directory exists
    video_dir.mkdir(parents=True, exist_ok=True)

    try:
        # Check if the task is from YouTube
        if task_meta.platform != "youtube":
            logging.warning(f"Video {video_uuid} is not from YouTube. Skipping VTT download.")
            return {}

        video_url = task_meta.url
        if not video_url:
            logging.error(f"No URL found for video {video_uuid}. Cannot proceed.")
            return {}

        logging.info(f"Starting VTT download for URL: {video_url}")

        # Try downloading English subtitles first
        en_cmd = [
            "yt-dlp",
            "--skip-download",
            "--write-subs",
            "--write-auto-subs",
            "--sub-lang", "en",
            "--sub-format", "vtt",
            video_url
        ]
        
        logging.info(f"Running English download command: {' '.join(en_cmd)}")
        
        try:
            # Run the yt-dlp command in the video directory
            process = await asyncio.create_subprocess_exec(
                *en_cmd,
                cwd=str(video_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            stdout_text = stdout.decode('utf-8', errors='replace')
            stderr_text = stderr.decode('utf-8', errors='replace')
            
            logging.info(f"English download stdout: {stdout_text}")
            if stderr_text:
                logging.info(f"English download stderr: {stderr_text}")
            
            if process.returncode == 0:
                # Wait for file system to sync
                await asyncio.sleep(1)
                
                # Look for the downloaded English VTT file
                vtt_files = list(video_dir.glob("*.en.vtt"))
                if vtt_files:
                    en_file = vtt_files[0]
                    logging.info(f"Found English VTT file: {en_file.name}")
                    
                    # Read content and normalize
                    with open(en_file, 'r', encoding='utf-8', errors='replace') as f:
                        content = f.read()
                        normalized_content = normalize_vtt_content(content)
                    
                    # Write to target location
                    target_path = video_dir / "transcript_en.vtt"
                    with open(target_path, 'w', encoding='utf-8') as f:
                        f.write(normalized_content)
                    
                    # Remove original file
                    try:
                        os.remove(en_file)
                        logging.info(f"Removed original English VTT file: {en_file}")
                    except Exception as e:
                        logging.warning(f"Failed to remove original English VTT file: {e}")
                    
                    # Record success
                    relative_path = str(target_path.relative_to(base_dir)).replace("\\", "/")
                    downloaded_files["en"] = relative_path
                    logging.info(f"Successfully downloaded English VTT: {relative_path}")
                else:
                    logging.warning("No English VTT file found after download")
            else:
                logging.warning(f"English VTT download failed with return code {process.returncode}")
                
        except Exception as e:
            logging.error(f"Error downloading English VTT: {e}", exc_info=True)

        # Try downloading Chinese subtitles
        zh_cmd = [
            "yt-dlp",
            "--skip-download",
            "--write-subs",
            "--write-auto-subs",
            "--sub-lang", "zh-Hans",
            "--sub-format", "vtt",
            video_url
        ]
        
        logging.info(f"Running Chinese download command: {' '.join(zh_cmd)}")
        
        try:
            # Run the yt-dlp command in the video directory
            process = await asyncio.create_subprocess_exec(
                *zh_cmd,
                cwd=str(video_dir),
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            
            stdout_text = stdout.decode('utf-8', errors='replace')
            stderr_text = stderr.decode('utf-8', errors='replace')
            
            logging.info(f"Chinese download stdout: {stdout_text}")
            if stderr_text:
                logging.info(f"Chinese download stderr: {stderr_text}")
            
            if process.returncode == 0:
                # Wait for file system to sync
                await asyncio.sleep(1)
                
                # Look for the downloaded Chinese VTT file
                vtt_files = list(video_dir.glob("*.zh-Hans.vtt"))
                if vtt_files:
                    zh_file = vtt_files[0]
                    logging.info(f"Found Chinese VTT file: {zh_file.name}")
                    
                    # Read content and normalize
                    with open(zh_file, 'r', encoding='utf-8', errors='replace') as f:
                        content = f.read()
                        normalized_content = normalize_vtt_content(content)
                    
                    # Write to target location
                    target_path = video_dir / "transcript_zh-Hans.vtt"
                    with open(target_path, 'w', encoding='utf-8') as f:
                        f.write(normalized_content)
                    
                    # Remove original file
                    try:
                        os.remove(zh_file)
                        logging.info(f"Removed original Chinese VTT file: {zh_file}")
                    except Exception as e:
                        logging.warning(f"Failed to remove original Chinese VTT file: {e}")
                    
                    # Record success
                    relative_path = str(target_path.relative_to(base_dir)).replace("\\", "/")
                    downloaded_files["zh-Hans"] = relative_path
                    logging.info(f"Successfully downloaded Chinese VTT: {relative_path}")
                else:
                    logging.warning("No Chinese VTT file found after download")
            else:
                logging.warning(f"Chinese VTT download failed with return code {process.returncode}")
                
        except Exception as e:
            logging.error(f"Error downloading Chinese VTT: {e}", exc_info=True)

        # Clean up any remaining VTT files
        remaining_vtt_files = list(video_dir.glob("*.vtt"))
        for vtt_file in remaining_vtt_files:
            if not vtt_file.name.startswith("transcript_"):
                try:
                    os.remove(vtt_file)
                    logging.info(f"Cleaned up remaining VTT file: {vtt_file}")
                except Exception as e:
                    logging.warning(f"Failed to clean up VTT file {vtt_file}: {e}")

        # Update metadata if any files were downloaded
        if downloaded_files:
            async with metadata_lock:
                try:
                    # Read current metadata
                    with open(metadata_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                        current_metadata = json.loads(content)
                except (FileNotFoundError, json.JSONDecodeError) as e:
                    logging.error(f"Error reading metadata file {metadata_file}: {e}")
                    return downloaded_files
                
                if video_uuid in current_metadata:
                    if "vtt_files" not in current_metadata[video_uuid]:
                        current_metadata[video_uuid]["vtt_files"] = {}
                    
                    current_metadata[video_uuid]["vtt_files"].update(downloaded_files)
                    
                    try:
                        with open(metadata_file, 'w', encoding='utf-8') as f:
                            f.write(json.dumps(current_metadata, indent=4, ensure_ascii=False, default=str))
                        logging.info(f"Successfully updated metadata for {video_uuid} with VTT paths: {downloaded_files}")
                    except IOError as e:
                        logging.error(f"Failed to write updated metadata to {metadata_file}: {e}")
                else:
                    logging.error(f"Video UUID {video_uuid} not found in metadata. Update failed.")
        else:
            logging.warning(f"No VTT files were successfully downloaded for {video_uuid}")
        
        return downloaded_files
        
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
