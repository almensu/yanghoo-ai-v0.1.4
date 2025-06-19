#!/usr/bin/env python3
import asyncio
import sys
import os
sys.path.append('src')

from src.main import load_metadata

async def test_raw_srt_detection():
    print("Testing raw SRT file detection...")
    
    # Load metadata
    metadata = await load_metadata()
    
    # Find the task with SRT files
    target_uuid = "f161fa75-4c83-491b-b8dd-0f04a7282ab9"
    
    if target_uuid in metadata:
        task = metadata[target_uuid]
        print(f"Task {target_uuid} found")
        print(f"Title: {task.title}")
        
        # Check if raw_srt_files attribute exists
        if hasattr(task, 'raw_srt_files'):
            print(f"raw_srt_files: {task.raw_srt_files}")
        else:
            print("raw_srt_files attribute not found")
            
        # Check other SRT-related fields
        print(f"srt_files: {task.srt_files}")
        print(f"ass_files: {task.ass_files}")
    else:
        print(f"Task {target_uuid} not found in metadata")
        print(f"Available tasks: {list(metadata.keys())}")

if __name__ == "__main__":
    asyncio.run(test_raw_srt_detection()) 