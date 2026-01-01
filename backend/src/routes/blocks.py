from fastapi import APIRouter, HTTPException, Body, Query, Path
from typing import Dict, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

# 导入块注册表
from ..utils.block_registry import block_registry

router = APIRouter()

# 数据模型
class BlockBase(BaseModel):
    content: str
    taskTitle: Optional[str] = None
    filename: Optional[str] = None
    projectName: Optional[str] = None
    type: Optional[str] = None
    taskUuid: Optional[str] = None
    docId: Optional[str] = None
    blockIndex: Optional[int] = None
    totalBlocks: Optional[int] = None
    timestamp: Optional[Dict] = None

class BlockCreate(BlockBase):
    pass

class Block(BlockBase):
    id: str
    collectTime: str
    
    class Config:
        orm_mode = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class Project(ProjectBase):
    id: str
    createdAt: str
    updatedAt: str
    selectedBlocks: List[str] = []
    
    class Config:
        orm_mode = True

# 块API端点
@router.get("/blocks", response_model=List[Block])
async def get_all_blocks():
    """获取所有块"""
    blocks = block_registry.get_all_blocks()
    return list(blocks.values())

@router.get("/blocks/{block_id}", response_model=Block)
async def get_block(block_id: str = Path(..., title="块ID")):
    """获取特定块"""
    block = block_registry.get_block(block_id)
    if not block:
        raise HTTPException(status_code=404, detail="块不存在")
    return block

@router.post("/blocks", response_model=Block)
async def create_block(block: BlockCreate = Body(...)):
    """创建新块"""
    block_dict = block.dict()
    block_id = block_registry.add_block(block_dict)
    return block_registry.get_block(block_id)

@router.put("/blocks/{block_id}", response_model=Block)
async def update_block(block_id: str = Path(..., title="块ID"), block: BlockBase = Body(...)):
    """更新块"""
    block_dict = block.dict(exclude_unset=True)
    success = block_registry.update_block(block_id, block_dict)
    if not success:
        raise HTTPException(status_code=404, detail="块不存在")
    return block_registry.get_block(block_id)

@router.delete("/blocks/{block_id}", response_model=Dict)
async def delete_block(block_id: str = Path(..., title="块ID")):
    """删除块"""
    success = block_registry.delete_block(block_id)
    if not success:
        raise HTTPException(status_code=404, detail="块不存在")
    return {"success": True, "message": "块已删除"}

# 项目API端点
@router.get("/projects", response_model=List[Project])
async def get_all_projects():
    """获取所有项目"""
    projects = block_registry.get_all_projects()
    return list(projects.values())

@router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str = Path(..., title="项目ID")):
    """获取特定项目"""
    project = block_registry.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project

@router.post("/projects", response_model=Project)
async def create_project(project: ProjectCreate = Body(...)):
    """创建新项目"""
    project_dict = project.dict()
    project_id = block_registry.add_project(project_dict)
    return block_registry.get_project(project_id)

@router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str = Path(..., title="项目ID"), project: ProjectBase = Body(...)):
    """更新项目"""
    project_dict = project.dict(exclude_unset=True)
    success = block_registry.update_project(project_id, project_dict)
    if not success:
        raise HTTPException(status_code=404, detail="项目不存在")
    return block_registry.get_project(project_id)

@router.delete("/projects/{project_id}", response_model=Dict)
async def delete_project(project_id: str = Path(..., title="项目ID")):
    """删除项目"""
    success = block_registry.delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="项目不存在")
    return {"success": True, "message": "项目已删除"}

# 项目块关联API
@router.get("/projects/{project_id}/blocks", response_model=List[Block])
async def get_project_blocks(project_id: str = Path(..., title="项目ID")):
    """获取项目中的所有块"""
    blocks = block_registry.get_project_blocks(project_id)
    return blocks

@router.post("/projects/{project_id}/blocks/{block_id}", response_model=Dict)
async def add_block_to_project(
    project_id: str = Path(..., title="项目ID"),
    block_id: str = Path(..., title="块ID")
):
    """将块添加到项目"""
    success = block_registry.add_block_to_project(project_id, block_id)
    if not success:
        raise HTTPException(status_code=404, detail="项目或块不存在")
    return {"success": True, "message": "块已添加到项目"}

@router.delete("/projects/{project_id}/blocks/{block_id}", response_model=Dict)
async def remove_block_from_project(
    project_id: str = Path(..., title="项目ID"),
    block_id: str = Path(..., title="块ID")
):
    """从项目中移除块"""
    success = block_registry.remove_block_from_project(project_id, block_id)
    if not success:
        raise HTTPException(status_code=404, detail="项目或块不存在或块不在项目中")
    return {"success": True, "message": "块已从项目中移除"}

# 备份和恢复API
@router.post("/blocks/backup", response_model=Dict)
async def backup_blocks_data():
    """备份块数据"""
    backup_path = block_registry.backup_metadata()
    return {"success": True, "backup_path": backup_path}

@router.post("/blocks/restore", response_model=Dict)
async def restore_blocks_data(backup_path: str = Body(..., embed=True)):
    """从备份恢复块数据"""
    success = block_registry.restore_from_backup(backup_path)
    if not success:
        raise HTTPException(status_code=400, detail="恢复备份失败")
    return {"success": True, "message": "已从备份恢复数据"}