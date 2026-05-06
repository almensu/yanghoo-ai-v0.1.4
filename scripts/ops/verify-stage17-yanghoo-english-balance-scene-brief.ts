import { spawnSync } from 'child_process';
import * as fs from 'fs';
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

function main() {
  console.log('Verifying Stage 17 Scene Brief generation and CLI bridge...');

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
  const scriptPath = '/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs';
  
  const extractOutput = runCommand('node', [scriptPath, '--scene-file', sceneFile, '--id', 'morning-routine-audit', '--level', 'L2']);
  const briefParsed = JSON.parse(extractOutput);

  // Assertions
  assert.strictEqual(briefParsed.kind, 'scene-brief');
  assert.strictEqual(briefParsed.scene, 'Scene.MorningRoutine');
  assert.ok(Array.isArray(briefParsed.queries), 'queries should be an array');
  assert.ok(briefParsed.queries.length > 0, 'queries length > 0');
  
  // ensure no query is a single word broad noun (length check or space check)
  // at least some queries should have multiple words
  const multiWordQueries = briefParsed.queries.filter((q: string) => q.includes(' '));
  assert.ok(multiWordQueries.length >= 2, 'queries should include at least two useful phrases');

  // 3. Write brief to tmp file
  const tmpBriefPath = '/tmp/stage17-scene-brief.json';
  fs.writeFileSync(tmpBriefPath, JSON.stringify(briefParsed));

  // 4. Run CLI batch search
  const batchOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', 'batch', tmpBriefPath, '--channels', channelId, '--limit-per-query', '2', '--json']);
  const batchParsed = JSON.parse(batchOutput);

  // Assertions
  assert.strictEqual(batchParsed.kind, 'yanghoo-evidence-pack');
  assert.strictEqual(batchParsed.briefId, 'morning-routine-audit');
  assert.deepStrictEqual(batchParsed.queries, briefParsed.queries);
  assert.ok(Array.isArray(batchParsed.examples), 'examples should be an array');
  
  if (batchParsed.examples.length > 0) {
    const ex = batchParsed.examples[0];
    assert.ok(ex.query, 'example missing query');
    assert.ok(ex.text, 'example missing text');
    assert.ok(ex.channelId, 'example missing channelId');
    assert.ok(ex.videoId, 'example missing videoId');
    assert.ok(ex.sourceId, 'example missing sourceId');
    assert.ok(typeof ex.start === 'number', 'example missing start');
    assert.ok(ex.youtubeTimestampUrl, 'example missing youtubeTimestampUrl');
    assert.ok(ex.captionKind, 'example missing captionKind');
  }

  console.log('✅ Stage 17 verification passed!');
}

main();