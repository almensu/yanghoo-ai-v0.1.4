import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as assert from 'assert';

const TARGET_URL = 'https://www.youtube.com/@SpeakEnglishWithVanessa';
const LIMIT = 20;

function runVerification() {
  console.log('Running channel capture hardening verification...');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yanghoo-test-channel-'));
  
  try {
    // 1. Run the CLI command
    console.log(`Executing CLI for channel capture with limit ${LIMIT}...`);
    const cmd = `npx tsx apps/cli/src/main.ts channel add '${TARGET_URL}' --limit ${LIMIT} --json`;
    const result = execSync(cmd, {
      env: { ...process.env, DATA_DIR: tmpDir },
      encoding: 'utf-8'
    });

    const parsedResult = JSON.parse(result);
    assert.ok(parsedResult.manifest, 'Result must contain a manifest');
    assert.strictEqual(parsedResult.videosCount, LIMIT, `videosCount should be exactly ${LIMIT}`);
    assert.strictEqual(parsedResult.manifest.isPartial, true, 'manifest should be marked as partial');
    
    console.log('CLI output parsed successfully and videosCount matches the limit.');

    // 2. Verify persisted files
    const channelId = parsedResult.manifest.id;
    const channelDir = path.join(tmpDir, 'channels', channelId);
    
    assert.ok(fs.existsSync(channelDir), `Channel directory ${channelDir} must exist`);
    
    const manifestPath = path.join(channelDir, 'channel-manifest.json');
    assert.ok(fs.existsSync(manifestPath), 'channel-manifest.json must exist');
    
    const videosPath = path.join(channelDir, 'videos.json');
    assert.ok(fs.existsSync(videosPath), 'videos.json must exist');

    // 3. Verify videos.json content length
    const persistedVideos = JSON.parse(fs.readFileSync(videosPath, 'utf-8'));
    assert.strictEqual(persistedVideos.length, LIMIT, `Persisted videos array length should be exactly ${LIMIT}`);
    
    // 4. Verify deduping (no duplicate videoIds)
    const uniqueIds = new Set(persistedVideos.map((v: any) => v.videoId));
    assert.strictEqual(uniqueIds.size, LIMIT, 'All persisted videos should have unique videoIds');

    console.log('Persisted data verified successfully.');

    // 5. Check for unexpected files (captions, media, etc.)
    const checkUnexpectedFiles = (dir: string) => {
      const files = fs.readdirSync(dir, { withFileTypes: true });
      for (const f of files) {
        if (f.isDirectory()) {
          checkUnexpectedFiles(path.join(dir, f.name));
        } else {
          const name = f.name.toLowerCase();
          if (name.includes('caption') || name.includes('transcript') || name.includes('audio') || name.includes('media')) {
            throw new Error(`Found unexpected file: ${path.join(dir, f.name)}`);
          }
        }
      }
    };
    checkUnexpectedFiles(tmpDir);
    console.log('No unexpected files found.');

    console.log('✅ Hardening verification passed.');

  } finally {
    // Cleanup
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

runVerification();
