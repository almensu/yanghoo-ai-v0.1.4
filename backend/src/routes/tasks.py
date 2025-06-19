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

# Import the download_youtube_vtt function
from ..tasks.download_youtueb_vtt import download_youtube_vtt
from ..tasks.vtt_natural_segmentation import process_vtt_natural_segmentation
from ..tasks.process_srt import process_srt_files
from ..schemas import TaskMetadata

@router.post("/api/tasks/{task_uuid}/download_vtt", response_model=Dict[str, Any])
async def download_vtt_endpoint(task_uuid: str):
    """
    Downloads VTT subtitles for a YouTube video using yt-dlp.
    
    Args:
        task_uuid: The UUID of the task
        
    Returns:
        Dict with status and downloaded file paths
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
            
        # Create TaskMetadata object from the metadata
        task_data = metadata[task_uuid]
        task_meta = TaskMetadata(
            uuid=uuid_obj,
            url=task_data.get("url", ""),
            platform=task_data.get("platform", ""),
            title=task_data.get("title"),
            thumbnail_path=task_data.get("thumbnail_path"),
            info_json_path=task_data.get("info_json_path"),
            media_files=task_data.get("media_files", {}),
            vtt_files=task_data.get("vtt_files", {})
        )
        
        # Download VTT files
        downloaded_files = await download_youtube_vtt(task_meta, str(metadata_path))
        
        if not downloaded_files:
            return {
                "status": "warning",
                "message": f"No VTT files were downloaded for task {task_uuid}",
                "downloaded_files": {}
            }
            
        return {
            "status": "success",
            "message": f"Successfully downloaded VTT files for task {task_uuid}",
            "downloaded_files": downloaded_files
        }
        
    except Exception as e:
        logger.error(f"Error in download_vtt_endpoint: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to download VTT files: {str(e)}")

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

@router.post("/api/tasks/natural-segment-vtt/{task_uuid}")
async def natural_segment_vtt_endpoint(task_uuid: str, merge_threshold: float = 0.8):
    """
    对VTT字幕文件进行自然断句处理
    创建 *_segmented.vtt 文件，使用智能合并和重新断句
    
    Args:
        task_uuid: 任务UUID
        merge_threshold: 时间间隔阈值，小于此值的字幕块会被合并 (秒)
    
    Returns:
        处理状态和结果统计
    """
    try:
        # 验证UUID格式
        try:
            uuid_obj = UUID(task_uuid)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid UUID format: {task_uuid}")
        
        # 检查任务是否存在
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
        
        # 检查是否有VTT文件
        task_data = metadata[task_uuid]
        vtt_files = task_data.get("vtt_files", {})
        
        if not vtt_files:
            raise HTTPException(status_code=400, detail=f"No VTT files found for task {task_uuid}")
        
        logger.info(f"Starting natural segmentation for task {task_uuid}")
        
        # 执行自然断句处理
        result = await process_vtt_natural_segmentation(
            task_uuid=task_uuid,
            metadata_file=str(metadata_path),
            merge_threshold=merge_threshold
        )
        
        # 检查处理结果
        if not result["processed_files"] and result["errors"]:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to process VTT files: {'; '.join(result['errors'])}"
            )
        
        return {
            "task_uuid": task_uuid,
            "status": "success",
            "message": "VTT natural segmentation completed successfully",
            "result": result,
            "merge_threshold": merge_threshold
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"Natural segmentation failed for {task_uuid}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Natural segmentation failed: {str(e)}")

@router.post("/api/tasks/{task_uuid}/process_srt", response_model=Dict[str, Any])
async def process_srt_endpoint(task_uuid: str):
    """
    Process SRT files for a task:
    1. Find existing SRT files
    2. Rename the first one to transcript.srt
    3. Separate bilingual content into transcript_en.srt and transcript_zh-Hans.srt
    4. Generate corresponding ASS files
    5. Update metadata
    
    Args:
        task_uuid: The UUID of the task
        
    Returns:
        Dict with processing status and file information
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
        
        logger.info(f"Starting SRT processing for task {task_uuid}")
        
        # Process SRT files
        result = await process_srt_files(task_uuid, str(metadata_path))
        
        if not result["success"]:
            raise HTTPException(
                status_code=400,
                detail=f"Failed to process SRT files: {result.get('error', 'Unknown error')}"
            )
        
        return {
            "task_uuid": task_uuid,
            "status": "success",
            "message": "SRT files processed successfully",
            "result": result
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"SRT processing failed for {task_uuid}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"SRT processing failed: {str(e)}")

@router.post("/api/tasks/{task_uuid}/merge_srt", response_model=Dict[str, Any])
async def merge_srt_endpoint(task_uuid: str):
    """
    Merge SRT files to generate MD documents:
    1. Use existing transcript_en.srt and transcript_zh-Hans.srt files
    2. Generate various MD formats (merged, parallel, en_only, zh_only, etc.)
    3. Update metadata with MD file paths
    
    Args:
        task_uuid: The UUID of the task
        
    Returns:
        Dict with merge status and generated file information
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
        task_dir = Path(DATA_DIR) / task_uuid
        
        # Check if transcript.srt exists (should be created by process_srt)
        transcript_srt_path = task_dir / "transcript.srt"
        if not transcript_srt_path.exists():
            raise HTTPException(
                status_code=400, 
                detail="transcript.srt not found. Please run SRT processing first."
            )
        
        # Check for language-specific SRT files
        en_srt_path = task_dir / "transcript_en.srt"
        zh_srt_path = task_dir / "transcript_zh-Hans.srt"
        
        # Prepare paths for merge script
        en_srt_arg = str(en_srt_path) if en_srt_path.exists() else "MISSING"
        zh_srt_arg = str(zh_srt_path) if zh_srt_path.exists() else "MISSING"
        
        if en_srt_arg == "MISSING" and zh_srt_arg == "MISSING":
            raise HTTPException(
                status_code=400,
                detail="No language-specific SRT files found. Please run SRT processing first."
            )
        
        # Define merge script path
        merge_script_path = Path(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))) / "tasks" / "merge_srt.py"
        
        # Create output directory for MD files
        md_output_dir = task_dir
        dummy_output_path = md_output_dir / "dummy.md"  # merge_srt.py needs an output path but we use 'all' format
        
        logger.info(f"Starting SRT merge for task {task_uuid}")
        
        # Run merge script with 'all' format to generate all MD files
        command = [
            "python", str(merge_script_path),
            en_srt_arg,
            zh_srt_arg,
            "all",
            str(dummy_output_path)
        ]
        
        try:
            result = subprocess.run(
                command,
                capture_output=True,
                text=True,
                timeout=60  # 60 second timeout
            )
            
            if result.returncode != 0:
                logger.error(f"SRT merge script failed: {result.stderr}")
                raise HTTPException(
                    status_code=500,
                    detail=f"SRT merge failed: {result.stderr}"
                )
            
            logger.info(f"SRT merge completed successfully: {result.stdout}")
            
        except subprocess.TimeoutExpired:
            raise HTTPException(status_code=500, detail="SRT merge process timed out")
        except Exception as e:
            logger.error(f"Error running SRT merge script: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to run SRT merge: {str(e)}")
        
        # Check which MD files were generated and update metadata
        md_files = {}
        expected_files = {
            "merged": "merged_transcript_srt.md",
            "parallel": "parallel_transcript_srt.md", 
            "en_only": "en_transcript_srt.md",
            "zh_only": "zh_transcript_srt.md",
            "en_timestamp": "en_transcript_srt_timestamp.md",
            "zh_timestamp": "zh_transcript_srt_timestamp.md"
        }
        
        for key, filename in expected_files.items():
            file_path = md_output_dir / filename
            if file_path.exists():
                # Store relative path from DATA_DIR
                md_files[key] = str(file_path.relative_to(Path(DATA_DIR)))
                logger.info(f"Generated MD file: {filename}")
        
        # Update metadata with MD file paths
        task_metadata["srt_md_files"] = md_files
        task_metadata["srt_merged"] = True
        
        # Update last_modified timestamp
        from datetime import datetime
        task_metadata["last_modified"] = datetime.now().isoformat()
        
        # Save updated metadata
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        logger.info(f"Updated metadata for task {task_uuid} with {len(md_files)} MD files")
        
        return {
            "task_uuid": task_uuid,
            "status": "success",
            "message": f"SRT merge completed successfully. Generated {len(md_files)} MD files.",
            "generated_files": md_files,
            "merge_output": result.stdout
        }
        
    except HTTPException:
        raise  # Re-raise HTTP exceptions as-is
    except Exception as e:
        logger.error(f"SRT merge failed for {task_uuid}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"SRT merge failed: {str(e)}") 