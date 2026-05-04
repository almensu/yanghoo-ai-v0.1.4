import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as assert from 'assert';

const TARGET_URL = 'https://www.youtube.com/@SpeakEnglishWithVanessa';
const CHANNEL_ID = 'youtube-UCxJGMJbjokfnr2-s4_RXPxQ';
const LANGUAGE = 'en';
const MANIFEST_LIMIT = 5;
const BATCH_SIZE = 2;

interface CliResult {
  json: any;
  logs: string;
}

function runCli(cmd: string, dataDir: string): CliResult {
  const output = execSync(cmd + ' 2>&1', {
    env: { ...process.env, DATA_DIR: dataDir },
    encoding: 'utf-8'
  });
  const text = output.trimEnd();
  let depth = 0;
  let jsonStart = -1;
  for (let i = text.length - 1; i >= 0; i--) {
    if (text[i] === '}') depth++;
    if (text[i] === '{') depth--;
    if (depth === 0 && text[i] === '{') {
      try {
        JSON.parse(text.substring(i));
        jsonStart = i;
        break;
      } catch { depth = 0; }
    }
  }
  if (jsonStart === -1) throw new Error('No JSON output found:\n' + text);
  const jsonStr = text.substring(jsonStart);
  const logs = text.substring(0, jsonStart).trim();
  return { json: JSON.parse(jsonStr), logs };
}

function readJson(dataDir: string, relPath: string): any {
  const fullPath = path.join(dataDir, relPath);
  if (!fs.existsSync(fullPath)) return null;
  return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
}

function findFiles(dir: string, predicate: (relPath: string) => boolean): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const walk = (current: string) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      const rel = path.relative(dir, full);
      if (entry.isDirectory()) walk(full);
      else if (predicate(rel)) results.push(rel);
    }
  };
  walk(dir);
  return results.sort();
}

function assertNoForbiddenAssets(sourcesDir: string, label: string) {
  const zhHans = findFiles(sourcesDir, rel => rel.includes('zh-Hans'));
  assert.strictEqual(zhHans.length, 0, `[${label}] No zh-Hans files`);
  const translation = findFiles(sourcesDir, rel => rel.includes('translation'));
  assert.strictEqual(translation.length, 0, `[${label}] No translation files`);
  const media = findFiles(sourcesDir, rel => rel.startsWith('audio.') || rel.startsWith('media.'));
  assert.strictEqual(media.length, 0, `[${label}] No audio/media files`);
}

function assertNoZhHansInLogs(logs: string, label: string) {
  const zhLines = logs.split('\n').filter(l => l.includes('zh-Hans'));
  assert.strictEqual(zhLines.length, 0, `[${label}] No zh-Hans in logs`);
}

/** Inject a fake "no-caption" video into the channel manifest to force a failure. */
function injectFailureVideo(dataDir: string): string {
  const videosPath = path.join(dataDir, 'channels', CHANNEL_ID, 'videos.json');
  const videos = JSON.parse(fs.readFileSync(videosPath, 'utf-8'));
  const fakeId = 'FAKE_NO_CAPTION_999';
  videos.push({
    id: `yt-${fakeId}`,
    videoId: fakeId,
    title: 'Fake No Caption Video',
    url: `https://www.youtube.com/watch?v=${fakeId}`
  });
  fs.writeFileSync(videosPath, JSON.stringify(videos, null, 2), 'utf-8');
  return fakeId;
}

function removeFailureVideo(dataDir: string) {
  const videosPath = path.join(dataDir, 'channels', CHANNEL_ID, 'videos.json');
  const videos = JSON.parse(fs.readFileSync(videosPath, 'utf-8'));
  const filtered = videos.filter((v: any) => v.videoId !== 'FAKE_NO_CAPTION_999');
  fs.writeFileSync(videosPath, JSON.stringify(filtered, null, 2), 'utf-8');
}

