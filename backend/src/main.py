from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles # Ensure StaticFiles is imported
import json
from pathlib import Path # Ensure Path is imported
from uuid import UUID
from typing import Dict, List
import aiofiles
import yt_dlp
import ffmpeg
import whisperx
import torch
import shutil # Added for directory deletion
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
# ------------------------

# Calculate paths relative to this file (main.py)
# __file__ gives the path to the current script (main.py)
SRC_DIR = Path(__file__).resolve().parent # resolve() makes it absolute
# Assuming structure project_root/backend/src/main.py
# Go up one level to backend/
BACKEND_DIR = SRC_DIR.parent 
# Path to the data directory: project_root/backend/data/
DATA_DIR = BACKEND_DIR / "data"

app = FastAPI()

# Mount the calculated 'data' directory path
# Ensure the directory exists before mounting
DATA_DIR.mkdir(parents=True, exist_ok=True) 
# Use the absolute path for mounting
app.mount("/files", StaticFiles(directory=DATA_DIR), name="static_files") 

# Define base directory and metadata file path using the calculated path
BASE_DIR = DATA_DIR 
METADATA_FILE = BASE_DIR / "metadata.json"

# Original mkdir for BASE_DIR is redundant now
# BASE_DIR.mkdir(exist_ok=True)

async def load_metadata() -> Dict[str, TaskMetadata]:
    if not METADATA_FILE.exists():
        return {}
    try:
        async with aiofiles.open(METADATA_FILE, mode='r') as f:
            content = await f.read()
            data = json.loads(content)
            # Use Pydantic for validation and type conversion
            return {uuid_str: TaskMetadata(**meta) for uuid_str, meta in data.items()}
    except (json.JSONDecodeError, IOError, ValidationError) as e:
        print(f"Error loading metadata: {e}")
        return {}

async def save_metadata(metadata: Dict[str, TaskMetadata]):
    try:
        # Convert Pydantic models to dicts for JSON serialization
        # This step might not be strictly necessary if using pydantic_encoder
        # serializable_data = {uuid_str: meta.dict() for uuid_str, meta in metadata.items()}
        
        # Use pydantic_encoder which handles UUIDs, Datetimes, etc.
        async with aiofiles.open(METADATA_FILE, mode='w') as f:
            # Pass the dict of TaskMetadata objects directly
            await f.write(json.dumps(metadata, indent=4, default=pydantic_encoder))
    except IOError as e:
        print(f"Error saving metadata: {e}")

@app.post("/api/ingest", response_model=IngestResponse)
async def ingest_url(request: IngestRequest):
    try:
        # Process the URL using the refactored function
        task_metadata = await create_ingest_task(str(request.url), BASE_DIR)
        
        # Load existing metadata
        all_metadata = await load_metadata()
        
        # Add or update the metadata for this task
        all_metadata[str(task_metadata.uuid)] = task_metadata
        
        # Save updated metadata
        await save_metadata(all_metadata)
        
        return IngestResponse(metadata=task_metadata)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Internal server error during ingest: {e}")
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
@app.delete("/api/tasks/{task_uuid}", status_code=204) # Use 204 No Content for successful deletion
async def delete_task(task_uuid: UUID):
    all_metadata = await load_metadata()
    task_uuid_str = str(task_uuid)

    if task_uuid_str not in all_metadata:
        raise HTTPException(status_code=404, detail="Task not found")

    # Remove metadata entry
    del all_metadata[task_uuid_str]

    # Save updated metadata
    await save_metadata(all_metadata)

    # Delete the task's data directory
    task_dir = BASE_DIR / task_uuid_str
    if task_dir.exists() and task_dir.is_dir():
        try:
            shutil.rmtree(task_dir)
            print(f"Successfully deleted directory: {task_dir}")
        except OSError as e:
            # Log error but don't necessarily fail the request, 
            # as metadata is already removed.
            print(f"Error deleting directory {task_dir}: {e}") 
            # Optionally raise an error if directory deletion is critical
            # raise HTTPException(status_code=500, detail=f"Failed to delete task directory: {e}")
    else:
        print(f"Task directory not found or is not a directory: {task_dir}")

    # No content to return, FastAPI handles the 204 status code
    return

# Placeholder for future task endpoints
@app.post("/api/tasks/{task_uuid}/fetch_info_json", response_model=FetchInfoJsonResponse)
async def fetch_info_json_endpoint(task_uuid: UUID):
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(str(task_uuid))

    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")

    if task_meta.info_json_path and (BASE_DIR.parent / task_meta.info_json_path).exists():
         return FetchInfoJsonResponse(
            task_uuid=task_uuid,
            info_json_path=task_meta.info_json_path,
            message="info.json already exists."
        )

    try:
        # Run the task function
        info_json_rel_path = await run_fetch_info_json(task_meta, BASE_DIR)
        
        # Update metadata with the path
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
        print(f"Error in fetch_info_json endpoint for {task_uuid}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error during fetch_info_json: {str(e)}")

