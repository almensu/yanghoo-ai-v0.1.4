import os
import uuid
import yt_dlp
import asyncio
import glob
import shutil
from pathlib import Path # Import Path
from ..schemas import Platform, TaskMetadata

def detect_platform(url: str) -> Platform:
    if "youtube.com" in url or "youtu.be" in url:
        return Platform.YOUTUBE
    elif "twitter.com" in url or "x.com" in url:
        return Platform.TWITTER
    elif "podcast.apple.com" in url:
        return Platform.PODCAST
    elif "xiaoyuzhoufm.com" in url:
        return Platform.XIAOYUZHOU
    else:
        raise ValueError(f"Unsupported platform for URL: {url}")

async def create_ingest_task(url: str, base_dir_str: str) -> TaskMetadata:
    base_dir = Path(base_dir_str)
    task_uuid = uuid.uuid4()
    task_uuid_str = str(task_uuid)
    # Use pathlib for path construction
    uuid_dir = base_dir / task_uuid_str
    # Use pathlib.mkdir
    uuid_dir.mkdir(parents=True, exist_ok=True)
    platform = detect_platform(url)

    # Options for metadata extraction
    ydl_info_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True, 
        'skip_download': True, 
    }

    # Options for thumbnail download using yt-dlp
    # Base name for thumbnail (Path object)
    thumbnail_base_name = uuid_dir / 'thumbnail'
    ydl_thumb_opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'writethumbnail': True,
        # yt-dlp expects string path for outtmpl
        'outtmpl': str(thumbnail_base_name),
    }

    title = None
    actual_thumbnail_rel_path = None # Store the final relative path as string
    loop = asyncio.get_event_loop()
    # Get the parent dir (BACKEND_DIR) using pathlib
    backend_dir = base_dir.parent

    try:
        print(f"[Ingest Task {task_uuid_str}] Fetching metadata for {url}...")
        info = await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_info_opts).extract_info(url, download=False))
        title = info.get('title')
        print(f"[Ingest Task {task_uuid_str}] Metadata fetched. Title: {title}")

        # Download thumbnail if available using yt-dlp
        if info.get('thumbnail'):
            print(f"[Ingest Task {task_uuid_str}] Attempting to download thumbnail using yt-dlp...")
            try:
                await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_thumb_opts).download([url]))
                print(f"[Ingest Task {task_uuid_str}] yt-dlp thumbnail process finished. Searching for file...")
                
                # Find the downloaded thumbnail using pathlib.glob
                found_path_abs: Path | None = None # Store absolute Path object found
                preferred_extensions = ['.webp', '.jpg', '.jpeg', '.png']
                # Construct glob pattern using Path
                search_pattern = f"thumbnail.*"
                all_matches_abs = list(uuid_dir.glob(search_pattern))
                print(f"[Ingest Task {task_uuid_str}] Found potential thumbnail files: {[p.name for p in all_matches_abs]}")

                # Check preferred extensions first
                for p_abs in all_matches_abs:
                    if p_abs.is_file() and p_abs.suffix.lower() in preferred_extensions:
                        found_path_abs = p_abs
                        print(f"[Ingest Task {task_uuid_str}] Found preferred thumbnail: {p_abs.name}")
                        break
                
                # If no preferred image found, take the first file match (if any)
                if not found_path_abs and all_matches_abs:
                    if all_matches_abs[0].is_file():
                        found_path_abs = all_matches_abs[0]
                        print(f"[Ingest Task {task_uuid_str}] No preferred extension found, using first match: {found_path_abs.name}")

                # Store the relative path and clean up others if a file was found
                if found_path_abs:
                    # Calculate relative path from base_dir (DATA_DIR) using pathlib, store as string
                    actual_thumbnail_rel_path = str(found_path_abs.relative_to(base_dir))
                    print(f"[Ingest Task {task_uuid_str}] Selected thumbnail path: {actual_thumbnail_rel_path}")

                    # Clean up other potential thumbnail files
                    for p_abs in all_matches_abs:
                        if p_abs.is_file() and p_abs != found_path_abs:
                            try:
                                p_abs.unlink() # Use pathlib.unlink
                                print(f"[Ingest Task {task_uuid_str}] Deleted extra thumbnail file: {p_abs.name}")
                            except OSError as e:
                                print(f"[Ingest Task {task_uuid_str}] Could not delete extra thumbnail file {p_abs.name}: {e}")
                else:
                     print(f"[Ingest Task {task_uuid_str}] Thumbnail download attempted, but no matching file found.")

            except yt_dlp.utils.DownloadError as e:
                 print(f"[Ingest Task {task_uuid_str}] yt-dlp error during thumbnail download for {url}: {e}")
            except Exception as e:
                 print(f"[Ingest Task {task_uuid_str}] Unexpected error during yt-dlp thumbnail download: {e}")
        else:
             print(f"[Ingest Task {task_uuid_str}] No thumbnail URL found in metadata.")

    except yt_dlp.utils.DownloadError as e:
        print(f"[Ingest Task {task_uuid_str}] Error during yt-dlp metadata processing for {url}: {e}")
    except Exception as e:
        print(f"[Ingest Task {task_uuid_str}] Unexpected error during ingest task for {url}: {e}")

    return TaskMetadata(
        uuid=task_uuid,
        url=url,
        platform=platform,
        title=title,
        thumbnail_path=actual_thumbnail_rel_path # Pass the relative path string
    ) 