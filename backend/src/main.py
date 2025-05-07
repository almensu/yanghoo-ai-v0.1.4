import logging
import os # Keep os for makedirs etc.
from pathlib import Path # Import Path
import shutil
import json
from uuid import UUID
from typing import Dict, List, Optional, Literal, Any
import aiofiles
import yt_dlp
import ffmpeg
import torch
import subprocess
import sys
import asyncio
import mimetypes # 添加 mimetypes 导入
import uuid
import shlex
from fastapi import BackgroundTasks # Import BackgroundTasks
from pydantic import BaseModel, Field # Import BaseModel and Field
import re

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect, Query
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
# from pathlib import Path # Remove Path import
from pydantic import ValidationError, BaseModel
from pydantic.json import pydantic_encoder
from fastapi.responses import FileResponse # Import FileResponse

# --- Schemas Import --- 
from .schemas import (
    IngestRequest, IngestResponse, TaskMetadata, 
    FetchInfoJsonResponse, 
    DownloadMediaRequest, DownloadMediaResponse,
    ExtractAudioResponse,
    TranscribeRequest, TranscribeResponse, Platform,
    MergeResponse,
    DownloadAudioResponse
)
# --- Tasks Import --- 
from .tasks.ingest import create_ingest_task
from .tasks.fetch_info_json import run_fetch_info_json
from .tasks.download_media import run_download_media
from .tasks.extract_audio import run_extract_audio
from .tasks.transcribe_youtube_vtt import run_transcribe_youtube_vtt
from .tasks.merge_vtt import main as run_merge_vtt
from .tasks.merge_whisperx import run_merge_whisperx
from .tasks.download_youtueb_vtt import download_youtube_vtt
from .tasks.download_audio import download_audio_sync, AUDIO_DOWNLOAD_PLATFORMS
# --- Data Management Import --- 
from .data_management import delete_video_files_sync, delete_audio_file_sync
# --- Restore Archived Task Import ---
from .tasks.Restore_Archived import restore_archived_metadata
# --- Audio to Media Task Import ---
from .tasks.audio_to_media import create_video_from_audio_image
# --- 工具函数导入 ---
from .utils import extract_youtube_video_id # 导入提取函数
# ------------------------
from fastapi.concurrency import run_in_threadpool

# Use pathlib for paths
SRC_DIR = Path(__file__).parent.resolve()
BACKEND_DIR = SRC_DIR.parent
DATA_DIR = BACKEND_DIR / "data"

app = FastAPI()

# --- Add CORS Middleware --- 
# Allow origins (e.g., your frontend development server)
origins = [
    "http://localhost:3000", # React default dev port
    "http://127.0.0.1:3000", # Also allow 127.0.0.1 for the frontend
    "http://localhost:8080", # Vue default dev port (example)
    "http://localhost:4200", # Angular default dev port (example)
    # Add any other origins you might use (e.g., deployed frontend URL)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"], # Allow all methods (GET, POST, DELETE, etc.)
    allow_headers=["*"], # Allow all headers
)
# --- End CORS Middleware ---

# Ensure the directory exists using pathlib
DATA_DIR.mkdir(parents=True, exist_ok=True)

# Mount the calculated 'data' directory path (StaticFiles needs a string)
app.mount("/files", StaticFiles(directory=str(DATA_DIR)), name="static_files")

# Define base directory and metadata file path using pathlib
BASE_DIR = DATA_DIR # BASE_DIR is now a Path object
METADATA_FILE = BASE_DIR / "metadata.json"
# --- NEW: Define Archive File Path --- 
METADATA_ARCHIVED_FILE = BASE_DIR / "metadata_archived.json"

# --- WebSocket Connection Manager ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket connection established: {websocket.client}")

    def disconnect(self, websocket: WebSocket):
        # Add check before removing to prevent race condition errors
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket connection closed: {websocket.client}")
        else:
            logger.warning(f"Attempted to disconnect websocket already removed: {websocket.client}")

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def send_json(self, data: Dict[str, Any], websocket: WebSocket):
        await websocket.send_json(data)
        
    async def broadcast(self, data: Dict[str, Any]):
        disconnected_clients = []
        message_str = json.dumps(data, default=pydantic_encoder) # Use pydantic_encoder if broadcasting TaskMetadata
        logger.info(f"Broadcasting message to {len(self.active_connections)} clients: {message_str[:200]}...")
        for connection in self.active_connections:
            try:
                await connection.send_json(data)
            except WebSocketDisconnect:
                logger.warning(f"Client disconnected during broadcast: {connection.client}")
                disconnected_clients.append(connection)
            except Exception as e:
                logger.error(f"Error sending message to client {connection.client}: {e}", exc_info=False) # Log less verbosely
                disconnected_clients.append(connection) # Also remove clients causing errors
                
        # Clean up disconnected clients after broadcasting
        for client in disconnected_clients:
            if client in self.active_connections: # Check if not already removed by another process/exception
                 self.disconnect(client)

manager = ConnectionManager()
# --- End WebSocket Connection Manager ---

# --- 新增：填充 embed_url 的辅助函数 ---
def _populate_embed_url(task_meta: TaskMetadata):
    """Helper to populate embed_url if platform is YouTube."""
    if task_meta.platform == Platform.YOUTUBE and task_meta.url:
        video_id = extract_youtube_video_id(task_meta.url)
        if video_id:
            # Pydantic v2 会自动验证 HttpUrl，如果格式无效会抛错，需要处理
            try:
                task_meta.embed_url = f"https://www.youtube.com/embed/{video_id}"
            except Exception as e: # 捕获可能的验证错误
                logger.warning(f"无法为任务 {task_meta.uuid} 构建或验证有效的 embed_url: {e}")
                task_meta.embed_url = None # 确保无效时不设置
    return task_meta
# --- 结束辅助函数 ---

async def load_metadata() -> Dict[str, TaskMetadata]:
    if not METADATA_FILE.exists(): # Use pathlib
        return {}
    valid_metadata = {} 
    try:
        # Use METADATA_FILE (Path object) directly with aiofiles
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
    # Need to return valid_metadata here if successful
    return valid_metadata

async def save_metadata(metadata: Dict[str, TaskMetadata]):
    logger.info(f"Attempting to save metadata. Data to save: {metadata}") # Log the data
    try:
        # Use METADATA_FILE (Path object) directly with aiofiles
        async with aiofiles.open(METADATA_FILE, mode='w', encoding='utf-8') as f:
            content_to_write = json.dumps(metadata, indent=4, default=pydantic_encoder, ensure_ascii=False)
            logger.debug(f"Content prepared for writing to {METADATA_FILE}:\n{content_to_write}") # Log exact content
            await f.write(content_to_write)
        logger.info(f"Successfully saved metadata to {METADATA_FILE}") # Log success
    except IOError as e:
        logger.error(f"Error saving metadata to {METADATA_FILE}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during metadata save to {METADATA_FILE}: {e}", exc_info=True)

# --- NEW: Load/Save for Archived Metadata --- 
# Simple dictionary structure for archived data
async def load_archived_metadata() -> Dict[str, Dict]: 
    if not METADATA_ARCHIVED_FILE.exists():
        return {}
    try:
        async with aiofiles.open(METADATA_ARCHIVED_FILE, mode='r') as f:
            content = await f.read()
            if not content.strip():
                 logger.warning(f"Archived metadata file is empty: {METADATA_ARCHIVED_FILE}")
                 return {}
            # Basic JSON load, no Pydantic validation needed here
            data = json.loads(content)
            return data
    except (json.JSONDecodeError, IOError) as e:
        logger.error(f"Error reading or parsing archived metadata file {METADATA_ARCHIVED_FILE}: {e}")
        return {}
    except Exception as e:
        logger.error(f"Unexpected error loading archived metadata: {e}", exc_info=True)
        return {}

async def save_archived_metadata(metadata: Dict[str, Dict]):
    logger.info(f"Attempting to save archived metadata.")
    try:
        async with aiofiles.open(METADATA_ARCHIVED_FILE, mode='w') as f:
            # Use default JSON encoder, archived data is simple dict
            content_to_write = json.dumps(metadata, indent=4, ensure_ascii=False) 
            await f.write(content_to_write)
        logger.info(f"Successfully saved archived metadata to {METADATA_ARCHIVED_FILE}")
    except IOError as e:
        logger.error(f"Error saving archived metadata to {METADATA_ARCHIVED_FILE}: {e}")
    except Exception as e:
        logger.error(f"Unexpected error during archived metadata save: {e}", exc_info=True)
# --- END: Load/Save for Archived Metadata --- 

