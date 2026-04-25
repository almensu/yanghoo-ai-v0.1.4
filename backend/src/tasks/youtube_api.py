import subprocess
import json
import re
from pathlib import Path
from typing import List, Dict, Optional

class YouTubeAPI:
    """
    负责从 YouTube 获取原始资产：JSON3 字幕、元数据和章节。
    """

    @staticmethod
    def get_video_info(url: str) -> Dict:
        """使用 yt-dlp 获取视频完整元数据"""
        cmd = [
            "yt-dlp",
            "--dump-json",
            "--flat-playlist", # 如果是列表，只取当前视频
            url
        ]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            raise Exception(f"Failed to fetch YouTube info: {result.stderr}")
        return json.loads(result.stdout)

    @staticmethod
    def extract_chapters(description: str) -> List[Dict]:
        """从视频描述中提取章节信息"""
        chapters = []
        # 支持: 0:00, 01:23, 1:02:03 等多种格式
        # 正则确保时间戳在行首或紧随空白符
        pattern = re.compile(r'(?:^|\s)(\d{1,2}:(?:\d{2}:)?\d{2})\s+(.+)$', re.MULTILINE)
        
        def timestamp_to_seconds(ts: str) -> int:
            parts = ts.split(':')
            if len(parts) == 2:
                return int(parts[0]) * 60 + int(parts[1])
            elif len(parts) == 3:
                return int(parts[0]) * 3600 + int(parts[1]) * 60 + int(parts[2])
            return 0

        for match in pattern.finditer(description):
            timestamp_str = match.group(1)
            title = match.group(2).strip()
            # 避免误匹配普通文本，章节标题通常不应过长
            if len(title) > 100: continue
            
            chapters.append({
                "time": timestamp_to_seconds(timestamp_str),
                "timestamp": timestamp_str,
                "title": title
            })
        
        return sorted(chapters, key=lambda x: x['time'])

    @staticmethod
    def get_raw_transcript(url: str, lang: str = 'en') -> List[Dict]:
        """
        获取 JSON3 格式的原始字幕片段。
        """
        # 使用专用临时目录
        temp_dir = Path("temp_yt_subs")
        temp_dir.mkdir(exist_ok=True)
        
        video_id_match = re.search(r'(?:v=|\/)([0-9A-Za-z_-]{11}).*', url)
        video_id = video_id_match.group(1) if video_id_match else "temp_video"
        output_template = str(temp_dir / f"{video_id}.%(ext)s")

        cmd = [
            "yt-dlp",
            "--write-auto-subs",
            "--sub-lang", lang,
            "--sub-format", "json3",
            "--skip-download",
            "-o", output_template,
            url
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode != 0:
            # 清理目录
            if temp_dir.exists(): shutil.rmtree(temp_dir)
            raise Exception(f"yt-dlp failed to fetch json3 subtitles: {result.stderr}")
        
        # 寻找生成的 json3
        potential_files = list(temp_dir.glob(f"{video_id}*.json3"))
        if not potential_files:
            if temp_dir.exists(): shutil.rmtree(temp_dir)
            raise Exception(f"Could not find downloaded json3 subtitle in {temp_dir} for {url}")

        target_file = potential_files[0]
        with open(target_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # 清理
        shutil.rmtree(temp_dir)

        # 解析 JSON3 格式为通用的 raw_snippets
        raw_snippets = []
        events = data.get('events', [])
        for event in events:
            if 'segs' not in event:
                continue
            
            start_ms = event.get('tStartMs', 0)
            duration_ms = event.get('dDurationMs', 0)
            
            # 合并该事件下的所有 segs
            text = "".join([seg.get('utf8', '') for seg in event['segs']])
            
            if text.strip():
                raw_snippets.append({
                    "text": text,
                    "start": start_ms / 1000.0,
                    "duration": duration_ms / 1000.0
                })
        
        return raw_snippets
