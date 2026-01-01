from fastapi import APIRouter, HTTPException, Path as PathParam
from pydantic import BaseModel
import json
import os
from datetime import datetime
from typing import Optional, Dict, List, Any
import uuid
from pathlib import Path
import re

from ..utils.doc_registry import doc_registry

doc_files_router = APIRouter(prefix="/api", tags=["doc_files"])

METADATA_FILE = 'backend/data/metadata.json'

# Pydantic模型
class DocFileCreate(BaseModel):
    filename: str
    category: str
    path: str
    type: str
    language: Optional[str] = "unknown"
    format: Optional[str] = "unknown"
    size: Optional[int] = None
    blocks_count: Optional[int] = None
    description: Optional[str] = ""

class DocFileUpdate(BaseModel):
    type: Optional[str] = None
    language: Optional[str] = None
    format: Optional[str] = None
    size: Optional[int] = None
    blocks_count: Optional[int] = None
    description: Optional[str] = None

class DocFileSearchRequest(BaseModel):
    query: Optional[str] = ""
    category: Optional[str] = None
    type: Optional[str] = None

def load_metadata():
    """加载metadata.json文件"""
    try:
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except json.JSONDecodeError:
        return {}

def save_metadata(metadata):
    """保存metadata.json文件"""
    try:
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving metadata: {e}")
        return False

def generate_doc_id():
    """生成文档ID"""
    return str(uuid.uuid4())[:8]

@doc_files_router.get('/tasks/{task_uuid}/doc_files')
async def get_doc_files(task_uuid: str):
    """获取任务的所有文档文件"""
    metadata = load_metadata()
    
    if task_uuid not in metadata:
        raise HTTPException(status_code=404, detail='Task not found')
    
    task_data = metadata[task_uuid]
    doc_files = task_data.get('doc_files', {})
    
    # 扁平化文档结构，便于前端使用
    flattened_docs = []
    for category, docs in doc_files.items():
        for filename, doc_info in docs.items():
            flattened_docs.append({
                'id': f"{category}_{filename}",
                'filename': filename,
                'category': category,
                'path': doc_info['path'],
                'type': doc_info.get('type', 'unknown'),
                'language': doc_info.get('language', 'unknown'),
                'format': doc_info.get('format', 'unknown'),
                'created_at': doc_info.get('created_at'),
                'last_modified': doc_info.get('last_modified'),
                'size': doc_info.get('size'),
                'blocks_count': doc_info.get('blocks_count'),
                'description': doc_info.get('description', '')
            })
    
    return {
        'task_uuid': task_uuid,
        'doc_files': flattened_docs,
        'total_count': len(flattened_docs)
    }

@doc_files_router.post('/tasks/{task_uuid}/doc_files')
async def create_doc_file(task_uuid: str, data: DocFileCreate):
    """添加新的文档文件到任务"""
    metadata = load_metadata()
    
    if task_uuid not in metadata:
        raise HTTPException(status_code=404, detail='Task not found')
    
    # 初始化doc_files结构
    if 'doc_files' not in metadata[task_uuid]:
        metadata[task_uuid]['doc_files'] = {
            'transcripts': {},
            'analysis': {},
            'user_documents': {},
            'system_generated': {}
        }
    
    category = data.category
    if category not in metadata[task_uuid]['doc_files']:
        metadata[task_uuid]['doc_files'][category] = {}
    
    # 创建文档信息
    doc_info = {
        'path': data.path,
        'type': data.type,
        'category': category,
        'language': data.language,
        'format': data.format,
        'created_at': datetime.now().isoformat(),
        'last_modified': datetime.now().isoformat(),
        'size': data.size,
        'blocks_count': data.blocks_count,
        'description': data.description
    }
    
    # 添加到metadata
    metadata[task_uuid]['doc_files'][category][data.filename] = doc_info
    
    # 更新任务的last_modified时间
    metadata[task_uuid]['last_modified'] = datetime.now().isoformat()
    
    if save_metadata(metadata):
        return {
            'message': 'Document file added successfully',
            'doc_id': f"{category}_{data.filename}",
            'doc_info': doc_info
        }
    else:
        raise HTTPException(status_code=500, detail='Failed to save metadata')

