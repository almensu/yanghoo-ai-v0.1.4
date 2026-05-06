import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import assert from 'assert';

async function run() {
  console.log('--- Verifying Stage 22: Yanghoo English Balance Query Quality ---');

  const extractorScript = '/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs';
  const wrapperScript = '/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/balance-study-pack.mjs';
  const sceneFile = '/Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.HospitalTripWithWife.md';
  const testId = 'hospital-trip-stage22-audit';
  const testChannelId = 'youtube-UC596VHuJ5Q11N81D6uNrrxA';

  // 1. Run extractor and verify queries
  console.log('1. Verifying query extraction quality...');
  const extractCmd = `node ${extractorScript} --scene-file ${sceneFile} --id ${testId} --level L2`;
  const extractStdout = execSync(extractCmd, { encoding: 'utf-8' });
  const brief = JSON.parse(extractStdout);

  assert.strictEqual(brief.kind, 'scene-brief');
  assert.strictEqual(brief.scene, 'Scene.HospitalTripWithWife');
  assert.ok(brief.queries.length > 0 && brief.queries.length <= 15);

  const queries = brief.queries;
  console.log('Extracted queries:', queries);

  assert.ok(queries.includes('sore throat'), 'Should include "sore throat"');
  assert.ok(queries.includes('took her to the hospital'), 'Should include "took her to the hospital"');
  assert.ok(
    queries.includes('call a cab') || queries.includes('called a cab') || queries.includes('called a ride'),
    'Should include a natural taxi-calling phrase'
  );
  assert.ok(queries.includes('pleasantly surprised'), 'Should include "pleasantly surprised"');

  assert.ok(!queries.includes('call adidi'), 'Should NOT include "call adidi"');
  assert.ok(!queries.some(q => q.toLowerCase().includes('state.')), 'Should NOT include any query with "state."');
  assert.ok(!queries.some(q => q.toLowerCase().includes('action.')), 'Should NOT include any query with "action."');

  console.log('✅ Query extraction quality validated');

  // 2. Run wrapper and verify study pack generation
  console.log('2. Verifying wrapper and study pack generation...');
  const wrapperCmd = `node ${wrapperScript} --scene-file ${sceneFile} --id ${testId} --channels ${testChannelId} --level L2 --limit-per-query 2`;
  const wrapperStdout = execSync(wrapperCmd, { encoding: 'utf-8' });
  const result = JSON.parse(wrapperStdout);

  assert.strictEqual(result.scene, 'Scene.HospitalTripWithWife');
  assert.ok(result.queryCount > 0);
  assert.ok(result.exampleCount > 0, 'Should find at least some examples for this scene');
  assert.ok(Array.isArray(result.warnings));
  assert.ok(fs.existsSync(result.studyPackPath), 'Study pack file should exist');

  console.log('✅ Wrapper execution validated');

  // 3. Verify study pack content
  console.log('3. Verifying study pack markdown content...');
  const content = fs.readFileSync(result.studyPackPath, 'utf-8');
  assert.ok(content.includes('# Study Pack: Scene.HospitalTripWithWife'));
  assert.ok(content.includes('## Real Subtitle Evidence'));
  assert.ok(content.includes('Boundary status: output-only, not canonical'));

  console.log('✅ Markdown content validated');

  console.log('\n--- Stage 22 Verification PASSED ---');
}

run().catch(err => {
  console.error('Verification FAILED:');
  console.error(err);
  process.exit(1);
});
