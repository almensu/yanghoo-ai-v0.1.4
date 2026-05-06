import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as assert from 'assert';

function runCommand(command: string, args: string[]) {
  console.log(`> ${command} ${args.join(' ')}`);
  const result = spawnSync(command, args, { encoding: 'utf-8' });
  if (result.error) {
    console.error(`Execution failed: ${result.error.message}`);
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`Command failed with exit code ${result.status}`);
    console.error(result.stderr);
    process.exit(1);
  }
  return result.stdout;
}

function runCommandCatchError(command: string, args: string[]) {
  console.log(`> ${command} ${args.join(' ')} (expecting failure)`);
  const result = spawnSync(command, args, { encoding: 'utf-8' });
  return result;
}

function main() {
  console.log('Verifying Stage 19 Study Pack Hardening...');

  // 1. Get an indexed channel
  const channelsOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'learning-channels', 'list', '--json']);
  const channelsParsed = JSON.parse(channelsOutput);
  const indexedChannels = channelsParsed.channels.filter((c: any) => c.indexedSentenceCount > 0);
  if (indexedChannels.length === 0) {
    console.error('No indexed channels found to run real search tests. Please index a channel first.');
    process.exit(1);
  }
  const channelId = indexedChannels[0].channelId;

  // 2. Generate Scene Brief
  const sceneFile = '/Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.MorningRoutine.md';
  const extractScriptPath = '/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs';
  
  const extractOutput = runCommand('node', [extractScriptPath, '--scene-file', sceneFile, '--id', 'morning-routine-audit', '--level', 'L2']);
  const tmpBriefPath = '/tmp/stage19-scene-brief.json';
  fs.writeFileSync(tmpBriefPath, extractOutput);

  // 3. Run Yanghoo CLI batch search
  const batchOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', 'batch', tmpBriefPath, '--channels', channelId, '--limit-per-query', '2', '--json']);
  const tmpEvidencePath = '/tmp/stage19-evidence-pack.json';
  fs.writeFileSync(tmpEvidencePath, batchOutput);
  
  // 4. Run build-study-pack.mjs to allowed output directory
  const buildScriptPath = '/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/build-study-pack.mjs';
  const validOutputPath = '/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/morning-routine-audit-stage19.md';
  
  runCommand('node', [buildScriptPath, '--scene-brief', tmpBriefPath, '--evidence-pack', tmpEvidencePath, '--output', validOutputPath]);

  // 5. Assert markdown metadata and queue
  const markdownContent = fs.readFileSync(validOutputPath, 'utf-8');
  assert.ok(markdownContent.includes('- Query count:'), 'Missing Query count');
  assert.ok(markdownContent.includes('- Evidence count:'), 'Missing Evidence count');
  assert.ok(markdownContent.includes('- Source scene file:'), 'Missing Source scene file');
  assert.ok(markdownContent.includes('- Boundary status: output-only, not canonical'), 'Missing Boundary status');
  assert.ok(markdownContent.includes('## Shadowing Queue'), 'Missing Shadowing Queue section');

  const batchParsed = JSON.parse(batchOutput);
  if (batchParsed.examples && batchParsed.examples.length > 0) {
    const firstExample = batchParsed.examples[0];
    const expectedLink = firstExample.youtubeTimestampUrl;
    assert.ok(markdownContent.includes(expectedLink), 'Shadowing queue must contain timestamp URL');
    // Ensure the shadowing queue item starts with - [ ] "
    assert.ok(markdownContent.includes('- [ ] "'), 'Shadowing queue must have task items with real text');
  }

  // 6. Attempt to write outside without override
  const invalidOutputPath = '/tmp/stage19-outside.md';
  const failedRun = runCommandCatchError('node', [buildScriptPath, '--scene-brief', tmpBriefPath, '--evidence-pack', tmpEvidencePath, '--output', invalidOutputPath]);
  assert.notStrictEqual(failedRun.status, 0, 'Command should have failed for outside output');
  assert.ok(failedRun.stderr.toString().includes('Study pack output must stay under'), 'Error should mention output restrictions');
  console.log('✅ Default output path guard works');

  // 7. Attempt to write outside with --allow-outside-output override
  const successRun = runCommand('node', [buildScriptPath, '--scene-brief', tmpBriefPath, '--evidence-pack', tmpEvidencePath, '--output', invalidOutputPath, '--allow-outside-output']);
  assert.ok(fs.existsSync(invalidOutputPath), 'File should be created with explicit override');
  fs.unlinkSync(invalidOutputPath);
  console.log('✅ Explicit override --allow-outside-output works');

  console.log('✅ Stage 19 verification passed!');
}

main();