@doc_files_router.put('/tasks/{task_uuid}/doc_files/{doc_id}')
async def update_doc_file(task_uuid: str, doc_id: str, data: DocFileUpdate):
    """更新文档文件信息"""
    metadata = load_metadata()
    
    if task_uuid not in metadata:
        raise HTTPException(status_code=404, detail='Task not found')
    
    # 解析doc_id (format: category_filename)
    try:
        parts = doc_id.split('_', 1)
        if len(parts) != 2:
            raise HTTPException(status_code=400, detail='Invalid doc_id format')
        category, filename = parts
    except:
        raise HTTPException(status_code=400, detail='Invalid doc_id format')
    
    doc_files = metadata[task_uuid].get('doc_files', {})
    if category not in doc_files or filename not in doc_files[category]:
        raise HTTPException(status_code=404, detail='Document not found')
    
    # 更新文档信息
    doc_info = doc_files[category][filename]
    update_data = data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        doc_info[field] = value
    
    doc_info['last_modified'] = datetime.now().isoformat()
    metadata[task_uuid]['last_modified'] = datetime.now().isoformat()
    
    if save_metadata(metadata):
        return {
            'message': 'Document file updated successfully',
            'doc_info': doc_info
        }
    else:
        raise HTTPException(status_code=500, detail='Failed to save metadata')

@doc_files_router.delete('/tasks/{task_uuid}/doc_files/{doc_id}')
async def delete_doc_file(task_uuid: str, doc_id: str):
    """删除文档文件"""
    metadata = load_metadata()
    
    if task_uuid not in metadata:
        raise HTTPException(status_code=404, detail='Task not found')
    
    # 解析doc_id
    try:
        parts = doc_id.split('_', 1)
        if len(parts) != 2:
            raise HTTPException(status_code=400, detail='Invalid doc_id format')
        category, filename = parts
    except:
        raise HTTPException(status_code=400, detail='Invalid doc_id format')
    
    doc_files = metadata[task_uuid].get('doc_files', {})
    if category not in doc_files or filename not in doc_files[category]:
        raise HTTPException(status_code=404, detail='Document not found')
    
    # 删除文档
    del doc_files[category][filename]
    metadata[task_uuid]['last_modified'] = datetime.now().isoformat()
    
    if save_metadata(metadata):
        return {'message': 'Document file deleted successfully'}
    else:
        raise HTTPException(status_code=500, detail='Failed to save metadata')

@doc_files_router.get('/tasks/{task_uuid}/doc_files/{doc_id}/content')
async def get_doc_file_content(task_uuid: str, doc_id: str):
    """获取文档文件内容"""
    metadata = load_metadata()
    
    if task_uuid not in metadata:
        raise HTTPException(status_code=404, detail='Task not found')
    
    # 解析doc_id
    try:
        parts = doc_id.split('_', 1)
        if len(parts) != 2:
            raise HTTPException(status_code=400, detail='Invalid doc_id format')
        category, filename = parts
    except:
        raise HTTPException(status_code=400, detail='Invalid doc_id format')
    
    doc_files = metadata[task_uuid].get('doc_files', {})
    if category not in doc_files or filename not in doc_files[category]:
        raise HTTPException(status_code=404, detail='Document not found')
    
    doc_info = doc_files[category][filename]
    file_path = f"backend/data/{doc_info['path']}"
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        return {
            'doc_id': doc_id,
            'filename': filename,
            'content': content,
            'doc_info': doc_info
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail='Document file not found on disk')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to read document: {str(e)}')

