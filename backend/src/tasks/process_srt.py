import os
import re
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import aiofiles

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SRTProcessor:
    """Processor for handling SRT subtitle files"""
    
    def __init__(self):
        self.chinese_pattern = re.compile(r'[\u4e00-\u9fff]')
        self.english_pattern = re.compile(r'[a-zA-Z]')
    
    def detect_language(self, text: str) -> str:
        """Detect if text is primarily Chinese, English, or mixed"""
        if not text.strip():
            return "unknown"
        
        chinese_chars = len(self.chinese_pattern.findall(text))
        english_chars = len(self.english_pattern.findall(text))
        
        if chinese_chars > english_chars:
            return "zh-Hans"
        elif english_chars > chinese_chars:
            return "en"
        else:
            return "mixed"
    
    def parse_srt_content(self, content: str) -> List[Dict]:
        """Parse SRT content into structured data"""
        blocks = content.strip().split('\n\n')
        subtitles = []
        
        for block in blocks:
            lines = block.strip().split('\n')
            if len(lines) < 3:
                continue
                
            try:
                # Parse subtitle number
                subtitle_num = int(lines[0])
                
                # Parse timestamp
                if '-->' not in lines[1]:
                    continue
                    
                time_parts = lines[1].split(' --> ')
                if len(time_parts) != 2:
                    continue
                
                start_time = time_parts[0].strip()
                end_time = time_parts[1].strip()
                
                # Parse text (remaining lines)
                text = '\n'.join(lines[2:]).strip()
                
                subtitles.append({
                    'number': subtitle_num,
                    'start_time': start_time,
                    'end_time': end_time,
                    'text': text,
                    'language': self.detect_language(text)
                })
                
            except (ValueError, IndexError):
                continue
        
        return subtitles
    
    def separate_bilingual_srt(self, subtitles: List[Dict]) -> Tuple[List[Dict], List[Dict]]:
        """Separate bilingual SRT into English and Chinese parts"""
        english_subs = []
        chinese_subs = []
        
        for sub in subtitles:
            lang = sub['language']
            if lang == 'en':
                english_subs.append(sub)
            elif lang == 'zh-Hans':
                chinese_subs.append(sub)
            elif lang == 'mixed':
                # For mixed content, try to split by lines
                text_lines = sub['text'].split('\n')
                en_lines = []
                zh_lines = []
                
                for line in text_lines:
                    line_lang = self.detect_language(line)
                    if line_lang == 'en':
                        en_lines.append(line)
                    elif line_lang == 'zh-Hans':
                        zh_lines.append(line)
                
                if en_lines:
                    en_sub = sub.copy()
                    en_sub['text'] = '\n'.join(en_lines)
                    english_subs.append(en_sub)
                
                if zh_lines:
                    zh_sub = sub.copy()
                    zh_sub['text'] = '\n'.join(zh_lines)
                    chinese_subs.append(zh_sub)
        
        return english_subs, chinese_subs
    
    def generate_srt_content(self, subtitles: List[Dict]) -> str:
        """Generate SRT content from subtitle list"""
        srt_lines = []
        
        for i, sub in enumerate(subtitles, 1):
            srt_lines.append(str(i))
            srt_lines.append(f"{sub['start_time']} --> {sub['end_time']}")
            srt_lines.append(sub['text'])
            srt_lines.append("")  # Empty line between subtitles
        
        return '\n'.join(srt_lines)

