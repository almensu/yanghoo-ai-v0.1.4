import logging
import os # Replace pathlib with os
import shutil
import json
from uuid import UUID
from typing import Dict, List
import aiofiles
import yt_dlp
import ffmpeg
import torch
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
# from pathlib import Path # Remove Path import
from pydantic import ValidationError
from pydantic.json import pydantic_encoder

# --- Schemas Import --- 
from .schemas import (
    IngestRequest, IngestResponse, TaskMetadata, 
    FetchInfoJsonResponse, 
    DownloadMediaRequest, DownloadMediaResponse,
    ExtractAudioResponse,
    TranscribeRequest, TranscribeResponse, Platform,
    MergeResponse
)
# --- Tasks Import --- 
from .tasks.ingest import create_ingest_task
from .tasks.fetch_info_json import run_fetch_info_json
from .tasks.download_media import run_download_media
from .tasks.extract_audio import run_extract_audio
from .tasks.transcribe_youtube_vtt import run_transcribe_youtube_vtt
from .tasks.transcribe_whisperx import run_transcribe_whisperx
from .tasks.merge_vtt import run_merge_vtt
from .tasks.merge_whisperx import run_merge_whisperx
# --- Data Management Import --- 
from .data_management import delete_video_files_sync, delete_audio_file_sync
# ------------------------
from fastapi.concurrency import run_in_threadpool

# Calculate paths relative to this file (main.py) using os.path
# __file__ gives the path to the current script (main.py)
SRC_DIR = os.path.dirname(os.path.abspath(__file__)) # Use os.path equivalent
# Go up one level to backend/
BACKEND_DIR = os.path.dirname(SRC_DIR)
# Path to the data directory: project_root/backend/data/
DATA_DIR = os.path.join(BACKEND_DIR, "data")

app = FastAPI()

# Ensure the directory exists before mounting
os.makedirs(DATA_DIR, exist_ok=True) # Use os.makedirs
# Mount the calculated 'data' directory path
app.mount("/files", StaticFiles(directory=DATA_DIR), name="static_files") 

# Define base directory and metadata file path using os.path
BASE_DIR = DATA_DIR # BASE_DIR is now a string path
METADATA_FILE = os.path.join(BASE_DIR, "metadata.json")

async def load_metadata() -> Dict[str, TaskMetadata]:
    if not os.path.exists(METADATA_FILE): # Use os.path.exists
        return {}
    valid_metadata = {} 
    try:
        async with aiofiles.open(METADATA_FILE, mode='r') as f:
            content = await f.read()
            if not content.strip():
                 logger.warning(f"Metadata file is empty: {METADATA_FILE}")
                 return {}
            data = json.loads(content)
            for uuid_str, meta_dict in data.items():
                try:
                    task_meta = TaskMetadata(**meta_dict)
                    valid_metadata[uuid_str] = task_meta
                except ValidationError as e:
                    logger.warning(f"Skipping task {uuid_str} due to validation error: {e}")
            return valid_metadata
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Error reading or parsing metadata file {METADATA_FILE}: {e}")
        return {}
    except Exception as e:
        logger.error(f"Unexpected error loading metadata: {e}", exc_info=True)
        return {}

async def save_metadata(metadata: Dict[str, TaskMetadata]):
    try:
        async with aiofiles.open(METADATA_FILE, mode='w') as f:
            await f.write(json.dumps(metadata, indent=4, default=pydantic_encoder))
    except IOError as e:
        logger.error(f"Error saving metadata: {e}") # Use logger

@app.post("/api/ingest", response_model=IngestResponse)
async def ingest_url(request: IngestRequest):
    try:
        # Pass BASE_DIR (string) to the task function
        task_metadata = await create_ingest_task(str(request.url), BASE_DIR)
        all_metadata = await load_metadata()
        all_metadata[str(task_metadata.uuid)] = task_metadata
        await save_metadata(all_metadata)
        return IngestResponse(metadata=task_metadata)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Internal server error during ingest: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Add endpoint to list all tasks
@app.get("/api/tasks", response_model=List[TaskMetadata])
async def list_tasks():
    metadata = await load_metadata()
    return list(metadata.values())

# Add endpoint to get a specific task's metadata
@app.get("/api/tasks/{task_uuid}", response_model=TaskMetadata)
async def get_task(task_uuid: UUID):
    metadata = await load_metadata()
    task_meta = metadata.get(str(task_uuid))
    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_meta

