import os
import uuid
import yt_dlp
import asyncio
import glob # Import glob for pattern matching
import shutil # For potential cleanup
# from pathlib import Path # Remove pathlib
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

async def create_ingest_task(url: str, base_dir: str) -> TaskMetadata: # base_dir is now str
    task_uuid = uuid.uuid4()
    task_uuid_str = str(task_uuid)
    # Use os.path.join for path construction
    uuid_dir = os.path.join(base_dir, task_uuid_str)
    # Use os.makedirs
    os.makedirs(uuid_dir, exist_ok=True)
    platform = detect_platform(url)

    # Options for metadata extraction
    ydl_info_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': True, 
        'skip_download': True, 
    }

    # Options for thumbnail download using yt-dlp
    # Base name for thumbnail
    thumbnail_base_name = os.path.join(uuid_dir, 'thumbnail') 
    ydl_thumb_opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True,
        'writethumbnail': True,
        'outtmpl': thumbnail_base_name, 
    }

    title = None
    actual_thumbnail_path_str = None # Store the final relative path
    loop = asyncio.get_event_loop()
    # Get the parent dir (assumed BACKEND_DIR)
    backend_dir = os.path.dirname(base_dir) 

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
                
                # Find the downloaded thumbnail using glob
                found_path_abs = None # Store absolute path found
                preferred_extensions = ['.webp', '.jpg', '.jpeg', '.png']
                # Construct glob pattern
                search_pattern = f"{thumbnail_base_name}.*"
                all_matches_abs = glob.glob(search_pattern)
                print(f"[Ingest Task {task_uuid_str}] Found potential thumbnail files: {[os.path.basename(f) for f in all_matches_abs]}")

                # Check preferred extensions first
                for f_abs in all_matches_abs:
                    # Get extension using os.path.splitext
                    _, ext = os.path.splitext(f_abs)
                    if os.path.isfile(f_abs) and ext.lower() in preferred_extensions:
                        found_path_abs = f_abs
                        print(f"[Ingest Task {task_uuid_str}] Found preferred thumbnail: {os.path.basename(f_abs)}")
                        break
                
                # If no preferred image found, take the first file match (if any)
                if not found_path_abs and all_matches_abs:
                     if os.path.isfile(all_matches_abs[0]):
                         found_path_abs = all_matches_abs[0]
                         print(f"[Ingest Task {task_uuid_str}] No preferred extension found, using first match: {os.path.basename(found_path_abs)}")

                # Store the relative path and clean up others if a file was found
                if found_path_abs:
                    # Calculate relative path from backend_dir
                    actual_thumbnail_path_str = os.path.relpath(found_path_abs, backend_dir)
                    print(f"[Ingest Task {task_uuid_str}] Selected thumbnail path: {actual_thumbnail_path_str}")

                    # Clean up other potential thumbnail files
                    for f_abs in all_matches_abs:
                        if os.path.isfile(f_abs) and f_abs != found_path_abs:
                            try:
                                os.remove(f_abs) 
                                print(f"[Ingest Task {task_uuid_str}] Deleted extra thumbnail file: {os.path.basename(f_abs)}")
                            except OSError as e:
                                print(f"[Ingest Task {task_uuid_str}] Could not delete extra thumbnail file {os.path.basename(f_abs)}: {e}")
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
        thumbnail_path=actual_thumbnail_path_str # This is already the relative path
    ) 