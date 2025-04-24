import asyncio
import yt_dlp
import os
import shutil # Import shutil for renaming
from pathlib import Path
from uuid import UUID
from ..schemas import TaskMetadata

async def run_fetch_info_json(task_metadata: TaskMetadata, base_dir_str: str) -> str:
    """
    Downloads the info.json file for a given task using yt-dlp and saves it as info.json.

    Args:
        task_metadata: The metadata object for the task.
        base_dir_str: The base directory where task data is stored (string path).

    Returns:
        The relative path to the downloaded info.json file (relative to backend dir,
        should be data/{uuid}/info.json).

    Raises:
        FileNotFoundError: If the task directory doesn't exist or download/rename fails.
        yt_dlp.utils.DownloadError: If yt-dlp fails to download info.json.
        Exception: For other unexpected errors.
    """
    base_dir = Path(base_dir_str)
    task_uuid_str = str(task_metadata.uuid)
    url = task_metadata.url
    uuid_dir = base_dir / task_uuid_str
    backend_dir = base_dir.parent

    if not uuid_dir.is_dir():
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    # Define the final desired filename and path
    final_filename = "info.json"
    final_json_path_abs = uuid_dir / final_filename
    expected_relative_path = str(final_json_path_abs.relative_to(backend_dir))

    # Define the temporary filename yt-dlp will use
    # We will let yt-dlp create task_uuid_str.info.json and then rename it.
    temp_outtmpl_base_str = str(uuid_dir / task_uuid_str) # Results in task_uuid_str.info.json
    temp_json_path_abs = uuid_dir / f"{task_uuid_str}.info.json"

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'writeinfojson': True,
        'skip_download': True,
        'outtmpl': temp_outtmpl_base_str, # Use temp base name
        'ignoreerrors': False,
        'overwrites': True, # Overwrite temp file if it exists
    }

    loop = asyncio.get_event_loop()

    try:
        print(f"Attempting to download info.json for {url} to temporary path {temp_json_path_abs}")
        # Download to the temporary path
        await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_opts).download([url]))

        # Check if the temporary file was created
        if not temp_json_path_abs.is_file():
            # Sometimes yt-dlp might use a different temporary name, e.g., if title had weird chars.
            # Let's check if ANY .info.json exists in the directory as a fallback.
            found_json_paths = list(uuid_dir.glob('*.info.json'))
            if not found_json_paths:
                raise FileNotFoundError(f"info.json download failed for {url}, temporary file not found at {temp_json_path_abs} or similar.")
            else:
                # Use the first found .info.json as the temp file
                temp_json_path_abs = found_json_paths[0]
                print(f"Warning: Temporary file found at unexpected location: {temp_json_path_abs}. Proceeding with rename.")

        # Rename the temporary file to the final filename
        print(f"Renaming {temp_json_path_abs} to {final_json_path_abs}")
        # Ensure the final target doesn't exist before renaming
        if final_json_path_abs.exists():
             final_json_path_abs.unlink()
        shutil.move(str(temp_json_path_abs), str(final_json_path_abs)) # Use shutil.move with strings

        # Verify the final file exists
        if not final_json_path_abs.is_file():
             raise FileNotFoundError(f"info.json rename failed for {url}. Expected final file at {final_json_path_abs}")

        print(f"Successfully downloaded and saved info.json to {final_json_path_abs}")
        return expected_relative_path

    except yt_dlp.utils.DownloadError as e:
        print(f"yt-dlp error downloading info.json for {url}: {e}")
        # Clean up potentially partially created temp file
        if temp_json_path_abs.exists():
             try: temp_json_path_abs.unlink() 
             except OSError: pass 
        raise
    except Exception as e:
        print(f"Unexpected error during fetch_info_json for {url}: {e}")
        # Clean up potentially partially created temp file
        if temp_json_path_abs.exists():
             try: temp_json_path_abs.unlink()
             except OSError: pass
        raise 