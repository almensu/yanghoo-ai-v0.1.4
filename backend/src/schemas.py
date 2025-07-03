from pydantic import BaseModel, HttpUrl, Field, field_validator
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
    vtt_files_segmented: Dict[str, Optional[str]] = {}
    srt_files: Dict[str, Optional[str]] = {}
    raw_srt_files: List[str] = []
    srt_md_files: Dict[str, Optional[str]] = {}
    ass_files: Dict[str, Optional[str]] = {}
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
    keyframes_json_path: Optional[str] = None
    keyframes_count: int = 0
    keyframes_extracted_at: Optional[datetime] = None
    keyframes_quality: Optional[str] = None

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
    model: Optional[TranscriptionModel] = Field(TranscriptionModel.LARGE_V3, description="WhisperX model to use for non-YouTube sources")

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

# 关键帧相关的Schema
class KeyframeInfo(BaseModel):
    index: int
    timestamp: float
    filename: str
    relative_path: str
    file_size: int
    resolution: str
    format: str
    extracted_at: str
    url_path: str

class VideoInfo(BaseModel):
    duration: float
    size: int
    bitrate: int
    width: int
    height: int
    fps: float
    codec: str
    format: str

class ExtractionSettings(BaseModel):
    # 通用字段
    method: str
    quality: str
    quality_settings: Dict
    extracted_at: str
    extractor_version: str
    actual_count: int
    success_rate: float
    
    # 方案1（固定间隔）相关字段
    requested_interval: Optional[int] = None
    actual_interval: Optional[float] = None
    max_keyframes: Optional[int] = None  # 允许None表示无限制
    interval_adjusted: Optional[bool] = None
    estimated_count: Optional[int] = None
    unlimited_mode: Optional[bool] = None
    
    # 方案2（固定数量）相关字段
    requested_count: Optional[int] = None
    calculated_interval: Optional[float] = None
    distribution: Optional[str] = None

class KeyframesData(BaseModel):
    task_uuid: str
    video_path: str
    video_info: VideoInfo
    extraction_settings: ExtractionSettings
    keyframes: List[KeyframeInfo]

class ExtractKeyframesRequest(BaseModel):
    method: str = Field(default="interval", pattern="^(interval|count|scene|ai|percentage)$", description="提取方案")
    interval: int = Field(default=10, ge=1, le=60, description="固定间隔（秒）- 方案1")
    count: int = Field(default=100, description="固定数量 - 方案2，-1表示无限制")
    quality: str = Field(default="medium", pattern="^(low|medium|high)$", description="图片质量")
    regenerate: bool = Field(default=False, description="是否重新生成")
    
    @field_validator('count')
    @classmethod
    def validate_count(cls, v):
        if v == -1:  # 无限制模式
            return v
        if v < 10 or v > 500:
            raise ValueError('count must be between 10 and 500, or -1 for unlimited')
        return v

class ExtractKeyframesResponse(BaseModel):
    task_uuid: UUID
    keyframes_data: KeyframesData
    message: str

class KeyframesStatsResponse(BaseModel):
    task_uuid: UUID
    stats: Dict