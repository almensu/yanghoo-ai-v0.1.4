/**
 * Stage 13 Verification: English Search Learning Workbench
 *
 * Proves:
 * 1. Search returns bounded pages with hasMore.
 * 2. Offset pagination returns the next page.
 * 3. Balanced diversity caps results per video.
 * 4. One-per-video diversity returns at most one match per video.
 * 5. All matches allows repeated video results.
 * 6. Search results include YouTube timestamp and embed URLs.
 * 7. Context lookup returns previous/current/next rows and caps window size.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  createEnglishSentenceIndexStorage,
  indexInputStorage
} from '@yanghoo/storage';
import {
  getEnglishSentenceContextUseCase,
  searchEnglishSentenceIndexUseCase
} from '@yanghoo/application';
import type {
  EnglishSentenceIndexEntry,
  EnglishSentenceIndexManifest
} from '@yanghoo/domain';

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

function makeEntry(videoIndex: number, sentenceIndex: number): EnglishSentenceIndexEntry {
  const sourceId = `stage13-src-${videoIndex}`;
  const videoId = `stage13-video-${videoIndex}`;
  const start = videoIndex * 100 + sentenceIndex * 10;
  return {
    indexVersion: 1,
    sourceId,
    videoId,
    channelId: CHANNEL_ID,
    channelTitle: 'Stage 13 Channel',
    title: `Stage 13 Video ${videoIndex}`,
    publishedAt: `2026-01-${String(videoIndex + 1).padStart(2, '0')}T00:00:00Z`,
    start,
    end: start + 5,
    text: `Because this is sentence ${sentenceIndex} from video ${videoIndex}`,
    normalizedText: `because this is sentence ${sentenceIndex} from video ${videoIndex}`,
    captionKind: sentenceIndex % 2 === 0 ? 'auto' : 'manual',
    captionLanguage: 'en'
  };
}

const CHANNEL_ID = 'stage13-learning-workbench-channel';

async function main() {
  console.log('Stage 13 Verification: English Search Learning Workbench\n');

  const dataRoot = indexInputStorage.getDataRoot();
  const indexStorage = createEnglishSentenceIndexStorage(dataRoot);
  const entries: EnglishSentenceIndexEntry[] = [];

  for (let videoIndex = 0; videoIndex < 12; videoIndex++) {
    for (let sentenceIndex = 0; sentenceIndex < 3; sentenceIndex++) {
      entries.push(makeEntry(videoIndex, sentenceIndex));
    }
  }

  const manifest: EnglishSentenceIndexManifest = {
    indexId: `idx-${CHANNEL_ID}`,
    channelId: CHANNEL_ID,
    language: 'en',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceCount: 12,
    sentenceCount: entries.length,
    skippedCount: 0,
    failedCount: 0,
    sourceIds: [...new Set(entries.map(e => e.sourceId))],
    warnings: []
  };

  await indexStorage.writeIndex(CHANNEL_ID, entries, manifest);

  const balanced = await searchEnglishSentenceIndexUseCase({
    channelIds: [CHANNEL_ID],
    language: 'en',
    query: 'because',
    limit: 20,
    offset: 0,
    diversity: 'balanced'
  });

  assert(balanced.results.length === 20, `Balanced first page returns 20 results (got ${balanced.results.length})`);
  assert(balanced.page.hasMore === true, 'Balanced first page reports hasMore');
  assert(balanced.page.limit === 20, 'Page metadata has limit 20');
  assert(balanced.results[0].youtubeTimestampUrl.includes('youtube.com/watch'), 'Result has external timestamp URL');
  assert(balanced.results[0].youtubeEmbedUrl.includes('youtube.com/embed/'), 'Result has embedded YouTube URL');
  assert(balanced.results[0].startSeconds === Math.max(0, Math.floor(balanced.results[0].entry.start) - 2), 'Embed start has 2 second lead-in');

  const videoCounts = new Map<string, number>();
  for (const result of balanced.results) {
    const key = result.entry.videoId;
    videoCounts.set(key, (videoCounts.get(key) ?? 0) + 1);
  }
  assert([...videoCounts.values()].every(count => count <= 2), 'Balanced caps each video at 2 results');

  const nextPage = await searchEnglishSentenceIndexUseCase({
    channelIds: [CHANNEL_ID],
    language: 'en',
    query: 'because',
    limit: 20,
    offset: 20,
    diversity: 'balanced'
  });
  assert(nextPage.results.length === 4, `Balanced second page returns remaining 4 results (got ${nextPage.results.length})`);
  assert(nextPage.page.hasMore === false, 'Balanced second page has no more results');

  const onePerVideo = await searchEnglishSentenceIndexUseCase({
    channelIds: [CHANNEL_ID],
    language: 'en',
    query: 'because',
    limit: 50,
    diversity: 'one_per_video'
  });
  assert(onePerVideo.results.length === 12, `One-per-video returns 12 results (got ${onePerVideo.results.length})`);
  assert(new Set(onePerVideo.results.map(r => r.entry.videoId)).size === onePerVideo.results.length, 'One-per-video has unique videos');

  const allMatches = await searchEnglishSentenceIndexUseCase({
    channelIds: [CHANNEL_ID],
    language: 'en',
    query: 'because',
    limit: 50,
    diversity: 'all'
  });
  assert(allMatches.results.length === 36, `All matches returns 36 results (got ${allMatches.results.length})`);

  const autoOnly = await searchEnglishSentenceIndexUseCase({
    channelIds: [CHANNEL_ID],
    language: 'en',
    query: 'because',
    limit: 50,
    diversity: 'all',
    captionKind: 'auto'
  });
  assert(autoOnly.results.length === 24, `Auto caption filter returns 24 results (got ${autoOnly.results.length})`);

  const context = await getEnglishSentenceContextUseCase({
    channelId: CHANNEL_ID,
    sourceId: 'stage13-src-3',
    start: 310,
    window: 3
  });
  assert(context.items.length === 3, `Context at source boundary returns 3 available rows (got ${context.items.length})`);
  assert(context.items.some(item => item.isMatch && item.start === 310), 'Context marks matched sentence');
  assert(context.items.every((item, index, arr) => index === 0 || arr[index - 1].start <= item.start), 'Context rows are ordered by start');

  const { getIndexDir } = await import('@yanghoo/domain');
  const indexDir = path.join(dataRoot, getIndexDir(CHANNEL_ID).replace('data/', ''));
  if (fs.existsSync(indexDir)) fs.rmSync(indexDir, { recursive: true, force: true });

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(50)}`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(error => {
  console.error('Fatal:', error);
  process.exit(1);
});