@app.post("/api/tasks/{task_uuid}/download_media", response_model=DownloadMediaResponse)
async def download_media_endpoint(task_uuid: UUID, request: DownloadMediaRequest):
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(str(task_uuid))

    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")

    quality = request.quality
    # Optional: Check if this quality already exists? 
    # The task function currently handles finding the file, 
    # but we could add an early exit here if needed.
    # if quality in task_meta.media_files and (BASE_DIR.parent / task_meta.media_files[quality]).exists():
    #     return DownloadMediaResponse(...)

    try:
        # Run the download task function
        media_rel_path = await run_download_media(task_meta, quality, BASE_DIR)
        
        # Update metadata with the path for this quality
        # Ensure the media_files dict exists
        if task_meta.media_files is None:
            task_meta.media_files = {}
        task_meta.media_files[quality] = media_rel_path
        
        # Save updated metadata
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
        # Provide more specific feedback if possible
        error_detail = f"Failed to download media ({quality}): {str(e)}"
        if "Unsupported URL" in str(e):
             error_detail = f"Download failed: Unsupported URL ({task_meta.url}) for media download."
        elif "format not available" in str(e).lower():
             error_detail = f"Download failed: Quality '{quality}' not available for this media."
        
        raise HTTPException(status_code=500, detail=error_detail)
    except Exception as e:
        print(f"Error in download_media endpoint for {task_uuid} (Quality: {quality}): {e}") # Log error
        raise HTTPException(status_code=500, detail=f"Internal server error during media download: {str(e)}")

@app.post("/api/tasks/{task_uuid}/merge", response_model=MergeResponse)
async def merge_transcripts_endpoint(task_uuid: UUID):
    all_metadata = await load_metadata()
    task_meta = all_metadata.get(str(task_uuid))

    if not task_meta:
        raise HTTPException(status_code=404, detail="Task not found")

    merged_md_path = None
    source_files = []
    message = ""

    try:
        if task_meta.platform == Platform.YOUTUBE:
            logger.info(f"Starting VTT merge for YouTube task {task_uuid}")
            # Check if already done
            if task_meta.merged_vtt_md_path and (BASE_DIR.parent / task_meta.merged_vtt_md_path).exists():
                logger.info(f"Merged VTT markdown already exists for {task_uuid}")
                merged_md_path = task_meta.merged_vtt_md_path
                # Attempt to reconstruct source files if needed, or just report existing file
                source_files = [str(BASE_DIR.parent / p) for p in task_meta.vtt_files.values() if p] 
                message = "Merged VTT markdown file already exists."
            else:
                # Check if source VTT files exist
                if not task_meta.vtt_files:
                     raise HTTPException(status_code=400, detail="Cannot merge: No VTT files found in metadata. Run VTT transcription first.")
                # Verify at least one VTT file physically exists
                vtt_paths_exist = [ (BASE_DIR.parent / p).exists() for p in task_meta.vtt_files.values() if p ]
                if not any(vtt_paths_exist):
                    raise HTTPException(status_code=400, detail="Cannot merge: Source VTT files listed in metadata not found on disk.")
                
                merged_md_path, source_files = await run_merge_vtt(task_meta, BASE_DIR)
                task_meta.merged_vtt_md_path = merged_md_path
                message = f"VTT transcripts merged successfully into markdown."
                logger.info(message)
                # Save updated metadata
                all_metadata[str(task_uuid)] = task_meta
                await save_metadata(all_metadata)
        
        else: # Non-YouTube platforms merge WhisperX JSON
            logger.info(f"Starting WhisperX merge for task {task_uuid}")
            # Check if already done
            if task_meta.merged_whisperx_md_path and (BASE_DIR.parent / task_meta.merged_whisperx_md_path).exists():
                 logger.info(f"Merged WhisperX markdown already exists for {task_uuid}")
                 merged_md_path = task_meta.merged_whisperx_md_path
                 source_files = [str(BASE_DIR.parent / task_meta.whisperx_json_path)] if task_meta.whisperx_json_path else []
                 message = "Merged WhisperX markdown file already exists."
            else:
                # Check if source WhisperX JSON exists
                if not task_meta.whisperx_json_path or not (BASE_DIR.parent / task_meta.whisperx_json_path).exists():
                    raise HTTPException(status_code=400, detail="Cannot merge: WhisperX JSON file not found. Run WhisperX transcription first.")

                merged_md_path, source_files = await run_merge_whisperx(task_meta, BASE_DIR)
                task_meta.merged_whisperx_md_path = merged_md_path
                message = f"WhisperX transcript merged successfully into markdown."
                logger.info(message)
                # Save updated metadata
                all_metadata[str(task_uuid)] = task_meta
                await save_metadata(all_metadata)

        return MergeResponse(
            task_uuid=task_uuid,
            merged_file_path=merged_md_path,
            source_files=[Path(p).name for p in source_files], # Return just filenames for brevity
            message=message
        )

    except (FileNotFoundError, ValueError) as e:
        # Errors finding files/dirs or invalid state 
        logger.error(f"Merge error for {task_uuid}: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error during merge for {task_uuid}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error during merge: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    # Ensure Pydantic is imported for validation error handling
    from pydantic import ValidationError 
    uvicorn.run(app, host="0.0.0.0", port=8000) 