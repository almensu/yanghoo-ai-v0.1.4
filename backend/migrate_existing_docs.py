#!/usr/bin/env python3
"""
文档迁移脚本 - 将现有的未注册文档添加到 metadata.json 中
"""

import json
import sys
from pathlib import Path
from datetime import datetime

# 添加项目根目录到 Python 路径
sys.path.append(str(Path(__file__).parent))

from src.utils.doc_registry import DocumentRegistry

def migrate_existing_documents():
    """迁移现有的未注册文档到 metadata.json"""
    
    print("🚀 开始迁移现有文档...")
    
    doc_registry = DocumentRegistry()
    metadata = doc_registry.load_metadata()
    
    total_tasks = len(metadata)
    processed_tasks = 0
    total_registered = 0
    
    print(f"📊 发现 {total_tasks} 个任务需要检查")
    
    for task_uuid, task_data in metadata.items():
        print(f"\n📁 处理任务: {task_uuid}")
        print(f"   标题: {task_data.get('title', 'Unknown')}")
        
        # 确保 doc_files 结构存在
        if 'doc_files' not in task_data:
            task_data['doc_files'] = {
                "transcripts": {},
                "analysis": {},
                "user_documents": {},
                "system_generated": {}
            }
            print("   ✅ 初始化 doc_files 结构")
        
        # 扫描任务目录
        task_dir = Path(f'backend/data/{task_uuid}')
        if not task_dir.exists():
            print("   ⚠️  任务目录不存在，跳过")
            continue
        
        # 获取所有支持的文件
        supported_files = []
        for file_path in task_dir.iterdir():
            if file_path.is_file() and file_path.suffix in {'.md', '.txt', '.json'}:
                supported_files.append(file_path)
        
        print(f"   📄 发现 {len(supported_files)} 个文档文件")
        
        # 检查哪些文件未注册
        registered_count = 0
        for file_path in supported_files:
            filename = file_path.name
            
            # 检查是否已注册
            is_registered = False
            for category, docs in task_data['doc_files'].items():
                if filename in docs:
                    is_registered = True
                    break
            
            if not is_registered:
                # 注册文档
                try:
                    success = doc_registry.register_document(
                        metadata, task_uuid, file_path, force_update=False
                    )
                    if success:
                        registered_count += 1
                        print(f"   ✅ 注册文档: {filename}")
                    else:
                        print(f"   ⚠️  跳过文档: {filename} (可能已存在)")
                except Exception as e:
                    print(f"   ❌ 注册失败: {filename} - {e}")
            else:
                print(f"   ℹ️  已注册: {filename}")
        
        total_registered += registered_count
        processed_tasks += 1
        
        print(f"   📊 本任务新注册: {registered_count} 个文档")
    
    # 保存更新后的 metadata
    print(f"\n💾 保存更新后的 metadata...")
    doc_registry.save_metadata(metadata)
    
    print(f"\n🎉 迁移完成!")
    print(f"📊 统计信息:")
    print(f"   - 处理任务数: {processed_tasks}/{total_tasks}")
    print(f"   - 新注册文档: {total_registered} 个")
    print(f"   - 更新时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")


def verify_migration():
    """验证迁移结果"""
    
    print("\n🔍 验证迁移结果...")
    
    doc_registry = DocumentRegistry()
    metadata = doc_registry.load_metadata()
    
    for task_uuid, task_data in metadata.items():
        task_dir = Path(f'backend/data/{task_uuid}')
        if not task_dir.exists():
            continue
        
        # 获取文件系统中的文档
        fs_files = [f.name for f in task_dir.iterdir() 
                   if f.is_file() and f.suffix in {'.md', '.txt', '.json'}]
        
        # 获取注册的文档
        registered_files = []
        if 'doc_files' in task_data:
            for category, docs in task_data['doc_files'].items():
                registered_files.extend(docs.keys())
        
        # 检查未注册的文件
        unregistered = [f for f in fs_files if f not in registered_files]
        
        if unregistered:
            print(f"⚠️  任务 {task_uuid} 仍有未注册文档: {unregistered}")
        else:
            print(f"✅ 任务 {task_uuid} 所有文档已注册 ({len(fs_files)} 个)")


def show_registration_status():
    """显示当前注册状态"""
    
    print("\n📊 当前文档注册状态:")
    
    doc_registry = DocumentRegistry()
    metadata = doc_registry.load_metadata()
    
    total_tasks = 0
    total_fs_files = 0
    total_registered = 0
    
    for task_uuid, task_data in metadata.items():
        task_dir = Path(f'backend/data/{task_uuid}')
        if not task_dir.exists():
            continue
        
        total_tasks += 1
        
        # 文件系统中的文档
        fs_files = [f.name for f in task_dir.iterdir() 
                   if f.is_file() and f.suffix in {'.md', '.txt', '.json'}]
        total_fs_files += len(fs_files)
        
        # 注册的文档
        registered_files = []
        if 'doc_files' in task_data:
            for category, docs in task_data['doc_files'].items():
                registered_files.extend(docs.keys())
        total_registered += len(registered_files)
    
    print(f"   - 总任务数: {total_tasks}")
    print(f"   - 文件系统文档: {total_fs_files}")
    print(f"   - 已注册文档: {total_registered}")
    print(f"   - 注册率: {(total_registered/total_fs_files*100):.1f}%" if total_fs_files > 0 else "   - 注册率: N/A")


if __name__ == "__main__":
    print("📚 YangHoo AI 文档迁移工具")
    print("=" * 50)
    
    # 显示当前状态
    show_registration_status()
    
    # 确认是否继续
    response = input("\n是否继续执行迁移? (y/N): ").strip().lower()
    
    if response in ['y', 'yes']:
        try:
            migrate_existing_documents()
            verify_migration()
            
            print("\n" + "=" * 50)
            print("✨ 迁移完成! 建议重启应用以使更改生效。")
            
        except Exception as e:
            print(f"\n❌ 迁移过程中发生错误: {e}")
            import traceback
            traceback.print_exc()
    else:
        print("❌ 迁移已取消") 