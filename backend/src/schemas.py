from pydantic import BaseModel, HttpUrl, Field
from enum import Enum
from typing import Optional, Dict, Literal, List, Union
from uuid import UUID
from datetime import datetime

class Platform(str, Enum):
    YOUTUBE = "youtube"
    TWITTER = "twitter"
    PODCAST = "podcast"
    XIAOYUZHOU = "xiaoyuzhou"
    BILIBILI = "bilibili"
    OTHER = "other"

class IngestRequest(BaseModel):
    url: str
    
class TaskMetadata(BaseModel):
    uuid: UUID
    url: str
    platform: Platform
    title: Optional[str] = None
    thumbnail_path: Optional[str] = None
    info_json_path: Optional[str] = None
    media_files: Dict[str, Optional[str]] = {}
    extracted_wav_path: Optional[str] = None
    vtt_files: Dict[str, Optional[str]] = {}
    whisperx_json_path: Optional[str] = None
    transcription_model: Optional[str] = None
    parallel_vtt_md_path: Optional[str] = None
    merged_format_vtt_md_path: Optional[str] = None
    en_only_vtt_md_path: Optional[str] = None
    zh_only_vtt_md_path: Optional[str] = None
    en_only_vtt_timestamp_md_path: Optional[str] = None
    zh_only_vtt_timestamp_md_path: Optional[str] = None
    merged_whisperx_md_path: Optional[str] = None
    archived: bool = False
    downloaded_audio_path: Optional[str] = None
    embed_url: Optional[str] = None
    created_at: Optional[datetime] = None
    last_modified: Optional[datetime] = None

class FetchInfoJsonResponse(BaseModel):
    task_uuid: UUID
    info_json_path: str
    message: str

class DownloadMediaRequest(BaseModel):
    quality: str = Field(..., description="Desired media quality (e.g., 'best', '1080p', '720p', '360p')")

class DownloadMediaResponse(BaseModel):
    task_uuid: UUID
    quality: str
    media_path: str
    message: str

class ExtractAudioResponse(BaseModel):
    task_uuid: UUID
    wav_path: str
    message: str

class TranscriptionModel(str, Enum):
    TINY_EN = "tiny.en"
    MEDIUM_EN = "medium.en"
    LARGE_V3 = "large-v3"

class TranscribeRequest(BaseModel):
    model: Optional[TranscriptionModel] = Field(TranscriptionModel.MEDIUM_EN, description="WhisperX model to use for non-YouTube sources")

class TranscribeResponse(BaseModel):
    task_uuid: UUID
    transcript_type: Literal['vtt', 'whisperx']
    transcript_paths: Dict[str, str]
    message: str

class MergeResponse(BaseModel):
    task_uuid: UUID
    merged_file_path: str
    source_files: List[str]
    message: str

class DownloadAudioResponse(BaseModel):
    task_uuid: UUID
    audio_path: str
    message: str

class IngestResponse(BaseModel):
    metadata: TaskMetadata