import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as assert from 'assert';
import {
  updateChannelTaxonomyUseCase,
  deleteChannelTaxonomyUseCase,
  listChannelTaxonomyUseCase
} from '../../packages/application/src';

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

async function main() {
  console.log('--- Stage 16 Regression Hardening: Deterministic Taxonomy Verification ---');

  // 1. Find a real indexed channel
  const channelsOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'learning-channels', 'list', '--json']);
  const channelsParsed = JSON.parse(channelsOutput);
  const indexedChannels = channelsParsed.channels.filter((c: any) => c.indexedSentenceCount > 0);
  
  if (indexedChannels.length === 0) {
    console.error('No indexed channels found. Please index a channel before running this test.');
    process.exit(1);
  }

  const channel = indexedChannels[0];
  const channelId = channel.channelId;
  console.log(`Using fixture channel: ${channelId} (${channel.title})`);

  // 2. Save original taxonomy state
  const originalTaxonomyItems = await listChannelTaxonomyUseCase();
  const originalItem = originalTaxonomyItems.find(i => i.channelId === channelId);
  console.log('Original taxonomy:', originalItem ? JSON.stringify(originalItem) : 'none');

  const auditCategory = 'stage16-audit-category';
  const auditTag = 'stage16-audit-tag';
  const query = 'the';

  try {
    // 3. Set temporary deterministic taxonomy
    console.log(`Setting temporary taxonomy for ${channelId}...`);
    await updateChannelTaxonomyUseCase(channelId, {
      category: auditCategory,
      tags: [auditTag],
      note: 'temporary Stage 16 regression fixture'
    });

    // 4. Assert positive category search
    console.log(`4. Verifying positive category search for "${auditCategory}"...`);
    const catOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', query, '--category', auditCategory, '--limit', '2', '--json']);
    const catParsed = JSON.parse(catOutput);
    assert.ok(catParsed.results.length > 0, 'Category search should return results');
    
    const res0 = catParsed.results[0];
    assert.ok(res0.channelId, 'Missing channelId');
    assert.ok(res0.videoId, 'Missing videoId');
    assert.ok(res0.sourceId, 'Missing sourceId');
    assert.ok(res0.title, 'Missing title');
    assert.ok(res0.text, 'Missing text');
    assert.ok(typeof res0.start === 'number', 'Missing numeric start');
    assert.ok(res0.youtubeTimestampUrl, 'Missing youtubeTimestampUrl');
    assert.ok(res0.captionKind, 'Missing captionKind');
    assert.strictEqual(res0.channelId, channelId, 'Should match fixture channelId');
    console.log('✅ category search verified');

    // 5. Assert positive tag search
    console.log(`5. Verifying positive tag search for "${auditTag}"...`);
    const tagOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', query, '--tag', auditTag, '--limit', '2', '--json']);
    const tagParsed = JSON.parse(tagOutput);
    assert.ok(tagParsed.results.length > 0, 'Tag search should return results');
    assert.strictEqual(tagParsed.results[0].channelId, channelId, 'Should match fixture channelId');
    console.log('✅ tag search verified');

    // 6. Assert positive category+tag search
    console.log(`6. Verifying positive category+tag search...`);
    const combinedOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', query, '--category', auditCategory, '--tag', auditTag, '--limit', '2', '--json']);
    const combinedParsed = JSON.parse(combinedOutput);
    assert.ok(combinedParsed.results.length > 0, 'Combined search should return results');
    console.log('✅ category+tag search verified');

    // 7. Assert positive batch search
    console.log('7. Verifying batch search evidence examples...');
    const sceneBrief = {
      kind: "scene-brief",
      id: "stage16-regression-audit",
      scene: "Scene.Stage16RegressionAudit",
      level: "L2",
      queries: [query, "because"]
    };
    const briefPath = '/tmp/stage16-regression-audit-brief.json';
    fs.writeFileSync(briefPath, JSON.stringify(sceneBrief));

    const batchOutput = runCommand('npm', ['run', '-s', 'cli', '--', 'english-search', 'batch', briefPath, '--category', auditCategory, '--limit-per-query', '2', '--json']);
    const batchParsed = JSON.parse(batchOutput);
    
    assert.strictEqual(batchParsed.kind, 'yanghoo-evidence-pack');
    assert.strictEqual(batchParsed.briefId, 'stage16-regression-audit');
    assert.ok(batchParsed.examples.length > 0, 'Batch search should return examples');
    
    const ex0 = batchParsed.examples[0];
    assert.ok(ex0.query, 'Example missing query');
    assert.ok(ex0.text, 'Example missing text');
    assert.ok(ex0.channelId, 'Example missing channelId');
    assert.ok(ex0.videoId, 'Example missing videoId');
    assert.ok(ex0.sourceId, 'Example missing sourceId');
    assert.ok(ex0.title, 'Example missing title');
    assert.ok(typeof ex0.start === 'number', 'Example missing numeric start');
    assert.ok(ex0.youtubeTimestampUrl, 'Example missing youtubeTimestampUrl');
    assert.ok(ex0.captionKind, 'Example missing captionKind');

    // Duplicate check
    const seen = new Set();
    for (const ex of batchParsed.examples) {
      const key = `${ex.channelId}|${ex.videoId}|${ex.start}|${ex.text}`;
      assert.ok(!seen.has(key), `Duplicate example found: ${key}`);
      seen.add(key);
    }
    console.log('✅ batch search verified');

    console.log('\n--- Stage 16 Regression Hardening PASSED ---');

  } finally {
    // 8. Restore original taxonomy state
    console.log(`Cleaning up taxonomy for ${channelId}...`);
    if (originalItem) {
      try {
        await updateChannelTaxonomyUseCase(channelId, {
          category: originalItem.category,
          tags: originalItem.tags,
          note: originalItem.note
        });
        console.log('Restored original taxonomy.');
      } catch (e) {
        console.error('Failed to restore original taxonomy:', e);
      }
    } else {
      try {
        await deleteChannelTaxonomyUseCase(channelId);
        console.log('Deleted temporary taxonomy (no original existed).');
      } catch (e) {
        console.error('Failed to delete temporary taxonomy:', e);
      }
    }
  }
}

main().catch(err => {
  console.error('Fatal Error during verification:', err);
  process.exit(1);
});
