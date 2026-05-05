/**
 * Stage 12 Verification (Revised): Channel Delete and Multi-Channel English Search
 *
 * Proves:
 * 1. Channel delete removes target channel directory
 * 2. Channel delete preserves shared source assets used by another channel
 * 3. Channel delete removes only source assets not shared with other channels
 * 4. Delete returns truthful path-level summary
 * 5. Second delete returns 404
 * 6. Multi-channel search merges results across two indexed channels
 * 7. Single-channel search excludes the other channel
 * 8. Empty channelIds returns empty with warning
 * 9. Results preserve channel context
 * 10. Typecheck / build pass
 */

import * as fs from 'fs';
import * as path from 'path';
import { channelStorage, sourceStorage, createEnglishSentenceIndexStorage, indexInputStorage } from '@yanghoo/storage';
import { deleteLearningChannelUseCase, searchEnglishSentenceIndexUseCase } from '@yanghoo/application';
import type { ChannelManifest, ChannelVideo, VideoSelection, Source, EnglishSentenceIndexEntry, EnglishSentenceIndexManifest } from '@yanghoo/domain';

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

function makeEntry(
  channelId: string,
  channelTitle: string,
  sourceId: string,
  videoId: string,
  text: string,
  start: number
): EnglishSentenceIndexEntry {
  return {
    indexVersion: 1,
    sourceId,
    videoId,
    channelId,
    channelTitle,
    title: `${channelTitle} video`,
    publishedAt: '2026-01-01T00:00:00Z',
    start,
    end: start + 5,
    text,
    normalizedText: text.toLowerCase().trim(),
    captionKind: 'manual',
    captionLanguage: 'en'
  };
}

// --- Test 1: Channel delete with shared source safety ---
async function testChannelDeleteSharedSource() {
  console.log('\n=== Channel Delete: Shared Source Safety ===');

  const channelA = 'test-ch-alpha';
  const channelB = 'test-ch-beta';
  const sharedSourceId = 'shared-src-001';
  const privateSourceId = 'private-src-alpha-001';

  // Create both channels
  for (const chId of [channelA, channelB]) {
    const m: ChannelManifest = {
      id: chId,
      platform: 'youtube',
      url: `https://youtube.com/@${chId}`,
      title: `Channel ${chId}`,
      capturedAt: new Date().toISOString()
    };
    await channelStorage.saveChannelManifest(m);
  }

  // Both channels reference the same source
  const videosA: ChannelVideo[] = [
    { id: sharedSourceId, videoId: 'vid-shared', title: 'Shared Video', url: 'https://youtube.com/watch?v=vid-shared' },
    { id: privateSourceId, videoId: 'vid-private', title: 'Private Video', url: 'https://youtube.com/watch?v=vid-private' }
  ];
  await channelStorage.saveChannelVideos(channelA, videosA);

  const videosB: ChannelVideo[] = [
    { id: sharedSourceId, videoId: 'vid-shared', title: 'Shared Video', url: 'https://youtube.com/watch?v=vid-shared' }
  ];
  await channelStorage.saveChannelVideos(channelB, videosB);

  // Save selections
  await channelStorage.saveVideoSelection({
    channelId: channelA,
    updatedAt: new Date().toISOString(),
    items: [
      { videoId: 'vid-shared', sourceId: sharedSourceId, selected: true, captionStatus: 'caption_ready', indexStatus: 'indexed', updatedAt: new Date().toISOString() },
      { videoId: 'vid-private', sourceId: privateSourceId, selected: true, captionStatus: 'caption_ready', indexStatus: 'indexed', updatedAt: new Date().toISOString() }
    ]
  });
  await channelStorage.saveVideoSelection({
    channelId: channelB,
    updatedAt: new Date().toISOString(),
    items: [
      { videoId: 'vid-shared', sourceId: sharedSourceId, selected: true, captionStatus: 'caption_ready', indexStatus: 'indexed', updatedAt: new Date().toISOString() }
    ]
  });

  // Create the shared source
  const sharedSrc: Source = {
    id: sharedSourceId,
    sourceClass: 'long_video',
    platform: 'youtube',
    url: 'https://youtube.com/watch?v=vid-shared',
    title: 'Shared Video',
    capturedAt: new Date().toISOString()
  };
  await sourceStorage.saveSource(sharedSrc);

  // Create private source
  const privateSrc: Source = {
    id: privateSourceId,
    sourceClass: 'long_video',
    platform: 'youtube',
    url: 'https://youtube.com/watch?v=vid-private',
    title: 'Private Video',
    capturedAt: new Date().toISOString()
  };
  await sourceStorage.saveSource(privateSrc);

  // Verify setup
  const beforeShared = await sourceStorage.getSource(sharedSourceId);
  assert(beforeShared !== null, 'Shared source exists before delete');
  const beforePrivate = await sourceStorage.getSource(privateSourceId);
  assert(beforePrivate !== null, 'Private source exists before delete');

  // Delete channel A
  const result = await deleteLearningChannelUseCase(channelA);

  assert(result.channelId === channelA, 'Delete result has correct channelId');
  assert(result.deletedChannel === true, 'Delete result reports channel deleted');

  // Shared source should be preserved (skipped)
  const afterShared = await sourceStorage.getSource(sharedSourceId);
  assert(afterShared !== null, 'Shared source preserved after deleting channel A');

  // Channel B should still exist
  const afterChannelB = await channelStorage.getChannelManifest(channelB);
  assert(afterChannelB !== null, 'Channel B still exists');

  // Private source should be deleted
  const afterPrivate = await sourceStorage.getSource(privateSourceId);
  assert(afterPrivate === null, 'Private source deleted (not shared)');

  // Summary should report skip
  assert(result.skippedSources >= 1, `Delete reports skipped source(s): ${result.skippedSources}`);
  assert(result.warnings.some(w => w.includes('shared')), 'Delete has shared source warning');
  assert(result.deletedSources >= 1, `Delete reports deleted source(s): ${result.deletedSources}`);
  assert(result.deletedPaths.length > 0, 'Delete reports deleted paths');

  // Channel A directory gone
  const { getChannelDir } = await import('@yanghoo/domain');
  const chDir = path.join(process.cwd(), 'data', getChannelDir(channelA).replace('data/', ''));
  assert(!fs.existsSync(chDir), 'Channel A directory removed');

  // Second delete should 404
  try {
    await deleteLearningChannelUseCase(channelA);
    assert(false, 'Second delete should throw');
  } catch (err: any) {
    assert(err.message.includes('not found'), 'Second delete throws "not found"');
  }

  // Cleanup channel B
  await deleteLearningChannelUseCase(channelB);
}

