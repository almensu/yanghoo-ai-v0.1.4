import subprocess
import json
import asyncio
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime
import logging
import aiofiles

logger = logging.getLogger(__name__)

class KeyframeExtractor:
    def __init__(self, task_uuid: str, task_dir: Path):
        self.task_uuid = task_uuid
        self.task_dir = task_dir
        self.keyframes_dir = task_dir / "keyframes"
        self.keyframes_json = task_dir / "keyframes.json"
        
    async def extract_keyframes(self, video_path: Path, method: str = "interval", 
                              interval: int = 10, count: int = 100, 
                              quality: str = "medium", **kwargs) -> Dict:
        """
        提取视频关键帧并保存到JSON
        
        Args:
            video_path: 视频文件路径
            method: 提取方法 ("interval", "count", "scene", "ai", "percentage")
            interval: 固定间隔（秒）- 仅用于方案1
            count: 固定数量 - 仅用于方案2
            quality: 图片质量 ("low", "medium", "high")
            **kwargs: 其他方案特定参数
            
        Returns:
            关键帧信息字典
        """
        logger.info(f"开始提取关键帧: {video_path}, 方案: {method}")
        
        # 创建关键帧目录
        self.keyframes_dir.mkdir(exist_ok=True)
        
        # 获取视频信息
        video_info = await self._get_video_info(video_path)
        duration = video_info['duration']
        
        # 设置图片质量参数
        quality_settings = self._get_quality_settings(quality)
        
        # 根据方案生成时间戳
        if method == "interval":
            timestamps, settings = self._method_interval(duration, interval, count)
        elif method == "count":
            timestamps, settings = self._method_count(duration, count)
        else:
            raise ValueError(f"不支持的提取方案: {method}")
        
        keyframes_data = {
            "task_uuid": self.task_uuid,
            "video_path": str(video_path.relative_to(self.task_dir)),
            "video_info": video_info,
            "extraction_settings": {
                "method": method,
                "quality": quality,
                "quality_settings": quality_settings,
                "extracted_at": datetime.now().isoformat(),
                "extractor_version": "2.0.0",
                **settings
            },
            "keyframes": []
        }
        
        # 提取关键帧
        keyframes = []
        total_frames = len(timestamps)
        
        logger.info(f"准备提取 {total_frames} 个关键帧")
        
        for i, timestamp in enumerate(timestamps):
            try:
                frame_info = await self._extract_single_frame(
                    video_path, timestamp, i, quality_settings
                )
                
                if frame_info:
                    keyframes.append(frame_info)
                    
                    if (i + 1) % 10 == 0 or (i + 1) == total_frames:
                        logger.info(f"已提取关键帧: {i + 1}/{total_frames}")
                        
            except Exception as e:
                logger.error(f"提取第 {i} 帧时出错 (时间戳: {timestamp}): {e}")
                continue
        
        keyframes_data["keyframes"] = keyframes
        keyframes_data["extraction_settings"]["actual_count"] = len(keyframes)
        keyframes_data["extraction_settings"]["success_rate"] = len(keyframes) / total_frames if total_frames > 0 else 0
        
        # 保存到JSON文件
        await self._save_keyframes_json(keyframes_data)
        
        logger.info(f"关键帧提取完成，成功提取 {len(keyframes)}/{total_frames} 帧")
        return keyframes_data
    
    def _get_quality_settings(self, quality: str) -> Dict:
        """获取不同质量级别的设置"""
        quality_map = {
            "low": {
                "resolution": "160x90",
                "q_value": "5",  # 较低质量
                "format": "jpg"
            },
            "medium": {
                "resolution": "320x180", 
                "q_value": "2",  # 中等质量
                "format": "jpg"
            },
            "high": {
                "resolution": "640x360",
                "q_value": "1",  # 高质量
                "format": "jpg"
            }
        }
        return quality_map.get(quality, quality_map["medium"])
    
    async def _get_video_info(self, video_path: Path) -> Dict:
        """获取视频基本信息"""
        cmd = [
            "ffprobe", "-v", "quiet", "-print_format", "json",
            "-show_format", "-show_streams", str(video_path)
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd, 
            stdout=asyncio.subprocess.PIPE, 
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode != 0:
            raise Exception(f"FFprobe failed: {stderr.decode()}")
        
        probe_data = json.loads(stdout.decode())
        
        # 提取视频流信息
        video_stream = None
        for stream in probe_data.get('streams', []):
            if stream.get('codec_type') == 'video':
                video_stream = stream
                break
        
        if not video_stream:
            raise Exception("No video stream found")
        
        # 计算帧率
        fps_str = video_stream.get('r_frame_rate', '25/1')
        try:
            if '/' in fps_str:
                num, den = fps_str.split('/')
                fps = float(num) / float(den)
            else:
                fps = float(fps_str)
        except:
            fps = 25.0
        
        return {
            "duration": float(probe_data['format']['duration']),
            "size": int(probe_data['format']['size']),
            "bitrate": int(probe_data['format'].get('bit_rate', 0)),
            "width": video_stream.get('width'),
            "height": video_stream.get('height'),
            "fps": fps,
            "codec": video_stream.get('codec_name'),
            "format": probe_data['format'].get('format_name')
        }
    
    def _method_interval(self, duration: float, interval: int, max_count: int) -> tuple[List[float], Dict]:
        """
        方案1: 固定间隔提取
        按指定时间间隔提取关键帧，适合教学视频等需要均匀采样的场景
        """
        timestamps = []
        current = 0
        
        # 如果max_count为None或负数，表示无限制
        unlimited = max_count is None or max_count <= 0
        
        if unlimited:
            # 无限制模式：按间隔提取所有关键帧
            while current < duration:
                timestamps.append(current)
                current += interval
            
            settings = {
                "requested_interval": interval,
                "actual_interval": interval,
                "max_keyframes": None,
                "interval_adjusted": False,
                "estimated_count": len(timestamps),
                "unlimited_mode": True
            }
        else:
            # 有限制模式：考虑最大数量
            while current < duration and len(timestamps) < max_count:
                timestamps.append(current)
                current += interval
            
            # 如果超出最大数量限制，调整间隔
            if len(timestamps) >= max_count:
                actual_interval = duration / max_count
                timestamps = [i * actual_interval for i in range(max_count) if i * actual_interval < duration]
                adjusted = True
            else:
                actual_interval = interval
                adjusted = False
            
            settings = {
                "requested_interval": interval,
                "actual_interval": actual_interval,
                "max_keyframes": max_count,
                "interval_adjusted": adjusted,
                "estimated_count": len(timestamps),
                "unlimited_mode": False
            }
        
        return timestamps, settings
    
    def _method_count(self, duration: float, count: int) -> tuple[List[float], Dict]:
        """
        方案2: 固定数量提取
        均匀分布提取指定数量的关键帧，适合生成预览、缩略图等场景
        """
        if count <= 1:
            timestamps = [0]
        else:
            # 均匀分布，包括开始和结束位置
            interval = duration / (count - 1)
            timestamps = [i * interval for i in range(count)]
            # 确保最后一帧不超过视频长度
            timestamps = [min(t, duration - 0.1) for t in timestamps]
        
        settings = {
            "requested_count": count,
            "actual_count": len(timestamps),
            "calculated_interval": duration / count if count > 0 else 0,
            "distribution": "uniform"
        }
        
        return timestamps, settings
    
    def _generate_timestamps(self, start: float, end: float, interval: float, max_count: int) -> List[float]:
        """生成时间戳序列（向后兼容）"""
        timestamps = []
        current = start
        
        while current < end and len(timestamps) < max_count:
            timestamps.append(current)
            current += interval
        
        return timestamps
    
    async def _extract_single_frame(self, video_path: Path, timestamp: float, 
                                  frame_index: int, quality_settings: Dict) -> Optional[Dict]:
        """提取单个关键帧"""
        filename = f"keyframe_{frame_index:04d}_{timestamp:.2f}s.{quality_settings['format']}"
        frame_path = self.keyframes_dir / filename
        
        cmd = [
            "ffmpeg", "-v", "quiet",
            "-ss", str(timestamp),
            "-i", str(video_path),
            "-vframes", "1",
            "-q:v", quality_settings['q_value'],
            "-s", quality_settings['resolution'],
            "-y", str(frame_path)
        ]
        
        process = await asyncio.create_subprocess_exec(
            *cmd,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        
        if process.returncode == 0 and frame_path.exists():
            file_size = frame_path.stat().st_size
            
            # 验证图片文件是否有效
            if file_size < 100:  # 文件太小，可能是损坏的
                logger.warning(f"Frame at {timestamp}s is too small ({file_size} bytes), skipping")
                frame_path.unlink(missing_ok=True)
                return None
            
            return {
                "index": frame_index,
                "timestamp": round(timestamp, 2),
                "filename": filename,
                "relative_path": str(frame_path.relative_to(self.task_dir)),
                "absolute_path": str(frame_path),
                "file_size": file_size,
                "resolution": quality_settings['resolution'],
                "format": quality_settings['format'],
                "extracted_at": datetime.now().isoformat(),
                "url_path": f"keyframes/{filename}"
            }
        else:
            error_msg = stderr.decode() if stderr else "Unknown error"
            logger.warning(f"Failed to extract frame at {timestamp}s: {error_msg}")
            return None
    
    async def _save_keyframes_json(self, keyframes_data: Dict):
        """保存关键帧数据到JSON文件"""
        try:
            # 确保数据可以序列化
            json_str = json.dumps(keyframes_data, indent=2, ensure_ascii=False, default=str)
            
            async with aiofiles.open(self.keyframes_json, 'w', encoding='utf-8') as f:
                await f.write(json_str)
            
            logger.info(f"关键帧数据已保存到: {self.keyframes_json}")
            
            # 验证保存的文件
            file_size = self.keyframes_json.stat().st_size
            logger.info(f"JSON文件大小: {file_size} bytes")
            
        except Exception as e:
            logger.error(f"保存关键帧JSON失败: {e}")
            raise
    
    async def load_keyframes_json(self) -> Optional[Dict]:
        """从JSON文件加载关键帧数据"""
        if not self.keyframes_json.exists():
            logger.info(f"关键帧JSON文件不存在: {self.keyframes_json}")
            return None
        
        try:
            async with aiofiles.open(self.keyframes_json, 'r', encoding='utf-8') as f:
                content = await f.read()
                data = json.loads(content)
                
            # 验证数据完整性
            if not self._validate_keyframes_data(data):
                logger.warning("关键帧数据验证失败")
                return None
                
            logger.info(f"成功加载 {len(data.get('keyframes', []))} 个关键帧")
            return data
            
        except Exception as e:
            logger.error(f"加载关键帧JSON失败: {e}")
            return None
    
    def _validate_keyframes_data(self, data: Dict) -> bool:
        """验证关键帧数据的完整性"""
        required_fields = ['task_uuid', 'video_path', 'video_info', 'extraction_settings', 'keyframes']
        
        for field in required_fields:
            if field not in data:
                logger.error(f"关键帧数据缺少必需字段: {field}")
                return False
        
        # 验证关键帧文件是否存在
        missing_files = []
        for frame in data.get('keyframes', []):
            frame_path = self.task_dir / frame.get('relative_path', '')
            if not frame_path.exists():
                missing_files.append(frame.get('filename', 'unknown'))
        
        if missing_files:
            logger.warning(f"发现 {len(missing_files)} 个缺失的关键帧文件")
            # 不返回False，因为这不是致命错误
        
        return True
    
    async def delete_keyframes(self):
        """删除所有关键帧文件和JSON"""
        import shutil
        
        deleted_files = 0
        
        # 删除关键帧目录
        if self.keyframes_dir.exists():
            try:
                deleted_files = len(list(self.keyframes_dir.glob("*")))
                shutil.rmtree(self.keyframes_dir)
                logger.info(f"已删除关键帧目录: {self.keyframes_dir}")
            except Exception as e:
                logger.error(f"删除关键帧目录失败: {e}")
        
        # 删除JSON文件
        if self.keyframes_json.exists():
            try:
                self.keyframes_json.unlink()
                logger.info(f"已删除关键帧JSON: {self.keyframes_json}")
            except Exception as e:
                logger.error(f"删除关键帧JSON失败: {e}")
        
        logger.info(f"任务 {self.task_uuid} 的关键帧清理完成")
        return deleted_files
    
    async def get_keyframes_stats(self) -> Dict:
        """获取关键帧统计信息"""
        data = await self.load_keyframes_json()
        if not data:
            return {"exists": False}
        
        keyframes = data.get('keyframes', [])
        total_size = sum(frame.get('file_size', 0) for frame in keyframes)
        
        return {
            "exists": True,
            "count": len(keyframes),
            "total_size": total_size,
            "video_duration": data.get('video_info', {}).get('duration', 0),
            "extraction_date": data.get('extraction_settings', {}).get('extracted_at'),
            "quality": data.get('extraction_settings', {}).get('quality', 'unknown'),
            "success_rate": data.get('extraction_settings', {}).get('success_rate', 0)
        }


# 场景检测相关功能
async def detect_scenes(video_path: Path, threshold: float = 0.3) -> List[Dict]:
    """
    检测视频场景变化点
    
    Args:
        video_path: 视频路径
        threshold: 场景变化阈值 (0.0-1.0)
    
    Returns:
        场景变化点列表
    """
    cmd = [
        "ffmpeg", "-i", str(video_path),
        "-vf", f"select='gt(scene,{threshold})',showinfo",
        "-f", "null", "-"
    ]
    
    result = await asyncio.create_subprocess_exec(
        *cmd, stdout=asyncio.subprocess.PIPE, stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await result.communicate()
    
    # 解析场景变化点
    import re
    scenes = []
    output_text = stderr.decode() if stderr else ""
    
    for line in output_text.split('\n'):
        if 'pts_time:' in line and 'scene_score' in line:
            time_match = re.search(r'pts_time:(\d+\.?\d*)', line)
            score_match = re.search(r'scene_score:(\d+\.?\d*)', line)
            
            if time_match and score_match:
                scenes.append({
                    "timestamp": float(time_match.group(1)),
                    "score": float(score_match.group(1)),
                    "type": "scene_change"
                })
    
    return sorted(scenes, key=lambda x: x['timestamp'])