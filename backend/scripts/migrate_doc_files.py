#!/usr/bin/env python3
"""
数据迁移脚本：将现有的md文档路径转换为doc_files结构
用于支持项目篮的完整溯源功能
"""

import json
import os
from datetime import datetime
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parents[1]
DATA_DIR = BACKEND_DIR / "data"
METADATA_FILE = DATA_DIR / "metadata.json"
BACKUP_FILE = DATA_DIR / "metadata_backup_before_doc_files_migration.json"

def load_metadata():
    """加载metadata.json文件"""
    try:
        with open(METADATA_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: {METADATA_FILE} not found")
        return None
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {METADATA_FILE}: {e}")
        return None

def save_metadata(metadata):
    """保存metadata.json文件"""
    try:
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        print(f"Error saving metadata: {e}")
        return False

def backup_metadata(metadata):
    """备份原始metadata文件"""
    try:
        with open(BACKUP_FILE, 'w', encoding='utf-8') as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)
        print(f"✅ 原始metadata已备份到: {BACKUP_FILE}")
        return True
    except Exception as e:
        print(f"❌ 备份失败: {e}")
        return False

def get_file_info(file_path):
    """获取文件信息"""
    full_path = DATA_DIR / file_path
    try:
        if os.path.exists(full_path):
            stat = os.stat(full_path)
            return {
                'size': stat.st_size,
                'created_at': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                'last_modified': datetime.fromtimestamp(stat.st_mtime).isoformat()
            }
    except:
        pass
    
    return {
        'size': None,
        'created_at': None,
        'last_modified': None
    }

def migrate_task_documents(task_uuid, task_data):
    """迁移单个任务的文档"""
    print(f"📋 迁移任务: {task_data.get('title', 'Unknown')} ({task_uuid[:8]}...)")
    
    # 如果已经有doc_files结构，跳过
    if 'doc_files' in task_data:
        print("  ⏭️  已存在doc_files结构，跳过")
        return task_data, 0
    
    # 初始化doc_files结构
    doc_files = {
        'transcripts': {},
        'analysis': {},
        'user_documents': {},
        'system_generated': {}
    }
    
    migrated_count = 0
    
    # 映射旧字段到新的doc_files结构
    document_mappings = [
        # 转录文档
        ('parallel_vtt_md_path', 'transcripts', 'parallel_transcript_vtt.md', 'transcript', 'bilingual', 'vtt_based'),
        ('merged_format_vtt_md_path', 'transcripts', 'merged_transcript_vtt.md', 'transcript', 'bilingual', 'vtt_based'),
        ('en_only_vtt_md_path', 'transcripts', 'en_transcript_vtt.md', 'transcript', 'english', 'vtt_based'),
        ('zh_only_vtt_md_path', 'transcripts', 'zh_transcript_vtt.md', 'transcript', 'chinese', 'vtt_based'),
        ('en_only_vtt_timestamp_md_path', 'transcripts', 'en_transcript_vtt_timestamp.md', 'transcript', 'english', 'vtt_timestamp'),
        ('zh_only_vtt_timestamp_md_path', 'transcripts', 'zh_transcript_vtt_timestamp.md', 'transcript', 'chinese', 'vtt_timestamp'),
        ('merged_whisperx_md_path', 'transcripts', 'merged_whisperx.md', 'transcript', 'bilingual', 'whisperx_based'),
        
        # SRT转录文档 (如果存在srt_md_files)
        ('srt_md_files', 'transcripts', None, 'transcript', 'various', 'srt_based'),
    ]
    
    for old_field, category, default_filename, doc_category, language, format_type in document_mappings:
        if old_field in task_data and task_data[old_field]:
            if old_field == 'srt_md_files' and isinstance(task_data[old_field], dict):
                # 处理srt_md_files字典
                for srt_key, srt_path in task_data[old_field].items():
                    if srt_path:
                        filename = f"{srt_key}_transcript_srt.md"
                        file_info = get_file_info(srt_path)
                        
                        doc_files[category][filename] = {
                            'path': srt_path,
                            'type': 'markdown',
                            'category': doc_category,
                            'language': srt_key.replace('_', ' '),
                            'format': format_type,
                            'created_at': file_info['created_at'] or task_data.get('created_at'),
                            'last_modified': file_info['last_modified'] or task_data.get('last_modified'),
                            'size': file_info['size'],
                            'blocks_count': None,
                            'description': f"SRT-based transcript in {srt_key.replace('_', ' ')} format"
                        }
                        migrated_count += 1
                        print(f"  ✅ 迁移SRT文档: {filename}")
            else:
                # 处理单个路径字段
                file_path = task_data[old_field]
                if file_path and default_filename:
                    file_info = get_file_info(file_path)
                    
                    doc_files[category][default_filename] = {
                        'path': file_path,
                        'type': 'markdown',
                        'category': doc_category,
                        'language': language,
                        'format': format_type,
                        'created_at': file_info['created_at'] or task_data.get('created_at'),
                        'last_modified': file_info['last_modified'] or task_data.get('last_modified'),
                        'size': file_info['size'],
                        'blocks_count': None,
                        'description': f"{language.title()} transcript in {format_type.replace('_', ' ')} format"
                    }
                    migrated_count += 1
                    print(f"  ✅ 迁移文档: {default_filename}")
    
    # 添加doc_files到任务数据
    if migrated_count > 0:
        task_data['doc_files'] = doc_files
        print(f"  📊 总计迁移 {migrated_count} 个文档")
    else:
        print("  ℹ️  没有找到可迁移的文档")
    
    return task_data, migrated_count

def main():
    """主迁移函数"""
    print("🚀 开始doc_files数据迁移...")
    print("=" * 50)
    
    # 加载原始数据
    metadata = load_metadata()
    if metadata is None:
        return False
    
    print(f"📁 加载了 {len(metadata)} 个任务")
    
    # 备份原始数据
    if not backup_metadata(metadata):
        return False
    
    # 执行迁移
    total_migrated = 0
    total_tasks = len(metadata)
    
    for task_uuid, task_data in metadata.items():
        try:
            updated_task_data, migrated_count = migrate_task_documents(task_uuid, task_data)
            metadata[task_uuid] = updated_task_data
            total_migrated += migrated_count
        except Exception as e:
            print(f"❌ 迁移任务 {task_uuid[:8]}... 失败: {e}")
            continue
    
    print("=" * 50)
    print(f"📊 迁移统计:")
    print(f"  - 总任务数: {total_tasks}")
    print(f"  - 总迁移文档数: {total_migrated}")
    
    # 保存迁移后的数据
    if save_metadata(metadata):
        print("✅ 迁移完成！新的metadata.json已保存")
        print(f"💡 如果需要回滚，请使用: {BACKUP_FILE}")
        return True
    else:
        print("❌ 保存迁移后的数据失败")
        return False

def rollback():
    """回滚迁移"""
    print("🔄 开始回滚迁移...")
    
    if not os.path.exists(BACKUP_FILE):
        print(f"❌ 备份文件不存在: {BACKUP_FILE}")
        return False
    
    try:
        # 恢复备份
        with open(BACKUP_FILE, 'r', encoding='utf-8') as f:
            backup_data = json.load(f)
        
        with open(METADATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, ensure_ascii=False, indent=2)
        
        print("✅ 回滚完成！已恢复到迁移前状态")
        return True
    except Exception as e:
        print(f"❌ 回滚失败: {e}")
        return False

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) > 1 and sys.argv[1] == 'rollback':
        rollback()
    else:
        main() 