// --- Test 1b: Channel delete preserves shared URL-library source without selection/report ---
async function testChannelDeleteVideosOnlySharedSource() {
  console.log('\n=== Channel Delete: Videos-Only Shared Source Safety ===');

  const channelA = 'test-ch-videos-only-a';
  const channelB = 'test-ch-videos-only-b';
  const sharedSourceId = 'shared-videos-only-src-001';

  for (const chId of [channelA, channelB]) {
    const m: ChannelManifest = {
      id: chId,
      platform: 'youtube',
      url: `https://youtube.com/@${chId}`,
      title: `Channel ${chId}`,
      capturedAt: new Date().toISOString()
    };
    await channelStorage.saveChannelManifest(m);
  }

  const sharedVideo: ChannelVideo = {
    id: sharedSourceId,
    videoId: 'vid-videos-only-shared',
    title: 'Videos Only Shared Video',
    url: 'https://youtube.com/watch?v=vid-videos-only-shared'
  };
  await channelStorage.saveChannelVideos(channelA, [sharedVideo]);
  await channelStorage.saveChannelVideos(channelB, [sharedVideo]);

  const sharedSrc: Source = {
    id: sharedSourceId,
    sourceClass: 'long_video',
    platform: 'youtube',
    url: sharedVideo.url,
    title: sharedVideo.title,
    capturedAt: new Date().toISOString()
  };
  await sourceStorage.saveSource(sharedSrc);

  const beforeShared = await sourceStorage.getSource(sharedSourceId);
  assert(beforeShared !== null, 'Videos-only shared source exists before delete');

  const result = await deleteLearningChannelUseCase(channelA);

  const afterShared = await sourceStorage.getSource(sharedSourceId);
  assert(afterShared !== null, 'Videos-only shared source preserved after deleting channel A');
  const afterChannelB = await channelStorage.getChannelManifest(channelB);
  assert(afterChannelB !== null, 'Videos-only Channel B still exists');
  assert(result.skippedSources >= 1, `Videos-only delete reports skipped source(s): ${result.skippedSources}`);
  assert(result.warnings.some(w => w.includes('shared')), 'Videos-only delete has shared source warning');

  await deleteLearningChannelUseCase(channelB);
}