@doc_files_router.get('/tasks/{task_uuid}/doc_files/{doc_id:path}/blocks')
async def get_doc_file_blocks(task_uuid: str, doc_id: str):
    """获取文档的块信息 - 增强版本，支持自动注册"""
    
    # URL 解码文档 ID
    import urllib.parse
    doc_id = urllib.parse.unquote(doc_id)
    print(f"处理文档: {doc_id}")
    
    # 首先尝试自动扫描和注册文档
    try:
        registered_files = doc_registry.scan_and_register_docs(task_uuid)
        if registered_files:
            print(f"自动注册了 {len(registered_files)} 个文档: {registered_files}")
    except Exception as e:
        print(f"自动注册文档时出错: {e}")
    
    # 获取文档信息
    doc_info = doc_registry.get_document_info(task_uuid, doc_id)
    
    if not doc_info:
        # 如果仍然找不到，尝试直接从文件系统读取
        task_dir = Path(f'backend/data/{task_uuid}')
        file_path = task_dir / doc_id
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail='Document file not found')
        
        # 强制注册这个文档
        try:
            metadata = doc_registry.load_metadata()
            doc_registry.register_document(metadata, task_uuid, file_path, force_update=True)
            doc_registry.save_metadata(metadata)
            doc_info = doc_registry.get_document_info(task_uuid, doc_id)
        except Exception as e:
            print(f"强制注册文档失败: {e}")
            # 使用默认信息
            doc_info = {
                'description': Path(doc_id).stem,
                'category': 'unknown',
                'size': file_path.stat().st_size
            }
    
    try:
        with open(f'backend/data/{task_uuid}/{doc_id}', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 使用更智能的块解析
        blocks = parse_content_to_blocks(content, doc_id, task_uuid, doc_info)
        
        # 更新块数量
        if doc_info and doc_info.get('blocks_count') != len(blocks):
            try:
                metadata = doc_registry.load_metadata()
                if task_uuid in metadata and 'doc_files' in metadata[task_uuid]:
                    doc_files = metadata[task_uuid]['doc_files']
                    for category, docs in doc_files.items():
                        if doc_id in docs:
                            docs[doc_id]['blocks_count'] = len(blocks)
                            docs[doc_id]['last_modified'] = datetime.now().isoformat()
                            break
                    doc_registry.save_metadata(metadata)
            except Exception as e:
                print(f"更新块数量失败: {e}")
        
        return {
            'doc_id': doc_id,
            'filename': doc_info.get('description', Path(doc_id).stem),
            'display_name': doc_info.get('description', Path(doc_id).stem),
            'total_blocks': len(blocks),
            'blocks': blocks,
            'doc_info': doc_info
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail='Document file not found on disk')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to parse document blocks: {str(e)}')


def parse_content_to_blocks(content: str, filename: str, task_uuid: str, doc_info: dict) -> list:
    """智能解析文档内容为块"""
    if not content:
        return []

    blocks = []
    
    # 按段落分割（双换行符）
    paragraphs = content.split('\n\n')
    
    for i, paragraph in enumerate(paragraphs):
        paragraph = paragraph.strip()
        if not paragraph:
            continue
            
        # 确定块类型
        block_type = determine_block_type(paragraph)
        
        # 提取时间戳（如果存在）
        timestamp = extract_timestamp(paragraph)
        
        block = {
            'id': f"{filename.replace('.md', '')}_block_{i+1}",
            'index': i + 1,
            'content': paragraph,
            'type': block_type,
            'doc_id': filename,
            'task_uuid': task_uuid,
            'filename': filename,
            'category': doc_info.get('category', 'unknown'),
            'timestamp': timestamp
        }
        
        blocks.append(block)
    
    return blocks


def determine_block_type(content: str) -> str:
    """确定块的类型"""
    content_stripped = content.strip()
    
    if content_stripped.startswith('#'):
        return 'heading'
    elif content_stripped.startswith('```'):
        return 'code'
    elif content_stripped.startswith('>'):
        return 'quote'
    elif content_stripped.startswith('- ') or content_stripped.startswith('* '):
        return 'list'
    elif '|' in content_stripped and content_stripped.count('|') >= 2:
        return 'table'
    else:
        return 'paragraph'


def extract_timestamp(content: str) -> dict:
    """从内容中提取时间戳"""
    
    # 匹配 [MM:SS] 或 [HH:MM:SS] 格式
    timestamp_pattern = r'\[(\d{1,2}):(\d{2})(?::(\d{2}))?\]'
    matches = re.findall(timestamp_pattern, content)
    
    if matches:
        # 取第一个匹配的时间戳
        match = matches[0]
        minutes = int(match[0])
        seconds = int(match[1])
        
        if match[2]:  # 有小时
            hours = minutes
            minutes = seconds
            seconds = int(match[2])
            total_seconds = hours * 3600 + minutes * 60 + seconds
        else:
            total_seconds = minutes * 60 + seconds
        
        return {
            'start': total_seconds,
            'end': total_seconds + 30  # 默认30秒时长
        }
    
    return None


@doc_files_router.post('/doc_files/search')
async def search_doc_files(data: DocFileSearchRequest):
    """跨任务搜索文档文件"""
    query = data.query.lower() if data.query else ""
    category_filter = data.category
    type_filter = data.type
    
    metadata = load_metadata()
    results = []
    
    for task_uuid, task_data in metadata.items():
        doc_files = task_data.get('doc_files', {})
        task_title = task_data.get('title', 'Unknown Task')
        
        for category, docs in doc_files.items():
            # 应用类别过滤
            if category_filter and category != category_filter:
                continue
                
            for filename, doc_info in docs.items():
                # 应用类型过滤
                if type_filter and doc_info.get('type') != type_filter:
                    continue
                
                # 应用查询过滤
                if query:
                    searchable_text = f"{filename} {doc_info.get('description', '')} {task_title}".lower()
                    if query not in searchable_text:
                        continue
                
                results.append({
                    'id': f"{category}_{filename}",
                    'task_uuid': task_uuid,
                    'task_title': task_title,
                    'filename': filename,
                    'category': category,
                    'path': doc_info['path'],
                    'type': doc_info.get('type', 'unknown'),
                    'language': doc_info.get('language', 'unknown'),
                    'format': doc_info.get('format', 'unknown'),
                    'created_at': doc_info.get('created_at'),
                    'last_modified': doc_info.get('last_modified'),
                    'size': doc_info.get('size'),
                    'blocks_count': doc_info.get('blocks_count'),
                    'description': doc_info.get('description', '')
                })
    
    return {
        'query': data.query,
        'total_results': len(results),
        'results': results
    } 

@doc_files_router.post('/tasks/{task_uuid}/doc_files/{doc_id:path}/rename')
async def rename_document(task_uuid: str, doc_id: str, new_name: dict):
    """重命名文档"""
    new_filename = new_name.get('new_filename')
    
    if not new_filename:
        raise HTTPException(status_code=400, detail='new_filename is required')
    
    # 确保新文件名有正确的扩展名
    if not new_filename.endswith('.md'):
        new_filename += '.md'
    
    try:
        success = doc_registry.rename_document(task_uuid, doc_id, new_filename)
        
        if success:
            return {
                'success': True,
                'old_filename': doc_id,
                'new_filename': new_filename,
                'message': f'文档已重命名: {doc_id} -> {new_filename}'
            }
        else:
            raise HTTPException(status_code=500, detail='重命名失败')
            
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except FileExistsError as e:
        raise HTTPException(status_code=409, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'重命名失败: {str(e)}')


@doc_files_router.post('/tasks/{task_uuid}/doc_files/register_ai_generated')
async def register_ai_generated_document(task_uuid: str, doc_data: dict):
    """注册 AI 生成的文档"""
    filename = doc_data.get('filename')
    content = doc_data.get('content')
    ai_context = doc_data.get('ai_context', {})
    
    if not filename or not content:
        raise HTTPException(status_code=400, detail='filename and content are required')
    
    # 确保文件名有正确的扩展名
    if not filename.endswith('.md'):
        filename += '.md'
    
    try:
        success = doc_registry.register_ai_generated_document(
            task_uuid, filename, content, ai_context
        )
        
        if success:
            return {
                'success': True,
                'filename': filename,
                'message': f'AI 生成文档已注册: {filename}',
                'doc_info': doc_registry.get_document_info(task_uuid, filename)
            }
        else:
            raise HTTPException(status_code=500, detail='注册失败')
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'注册 AI 文档失败: {str(e)}')


