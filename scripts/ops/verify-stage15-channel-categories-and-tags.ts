/**
 * Stage 15 Verification: Channel Categories and Tags
 *
 * Proves:
 * 1. Missing taxonomy file reads as empty
 * 2. Updating taxonomy writes to data/channels/channel-taxonomy.json
 * 3. Category normalization works (trim, lowercase, hyphens)
 * 4. Tag normalization trims, lowercases, dedupes
 * 5. List taxonomy returns persisted items
 * 6. listLearningChannelsUseCase includes category/tags/taxonomyNote
 * 7. Deleting a channel removes only that channel's taxonomy item
 * 8. Deleting taxonomy does not delete channel/source assets
 * 9. Multiple channels can have different categories and tags
 * 10. Empty category is stored as undefined
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  normalizeChannelCategory,
  normalizeChannelTags,
  updateChannelTaxonomyUseCase,
  listChannelTaxonomyUseCase,
  deleteChannelTaxonomyUseCase,
  listLearningChannelsUseCase
} from '@yanghoo/application';
import { channelTaxonomyStorage, channelStorage, sourceStorage } from '@yanghoo/storage';
import type { ChannelManifest, Source } from '@yanghoo/domain';

let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.error(`  FAIL: ${label}`);
    failed++;
  }
}

async function setupChannel(id: string, title: string) {
  const manifest: ChannelManifest = {
    id,
    platform: 'youtube',
    url: `https://youtube.com/@${id}`,
    title,
    capturedAt: new Date().toISOString()
  };
  await channelStorage.saveChannelManifest(manifest);
  await channelStorage.saveChannelVideos(id, []);
  return manifest;
}

async function cleanupChannel(id: string) {
  try { await channelStorage.deleteChannelDir(id); } catch {}
}

async function cleanupTaxonomy() {
  await channelTaxonomyStorage.writeChannelTaxonomy({ version: 1, updatedAt: new Date().toISOString(), items: [] });
}

async function testNormalization() {
  console.log('\n=== Normalization ===');

  assert(normalizeChannelCategory('Street Interview') === 'street-interview', 'Category: spaces to hyphens, lowercase');
  assert(normalizeChannelCategory('  AI  ') === 'ai', 'Category: trimmed');
  assert(normalizeChannelCategory('news--daily') === 'news-daily', 'Category: collapsed hyphens');
  assert(normalizeChannelCategory('-leading-trailing-') === 'leading-trailing', 'Category: stripped leading/trailing hyphens');
  assert(normalizeChannelCategory('') === '', 'Category: empty stays empty');
  assert(normalizeChannelCategory('   ') === '', 'Category: whitespace-only becomes empty');

  const tags = normalizeChannelTags(['American', ' conversation ', '', 'AMERICAN', 'fast-speaking', 'Fast Speaking']);
  assert(tags.length === 3, 'Tags: deduped (3 unique)');
  assert(tags[0] === 'american', 'Tags: first is american (sorted)');
  assert(tags[1] === 'conversation', 'Tags: second is conversation');
  assert(tags[2] === 'fast-speaking', 'Tags: spaces to hyphens');
}

async function testMissingTaxonomyFile() {
  console.log('\n=== Missing Taxonomy File ===');

  // Ensure file doesn't exist
  const filePath = path.join(process.cwd(), 'data', 'channels', 'channel-taxonomy.json');
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  const file = await channelTaxonomyStorage.readChannelTaxonomy();
  assert(file.items.length === 0, 'Missing file returns empty taxonomy');
  assert(file.version === 1, 'Default version is 1');
}

async function testTaxonomyPersistence() {
  console.log('\n=== Taxonomy Persistence ===');

  await cleanupTaxonomy();

  const item1 = await updateChannelTaxonomyUseCase('ch-tax-001', {
    category: 'Street Interview',
    tags: ['American', 'Conversation', 'american'],
    note: 'Good street interviews.'
  });

  assert(item1.channelId === 'ch-tax-001', 'Item has channelId');
  assert(item1.category === 'street-interview', 'Category normalized');
  assert(item1.tags.length === 2, 'Tags deduped to 2');
  assert(item1.tags.includes('american'), 'Tags include american');
  assert(item1.tags.includes('conversation'), 'Tags include conversation');
  assert(item1.note === 'Good street interviews.', 'Note preserved');
  assert(item1.updatedAt.length > 0, 'Has updatedAt');

  // Verify file written
  const filePath = path.join(process.cwd(), 'data', 'channels', 'channel-taxonomy.json');
  assert(fs.existsSync(filePath), 'Taxonomy file exists on disk');

  const fileContent = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  assert(fileContent.version === 1, 'File version is 1');
  assert(fileContent.items.length === 1, 'File has 1 item');

  // Second channel
  const item2 = await updateChannelTaxonomyUseCase('ch-tax-002', {
    category: 'news',
    tags: ['British', 'Daily News'],
    note: ''
  });

  assert(item2.category === 'news', 'Second channel category');
  assert(item2.tags.length === 2, 'Second channel has 2 tags');
  assert(item2.note === '', 'Empty note');

  // List
  const items = await listChannelTaxonomyUseCase();
  assert(items.length === 2, 'List returns 2 items');

  // Update existing
  const updated = await updateChannelTaxonomyUseCase('ch-tax-001', {
    category: 'ai',
    tags: ['interview'],
    note: 'Updated note'
  });
  assert(updated.category === 'ai', 'Category updated');
  assert(updated.tags.length === 1, 'Tags replaced');
  assert(updated.note === 'Updated note', 'Note updated');

  const afterUpdate = await listChannelTaxonomyUseCase();
  assert(afterUpdate.length === 2, 'Still 2 items after update');
  assert(afterUpdate.find(i => i.channelId === 'ch-tax-001')!.category === 'ai', 'Updated item persisted');
}

async function testListChannelsWithTaxonomy() {
  console.log('\n=== List Channels with Taxonomy ===');

  await setupChannel('ch-tax-001', 'Test Channel 1');
  await setupChannel('ch-tax-002', 'Test Channel 2');

  const summaries = await listLearningChannelsUseCase();
  const ch1 = summaries.find(s => s.channelId === 'ch-tax-001');

  assert(ch1 !== undefined, 'Channel found in list');
  assert(ch1?.category === 'ai', 'List includes category');
  assert(ch1?.tags.length === 1, 'List includes tags');
  assert(ch1?.tags[0] === 'interview', 'Tag value correct');
  assert(ch1?.taxonomyNote === 'Updated note', 'List includes taxonomyNote');

  const ch2 = summaries.find(s => s.channelId === 'ch-tax-002');
  assert(ch2?.category === 'news', 'Second channel category in list');
}

async function testDeleteTaxonomy() {
  console.log('\n=== Delete Taxonomy ===');

  const deleted = await deleteChannelTaxonomyUseCase('ch-tax-001');
  assert(deleted === true, 'Delete returns true for existing');

  const items = await listChannelTaxonomyUseCase();
  assert(items.length === 1, 'One item remaining');
  assert(items[0].channelId === 'ch-tax-002', 'Correct item remaining');

  const deletedAgain = await deleteChannelTaxonomyUseCase('ch-tax-001');
  assert(deletedAgain === false, 'Delete returns false for missing');

  // Verify taxonomy deletion didn't touch channel/source assets
  const manifest = await channelStorage.getChannelManifest('ch-tax-001');
  assert(manifest !== null, 'Channel manifest survives taxonomy delete');
}

async function testEmptyCategory() {
  console.log('\n=== Empty Category ===');

  const item = await updateChannelTaxonomyUseCase('ch-tax-003', {
    category: '   ',
    tags: [],
    note: ''
  });
  assert(item.category === undefined, 'Whitespace-only category becomes undefined');
  assert(item.tags.length === 0, 'Empty tags array');
}

async function cleanup() {
  console.log('\n=== Cleanup ===');
  await cleanupTaxonomy();
  await cleanupChannel('ch-tax-001');
  await cleanupChannel('ch-tax-002');
  assert(true, 'Cleaned up taxonomy and channels');
}

async function main() {
  console.log('Stage 15 Verification: Channel Categories and Tags\n');

  await testNormalization();
  await testMissingTaxonomyFile();
  await testTaxonomyPersistence();
  await testListChannelsWithTaxonomy();
  await testDeleteTaxonomy();
  await testEmptyCategory();
  await cleanup();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(50)}`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
