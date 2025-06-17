import json
import os
import logging
from pathlib import Path
import asyncio
import aiofiles
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
    Downloads VTT subtitles for a given YouTube video using yt-dlp directly.
    Downloads both English and Chinese (zh-Hans) subtitles if available.
    Also normalizes the downloaded VTT content immediately.

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

        # Languages to download
        languages = ["en", "zh-Hans"]
        
        # Download VTT files using yt-dlp for each language
        for lang in languages:
            output_filename = f"transcript_{lang}.vtt"
            output_path = video_dir / output_filename
            relative_output_path = str(output_path.relative_to(base_dir)).replace("\\", "/")
            
            # Use a specific output template for easier file identification
            # The subtitle files will be named: subtitle_name.{lang}.vtt
            temp_output_template = str(video_dir / f"subtitle_name")
            
            # Run yt-dlp command to download subtitles
            cmd = [
                "yt-dlp",
                "--skip-download",
                "--write-subs",
                "--write-auto-subs",
                "--force-overwrites",  # Force overwrite existing files
                f"--sub-langs={lang}",  # Correct parameter name is --sub-langs, not --sub-lang
                "--sub-format=vtt",
                "--output", temp_output_template,
                "--verbose",  # Add verbose output for better debugging
                video_url
            ]
            
            logging.info(f"Running command: {' '.join(cmd)}")
            
            try:
                # Run the yt-dlp command
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await process.communicate()
                
                stdout_text = stdout.decode('utf-8', errors='replace')
                stderr_text = stderr.decode('utf-8', errors='replace')
                
                logging.info(f"yt-dlp stdout: {stdout_text}")
                if stderr_text:
                    logging.info(f"yt-dlp stderr: {stderr_text}")
                
                if process.returncode != 0:
                    logging.error(f"yt-dlp failed for {lang} with return code {process.returncode}")
                    logging.error(f"stderr: {stderr_text}")
                    continue
                
                # List all files in the directory to help with debugging
                all_files = list(video_dir.glob("*"))
                logging.info(f"All files in {video_dir}: {[f.name for f in all_files]}")
                
                # Find the downloaded VTT file - try multiple patterns
                vtt_files = []
                
                # Pattern 1: Our specific naming pattern
                vtt_files = list(video_dir.glob(f"subtitle_name*.{lang}.vtt"))
                
                # Pattern 2: Standard pattern with language code
                if not vtt_files:
                    vtt_files = list(video_dir.glob(f"*.{lang}.vtt"))
                
                # Pattern 3: Auto-generated pattern
                if not vtt_files:
                    vtt_files = list(video_dir.glob(f"*.{lang}.auto.vtt"))
                
                # Pattern 4: Any VTT file that contains the language code
                if not vtt_files:
                    vtt_files = list(video_dir.glob(f"*{lang}*.vtt"))
                
                # Pattern 5: Any VTT file (as a last resort)
                if not vtt_files:
                    vtt_files = list(video_dir.glob("*.vtt"))
                    if vtt_files:
                        logging.warning(f"Found VTT files without expected language pattern: {[f.name for f in vtt_files]}")
                
                if not vtt_files:
                    # If we still can't find any VTT files, try running a direct command to list subtitles
                    logging.warning(f"No VTT file found for language {lang} after download. Trying to list available subtitles...")
                    
                    list_cmd = [
                        "yt-dlp",
                        "--list-subs",
                        video_url
                    ]
                    
                    list_process = await asyncio.create_subprocess_exec(
                        *list_cmd,
                        stdout=asyncio.subprocess.PIPE,
                        stderr=asyncio.subprocess.PIPE
                    )
                    list_stdout, list_stderr = await list_process.communicate()
                    
                    logging.info(f"Available subtitles: {list_stdout.decode('utf-8', errors='replace')}")
                    logging.warning(f"No VTT file found for language {lang} after download")
                    continue
                
                # Use the first found VTT file
                downloaded_vtt = vtt_files[0]
                logging.info(f"Found VTT file: {downloaded_vtt}")
                
                # Read and normalize the content
                async with aiofiles.open(downloaded_vtt, 'r', encoding='utf-8', errors='replace') as f:
                    content = await f.read()
                    normalized_content = normalize_vtt_content(content)
                
                # Write normalized content to the final location
                async with aiofiles.open(output_path, 'w', encoding='utf-8') as f:
                    await f.write(normalized_content)
                
                # Delete the original file if it's different from our target
                if downloaded_vtt != output_path:
                    try:
                        os.remove(downloaded_vtt)
                        logging.info(f"Removed original VTT file: {downloaded_vtt}")
                    except Exception as e:
                        logging.warning(f"Failed to remove original VTT file {downloaded_vtt}: {e}")
                
                # Record the successfully downloaded file
                downloaded_files[lang] = relative_output_path
                logging.info(f"Successfully downloaded and normalized {lang} VTT for {video_uuid}")
                
            except Exception as e:
                logging.error(f"Error downloading {lang} VTT for {video_uuid}: {e}", exc_info=True)

        # Update metadata if any files were downloaded
        if downloaded_files:
            async with metadata_lock:
                try:
                    # Use aiofiles for async read/write
                    async with aiofiles.open(metadata_file, 'r', encoding='utf-8') as f:
                        content = await f.read()
                        current_metadata = json.loads(content)
                except (FileNotFoundError, json.JSONDecodeError) as e:
                    logging.error(f"Error reading metadata file {metadata_file} before update: {e}")
                    return downloaded_files
                
                if video_uuid in current_metadata:
                    if "vtt_files" not in current_metadata[video_uuid] or not isinstance(current_metadata[video_uuid]["vtt_files"], dict):
                        current_metadata[video_uuid]["vtt_files"] = {}
                    
                    current_metadata[video_uuid]["vtt_files"].update(downloaded_files)
                    
                    try:
                        async with aiofiles.open(metadata_file, 'w', encoding='utf-8') as f:
                            await f.write(json.dumps(current_metadata, indent=4, ensure_ascii=False, default=str))
                        logging.info(f"Successfully updated metadata for {video_uuid} with VTT paths: {downloaded_files}")
                    except IOError as e:
                        logging.error(f"Failed to write updated metadata to {metadata_file}: {e}")
                else:
                    logging.error(f"Video UUID {video_uuid} disappeared from metadata between read and write. Update failed.")
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