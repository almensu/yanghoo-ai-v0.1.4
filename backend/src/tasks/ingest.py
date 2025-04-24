import os
import uuid
import yt_dlp
import asyncio
from pathlib import Path
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

async def create_ingest_task(url: str, base_dir: Path) -> TaskMetadata:
    task_uuid = uuid.uuid4()
    uuid_dir = base_dir / str(task_uuid)
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
    thumbnail_outtmpl = uuid_dir / 'thumbnail'
    ydl_thumb_opts = {
        'quiet': True,
        'no_warnings': True,
        'skip_download': True, # Explicitly skip main media download
        'writethumbnail': True, # Ask to write thumbnail
        'outtmpl': str(thumbnail_outtmpl), # Base name for thumbnail
        # 'listthumbnails': False, # Optional, might not be needed
    }

    title = None
    actual_thumbnail_path_str = None 
    loop = asyncio.get_event_loop()

    try:
        print(f"[Ingest Task {task_uuid}] Fetching metadata for {url}...")
        info = await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_info_opts).extract_info(url, download=False))
        title = info.get('title')
        print(f"[Ingest Task {task_uuid}] Metadata fetched. Title: {title}")

        # Download thumbnail if available using yt-dlp
        if info.get('thumbnail'):
            print(f"[Ingest Task {task_uuid}] Attempting to download thumbnail using yt-dlp...")
            try:
                # Run yt-dlp thumbnail download in executor
                await loop.run_in_executor(None, lambda: yt_dlp.YoutubeDL(ydl_thumb_opts).download([url]))
                print(f"[Ingest Task {task_uuid}] yt-dlp thumbnail process finished. Searching for file...")
                
                # Find the downloaded thumbnail, prioritizing common image formats
                found_path = None
                preferred_extensions = ['.webp', '.jpg', '.jpeg', '.png']
                all_matches = list(uuid_dir.glob('thumbnail.*')) # Get all matches
                print(f"[Ingest Task {task_uuid}] Found potential thumbnail files: {[f.name for f in all_matches]}")

                # Check preferred extensions first
                for f in all_matches:
                    if f.is_file() and f.suffix.lower() in preferred_extensions:
                        found_path = f
                        print(f"[Ingest Task {task_uuid}] Found preferred thumbnail: {f.name}")
                        break # Found a preferred image
                
                # If no preferred image found, take the first file match (if any)
                if not found_path and all_matches:
                     if all_matches[0].is_file():
                         found_path = all_matches[0]
                         print(f"[Ingest Task {task_uuid}] No preferred extension found, using first match: {found_path.name}")

                # Store the relative path and clean up others if a file was found
                if found_path:
                    actual_thumbnail_path_str = str(found_path.relative_to(base_dir.parent))
                    print(f"[Ingest Task {task_uuid}] Selected thumbnail path: {actual_thumbnail_path_str}")

                    # Clean up other potential thumbnail files (like thumbnail.mp4)
                    for f in all_matches:
                        if f.is_file() and f != found_path:
                            try:
                                f.unlink() 
                                print(f"[Ingest Task {task_uuid}] Deleted extra thumbnail file: {f.name}")
                            except OSError as e:
                                print(f"[Ingest Task {task_uuid}] Could not delete extra thumbnail file {f.name}: {e}")
                else:
                     print(f"[Ingest Task {task_uuid}] Thumbnail download attempted, but no matching file found.")

            except yt_dlp.utils.DownloadError as e:
                 # This might catch errors if skip_download + writethumbnail is invalid
                 print(f"[Ingest Task {task_uuid}] yt-dlp error during thumbnail download for {url}: {e}")
            except Exception as e:
                 print(f"[Ingest Task {task_uuid}] Unexpected error during yt-dlp thumbnail download: {e}")
        else:
             print(f"[Ingest Task {task_uuid}] No thumbnail URL found in metadata.")

    except yt_dlp.utils.DownloadError as e:
        print(f"[Ingest Task {task_uuid}] Error during yt-dlp metadata processing for {url}: {e}")
    except Exception as e:
        print(f"[Ingest Task {task_uuid}] Unexpected error during ingest task for {url}: {e}")

    return TaskMetadata(
        uuid=task_uuid,
        url=url,
        platform=platform,
        title=title,
        thumbnail_path=actual_thumbnail_path_str
    ) 