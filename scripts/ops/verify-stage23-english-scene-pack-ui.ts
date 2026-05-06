import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

async function run() {
  console.log('--- Verifying Stage 23: English Scene Pack UI Integration ---');

  const wrapperScript = '/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs';
  const sceneFile = '/Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.MorningRoutine.md';
  const testId = 'morning-routine-stage23-audit';
  const testChannelId = 'youtube-UC596VHuJ5Q11N81D6uNrrxA';
  const testRequest = '对小孩早上起床的场景做筛选';

  // 1. Run wrapper with --import-yanghoo
  console.log('1. Running wrapper with --import-yanghoo...');
  const wrapperCmd = `node ${wrapperScript} --scene-file ${sceneFile} --id ${testId} --channels ${testChannelId} --level L2 --limit-per-query 2 --import-yanghoo --request "${testRequest}"`;
  
  const stdout = execSync(wrapperCmd, { encoding: 'utf-8' });
  const result = JSON.parse(stdout);

  assert.strictEqual(result.scene, 'Scene.MorningRoutine');
  assert.strictEqual(result.scenePackId, testId);
  assert.strictEqual(result.scenePackImported, true);
  assert.ok(result.exampleCount > 0);
  console.log('✅ Wrapper import successful');

  // 2. Assert storage file exists
  console.log('2. Verifying storage files...');
  const packPath = `data/learning/english-scene-packs/${testId}.json`;
  const indexPath = 'data/learning/english-scene-packs/index.json';
  
  assert.ok(fs.existsSync(packPath), `Scene pack file should exist at ${packPath}`);
  assert.ok(fs.existsSync(indexPath), 'Index file should exist');

  const packData = JSON.parse(fs.readFileSync(packPath, 'utf-8'));
  assert.strictEqual(packData.id, testId);
  assert.strictEqual(packData.request, testRequest);
  assert.ok(packData.examples.length > 0);
  assert.ok(packData.examples[0].youtubeEmbedUrl.startsWith('https://www.youtube.com/embed/'));
  assert.ok(typeof packData.examples[0].startSeconds === 'number');
  console.log('✅ Storage content validated');

  // 3. Verify CLI list/show
  console.log('3. Verifying CLI list/show...');
  const listStdout = execSync('npm run -s cli -- english-scene-packs list --json', { encoding: 'utf-8' });
  const listData = JSON.parse(listStdout);
  const found = listData.packs.find((p: any) => p.id === testId);
  assert.ok(found, 'Pack should be in the list');
  assert.strictEqual(found.request, testRequest);

  const showStdout = execSync(`npm run -s cli -- english-scene-packs show ${testId} --json`, { encoding: 'utf-8' });
  const showData = JSON.parse(showStdout);
  assert.strictEqual(showData.pack.id, testId);
  assert.ok(showData.pack.examples.length > 0);
  console.log('✅ CLI list/show verified');

  // 4. Verify Scene Pack deletion
  console.log('4. Verifying Scene Pack deletion...');
  execSync(`npm run -s cli -- english-scene-packs delete ${testId} --json`, { encoding: 'utf-8' });
  assert.ok(!fs.existsSync(packPath), 'Pack file should be deleted');
  
  const listStdoutAfter = execSync('npm run -s cli -- english-scene-packs list --json', { encoding: 'utf-8' });
  const listDataAfter = JSON.parse(listStdoutAfter);
  assert.ok(!listDataAfter.packs.find((p: any) => p.id === testId), 'Pack should not be in the list after deletion');
  console.log('✅ Deletion verified');

  console.log('\n--- Stage 23 Verification PASSED ---');
}

run().catch(err => {
  console.error('Verification FAILED:');
  console.error(err);
  process.exit(1);
});
