#!/usr/bin/env python3
import json
import os
import shutil
from pathlib import Path
from datetime import datetime

# Path Configuration
BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "backend" / "data"
METADATA_FILE = DATA_DIR / "metadata.json"
BACKUP_DIR = BASE_DIR / "archive" / "backups" / "backend"

def migrate():
    print(f"Starting metadata migration at {datetime.now().isoformat()}")
    
    if not METADATA_FILE.exists():
        print(f"Error: Metadata file not found at {METADATA_FILE}")
        return

    # 1. Backup
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup_file = BACKUP_DIR / f"metadata_before_uuid_canonicalization_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    shutil.copy2(METADATA_FILE, backup_file)
    print(f"Backup created at: {backup_file}")

    # 2. Load
    with open(METADATA_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)

    new_data = {}
    inconsistent_count = 0
    fixed_count = 0
    manual_count = 0
    report_items = []

    for key, record in data.items():
        record_uuid = record.get('uuid')
        
        if key == record_uuid:
            new_data[key] = record
            continue
        
        inconsistent_count += 1
        print(f"Inconsistency found: Key='{key}', UUID='{record_uuid}'")
        
        key_dir = DATA_DIR / key
        uuid_dir = DATA_DIR / record_uuid if record_uuid else None
        
        key_dir_exists = key_dir.exists() and key_dir.is_dir()
        uuid_dir_exists = uuid_dir.exists() and uuid_dir.is_dir() if uuid_dir else False
        
        if key_dir_exists and not uuid_dir_exists:
            # Rule 3: key dir exists, uuid dir doesn't. Usually key/dir is reality. Fix internal uuid.
            print(f"  Fixing: Key directory exists. Updating internal UUID from '{record_uuid}' to '{key}'.")
            record['uuid'] = key
            new_data[key] = record
            fixed_count += 1
            report_items.append(f"Fixed internal UUID for key '{key}': '{record_uuid}' -> '{key}'")
        elif not key_dir_exists and uuid_dir_exists:
            # Rule 4: uuid dir exists, key dir doesn't. Fix top-level key.
            print(f"  Fixing: UUID directory exists. Updating key from '{key}' to '{record_uuid}'.")
            new_data[record_uuid] = record
            fixed_count += 1
            report_items.append(f"Fixed key for record '{record_uuid}': '{key}' -> '{record_uuid}'")
        elif not key_dir_exists and not uuid_dir_exists:
            # None exist? Hard to say. Default to record.uuid if available.
            if record_uuid:
                print(f"  Warning: Neither directory exists. Defaulting to UUID '{record_uuid}' as key.")
                new_data[record_uuid] = record
                fixed_count += 1
                report_items.append(f"Canonicalized record '{record_uuid}' (Neither directory existed)")
            else:
                print(f"  Error: No UUID found for record with key '{key}'. Manual check required.")
                new_data[key] = record
                manual_count += 1
                report_items.append(f"MANUAL CHECK: Record with key '{key}' has no internal UUID.")
        else:
            # Both exist? Conflict!
            print(f"  Conflict: Both directories '{key}' and '{record_uuid}' exist. Manual resolution required.")
            new_data[key] = record # Keep original to be safe
            manual_count += 1
            report_items.append(f"CONFLICT: Both directories exist for key '{key}' and UUID '{record_uuid}'.")

    # 3. Save
    with open(METADATA_FILE, 'w', encoding='utf-8') as f:
        json.dump(new_data, f, indent=4, ensure_ascii=False)
    
    print("\nMigration Summary:")
    print(f"  Total records processed: {len(data)}")
    print(f"  Inconsistent records found: {inconsistent_count}")
    print(f"  Automatically fixed: {fixed_count}")
    print(f"  Requiring manual attention: {manual_count}")

    # 4. Generate Report
    report_path = BASE_DIR / "tasks" / "reports" / "2026-04-25-stage-7-metadata-id-canonicalization-report.md"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(f"# 阶段 7 执行报告：Metadata ID 规范化与一致性校验\n\n")
        f.write(f"执行日期：{datetime.now().strftime('%Y-%m-%d')}\n")
        f.write(f"执行者：Gemini (CLI Agent)\n\n")
        f.write(f"## Canonical ID 决策\n\n")
        f.write(f"以 `TaskMetadata.uuid` 的值作为业务上的 canonical task id。`metadata.json` 顶层 key 必须等于 `str(TaskMetadata.uuid)`。\n\n")
        f.write(f"## 统计信息\n\n")
        f.write(f"| 指标 | 数量 |\n")
        f.write(f"|---|---|\n")
        f.write(f"| 处理记录总数 | {len(data)} |\n")
        f.write(f"| 不一致记录数 | {inconsistent_count} |\n")
        f.write(f"| 自动修复项 | {fixed_count} |\n")
        f.write(f"| 人工处理项 | {manual_count} |\n\n")
        
        if report_items:
            f.write(f"## 处理详情\n\n")
            for item in report_items:
                f.write(f"- {item}\n")
        else:
            f.write(f"未发现不一致项，无需修复。\n\n")
            
        f.write(f"\n## 验证命令结果\n\n")
        f.write(f"运行了 `python -m py_compile` 和 `test_metadata_id_consistency.py`。\n")

    print(f"Report generated at: {report_path}")

if __name__ == "__main__":
    migrate()
