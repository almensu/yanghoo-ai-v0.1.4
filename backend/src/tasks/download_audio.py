import json
import os
import requests
import logging
from pathlib import Path
import threading
from typing import Dict, Optional, Tuple
import ffmpeg

logger = logging.getLogger(__name__)
metadata_lock = threading.Lock()

# Define platforms suitable for direct audio download
AUDIO_DOWNLOAD_PLATFORMS = ["xiaoyuzhou", "podcast"] # Add more as needed

# Define preferred audio extensions/codecs order
PREFERRED_AUDIO_EXT = ['m4a', 'mp3', 'opus']

def find_best_audio_format(info_dict: Dict) -> Optional[Tuple[str, str]]:
    """
    Finds the best audio format URL and its extension from the info_dict.
    Prioritizes audio-only formats based on PREFERRED_AUDIO_EXT.
    Falls back to checking top-level URL if it looks like audio.

    Returns: Tuple(URL, extension) or None
    """
    formats = info_dict.get('formats', [])
    
    # Sort formats: prefer audio-only, then by preference list, then by bitrate
    def sort_key(f):
        is_audio_only = f.get('vcodec') == 'none' and f.get('acodec') != 'none'
        ext = f.get('ext')
        pref_index = PREFERRED_AUDIO_EXT.index(ext) if ext in PREFERRED_AUDIO_EXT else len(PREFERRED_AUDIO_EXT)
        abr = f.get('abr', 0) or 0 # Audio bitrate
        tbr = f.get('tbr', 0) or 0 # Total bitrate (fallback)
        return (not is_audio_only, pref_index, -(abr or tbr)) # Sort True (not audio-only) later

    sorted_formats = sorted(formats, key=sort_key)

    for f in sorted_formats:
        url = f.get('url')
        ext = f.get('ext')
        # Check if it's likely an audio format we want
        if url and ext in PREFERRED_AUDIO_EXT and f.get('vcodec') == 'none':
            logger.info(f"Found suitable audio format: ext='{ext}', abr={f.get('abr')}, url starts with: {url[:50]}...")
            return url, ext
            
    # Fallback: Check top-level URL if no suitable format found
    top_level_url = info_dict.get('url')
    top_level_ext = info_dict.get('ext')
    if top_level_url and top_level_ext in PREFERRED_AUDIO_EXT:
         logger.info(f"Falling back to top-level URL: ext='{top_level_ext}', url starts with: {top_level_url[:50]}...")
         return top_level_url, top_level_ext
         
    logger.warning("No suitable audio format URL found in info_dict.")
    return None

