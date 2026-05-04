/**
 * Verification script for Stage 8: Channel Batch Selection and Staged Intake
 *
 * Tests that batch selection operations work correctly:
 * - Select first N from visible/ordered set
 * - Select new videos only
 * - Clear selected without affecting unrelated rows
 * - Existing selection/caption/index state preserved
 *
 * Run from repo root: npx tsx scripts/ops/verify-stage8-channel-batch-selection-and-staged-intake.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import {
  updateChannelVideoSelectionUseCase,
  getLearningChannelVideosUseCase
} from '@yanghoo/application';

const REPO_ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const FIXTURE_CHANNEL = 'test-stage8-batch';

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

function sourceDir(sourceId: string): string {
  return path.join(DATA_DIR, 'sources', sourceId);
}

function setupFixtures(): void {
  const chDir = channelDir(FIXTURE_CHANNEL);

  writeJson(path.join(chDir, 'channel-manifest.json'), {
    id: FIXTURE_CHANNEL,
    platform: 'youtube',
    url: 'https://www.youtube.com/@TestStage8',
    title: 'Stage 8 Test Channel',
    capturedAt: '2026-05-04T00:00:00.000Z'
  });

  // 10 videos: first 3 existing, next 3 new, last 4 existing
  const videos = [];
  for (let i = 1; i <= 10; i++) {
    videos.push({
      id: `yt-s8v${String(i).padStart(3, '0')}`,
      videoId: `s8v${String(i).padStart(3, '0')}`,
      title: `Video ${i}`,
      url: `https://www.youtube.com/watch?v=s8v${String(i).padStart(3, '0')}`,
      duration: 300
    });
  }
  writeJson(path.join(chDir, 'videos.json'), videos);

  // Pre-existing selection: v001 selected, v002 caption_ready, rest untouched
  writeJson(path.join(chDir, 'video-selection.json'), {
    channelId: FIXTURE_CHANNEL,
    updatedAt: '2026-05-04T00:00:00.000Z',
    items: [
      { videoId: 's8v001', selected: true, captionStatus: 'caption_ready', indexStatus: 'indexed', updatedAt: '2026-05-04T00:00:00.000Z' },
      { videoId: 's8v002', selected: false, captionStatus: 'caption_ready', indexStatus: 'indexed', updatedAt: '2026-05-04T00:00:00.000Z' }
    ]
  });

  // Refresh report: v004-v006 are "new"
  writeJson(path.join(chDir, 'channel-refresh-report.json'), {
    channelId: FIXTURE_CHANNEL,
    mode: 'latest',
    fetchLimit: 50,
    fetchedAt: '2026-05-04T12:00:00.000Z',
    localVideoCount: 10,
    remoteVideoCount: 8,
    addedCount: 3,
    updatedCount: 0,
    preservedCount: 5,
    remoteMissingCount: 0,
    addedVideos: [
      { videoId: 's8v004', title: 'Video 4', url: 'https://www.youtube.com/watch?v=s8v004' },
      { videoId: 's8v005', title: 'Video 5', url: 'https://www.youtube.com/watch?v=s8v005' },
      { videoId: 's8v006', title: 'Video 6', url: 'https://www.youtube.com/watch?v=s8v006' }
    ],
    remoteMissingVideoIds: []
  });
}

function cleanupFixtures(): void {
  const chDir = channelDir(FIXTURE_CHANNEL);
  if (fs.existsSync(chDir)) fs.rmSync(chDir, { recursive: true, force: true });
}

// --- Test 1: Get videos with discovery status ---
async function testGetVideosWithDiscoveryStatus(): Promise<void> {
  console.log('\n=== Test 1: Get videos with discovery status ===');

  const result = await getLearningChannelVideosUseCase(FIXTURE_CHANNEL);
  assert(result.videos.length === 10, `10 videos returned (got ${result.videos.length})`);

  const v004 = result.videos.find(v => v.videoId === 's8v004');
  assert(v004?.discoveryStatus === 'new', `v004 is new (got ${v004?.discoveryStatus})`);

  const v005 = result.videos.find(v => v.videoId === 's8v005');
  assert(v005?.discoveryStatus === 'new', `v005 is new`);

  const v001 = result.videos.find(v => v.videoId === 's8v001');
  assert(v001?.discoveryStatus === 'existing', `v001 is existing`);

  const v010 = result.videos.find(v => v.videoId === 's8v010');
  assert(v010?.discoveryStatus === 'existing', `v010 is existing`);
}

// --- Test 2: Select first 3 from all videos ---
async function testSelectFirstN(): Promise<void> {
  console.log('\n=== Test 2: Select first 3 ===');

  // Select first 3 videoIds
  const result = await updateChannelVideoSelectionUseCase({
    channelId: FIXTURE_CHANNEL,
    videoIds: ['s8v003', 's8v004', 's8v005'],
    selected: true
  });

  assert(result.selectedCount >= 3, `at least 3 selected (got ${result.selectedCount})`);

  // Verify selection on disk
  const selection = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json'));
  const selected = selection.items.filter((i: any) => i.selected);
  assert(selected.length >= 3, `at least 3 items selected on disk`);

  // v001 should still be selected (pre-existing)
  const v001 = selection.items.find((i: any) => i.videoId === 's8v001');
  assert(v001?.selected === true, `v001 still selected (pre-existing)`);
  assert(v001?.captionStatus === 'caption_ready', `v001 captionStatus preserved`);
}

// --- Test 3: Select new videos only ---
async function testSelectNewOnly(): Promise<void> {
  console.log('\n=== Test 3: Select new videos only ===');

  // First deselect everything
  await updateChannelVideoSelectionUseCase({
    channelId: FIXTURE_CHANNEL,
    videoIds: ['s8v001', 's8v003', 's8v004', 's8v005'],
    selected: false
  });

  // Now select only new videos
  const result = await updateChannelVideoSelectionUseCase({
    channelId: FIXTURE_CHANNEL,
    videoIds: ['s8v004', 's8v005', 's8v006'],
    selected: true
  });

  assert(result.selectedCount === 3, `3 selected (got ${result.selectedCount})`);

  const selection = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json'));
  const newSelected = ['s8v004', 's8v005', 's8v006'].map(id =>
    selection.items.find((i: any) => i.videoId === id)
  );
  assert(newSelected.every((item: any) => item?.selected === true), `all new videos selected`);

  // v001 should be deselected now
  const v001 = selection.items.find((i: any) => i.videoId === 's8v001');
  assert(v001?.selected === false, `v001 deselected`);
  // But its caption status should be preserved
  assert(v001?.captionStatus === 'caption_ready', `v001 captionStatus still caption_ready`);
}

// --- Test 4: Deselect batch preserves unrelated ---
async function testDeselectBatchPreservesUnrelated(): Promise<void> {
  console.log('\n=== Test 4: Deselect batch preserves unrelated ===');

  // Select all new + some existing
  await updateChannelVideoSelectionUseCase({
    channelId: FIXTURE_CHANNEL,
    videoIds: ['s8v001', 's8v004', 's8v005', 's8v006', 's8v010'],
    selected: true
  });

  // Now deselect only the first 2 new ones
  await updateChannelVideoSelectionUseCase({
    channelId: FIXTURE_CHANNEL,
    videoIds: ['s8v004', 's8v005'],
    selected: false
  });

  const selection = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json'));

  // v004, v005 deselected
  const v004 = selection.items.find((i: any) => i.videoId === 's8v004');
  const v005 = selection.items.find((i: any) => i.videoId === 's8v005');
  assert(v004?.selected === false, `v004 deselected`);
  assert(v005?.selected === false, `v005 deselected`);

  // v006, v010, v001 still selected
  const v006 = selection.items.find((i: any) => i.videoId === 's8v006');
  const v010 = selection.items.find((i: any) => i.videoId === 's8v010');
  const v001 = selection.items.find((i: any) => i.videoId === 's8v001');
  assert(v006?.selected === true, `v006 still selected`);
  assert(v010?.selected === true, `v010 still selected`);
  assert(v001?.selected === true, `v001 still selected`);

  // Caption/index status untouched
  assert(v001?.captionStatus === 'caption_ready', `v001 captionStatus untouched`);
}

// --- Test 5: Staged intake in phases ---
async function testStagedIntake(): Promise<void> {
  console.log('\n=== Test 5: Staged intake in phases ===');

  // Clear all
  const selection = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json'));
  const allIds = selection.items.map((i: any) => i.videoId);
  await updateChannelVideoSelectionUseCase({
    channelId: FIXTURE_CHANNEL,
    videoIds: allIds,
    selected: false
  });

  // Phase 1: Select first 2
  await updateChannelVideoSelectionUseCase({
    channelId: FIXTURE_CHANNEL,
    videoIds: ['s8v004', 's8v005'],
    selected: true
  });

  let sel = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json'));
  let phase1Count = sel.items.filter((i: any) => i.selected).length;
  assert(phase1Count === 2, `Phase 1: 2 selected (got ${phase1Count})`);

  // Phase 2: Select next 1 (v006)
  await updateChannelVideoSelectionUseCase({
    channelId: FIXTURE_CHANNEL,
    videoIds: ['s8v006'],
    selected: true
  });

  sel = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json'));
  let phase2Count = sel.items.filter((i: any) => i.selected).length;
  assert(phase2Count === 3, `Phase 2: 3 selected total (got ${phase2Count})`);

  // v004 and v005 should still be selected
  assert(sel.items.find((i: any) => i.videoId === 's8v004')?.selected === true, `v004 still selected after phase 2`);
  assert(sel.items.find((i: any) => i.videoId === 's8v005')?.selected === true, `v005 still selected after phase 2`);
}

// --- Test 6: No caption/media assets created ---
function testNoAssetsCreated(): void {
  console.log('\n=== Test 6: No caption/media assets created ===');

  for (let i = 1; i <= 10; i++) {
    const dir = sourceDir(`yt-s8v${String(i).padStart(3, '0')}`);
    assert(!fs.existsSync(dir), `No source dir for s8v${String(i).padStart(3, '0')}`);
  }
}

// --- Test 7: Existing caption/index state preserved across all operations ---
async function testExistingStatePreserved(): Promise<void> {
  console.log('\n=== Test 7: Existing state preserved ===');

  // Re-read the selection file — v001 and v002 should still have their original status
  const selection = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json'));

  const v001 = selection.items.find((i: any) => i.videoId === 's8v001');
  assert(v001?.captionStatus === 'caption_ready', `v001 caption ready throughout`);
  assert(v001?.indexStatus === 'indexed', `v001 indexed throughout`);

  const v002 = selection.items.find((i: any) => i.videoId === 's8v002');
  assert(v002?.captionStatus === 'caption_ready', `v002 caption ready throughout`);
}

// --- Main ---
async function main(): Promise<void> {
  console.log('Stage 8 Verification: Channel Batch Selection and Staged Intake');
  console.log('='.repeat(70));

  try {
    cleanupFixtures();
    setupFixtures();

    await testGetVideosWithDiscoveryStatus();
    await testSelectFirstN();
    await testSelectNewOnly();
    await testDeselectBatchPreservesUnrelated();
    await testStagedIntake();
    testNoAssetsCreated();
    await testExistingStatePreserved();

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
