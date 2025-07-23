from fastapi import APIRouter, HTTPException, Path as PathParam
from pydantic import BaseModel
import json
import os
from datetime import datetime
from typing import Optional, Dict, List, Any
import uuid

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

@doc_files_router.get('/tasks/{task_uuid}/doc_files/{doc_id}/blocks')
async def get_doc_file_blocks(task_uuid: str, doc_id: str):
    """获取文档文件的块结构（用于项目篮溯源）"""
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
        
        # 简单的块解析（按段落分割）
        blocks = []
        paragraphs = content.split('\n\n')
        
        for i, paragraph in enumerate(paragraphs):
            if paragraph.strip():
                block_id = f"{doc_id}_block_{i+1}"
                blocks.append({
                    'id': block_id,
                    'index': i + 1,
                    'content': paragraph.strip(),
                    'type': 'paragraph',
                    'doc_id': doc_id,
                    'task_uuid': task_uuid,
                    'filename': filename,
                    'category': category
                })
        
        # 更新块数量
        doc_info['blocks_count'] = len(blocks)
        save_metadata(metadata)
        
        return {
            'doc_id': doc_id,
            'filename': filename,
            'total_blocks': len(blocks),
            'blocks': blocks,
            'doc_info': doc_info
        }
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail='Document file not found on disk')
    except Exception as e:
        raise HTTPException(status_code=500, detail=f'Failed to parse document blocks: {str(e)}')

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