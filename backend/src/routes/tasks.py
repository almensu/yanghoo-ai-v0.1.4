from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Dict, Any, List
import json
import os
import subprocess
import logging
from uuid import UUID
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Define constants
DATA_DIR = os.environ.get("DATA_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data"))

router = APIRouter()

@router.post("/api/tasks/{task_uuid}/split_transcribe_whisperx", response_model=Dict[str, Any])
async def split_transcribe_whisperx(task_uuid: str, model: str = "large-v3"):
    """
    Splits audio into 10-minute segments, transcribes each segment with WhisperX, and merges results.
    
    Args:
        task_uuid: The UUID of the task
        model: WhisperX model to use (default: large-v3)
        
    Returns:
        Dict with status and job info
    """
    try:
        # Validate task_uuid
        try:
            uuid_obj = UUID(task_uuid)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid UUID format: {task_uuid}")
        
        # Check if task exists in metadata
        metadata_path = Path(DATA_DIR) / "metadata.json"
        if not metadata_path.exists():
            raise HTTPException(status_code=404, detail="Metadata file not found")
            
        try:
            with open(metadata_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse metadata JSON")
            
        if task_uuid not in metadata:
            raise HTTPException(status_code=404, detail=f"Task {task_uuid} not found in metadata")
            
        task_metadata = metadata[task_uuid]
        
        # Check if audio file exists
        audio_rel_path_str = task_metadata.get('downloaded_audio_path') or task_metadata.get('extracted_wav_path')
        if not audio_rel_path_str:
            raise HTTPException(status_code=400, detail=f"No audio file found for task {task_uuid}")
            
        audio_abs_path = (Path(DATA_DIR) / audio_rel_path_str).resolve()
        if not audio_abs_path.exists():
            raise HTTPException(status_code=404, detail=f"Audio file not found at {audio_abs_path}")
            
        # Create cache directory
        cache_dir = Path(DATA_DIR) / task_uuid / ".cache"
        cache_dir.mkdir(parents=True, exist_ok=True)
        
        # Create directory for chunks
        chunks_dir = cache_dir / "chunks"
        chunks_dir.mkdir(parents=True, exist_ok=True)
        
        # Create directory for transcripts
        transcripts_dir = cache_dir / "transcripts"
        transcripts_dir.mkdir(parents=True, exist_ok=True)
        
        # Create directory for final WhisperX output
        whisperx_dir = Path(DATA_DIR) / task_uuid / "transcripts" / "whisperx"
        whisperx_dir.mkdir(parents=True, exist_ok=True)
        
        # Define job script path
        script_path = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) / "tasks" / "split_transcribe_whisperx.py"
        
        # Run the script as a background task
        command = [
            "python", str(script_path),
            "--uuid", task_uuid,
            "--model", model
        ]
        
        # Start the process
        process = subprocess.Popen(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        # Update status in metadata
        task_metadata["transcription_status"] = "processing"
        task_metadata["transcription_model"] = model
        
        # Save updated metadata
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
            
        return {
            "status": "started",
            "message": f"Started split-transcribe job for task {task_uuid} using model {model}",
            "job_id": str(uuid_obj)
        }
        
    except Exception as e:
        logger.error(f"Error in split_transcribe_whisperx: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to start split-transcribe job: {str(e)}") 