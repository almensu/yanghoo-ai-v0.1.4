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
# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

from fastapi import FastAPI, HTTPException, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
# from pathlib import Path # Remove Path import
from pydantic import ValidationError, BaseModel
from pydantic.json import pydantic_encoder

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
    "http://localhost:8080", # Vue default dev port (example)
    "http://localhost:4200", # Angular default dev port (example)
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
        self.active_connections.remove(websocket)
        logger.info(f"WebSocket connection closed: {websocket.client}")

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
        async with aiofiles.open(METADATA_FILE, mode='w') as f:
            content_to_write = json.dumps(metadata, indent=4, default=pydantic_encoder)
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
        # Ensure this doesn't save back to the file unintentionally
        # Create a copy or update in place if the model allows
        # Since TaskMetadata might be reused, modifying it directly should be fine
        # as long as we don't call save_metadata() here.
        task_meta.archived = is_archived
        
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
def run_transcription_script_and_notify(uuid: str, model: str):
    """Runs transcription script and broadcasts update via WebSocket."""
    script_path = SRC_DIR / "tasks" / "transcribe_whisperx.py"
    python_executable = sys.executable
    command = [python_executable, str(script_path), '--uuid', uuid, '--model', model]
    workspace_root = BACKEND_DIR.parent
    logger.info(f"Running WhisperX transcription command in {workspace_root}: {' '.join(command)}")
    
    success = False
    error_message = None
    
    try:
        process = subprocess.run(
            command, capture_output=True, text=True, check=True, encoding='utf-8', cwd=workspace_root
        )
        logger.info(f"WhisperX script completed successfully for UUID {uuid}. Output:\n{process.stdout}")
        if process.stderr:
             logger.warning(f"WhisperX script for UUID {uuid} produced stderr:\n{process.stderr}")
        success = True
    except subprocess.CalledProcessError as e:
        logger.error(f"WhisperX script failed for UUID {uuid}. Return code: {e.returncode}")
        logger.error(f"Stderr:\n{e.stderr}")
        logger.error(f"Stdout:\n{e.stdout}")
        error_message = f"Script failed with code {e.returncode}. Stderr: {e.stderr[:200]}..."
    except Exception as e:
        logger.error(f"An unexpected error occurred running WhisperX script for UUID {uuid}: {e}", exc_info=True)
        error_message = f"Unexpected error running script: {e}"

    # --- Notify via WebSocket --- 
    # Use run_in_threadpool to run async load/broadcast from sync function
    async def notify():
        try:
            updated_metadata = await load_metadata() # Reload fresh metadata
            task_data = updated_metadata.get(uuid)
            if task_data:
                # Ensure archived status is correct before sending (load_metadata doesn't handle this)
                # We might need a sync version of load_archived or adjust logic
                # For simplicity, we'll send the raw TaskMetadata object for now
                message = {
                    "type": "task_update",
                    "status": "completed" if success else "failed",
                    "uuid": uuid,
                    "task_data": task_data.dict() # Send updated task data as dict
                }
                if error_message:
                    message["error"] = error_message
                    
                await manager.broadcast(message)
                logger.info(f"Broadcasted task update for UUID {uuid}")
            else:
                 logger.warning(f"Task {uuid} not found in metadata after script run, cannot broadcast update.")
        except Exception as e:
             logger.error(f"Error during WebSocket notification for UUID {uuid}: {e}", exc_info=True)

    # Run the async notification function in the event loop from this thread
    # This requires careful handling or a running event loop. 
    # A simpler, though less ideal way, is to make run_transcription_script async
    # OR use a dedicated queue/messaging system. 
    # Let's try a slightly different approach: Modify the POST endpoint to await the helper.
    # This is NOT ideal for long tasks as it ties up a worker.
    # For true background tasks + websockets, a queue (like Celery/Redis) is better.
    # ---- REVISING PLAN: Await the task for simplicity first ----
    pass # Remove direct notification from sync helper

# --- POST Endpoint to Start WhisperX Transcription (Modified to Await) ---
# REMOVED BackgroundTasks, added response_model to return updated task
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
    if task_meta.whisperx_json_path: raise HTTPException(status_code=409, detail="WhisperX transcript already exists. Delete it first.")
    audio_path_str = task_meta.downloaded_audio_path or task_meta.extracted_wav_path
    if not audio_path_str: raise HTTPException(status_code=400, detail="Audio file path not found...")
    expected_audio_path = DATA_DIR / audio_path_str
    if not expected_audio_path.exists(): raise HTTPException(status_code=400, detail=f"Audio file not found at {expected_audio_path}...")

    # --- Run the script synchronously in threadpool and wait --- 
    script_failed = False
    error_detail = None
    try:
        await run_in_threadpool(run_transcription_script_and_notify, uuid_str, model) # Await the helper
        logger.info(f"WhisperX transcription script completed (awaited) for {uuid_str}.")
    except Exception as e:
        # This catches errors *running* the script (like CalledProcessError if check=True was used) 
        # or errors within run_transcription_script itself if not caught there.
        logger.error(f"Error running transcription in threadpool for {uuid_str}: {e}", exc_info=True)
        script_failed = True
        error_detail = str(e)
        # Decide if we should still try to broadcast or just raise HTTP 500
        # For now, let's raise 500, as waiting failed.
        raise HTTPException(status_code=500, detail=f"Transcription failed: {error_detail}")

    # --- Reload metadata and broadcast --- 
    try:
        updated_metadata = await load_metadata() # Reload fresh metadata
        updated_task_data = updated_metadata.get(uuid_str)
        
        if updated_task_data:
             message = {
                 "type": "task_update",
                 # Determine status based on whether whisperx_json_path was set by the script
                 "status": "completed" if updated_task_data.whisperx_json_path else "failed", 
                 "uuid": uuid_str,
                 "task_data": updated_task_data.dict() 
             }
             # We don't have specific error details here if script internal error occurred but didn't crash runner
             # The status 'failed' relies on whisperx_json_path not being set.
             await manager.broadcast(message)
             logger.info(f"Broadcasted task update for UUID {uuid_str} after sync run.")
             # Return the final state of the task data
             return updated_task_data 
        else:
             logger.error(f"Task {uuid_str} not found in metadata after sync script run. Cannot broadcast or return.")
             # This case is problematic, internal state inconsistency
             raise HTTPException(status_code=500, detail="Task data inconsistency after processing.")

    except Exception as e:
        logger.error(f"Error reloading metadata or broadcasting for {uuid_str} after sync run: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Error finalizing task update after processing.")

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

if __name__ == "__main__":
    import uvicorn
    # from pydantic import ValidationError # Already imported earlier if needed
    uvicorn.run(app, host="0.0.0.0", port=8000) 