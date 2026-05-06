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

function main() {
  console.log('Verifying Stage 18 Study Pack generation...');

  // 1. Get an indexed channel
  const channelsOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'learning-channels', 'list', '--json']);
  const channelsParsed = JSON.parse(channelsOutput);
  const indexedChannels = channelsParsed.channels.filter((c: any) => c.indexedSentenceCount > 0);
  if (indexedChannels.length === 0) {
    console.error('No indexed channels found to run real search tests. Please index a channel first.');
    process.exit(1);
  }
  const channelId = indexedChannels[0].channelId;

  // 2. Generate Scene Brief using Stage 17 helper
  const sceneFile = '/Users/a123/com/yanghoo205/Anything-to-English/canonical/block-system/scenes/Scene.MorningRoutine.md';
  const extractScriptPath = '/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/extract-scene-brief.mjs';
  
  const extractOutput = runCommand('node', [extractScriptPath, '--scene-file', sceneFile, '--id', 'morning-routine-audit', '--level', 'L2']);
  const briefParsed = JSON.parse(extractOutput);
  
  const tmpBriefPath = '/tmp/stage18-scene-brief.json';
  fs.writeFileSync(tmpBriefPath, JSON.stringify(briefParsed));

  // 3. Run Yanghoo CLI batch search
  const batchOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', 'batch', tmpBriefPath, '--channels', channelId, '--limit-per-query', '2', '--json']);
  const tmpEvidencePath = '/tmp/stage18-evidence-pack.json';
  fs.writeFileSync(tmpEvidencePath, batchOutput);
  
  // 4. Run build-study-pack.mjs
  const buildScriptPath = '/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/scripts/build-study-pack.mjs';
  const outputPath = '/Users/a123/com/yanghoo205/Anything-to-English/output/local/yanghoo/study-packs/morning-routine-audit.md';
  
  const buildOutput = runCommand('node', [buildScriptPath, '--scene-brief', tmpBriefPath, '--evidence-pack', tmpEvidencePath, '--output', outputPath]);
  const buildParsed = JSON.parse(buildOutput);
  
  assert.strictEqual(buildParsed.studyPackPath, outputPath);
  assert.strictEqual(buildParsed.scene, 'Scene.MorningRoutine');

  // 5. Assert markdown exists
  assert.ok(fs.existsSync(outputPath), 'Study pack markdown file should exist');

  // 6. Assert markdown content
  const markdownContent = fs.readFileSync(outputPath, 'utf-8');
  assert.ok(markdownContent.includes('# Study Pack: Scene.MorningRoutine'), 'Missing title');
  assert.ok(markdownContent.includes('## Real Subtitle Evidence'), 'Missing Real Subtitle Evidence section');
  assert.ok(markdownContent.includes('## Shadowing Queue'), 'Missing Shadowing Queue section');
  assert.ok(markdownContent.includes('## Practice Prompts'), 'Missing Practice Prompts section');
  assert.ok(markdownContent.includes('## Boundary Note'), 'Missing Boundary Note section');
  
  // Assert at least one query is present
  assert.ok(markdownContent.includes(briefParsed.queries[0]), 'Missing query from scene brief');

  // 7. Assert timestamp URL if examples exist
  const batchParsed = JSON.parse(batchOutput);
  if (batchParsed.examples && batchParsed.examples.length > 0) {
    assert.ok(markdownContent.includes(batchParsed.examples[0].youtubeTimestampUrl), 'Missing youtube timestamp URL in evidence');
  }

  console.log('✅ Stage 18 verification passed!');
}

main();