function runVerification() {
  console.log('Running Stage 3 greedy caption sync verification (hardened)...');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yanghoo-stage3-'));
  const sourcesDir = path.join(tmpDir, 'sources');

  try {
    // --- Part A: Happy-path resume + skip preservation ---

    console.log(`\n=== Part A: Happy-path resume ===`);
    console.log(`Step A1: channel add --limit ${MANIFEST_LIMIT}`);
    const add = runCli(`npx tsx apps/cli/src/main.ts channel add '${TARGET_URL}' --limit ${MANIFEST_LIMIT} --json`, tmpDir);
    assert.strictEqual(add.json.videosCount, MANIFEST_LIMIT);

    console.log(`Step A2: batch 1 --batch-size ${BATCH_SIZE} --resume`);
    const b1 = runCli(`npx tsx apps/cli/src/main.ts channel captions ${CHANNEL_ID} --language ${LANGUAGE} --batch-size ${BATCH_SIZE} --resume --json`, tmpDir);
    assert.strictEqual(b1.json.succeeded, BATCH_SIZE);
    assertNoZhHansInLogs(b1.logs, 'batch1');
    const cp1 = readJson(tmpDir, `channels/${CHANNEL_ID}/sync-checkpoint.json`);
    assert.strictEqual(cp1.nextIndex, BATCH_SIZE);
    console.log(`  -> Checkpoint nextIndex: ${cp1.nextIndex}`);

    console.log(`Step A3: batch 2 --resume`);
    const b2 = runCli(`npx tsx apps/cli/src/main.ts channel captions ${CHANNEL_ID} --language ${LANGUAGE} --batch-size ${BATCH_SIZE} --resume --json`, tmpDir);
    assert.strictEqual(b2.json.succeeded, BATCH_SIZE);
    assertNoZhHansInLogs(b2.logs, 'batch2');

    console.log(`Step A4: batch 3 --resume (final)`);
    const b3 = runCli(`npx tsx apps/cli/src/main.ts channel captions ${CHANNEL_ID} --language ${LANGUAGE} --batch-size ${BATCH_SIZE} --resume --json`, tmpDir);
    assert.strictEqual(b3.json.succeeded, 1);
    const cp3 = readJson(tmpDir, `channels/${CHANNEL_ID}/sync-checkpoint.json`);
    assert.strictEqual(cp3.status, 'completed');
    console.log(`  -> Checkpoint status: completed`);

    console.log(`Step A5: skip preserves success`);
    const b4 = runCli(`npx tsx apps/cli/src/main.ts channel captions ${CHANNEL_ID} --language ${LANGUAGE} --batch-size ${BATCH_SIZE} --json`, tmpDir);
    const report4 = readJson(tmpDir, `channels/${CHANNEL_ID}/caption-sync-report.json`);
    const allSuccessOrSkipped = report4.items.every((i: any) => i.status === 'success' || i.status === 'skipped');
    assert.ok(allSuccessOrSkipped, 'All items should be success or skipped');
    // The first 2 items were re-encountered; they should stay 'success' not 'skipped'
    const successPreserved = report4.items.filter((i: any) => i.status === 'success').length;
    assert.ok(successPreserved >= BATCH_SIZE, `At least ${BATCH_SIZE} items should preserve success status`);
    console.log(`  -> ${successPreserved} items preserved 'success' status`);

    assertNoForbiddenAssets(sourcesDir, 'partA');

    // --- Part B: Failure fixture + retry ---

    console.log(`\n=== Part B: Failure fixture ===`);
    // Reset checkpoint and report for failure test
    const ckptPath = path.join(tmpDir, 'channels', CHANNEL_ID, 'sync-checkpoint.json');
    const rptPath = path.join(tmpDir, 'channels', CHANNEL_ID, 'caption-sync-report.json');
    fs.writeFileSync(ckptPath, JSON.stringify({
      channelId: CHANNEL_ID, language: LANGUAGE, mode: 'greedy_english_captions',
      status: 'in_progress', nextIndex: MANIFEST_LIMIT, processed: MANIFEST_LIMIT,
      succeeded: MANIFEST_LIMIT, failed: 0, skipped: 0,
      startedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }, null, 2));

    // Inject a fake video that will fail at capture
    const fakeId = injectFailureVideo(tmpDir);
    // Set checkpoint to start at the injected video (index 5)
    fs.writeFileSync(ckptPath, JSON.stringify({
      channelId: CHANNEL_ID, language: LANGUAGE, mode: 'greedy_english_captions',
      status: 'in_progress', nextIndex: MANIFEST_LIMIT, processed: MANIFEST_LIMIT,
      succeeded: MANIFEST_LIMIT, failed: 0, skipped: 0,
      startedAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    }, null, 2));
    console.log(`Step B1: sync with injected failure video (${fakeId})`);
    const bf = runCli(`npx tsx apps/cli/src/main.ts channel captions ${CHANNEL_ID} --language ${LANGUAGE} --batch-size 3 --resume --json`, tmpDir);
    console.log(`  -> Processed: ${bf.json.processed}, Succeeded: ${bf.json.succeeded}, Failed: ${bf.json.failed}, Skipped: ${bf.json.skipped}`);
    assert.ok(bf.json.failed >= 1, 'Should have at least 1 failure');

    const reportF = readJson(tmpDir, `channels/${CHANNEL_ID}/caption-sync-report.json`);
    const failedItem = reportF.items.find((i: any) => i.videoId === fakeId);
    assert.ok(failedItem, `Report must contain the failed video ${fakeId}`);
    assert.strictEqual(failedItem.status, 'failed', 'Fake video should be failed');
    assert.strictEqual(failedItem.failureKind, 'unknown', 'Failure kind should be recorded');
    assert.ok(failedItem.errorMessage, 'Error message should be present');
    assert.strictEqual(failedItem.attempts, 1, 'Attempts should be 1');
    console.log(`  -> Failed item: status=${failedItem.status}, failureKind=${failedItem.failureKind}, attempts=${failedItem.attempts}`);

    // Verify checkpoint includes the failure
    const cpF = readJson(tmpDir, `channels/${CHANNEL_ID}/sync-checkpoint.json`);
    assert.ok(cpF.failed >= 1, 'Checkpoint should count the failure');
    console.log(`  -> Checkpoint: failed=${cpF.failed}`);

    // --- Part C: Retry-failed ---

    console.log(`\n=== Part C: Retry-failed ===`);
    console.log(`Step C1: --retry-failed`);
    const br = runCli(`npx tsx apps/cli/src/main.ts channel captions ${CHANNEL_ID} --language ${LANGUAGE} --retry-failed --batch-size 10 --json`, tmpDir);
    console.log(`  -> Processed: ${br.json.processed}, Failed: ${br.json.failed}`);
    assert.ok(br.json.processed >= 1, 'Retry should process at least the failed item');
    assert.strictEqual(br.json.failed, 1, 'Retry should fail again (fake video)');

    const reportR = readJson(tmpDir, `channels/${CHANNEL_ID}/caption-sync-report.json`);
    const retriedItem = reportR.items.find((i: any) => i.videoId === fakeId);
    assert.strictEqual(retriedItem.attempts, 2, 'Retried item should have attempts=2');
    console.log(`  -> Retried item attempts: ${retriedItem.attempts}`);

    // Verify successful items were NOT reprocessed
    const successItems = reportR.items.filter((i: any) => i.status === 'success');
    const successAttempts = successItems.every((i: any) => i.attempts === 1);
    assert.ok(successAttempts, 'Successful items should not have incremented attempts');
    console.log(`  -> Success items not reprocessed (attempts still 1)`);

    // Clean up: remove fake video
    removeFailureVideo(tmpDir);

    // --- Part D: Language validation ---

    console.log(`\n=== Part D: Language validation ===`);
    console.log(`Step D1: reject unsupported language`);
    try {
      runCli(`npx tsx apps/cli/src/main.ts channel captions ${CHANNEL_ID} --language xyz --batch-size 1 --json`, tmpDir);
      assert.fail('Should have thrown for unsupported language');
    } catch (e: any) {
      const output = e.stdout?.toString() || e.stderr?.toString() || e.message || '';
      assert.ok(output.includes('Unsupported language'), `Error should mention unsupported language: ${output}`);
      console.log(`  -> Correctly rejected unsupported language`);
    }

    assertNoForbiddenAssets(sourcesDir, 'final');

    console.log('\nStage 3 hardened verification passed.');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

runVerification();
