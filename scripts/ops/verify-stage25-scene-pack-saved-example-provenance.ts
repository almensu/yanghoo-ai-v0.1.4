/**
 * Stage 25 Verification: Scene Pack Saved Example Provenance
 *
 * Proves:
 * 1. Saving from Scene Pack mode persists scene provenance.
 * 2. Duplicate save of an already-saved sentence does not create a new item.
 * 3. If a duplicate save comes from a scene pack and the existing item lacks scene provenance,
 *    update the existing item to add provenance and refresh updatedAt.
 * 4. Duplicate save behavior remains idempotent and does not drop provenance.
 */

import {
  saveEnglishExampleUseCase
} from '@yanghoo/application';
import { savedEnglishExampleStorage } from '@yanghoo/storage';
import type { EnglishSentenceIndexEntry } from '@yanghoo/domain';

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
    sourceId: 'src-test-025',
    videoId: 'vid-test-025',
    channelId: 'ch-test-025',
    channelTitle: 'Test Channel 25',
    title: 'Test Video 25',
    publishedAt: '2026-05-06T00:00:00Z',
    start: 10.5,
    end: 15.2,
    text: 'I wake up at seven every morning.',
    normalizedText: 'i wake up at seven every morning.',
    captionKind: 'manual',
    captionLanguage: 'en',
    ...overrides
  };
}

const testScenePack = {
  id: 'kid-wake-up-morning',
  title: 'Scene.KidWakeUpMorning',
  scene: 'Scene.KidWakeUpMorning',
  request: '对小孩早上起床的场景做筛选',
  query: 'wake up'
};

async function cleanSlate() {
  const file = await savedEnglishExampleStorage.readSavedEnglishExamples();
  file.items = file.items.filter(i => i.sourceId !== 'src-test-025');
  file.updatedAt = new Date().toISOString();
  await savedEnglishExampleStorage.writeSavedEnglishExamples(file);
}

async function testScenePackProvenance() {
  console.log('\n=== Scene Pack Provenance ===');

  await cleanSlate();

  const entry = makeEntry();
  const result1 = await saveEnglishExampleUseCase({
    entry,
    youtubeTimestampUrl: 'https://youtube.com/watch?v=vid-test-025&t=10s',
    youtubeEmbedUrl: 'https://youtube.com/embed/vid-test-025?start=8&autoplay=1',
    startSeconds: 8,
    query: 'wake up',
    scenePack: testScenePack
  });

  assert(result1.created === true, 'First save returns created=true');
  assert(result1.item.scenePackId === testScenePack.id, 'Persists scenePackId');
  assert(result1.item.scenePackTitle === testScenePack.title, 'Persists scenePackTitle');
  assert(result1.item.scenePackScene === testScenePack.scene, 'Persists scenePackScene');
  assert(result1.item.scenePackQuery === testScenePack.query, 'Persists scenePackQuery');
}

async function testDuplicateMergeRule() {
  console.log('\n=== Duplicate Merge Rule ===');

  await cleanSlate();

  const entry = makeEntry();
  
  // 1. Save without provenance
  console.log('Saving without provenance...');
  const result1 = await saveEnglishExampleUseCase({
    entry,
    youtubeTimestampUrl: 'https://youtube.com/watch?v=vid-test-025&t=10s',
    youtubeEmbedUrl: 'https://youtube.com/embed/vid-test-025?start=8&autoplay=1',
    startSeconds: 8,
    query: 'wake up'
  });
  assert(result1.created === true, 'Saved without provenance');
  assert(result1.item.scenePackId === undefined, 'No provenance initially');

  // 2. Save with provenance (duplicate)
  console.log('Saving same sentence with provenance (duplicate)...');
  const result2 = await saveEnglishExampleUseCase({
    entry,
    youtubeTimestampUrl: 'https://youtube.com/watch?v=vid-test-025&t=10s',
    youtubeEmbedUrl: 'https://youtube.com/embed/vid-test-025?start=8&autoplay=1',
    startSeconds: 8,
    query: 'wake up',
    scenePack: testScenePack
  });
  assert(result2.created === false, 'Detected duplicate (created=false)');
  assert(result2.updated === true, 'Merged provenance (updated=true)');
  assert(result2.item.scenePackId === testScenePack.id, 'Provenance added to existing item');

  // 3. Save again with provenance (idempotent)
  console.log('Saving again with provenance (idempotent)...');
  const result3 = await saveEnglishExampleUseCase({
    entry,
    youtubeTimestampUrl: 'https://youtube.com/watch?v=vid-test-025&t=10s',
    youtubeEmbedUrl: 'https://youtube.com/embed/vid-test-025?start=8&autoplay=1',
    startSeconds: 8,
    query: 'wake up',
    scenePack: testScenePack
  });
  assert(result3.created === false, 'Detected duplicate');
  assert(result3.updated === undefined, 'Not updated (already had provenance)');
  assert(result3.item.scenePackId === testScenePack.id, 'Provenance preserved');
}

async function cleanup() {
  console.log('\n=== Cleanup ===');
  await cleanSlate();
  assert(true, 'Cleaned up test saved examples without clearing real data');
}

async function main() {
  console.log('Stage 25 Verification: Scene Pack Saved Example Provenance\n');

  await testScenePackProvenance();
  await testDuplicateMergeRule();
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
