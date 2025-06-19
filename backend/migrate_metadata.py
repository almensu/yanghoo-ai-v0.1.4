#!/usr/bin/env python3
"""
Migration script to add ass_files field to all tasks in metadata.json
"""

import json
import os

def migrate_metadata():
    metadata_file = "data/metadata.json"
    
    if not os.path.exists(metadata_file):
        print(f"Metadata file {metadata_file} not found!")
        return
    
    # Read current metadata
    with open(metadata_file, 'r', encoding='utf-8') as f:
        metadata = json.load(f)
    
    # Update each task
    updated_count = 0
    for task_uuid, task_data in metadata.items():
        if "ass_files" not in task_data:
            task_data["ass_files"] = {}
            updated_count += 1
            print(f"Added ass_files to task {task_uuid}")
    
    # Save updated metadata
    with open(metadata_file, 'w', encoding='utf-8') as f:
        json.dump(metadata, f, indent=4, ensure_ascii=False)
    
    print(f"Migration completed! Updated {updated_count} tasks.")

if __name__ == "__main__":
    migrate_metadata() 