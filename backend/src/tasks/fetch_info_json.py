import asyncio
import yt_dlp
import os
import glob
from uuid import UUID
from ..schemas import TaskMetadata

async def run_fetch_info_json(task_metadata: TaskMetadata, base_dir: str) -> str:
    """
    Downloads the info.json file for a given task using yt-dlp.

    Args:
        task_metadata: The metadata object for the task.
        base_dir: The base directory where task data is stored (string path).

    Returns:
        The relative path to the downloaded info.json file (relative to backend dir).

    Raises:
        FileNotFoundError: If the task directory doesn't exist.
        yt_dlp.utils.DownloadError: If yt-dlp fails to download info.json.
        Exception: For other unexpected errors.
    """
    task_uuid_str = str(task_metadata.uuid)
    url = task_metadata.url
    uuid_dir = os.path.join(base_dir, task_uuid_str)
    backend_dir = os.path.dirname(base_dir)

    if not os.path.isdir(uuid_dir):
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    info_json_filename = f"{task_uuid_str}_info.json"
    info_json_path_abs = os.path.join(uuid_dir, info_json_filename)
    outtmpl_base = os.path.join(uuid_dir, f'{task_uuid_str}_info')

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'writeinfojson': True,
        'skip_download': True,
        'outtmpl': outtmpl_base,
        'ignoreerrors': False,
    }

    loop = asyncio.get_event_loop()

    try:
        print(f"Attempting to download info.json for {url} to {info_json_path_abs}")
        await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_opts).download([url]))

        if not os.path.isfile(info_json_path_abs):
            search_pattern = f"{outtmpl_base}*.json"
            found_json_abs = glob.glob(search_pattern)
            if found_json_abs:
                actual_path_abs = found_json_abs[0]
                print(f"Warning: Expected {info_json_path_abs}, but found {actual_path_abs}")
                relative_path = os.path.relpath(actual_path_abs, backend_dir)
                return relative_path
            else:
                raise FileNotFoundError(f"info.json download failed for {url}, file not found using pattern: {search_pattern}")
        else:
            relative_path = os.path.relpath(info_json_path_abs, backend_dir)
            print(f"Successfully downloaded info.json to {info_json_path_abs}")
            return relative_path

    except yt_dlp.utils.DownloadError as e:
        print(f"yt-dlp error downloading info.json for {url}: {e}")
        raise
    except Exception as e:
        print(f"Unexpected error during fetch_info_json for {url}: {e}")
        raise 