@doc_files_router.post('/tasks/{task_uuid}/doc_files/scan_and_register')
async def scan_and_register_documents(task_uuid: str, force_update: bool = False):
    """手动扫描并注册任务目录下的所有文档"""
    try:
        registered_files = doc_registry.scan_and_register_docs(task_uuid, force_update)
        orphaned_files = doc_registry.cleanup_orphaned_entries(task_uuid)
        
        return {
            'success': True,
            'registered_files': registered_files,
            'orphaned_files_cleaned': orphaned_files,
            'message': f'扫描完成，注册了 {len(registered_files)} 个文档，清理了 {len(orphaned_files)} 个孤立条目'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'扫描注册失败: {str(e)}')


@doc_files_router.get('/tasks/{task_uuid}/doc_files/registry_status')
async def get_registry_status(task_uuid: str):
    """获取文档注册状态"""
    try:
        
        task_dir = Path(f'backend/data/{task_uuid}')
        
        if not task_dir.exists():
            raise HTTPException(status_code=404, detail='Task directory not found')
        
        # 获取文件系统中的文档
        fs_files = [f.name for f in task_dir.iterdir() 
                   if f.is_file() and f.suffix in {'.md', '.txt', '.json'}]
        
        # 获取 metadata 中注册的文档
        metadata = doc_registry.load_metadata()
        registered_files = []
        
        if task_uuid in metadata and 'doc_files' in metadata[task_uuid]:
            doc_files = metadata[task_uuid]['doc_files']
            for category, docs in doc_files.items():
                for filename in docs.keys():
                    registered_files.append(filename)
        
        # 找出未注册的文档
        unregistered_files = [f for f in fs_files if f not in registered_files]
        
        # 找出孤立的注册条目
        orphaned_entries = [f for f in registered_files if f not in fs_files]
        
        return {
            'task_uuid': task_uuid,
            'filesystem_files': fs_files,
            'registered_files': registered_files,
            'unregistered_files': unregistered_files,
            'orphaned_entries': orphaned_entries,
            'total_fs_files': len(fs_files),
            'total_registered': len(registered_files),
            'needs_registration': len(unregistered_files),
            'needs_cleanup': len(orphaned_entries)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'获取注册状态失败: {str(e)}') 