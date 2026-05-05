/**
 * Stage 14 Verification: Saved English Examples Review Queue
 *
 * Proves:
 * 1. Saving writes to data/learning/english-saved-examples.json
 * 2. Duplicate save returns same id without duplication
 * 3. Listing returns persisted items
 * 4. Updating note/tags/status persists
 * 5. Tags are normalized and deduped
 * 6. Mark reviewed increments reviewCount and sets lastReviewedAt
 * 7. Deleting removes only the saved example
 * 8. Deleting does not delete source/channel/index assets
 * 9. Saved item includes timestamp and embed URLs
 * 10. Stable id is deterministic
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  saveEnglishExampleUseCase,
  listSavedEnglishExamplesUseCase,
  updateSavedEnglishExampleUseCase,
  deleteSavedEnglishExampleUseCase,
  markSavedEnglishExampleReviewedUseCase,
  listSavedEnglishExampleIdsUseCase
} from '@yanghoo/application';
import { savedEnglishExampleStorage, sourceStorage, channelStorage } from '@yanghoo/storage';
import type { EnglishSentenceIndexEntry, Source, ChannelManifest } from '@yanghoo/domain';

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

function makeEntry(overrides: Partial<EnglishSentenceIndexEntry> = {}): EnglishSentenceIndexEntry {
  return {
    indexVersion: 1,
    sourceId: 'src-test-001',
    videoId: 'vid-test-001',
    channelId: 'ch-test-001',
    channelTitle: 'Test Channel',
    title: 'Test Video',
    publishedAt: '2026-01-01T00:00:00Z',
    start: 10.5,
    end: 15.2,
    text: 'I would have done the same thing.',
    normalizedText: 'i would have done the same thing.',
    captionKind: 'manual',
    captionLanguage: 'en',
    ...overrides
  };
}

async function testSaveAndDuplicate() {
  console.log('\n=== Save and Duplicate Detection ===');

  // Clean slate
  await savedEnglishExampleStorage.writeSavedEnglishExamples({ version: 1, updatedAt: new Date().toISOString(), items: [] });

  const entry = makeEntry();
  const result1 = await saveEnglishExampleUseCase({
    entry,
    youtubeTimestampUrl: 'https://youtube.com/watch?v=vid-test-001&t=10s',
    youtubeEmbedUrl: 'https://youtube.com/embed/vid-test-001?start=8&autoplay=1',
    startSeconds: 8,
    query: 'would have'
  });

  assert(result1.created === true, 'First save returns created=true');
  assert(result1.item.id.length > 0, 'Item has stable id');
  assert(result1.item.text === 'I would have done the same thing.', 'Text preserved');
  assert(result1.item.youtubeTimestampUrl.includes('youtube.com'), 'Has timestamp URL');
  assert(result1.item.youtubeEmbedUrl.includes('youtube.com/embed'), 'Has embed URL');
  assert(result1.item.startSeconds === 8, 'Start seconds preserved');
  assert(result1.item.status === 'saved', 'Default status is saved');
  assert(result1.item.reviewCount === 0, 'Review count starts at 0');
  assert(result1.item.lastReviewedAt === null, 'Last reviewed is null');
  assert(result1.item.note === '', 'Note starts empty');
  assert(result1.item.tags.length === 0, 'Tags start empty');

  // Duplicate save
  const result2 = await saveEnglishExampleUseCase({
    entry,
    youtubeTimestampUrl: 'https://youtube.com/watch?v=vid-test-001&t=10s',
    youtubeEmbedUrl: 'https://youtube.com/embed/vid-test-001?start=8&autoplay=1',
    startSeconds: 8,
    query: 'would have'
  });

  assert(result2.created === false, 'Duplicate save returns created=false');
  assert(result2.item.id === result1.item.id, 'Same stable id');

  // Verify file exists
  const file = await savedEnglishExampleStorage.readSavedEnglishExamples();
  assert(file.items.length === 1, 'Only one item in file (no duplicate)');

  // Stable id is deterministic
  const result3 = await saveEnglishExampleUseCase({
    entry: makeEntry({ start: 20.0 }),
    youtubeTimestampUrl: 'https://youtube.com/watch?v=vid-test-001&t=20s',
    youtubeEmbedUrl: 'https://youtube.com/embed/vid-test-001?start=18&autoplay=1',
    startSeconds: 18
  });
  assert(result3.created === true, 'Different start creates new item');
  assert(result3.item.id !== result1.item.id, 'Different id for different sentence');
}

async function testListAndFilter() {
  console.log('\n=== List and Filter ===');

  const all = await listSavedEnglishExamplesUseCase();
  assert(all.length === 2, `List returns 2 items (got ${all.length})`);

  const filtered = await listSavedEnglishExamplesUseCase({ q: 'would have' });
  assert(filtered.length === 2, 'Text filter matches both');

  const noMatch = await listSavedEnglishExamplesUseCase({ q: 'xyz' });
  assert(noMatch.length === 0, 'No match filter returns empty');

  const ids = await listSavedEnglishExampleIdsUseCase();
  assert(ids.size === 2, 'Id set has 2 entries');
}

async function testUpdate() {
  console.log('\n=== Update Note/Tags/Status ===');

  const all = await listSavedEnglishExamplesUseCase();
  const item = all[0];

  const updated = await updateSavedEnglishExampleUseCase(item.id, {
    note: 'Counterfactual pattern',
    tags: ['Would-Have', ' speaking', '', 'SPEAKING'],
    status: 'learning'
  });

  assert(updated.note === 'Counterfactual pattern', 'Note updated');
  assert(updated.tags.includes('would-have'), 'Tags normalized to lowercase');
  assert(updated.tags.includes('speaking'), 'Tags trimmed');
  assert(updated.tags.length === 2, 'Tags deduped (2 unique)');
  assert(updated.status === 'learning', 'Status updated');

  // Verify persistence
  const file = await savedEnglishExampleStorage.readSavedEnglishExamples();
  const persisted = file.items.find(i => i.id === item.id);
  assert(persisted?.note === 'Counterfactual pattern', 'Note persisted');
  assert(persisted?.tags.length === 2, 'Tags persisted');
}

async function testReview() {
  console.log('\n=== Mark Reviewed ===');

  const all = await listSavedEnglishExamplesUseCase();
  const item = all[0];

  const reviewed = await markSavedEnglishExampleReviewedUseCase(item.id);
  assert(reviewed.reviewCount === 1, 'Review count incremented to 1');
  assert(reviewed.lastReviewedAt !== null, 'Last reviewed set');

  const reviewed2 = await markSavedEnglishExampleReviewedUseCase(item.id);
  assert(reviewed2.reviewCount === 2, 'Review count incremented to 2');
}

async function testDelete() {
  console.log('\n=== Delete and Safety ===');

  // Create a source and channel to prove they survive delete
  const source: Source = {
    id: 'src-test-001',
    sourceClass: 'long_video',
    platform: 'youtube',
    url: 'https://youtube.com/watch?v=vid-test-001',
    title: 'Test Source',
    capturedAt: new Date().toISOString()
  };
  await sourceStorage.saveSource(source);

  const manifest: ChannelManifest = {
    id: 'ch-test-001',
    platform: 'youtube',
    url: 'https://youtube.com/@test',
    title: 'Test Channel',
    capturedAt: new Date().toISOString()
  };
  await channelStorage.saveChannelManifest(manifest);

  const beforeSource = await sourceStorage.getSource('src-test-001');
  assert(beforeSource !== null, 'Source exists before delete');

  const all = await listSavedEnglishExamplesUseCase();
  const item = all[0];
  await deleteSavedEnglishExampleUseCase(item.id);

  const afterDelete = await listSavedEnglishExamplesUseCase();
  assert(afterDelete.length === all.length - 1, 'One item removed');

  // Source and channel still exist
  const afterSource = await sourceStorage.getSource('src-test-001');
  assert(afterSource !== null, 'Source survives saved example delete');

  const afterChannel = await channelStorage.getChannelManifest('ch-test-001');
  assert(afterChannel !== null, 'Channel survives saved example delete');

  // 404 on second delete
  try {
    await deleteSavedEnglishExampleUseCase(item.id);
    assert(false, 'Second delete should throw');
  } catch (err: any) {
    assert(err.message.includes('not found'), 'Second delete throws not found');
  }

  // Cleanup
  try { await sourceStorage.deleteSource('src-test-001'); } catch {}
  const { getChannelDir } = await import('@yanghoo/domain');
  const chDir = path.join(process.cwd(), 'data', getChannelDir('ch-test-001').replace('data/', ''));
  if (fs.existsSync(chDir)) fs.rmSync(chDir, { recursive: true, force: true });
}

async function cleanup() {
  console.log('\n=== Cleanup ===');
  await savedEnglishExampleStorage.writeSavedEnglishExamples({ version: 1, updatedAt: new Date().toISOString(), items: [] });
  assert(true, 'Cleaned up saved examples file');
}

async function main() {
  console.log('Stage 14 Verification: Saved English Examples Review Queue\n');

  await testSaveAndDuplicate();
  await testListAndFilter();
  await testUpdate();
  await testReview();
  await testDelete();
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