def download_audio_sync(task_uuid: str, metadata_file: str) -> Optional[str]:
    """
    Downloads the best audio stream directly for supported platforms AND converts it to WAV.
    
    Returns:
        Relative path to the converted audio.wav file, or None on failure.
    """
    logger.info(f"Attempting direct audio download and conversion to WAV for task {task_uuid}")
    
    # --- Load Metadata --- 
    try:
        with metadata_lock:
            with open(metadata_file, 'r') as f:
                main_metadata = json.load(f)
    except Exception as e:
        logger.error(f"Failed to load metadata file {metadata_file}: {e}")
        return None
        
    task_data = main_metadata.get(task_uuid)
    if not task_data:
        logger.error(f"Task {task_uuid} not found in metadata.")
        return None
        
    platform = task_data.get("platform")
    if platform not in AUDIO_DOWNLOAD_PLATFORMS:
        logger.warning(f"Platform '{platform}' not supported for direct audio download. Skipping task {task_uuid}.")
        return None
        
    info_json_path_str = task_data.get("info_json_path")
    if not info_json_path_str:
        logger.error(f"info_json_path not found for task {task_uuid}. Cannot download audio.")
        return None
        
    # Resolve info.json path correctly relative to backend directory
    metadata_path_obj = Path(metadata_file)
    data_dir = metadata_path_obj.parent # Should be backend/data
    # backend_dir = data_dir.parent      # Should be backend/  <-- REMOVE THIS or comment out
    info_json_path = (data_dir / info_json_path_str).resolve() # <-- USE data_dir here
    logger.debug(f"Resolved info.json absolute path: {info_json_path}") # Add debug log
    
    if not info_json_path.exists():
        logger.error(f"Info JSON file not found at {info_json_path}")
        return None
        
    # --- Load Info JSON --- 
    try:
        with open(info_json_path, 'r') as f:
            info_data = json.load(f)
    except Exception as e:
         logger.error(f"Failed to load or parse info.json {info_json_path}: {e}")
         return None
         
    # --- Find Best Audio URL --- 
    audio_format_info = find_best_audio_format(info_data)
    if not audio_format_info:
        logger.error(f"Could not find a suitable audio download URL for task {task_uuid}.")
        return None
        
    audio_url, audio_ext = audio_format_info
    
    # --- Download Original Audio --- 
    metadata_path_obj = Path(metadata_file)
    data_dir = metadata_path_obj.parent # Should be backend/data
    task_data_dir = data_dir / task_uuid 
    task_data_dir.mkdir(parents=True, exist_ok=True)
    # Temporary filename for the original download
    temp_output_filename = f"audio_original.{audio_ext}" 
    temp_output_path = task_data_dir / temp_output_filename
    
    logger.info(f"Downloading original audio for {task_uuid} from {audio_url[:50]}... to {temp_output_path}")
    try:
        response = requests.get(audio_url, stream=True, timeout=60) 
        response.raise_for_status()
        
        with open(temp_output_path, 'wb') as f_out:
            for chunk in response.iter_content(chunk_size=8192):
                f_out.write(chunk)
                
        logger.info(f"Successfully downloaded original audio for {task_uuid} to {temp_output_path}")
        
    except requests.exceptions.RequestException as req_e:
        logger.error(f"Failed to download original audio for {task_uuid}: {req_e}")
        return None
    except IOError as io_e:
        logger.error(f"Failed to save downloaded original audio for {task_uuid} to {temp_output_path}: {io_e}")
        return None
    except Exception as e:
        logger.error(f"An unexpected error occurred during original audio download for {task_uuid}: {e}", exc_info=True)
        # Clean up potentially partially downloaded file
        if temp_output_path.exists(): 
             try: temp_output_path.unlink() 
             except OSError: pass
        return None

    # --- Convert to WAV --- 
    wav_output_filename = "audio.wav"
    wav_output_path = task_data_dir / wav_output_filename

    try:
        logger.info(f"Converting {temp_output_path} to {wav_output_path}")
        (   # Standard WAV settings: 16kHz, mono, 16-bit PCM
            ffmpeg
            .input(str(temp_output_path))
            .output(str(wav_output_path), acodec='pcm_s16le', ar='16000', ac=1) 
            .overwrite_output()
            .run(capture_stdout=True, capture_stderr=True)
        )
        logger.info(f"Successfully converted audio to {wav_output_path}")
    except ffmpeg.Error as e:
        stderr_output = e.stderr.decode() if e.stderr else "No stderr"
        logger.error(f"ffmpeg error during conversion for {task_uuid}: {stderr_output}")
        # Clean up intermediate file before returning None
        if temp_output_path.exists(): 
            try: temp_output_path.unlink() 
            except OSError: pass
        return None
    except Exception as e:
         logger.error(f"Unexpected error during conversion for {task_uuid}: {e}")
         # Clean up intermediate file before returning None
         if temp_output_path.exists(): 
             try: temp_output_path.unlink() 
             except OSError: pass
         return None

    # --- Clean up intermediate downloaded file --- 
    try:
        logger.info(f"Deleting intermediate audio file: {temp_output_path}")
        temp_output_path.unlink()
    except OSError as del_e:
        logger.warning(f"Could not delete intermediate audio file {temp_output_path}: {del_e}") # Non-critical

    # --- Return path to WAV file relative to data_dir --- 
    try:
        relative_wav_path_for_metadata = wav_output_path.relative_to(data_dir)
        return str(relative_wav_path_for_metadata).replace("\\", "/")
    except ValueError as e:
        logger.error(f"Could not calculate relative path for {wav_output_path} based on {data_dir}: {e}")
        return None # Return None if path calculation fails
