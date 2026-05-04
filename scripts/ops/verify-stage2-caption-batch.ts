import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as assert from 'assert';

const TARGET_URL = 'https://www.youtube.com/@SpeakEnglishWithVanessa';
const CHANNEL_ID = 'youtube-UCxJGMJbjokfnr2-s4_RXPxQ';
const LIMIT = 2;
const LANGUAGE = 'en';

interface CliResult {
  json: any;
  logs: string;
}

function runCli(cmd: string, dataDir: string): CliResult {
  const output = execSync(cmd + ' 2>&1', {
    env: { ...process.env, DATA_DIR: dataDir },
    encoding: 'utf-8'
  });
  // CLI outputs logs and JSON mixed on stdout.
  // Find the last line that starts with '{' and parse from there.
  const lines = output.trim().split('\n');
  let jsonStart = -1;
  let braceDepth = 0;
  for (let i = lines.length - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line === '' || line === '}') braceDepth++;
    if (line.startsWith('{')) {
      jsonStart = i;
      break;
    }
  }
  if (jsonStart === -1) throw new Error('No JSON output found in CLI output');

  const jsonStr = lines.slice(jsonStart).join('\n');
  const logs = lines.slice(0, jsonStart).join('\n');
  return { json: JSON.parse(jsonStr), logs };
}

function findFiles(dir: string, predicate: (relPath: string) => boolean): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const rel = path.relative(dir, full);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        if (predicate(rel)) results.push(rel);
      }
    }
  };
  walk(dir);
  return results.sort();
}

function runVerification() {
  console.log('Running Stage 2 caption batch verification...');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yanghoo-stage2-'));

  try {
    // Step 1: Channel add
    console.log(`Step 1: channel add --limit ${LIMIT}`);
    const addResult = runCli(
      `npx tsx apps/cli/src/main.ts channel add '${TARGET_URL}' --limit ${LIMIT} --json`,
      tmpDir
    );
    const addJson = addResult.json;
    assert.strictEqual(addJson.videosCount, LIMIT, `channel add should capture exactly ${LIMIT} videos`);
    console.log(`  -> Captured ${addJson.videosCount} videos`);

    // Step 2: Channel captions with --language en
    console.log(`Step 2: channel captions --language ${LANGUAGE} --limit ${LIMIT}`);
    const captionsResult = runCli(
      `npx tsx apps/cli/src/main.ts channel captions ${CHANNEL_ID} --language ${LANGUAGE} --limit ${LIMIT} --json`,
      tmpDir
    );
    const captionsJson = captionsResult.json;
    assert.strictEqual(captionsJson.processed, LIMIT, `Should process exactly ${LIMIT} videos`);
    assert.strictEqual(captionsJson.success.length, LIMIT, `All ${LIMIT} should succeed`);
    assert.strictEqual(captionsJson.failed.length, 0, `No failures expected for Vanessa channel`);
    console.log(`  -> Processed: ${captionsJson.processed}, Success: ${captionsJson.success.length}, Failed: ${captionsJson.failed.length}`);

    // Step 3: Verify NO zh-Hans network requests in logs
    const logs = captionsResult.logs;
    const zhHansLogLines = logs.split('\n').filter(line =>
      line.includes('zh-Hans') || line.includes('Zh-Hans')
    );
    assert.strictEqual(zhHansLogLines.length, 0,
      `No zh-Hans network requests should appear in logs for --language en.\nFound:\n${zhHansLogLines.join('\n')}`);
    console.log('  -> No zh-Hans network requests in logs');

    // Step 4: Verify source directories
    const sourcesDir = path.join(tmpDir, 'sources');
    const sourceDirs = fs.readdirSync(sourcesDir).filter(d =>
      fs.statSync(path.join(sourcesDir, d)).isDirectory()
    );
    assert.strictEqual(sourceDirs.length, LIMIT, `Should have exactly ${LIMIT} source directories`);
    console.log(`  -> Source directories: ${sourceDirs.length}`);

    // Step 5: Verify no duplicate source IDs
    assert.strictEqual(new Set(sourceDirs).size, sourceDirs.length, 'No duplicate source directories');
    console.log('  -> No duplicate source IDs');

    // Step 6: Verify English caption assets exist for each source
    for (const dir of sourceDirs) {
      const enDir = path.join(sourcesDir, dir, 'captions', 'en');
      assert.ok(fs.existsSync(enDir), `Missing captions/en dir for ${dir}`);

      const enFiles = fs.readdirSync(enDir);
      const expectedFiles = ['transcript-raw.json', 'transcript-sentences.json', 'transcript.vtt', 'document.md'];
      for (const f of expectedFiles) {
        assert.ok(enFiles.includes(f), `Missing ${f} in captions/en for ${dir}`);
      }
    }
    console.log('  -> English caption assets verified for all sources');

    // Step 7: Verify primary transcript assets
    for (const dir of sourceDirs) {
      const sourceDir = path.join(sourcesDir, dir);
      for (const f of ['record.json', 'transcript-raw.json', 'transcript-sentences.json', 'transcript.vtt', 'document.md', 'transcript-manifest.json']) {
        assert.ok(fs.existsSync(path.join(sourceDir, f)), `Missing ${f} in ${dir}`);
      }
    }
    console.log('  -> Primary transcript assets verified');

    // Step 8: Verify NO zh-Hans persisted assets
    const zhHansFiles = findFiles(sourcesDir, rel => rel.includes('zh-Hans'));
    assert.strictEqual(zhHansFiles.length, 0, `Should have no zh-Hans files, found: ${zhHansFiles.join(', ')}`);
    console.log('  -> No zh-Hans files (correct for --language en)');

    // Step 9: Verify NO translation assets
    const translationFiles = findFiles(sourcesDir, rel => rel.includes('translation'));
    assert.strictEqual(translationFiles.length, 0, `Should have no translation files, found: ${translationFiles.join(', ')}`);
    console.log('  -> No translation files (correct for --language en)');

    // Step 10: Verify NO audio/media assets
    const audioMediaFiles = findFiles(sourcesDir, rel =>
      rel.startsWith('audio.') || rel.startsWith('media.')
    );
    assert.strictEqual(audioMediaFiles.length, 0, `Should have no audio/media files, found: ${audioMediaFiles.join(', ')}`);
    console.log('  -> No audio/media files');

    // Step 11: Verify caption manifest requestedLanguages is scoped
    for (const dir of sourceDirs) {
      const manifestPath = path.join(sourcesDir, dir, 'captions', 'captions-manifest.json');
      if (fs.existsSync(manifestPath)) {
        const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        assert.deepStrictEqual(manifest.requestedLanguages, [LANGUAGE],
          `captions-manifest.json requestedLanguages should be ["${LANGUAGE}"], got ${JSON.stringify(manifest.requestedLanguages)}`);
      }
    }
    console.log('  -> Caption manifests scoped to requested language');

    console.log('\nStage 2 caption batch verification passed.');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

runVerification();
