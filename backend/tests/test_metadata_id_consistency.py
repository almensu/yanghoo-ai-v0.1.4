import unittest
import json
import os
import asyncio
from pathlib import Path
from uuid import uuid4
from unittest.mock import patch, MagicMock

# Add backend to path
import sys
from pathlib import Path
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
sys.path.insert(0, str(backend_dir)) # Ensure backend is in path

from src.main import load_metadata, save_metadata
from src.schemas import TaskMetadata, Platform

class TestMetadataConsistency(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.test_data_dir = Path(__file__).parent / "temp_test_data"
        self.test_data_dir.mkdir(exist_ok=True)
        self.metadata_file = self.test_data_dir / "metadata.json"
        
        # Patch constants in main
        self.patches = [
            patch('src.main.METADATA_FILE', self.metadata_file),
            patch('src.main.DATA_DIR', self.test_data_dir)
        ]
        for p in self.patches:
            p.start()

    def tearDown(self):
        for p in self.patches:
            p.stop()
        if self.metadata_file.exists():
            self.metadata_file.unlink()
        if self.test_data_dir.exists():
            import shutil
            shutil.rmtree(self.test_data_dir)

    async def test_load_metadata_consistency_check(self):
        # Create inconsistent metadata
        uuid1 = str(uuid4())
        uuid2 = str(uuid4())
        
        inconsistent_data = {
            uuid1: { # Key matches internal UUID
                "uuid": uuid1,
                "url": "http://test1.com",
                "platform": "youtube"
            },
            "wrong-key": { # Key does NOT match internal UUID
                "uuid": uuid2,
                "url": "http://test2.com",
                "platform": "youtube"
            }
        }
        
        with open(self.metadata_file, 'w') as f:
            json.dump(inconsistent_data, f)
            
        loaded = await load_metadata()
        
        self.assertIn(uuid1, loaded)
        self.assertNotIn("wrong-key", loaded)
        self.assertNotIn(uuid2, loaded) # Should be skipped because key was wrong
        self.assertEqual(len(loaded), 1)

    async def test_save_metadata_normalization(self):
        uuid1 = uuid4()
        task_meta = TaskMetadata(
            uuid=uuid1,
            url="http://test.com",
            platform=Platform.YOUTUBE
        )
        
        # Save with a dict that has a "wrong" key manually
        metadata_to_save = {
            "incorrect-key": task_meta
        }
        
        await save_metadata(metadata_to_save)
        
        # Verify saved file
        with open(self.metadata_file, 'r') as f:
            saved_data = json.load(f)
            
        self.assertIn(str(uuid1), saved_data)
        self.assertNotIn("incorrect-key", saved_data)
        self.assertEqual(saved_data[str(uuid1)]['uuid'], str(uuid1))

if __name__ == "__main__":
    unittest.main()
