#!/usr/bin/env python3
"""
YouTube Blog Generator - Complete Data Structures
基于PRD需求的完整数据模型定义
"""

from pydantic import BaseModel, Field, validator
from datetime import datetime
from typing import Optional, List, Dict, Any, Generic, TypeVar, Union
from enum import Enum
import uuid
import json

# ====================
# 基础类型定义
# ====================

T = TypeVar('T')

class ProcessingStatus(str, Enum):
    """处理状态枚举"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class VideoDuration(str, Enum):
    """视频时长分类"""
    SHORT = "short"          # < 30分钟
    MEDIUM = "medium"        # 30分钟 - 2小时
    LONG = "long"           # 2小时 - 4小时
    EXTENDED = "extended"   # > 4小时

class WritingStyleType(str, Enum):
    """写作风格类型"""
    # 新闻类
    WSJ = "wsj"
    NYT = "nyt"
    ECONOMIST = "economist"

    # 故事类
    DIAMOND = "diamond"          # 钻石结构
    HERO_JOURNEY = "hero_journey" # 英雄之旅
    PROBLEM_SOLUTION = "problem_solution" # 问题-解决方案

    # 创作类
    MEDIUM = "medium"
    SUBSTACK = "substack"
    WECHAT = "wechat"           # 微信公众号

    # 分析类
    HBR = "hbr"                 # 哈佛商业评论
    TED = "ted"                 # TED演讲风格

class PlatformType(str, Enum):
    """发布平台类型"""
    PERSONAL_BLOG = "personal_blog"
    WECHAT = "wechat"
    WEIBO = "weibo"
    XIAOHONGSHU = "xiaohongshu"
    MEDIUM = "medium"

class SubtitleFormat(str, Enum):
    """字幕格式"""
    JSON3 = "json3"
    VTT = "vtt"
    SRT = "srt"

# ====================
# 核心数据模型（简化版本）
# ====================

class YouTubeVideoMetadata(BaseModel):
    """YouTube视频元数据"""
    video_id: str = Field(..., description="YouTube视频ID")
    title: str = Field(..., description="视频标题")
    description: Optional[str] = Field(None, description="视频描述")
    channel_title: str = Field(..., description="频道名称")
    channel_id: str = Field(..., description="频道ID")
    published_at: datetime = Field(..., description="发布时间")
    duration_seconds: int = Field(..., description="视频时长（秒）")
    duration_category: VideoDuration = Field(..., description="时长分类")
    view_count: Optional[int] = Field(None, description="播放量")
    like_count: Optional[int] = Field(None, description="点赞数")
    tags: List[str] = Field(default_factory=list, description="标签列表")
    language: Optional[str] = Field(None, description="视频语言")

class Transcript(BaseModel):
    """字幕/转录内容"""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, description="唯一标识符")
    video_id: str = Field(..., description="关联的视频ID")
    format_type: SubtitleFormat = Field(..., description="字幕格式")
    language_code: str = Field(..., description="语言代码")
    is_auto_generated: bool = Field(..., description="是否为自动生成")
    text_content: Optional[str] = Field(None, description="纯文本内容")
    word_count: int = Field(0, description="词数统计")
    processing_status: ProcessingStatus = Field(ProcessingStatus.PENDING, description="处理状态")

class ContentChunk(BaseModel):
    """内容分块"""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, description="唯一标识符")
    transcript_id: uuid.UUID = Field(..., description="关联的转录ID")
    sequence_number: int = Field(ge=0, description="序列号")
    start_time: float = Field(ge=0, description="开始时间（秒）")
    end_time: float = Field(ge=0, description="结束时间（秒）")
    text_content: str = Field(..., description="文本内容")
    word_count: int = Field(ge=0, description="词数")
    token_count: int = Field(ge=0, description="Token数量")
    importance_level: str = Field("important", description="重要性级别")

class WritingStyle(BaseModel):
    """写作风格"""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, description="唯一标识符")
    name: str = Field(..., description="风格名称")
    style_type: WritingStyleType = Field(..., description="风格类型")
    description: str = Field(..., description="风格描述")
    prompt_template: str = Field(..., description="AI提示词模板")
    is_active: bool = Field(True, description="是否启用")

class BlogArticle(BaseModel):
    """博客文章"""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, description="唯一标识符")
    title: str = Field(..., description="文章标题")
    slug: str = Field(..., description="URL友好标识符")
    content: str = Field(..., description="完整内容")
    excerpt: Optional[str] = Field(None, description="文章摘要")
    tags: List[str] = Field(default_factory=list, description="标签")

    # 关联关系
    writing_style_id: uuid.UUID = Field(..., description="写作风格ID")
    transcript_id: uuid.UUID = Field(..., description="转录ID")

    # 状态
    status: ProcessingStatus = Field(ProcessingStatus.PENDING, description="文章状态")

    # 统计信息
    word_count: int = Field(0, description="总词数")
    reading_time_minutes: int = Field(0, description="预估阅读时间（分钟）")

    # 元数据
    source_video_id: str = Field(..., description="源视频ID")
    source_video_title: str = Field(..., description="源视频标题")

    created_at: datetime = Field(default_factory=datetime.utcnow, description="创建时间")
    updated_at: Optional[datetime] = Field(None, description="更新时间")

class ProcessingJob(BaseModel):
    """处理任务"""
    id: uuid.UUID = Field(default_factory=uuid.uuid4, description="唯一标识符")
    video_id: str = Field(..., description="YouTube视频ID")
    writing_style_id: uuid.UUID = Field(..., description="写作风格ID")

    # 任务状态
    status: ProcessingStatus = Field(ProcessingStatus.PENDING, description="任务状态")
    progress_percentage: float = Field(0, ge=0, le=100, description="进度百分比")

    # 结果
    result_article_id: Optional[uuid.UUID] = Field(None, description="生成的文章ID")

    created_at: datetime = Field(default_factory=datetime.utcnow, description="创建时间")
    updated_at: Optional[datetime] = Field(None, description="更新时间")

# 测试数据
if __name__ == "__main__":
    print("YouTube Blog Generator Data Structures")
    print("=" * 50)

    # 创建示例数据
    video_meta = YouTubeVideoMetadata(
        video_id="dQw4w9WgXcQ",
        title="Sample Video",
        channel_title="Test Channel",
        channel_id="UC1234567890",
        published_at=datetime.now(),
        duration_seconds=3600,
        duration_category=VideoDuration.LONG,
        tags=["test", "sample"],
        language="en"
    )

    print(f"Sample Video: {video_meta.title}")
    print(f"Duration: {video_meta.duration_seconds}s ({video_meta.duration_category})")
    print(f"Channel: {video_meta.channel_title}")

    # 验证模型
    try:
        video_meta_dict = video_meta.model_dump()
        print(f"Validation: ✅ Passed")
        print(f"Dict keys: {list(video_meta_dict.keys())}")
    except Exception as e:
        print(f"Validation: ❌ Failed - {e}")

    # 创建示例文章
    article = BlogArticle(
        title="从播客到博客：内容创作的未来",
        slug="podcast-to-blog-future",
        content="这是一篇关于如何将播客内容转化为高质量博客文章的详细指南...",
        writing_style_id=uuid.uuid4(),
        transcript_id=uuid.uuid4(),
        source_video_id="dQw4w9WgXcQ",
        source_video_title="Sample Video"
    )

    print(f"\nSample Article: {article.title}")
    print(f"Word Count: {article.word_count}")
    print(f"Status: {article.status}")