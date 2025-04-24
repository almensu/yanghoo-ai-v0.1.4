import asyncio
import yt_dlp
from pathlib import Path
from uuid import UUID
from ..schemas import TaskMetadata

async def run_fetch_info_json(task_metadata: TaskMetadata, base_dir: Path) -> str:
    """
    Downloads the info.json file for a given task using yt-dlp.

    Args:
        task_metadata: The metadata object for the task.
        base_dir: The base directory where task data is stored.

    Returns:
        The relative path to the downloaded info.json file.

    Raises:
        FileNotFoundError: If the task directory doesn't exist.
        yt_dlp.utils.DownloadError: If yt-dlp fails to download info.json.
        Exception: For other unexpected errors.
    """
    task_uuid_str = str(task_metadata.uuid)
    url = task_metadata.url
    uuid_dir = base_dir / task_uuid_str

    if not uuid_dir.is_dir():
        raise FileNotFoundError(f"Task directory not found: {uuid_dir}")

    info_json_filename = f"{task_uuid_str}_info.json"
    info_json_path = uuid_dir / info_json_filename
    relative_info_json_path = Path(task_uuid_str) / info_json_filename

    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'writeinfojson': True,       # Write info json file
        'skip_download': True,       # Don't download the video itself
        'outtmpl': str(uuid_dir / f'{task_uuid_str}_info'), # Base name for the file
        'ignoreerrors': False,
    }

    loop = asyncio.get_event_loop()

    try:
        print(f"Attempting to download info.json for {url} to {info_json_path}")
        # Run yt-dlp in an executor to avoid blocking the event loop
        await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_opts).download([url]))

        # Verify the file was created
        if not info_json_path.is_file():
             # Sometimes yt-dlp might name it slightly differently or fail silently
             # Let's check for *any* .json file if the specific one isn't found
             found_json = list(uuid_dir.glob(f"{task_uuid_str}_info*.json"))
             if found_json:
                 actual_path = found_json[0]
                 print(f"Warning: Expected {info_json_path}, but found {actual_path}")
                 return str(actual_path.relative_to(base_dir.parent))
             else:
                 raise FileNotFoundError(f"info.json download failed for {url}, file not found at expected path: {info_json_path}")

        print(f"Successfully downloaded info.json to {info_json_path}")
        return str(relative_info_json_path)

    except yt_dlp.utils.DownloadError as e:
        print(f"yt-dlp error downloading info.json for {url}: {e}")
        raise  # Re-raise the specific download error
    except Exception as e:
        print(f"Unexpected error during fetch_info_json for {url}: {e}")
        raise # Re-raise other exceptions 