import re
from typing import Optional

def extract_youtube_video_id(url: str) -> Optional[str]:
    """
    从各种 YouTube URL 格式中提取视频 ID。
    返回 11 位字符的视频 ID，如果无法提取则返回 None。
    """
    if not url:
        return None
    # 正则表达式匹配 watch, embed, short (youtu.be) 等格式
    patterns = [
        r'(?:v=|/embed/|/v/|youtu\.be/|/shorts/)([a-zA-Z0-9_-]{11})',
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None 