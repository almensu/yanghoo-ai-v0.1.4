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

function runCommandCatchError(command: string, args: string[]) {
  console.log(`> ${command} ${args.join(' ')} (expecting failure)`);
  const result = spawnSync(command, args, { encoding: 'utf-8' });
  return result;
}

function main() {
  console.log('Verifying Stage 16 CLI bridge commands...');

  // 1. Verify learning-channels list and required fields
  const channelsOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'learning-channels', 'list', '--json']);
  const channelsParsed = JSON.parse(channelsOutput);
  assert.ok(Array.isArray(channelsParsed.channels), 'Channels list must have a "channels" array');
  
  if (channelsParsed.channels.length > 0) {
    const ch = channelsParsed.channels[0];
    assert.ok('channelId' in ch, 'channelId missing');
    assert.ok('title' in ch, 'title missing');
    assert.ok('videoCount' in ch, 'videoCount missing');
    assert.ok('selectedCount' in ch, 'selectedCount missing');
    assert.ok('captionReadyCount' in ch, 'captionReadyCount missing');
    assert.ok('indexedSentenceCount' in ch, 'indexedSentenceCount missing');
    assert.ok(Array.isArray(ch.tags), 'tags missing or not array');
  }
  console.log('✅ learning-channels list works');

  const indexedChannels = channelsParsed.channels.filter((c: any) => c.indexedSentenceCount > 0);
  if (indexedChannels.length === 0) {
    console.error('No indexed channels found to run real search tests. Please index a channel first.');
    process.exit(1);
  }
  const channelId = indexedChannels[0].channelId;

  // 2. Verify direct --channel search
  const directSearchOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', 'the', '--channel', channelId, '--limit', '2', '--json']);
  const directSearchParsed = JSON.parse(directSearchOutput);
  assert.strictEqual(directSearchParsed.query, 'the');
  assert.ok(Array.isArray(directSearchParsed.results));
  if (directSearchParsed.results.length > 0) {
    const res = directSearchParsed.results[0];
    assert.ok(res.channelId, 'result missing channelId');
    assert.ok(res.videoId, 'result missing videoId');
    assert.ok(res.text, 'result missing text');
    assert.ok(typeof res.start === 'number', 'result missing start');
  }
  console.log('✅ english-search --channel works');

  // 3. Verify multi --channels search
  const multiChannelId = indexedChannels.length > 1 ? indexedChannels[1].channelId : channelId;
  const multiSearchOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', 'the', '--channels', `${channelId},${multiChannelId}`, '--limit', '2', '--json']);
  const multiSearchParsed = JSON.parse(multiSearchOutput);
  assert.ok(Array.isArray(multiSearchParsed.results));
  console.log('✅ english-search --channels works');

  // 4. Verify english-search single query with empty category warning
  const searchOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', 'test', '--category', 'non-existent-category-123', '--limit', '1', '--json']);
  const searchParsed = JSON.parse(searchOutput);
  assert.strictEqual(searchParsed.query, 'test');
  assert.ok(Array.isArray(searchParsed.results));
  assert.strictEqual(searchParsed.results.length, 0);
  assert.ok(Array.isArray(searchParsed.warnings));
  assert.ok(searchParsed.warnings.includes('No channels matched criteria for search'), 'Must contain warning when no channel matches');
  console.log('✅ empty category warning works');

  // 5. Verify batch empty category returns kind and warning
  const sceneBrief = {
    kind: "scene-brief",
    id: "test-brief",
    scene: "Scene.Test",
    level: "L2",
    queries: ["test query"]
  };
  fs.writeFileSync('/tmp/test-scene-brief.json', JSON.stringify(sceneBrief));

  const batchOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', 'batch', '/tmp/test-scene-brief.json', '--category', 'non-existent-category-123', '--limit-per-query', '1', '--json']);
  const batchParsed = JSON.parse(batchOutput);
  assert.strictEqual(batchParsed.kind, 'yanghoo-evidence-pack');
  assert.strictEqual(batchParsed.briefId, 'test-brief');
  assert.ok(Array.isArray(batchParsed.examples));
  assert.strictEqual(batchParsed.examples.length, 0);
  assert.ok(Array.isArray(batchParsed.warnings));
  assert.ok(batchParsed.warnings.includes('No channels matched criteria for search'), 'Must contain warning when no channel matches in batch mode');
  console.log('✅ english-search batch works');

  // 6. Verify non-English language flag is rejected
  const nonEngResult = runCommandCatchError('npm', ['run', '-s', 'cli', '--', 'english-search', 'test', '--channel', channelId, '--language', 'zh', '--json']);
  assert.notStrictEqual(nonEngResult.status, 0, 'Command should have failed for non-en language');
  
  const stdoutStr = nonEngResult.stdout.toString();
  const stderrStr = nonEngResult.stderr.toString();
  
  const includesOnlyEnglish = stdoutStr.includes('Only English') || stderrStr.includes('Only English');
  if (!includesOnlyEnglish) {
    console.error('STDOUT:', stdoutStr);
    console.error('STDERR:', stderrStr);
  }
  assert.ok(includesOnlyEnglish, 'Error should mention Only English');
  console.log('✅ non-English flag rejected');

  // 7. Verify external skill frontmatter
  const skillPath = '/Users/a123/claude-model/.claude-zhipu/skills/yanghoo-english-balance/SKILL.md';
  const skillContent = fs.readFileSync(skillPath, 'utf-8');
  assert.ok(skillContent.startsWith('---'), 'Skill file must start with YAML frontmatter');
  assert.ok(skillContent.includes('name: yanghoo-english-balance'), 'Skill must contain name in frontmatter');
  console.log('✅ skill file frontmatter verified');

  console.log('Stage 16 verification passed!');
}

main();