#!/usr/bin/env python3
"""
Script to restore orphaned tasks that exist in the filesystem but are missing from metadata.json
This fixes the issue where videos don't show up in the studio video selector.
"""

import json
import os
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any
import uuid

def determine_platform(url: str) -> str:
    """Determine platform from URL"""
    if 'youtube.com' in url or 'youtu.be' in url:
        return 'youtube'
    elif 'xiaoyuzhoufm.com' in url:
        return 'xiaoyuzhoufm'
    else:
        return 'unknown'

def extract_youtube_video_id(url: str) -> str:
    """Extract YouTube video ID from URL for embed_url"""
    if 'youtube.com/watch?v=' in url:
        return url.split('v=')[1].split('&')[0]
    elif 'youtu.be/' in url:
        return url.split('youtu.be/')[1].split('?')[0]
    return ''

def create_embed_url(url: str, platform: str) -> str:
    """Create embed URL for supported platforms"""
    if platform == 'youtube':
        video_id = extract_youtube_video_id(url)
        if video_id:
            return f"https://www.youtube.com/embed/{video_id}"
    return ""

def restore_orphaned_tasks():
    """Main function to restore orphaned tasks"""
    
    # Get the script directory and data directory
    script_dir = Path(__file__).parent
    data_dir = script_dir / "data"
    metadata_file = data_dir / "metadata.json"
    
    print(f"Script directory: {script_dir}")
    print(f"Data directory: {data_dir}")
    print(f"Metadata file: {metadata_file}")
    
    # Load existing metadata
    if metadata_file.exists():
        with open(metadata_file, 'r', encoding='utf-8') as f:
            metadata = json.load(f)
    else:
        print("Metadata file not found!")
        return
    
    print(f"Loaded {len(metadata)} tasks from metadata.json")
    
    # Find all UUID directories
    uuid_dirs = []
    for item in data_dir.iterdir():
        if item.is_dir() and len(item.name) == 36 and item.name.count('-') == 4:
            uuid_dirs.append(item.name)
    
    print(f"Found {len(uuid_dirs)} UUID directories")
    
    # Find orphaned tasks (directories that exist but not in metadata)
    orphaned_tasks = []
    for uuid_str in uuid_dirs:
        if uuid_str not in metadata:
            orphaned_tasks.append(uuid_str)
    
    print(f"Found {len(orphaned_tasks)} orphaned tasks:")
    for task_uuid in orphaned_tasks:
        print(f"  - {task_uuid}")
    
    if not orphaned_tasks:
        print("No orphaned tasks found. All tasks are properly registered.")
        return
    
    # Process each orphaned task
    restored_count = 0
    for task_uuid in orphaned_tasks:
        task_dir = data_dir / task_uuid
        info_json_path = task_dir / "info.json"
        
        if not info_json_path.exists():
            print(f"Skipping {task_uuid}: no info.json found")
            continue
        
        try:
            # Read info.json
            with open(info_json_path, 'r', encoding='utf-8') as f:
                info_data = json.load(f)
            
            # Extract basic information
            title = info_data.get('title', 'Unknown Title')
            url = info_data.get('webpage_url') or info_data.get('url', '')
            
            if not url:
                print(f"Skipping {task_uuid}: no URL found in info.json")
                continue
            
            platform = determine_platform(url)
            embed_url = create_embed_url(url, platform)
            
            # Get file creation time for timestamps
            info_stat = info_json_path.stat()
            created_at = datetime.fromtimestamp(info_stat.st_ctime, tz=timezone.utc).isoformat()
            last_modified = datetime.fromtimestamp(info_stat.st_mtime, tz=timezone.utc).isoformat()
            
            # Check for existing files in the task directory
            media_files = {}
            vtt_files = {}
            srt_files = {}
            ass_files = {}
            
            # Look for video files
            for ext in ['*.mp4', '*.webm', '*.mkv', '*.avi', '*.mov']:
                for video_file in task_dir.glob(ext):
                    # Determine quality from filename or use 'best'
                    quality = 'best'  # Default
                    if '720p' in video_file.name:
                        quality = '720p'
                    elif '1080p' in video_file.name:
                        quality = '1080p'
                    elif '480p' in video_file.name:
                        quality = '480p'
                    elif '360p' in video_file.name:
                        quality = '360p'
                    
                    rel_path = f"{task_uuid}/{video_file.name}"
                    media_files[quality] = rel_path
            
            # Look for VTT files
            for vtt_file in task_dir.glob('*.vtt'):
                # Determine language from filename
                lang = 'en'  # default
                if 'zh' in vtt_file.name.lower() or 'chinese' in vtt_file.name.lower():
                    lang = 'zh-Hans'
                elif 'en' in vtt_file.name.lower() or 'english' in vtt_file.name.lower():
                    lang = 'en'
                
                rel_path = f"{task_uuid}/{vtt_file.name}"
                vtt_files[lang] = rel_path
            
            # Look for SRT files
            for srt_file in task_dir.glob('*.srt'):
                # Determine language from filename
                lang = 'srt'  # generic
                if 'zh' in srt_file.name.lower() or 'chinese' in srt_file.name.lower():
                    lang = 'zh-Hans'
                elif 'en' in srt_file.name.lower() or 'english' in srt_file.name.lower():
                    lang = 'en'
                
                rel_path = f"{task_uuid}/{srt_file.name}"
                srt_files[lang] = rel_path
            
            # Look for ASS files
            for ass_file in task_dir.glob('*.ass'):
                # Determine language from filename
                lang = 'ass'  # generic
                if 'zh' in ass_file.name.lower() or 'chinese' in ass_file.name.lower():
                    lang = 'zh-Hans'
                elif 'en' in ass_file.name.lower() or 'english' in ass_file.name.lower():
                    lang = 'en'
                
                rel_path = f"{task_uuid}/{ass_file.name}"
                ass_files[lang] = rel_path
            
            # Look for thumbnail
            thumbnail_path = None
            for ext in ['*.jpg', '*.jpeg', '*.png', '*.webp']:
                for thumb_file in task_dir.glob(ext):
                    if 'thumb' in thumb_file.name.lower() or 'thumbnail' in thumb_file.name.lower():
                        thumbnail_path = f"{task_uuid}/{thumb_file.name}"
                        break
                if thumbnail_path:
                    break
            
            # Create metadata entry
            task_metadata = {
                "uuid": task_uuid,
                "url": url,
                "platform": platform,
                "title": title,
                "thumbnail_path": thumbnail_path,
                "info_json_path": f"{task_uuid}/info.json",
                "media_files": media_files,
                "extracted_wav_path": None,
                "vtt_files": vtt_files,
                "vtt_files_segmented": {},
                "srt_files": srt_files,
                "raw_srt_files": [],
                "srt_md_files": {},
                "ass_files": ass_files,
                "whisperx_json_path": None,
                "transcription_model": None,
                "parallel_vtt_md_path": None,
                "merged_format_vtt_md_path": None,
                "en_only_vtt_md_path": None,
                "zh_only_vtt_md_path": None,
                "en_only_vtt_timestamp_md_path": None,
                "zh_only_vtt_timestamp_md_path": None,
                "merged_whisperx_md_path": None,
                "archived": False,
                "downloaded_audio_path": None,
                "embed_url": embed_url,
                "created_at": created_at,
                "last_modified": last_modified,
                "keyframes_json_path": None,
                "keyframes_count": 0,
                "keyframes_extracted_at": None,
                "keyframes_quality": None
            }
            
            # Add to metadata
            metadata[task_uuid] = task_metadata
            restored_count += 1
            
            print(f"Restored task {task_uuid}: {title}")
            print(f"  URL: {url}")
            print(f"  Platform: {platform}")
            print(f"  Media files: {len(media_files)}")
            print(f"  VTT files: {len(vtt_files)}")
            print(f"  SRT files: {len(srt_files)}")
            print(f"  ASS files: {len(ass_files)}")
            
        except Exception as e:
            print(f"Error processing {task_uuid}: {e}")
            continue
    
    if restored_count > 0:
        # Backup original metadata
        backup_file = metadata_file.with_suffix('.json.backup')
        print(f"Creating backup at {backup_file}")
        with open(backup_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, indent=4, ensure_ascii=False, fp=f)
        
        # Save updated metadata
        print(f"Saving updated metadata with {len(metadata)} total tasks")
        with open(metadata_file, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=4, ensure_ascii=False)
        
        print(f"Successfully restored {restored_count} orphaned tasks!")
    else:
        print("No tasks were restored.")

if __name__ == "__main__":
    restore_orphaned_tasks() 