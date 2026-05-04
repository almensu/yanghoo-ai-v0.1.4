/**
 * Verification script for Stage 7: Channel Refresh and Incremental Video Discovery
 *
 * Tests the pure mergeChannelVideos function and storage round-trips.
 * No YouTube network required.
 *
 * Run from repo root: npx tsx scripts/ops/verify-stage7-channel-refresh-incremental-discovery.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { mergeChannelVideos } from '@yanghoo/application';
import { channelStorage } from '@yanghoo/storage';
import type { ChannelVideo, ChannelRefreshMode } from '@yanghoo/domain';

const REPO_ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const FIXTURE_CHANNEL = 'test-stage7-refresh';

let passed = 0;
let failed = 0;

function assert(condition: boolean, message: string): void {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

function writeJson(filePath: string, data: unknown): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function readJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
}

function channelDir(channelId: string): string {
  return path.join(DATA_DIR, 'channels', channelId);
}

function makeVideo(videoId: string, title: string): ChannelVideo {
  return {
    id: `yt-${videoId}`,
    videoId,
    title,
    url: `https://www.youtube.com/watch?v=${videoId}`,
    duration: 300
  };
}

function setupFixtures(): void {
  const chDir = channelDir(FIXTURE_CHANNEL);

  writeJson(path.join(chDir, 'channel-manifest.json'), {
    id: FIXTURE_CHANNEL,
    platform: 'youtube',
    url: 'https://www.youtube.com/@TestStage7',
    title: 'Stage 7 Test Channel',
    capturedAt: '2026-05-04T00:00:00.000Z'
  });

  writeJson(path.join(chDir, 'videos.json'), [
    makeVideo('v001', 'Alpha Talk'),
    makeVideo('v002', 'Beta Chat'),
    makeVideo('v003', 'Gamma Lesson')
  ]);

  writeJson(path.join(chDir, 'video-selection.json'), {
    channelId: FIXTURE_CHANNEL,
    updatedAt: '2026-05-04T00:00:00.000Z',
    items: [
      { videoId: 'v001', selected: true, captionStatus: 'caption_ready', indexStatus: 'indexed', updatedAt: '2026-05-04T00:00:00.000Z' },
      { videoId: 'v002', selected: false, captionStatus: 'not_captured', indexStatus: 'not_indexed', updatedAt: '2026-05-04T00:00:00.000Z' },
      { videoId: 'v003', selected: false, captionStatus: 'caption_failed', indexStatus: 'not_indexed', updatedAt: '2026-05-04T00:00:00.000Z' }
    ]
  });
}

function cleanupFixtures(): void {
  const chDir = channelDir(FIXTURE_CHANNEL);
  if (fs.existsSync(chDir)) fs.rmSync(chDir, { recursive: true, force: true });
}

// --- Test 1: All-new (empty local + remote) ---
function testMergeAllNew(): void {
  console.log('\n=== Test 1: All-new (empty local + 3 remote) ===');

  const local: ChannelVideo[] = [];
  const remote = [makeVideo('r1', 'Remote 1'), makeVideo('r2', 'Remote 2'), makeVideo('r3', 'Remote 3')];
  const result = mergeChannelVideos(local, remote, 'latest');

  assert(result.merged.length === 3, `merged length is 3 (got ${result.merged.length})`);
  assert(result.addedVideos.length === 3, `addedVideos length is 3 (got ${result.addedVideos.length})`);
  assert(result.updatedCount === 0, `updatedCount is 0 (got ${result.updatedCount})`);
  assert(result.remoteMissingVideoIds.length === 0, `no remote-missing in latest mode`);
}

// --- Test 2: No change (same local + same remote) ---
function testMergeNoChange(): void {
  console.log('\n=== Test 2: No change (same 3 local + same 3 remote) ===');

  const local = [makeVideo('v001', 'Alpha Talk'), makeVideo('v002', 'Beta Chat'), makeVideo('v003', 'Gamma Lesson')];
  const remote = [makeVideo('v001', 'Alpha Talk'), makeVideo('v002', 'Beta Chat'), makeVideo('v003', 'Gamma Lesson')];
  const result = mergeChannelVideos(local, remote, 'latest');

  assert(result.merged.length === 3, `merged length is 3 (got ${result.merged.length})`);
  assert(result.addedVideos.length === 0, `addedVideos is 0 (got ${result.addedVideos.length})`);
  assert(result.updatedCount === 0, `updatedCount is 0 (got ${result.updatedCount})`);
  assert((local.length - result.updatedCount) === 3, `preserved = 3`);
}

// --- Test 3: Incremental add (3 local + 1 new remote) ---
function testMergeIncrementalAdd(): void {
  console.log('\n=== Test 3: Incremental add (3 local + 1 new) ===');

  const local = [makeVideo('v001', 'Alpha'), makeVideo('v002', 'Beta'), makeVideo('v003', 'Gamma')];
  const remote = [makeVideo('v004', 'Delta New'), makeVideo('v001', 'Alpha'), makeVideo('v002', 'Beta')];
  const result = mergeChannelVideos(local, remote, 'latest');

  assert(result.merged.length === 4, `merged length is 4 (got ${result.merged.length})`);
  assert(result.addedVideos.length === 1, `1 added (got ${result.addedVideos.length})`);
  assert(result.addedVideos[0].videoId === 'v004', `added video is v004`);
  assert(result.updatedCount === 0, `0 updated`);

  // v004 should be first (prepended)
  assert(result.merged[0].videoId === 'v004', `new video prepended at position 0`);
}

// --- Test 4: Metadata update ---
function testMergeMetadataUpdate(): void {
  console.log('\n=== Test 4: Metadata update (title change) ===');

  const local = [makeVideo('v001', 'Old Title')];
  const remote = [{ ...makeVideo('v001', 'Updated Title') }];
  const result = mergeChannelVideos(local, remote, 'latest');

  assert(result.merged.length === 1, `merged length is 1`);
  assert(result.merged[0].title === 'Updated Title', `title updated to "Updated Title" (got "${result.merged[0].title}")`);
  assert(result.updatedCount === 1, `1 updated (got ${result.updatedCount})`);
  assert(result.addedVideos.length === 0, `0 added`);
}

// --- Test 5: Selection preserved after storage round-trip ---
async function testSelectionPreserved(): Promise<void> {
  console.log('\n=== Test 5: Selection preserved after merge round-trip ===');

  const local = await channelStorage.getChannelVideos(FIXTURE_CHANNEL) || [];
  const remote = [makeVideo('v004', 'New Discovery'), ...local.slice(0, 2)];
  const result = mergeChannelVideos(local, remote, 'latest');

  // Save merged videos (simulating what refreshChannelVideosUseCase does)
  await channelStorage.saveChannelVideos(FIXTURE_CHANNEL, result.merged);

  // Verify video-selection.json is unchanged
  const selection = await channelStorage.getVideoSelection(FIXTURE_CHANNEL);
  assert(selection !== null, 'selection still exists');
  if (selection) {
    const v001 = selection.items.find((i: any) => i.videoId === 'v001');
    assert(v001?.selected === true, 'v001 still selected');
    assert(v001?.captionStatus === 'caption_ready', 'v001 still caption_ready');

    const v003 = selection.items.find((i: any) => i.videoId === 'v003');
    assert(v003?.captionStatus === 'caption_failed', 'v003 still caption_failed');

    // v004 is NOT in selection (new video, not auto-selected)
    const v004 = selection.items.find((i: any) => i.videoId === 'v004');
    assert(!v004, 'v004 not in selection (not auto-selected)');
  }

  // Verify merged videos count
  const merged = await channelStorage.getChannelVideos(FIXTURE_CHANNEL);
  assert(merged?.length === 4, `4 videos after merge (got ${merged?.length})`);
  assert(merged?.some(v => v.videoId === 'v004') ?? false, 'v004 in merged videos');
}

// --- Test 6: No source assets created for new videos ---
function testNoAssetsCreated(): void {
  console.log('\n=== Test 6: No source assets created ===');

  for (const vid of ['v004', 'v005', 'v006']) {
    const dir = path.join(DATA_DIR, 'sources', `yt-${vid}`);
    assert(!fs.existsSync(dir), `No source dir for ${vid}`);
  }
}

// --- Test 7: Latest mode does not mark missing ---
function testLatestModeNoMissing(): void {
  console.log('\n=== Test 7: Latest mode no remote-missing marking ===');

  const local = [makeVideo('v001', 'A'), makeVideo('v002', 'B'), makeVideo('v003', 'C')];
  const remote = [makeVideo('v001', 'A')]; // Only 1 fetched, v002/v003 not in window
  const result = mergeChannelVideos(local, remote, 'latest');

  assert(result.remoteMissingVideoIds.length === 0, `0 remote-missing in latest mode (got ${result.remoteMissingVideoIds.length})`);
}

// --- Test 8: Full mode marks remote missing ---
function testFullModeMissing(): void {
  console.log('\n=== Test 8: Full mode marks remote missing ===');

  const local = [makeVideo('v001', 'A'), makeVideo('v002', 'B'), makeVideo('v003', 'C')];
  const remote = [makeVideo('v001', 'A'), makeVideo('v003', 'C')]; // v002 missing
  const result = mergeChannelVideos(local, remote, 'full');

  assert(result.remoteMissingVideoIds.length === 1, `1 remote-missing (got ${result.remoteMissingVideoIds.length})`);
  assert(result.remoteMissingVideoIds[0] === 'v002', `v002 is remote-missing`);
  assert(result.merged.length === 3, `3 videos still in merged (not deleted)`);
  assert(result.merged.some(v => v.videoId === 'v002'), `v002 still in merged output (not removed)`);
}

// --- Test 9: No duplicate videoIds ---
function testNoDuplicates(): void {
  console.log('\n=== Test 9: No duplicate videoIds ===');

  const local = [makeVideo('v001', 'A'), makeVideo('v002', 'B')];
  const remote = [makeVideo('v001', 'A'), makeVideo('v002', 'B'), makeVideo('v003', 'C'), makeVideo('v001', 'A dup')];
  const result = mergeChannelVideos(local, remote, 'latest');

  const ids = result.merged.map(v => v.videoId);
  const uniqueIds = new Set(ids);
  assert(ids.length === uniqueIds.size, `no duplicates: ${ids.length} total = ${uniqueIds.size} unique`);
}

// --- Test 10: Refresh report storage round-trip ---
async function testRefreshReportRoundTrip(): Promise<void> {
  console.log('\n=== Test 10: Refresh report storage round-trip ===');

  const now = new Date().toISOString();
  const report = {
    channelId: FIXTURE_CHANNEL,
    mode: 'latest' as ChannelRefreshMode,
    fetchLimit: 50,
    fetchedAt: now,
    localVideoCount: 4,
    remoteVideoCount: 3,
    addedCount: 1,
    updatedCount: 0,
    preservedCount: 3,
    remoteMissingCount: 0,
    addedVideos: [{ videoId: 'v004', title: 'New Discovery', url: 'https://www.youtube.com/watch?v=v004' }],
    remoteMissingVideoIds: []
  };

  await channelStorage.saveChannelRefreshReport(report);
  const loaded = await channelStorage.getChannelRefreshReport(FIXTURE_CHANNEL);

  assert(loaded !== null, 'report loaded successfully');
  if (loaded) {
    assert(loaded.channelId === FIXTURE_CHANNEL, `channelId matches`);
    assert(loaded.mode === 'latest', `mode is latest`);
    assert(loaded.addedCount === 1, `addedCount is 1`);
    assert(loaded.addedVideos.length === 1, `1 addedVideo`);
    assert(loaded.addedVideos[0].videoId === 'v004', `added video is v004`);
    assert(loaded.localVideoCount === 4, `localVideoCount is 4`);
    assert(loaded.remoteMissingCount === 0, `0 remote-missing`);
  }
}

// --- Test 11: Idempotent refresh ---
async function testIdempotentRefresh(): Promise<void> {
  console.log('\n=== Test 11: Idempotent refresh ===');

  const local = await channelStorage.getChannelVideos(FIXTURE_CHANNEL) || [];
  const remote = local.slice(); // Same videos again
  const result = mergeChannelVideos(local, remote, 'latest');

  assert(result.addedVideos.length === 0, `0 new on re-refresh (got ${result.addedVideos.length})`);
  assert(result.updatedCount === 0, `0 updated on re-refresh`);
}

// --- Test 12: Duplicate new remote IDs rejected ---
function testDuplicateNewRemoteIds(): void {
  console.log('\n=== Test 12: Duplicate new remote IDs rejected ===');

  const local: ChannelVideo[] = [];
  const remote = [makeVideo('new1', 'R1'), makeVideo('new2', 'R2'), makeVideo('new1', 'R1 dup')];
  const result = mergeChannelVideos(local, remote, 'latest');

  const ids = result.merged.map(v => v.videoId);
  const uniqueIds = new Set(ids);
  assert(ids.length === uniqueIds.size, `no duplicate new IDs: ${ids.length} total = ${uniqueIds.size} unique`);
  assert(result.addedVideos.length === 2, `2 added (not 3) (got ${result.addedVideos.length})`);
  assert(result.merged.length === 2, `2 in merged (got ${result.merged.length})`);
}

// --- Test 13: Multiple new videos preserve remote order ---
function testMultiNewVideoOrder(): void {
  console.log('\n=== Test 13: Multiple new videos preserve remote order ===');

  const local = [makeVideo('old1', 'Old 1')];
  const remote = [makeVideo('newA', 'Newest'), makeVideo('newB', 'Second'), makeVideo('old1', 'Old 1')];
  const result = mergeChannelVideos(local, remote, 'latest');

  assert(result.merged.length === 3, `3 merged (got ${result.merged.length})`);
  assert(result.merged[0].videoId === 'newA', `first is newA (remote order preserved)`);
  assert(result.merged[1].videoId === 'newB', `second is newB (remote order preserved)`);
  assert(result.merged[2].videoId === 'old1', `third is old1 (local preserved)`);
}

// --- Main ---
async function main(): Promise<void> {
  console.log('Stage 7 Verification: Channel Refresh and Incremental Video Discovery');
  console.log('='.repeat(70));

  try {
    cleanupFixtures();
    setupFixtures();

    // Pure function tests (no I/O)
    testMergeAllNew();
    testMergeNoChange();
    testMergeIncrementalAdd();
    testMergeMetadataUpdate();
    testLatestModeNoMissing();
    testFullModeMissing();
    testNoDuplicates();
    testDuplicateNewRemoteIds();
    testMultiNewVideoOrder();

    // Storage round-trip tests
    await testSelectionPreserved();
    testNoAssetsCreated();
    await testRefreshReportRoundTrip();
    await testIdempotentRefresh();

  } finally {
    cleanupFixtures();
  }

  console.log('\n' + '='.repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  if (failed > 0) {
    console.error('VERIFICATION FAILED');
    process.exit(1);
  } else {
    console.log('ALL TESTS PASSED');
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  cleanupFixtures();
  process.exit(1);
});