# Add endpoint to delete a specific task
@app.delete("/api/tasks/{task_uuid}", status_code=204)
async def delete_task(task_uuid: UUID):
    all_metadata = await load_metadata()
    task_uuid_str = str(task_uuid)

    if task_uuid_str not in all_metadata:
        raise HTTPException(status_code=404, detail="Task not found")

    del all_metadata[task_uuid_str]
    await save_metadata(all_metadata)

    # Delete the task's data directory using os.path
    task_dir = os.path.join(BASE_DIR, task_uuid_str) # Use os.path.join
    if os.path.exists(task_dir) and os.path.isdir(task_dir): # Use os.path methods
        try:
            shutil.rmtree(task_dir)
            logger.info(f"Successfully deleted directory: {task_dir}") # Use logger
        except OSError as e:
            logger.error(f"Error deleting directory {task_dir}: {e}") 
    else:
        logger.warning(f"Task directory not found or is not a directory: {task_dir}") # Use logger

    return

# Placeholder for future task endpoints
@app.post("/api/tasks/{task_uuid}/fetch_info_json", response_model=FetchInfoJsonResponse)
async def fetch_info_json_endpoint(task_uuid: UUID):
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(str(task_uuid))

    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # Check if info.json exists using os.path
    info_json_abs_path = None
    if task_meta.info_json_path:
        # Assume path stored is relative to BACKEND_DIR
        info_json_abs_path = os.path.join(BACKEND_DIR, task_meta.info_json_path)

    if info_json_abs_path and os.path.exists(info_json_abs_path):
         return FetchInfoJsonResponse(
            task_uuid=task_uuid,
            info_json_path=task_meta.info_json_path,
            message="info.json already exists."
        )

    try:
        # Pass BASE_DIR (string) to task
        info_json_rel_path = await run_fetch_info_json(task_meta, BASE_DIR)
        task_meta.info_json_path = info_json_rel_path
        all_metadata[str(task_uuid)] = task_meta
        await save_metadata(all_metadata)
        return FetchInfoJsonResponse(
            task_uuid=task_uuid,
            info_json_path=info_json_rel_path,
            message="info.json downloaded successfully."
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except yt_dlp.utils.DownloadError as e:
        raise HTTPException(status_code=500, detail=f"Failed to download info.json: {e}")
    except Exception as e:
        logger.error(f"Error in fetch_info_json endpoint for {task_uuid}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error during fetch_info_json: {str(e)}")

@app.post("/api/tasks/{task_uuid}/download_media", response_model=DownloadMediaResponse)
async def download_media_endpoint(task_uuid: UUID, request: DownloadMediaRequest):
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(str(task_uuid))

    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")

    quality = request.quality
    try:
        # Pass BASE_DIR (string) to task
        media_rel_path = await run_download_media(task_meta, quality, BASE_DIR)
        if task_meta.media_files is None:
            task_meta.media_files = {}
        task_meta.media_files[quality] = media_rel_path
        all_metadata[str(task_uuid)] = task_meta
        await save_metadata(all_metadata)
        return DownloadMediaResponse(
            task_uuid=task_uuid,
            quality=quality,
            media_path=media_rel_path,
            message=f"Media ({quality}) downloaded successfully."
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except yt_dlp.utils.DownloadError as e:
        error_detail = f"Failed to download media ({quality}): {str(e)}"
        if "Unsupported URL" in str(e):
             error_detail = f"Download failed: Unsupported URL ({task_meta.url}) for media download."
        elif "format not available" in str(e).lower():
             error_detail = f"Download failed: Quality '{quality}' not available for this media."
        
        raise HTTPException(status_code=500, detail=error_detail)
    except Exception as e:
        logger.error(f"Error in download_media endpoint for {task_uuid} (Quality: {quality}): {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error during media download: {str(e)}")

@app.post("/api/tasks/{task_uuid}/extract_audio", response_model=ExtractAudioResponse)
async def extract_audio_endpoint(task_uuid: UUID):
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(str(task_uuid))

    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")

    if not task_meta.media_files or not any(task_meta.media_files.values()): # Check if any video path exists
        raise HTTPException(
            status_code=400, 
            detail="Cannot extract audio: No media files found in metadata. Please download video/audio first."
        )
        
    # Check if already extracted using os.path
    extracted_wav_abs_path = None
    if task_meta.extracted_wav_path:
        # Assume path stored is relative to BACKEND_DIR
        extracted_wav_abs_path = os.path.join(BACKEND_DIR, task_meta.extracted_wav_path)
        
    if extracted_wav_abs_path and os.path.exists(extracted_wav_abs_path):
        logger.info(f"Audio already extracted for task {task_uuid}")
        return ExtractAudioResponse(
            task_uuid=task_uuid,
            wav_path=task_meta.extracted_wav_path,
            message="Audio already extracted."
        )

    try:
        logger.info(f"Starting audio extraction for task {task_uuid}")
        # Pass BASE_DIR (string) to task
        extracted_wav_rel_path = await run_extract_audio(task_meta, BASE_DIR)
        task_meta.extracted_wav_path = extracted_wav_rel_path
        all_metadata[str(task_uuid)] = task_meta
        await save_metadata(all_metadata)
        logger.info(f"Successfully extracted audio for task {task_uuid} to {extracted_wav_rel_path}")
        return ExtractAudioResponse(
            task_uuid=task_uuid,
            wav_path=extracted_wav_rel_path,
            message="Audio extracted successfully."
        )
    except FileNotFoundError as e:
        logger.error(f"Audio extraction failed for {task_uuid}: Input file not found - {e}")
        raise HTTPException(status_code=404, detail=str(e))
    except ValueError as e:
        logger.error(f"Audio extraction failed for {task_uuid}: Value error - {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except ffmpeg.Error as e:
        logger.error(f"Audio extraction failed for {task_uuid} due to ffmpeg error: {e}")
        raise HTTPException(status_code=500, detail=f"ffmpeg error during audio extraction: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during audio extraction for {task_uuid}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error during audio extraction: {str(e)}")

@app.post("/api/tasks/{task_uuid}/merge", response_model=MergeResponse)
async def merge_transcripts_endpoint(task_uuid: UUID):
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(str(task_uuid))

    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")

    merged_md_path = None
    source_files = []
    message = ""
    
    # Helper to check path existence using os.path, assuming relative to BACKEND_DIR
    def check_rel_path_exists(rel_path):
        if not rel_path: return False
        return os.path.exists(os.path.join(BACKEND_DIR, rel_path))

    try:
        if task_meta.platform == Platform.YOUTUBE:
            logger.info(f"Starting VTT merge for YouTube task {task_uuid}")
            if task_meta.merged_vtt_md_path and check_rel_path_exists(task_meta.merged_vtt_md_path):
                logger.info(f"Merged VTT markdown already exists for {task_uuid}")
                merged_md_path = task_meta.merged_vtt_md_path
                source_files = [os.path.join(BACKEND_DIR, p) for p in task_meta.vtt_files.values() if p] 
                message = "Merged VTT markdown file already exists."
            else:
                if not task_meta.vtt_files:
                     raise HTTPException(status_code=400, detail="Cannot merge: No VTT files found in metadata. Run VTT transcription first.")
                vtt_paths_exist = [ check_rel_path_exists(p) for p in task_meta.vtt_files.values() if p ]
                if not any(vtt_paths_exist):
                    raise HTTPException(status_code=400, detail="Cannot merge: Source VTT files listed in metadata not found on disk.")
                
                # Pass BASE_DIR (string) to task
                merged_md_path, source_files_abs = await run_merge_vtt(task_meta, BASE_DIR)
                task_meta.merged_vtt_md_path = merged_md_path # Assuming task returns relative path
                message = f"VTT transcripts merged successfully into markdown."
                logger.info(message)
                all_metadata[str(task_uuid)] = task_meta
                await save_metadata(all_metadata)
                # Get filenames from absolute paths returned by task
                source_files = [os.path.basename(p) for p in source_files_abs]
        
        else: # Non-YouTube platforms merge WhisperX JSON
            logger.info(f"Starting WhisperX merge for task {task_uuid}")
            if task_meta.merged_whisperx_md_path and check_rel_path_exists(task_meta.merged_whisperx_md_path):
                 logger.info(f"Merged WhisperX markdown already exists for {task_uuid}")
                 merged_md_path = task_meta.merged_whisperx_md_path
                 source_files = [os.path.basename(os.path.join(BACKEND_DIR, task_meta.whisperx_json_path))] if task_meta.whisperx_json_path else []
                 message = "Merged WhisperX markdown file already exists."
            else:
                if not task_meta.whisperx_json_path or not check_rel_path_exists(task_meta.whisperx_json_path):
                    raise HTTPException(status_code=400, detail="Cannot merge: WhisperX JSON file not found. Run WhisperX transcription first.")

                # Pass BASE_DIR (string) to task
                merged_md_path, source_files_abs = await run_merge_whisperx(task_meta, BASE_DIR)
                task_meta.merged_whisperx_md_path = merged_md_path # Assuming task returns relative path
                message = f"WhisperX transcript merged successfully into markdown."
                logger.info(message)
                all_metadata[str(task_uuid)] = task_meta
                await save_metadata(all_metadata)
                # Get filenames from absolute paths returned by task
                source_files = [os.path.basename(p) for p in source_files_abs]

        return MergeResponse(
            task_uuid=task_uuid,
            merged_file_path=merged_md_path,
            source_files=source_files, 
            message=message
        )

    except (FileNotFoundError, ValueError) as e:
        logger.error(f"Merge error for {task_uuid}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during merge for {task_uuid}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error during merge: {str(e)}")

# <<< Add New Endpoints Here >>>
@app.delete("/api/tasks/{task_uuid}/media/video", status_code=204)
async def delete_task_video_files(task_uuid: UUID):
    """
    Deletes video files associated with a task and updates metadata.
    """
    all_metadata = await load_metadata()
    task_uuid_str = str(task_uuid)

    if task_uuid_str not in all_metadata:
        raise HTTPException(status_code=404, detail="Task not found")

    task_meta = all_metadata[task_uuid_str]
    task_meta_dict = task_meta.dict() # Work with dict for sync function

    try:
        # Pass DATA_DIR (string) to sync function
        updated_task_meta_dict = await run_in_threadpool(
            delete_video_files_sync, 
            uuid=task_uuid_str, 
            entry=task_meta_dict, 
            data_dir=DATA_DIR # Pass string path
        )
        
        # Update the specific field in the Pydantic model
        if 'media_files' in updated_task_meta_dict:
            task_meta.media_files = updated_task_meta_dict['media_files']
        else:
             task_meta.media_files = {}

        all_metadata[task_uuid_str] = task_meta
        await save_metadata(all_metadata)
        
        logger.info(f"Successfully processed video files for task {task_uuid_str}") # Adjusted log msg
        return

    except Exception as e:
        logger.error(f"Error processing video files for task {task_uuid_str}: {e}", exc_info=True) # Adjusted log msg
        raise HTTPException(status_code=500, detail=f"Failed to process video files: {str(e)}")

@app.delete("/api/tasks/{task_uuid}/media/audio", status_code=204)
async def delete_task_audio_file(task_uuid: UUID):
    """
    Deletes the audio file associated with a task and updates metadata.
    """
    all_metadata = await load_metadata()
    task_uuid_str = str(task_uuid)

    if task_uuid_str not in all_metadata:
        raise HTTPException(status_code=404, detail="Task not found")

    task_meta = all_metadata[task_uuid_str]
    task_meta_dict = task_meta.dict() # Work with dict for sync function

    try:
        # Pass DATA_DIR (string) to sync function
        updated_task_meta_dict = await run_in_threadpool(
            delete_audio_file_sync, 
            uuid=task_uuid_str, 
            entry=task_meta_dict, 
            data_dir=DATA_DIR # Pass string path
        )
        
        # Update the specific field in the Pydantic model
        task_meta.extracted_wav_path = updated_task_meta_dict.get('extracted_wav_path') 

        all_metadata[task_uuid_str] = task_meta
        await save_metadata(all_metadata)
        
        logger.info(f"Successfully processed audio file for task {task_uuid_str}") # Adjusted log msg
        return

    except Exception as e:
        logger.error(f"Error processing audio file for task {task_uuid_str}: {e}", exc_info=True) # Adjusted log msg
        raise HTTPException(status_code=500, detail=f"Failed to process audio file: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    from pydantic import ValidationError 
    uvicorn.run(app, host="0.0.0.0", port=8000) 