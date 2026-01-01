import os
import json
import hashlib
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple
import re

class DocumentRegistry:
    """文档注册管理器 - 处理文档的生命周期管理"""
    
    def __init__(self, metadata_path: str = "backend/data/metadata.json"):
        self.metadata_path = metadata_path
        self.supported_extensions = {'.md', '.txt', '.json'}
        
    def load_metadata(self) -> Dict:
        """加载 metadata.json"""
        try:
            with open(self.metadata_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def save_metadata(self, metadata: Dict) -> None:
        """保存 metadata.json"""
        with open(self.metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    def determine_category(self, filename: str, content: str = "") -> str:
        """根据文件名和内容判断文档分类"""
        filename_lower = filename.lower()
        
        # 基于文件名的规则
        if any(keyword in filename_lower for keyword in ['transcript', '转录', 'vtt', 'srt']):
            return 'transcript'
        elif any(keyword in filename_lower for keyword in ['analysis', '分析', 'report', '报告']):
            return 'analysis'
        elif any(keyword in filename_lower for keyword in ['framework', '框架', 'template', '模板']):
            return 'framework'
        elif any(keyword in filename_lower for keyword in ['summary', '总结', 'digest', '摘要']):
            return 'summary'
        elif filename_lower.startswith('user_') or '用户' in filename_lower:
            return 'user_document'
        
        # 基于内容的判断
        if content:
            if '##' in content and '分析' in content:
                return 'analysis'
            elif '框架' in content or 'Framework' in content:
                return 'framework'
        
        return 'system_generated'
    
    def detect_language(self, file_path: Path) -> str:
        """检测文档语言"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read(1000)  # 读取前1000字符
                
            # 简单的中文检测
            chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', content))
            english_chars = len(re.findall(r'[a-zA-Z]', content))
            
            if chinese_chars > english_chars:
                return 'chinese'
            elif english_chars > chinese_chars * 2:
                return 'english'
            else:
                return 'bilingual'
        except:
            return 'unknown'
    
    def determine_format(self, filename: str, content: str = "") -> str:
        """确定文档格式类型"""
        filename_lower = filename.lower()
        
        if 'timestamp' in filename_lower:
            return 'timestamp_format'
        elif 'parallel' in filename_lower:
            return 'parallel_format'
        elif 'merged' in filename_lower:
            return 'merged_format'
        elif any(keyword in filename_lower for keyword in ['analysis', '分析']):
            return 'analytical_report'
        elif any(keyword in filename_lower for keyword in ['framework', '框架']):
            return 'analysis_framework'
        else:
            return 'standard_markdown'
    
    def generate_description(self, filename: str, content: str = "") -> str:
        """生成文档描述"""
        # 移除文件扩展名
        name_without_ext = Path(filename).stem
        
        # 如果文件名过长，尝试提取关键信息
        if len(name_without_ext) > 50:
            # 提取关键词
            if '：' in name_without_ext:
                return name_without_ext.split('：')[0] + '...'
            elif '-' in name_without_ext:
                return name_without_ext.split('-')[0] + '...'
        
        return name_without_ext
    
    def calculate_file_hash(self, file_path: Path) -> str:
        """计算文件内容哈希，用于检测变更"""
        try:
            with open(file_path, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return ""
    
    def scan_and_register_docs(self, task_uuid: str, force_update: bool = False) -> List[str]:
        """扫描任务目录并注册所有文档到 metadata.json"""
        task_dir = Path(f"backend/data/{task_uuid}")
        
        if not task_dir.exists():
            return []
        
        metadata = self.load_metadata()
        
        if task_uuid not in metadata:
            return []
        
        # 确保 doc_files 结构存在
        if 'doc_files' not in metadata[task_uuid]:
            metadata[task_uuid]['doc_files'] = {
                "transcripts": {},
                "analysis": {},
                "user_documents": {},
                "system_generated": {}
            }
        
        registered_files = []
        
        # 扫描所有支持的文件
        for file_path in task_dir.iterdir():
            if file_path.is_file() and file_path.suffix in self.supported_extensions:
                if self.register_document(metadata, task_uuid, file_path, force_update):
                    registered_files.append(file_path.name)
        
        # 保存更新后的 metadata
        self.save_metadata(metadata)
        return registered_files
    
    def register_document(self, metadata: Dict, task_uuid: str, file_path: Path, force_update: bool = False) -> bool:
        """注册单个文档到 metadata"""
        filename = file_path.name
        
        # 读取文件内容用于分类判断
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
        except:
            content = ""
        
        # 确定分类
        category = self.determine_category(filename, content)
        
        # 映射到 doc_files 的分类结构
        category_mapping = {
            'transcript': 'transcripts',
            'analysis': 'analysis',
            'framework': 'system_generated',
            'summary': 'analysis',
            'user_document': 'user_documents'
        }
        
        doc_category = category_mapping.get(category, 'system_generated')
        
        # 检查是否已经注册
        doc_files = metadata[task_uuid]['doc_files']
        
        # 在所有分类中查找是否已存在
        existing_entry = None
        existing_category = None
        
        for cat, docs in doc_files.items():
            if filename in docs:
                existing_entry = docs[filename]
                existing_category = cat
                break
        
        # 如果已存在且不强制更新，检查是否需要更新
        if existing_entry and not force_update:
            current_hash = self.calculate_file_hash(file_path)
            if existing_entry.get('content_hash') == current_hash:
                return False  # 文件未变更，无需更新
        
        # 创建文档条目
        doc_entry = {
            "path": f"{task_uuid}/{filename}",
            "type": "markdown" if file_path.suffix == '.md' else "text",
            "category": category,
            "language": self.detect_language(file_path),
            "format": self.determine_format(filename, content),
            "created_at": datetime.fromtimestamp(file_path.stat().st_ctime).isoformat(),
            "last_modified": datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
            "size": file_path.stat().st_size,
            "blocks_count": self.count_blocks(content),
            "description": self.generate_description(filename, content),
            "content_hash": self.calculate_file_hash(file_path),
            "auto_registered": True,
            "registration_time": datetime.now().isoformat()
        }
        
        # 如果文档已存在于其他分类中，移除旧的条目
        if existing_category and existing_category != doc_category:
            del doc_files[existing_category][filename]
        
        # 添加到正确的分类
        doc_files[doc_category][filename] = doc_entry
        
        return True
    
    def count_blocks(self, content: str) -> int:
        """简单的块计数 - 按段落分割"""
        if not content:
            return 0
        
        # 按空行分割段落
        paragraphs = [p.strip() for p in content.split('\n\n') if p.strip()]
        return len(paragraphs)
    
    def rename_document(self, task_uuid: str, old_filename: str, new_filename: str) -> bool:
        """重命名文档，同步更新 metadata 和文件系统"""
        task_dir = Path(f"backend/data/{task_uuid}")
        old_path = task_dir / old_filename
        new_path = task_dir / new_filename
        
        if not old_path.exists():
            raise FileNotFoundError(f"源文件不存在: {old_filename}")
        
        if new_path.exists():
            raise FileExistsError(f"目标文件已存在: {new_filename}")
        
        # 重命名文件
        old_path.rename(new_path)
        
        # 更新 metadata
        metadata = self.load_metadata()
        
        if task_uuid not in metadata or 'doc_files' not in metadata[task_uuid]:
            return False
        
        doc_files = metadata[task_uuid]['doc_files']
        
        # 在所有分类中查找并更新
        for category, docs in doc_files.items():
            if old_filename in docs:
                # 复制条目到新名称
                doc_entry = docs[old_filename].copy()
                doc_entry['path'] = f"{task_uuid}/{new_filename}"
                doc_entry['description'] = self.generate_description(new_filename)
                doc_entry['last_modified'] = datetime.now().isoformat()
                doc_entry['renamed_from'] = old_filename
                doc_entry['renamed_at'] = datetime.now().isoformat()
                
                # 添加新条目，删除旧条目
                docs[new_filename] = doc_entry
                del docs[old_filename]
                break
        
        # 更新任务的 last_modified
        metadata[task_uuid]['last_modified'] = datetime.now().isoformat()
        
        # 保存 metadata
        self.save_metadata(metadata)
        
        return True
    
    def register_ai_generated_document(self, task_uuid: str, filename: str, content: str, 
                                     ai_context: Dict = None) -> bool:
        """注册 AI 生成的文档 - 特殊处理"""
        task_dir = Path(f"backend/data/{task_uuid}")
        file_path = task_dir / filename
        
        # 确保目录存在
        task_dir.mkdir(parents=True, exist_ok=True)
        
        # 写入文件
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # 加载 metadata
        metadata = self.load_metadata()
        
        if task_uuid not in metadata:
            return False
        
        # 确保 doc_files 结构存在
        if 'doc_files' not in metadata[task_uuid]:
            metadata[task_uuid]['doc_files'] = {
                "transcripts": {},
                "analysis": {},
                "user_documents": {},
                "system_generated": {}
            }
        
        # 创建 AI 生成文档的特殊条目
        doc_entry = {
            "path": f"{task_uuid}/{filename}",
            "type": "markdown",
            "category": "ai_generated",
            "language": self.detect_language(file_path),
            "format": self.determine_format(filename, content),
            "created_at": datetime.now().isoformat(),
            "last_modified": datetime.now().isoformat(),
            "size": len(content.encode('utf-8')),
            "blocks_count": self.count_blocks(content),
            "description": self.generate_description(filename, content),
            "content_hash": hashlib.md5(content.encode('utf-8')).hexdigest(),
            "ai_generated": True,
            "ai_context": ai_context or {},
            "registration_time": datetime.now().isoformat()
        }
        
        # 根据内容类型选择分类
        if 'analysis' in filename.lower() or '分析' in filename:
            category = 'analysis'
        else:
            category = 'system_generated'
        
        metadata[task_uuid]['doc_files'][category][filename] = doc_entry
        metadata[task_uuid]['last_modified'] = datetime.now().isoformat()
        
        # 保存 metadata
        self.save_metadata(metadata)
        
        return True
    
    def get_document_info(self, task_uuid: str, filename: str) -> Optional[Dict]:
        """获取文档信息"""
        metadata = self.load_metadata()
        
        if task_uuid not in metadata or 'doc_files' not in metadata[task_uuid]:
            return None
        
        doc_files = metadata[task_uuid]['doc_files']
        
        # 在所有分类中查找
        for category, docs in doc_files.items():
            if filename in docs:
                return docs[filename]
        
        return None
    
    def cleanup_orphaned_entries(self, task_uuid: str) -> List[str]:
        """清理 metadata 中存在但文件系统中不存在的条目"""
        task_dir = Path(f"backend/data/{task_uuid}")
        metadata = self.load_metadata()
        
        if task_uuid not in metadata or 'doc_files' not in metadata[task_uuid]:
            return []
        
        orphaned_files = []
        doc_files = metadata[task_uuid]['doc_files']
        
        for category, docs in doc_files.items():
            files_to_remove = []
            for filename, doc_info in docs.items():
                file_path = task_dir / filename
                if not file_path.exists():
                    files_to_remove.append(filename)
                    orphaned_files.append(f"{category}/{filename}")
            
            # 移除孤立的条目
            for filename in files_to_remove:
                del docs[filename]
        
        if orphaned_files:
            self.save_metadata(metadata)
        
        return orphaned_files


# 全局实例
doc_registry = DocumentRegistry() 