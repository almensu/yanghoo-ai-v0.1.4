import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import uuid

class BlockRegistry:
    def __init__(self, metadata_path: str = "backend/data/blocks_metadata.json"):
        self.metadata_path = metadata_path
        self.ensure_metadata_file()
    
    def ensure_metadata_file(self) -> None:
        """确保元数据文件存在"""
        if not os.path.exists(self.metadata_path):
            # 创建目录（如果不存在）
            os.makedirs(os.path.dirname(self.metadata_path), exist_ok=True)
            # 创建初始结构
            initial_data = {"blocks": {}, "projects": {}}
            with open(self.metadata_path, 'w', encoding='utf-8') as f:
                json.dump(initial_data, f, indent=2, ensure_ascii=False)
    
    def load_metadata(self) -> Dict:
        """加载 blocks_metadata.json"""
        try:
            with open(self.metadata_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return {"blocks": {}, "projects": {}}
    
    def save_metadata(self, metadata: Dict) -> None:
        """保存 blocks_metadata.json"""
        with open(self.metadata_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
    
    def get_all_blocks(self) -> Dict:
        """获取所有块"""
        metadata = self.load_metadata()
        return metadata.get("blocks", {})
    
    def get_block(self, block_id: str) -> Optional[Dict]:
        """获取特定块"""
        blocks = self.get_all_blocks()
        return blocks.get(block_id)
    
    def add_block(self, block_data: Dict) -> str:
        """添加新块"""
        metadata = self.load_metadata()
        
        # 生成唯一ID（如果没有提供）
        if "id" not in block_data:
            block_data["id"] = f"block_{uuid.uuid4().hex[:8]}"
        
        # 添加时间戳（如果没有提供）
        if "collectTime" not in block_data:
            block_data["collectTime"] = datetime.now().isoformat()
        
        # 添加到blocks集合
        metadata["blocks"][block_data["id"]] = block_data
        
        # 保存更新后的元数据
        self.save_metadata(metadata)
        
        return block_data["id"]
    
    def update_block(self, block_id: str, block_data: Dict) -> bool:
        """更新块"""
        metadata = self.load_metadata()
        
        if block_id not in metadata["blocks"]:
            return False
        
        # 更新块数据
        metadata["blocks"][block_id].update(block_data)
        
        # 保存更新后的元数据
        self.save_metadata(metadata)
        
        return True
    
    def delete_block(self, block_id: str) -> bool:
        """删除块"""
        metadata = self.load_metadata()
        
        if block_id not in metadata["blocks"]:
            return False
        
        # 从所有项目中移除此块的引用
        for project_id, project in metadata["projects"].items():
            if "selectedBlocks" in project and block_id in project["selectedBlocks"]:
                project["selectedBlocks"].remove(block_id)
        
        # 删除块
        del metadata["blocks"][block_id]
        
        # 保存更新后的元数据
        self.save_metadata(metadata)
        
        return True
    
    def get_all_projects(self) -> Dict:
        """获取所有项目"""
        metadata = self.load_metadata()
        return metadata.get("projects", {})
    
    def get_project(self, project_id: str) -> Optional[Dict]:
        """获取特定项目"""
        projects = self.get_all_projects()
        return projects.get(project_id)
    
    def add_project(self, project_data: Dict) -> str:
        """添加新项目"""
        metadata = self.load_metadata()
        
        # 生成唯一ID（如果没有提供）
        if "id" not in project_data:
            project_data["id"] = f"project_{uuid.uuid4().hex[:8]}"
        
        # 添加时间戳（如果没有提供）
        now = datetime.now().isoformat()
        if "createdAt" not in project_data:
            project_data["createdAt"] = now
        if "updatedAt" not in project_data:
            project_data["updatedAt"] = now
        
        # 确保有selectedBlocks数组
        if "selectedBlocks" not in project_data:
            project_data["selectedBlocks"] = []
        
        # 添加到projects集合
        metadata["projects"][project_data["id"]] = project_data
        
        # 保存更新后的元数据
        self.save_metadata(metadata)
        
        return project_data["id"]
    
    def update_project(self, project_id: str, project_data: Dict) -> bool:
        """更新项目"""
        metadata = self.load_metadata()
        
        if project_id not in metadata["projects"]:
            return False
        
        # 更新项目数据
        metadata["projects"][project_id].update(project_data)
        
        # 更新时间戳
        metadata["projects"][project_id]["updatedAt"] = datetime.now().isoformat()
        
        # 保存更新后的元数据
        self.save_metadata(metadata)
        
        return True
    
    def delete_project(self, project_id: str) -> bool:
        """删除项目"""
        metadata = self.load_metadata()
        
        if project_id not in metadata["projects"]:
            return False
        
        # 删除项目
        del metadata["projects"][project_id]
        
        # 保存更新后的元数据
        self.save_metadata(metadata)
        
        return True
    
    def add_block_to_project(self, project_id: str, block_id: str) -> bool:
        """将块添加到项目"""
        metadata = self.load_metadata()
        
        if project_id not in metadata["projects"] or block_id not in metadata["blocks"]:
            return False
        
        # 确保selectedBlocks存在
        if "selectedBlocks" not in metadata["projects"][project_id]:
            metadata["projects"][project_id]["selectedBlocks"] = []
        
        # 避免重复添加
        if block_id not in metadata["projects"][project_id]["selectedBlocks"]:
            metadata["projects"][project_id]["selectedBlocks"].append(block_id)
            
            # 更新时间戳
            metadata["projects"][project_id]["updatedAt"] = datetime.now().isoformat()
            
            # 保存更新后的元数据
            self.save_metadata(metadata)
        
        return True
    
    def remove_block_from_project(self, project_id: str, block_id: str) -> bool:
        """从项目中移除块"""
        metadata = self.load_metadata()
        
        if project_id not in metadata["projects"]:
            return False
        
        # 确保selectedBlocks存在
        if "selectedBlocks" not in metadata["projects"][project_id]:
            return False
        
        # 移除块引用
        if block_id in metadata["projects"][project_id]["selectedBlocks"]:
            metadata["projects"][project_id]["selectedBlocks"].remove(block_id)
            
            # 更新时间戳
            metadata["projects"][project_id]["updatedAt"] = datetime.now().isoformat()
            
            # 保存更新后的元数据
            self.save_metadata(metadata)
            
            return True
        
        return False
    
    def get_project_blocks(self, project_id: str) -> List[Dict]:
        """获取项目中的所有块"""
        metadata = self.load_metadata()
        
        if project_id not in metadata["projects"]:
            return []
        
        project = metadata["projects"][project_id]
        block_ids = project.get("selectedBlocks", [])
        
        blocks = []
        for block_id in block_ids:
            if block_id in metadata["blocks"]:
                block = metadata["blocks"][block_id].copy()
                block["projectId"] = project_id
                block["projectName"] = project.get("name", "")
                blocks.append(block)
        
        return blocks
    
    def backup_metadata(self) -> str:
        """备份元数据"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = f"{os.path.splitext(self.metadata_path)[0]}_{timestamp}.bak.json"
        
        metadata = self.load_metadata()
        
        with open(backup_path, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)
        
        return backup_path
    
    def restore_from_backup(self, backup_path: str) -> bool:
        """从备份恢复"""
        try:
            with open(backup_path, 'r', encoding='utf-8') as f:
                backup_data = json.load(f)
            
            self.save_metadata(backup_data)
            return True
        except Exception as e:
            print(f"恢复备份失败: {e}")
            return False

# 单例实例
block_registry = BlockRegistry()