@app.post("/api/ingest", response_model=IngestResponse)
async def ingest_url(request: IngestRequest):
    try:
        # Load existing metadata FIRST to check for duplicates
        all_metadata = await load_metadata()
        request_url_str = str(request.url) # Ensure URL is string for comparison

        # Check for existing URL
        for existing_uuid, existing_meta in all_metadata.items():
            if existing_meta.url == request_url_str:
                if existing_meta.archived:
                    logger.warning(f"Ingest failed: URL {request_url_str} already exists but is archived (UUID: {existing_uuid}).")
                    raise HTTPException(
                        status_code=409, # Conflict
                        detail=f"URL already exists but is archived (Task ID: {existing_uuid}). Consider restoring it instead."
                    )
                else:
                    logger.warning(f"Ingest failed: URL {request_url_str} already exists and is active (UUID: {existing_uuid}).")
                    raise HTTPException(
                        status_code=409, # Conflict
                        detail=f"URL already exists (Task ID: {existing_uuid})."
                    )
        
        # If no duplicate found, proceed with creating the task
        logger.info(f"URL {request_url_str} not found in existing metadata. Proceeding with ingest.")
        # Pass BASE_DIR (Path object) as string to the task function if it expects string
        # Or update the task function to accept Path
        task_metadata = await create_ingest_task(request_url_str, str(BASE_DIR))
        # Note: No need to reload metadata here, we already have it
        all_metadata[str(task_metadata.uuid)] = task_metadata
        await save_metadata(all_metadata)
        logger.info(f"Successfully ingested URL {request_url_str} with new UUID {task_metadata.uuid}")
        return IngestResponse(metadata=task_metadata)
    except ValueError as e:
        # Handle potential errors from create_ingest_task or platform detection
        logger.error(f"ValueError during ingest for URL {request.url}: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail=str(e))
    # Keep the existing HTTPException for duplicates (raised within the loop)
    except HTTPException as http_exc: 
        raise http_exc # Re-raise the 409 exception
    except Exception as e:
        logger.error(f"Internal server error during ingest for URL {request.url}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Add endpoint to list all tasks
@app.get("/api/tasks", response_model=List[TaskMetadata])
async def list_tasks():
    # Load both active and archived metadata
    active_metadata = await load_metadata() # Dict[str, TaskMetadata]
    archived_metadata = await load_archived_metadata() # Dict[str, Dict]
    
    # Create a set of archived UUIDs for efficient lookup
    archived_uuids = set(archived_metadata.keys())
    
    tasks_to_return = []
    
    # Iterate through tasks currently in the active metadata file
    for uuid_str, task_meta in active_metadata.items():
        # Check if this task's UUID is in the set of archived UUIDs
        is_archived = uuid_str in archived_uuids
        
        # Update the archived status on the TaskMetadata object
        task_meta.archived = is_archived
        
        # --- 调用 helper 来填充 embed_url ---
        task_meta = _populate_embed_url(task_meta) 
        # ------------------------------------
        
        tasks_to_return.append(task_meta)

    # Return the list of TaskMetadata objects, now with correct archived status
    return tasks_to_return

# Add endpoint to get a specific task's metadata
@app.get("/api/tasks/{task_uuid}", response_model=TaskMetadata)
async def get_task(task_uuid: UUID):
    metadata = await load_metadata()
    task_meta = metadata.get(str(task_uuid))
    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # --- 调用 helper 来填充 embed_url ---
    task_meta = _populate_embed_url(task_meta)
    # ------------------------------------

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

    # Delete the task's data directory using pathlib
    task_dir = BASE_DIR / task_uuid_str # Use pathlib
    if task_dir.exists() and task_dir.is_dir(): # Use pathlib methods
        try:
            shutil.rmtree(task_dir) # shutil works with Path objects
            logger.info(f"Successfully deleted directory: {task_dir}")
        except OSError as e:
            logger.error(f"Error deleting directory {task_dir}: {e}")
    else:
        logger.warning(f"Task directory not found or is not a directory: {task_dir}")

    return

# Placeholder for future task endpoints
@app.post("/api/tasks/{task_uuid}/fetch_info_json", response_model=FetchInfoJsonResponse)
async def fetch_info_json_endpoint(task_uuid: UUID):
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(str(task_uuid))

    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")
        
    # Check if info.json exists (relative to DATA_DIR)
    info_json_abs_path = None
    if task_meta.info_json_path:
        info_json_abs_path = DATA_DIR / task_meta.info_json_path # Corrected base

    if info_json_abs_path and info_json_abs_path.exists():
        return FetchInfoJsonResponse(
            task_uuid=task_uuid,
            info_json_path=task_meta.info_json_path,
            message="info.json already exists."
        )

    try:
        # run_fetch_info_json needs to return path relative to DATA_DIR
        # Assuming run_fetch_info_json internally uses DATA_DIR correctly
        info_json_rel_path = await run_fetch_info_json(task_meta, str(DATA_DIR)) # Pass DATA_DIR as base
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

@app.post("/api/tasks/{task_uuid}/download_vtt", status_code=200)
async def download_vtt_endpoint(task_uuid: UUID):
    task_uuid_str = str(task_uuid)
    logger.info(f"Received request to download VTT for task: {task_uuid_str}")
    
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(task_uuid_str)

    if not task_meta:
        logger.warning(f"Task not found for VTT download: {task_uuid_str}")
        raise HTTPException(status_code=404, detail="Task not found")

    if task_meta.platform != Platform.YOUTUBE:
         logger.warning(f"Attempted VTT download for non-YouTube task: {task_uuid_str} (Platform: {task_meta.platform})")
         raise HTTPException(status_code=400, detail="VTT download is only supported for YouTube videos.")

    # Get the TaskMetadata object needed by the async download function
    task_meta_obj = all_metadata.get(task_uuid_str)
    if not task_meta_obj:
        logger.warning(f"Task not found for VTT download: {task_uuid_str}")
        raise HTTPException(status_code=404, detail="Task not found")

    try:
        # Directly await the async download function
        downloaded_vtt_files = await download_youtube_vtt(task_meta_obj, str(METADATA_FILE))
        
        # Check the result returned by the function
        if downloaded_vtt_files:
            logger.info(f"Successfully downloaded VTT files for task: {task_uuid_str}. Files: {downloaded_vtt_files}")
            return {"message": "VTT download successful.", "vtt_files": downloaded_vtt_files}
        else:
            # Function returned empty dict, likely due to yt-dlp error or no subs found
            logger.warning(f"VTT download process completed for {task_uuid_str}, but no files were downloaded or reported. Check logs.")
            # Return success but indicate no files were generated/found
            return {"message": "VTT download process completed, but no subtitles were downloaded. Check logs for details.", "vtt_files": {}}

    except FileNotFoundError as e:
         logger.error(f"File not found during VTT download process for {task_uuid_str}: {e}", exc_info=True)
         raise HTTPException(status_code=404, detail=f"Required file not found: {e}")
    except Exception as e:
        logger.error(f"Error during VTT download endpoint for {task_uuid_str}: {e}", exc_info=True)
        # Avoid leaking internal details unless necessary
        raise HTTPException(status_code=500, detail=f"Internal server error during VTT download.")

@app.post("/api/tasks/{task_uuid}/download_media", response_model=DownloadMediaResponse)
async def download_media_endpoint(task_uuid: UUID, request: DownloadMediaRequest):
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(str(task_uuid))

    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")

    quality = request.quality
    try:
        # Pass BASE_DIR as string if task expects string
        media_rel_path = await run_download_media(task_meta, quality, str(BASE_DIR))
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
        
    # Check if already extracted (relative to DATA_DIR)
    extracted_wav_abs_path = None
    if task_meta.extracted_wav_path:
        extracted_wav_abs_path = DATA_DIR / task_meta.extracted_wav_path # Corrected base
        
    if extracted_wav_abs_path and extracted_wav_abs_path.exists(): # Use pathlib
        logger.info(f"Audio already extracted for task {task_uuid}")
        return ExtractAudioResponse(
            task_uuid=task_uuid,
            wav_path=task_meta.extracted_wav_path,
            message="Audio already extracted."
        )

    try:
        logger.info(f"Starting audio extraction for task {task_uuid}")
        # Pass BASE_DIR as string if task expects string
        extracted_wav_rel_path = await run_extract_audio(task_meta, str(BACKEND_DIR), str(DATA_DIR))
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
    
    # Helper function using pathlib
    def check_rel_path_exists_in_data(rel_path):
        if not rel_path:
            return False
        # Check existence relative to DATA_DIR
        return (DATA_DIR / rel_path).exists()

    try:
        if task_meta.platform == Platform.YOUTUBE:
            logger.info(f"Starting VTT merge for YouTube task {task_uuid}")
            if task_meta.merged_vtt_md_path and check_rel_path_exists_in_data(task_meta.merged_vtt_md_path):
                logger.info(f"Merged VTT markdown already exists for {task_uuid}")
                merged_md_path = task_meta.merged_vtt_md_path
                source_files = [str(DATA_DIR / p) for p in task_meta.vtt_files.values() if p and check_rel_path_exists_in_data(p)]
                message = "Merged VTT markdown file already exists."
            else:
                if not task_meta.vtt_files:
                     raise HTTPException(status_code=400, detail="Cannot merge: No VTT files found in metadata. Run VTT transcription first.")
                vtt_paths_exist = [ check_rel_path_exists_in_data(p) for p in task_meta.vtt_files.values() if p ]
                if not any(vtt_paths_exist):
                    raise HTTPException(status_code=400, detail="Cannot merge: Source VTT files listed in metadata not found on disk.")
                
                # Pass BASE_DIR as string
                merged_md_path, source_files_abs = await run_merge_vtt(task_meta, str(DATA_DIR), str(DATA_DIR))
                task_meta.merged_vtt_md_path = merged_md_path # Assuming task returns relative path
                message = f"VTT transcripts merged successfully into markdown."
                logger.info(message)
                all_metadata[str(task_uuid)] = task_meta
                await save_metadata(all_metadata)
                # Get filenames from absolute paths returned by task
                source_files = [os.path.basename(p) for p in source_files_abs]
        
        else: # Non-YouTube platforms merge WhisperX JSON
            logger.info(f"Starting WhisperX merge for task {task_uuid}")
            if task_meta.merged_whisperx_md_path and check_rel_path_exists_in_data(task_meta.merged_whisperx_md_path):
                 logger.info(f"Merged WhisperX markdown already exists for {task_uuid}")
                 merged_md_path = task_meta.merged_whisperx_md_path
                 source_files = [os.path.basename(os.path.join(DATA_DIR, task_meta.whisperx_json_path))] if task_meta.whisperx_json_path else []
                 message = "Merged WhisperX markdown file already exists."
            else:
                if not task_meta.whisperx_json_path or not check_rel_path_exists_in_data(task_meta.whisperx_json_path):
                    raise HTTPException(status_code=400, detail="Cannot merge: WhisperX JSON file not found. Run WhisperX transcription first.")

                # Pass BASE_DIR as string
                merged_md_path, source_files_abs = await run_merge_whisperx(task_meta, str(DATA_DIR), str(DATA_DIR))
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
        # Pass DATA_DIR to the sync function
        updated_task_meta_dict = await run_in_threadpool(
            delete_video_files_sync, 
            uuid=task_uuid_str, 
            entry=task_meta_dict, 
            data_dir=str(DATA_DIR) # Pass DATA_DIR
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
        # Pass DATA_DIR to the sync function
        updated_task_meta_dict = await run_in_threadpool(
            delete_audio_file_sync, 
            uuid=task_uuid_str, 
            entry=task_meta_dict, 
            data_dir=str(DATA_DIR) # Pass DATA_DIR
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

# --- ADD NEW DELETE VTT ENDPOINT HERE ---
@app.delete("/api/tasks/{task_uuid}/vtt/{lang_code}", status_code=204)
async def delete_vtt_file(task_uuid: UUID, lang_code: str):
    task_uuid_str = str(task_uuid)
    logger.info(f"Received request to delete VTT file ({lang_code}) for task: {task_uuid_str}")

    all_metadata = await load_metadata()
    task_meta = all_metadata.get(task_uuid_str)

    if not task_meta:
        logger.warning(f"Task not found for VTT deletion: {task_uuid_str}")
        raise HTTPException(status_code=404, detail="Task not found")

    if not task_meta.vtt_files or lang_code not in task_meta.vtt_files:
        logger.warning(f"VTT file for language '{lang_code}' not found in metadata for task {task_uuid_str}")
        # Return 404, maybe the file was already deleted or never existed
        raise HTTPException(status_code=404, detail=f"VTT file for language '{lang_code}' not found")

    vtt_rel_path_str = task_meta.vtt_files.get(lang_code)
    if not vtt_rel_path_str:
         # This case should be covered by the check above, but belts and suspenders
         raise HTTPException(status_code=404, detail=f"VTT path for language '{lang_code}' is empty or invalid in metadata")

    vtt_abs_path = DATA_DIR / vtt_rel_path_str # Use pathlib

    file_deleted = False
    # Attempt to delete the file from filesystem
    try:
        if vtt_abs_path.exists() and vtt_abs_path.is_file():
            # Run blocking os.remove in threadpool
            await run_in_threadpool(os.remove, vtt_abs_path)
            logger.info(f"Successfully deleted VTT file from disk: {vtt_abs_path}")
            file_deleted = True
        else:
            logger.warning(f"VTT file not found on disk at expected path: {vtt_abs_path}. Proceeding to update metadata only.")
            # Consider if this should be an error, but often we just want to clean metadata
            file_deleted = False # Explicitly false, though already initialized

    except OSError as e:
        logger.error(f"Error deleting VTT file from disk {vtt_abs_path}: {e}")
        # Decide if we should stop or just log and continue to update metadata
        # For now, let's raise 500 as failure to delete is significant
        raise HTTPException(status_code=500, detail=f"Error deleting VTT file from disk: {e}")

    # Update metadata: remove the entry for the deleted language
    try:
        del task_meta.vtt_files[lang_code]
        all_metadata[task_uuid_str] = task_meta # Put the modified task_meta back
        await save_metadata(all_metadata)
        logger.info(f"Successfully removed '{lang_code}' VTT entry from metadata for task {task_uuid_str}")
    except Exception as e:
        logger.error(f"Failed to update metadata after VTT file deletion for task {task_uuid_str}: {e}", exc_info=True)
        # If file deletion succeeded but metadata update failed, this is problematic.
        # Raise 500 to indicate an inconsistent state.
        raise HTTPException(status_code=500, detail="Failed to update metadata after file operation.")

    # Return 204 No Content on success
    return

# --- START: New GET VTT Endpoint ---
@app.get("/api/tasks/{task_uuid}/vtt/{lang_code}", response_class=FileResponse)
async def get_vtt_file(task_uuid: UUID, lang_code: str):
    task_uuid_str = str(task_uuid)
    logger.info(f"Received request to get VTT file ({lang_code}) for task: {task_uuid_str}")

    all_metadata = await load_metadata()
    task_meta = all_metadata.get(task_uuid_str)

    if not task_meta:
        logger.warning(f"Task not found for VTT get: {task_uuid_str}")
        raise HTTPException(status_code=404, detail="Task not found")

    if not task_meta.vtt_files or lang_code not in task_meta.vtt_files:
        logger.warning(f"VTT file for language '{lang_code}' not found in metadata for task {task_uuid_str}")
        raise HTTPException(status_code=404, detail=f"VTT file for language '{lang_code}' not found")

    vtt_rel_path_str = task_meta.vtt_files.get(lang_code)
    if not vtt_rel_path_str:
         raise HTTPException(status_code=404, detail=f"VTT path for language '{lang_code}' is empty or invalid in metadata")

    vtt_abs_path = DATA_DIR / vtt_rel_path_str

    if not vtt_abs_path.exists() or not vtt_abs_path.is_file():
        logger.error(f"VTT file specified in metadata not found on disk: {vtt_abs_path}")
        raise HTTPException(status_code=404, detail=f"VTT file not found on server at path: {vtt_rel_path_str}")

    # Return the file as a response
    # Use the original filename stored in metadata if available, otherwise construct it
    # The relative path usually contains the filename.
    filename = Path(vtt_rel_path_str).name 
    return FileResponse(path=vtt_abs_path, filename=filename, media_type='text/vtt')
# --- END: New GET VTT Endpoint ---


# --- START: New GET Markdown Endpoint ---
@app.get("/api/tasks/{task_uuid}/markdown/{format}", response_class=FileResponse)
async def get_markdown_file(task_uuid: UUID, format: Literal['merged', 'parallel']):
    task_uuid_str = str(task_uuid)
    logger.info(f"Received request to get Markdown file (format: {format}) for task: {task_uuid_str}")

    all_metadata = await load_metadata()
    task_meta = all_metadata.get(task_uuid_str)

    if not task_meta:
        logger.warning(f"Task not found for Markdown get: {task_uuid_str}")
        raise HTTPException(status_code=404, detail="Task not found")

    markdown_rel_path_str = None
    if format == 'merged':
        markdown_rel_path_str = task_meta.merged_format_vtt_md_path
    elif format == 'parallel':
        markdown_rel_path_str = task_meta.parallel_vtt_md_path
    
    if not markdown_rel_path_str:
        logger.warning(f"Markdown file (format: {format}) path not found in metadata for task {task_uuid_str}")
        raise HTTPException(status_code=404, detail=f"Markdown transcript (format: {format}) not found in metadata. Has it been generated?")

    markdown_abs_path = DATA_DIR / markdown_rel_path_str

    if not markdown_abs_path.exists() or not markdown_abs_path.is_file():
        logger.error(f"Markdown file specified in metadata not found on disk: {markdown_abs_path}")
        raise HTTPException(status_code=404, detail=f"Markdown file not found on server at path: {markdown_rel_path_str}")

    # Return the file as a response
    filename = Path(markdown_rel_path_str).name
    return FileResponse(path=markdown_abs_path, filename=filename, media_type='text/markdown')
# --- END: New GET Markdown Endpoint ---

# --- START: New List Files Endpoint ---
@app.get("/api/tasks/{task_uuid}/files/list", response_model=List[str])
async def list_task_files(
    task_uuid: UUID,
    extension: Optional[str] = Query(None, description="Filter by file extension (e.g., .txt, .md)")
):
    """
    Lists files within the specified task's data directory, optionally filtering by extension.
    Only lists files, not directories.
    """
    task_uuid_str = str(task_uuid)
    logger.info(f"Request to list files for task {task_uuid_str} (extension filter: {extension})")

    task_data_dir = DATA_DIR / task_uuid_str

    if not task_data_dir.exists() or not task_data_dir.is_dir():
        logger.warning(f"Task data directory not found: {task_data_dir}")
        raise HTTPException(status_code=404, detail="Task data directory not found")

    try:
        all_files = []
        for item in task_data_dir.iterdir():
            if item.is_file():
                # Apply extension filter if provided
                if extension:
                    # Ensure extension starts with a dot for consistent comparison
                    filter_ext = extension if extension.startswith('.') else f".{extension}"
                    if item.name.lower().endswith(filter_ext.lower()):
                        all_files.append(item.name)
                else:
                    # No filter, add all files
                    all_files.append(item.name)
        
        logger.info(f"Found {len(all_files)} files for task {task_uuid_str} matching filter '{extension}'")
        return sorted(all_files) # Return sorted list

    except Exception as e:
        logger.error(f"Error listing files in directory {task_data_dir}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error listing files")
# --- END: New List Files Endpoint ---

# --- START: 新增 - 获取任务目录下的任意文件 ---
# Use api_route to allow both GET and HEAD for FileResponse
@app.api_route("/api/tasks/{task_uuid}/files/{filename}", methods=["GET", "HEAD"], response_class=FileResponse)
async def get_task_file(task_uuid: UUID, filename: str):
    """
    提供任务数据目录中指定文件的访问。
    进行了基本的安全检查，防止访问目录外的文件。
    (不再需要优先提供 .fixed.vtt，因为文件在下载时已被规范化)
    """
    task_uuid_str = str(task_uuid)
    logger.info(f"请求获取任务 {task_uuid_str} 的文件: {filename}")

    # 基础安全检查：防止文件名包含路径遍历字符
    if ".." in filename or filename.startswith("/"):
        logger.warning(f"检测到非法的文件名请求: {filename} (任务: {task_uuid_str})")
        raise HTTPException(status_code=400, detail="不允许的文件名")

    # 构建文件的绝对路径
    file_path_to_serve = DATA_DIR / task_uuid_str / filename
    
    # --- 重要的安全检查：确保文件路径在预期的 DATA_DIR/{task_uuid} 目录下 ---
    resolved_file_path = None
    expected_task_dir = None
    try:
        logger.debug(f"Attempting to resolve expected_task_dir: {DATA_DIR / task_uuid_str}")
        expected_task_dir = (DATA_DIR / task_uuid_str).resolve(strict=True) 
        logger.debug(f"Successfully resolved expected_task_dir: {expected_task_dir}")
        
        logger.debug(f"Attempting to resolve file_path_to_serve: {file_path_to_serve}")
        resolved_file_path = await run_in_threadpool(file_path_to_serve.resolve, strict=True) 
        logger.debug(f"Successfully resolved file_path_to_serve: {resolved_file_path}")

        if not str(resolved_file_path).startswith(str(expected_task_dir)):
             logger.warning(f"Path Traversal Check Failed: Resolved path {resolved_file_path} does not start with expected directory {expected_task_dir}")
             raise HTTPException(status_code=404, detail="文件未找到或不在允许的目录下")
        else:
            logger.debug("Path Traversal Check Passed.")

    except FileNotFoundError as fnf_error:
        logger.warning(f"FileNotFoundError during path resolution for {file_path_to_serve}. Error: {fnf_error}")
        logger.warning(f"  Attempted to resolve expected_task_dir: {DATA_DIR / task_uuid_str} -> Result: {expected_task_dir}")
        logger.warning(f"  Attempted to resolve file_path_to_serve: {file_path_to_serve} -> Result: {resolved_file_path}") 
        raise HTTPException(status_code=404, detail=f"文件未找到(路径解析失败): {filename}")
    except Exception as e: 
         logger.error(f"检查文件路径时出错: {file_path_to_serve} - {e}", exc_info=True)
         raise HTTPException(status_code=500, detail="服务器内部错误")
    # -----------------------------------------------------------------------

    # 检查路径是否确实是一个文件
    logger.debug(f"Checking if path is a file: {file_path_to_serve}")
    is_a_file = False
    try:
        is_a_file = await run_in_threadpool(file_path_to_serve.is_file) 
        logger.debug(f"Path.is_file() result: {is_a_file}")
    except Exception as e:
        logger.error(f"Error calling is_file() on {file_path_to_serve}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="检查文件类型时出错")
        
    if not is_a_file:
        logger.warning(f"Path is not a file: {file_path_to_serve}")
        raise HTTPException(status_code=404, detail=f"请求的路径不是一个文件: {filename}")

    # 猜测文件的 MIME 类型
    logger.debug(f"Guessing media type for: {file_path_to_serve}")
    media_type, _ = mimetypes.guess_type(file_path_to_serve)
    if media_type is None:
        media_type = 'application/octet-stream' 
    # 对于 .vtt 文件，强制使用 text/vtt
    if filename.lower().endswith('.vtt'):
        media_type = 'text/vtt'

    logger.info(f"正在提供文件: {file_path_to_serve} (类型: {media_type})，请求名: {filename}")
    return FileResponse(path=str(file_path_to_serve), filename=filename, media_type=media_type)
# --- END: 新增 - 获取任务目录下的任意文件 ---


# --- Restore Archived Endpoint --- 
@app.post("/api/tasks/restore_archived", status_code=200)
async def restore_archived_tasks_endpoint():
    logger.info("Received request to restore archived tasks by re-ingesting URLs.")
    
    restored_tasks = []
    skipped_tasks = []
    failed_tasks = []
    metadata_changed = False

    try:
        # Load both sets of metadata
        archived_data = await load_archived_metadata() # Dict[str, Dict]
        active_metadata = await load_metadata()       # Dict[str, TaskMetadata]

        if not archived_data:
            logger.info("No archived metadata found to restore.")
            return {"message": "No archived tasks found to restore.", "restored": [], "skipped": [], "failed": []}

        # Create a set of active URLs for quick lookup
        active_urls = {meta.url for meta in active_metadata.values()}
        logger.debug(f"Found {len(active_urls)} active URLs.")

        for archived_uuid, archived_item in archived_data.items():
            archived_url = archived_item.get('url')
            if not archived_url:
                logger.warning(f"Archived item {archived_uuid} has no URL. Skipping.")
                failed_tasks.append({"uuid": archived_uuid, "reason": "Missing URL"})
                continue

            # Check if URL is already active
            if archived_url in active_urls:
                logger.info(f"URL {archived_url} (from archived UUID {archived_uuid}) is already active. Skipping restore.")
                skipped_tasks.append({"uuid": archived_uuid, "url": archived_url})
                continue

            # Attempt to re-ingest the URL (create task, download thumb)
            logger.info(f"Attempting to re-ingest URL: {archived_url} (from archived UUID {archived_uuid})")
            new_task_meta: Optional[TaskMetadata] = None
            try:
                # --- Step 1: Create basic task entry and download thumbnail --- 
                new_task_meta = await create_ingest_task(archived_url, str(BASE_DIR))
                logger.info(f"Successfully created task entry for URL {archived_url} with new UUID {new_task_meta.uuid}")

            except (ValueError, HTTPException) as ingest_err:
                logger.error(f"Failed initial ingest for URL {archived_url}: {ingest_err}")
                failed_tasks.append({"uuid": archived_uuid, "url": archived_url, "reason": f"Initial ingest failed: {ingest_err}"})
                continue # Skip to next URL if initial ingest fails
            except Exception as e:
                logger.error(f"Unexpected error during initial ingest for URL {archived_url}: {e}", exc_info=True)
                failed_tasks.append({"uuid": archived_uuid, "url": archived_url, "reason": f"Unexpected initial ingest error: {e}"})
                continue # Skip to next URL

            # --- Step 2: Fetch info.json for the newly created task --- 
            if new_task_meta: # Proceed only if initial ingest was successful
                try:
                    logger.info(f"Attempting to fetch info.json for new task {new_task_meta.uuid}...")
                    # Call the function that handles info.json download
                    info_json_rel_path = await run_fetch_info_json(new_task_meta, str(DATA_DIR))
                    
                    # Update the metadata object with the path
                    if info_json_rel_path:
                        new_task_meta.info_json_path = info_json_rel_path
                        logger.info(f"Successfully fetched info.json for {new_task_meta.uuid}. Path: {info_json_rel_path}")
                    else:
                        # Should not happen if run_fetch_info_json succeeded without error, but log just in case
                        logger.warning(f"run_fetch_info_json completed for {new_task_meta.uuid} but returned no path.")
                        # Mark as failure? Or just proceed without the path?
                        # Let's add to failed_tasks for clarity
                        failed_tasks.append({"uuid": str(new_task_meta.uuid), "url": archived_url, "reason": "info.json fetch succeeded but returned no path"})

                except yt_dlp.utils.DownloadError as dl_error:
                    logger.warning(f"Failed to fetch info.json for {new_task_meta.uuid}: {dl_error}")
                    # Add to failed list, but keep the task created in Step 1
                    failed_tasks.append({"uuid": str(new_task_meta.uuid), "url": archived_url, "reason": f"info.json download failed: {dl_error}"})
                except Exception as e:
                    logger.error(f"Unexpected error fetching info.json for {new_task_meta.uuid}: {e}", exc_info=True)
                    # Add to failed list, but keep the task created in Step 1
                    failed_tasks.append({"uuid": str(new_task_meta.uuid), "url": archived_url, "reason": f"Unexpected info.json fetch error: {e}"})

                # --- Step 3: Add/Update the task in active metadata --- 
                # Always add the task to metadata, even if info.json failed
                active_metadata[str(new_task_meta.uuid)] = new_task_meta
                # Add the *new* UUID and URL to the list of restored tasks
                # Note: We add to 'restored' even if info.json fails, as the base task exists
                restored_tasks.append({"new_uuid": str(new_task_meta.uuid), "url": archived_url})
                metadata_changed = True # Mark that we need to save

        # Save metadata ONLY if changes were made
        if metadata_changed:
            logger.info(f"Saving updated metadata after restoring {len(restored_tasks)} tasks.")
            await save_metadata(active_metadata)
        else:
            logger.info("No changes made to active metadata during restore process.")

        # Construct summary message
        message = f"Restore process completed. Restored: {len(restored_tasks)}, Skipped (already active): {len(skipped_tasks)}, Failed: {len(failed_tasks)}."
        logger.info(message)
        return {"message": message, "restored": restored_tasks, "skipped": skipped_tasks, "failed": failed_tasks}

    except FileNotFoundError:
        logger.error(f"Restore failed: Archived metadata file not found at {METADATA_ARCHIVED_FILE}")
        raise HTTPException(status_code=404, detail=f"Archived metadata file not found: {METADATA_ARCHIVED_FILE}")
    except Exception as e:
        logger.error(f"Internal server error during restore of archived tasks: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error during restore process: {str(e)}")

# --- START: New Download Audio Endpoint ---
@app.post("/api/tasks/{task_uuid}/download_audio", response_model=DownloadAudioResponse)
async def download_audio_endpoint(task_uuid: UUID):
    task_uuid_str = str(task_uuid)
    logger.info(f"Received request to download audio for task: {task_uuid_str}")

    all_metadata = await load_metadata()
    task_meta = all_metadata.get(task_uuid_str)

    if not task_meta:
        logger.warning(f"Task not found for audio download: {task_uuid_str}")
        raise HTTPException(status_code=404, detail="Task not found")

    # Check platform suitability
    if task_meta.platform not in AUDIO_DOWNLOAD_PLATFORMS:
        logger.warning(f"Direct audio download not supported for platform '{task_meta.platform}' on task {task_uuid_str}")
        raise HTTPException(status_code=400, detail=f"Direct audio download not supported for platform: {task_meta.platform}")

    # Check if audio already downloaded (relative to DATA_DIR)
    if task_meta.downloaded_audio_path:
         audio_abs_path = DATA_DIR / task_meta.downloaded_audio_path # Corrected base
         if audio_abs_path.exists():
            logger.info(f"Audio already downloaded for task {task_uuid_str} at {task_meta.downloaded_audio_path}")
            return DownloadAudioResponse(
                task_uuid=task_uuid,
                audio_path=task_meta.downloaded_audio_path,
                message="Audio already downloaded."
            )
         else:
             logger.warning(f"Metadata indicates audio downloaded for {task_uuid_str}, but file not found at {audio_abs_path}. Proceeding with download attempt.")
             # Reset path in metadata before attempting download again?
             # task_meta.downloaded_audio_path = None # Maybe? For now, just proceed.

    # Check if info.json exists (relative to DATA_DIR)
    if not task_meta.info_json_path:
         logger.warning(f"Cannot download audio for {task_uuid_str}: info.json path is missing.")
         raise HTTPException(status_code=400, detail="Info JSON has not been fetched yet. Please fetch info first.")
    info_json_abs_path = DATA_DIR / task_meta.info_json_path # Corrected base
    if not info_json_abs_path.exists():
         logger.warning(f"Cannot download audio for {task_uuid_str}: info.json file not found at {info_json_abs_path}.")
         raise HTTPException(status_code=404, detail="Info JSON file not found on disk.")

    try:
        # Run the download function in threadpool
        audio_rel_path = await run_in_threadpool(
            download_audio_sync, 
            task_uuid_str,
            str(METADATA_FILE)
        )

        if not audio_rel_path:
            # This means download_audio_sync failed internally (e.g., no format found, request error)
            logger.error(f"Direct audio download failed for task {task_uuid_str}. Check task logs.")
            raise HTTPException(status_code=500, detail="Audio download failed. Could not find suitable format or download error.")

        # Reload metadata to avoid race condition before saving
        current_metadata = await load_metadata()
        if task_uuid_str in current_metadata:
             current_metadata[task_uuid_str].downloaded_audio_path = audio_rel_path
             await save_metadata(current_metadata)
             logger.info(f"Successfully downloaded audio for {task_uuid_str} and updated metadata.")
             return DownloadAudioResponse(
                task_uuid=task_uuid,
                audio_path=audio_rel_path,
                message="Audio downloaded successfully."
            )
        else:
            # Should not happen if task existed before
            logger.error(f"Task {task_uuid_str} disappeared from metadata during audio download.")
            raise HTTPException(status_code=500, detail="Task metadata inconsistency during audio download.")

    except Exception as e:
        # Catch potential errors from download_audio_sync or other issues
        logger.error(f"Error during audio download endpoint for {task_uuid_str}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error during audio download: {str(e)}")
# --- END: New Download Audio Endpoint ---

# --- NEW: Merge VTT Endpoint ---
class MergeVttRequest(BaseModel):
    format: Literal['parallel', 'merged'] = 'parallel' # Default to parallel

@app.post("/api/tasks/{task_uuid}/merge_vtt", status_code=200)
async def merge_vtt_endpoint(task_uuid: UUID, request: MergeVttRequest):
    metadata = await load_metadata()
    task_meta = metadata.get(str(task_uuid))
    task_uuid_str = str(task_uuid)

    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")
    if task_meta.archived:
        raise HTTPException(status_code=400, detail="Task is archived")
    if task_meta.platform != Platform.YOUTUBE:
        raise HTTPException(status_code=400, detail="VTT merging is only supported for YouTube platform")
    
    # Define paths for the script and output
    TASKS_DIR = SRC_DIR / 'tasks' 
    script_path = str(TASKS_DIR / "merge_vtt.py")
    task_data_dir = DATA_DIR / task_uuid_str
    output_filename = f"{request.format}_transcript_vtt.md" # Use the requested format in filename
    output_abs_path = task_data_dir / output_filename
    output_rel_path = Path(task_uuid_str) / output_filename # Relative path for metadata

    # Check if the specific requested format already exists
    target_metadata_field = None
    if request.format == 'parallel':
        target_metadata_field = 'parallel_vtt_md_path'
    elif request.format == 'merged':
        target_metadata_field = 'merged_format_vtt_md_path'
    else:
        # Should not happen due to Literal validation, but good practice
        raise HTTPException(status_code=400, detail=f"Invalid format requested: {request.format}")

    existing_path = getattr(task_meta, target_metadata_field, None)
    if existing_path and (DATA_DIR / existing_path).exists():
        logger.info(f"VTT format '{request.format}' already exists for task {task_uuid_str} at {existing_path}")
        return {
            "message": f"VTT transcript (format: {request.format}) already exists.",
            "merged_file_path": existing_path # Return the existing path
        }

    # Find required VTT file paths
    en_vtt_rel_path = task_meta.vtt_files.get('en')
    zh_vtt_rel_path = task_meta.vtt_files.get('zh-Hans')

    if not en_vtt_rel_path and not zh_vtt_rel_path:
        raise HTTPException(status_code=400, detail="Cannot merge: Neither English nor Chinese VTT file found in metadata.")

    # Construct absolute paths and check file existence
    en_vtt_abs = DATA_DIR / en_vtt_rel_path if en_vtt_rel_path and (DATA_DIR / en_vtt_rel_path).exists() else None
    zh_vtt_abs = DATA_DIR / zh_vtt_rel_path if zh_vtt_rel_path and (DATA_DIR / zh_vtt_rel_path).exists() else None

    # The script needs at least one valid VTT file on disk
    if not en_vtt_abs and not zh_vtt_abs:
         raise HTTPException(status_code=400, detail="VTT file paths found in metadata, but corresponding files not found on disk.")

    # Build the command - Pass absolute paths or "MISSING" sentinel
    # IMPORTANT: Assumes merge_vtt.py is updated to handle 5 args: <en_path|MISSING> <zh_path|MISSING> <format> <output_abs_path>
    en_arg = str(en_vtt_abs) if en_vtt_abs else "MISSING" # Convert Path to string
    zh_arg = str(zh_vtt_abs) if zh_vtt_abs else "MISSING" # Convert Path to string
    command = [ sys.executable, script_path, en_arg, zh_arg, request.format, str(output_abs_path) ]

    logger.info(f"Running merge script for task {task_uuid_str}: {' '.join(command)}")

    try:
        # Run the script in a threadpool as it involves file I/O
        process = await run_in_threadpool(
            subprocess.run,
            command,
            capture_output=True,
            text=True,
            check=False, # Don't automatically raise error on non-zero exit
            encoding='utf-8' # Specify encoding
        )

        if process.returncode != 0:
            logger.error(f"Merge script failed for task {task_uuid_str}. Return code: {process.returncode}")
            logger.error(f"Script stderr:\n{process.stderr}")
            logger.error(f"Script stdout:\n{process.stdout}")
            # Try to delete potentially incomplete output file
            try:
                output_file_path = Path(output_abs_path)
                if output_file_path.exists():
                    await run_in_threadpool(os.remove, output_file_path)
                    logger.info(f"Deleted potentially incomplete output file: {output_abs_path}")
            except Exception as del_e:
                logger.error(f"Failed to delete incomplete output file {output_abs_path}: {del_e}")

            raise HTTPException(status_code=500, detail=f"Merge script failed: {process.stderr[:500]}") # Limit error detail length

        # Script succeeded, update the specific metadata field
        if target_metadata_field:
            setattr(task_meta, target_metadata_field, str(output_rel_path))
            metadata[task_uuid_str] = task_meta
            await save_metadata(metadata)
            logger.info(f"Successfully updated metadata field '{target_metadata_field}' for task {task_uuid_str}. Output: {output_rel_path}")
        else:
             # This should not happen if validation is correct
            logger.error(f"Internal logic error: target_metadata_field not set for format {request.format}")
            # Avoid saving metadata if the field name is unknown

        logger.info(f"Successfully merged VTT for task {task_uuid_str}. Output: {output_rel_path}")
        return {
            "message": f"VTT merge successful (format: {request.format}).",
            "merged_file_path": str(output_rel_path) # Return the newly generated path
        }

    except FileNotFoundError:
        logger.error(f"Merge script not found at {script_path}", exc_info=True)
        raise HTTPException(status_code=500, detail="Merge script not found.")
    except Exception as e:
        logger.error(f"Unexpected error during VTT merge for task {task_uuid_str}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error during VTT merge: {str(e)}")

# --- END: Merge VTT Endpoint ---

# --- Define Request Body Model for WhisperX ---
class TranscribeWhisperXRequest(BaseModel):
    model: Literal['tiny.en', 'small.en', 'medium.en', 'large-v3']

# --- Helper Function to Run Transcription Script and Broadcast --- 
# MODIFIED to return the relative path of the generated JSON, or None on failure
def run_transcription_script_and_notify(uuid: str, model: str) -> Optional[str]:
    """Runs transcription script, captures its output, and returns relative path on success."""
    script_path = SRC_DIR / "tasks" / "transcribe_whisperx.py"
    python_executable = sys.executable
    command = [python_executable, str(script_path), '--uuid', uuid, '--model', model]
    workspace_root = BACKEND_DIR.parent
    logger.info(f"Running WhisperX transcription command in {workspace_root}: {' '.join(command)}")

    relative_path = None # Initialize return value
    error_message = None

    try:
        # Run with check=False, capture output
        process = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=False, # Don't raise error on non-zero exit
            encoding='utf-8',
            cwd=workspace_root
        )

        if process.returncode == 0:
            logger.info(f"WhisperX script completed successfully for UUID {uuid}. Output:\n{process.stdout}")
            if process.stderr:
                 logger.warning(f"WhisperX script for UUID {uuid} produced stderr:\n{process.stderr}")
            # Try to parse the success JSON from stdout
            try:
                # Find the last line of stdout which should contain the final JSON status
                last_line = process.stdout.strip().splitlines()[-1]
                result_json = json.loads(last_line)
                if result_json.get("status") == "completed" and result_json.get("relative_path"):
                    relative_path = result_json["relative_path"]
                    logger.info(f"Successfully parsed relative path from script output: {relative_path}")
                else:
                    error_message = "Script finished but did not report completed status or relative path in output."
                    logger.error(f"{error_message} Last line: {last_line}")
            except (json.JSONDecodeError, IndexError) as e:
                error_message = f"Failed to parse JSON status from script stdout: {e}"
                logger.error(f"{error_message} stdout:\n{process.stdout}")
        else:
            # Script failed
            logger.error(f"WhisperX script failed for UUID {uuid}. Return code: {process.returncode}")
            logger.error(f"Stderr:\n{process.stderr}")
            logger.error(f"Stdout:\n{process.stdout}")
            error_message = f"Script failed with code {process.returncode}. Stderr: {process.stderr[:200]}..."

    except Exception as e:
        logger.error(f"An unexpected error occurred running WhisperX script process for UUID {uuid}: {e}", exc_info=True)
        error_message = f"Unexpected error running script: {e}"

    # --- REMOVED WebSocket Notification --- 
    # Notification will now be handled by the endpoint AFTER metadata is saved.

    if error_message:
        # Log any error encountered during the process
        logger.error(f"WhisperX helper function encountered error for {uuid}: {error_message}")

    return relative_path # Return the path or None

# --- POST Endpoint to Start WhisperX Transcription (Modified to Await) ---
@app.post("/api/tasks/{task_uuid}/transcribe_whisperx", response_model=TaskMetadata)
async def transcribe_whisperx_endpoint(
    task_uuid: UUID,
    request: TranscribeWhisperXRequest # Removed BackgroundTasks
):
    uuid_str = str(task_uuid)
    model = request.model
    logger.info(f"Received SYNC request to start WhisperX transcription for UUID {uuid_str} with model {model}")

    metadata = await load_metadata()
    task_meta = metadata.get(uuid_str)
    # ... (Existing checks: not found, archived, transcript exists, audio exists) ...
    if not task_meta: raise HTTPException(status_code=404, detail="Task not found")
    if task_meta.archived: raise HTTPException(status_code=400, detail="Cannot transcribe archived task.")
    # Allow re-transcription if path exists but maybe failed before?
    # if task_meta.whisperx_json_path: raise HTTPException(status_code=409, detail="WhisperX transcript already exists. Delete it first.")
    audio_path_str = task_meta.downloaded_audio_path or task_meta.extracted_wav_path
    if not audio_path_str: raise HTTPException(status_code=400, detail="Audio file path not found...")
    expected_audio_path = DATA_DIR / audio_path_str
    if not expected_audio_path.exists(): raise HTTPException(status_code=400, detail=f"Audio file not found at {expected_audio_path}...")

    # --- Run the script synchronously in threadpool and get relative path --- 
    relative_path = None
    script_error = None
    try:
        # Await the helper which now returns the relative path or None
        relative_path = await run_in_threadpool(run_transcription_script_and_notify, uuid_str, model)
        if relative_path:
            logger.info(f"WhisperX transcription script completed successfully for {uuid_str}. Relative path: {relative_path}")
        else:
            logger.error(f"WhisperX transcription script helper returned None (failure) for {uuid_str}.")
            # Capture a generic error message if path is None
            script_error = "Transcription script failed or did not return a valid path."

    except Exception as e:
        # This catches errors *running* the helper in threadpool itself
        logger.error(f"Error running transcription helper in threadpool for {uuid_str}: {e}", exc_info=True)
        script_error = f"Error executing transcription task: {e}"

    # --- Update Metadata and Broadcast --- 
    task_status = "failed"
    updated_task_data_dict = None
    try:
        # Reload metadata AFTER the script has potentially run
        current_metadata = await load_metadata()
        current_task_meta = current_metadata.get(uuid_str)

        if not current_task_meta:
            # Task disappeared somehow? Log error, cannot proceed.
            logger.error(f"Task {uuid_str} not found in metadata after script execution. Cannot update status or broadcast.")
            # Raise 500 as state is inconsistent
            raise HTTPException(status_code=500, detail="Task metadata inconsistency after processing.")

        if relative_path and not script_error:
            # --- Success Path: Update Metadata --- 
            current_task_meta.whisperx_json_path = relative_path
            current_task_meta.transcription_model = model
            current_metadata[uuid_str] = current_task_meta
            await save_metadata(current_metadata)
            logger.info(f"Successfully updated metadata for task {uuid_str} with WhisperX path and model.")
            task_status = "completed"
            updated_task_data_dict = current_task_meta.dict()
        else:
            # --- Failure Path: Metadata NOT updated --- 
            logger.warning(f"Transcription failed for task {uuid_str}. Metadata will not be updated.")
            # Use the existing task data (without transcript path) for broadcast
            updated_task_data_dict = current_task_meta.dict()

        # --- Broadcast Update --- 
        message = {
            "type": "task_update",
            "status": task_status,
            "uuid": uuid_str,
            "task_data": updated_task_data_dict
        }
        if script_error and task_status == "failed":
            message["error"] = script_error # Add error detail if script failed

        await manager.broadcast(message)
        logger.info(f"Broadcasted task update for UUID {uuid_str} (Status: {task_status})")

        # --- Return Response --- 
        if task_status == "completed":
            return current_task_meta # Return the updated TaskMetadata on success
        else:
            # If script failed, raise an HTTP exception
            raise HTTPException(status_code=500, detail=script_error or "Transcription failed for unknown reasons.")

    except Exception as e:
        # Catch errors during metadata reload, save, or broadcast
        logger.error(f"Error during final metadata update or broadcast for {uuid_str}: {e}", exc_info=True)
        # Try to broadcast a generic failure if possible?
        try:
            await manager.broadcast({
                "type": "task_update",
                "status": "failed",
                "uuid": uuid_str,
                "error": f"Internal server error during final update: {e}"
            })
        except Exception as broadcast_err:
            logger.error(f"Failed to broadcast final error state for {uuid_str}: {broadcast_err}")
        # Raise 500
        raise HTTPException(status_code=500, detail="Internal server error during task finalization.")

# --- DELETE Endpoint to Remove WhisperX Transcript ---
@app.delete("/api/tasks/{task_uuid}/transcribe_whisperx", status_code=200)
async def delete_whisperx_transcript(task_uuid: UUID):
    uuid_str = str(task_uuid)
    logger.info(f"Received request to delete WhisperX transcript for UUID {uuid_str}")

    metadata = await load_metadata()
    task_meta = metadata.get(uuid_str)

    if not task_meta:
        logger.warning(f"Task {uuid_str} not found for WhisperX transcript deletion.")
        raise HTTPException(status_code=404, detail="Task not found")

    if not task_meta.whisperx_json_path:
        logger.info(f"No WhisperX transcript path found for task {uuid_str}. Nothing to delete.")
        task_meta.whisperx_json_path = None
        task_meta.transcription_model = None
        await save_metadata(metadata)
        return {"message": "No WhisperX transcript found, metadata cleared.", "task_data": task_meta.dict()}


    transcript_rel_path = task_meta.whisperx_json_path
    # Construct absolute path relative to DATA_DIR
    transcript_abs_path = DATA_DIR / transcript_rel_path
    logger.info(f"Attempting to delete transcript file at: {transcript_abs_path}")

    deleted = False
    if transcript_abs_path.exists() and transcript_abs_path.is_file():
        try:
            await run_in_threadpool(os.remove, transcript_abs_path)
            logger.info(f"Successfully deleted transcript file: {transcript_abs_path}")
            deleted = True
        except OSError as e:
            logger.error(f"Failed to delete transcript file {transcript_abs_path}: {e}")
        except Exception as e:
            logger.error(f"Unexpected error deleting file {transcript_abs_path}: {e}", exc_info=True)

    # Update metadata regardless of file deletion success
    task_meta.whisperx_json_path = None
    task_meta.transcription_model = None

    await save_metadata(metadata)
    logger.info(f"Updated metadata for task {uuid_str}, removing WhisperX transcript info.")

    # Return the updated task metadata as expected by the frontend
    return {"message": f"WhisperX transcript data {'deleted and ' if deleted else ''}metadata cleared for task {uuid_str}.", "task_data": task_meta.dict()}

# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive, maybe listen for client messages if needed
            data = await websocket.receive_text() 
            # Example: Respond to a ping or specific client request
            # await manager.send_personal_message(f"Message text was: {data}", websocket)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error for {websocket.client}: {e}", exc_info=True)
        if websocket in manager.active_connections: # Ensure disconnect even on unexpected errors
             manager.disconnect(websocket)

# --- NEW: Endpoint to Create Video from Audio+Image ---
class CreateVideoResponse(BaseModel):
    message: str
    output_path: str

@app.post("/api/tasks/{task_uuid}/create_video", response_model=CreateVideoResponse)
async def create_video_endpoint(task_uuid: UUID):
    task_uuid_str = str(task_uuid)
    logger.info(f"Received request to create video for task: {task_uuid_str}")
    metadata = await load_metadata()

    if task_uuid_str not in metadata:
        logger.error(f"Task not found: {task_uuid_str}")
        raise HTTPException(status_code=404, detail="Task not found")

    task_meta = metadata[task_uuid_str]
    task_dir = BASE_DIR / task_uuid_str

    # --- Input Validation ---
    if task_meta.platform not in ["xiaoyuzhou", "podcast"]: # Assuming 'podcast' is a valid platform identifier
        logger.warning(f"Platform '{task_meta.platform}' not supported for video creation for task {task_uuid_str}")
        raise HTTPException(status_code=400, detail=f"Platform '{task_meta.platform}' not supported for this operation.")

    if not task_meta.thumbnail_path:
        logger.warning(f"Thumbnail path is missing for task {task_uuid_str}")
        raise HTTPException(status_code=400, detail="Thumbnail path is missing.")
        
    if not task_meta.downloaded_audio_path:
        logger.warning(f"Downloaded audio path is missing for task {task_uuid_str}")
        raise HTTPException(status_code=400, detail="Downloaded audio path is missing.")

    thumbnail_full_path = BASE_DIR / task_meta.thumbnail_path
    audio_full_path = BASE_DIR / task_meta.downloaded_audio_path
    output_video_rel_path = Path(task_uuid_str) / "video_best.mp4" # Relative path for metadata
    output_video_full_path = BASE_DIR / output_video_rel_path # Full path for script

    if not thumbnail_full_path.exists():
        logger.error(f"Thumbnail file not found at expected location: {thumbnail_full_path}")
        raise HTTPException(status_code=404, detail=f"Thumbnail file not found: {task_meta.thumbnail_path}")
        
    if not audio_full_path.exists():
        logger.error(f"Audio file not found at expected location: {audio_full_path}")
        raise HTTPException(status_code=404, detail=f"Audio file not found: {task_meta.downloaded_audio_path}")

    # --- Run Video Creation Script (Synchronously for now, consider BackgroundTasks for long processes) ---
    try:
        logger.info(f"Starting video creation for {task_uuid_str}: Image='{thumbnail_full_path}', Audio='{audio_full_path}', Output='{output_video_full_path}'")
        
        # Use run_in_threadpool to avoid blocking the event loop
        await run_in_threadpool(
            create_video_from_audio_image, 
            image_path=str(thumbnail_full_path), 
            audio_path=str(audio_full_path), 
            output_path=str(output_video_full_path)
        )

        # --- Verify Output and Update Metadata ---
        if not output_video_full_path.exists():
             logger.error(f"Video creation script ran but output file not found: {output_video_full_path}")
             raise HTTPException(status_code=500, detail="Video creation failed: Output file not generated.")

        logger.info(f"Video created successfully: {output_video_full_path}")
        # Update metadata
        if task_meta.media_files is None: # Ensure media_files exists
            task_meta.media_files = {}
        task_meta.media_files["best"] = str(output_video_rel_path) # Store relative path

        metadata[task_uuid_str] = task_meta
        await save_metadata(metadata)
        
        # Broadcast update
        await manager.broadcast({"type": "metadata_update", "payload": {task_uuid_str: task_meta.dict()}})
        
        logger.info(f"Metadata updated for task {task_uuid_str} with new video file: {output_video_rel_path}")
        
        return CreateVideoResponse(
            message="Video created successfully", 
            output_path=str(output_video_rel_path)
        )

    except Exception as e: # Catch errors from the script execution or file checks
        logger.error(f"Error during video creation for task {task_uuid_str}: {e}", exc_info=True)
        # Attempt to clean up potentially incomplete output file
        if output_video_full_path.exists():
            try:
                os.remove(output_video_full_path)
                logger.info(f"Cleaned up partial output file: {output_video_full_path}")
            except OSError as rm_err:
                logger.error(f"Failed to clean up partial output file {output_video_full_path}: {rm_err}")
        raise HTTPException(status_code=500, detail=f"Video creation failed: {str(e)}")

# --- Endpoint to Open Task Folder --- 
@app.post("/api/tasks/{task_uuid}/open_folder", status_code=200)
async def open_task_folder_endpoint(task_uuid: UUID):
    """
    Opens the data folder for the specified task in the system's file explorer.
    """
    task_uuid_str = str(task_uuid)
    logger.info(f"Received request to open folder for task: {task_uuid_str}")
    
    # No need to load metadata unless we need to validate existence first
    # metadata = await load_metadata()
    # if task_uuid_str not in metadata:
    #     logger.warning(f"Task not found for opening folder: {task_uuid_str}")
    #     raise HTTPException(status_code=404, detail="Task not found")

    task_data_dir = DATA_DIR / task_uuid_str

    if not task_data_dir.exists() or not task_data_dir.is_dir():
        logger.warning(f"Task data directory not found or is not a directory: {task_data_dir}")
        raise HTTPException(status_code=404, detail=f"Task data directory not found: {task_data_dir}")

    try:
        logger.info(f"Attempting to open folder: {task_data_dir}")
        cmd = []
        if sys.platform == "win32":
            # Use os.startfile on Windows for better behavior?
            # os.startfile(task_data_dir) 
            # Or stick with explorer:
            cmd = ["explorer", str(task_data_dir)]
        elif sys.platform == "darwin": # macOS
            cmd = ["open", str(task_data_dir)]
        else: # Linux and other Unix-like
            cmd = ["xdg-open", str(task_data_dir)]
        
        # Run the command asynchronously in a threadpool to avoid blocking
        process = await run_in_threadpool(
            subprocess.run,
            cmd,
            check=True, # Raise exception on non-zero exit code
            capture_output=True # Capture output/errors if needed
        )
        logger.info(f"Successfully executed command to open folder: {' '.join(cmd)}")
        return {"message": f"Request to open folder {task_data_dir} successful."}

    except FileNotFoundError:
        # This might happen if xdg-open/open/explorer is not in PATH
        logger.error(f"Command to open file explorer not found (platform: {sys.platform}). Command: {' '.join(cmd)}")
        raise HTTPException(status_code=501, detail="File explorer command not found on the server.")
    except subprocess.CalledProcessError as e:
        logger.error(f"Error executing command to open folder {task_data_dir}: {e}")
        logger.error(f"Command stdout: {e.stdout}")
        logger.error(f"Command stderr: {e.stderr}")
        raise HTTPException(status_code=500, detail=f"Failed to open folder on server: {e.stderr or e.stdout}")
    except Exception as e:
        logger.error(f"Unexpected error opening folder {task_data_dir}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred on the server while trying to open the folder.")

# --- END NEW Endpoint --- 

# --- END: New GET Markdown Endpoint ---

# --- START: New List Markdown Files Endpoint ---
class MarkdownFilesResponse(BaseModel):
    files: List[str]

# Restore response_model and original logic
@app.get("/api/tasks/{task_uuid}/markdown/list", response_model=MarkdownFilesResponse) # Ensure path is /list
async def list_markdown_files(task_uuid: UUID): # Use UUID type hint
    """
    Lists all markdown (.md) files within the specified task's 'markdown' subdirectory.
    """
    task_uuid_str = str(task_uuid) 
    # Minimal logging

    # Construct the path to the markdown subdirectory
    markdown_dir = DATA_DIR / task_uuid_str / "markdown"

    if not markdown_dir.exists():
        # logger.warning(f"Markdown directory does not exist: {markdown_dir}") # Can be noisy
        return MarkdownFilesResponse(files=[]) 
    if not markdown_dir.is_dir():
        logger.warning(f"Path exists but is not a directory: {markdown_dir}") # Keep warning
        return MarkdownFilesResponse(files=[]) 
        
    # Confirmed exists and is directory

    try:
        markdown_files = []
        # logger.info(f"Starting iteration over directory: {markdown_dir}") # Removed
        for item in markdown_dir.iterdir():
            # Keep intermediate variables from working version
            is_file = item.is_file()
            if is_file:
                is_md = item.name.lower().endswith('.md')
                if is_md:
                    markdown_files.append(item.name)
            # else:
                 # logger.info(f"    Skipping (not a file).") # Removed
        
        logger.info(f"Found {len(markdown_files)} markdown files in {markdown_dir}") # Keep summary log
        # Return the sorted list inside the response model
        response_data = MarkdownFilesResponse(files=sorted(markdown_files))
        # logger.info(f"Prepared response data: {response_data}") # Removed
        return response_data

    except Exception as e:
        logger.error(f"Error listing files in directory {markdown_dir}: {e}", exc_info=True)
        # Raise 500 for internal errors.
        raise HTTPException(status_code=500, detail="Error listing markdown files")
# --- END: New List Markdown Files Endpoint ---


# --- START: Existing GET File Endpoint (for reference) ---
# This endpoint is used by the frontend to fetch the content of a specific file
@app.api_route("/api/tasks/{task_uuid}/files/{filename}", methods=["GET", "HEAD"], response_class=FileResponse)
async def get_task_file(task_uuid: UUID, filename: str):
    # ... existing implementation ...
    pass # Keep existing code
# --- END: Existing GET File Endpoint ---



# --- START: New List Files Endpoint ---
@app.get("/api/tasks/{task_uuid}/files/list", response_model=List[str])
async def list_task_files(
    task_uuid: UUID,
    extension: Optional[str] = Query(None, description="Filter by file extension (e.g., .txt, .md)")
):
    """
    Lists files within the specified task's data directory, optionally filtering by extension.
    Only lists files, not directories.
    """
    task_uuid_str = str(task_uuid)
    logger.info(f"Request to list files for task {task_uuid_str} (extension filter: {extension})")

    task_data_dir = DATA_DIR / task_uuid_str

    if not task_data_dir.exists() or not task_data_dir.is_dir():
        logger.warning(f"Task data directory not found: {task_data_dir}")
        raise HTTPException(status_code=404, detail="Task data directory not found")

    try:
        all_files = []
        for item in task_data_dir.iterdir():
            if item.is_file():
                # Apply extension filter if provided
                if extension:
                    # Ensure extension starts with a dot for consistent comparison
                    filter_ext = extension if extension.startswith('.') else f".{extension}"
                    if item.name.lower().endswith(filter_ext.lower()):
                        all_files.append(item.name)
                else:
                    # No filter, add all files
                    all_files.append(item.name)
        
        logger.info(f"Found {len(all_files)} files for task {task_uuid_str} matching filter '{extension}'")
        return sorted(all_files) # Return sorted list

    except Exception as e:
        logger.error(f"Error listing files in directory {task_data_dir}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error listing files")
# --- END: New List Files Endpoint ---

# --- Pydantic Models for Cut API --- 

class Segment(BaseModel):
    start: float = Field(..., description="Start time in seconds")
    end: float = Field(..., description="End time in seconds")

class CutRequest(BaseModel):
    media_identifier: str = Field(..., description="Identifier for the media file (e.g., relative path)")
    segments: List[Segment] = Field(..., description="List of time segments to keep")
    embed_subtitle_lang: Optional[Literal['en', 'zh-Hans', 'bilingual', 'none']] = Field(
        default='none', 
        description="Language of subtitles to embed/burn into the video. 'none' for no subtitles."
    )

class CutResponse(BaseModel):
    job_id: str
    status: str
    message: str

class CutStatusResponse(BaseModel):
    job_id: str
    status: str # e.g., "processing", "completed", "failed"
    message: Optional[str] = None
    output_path: Optional[str] = None # Relative path to the output file if completed

# --- In-memory storage for job statuses (Replace with Redis/DB in production) --- 
cut_job_statuses: Dict[str, Dict[str, Any]] = {}

# --- Background Task Function for FFMPEG --- 

# Helper function for escaping paths for ffmpeg filter
def escape_ffmpeg_filter_path(path_str: str) -> str:
    # Escape characters problematic in ffmpeg filters: \, ', :, [, ], ;, ,, =, space
    escaped = path_str.replace('\\', '\\\\')
    escaped = escaped.replace("'", "\\'")
    escaped = escaped.replace(":", "\\:")
    escaped = escaped.replace("[", "\\[")
    escaped = escaped.replace("]", "\\]")
    escaped = escaped.replace(";", "\\;")
    escaped = escaped.replace(",", "\\,")
    escaped = escaped.replace("=", "\\=")
    escaped = escaped.replace(" ", "\\ ")
    return escaped

# 将VTT转换为ASS格式的函数 - 更可靠的字幕烧录格式
def convert_vtt_to_ass(vtt_file_path, output_ass_path, is_bilingual=False, time_offset=0.0):
    try:
        import webvtt
        from pathlib import Path
        import re
        
        # 确保输出目录存在
        Path(output_ass_path).parent.mkdir(parents=True, exist_ok=True)
        
        # 读取VTT文件
        vtt = webvtt.read(str(vtt_file_path))
        logger.info(f"转换VTT到ASS: 读取到{len(vtt.captions)}个字幕条目，time_offset={time_offset}s")
        
        # ASS文件头 - 添加双语样式
        ass_header = '''[Script Info]
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,PingFang SC,36,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3,1,2,20,20,45,1
Style: Chinese,PingFang SC,42,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3.5,1.2,8,20,20,20,1
Style: English,Arial,34,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2.5,0.8,2,20,20,80,1
Style: Chinese-Only,PingFang SC,40,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,1,2,20,20,45,1
Style: English-Only,Arial,36,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,2.8,1,2,20,20,45,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
'''
        
        # 将VTT转换为ASS格式
        with open(output_ass_path, 'w', encoding='utf-8') as f:
            f.write(ass_header)
            
            processed_count = 0
            skipped_count = 0
            for i, caption in enumerate(vtt):
                # 将时间戳从秒转换为ASS格式 (h:mm:ss.cc)
                def format_time(seconds):
                    # 应用时间偏移，从切割开始处调整字幕时间
                    adjusted_seconds = max(0, seconds - time_offset)
                    h = int(adjusted_seconds / 3600)
                    m = int((adjusted_seconds % 3600) / 60)
                    s = int(adjusted_seconds % 60)
                    cs = int((adjusted_seconds - int(adjusted_seconds)) * 100)  # ASS使用厘秒(centiseconds)
                    return f"{h}:{m:02d}:{s:02d}.{cs:02d}"
                
                # 删除跳过字幕的条件判断，处理所有字幕
                # 即使字幕在偏移时间之前结束，也不要跳过
                # 只做时间调整，让所有字幕从0开始
                
                # 调整时间并格式化
                start = format_time(caption.start_in_seconds)
                end = format_time(caption.end_in_seconds)
                
                # 添加额外的调试信息
                if i < 5:  # 只记录前几个，避免日志过多
                    logger.debug(f"字幕 #{i}: 原始时间 {caption.start_in_seconds:.2f}s-{caption.end_in_seconds:.2f}s, 调整为 {start}-{end}")
                
                # 清理文本（不需要过度替换，我们要处理分行情况）
                text = caption.text
                
                # 打印原始文本内容用于调试
                if i < 5:
                    logger.debug(f"字幕 #{i} 原始文本: '{text}'")
                
                # 改进字幕文本处理逻辑
                if is_bilingual and '\\n' in text or '\n' in text:
                    # 处理可能的换行符，包括转义和非转义的
                    split_char = '\\n' if '\\n' in text else '\n'
                    lines = text.split(split_char, 1)  # 最多分割一次
                    
                    # 简单检测中文：如果包含中文字符则认为是中文行
                    has_chinese_first = bool(re.search(r'[\u4e00-\u9fff]', lines[0]))
                    has_chinese_second = bool(re.search(r'[\u4e00-\u9fff]', lines[1])) if len(lines) > 1 else False
                    
                    if len(lines) > 1:
                        if has_chinese_first and not has_chinese_second:
                            # 中文在上，英文在下
                            chinese_line = lines[0]
                            english_line = lines[1]
                            
                            # 写入ASS事件行 - 分别为中英文使用不同样式
                            f.write(f"Dialogue: 0,{start},{end},Chinese,,0,0,0,,{chinese_line}\n")
                            f.write(f"Dialogue: 0,{start},{end},English,,0,0,0,,{english_line}\n")
                            if i < 5:
                                logger.debug(f"字幕 #{i} 分离为中英文: 中文='{chinese_line}', 英文='{english_line}'")
                            processed_count += 1
                            continue
                        elif has_chinese_second and not has_chinese_first:
                            # 英文在上，中文在下
                            english_line = lines[0]
                            chinese_line = lines[1]
                            
                            # 写入ASS事件行 - 调换顺序，中文在上
                            f.write(f"Dialogue: 0,{start},{end},Chinese,,0,0,0,,{chinese_line}\n")
                            f.write(f"Dialogue: 0,{start},{end},English,,0,0,0,,{english_line}\n")
                            if i < 5:
                                logger.debug(f"字幕 #{i} 分离为英中文: 英文='{english_line}', 中文='{chinese_line}', 调整顺序为中文在上")
                            processed_count += 1
                            continue
                        elif has_chinese_first and has_chinese_second:
                            # 两行都有中文，可能是中文内容太多需要换行
                            if i < 5:
                                logger.debug(f"字幕 #{i} 两行都有中文: '{lines[0]}' 和 '{lines[1]}'")
                
                # 对于非双语字幕或无法识别的格式，使用默认处理
                text = text.replace('\n', '\\N')
                
                # 检测单一语言，并使用对应样式
                style = "Default"
                if is_bilingual:
                    has_chinese = bool(re.search(r'[\u4e00-\u9fff]', text))
                    if has_chinese:
                        style = "Chinese-Only"
                    else:
                        style = "English-Only"
                    if i < 5:
                        logger.debug(f"字幕 #{i} 语言检测: {'中文' if has_chinese else '英文'}, 使用样式: {style}")
                
                f.write(f"Dialogue: 0,{start},{end},{style},,0,0,0,,{text}\n")
                processed_count += 1
        
        logger.info(f"VTT到ASS转换完成：处理了{processed_count}条字幕，跳过了{skipped_count}条字幕")
        return True
    except Exception as e:
        logger.error(f"转换VTT到ASS失败: {e}", exc_info=True)
        return False

def run_ffmpeg_cut(
    task_uuid_str: str, 
    input_path: Path, 
    output_path: Path, 
    segments: List[Dict], 
    job_id: str, 
    embed_subtitle_lang: Optional[str],
    vtt_files: Dict[str, Optional[str]] # Pass the task's vtt_files dict
):
    """Runs the ffmpeg cut command in the background, potentially embedding subtitles."""
    global cut_job_statuses
    logger.info(f"[Job {job_id}] Starting ffmpeg cut for {task_uuid_str} (Embed: {embed_subtitle_lang})")
    cut_job_statuses[job_id]["status"] = "processing"

    # 临时文件列表，用于后续清理
    temp_files_to_clean = []

    try:
        if not input_path.exists():
            raise FileNotFoundError(f"Input file not found: {input_path}")
        if not segments:
            raise ValueError("No segments provided for cutting.")

        # Ensure output directory exists
        output_path.parent.mkdir(parents=True, exist_ok=True)

        # --- Subtitle Setup --- 
        subtitle_filter = None
        # ass_file_path = None # Removed unused variable
        
        if embed_subtitle_lang and embed_subtitle_lang != 'none':
            logger.info(f"[Job {job_id}] Attempting to embed subtitles: {embed_subtitle_lang}")
            
            en_vtt_rel = vtt_files.get('en')
            zh_vtt_rel = vtt_files.get('zh-Hans')
            
            en_vtt_abs = DATA_DIR / en_vtt_rel if en_vtt_rel and (DATA_DIR / en_vtt_rel).exists() else None
            zh_vtt_abs = DATA_DIR / zh_vtt_rel if zh_vtt_rel and (DATA_DIR / zh_vtt_rel).exists() else None
            
            source_vtt_path_for_conversion = None

            if embed_subtitle_lang == 'en' and en_vtt_abs:
                source_vtt_path_for_conversion = en_vtt_abs
                logger.info(f"[Job {job_id}] Selected English VTT for conversion: {source_vtt_path_for_conversion}")
            elif embed_subtitle_lang == 'zh-Hans' and zh_vtt_abs:
                source_vtt_path_for_conversion = zh_vtt_abs
                logger.info(f"[Job {job_id}] Selected Chinese VTT for conversion: {source_vtt_path_for_conversion}")
            elif embed_subtitle_lang == 'bilingual' and en_vtt_abs and zh_vtt_abs:
                logger.info(f"[Job {job_id}] Found both VTTs for bilingual embedding. Generating combined VTT first.")
                try:
                    from webvtt import WebVTT # Keep import inside try for this specific feature
                    
                    vtt_en = WebVTT().read(str(en_vtt_abs))
                    vtt_zh = WebVTT().read(str(zh_vtt_abs))

                    def format_bilingual_vtt_time(seconds_val):
                        hours = int(seconds_val // 3600)
                        minutes = int((seconds_val % 3600) // 60)
                        secs_val = int(seconds_val % 60)
                        millis = int((seconds_val - int(seconds_val)) * 1000)
                        return f"{hours:02}:{minutes:02}:{secs_val:02}.{millis:03}"

                    max_len = max(len(vtt_en.captions), len(vtt_zh.captions))
                    combined_vtt_content = "WEBVTT\n\n"
                    
                    # 添加调试日志，看看有多少字幕项
                    logger.info(f"[Job {job_id}] 读取到英文字幕 {len(vtt_en.captions)} 条，中文字幕 {len(vtt_zh.captions)} 条")
                    
                    included_caption_count = 0
                    for i in range(max_len):
                        caption_en = vtt_en.captions[i] if i < len(vtt_en.captions) else None
                        caption_zh = vtt_zh.captions[i] if i < len(vtt_zh.captions) else None
                        
                        current_start_s = None
                        current_end_s = None
                        
                        if caption_zh and caption_zh.start_in_seconds is not None and caption_zh.end_in_seconds is not None:
                            current_start_s = caption_zh.start_in_seconds
                            current_end_s = caption_zh.end_in_seconds
                        elif caption_en and caption_en.start_in_seconds is not None and caption_en.end_in_seconds is not None:
                            current_start_s = caption_en.start_in_seconds
                            current_end_s = caption_en.end_in_seconds
                        
                        if current_start_s is None or current_end_s is None:
                            logger.debug(f"[Job {job_id}] Index {i}: 跳过合并字幕，缺少时间数据")
                            continue

                        # 尝试保留原始文本格式
                        text_en = caption_en.text if caption_en and caption_en.text else ""
                        text_zh = caption_zh.text if caption_zh and caption_zh.text else ""
                        
                        combined_text = ""
                        if text_zh and text_en:
                            # 确保始终将中文放在前面（上面），英文放在后面（下面）
                            combined_text = f"{text_zh}\n{text_en}"
                        elif text_zh:
                            combined_text = text_zh
                        elif text_en:
                            combined_text = text_en
                        
                        # 移除时间有效性检查，包含所有字幕
                        if combined_text:
                            start_formatted = format_bilingual_vtt_time(current_start_s)
                            end_formatted = format_bilingual_vtt_time(current_end_s)
                            # 确保正确的换行符格式
                            combined_vtt_content += f"{start_formatted} --> {end_formatted}\n{combined_text}\n\n"
                            included_caption_count += 1
                            if i < 3 or i == max_len - 1:  # 记录前三个和最后一个
                                logger.debug(f"[Job {job_id}] 包含字幕 #{i}: {start_formatted} --> {end_formatted}, 文本: {combined_text[:30]}...")
                        else:
                            logger.debug(f"[Job {job_id}] Index {i}: 跳过 - 没有文本内容")
                    
                    logger.info(f"[Job {job_id}] 合并生成了 {included_caption_count} 条双语字幕")
                    
                    temp_bilingual_vtt_path = output_path.parent / f"temp_bilingual_{job_id}.vtt"
                    with open(temp_bilingual_vtt_path, 'w', encoding='utf-8') as f:
                        f.write(combined_vtt_content)
                    source_vtt_path_for_conversion = temp_bilingual_vtt_path
                    temp_files_to_clean.append(temp_bilingual_vtt_path)
                    logger.info(f"[Job {job_id}] Generated temporary bilingual VTT for conversion: {source_vtt_path_for_conversion}")

                except ImportError:
                    logger.warning(f"[Job {job_id}] 'webvtt-py' library not installed. Cannot generate combined bilingual VTT. Skipping embed.")
                    source_vtt_path_for_conversion = None 
                except Exception as e:
                    logger.error(f"[Job {job_id}] Error generating temporary bilingual VTT: {e}", exc_info=True)
                    source_vtt_path_for_conversion = None 

            # --- Convert the selected/generated VTT to ASS --- 
            if source_vtt_path_for_conversion and source_vtt_path_for_conversion.exists():
                temp_ass_path = output_path.parent / f"temp_subtitle_{job_id}.ass"
                temp_files_to_clean.append(temp_ass_path)
                
                # 计算时间偏移量：使用第一个有效片段的开始时间
                first_segment = segments[0] if segments else None
                time_offset = first_segment['start'] if first_segment else 0
                
                # 为双语字幕传递is_bilingual参数和时间偏移参数
                conversion_success = convert_vtt_to_ass(
                    str(source_vtt_path_for_conversion), 
                    str(temp_ass_path),
                    is_bilingual=(embed_subtitle_lang == 'bilingual'),
                    time_offset=time_offset
                )
                
                if conversion_success:
                    logger.info(f"[Job {job_id}] Successfully converted VTT to ASS: {temp_ass_path}")
                    
                    # 处理ASS文件，使其适应视频切割
                    # 我们已经在convert_vtt_to_ass函数中应用了时间偏移，这里不需要重复处理
                    
                    # 添加一些额外的调试信息
                    logger.info(f"[Job {job_id}] Using segments: {segments}")
                    logger.info(f"[Job {job_id}] Applied time offset: {time_offset}s")
                    
                    # Use the ASS file for subtitles. No force_style needed as ASS has styles.
                    # Ensure path is correctly escaped for ffmpeg filter if it contains special characters.
                    # pathlib.Path string representation on POSIX is usually fine.
                    escaped_ass_path = str(temp_ass_path).replace('\\\\', '\\\\\\\\').replace("'", "\\\\'") # Basic escaping for filter context
                    
                    # 添加系统字体目录，确保正确渲染中英文
                    # macOS字体目录
                    font_dirs = [
                        "/System/Library/Fonts",
                        "/Library/Fonts",
                        f"{os.path.expanduser('~')}/Library/Fonts"
                    ]
                    
                    # 检查字体目录存在性
                    valid_font_dirs = [d for d in font_dirs if os.path.exists(d)]
                    
                    if valid_font_dirs:
                        # 使用第一个有效的字体目录，并添加subttitle_timestamps参数以处理非连续视频段中的字幕同步
                        fontsdir_option = f":fontsdir='{valid_font_dirs[0]}'"
                        subtitle_filter = f"subtitles='{escaped_ass_path}'{fontsdir_option}" 
                        logger.info(f"[Job {job_id}] Using ASS with font directory: {valid_font_dirs[0]}")
                    else:
                        # 如果找不到字体目录，则不使用fontsdir选项
                        subtitle_filter = f"subtitles='{escaped_ass_path}'" 
                        logger.info(f"[Job {job_id}] Using ASS without font directory (no valid font dirs found)")
                    
                    logger.info(f"[Job {job_id}] Using ASS for embedding. Filter: {subtitle_filter}")
                else:
                    logger.error(f"[Job {job_id}] Failed to convert VTT to ASS. No subtitles will be embedded.")
                    subtitle_filter = None
            else:
                logger.warning(f"[Job {job_id}] No source VTT file available for ASS conversion ('{embed_subtitle_lang}'). Proceeding without embedding subtitles.")
                subtitle_filter = None

        # --- Prepare segments logic ---
        select_filters = []
        for i, seg in enumerate(segments):
            start_time = seg['start']
            end_time = seg['end']
            if start_time >= end_time:
                logger.warning(f"[Job {job_id}] Skipping invalid segment: start={start_time}, end={end_time}")
                continue
            select_filters.append(f"between(t,{start_time},{end_time})")

        if not select_filters:
             raise ValueError("No valid segments found after filtering.")

        select_statement = "+".join(select_filters)

        # --- Build filter_complex string ---
        audio_filter = f"aselect='{select_statement}',asetpts=N/SR/TB"
        filter_complex_parts = []
        
        # 修改过滤器链，改变字幕应用方式
        if subtitle_filter:
            # 首先选择视频片段并调整PTS
            filter_complex_parts.append(f"[0:v]select='{select_statement}',setpts=N/FRAME_RATE/TB[v_selected]")
            
            # 然后应用字幕滤镜，注意字幕时间已经在ASS文件中被调整
            filter_complex_parts.append(f"[v_selected]{subtitle_filter}[v]")
        else:
            # 没有字幕的情况，保持原有处理
            filter_complex_parts.append(f"[0:v]select='{select_statement}',setpts=N/FRAME_RATE/TB[v]")
        
        # 音频处理保持不变
        filter_complex_parts.append(f"[0:a]{audio_filter}[a]")
        
        # 组合成最终的filter_complex字符串
        filter_complex_str = ";".join(filter_complex_parts)
        logger.info(f"[Job {job_id}] 最终filter_complex: {filter_complex_str}")

        # --- 构建并运行ffmpeg命令 ---
        command = [
            "ffmpeg",
            "-v", "verbose",  # 使用详细日志级别，帮助调试
            "-i", str(input_path),
            "-filter_complex", filter_complex_str,
            "-map", "[v]",
            "-map", "[a]",
            "-c:v", "libx264", 
            "-preset", "fast",  
            "-crf", "22",       
            "-c:a", "aac",       
            "-b:a", "128k",      
            "-movflags", "+faststart", 
            "-y",              
            str(output_path)
        ]

        logger.info(f"[Job {job_id}] Running ffmpeg command: {' '.join(shlex.quote(str(c)) for c in command)}")

        process = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=False,
            encoding='utf-8'
        )

        # --- 清理临时文件 ---
        for temp_file in temp_files_to_clean:
            if temp_file.exists():
                try:
                    temp_file.unlink()
                    logger.info(f"[Job {job_id}] Cleaned up temporary file: {temp_file}")
                except OSError as e:
                    logger.error(f"[Job {job_id}] Failed to cleanup temporary file {temp_file}: {e}")

        # --- 处理ffmpeg命令执行结果 ---
        if process.returncode == 0:
            logger.info(f"[Job {job_id}] Ffmpeg cut completed successfully. Output: {output_path}")
            cut_job_statuses[job_id]["status"] = "completed"
            cut_job_statuses[job_id]["output_path"] = str(output_path.relative_to(DATA_DIR))
            cut_job_statuses[job_id]["message"] = "Video cut successfully."
        else:
            error_message = f"Ffmpeg failed with code {process.returncode}. Stderr: {process.stderr}"
            logger.error(f"[Job {job_id}] {error_message}")
            cut_job_statuses[job_id]["status"] = "failed"
            cut_job_statuses[job_id]["message"] = error_message
            
            # 尝试删除可能不完整的输出文件
            if output_path.exists():
                try:
                    output_path.unlink()
                    logger.info(f"[Job {job_id}] Deleted partial output file: {output_path}")
                except OSError as e:
                    logger.error(f"[Job {job_id}] Failed to delete partial output file {output_path}: {e}")

    except Exception as e:
        error_msg = f"Error during ffmpeg cut task: {e}"
        logger.error(f"[Job {job_id}] {error_msg}", exc_info=True)
        cut_job_statuses[job_id]["status"] = "failed"
        cut_job_statuses[job_id]["message"] = error_msg
        cut_job_statuses[job_id].pop("output_path", None)
        
        # 确保在出现异常时也清理临时文件
        for temp_file in temp_files_to_clean:
            if temp_file and temp_file.exists():
                try:
                    temp_file.unlink()
                    logger.info(f"[Job {job_id}] Cleaned up temporary file on error: {temp_file}")
                except OSError as e_clean:
                    logger.error(f"[Job {job_id}] Failed to cleanup temporary file on error: {e_clean}")

# --- API Endpoints for Cutting ---

@app.post("/api/tasks/{task_uuid}/cut", response_model=CutResponse, status_code=202)
async def start_video_cut(
    task_uuid: UUID,
    request: CutRequest, # Updated to use the modified CutRequest model
    background_tasks: BackgroundTasks
):
    """Starts an asynchronous video cutting job."""
    global cut_job_statuses
    task_uuid_str = str(task_uuid)
    logger.info(f"Received cut request for task {task_uuid_str} with {len(request.segments)} segments. Embed: {request.embed_subtitle_lang}")

    # 1. Load Metadata
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(task_uuid_str)
    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")

    # --- Get VTT files info needed for background task --- 
    task_vtt_files = task_meta.vtt_files if task_meta.vtt_files else {}
    # -----------------------------------------------------
    
    # 2. Validate Media Identifier and Find Input Path
    #    (Assuming media_identifier is the relative path within the task dir)
    input_rel_path_str = request.media_identifier
    if not input_rel_path_str: # Basic check
         raise HTTPException(status_code=400, detail="media_identifier is required.")
    
    input_abs_path = DATA_DIR / input_rel_path_str # Assume media_identifier is relative to DATA_DIR
    if not input_abs_path.is_file(): # Check if it exists and is a file
        logger.error(f"Input media file not found at expected path: {input_abs_path}")
        raise HTTPException(status_code=404, detail=f"Media file not found at path: {input_rel_path_str}")

    # 3. Generate Job ID and Output Path
    job_id = str(uuid.uuid4())
    input_path_obj = Path(input_rel_path_str)
    output_filename = f"{input_path_obj.stem}_cut_{job_id}{input_path_obj.suffix}"
    output_abs_path = DATA_DIR / task_uuid_str / output_filename

    # 4. Initialize Job Status
    cut_job_statuses[job_id] = {
        "status": "pending",
        "message": "Job queued for processing.",
        "task_uuid": task_uuid_str,
        "output_path": None, # Will be filled upon completion
        "embed_lang_requested": request.embed_subtitle_lang # Store requested lang for info
    }

    # 5. Add FFMPEG task to background
    background_tasks.add_task(
        run_ffmpeg_cut,
        task_uuid_str=task_uuid_str,
        input_path=input_abs_path,
        output_path=output_abs_path,
        segments=[seg.dict() for seg in request.segments], # Pass segment data
        job_id=job_id,
        embed_subtitle_lang=request.embed_subtitle_lang, # Pass the lang preference
        vtt_files=task_vtt_files # Pass VTT file info
    )

    logger.info(f"Queued cut job {job_id} for task {task_uuid_str}. Output target: {output_abs_path}")

    # 6. Return Accepted response
    return CutResponse(
        job_id=job_id,
        status="processing", # Inform client it's started (or about to start)
        message="Video cutting job started in background."
    )

@app.get("/api/tasks/{task_uuid}/cut/{job_id}/status", response_model=CutStatusResponse)
async def get_cut_job_status(task_uuid: UUID, job_id: str):
    """Gets the status of a specific cutting job."""
    global cut_job_statuses
    task_uuid_str = str(task_uuid)
    logger.debug(f"Checking status for cut job {job_id} (Task: {task_uuid_str})")

    job_info = cut_job_statuses.get(job_id)

    if not job_info:
        logger.warning(f"Cut job {job_id} not found.")
        raise HTTPException(status_code=404, detail="Cut job not found")

    # Optional: Check if the job belongs to the requested task_uuid
    if job_info.get("task_uuid") != task_uuid_str:
        logger.warning(f"Cut job {job_id} belongs to task {job_info.get('task_uuid')}, not requested task {task_uuid_str}.")
        raise HTTPException(status_code=404, detail="Cut job not found for this task") # Treat as not found for security

    return CutStatusResponse(
        job_id=job_id,
        status=job_info.get("status", "unknown"),
        message=job_info.get("message"),
        output_path=job_info.get("output_path") # Will be None unless status is "completed"
    )

# <<< Add New Endpoints Here >>> (Place the new endpoints above this marker if it exists)

if __name__ == "__main__":
    import uvicorn
    # from pydantic import ValidationError # Already imported earlier if needed
    uvicorn.run(app, host="0.0.0.0", port=8000) 