// --- Test 2: Multi-Channel English Search with real indexes ---
async function testMultiChannelSearch() {
  console.log('\n=== Multi-Channel English Search: Real Indexes ===');

  const dataRoot = indexInputStorage.getDataRoot();
  const indexStorage = createEnglishSentenceIndexStorage(dataRoot);

  const channelX = 'search-test-ch-x';
  const channelY = 'search-test-ch-y';

  // Create channel manifests
  for (const chId of [channelX, channelY]) {
    const m: ChannelManifest = {
      id: chId,
      platform: 'youtube',
      url: `https://youtube.com/@${chId}`,
      title: `Search Test ${chId}`,
      capturedAt: new Date().toISOString()
    };
    await channelStorage.saveChannelManifest(m);
  }

  // Channel X: sentences about "because"
  const entriesX: EnglishSentenceIndexEntry[] = [
    makeEntry(channelX, 'Channel X', 'src-x1', 'vid-x1', 'Because I wanted to learn English', 10),
    makeEntry(channelX, 'Channel X', 'src-x1', 'vid-x1', 'That is because the weather is nice', 25),
    makeEntry(channelX, 'Channel X', 'src-x2', 'vid-x2', 'I stayed home because it was raining', 5)
  ];

  // Channel Y: sentences about "because"
  const entriesY: EnglishSentenceIndexEntry[] = [
    makeEntry(channelY, 'Channel Y', 'src-y1', 'vid-y1', 'She left early because she was tired', 12),
    makeEntry(channelY, 'Channel Y', 'src-y1', 'vid-y1', 'Because of you I changed my mind', 30)
  ];

  const manifestX: EnglishSentenceIndexManifest = {
    indexId: `idx-${channelX}`,
    channelId: channelX,
    language: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceCount: 2,
    sentenceCount: entriesX.length,
    skippedCount: 0,
    failedCount: 0,
    sourceIds: ['src-x1', 'src-x2'],
    warnings: []
  };

  const manifestY: EnglishSentenceIndexManifest = {
    indexId: `idx-${channelY}`,
    channelId: channelY,
    language: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceCount: 1,
    sentenceCount: entriesY.length,
    skippedCount: 0,
    failedCount: 0,
    sourceIds: ['src-y1'],
    warnings: []
  };

  await indexStorage.writeIndex(channelX, entriesX, manifestX);
  await indexStorage.writeIndex(channelY, entriesY, manifestY);

  // Test 1: Both channels — merged results
  const both = await searchEnglishSentenceIndexUseCase({
    channelIds: [channelX, channelY],
    language: 'en',
    query: 'because',
    limit: 50
  });
  assert(both.results.length === 5, `Both channels: 5 results (got ${both.results.length})`);
  assert(both.warnings.length === 0, 'Both channels: no warnings');

  const bothChannelIds = new Set(both.results.map(r => r.entry.channelId));
  assert(bothChannelIds.has(channelX), 'Both channels: includes channel X');
  assert(bothChannelIds.has(channelY), 'Both channels: includes channel Y');

  // Test 2: Only channel X
  const onlyX = await searchEnglishSentenceIndexUseCase({
    channelIds: [channelX],
    language: 'en',
    query: 'because',
    limit: 50
  });
  assert(onlyX.results.length === 3, `Channel X only: 3 results (got ${onlyX.results.length})`);
  assert(onlyX.results.every(r => r.entry.channelId === channelX), 'Channel X only: all from channel X');

  // Test 3: Only channel Y
  const onlyY = await searchEnglishSentenceIndexUseCase({
    channelIds: [channelY],
    language: 'en',
    query: 'because',
    limit: 50
  });
  assert(onlyY.results.length === 2, `Channel Y only: 2 results (got ${onlyY.results.length})`);
  assert(onlyY.results.every(r => r.entry.channelId === channelY), 'Channel Y only: all from channel Y');

  // Test 4: Results preserve channel context
  const first = both.results[0];
  assert(first.entry.channelId !== undefined, 'Result has channelId');
  assert(first.entry.channelTitle !== undefined, 'Result has channelTitle');
  assert(first.youtubeTimestampUrl.includes('youtube.com'), 'Result has YouTube URL');

  // Test 5: Empty channelIds
  const empty = await searchEnglishSentenceIndexUseCase({
    channelIds: [],
    language: 'en',
    query: 'because',
    limit: 5
  });
  assert(empty.results.length === 0, 'Empty channelIds: no results');
  assert(empty.warnings.length >= 1, 'Empty channelIds: has warning');

  // Test 6: Non-existent channel
  const missing = await searchEnglishSentenceIndexUseCase({
    channelIds: ['nonexistent-999'],
    language: 'en',
    query: 'because',
    limit: 5
  });
  assert(missing.results.length === 0, 'Non-existent channel: no results');
  assert(missing.warnings.length >= 1, 'Non-existent channel: has warning');

  // Cleanup indexes
  const { getIndexDir } = await import('@yanghoo/domain');
  for (const chId of [channelX, channelY]) {
    const idxDir = path.join(dataRoot, getIndexDir(chId).replace('data/', ''));
    if (fs.existsSync(idxDir)) fs.rmSync(idxDir, { recursive: true, force: true });
    const chDir = path.join(dataRoot, `channels/${chId}`);
    if (fs.existsSync(chDir)) fs.rmSync(chDir, { recursive: true, force: true });
  }
}

// --- Run ---
async function main() {
  console.log('Stage 12 Verification (Revised): Channel Delete and Multi-Channel English Search\n');

  await testChannelDeleteSharedSource();
  await testChannelDeleteVideosOnlySharedSource();
  await testMultiChannelSearch();

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(50)}`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