async def process_srt_files(task_uuid: str, metadata_file: str) -> Dict:
    """
    Process SRT files for a task:
    1. Find existing SRT files
    2. Rename the first one to transcript.srt
    3. Separate bilingual content into transcript_en.srt and transcript_zh-Hans.srt
    4. Update metadata
    """
    base_dir = Path(metadata_file).parent
    task_dir = base_dir / task_uuid
    
    if not task_dir.exists():
        return {
            "success": False,
            "error": f"Task directory not found: {task_dir}"
        }
    
    # Step 1: Find existing SRT files
    srt_files = list(task_dir.glob("*.srt"))
    if not srt_files:
        return {
            "success": False,
            "error": "请先手动添加 SRT 文件到任务目录中，然后再点击预处理按钮"
        }
    
    logger.info(f"Found {len(srt_files)} SRT files for task {task_uuid}")
    
    # Step 2: Rename first SRT file to transcript.srt
    source_srt = srt_files[0]
    transcript_srt_path = task_dir / "transcript.srt"
    
    try:
        if source_srt.name != "transcript.srt":
            source_srt.rename(transcript_srt_path)
            logger.info(f"Renamed {source_srt.name} to transcript.srt")
        else:
            transcript_srt_path = source_srt
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to rename SRT file: {str(e)}"
        }
    
    # Step 3: Read and parse the SRT content
    try:
        async with aiofiles.open(transcript_srt_path, 'r', encoding='utf-8') as f:
            content = await f.read()
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to read SRT file: {str(e)}"
        }
    
    processor = SRTProcessor()
    subtitles = processor.parse_srt_content(content)
    
    if not subtitles:
        return {
            "success": False,
            "error": "No valid subtitles found in SRT file"
        }
    
    # Step 4: Separate bilingual content
    english_subs, chinese_subs = processor.separate_bilingual_srt(subtitles)
    
    result = {
        "success": True,
        "processed_files": {},
        "stats": {
            "total_subtitles": len(subtitles),
            "english_subtitles": len(english_subs),
            "chinese_subtitles": len(chinese_subs)
        }
    }
    
    # Step 5: Generate separated SRT files and ASS files
    srt_files = {}
    ass_files = {}
    
    try:
        # Add main transcript.srt to srt_files tracking
        srt_files["main"] = str(transcript_srt_path.relative_to(base_dir))
        logger.info(f"Added main transcript.srt to tracking")
        
        # Generate English SRT if we have English subtitles
        if english_subs:
            en_srt_path = task_dir / "transcript_en.srt"
            en_content = processor.generate_srt_content(english_subs)
            async with aiofiles.open(en_srt_path, 'w', encoding='utf-8') as f:
                await f.write(en_content)
            
            srt_files["en"] = str(en_srt_path.relative_to(base_dir))
            logger.info(f"Generated English SRT with {len(english_subs)} subtitles")
            
            # Generate ASS file for English
            en_ass_path = task_dir / "transcript_en.ass"
            await generate_ass_file(en_srt_path, en_ass_path)
            ass_files["en"] = str(en_ass_path.relative_to(base_dir))
        
        # Generate Chinese SRT if we have Chinese subtitles
        if chinese_subs:
            zh_srt_path = task_dir / "transcript_zh-Hans.srt"
            zh_content = processor.generate_srt_content(chinese_subs)
            async with aiofiles.open(zh_srt_path, 'w', encoding='utf-8') as f:
                await f.write(zh_content)
            
            srt_files["zh-Hans"] = str(zh_srt_path.relative_to(base_dir))
            logger.info(f"Generated Chinese SRT with {len(chinese_subs)} subtitles")
            
            # Generate ASS file for Chinese
            zh_ass_path = task_dir / "transcript_zh-Hans.ass"
            await generate_ass_file(zh_srt_path, zh_ass_path)
            ass_files["zh-Hans"] = str(zh_ass_path.relative_to(base_dir))
        
        # Generate main transcript.ass from transcript.srt
        transcript_ass_path = task_dir / "transcript.ass"
        await generate_ass_file(transcript_srt_path, transcript_ass_path)
        ass_files["main"] = str(transcript_ass_path.relative_to(base_dir))
        logger.info(f"Generated main ASS file: transcript.ass")
    
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to generate SRT/ASS files: {str(e)}"
        }
    
    result["srt_files"] = srt_files
    result["ass_files"] = ass_files
    
    # Step 6: Update metadata
    try:
        async with aiofiles.open(metadata_file, 'r', encoding='utf-8') as f:
            metadata_content = await f.read()
        
        metadata = json.loads(metadata_content)
        
        if task_uuid in metadata:
            # Update srt_files and ass_files separately
            metadata[task_uuid]["srt_files"] = srt_files
            metadata[task_uuid]["ass_files"] = ass_files
            
            # Update last_modified timestamp
            from datetime import datetime
            metadata[task_uuid]["last_modified"] = datetime.now().isoformat()
            
            # Save updated metadata
            async with aiofiles.open(metadata_file, 'w', encoding='utf-8') as f:
                await f.write(json.dumps(metadata, indent=4, ensure_ascii=False))
            
            logger.info(f"Updated metadata for task {task_uuid} with SRT and ASS files")
        else:
            logger.warning(f"Task {task_uuid} not found in metadata")
    
    except Exception as e:
        logger.error(f"Failed to update metadata: {str(e)}")
        result["metadata_update_error"] = str(e)
    
    return result 

async def generate_ass_file(srt_path: Path, ass_path: Path):
    """Generate ASS file from SRT file using the convert_srt_to_ass_simple function"""
    try:
        # Create ASS content with proper Chinese/English styling
        async with aiofiles.open(srt_path, 'r', encoding='utf-8') as f:
            srt_content = await f.read()
        
        # Parse SRT content
        processor = SRTProcessor()
        subtitles = processor.parse_srt_content(srt_content)
        
        if not subtitles:
            logger.error(f"No subtitles found in SRT file: {srt_path}")
            return
        
        # Generate ASS content
        ass_content = generate_ass_content(subtitles)
        
        # Write ASS file
        async with aiofiles.open(ass_path, 'w', encoding='utf-8') as f:
            await f.write(ass_content)
        
        logger.info(f"Generated ASS file: {ass_path}")
        
    except Exception as e:
        logger.error(f"Failed to generate ASS file {ass_path}: {e}")

def generate_ass_content(subtitles: List[Dict]) -> str:
    """Generate ASS content from subtitle list"""
    
    # ASS header - 与前端VideoPlayer完全一致的样式
    ass_header = """[Script Info]
Title: Subtitle
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
ScaledBorderAndShadow: yes
YCbCr Matrix: TV.709

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: English,Arial,32,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,3,1,2,20,20,60,1
Style: Chinese,Source Han Sans CN Bold,36,&H003BEBFF,&H000000FF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,3,1,2,20,20,60,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    
    ass_lines = [ass_header]
    
    # Chinese text detection pattern
    chinese_pattern = re.compile(r'[\u4e00-\u9fff]')
    
    for sub in subtitles:
        # Convert time format
        start_time = srt_time_to_ass_time(sub['start_time'])
        end_time = srt_time_to_ass_time(sub['end_time'])
        
        # Detect if text contains Chinese characters
        text = sub['text'].replace('\n', '\\N')  # ASS uses \\N for line breaks
        
        if chinese_pattern.search(text):
            style = "Chinese"
        else:
            style = "English"
        
        # Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
        dialogue_line = f"Dialogue: 0,{start_time},{end_time},{style},,0,0,0,,{text}"
        ass_lines.append(dialogue_line)
    
    return '\n'.join(ass_lines)

def srt_time_to_ass_time(time_str: str) -> str:
    """Convert SRT time format to ASS time format"""
    # SRT: 00:00:20,000 -> ASS: 0:00:20.00
    try:
        if ',' in time_str:
            time_part, ms_part = time_str.split(',')
            ms = int(ms_part) // 10  # Convert milliseconds to centiseconds
            return f"{time_part}.{ms:02d}"
        else:
            return time_str
    except:
        return time_str 