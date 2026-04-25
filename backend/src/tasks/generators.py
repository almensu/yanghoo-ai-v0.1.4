import datetime
from typing import List, Dict

class Generators:
    """
    负责将句子级数据转换为 Markdown 和 VTT 资产。
    """

    @staticmethod
    def to_markdown(sentences: List[Dict], meta: Dict, chapters: List[Dict] = None) -> str:
        """生成带 YAML 头和章节标题的高品质 Markdown"""
        title = meta.get('title', 'YouTube Transcript')
        url = meta.get('webpage_url', '')
        author = meta.get('uploader', 'Unknown')
        
        header = f"""---
title: "{title}"
url: {url}
author: {author}
date: {datetime.date.today().isoformat()}
---

# {title}

## 目录
"""
        # 生成 TOC
        if chapters:
            for ch in chapters:
                header += f"- [{ch['title']}](#{ch['title'].lower().replace(' ', '-')})\n"
        header += "\n---\n"

        content = header
        current_chapter_idx = 0
        
        def format_time(seconds: float) -> str:
            dt = datetime.datetime.fromtimestamp(seconds, datetime.timezone.utc)
            return dt.strftime('%H:%M:%S')

        for sentence in sentences:
            start = sentence['start']
            
            # 插入章节标题
            if chapters and current_chapter_idx < len(chapters):
                if start >= chapters[current_chapter_idx]['time']:
                    content += f"\n## {chapters[current_chapter_idx]['title']}\n\n"
                    current_chapter_idx += 1
            
            ts_str = format_time(start)
            # 点击跳转链接格式：[HH:MM:SS](URL?t=SECONDS)
            jump_url = f"{url}&t={int(start)}" if '?' in url else f"{url}?t={int(start)}"
            content += f"[{ts_str}]({jump_url}) {sentence['text']}\n\n"
            
        return content

    @staticmethod
    def to_vtt(sentences: List[Dict]) -> str:
        """将句子流转换为标准的 WebVTT 格式"""
        vtt = "WEBVTT\n\n"
        
        def format_vtt_ts(seconds: float) -> str:
            h = int(seconds // 3600)
            m = int((seconds % 3600) // 60)
            s = seconds % 60
            return f"{h:02d}:{m:02d}:{s:06.3f}"

        for i, s in enumerate(sentences):
            start_str = format_vtt_ts(s['start'])
            end_str = format_vtt_ts(s['end'])
            vtt += f"{i+1}\n"
            vtt += f"{start_str} --> {end_str}\n"
            vtt += f"{s['text']}\n\n"
            
        return vtt
