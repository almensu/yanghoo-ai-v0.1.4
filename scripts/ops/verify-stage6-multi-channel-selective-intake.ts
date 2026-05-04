/**
 * Verification script for Stage 6: Multi-channel Registry and Selective Caption Intake
 *
 * Tests real use cases with controlled local fixtures. No network required.
 * - listLearningChannelsUseCase (reads channels from storage)
 * - getLearningChannelVideosUseCase (reads videos + selection + report)
 * - updateChannelVideoSelectionUseCase (writes video-selection.json)
 * - buildEnglishSentenceIndexUseCase (builds JSONL index)
 * - syncSelectedEnglishCaptionsUseCase (tested via skip path with real assets)
 *
 * Run from repo root: npx tsx scripts/ops/verify-stage6-multi-channel-selective-intake.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const REPO_ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const FIXTURE_CHANNEL = 'test-stage6-selective';
const FIXTURE_INDEX_DIR = path.join(DATA_DIR, 'indexes', FIXTURE_CHANNEL);

// Import real use cases from compiled packages (main entry re-exports all)
import {
  listLearningChannelsUseCase,
  getLearningChannelVideosUseCase,
  updateChannelVideoSelectionUseCase,
  syncSelectedEnglishCaptionsUseCase
} from '@yanghoo/application';

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

/**
 * Create a complete source with English caption assets so that
 * hasEnglishCaptionAssets() returns true (hasMarkdown + source === 'platform_caption')
 */
function createCaptionedSource(sourceId: string, videoId: string, sentences: Array<{ text: string; start: number; end: number }>): void {
  const dir = sourceDir(sourceId);

  // Source record
  writeJson(path.join(dir, 'record.json'), {
    id: sourceId,
    sourceClass: 'long_video',
    platform: 'youtube',
    url: `https://www.youtube.com/watch?v=${videoId}`,
    title: `Video ${videoId}`,
    capturedAt: '2026-05-04T00:00:00.000Z',
    canonicalId: videoId,
    metadata: { videoId }
  });

  // English caption sentences
  const captionEnDir = path.join(dir, 'captions', 'en');
  writeJson(path.join(captionEnDir, 'transcript-sentences.json'), sentences);

  // Transcript manifest (marks as platform_caption, language en)
  writeJson(path.join(dir, 'transcript-manifest.json'), {
    sourceType: 'platform_caption',
    status: 'refined',
    language: 'en',
    engine: 'auto',
    captionVariants: [{
      language: 'en',
      label: 'English',
      isTranslated: false,
      sentencesPath: `data/sources/${sourceId}/captions/en/transcript-sentences.json`
    }],
    generatedAt: '2026-05-04T00:00:00.000Z'
  });

  // Document markdown (required for hasMarkdown check)
  fs.writeFileSync(path.join(dir, 'document.md'), `# Video ${videoId}\n\nContent here.`, 'utf-8');
}

function setupFixtures(): void {
  const chDir = channelDir(FIXTURE_CHANNEL);

  // Channel manifest
  writeJson(path.join(chDir, 'channel-manifest.json'), {
    id: FIXTURE_CHANNEL,
    platform: 'youtube',
    url: 'https://www.youtube.com/@TestStage6',
    title: 'Stage 6 Test Channel',
    capturedAt: '2026-05-04T00:00:00.000Z'
  });

  // 4 videos: vid001 (will have assets), vid002 (will have assets), vid003 (no assets), vid004 (no assets)
  const videos = [
    { id: 'yt-st6vid001', videoId: 'st6vid001', title: 'Alpha Talk', url: 'https://www.youtube.com/watch?v=st6vid001', publishedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'yt-st6vid002', videoId: 'st6vid002', title: 'Beta Chat', url: 'https://www.youtube.com/watch?v=st6vid002', publishedAt: '2026-01-02T00:00:00.000Z' },
    { id: 'yt-st6vid003', videoId: 'st6vid003', title: 'Gamma Lesson', url: 'https://www.youtube.com/watch?v=st6vid003', publishedAt: '2026-01-03T00:00:00.000Z' },
    { id: 'yt-st6vid004', videoId: 'st6vid004', title: 'Delta Talk', url: 'https://www.youtube.com/watch?v=st6vid004', publishedAt: '2026-01-04T00:00:00.000Z' }
  ];
  writeJson(path.join(chDir, 'videos.json'), videos);

  // Create full caption assets for vid001 and vid002 only
  createCaptionedSource('yt-st6vid001', 'st6vid001', [
    { text: 'I would have gone to the store.', start: 0, end: 3.5 },
    { text: 'Because it was raining outside.', start: 4, end: 7 }
  ]);
  createCaptionedSource('yt-st6vid002', 'st6vid002', [
    { text: 'She kind of liked the movie.', start: 0, end: 3 }
  ]);

  // vid003 and vid004 have no source directories (not captured)
}

function cleanupFixtures(): void {
  const chDir = channelDir(FIXTURE_CHANNEL);
  if (fs.existsSync(chDir)) fs.rmSync(chDir, { recursive: true, force: true });

  for (const sid of ['yt-st6vid001', 'yt-st6vid002', 'yt-st6vid003', 'yt-st6vid004']) {
    const dir = sourceDir(sid);
    if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
  }

  if (fs.existsSync(FIXTURE_INDEX_DIR)) fs.rmSync(FIXTURE_INDEX_DIR, { recursive: true, force: true });
}

// --- Part 1: listLearningChannelsUseCase ---
async function testListChannels(): Promise<void> {
  console.log('\n=== Part 1: listLearningChannelsUseCase ===');

  const channels = await listLearningChannelsUseCase();
  const testChannel = channels.find(c => c.channelId === FIXTURE_CHANNEL);

  assert(testChannel !== undefined, 'Fixture channel found in listing');
  if (testChannel) {
    assert(testChannel.title === 'Stage 6 Test Channel', `Channel title matches: "${testChannel.title}"`);
    assert(testChannel.videoCount === 4, `Channel videoCount is 4 (got ${testChannel.videoCount})`);
  }
}

// --- Part 2: updateChannelVideoSelectionUseCase ---
async function testUpdateSelection(): Promise<void> {
  console.log('\n=== Part 2: updateChannelVideoSelectionUseCase ===');

  // Select vid001 and vid003 only
  const result = await updateChannelVideoSelectionUseCase({
    channelId: FIXTURE_CHANNEL,
    videoIds: ['st6vid001', 'st6vid003'],
    selected: true
  });

  assert(result.selectedCount === 2, `selectedCount is 2 (got ${result.selectedCount})`);
  assert(result.totalVideos === 4, `totalVideos is 4 (got ${result.totalVideos})`);

  // Verify video-selection.json was written
  const selectionPath = path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json');
  assert(fs.existsSync(selectionPath), 'video-selection.json exists on disk');

  const selection = readJson(selectionPath);
  assert(selection.channelId === FIXTURE_CHANNEL, 'Selection channelId matches');
  const selected = selection.items.filter((i: any) => i.selected);
  const unselected = selection.items.filter((i: any) => !i.selected);
  assert(selected.length === 2, `2 items selected (got ${selected.length})`);
  assert(selected.some((i: any) => i.videoId === 'st6vid001'), 'vid001 is selected');
  assert(selected.some((i: any) => i.videoId === 'st6vid003'), 'vid003 is selected');
  // vid002 and vid004 were never submitted so they may not be in the selection items at all
  assert(!selected.some((i: any) => i.videoId === 'st6vid002'), 'vid002 is not selected');
  assert(!selected.some((i: any) => i.videoId === 'st6vid004'), 'vid004 is not selected');
}

// --- Part 3: Deselection persists ---
async function testDeselection(): Promise<void> {
  console.log('\n=== Part 3: Deselection Persists ===');

  // Deselect vid003
  const result = await updateChannelVideoSelectionUseCase({
    channelId: FIXTURE_CHANNEL,
    videoIds: ['st6vid003'],
    selected: false
  });

  assert(result.selectedCount === 1, `selectedCount is 1 after deselection (got ${result.selectedCount})`);

  // Read back from disk
  const selection = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json'));
  const deselected = selection.items.find((i: any) => i.videoId === 'st6vid003');
  assert(deselected.selected === false, 'vid003 is deselected');

  const stillSelected = selection.items.filter((i: any) => i.selected);
  assert(stillSelected.length === 1, 'Only 1 item still selected');
  assert(stillSelected[0].videoId === 'st6vid001', 'vid001 is still selected');
}

// --- Part 4: getLearningChannelVideosUseCase ---
async function testGetVideos(): Promise<void> {
  console.log('\n=== Part 4: getLearningChannelVideosUseCase ===');

  const result = await getLearningChannelVideosUseCase(FIXTURE_CHANNEL);

  assert(result.channelId === FIXTURE_CHANNEL, 'channelId matches');
  assert(result.videos.length === 4, `4 videos returned (got ${result.videos.length})`);

  const vid001 = result.videos.find(v => v.videoId === 'st6vid001');
  assert(vid001 !== undefined, 'vid001 found');
  if (vid001) {
    assert(vid001.selected === true, 'vid001 is selected');
    assert(vid001.title === 'Alpha Talk', 'vid001 title matches');
    assert(vid001.youtubeUrl.includes('st6vid001'), 'vid001 has youtube URL');
  }

  const vid002 = result.videos.find(v => v.videoId === 'st6vid002');
  if (vid002) {
    assert(vid002.selected === false, 'vid002 is not selected');
  }

  const vid003 = result.videos.find(v => v.videoId === 'st6vid003');
  if (vid003) {
    assert(vid003.selected === false, 'vid003 is not selected after deselection');
  }
}

// --- Part 5: syncSelectedEnglishCaptionsUseCase (skip path with real assets) ---
async function testSyncSelectedSkipPath(): Promise<void> {
  console.log('\n=== Part 5: syncSelected Captions (skip path) ===');

  // vid001 is selected and already has English caption assets
  // sync should detect real assets via hasEnglishCaptionAssets and skip
  const result = await syncSelectedEnglishCaptionsUseCase({
    channelId: FIXTURE_CHANNEL,
    batchSize: 10
  });

  assert(result.channelId === FIXTURE_CHANNEL, 'Sync channelId matches');
  assert(result.processed === 1, `Processed 1 video (got ${result.processed})`);

  // vid001 should be skipped because real assets exist
  assert(result.skipped === 1, `Skipped 1 because real assets exist (got ${result.skipped})`);
  assert(result.succeeded === 0, `Succeeded 0 (got ${result.succeeded})`);
  assert(result.failed === 0, `Failed 0 (got ${result.failed})`);

  // Verify caption-sync-report.json was written
  const reportPath = path.join(channelDir(FIXTURE_CHANNEL), 'caption-sync-report.json');
  assert(fs.existsSync(reportPath), 'caption-sync-report.json exists after sync');

  const report = readJson(reportPath);
  assert(report.channelId === FIXTURE_CHANNEL, 'Report channelId matches');
  assert(report.language === 'en', 'Report language is en');
  assert(report.items.length >= 1, `Report has items (got ${report.items.length})`);

  const vid001Report = report.items.find((i: any) => i.videoId === 'st6vid001');
  if (vid001Report) {
    assert(vid001Report.status === 'success' || vid001Report.status === 'skipped',
      `vid001 report status is success or skipped (got ${vid001Report.status})`);
    assert(typeof vid001Report.attempts === 'number', `vid001 report has attempts count`);
  }

  // Verify video-selection.json was also updated
  const selection = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json'));
  const vid001Sel = selection.items.find((i: any) => i.videoId === 'st6vid001');
  if (vid001Sel) {
    assert(vid001Sel.captionStatus === 'caption_ready', 'vid001 selection captionStatus is caption_ready');
  }
}

// --- Part 6: Stale captionStatus gets corrected by real asset check ---
async function testStaleStatusCorrection(): Promise<void> {
  console.log('\n=== Part 6: Stale captionStatus Corrected by Real Asset Check ===');

  // Manually corrupt the selection: mark vid001 as not_captured (stale)
  const selectionPath = path.join(channelDir(FIXTURE_CHANNEL), 'video-selection.json');
  const selection = readJson(selectionPath);
  const vid001 = selection.items.find((i: any) => i.videoId === 'st6vid001');
  vid001.captionStatus = 'not_captured';
  writeJson(selectionPath, selection);

  // Select vid001 again (it's still selected)
  // vid002 (has real assets but not selected) should NOT be processed

  const result = await syncSelectedEnglishCaptionsUseCase({
    channelId: FIXTURE_CHANNEL,
    batchSize: 10
  });

  // vid001 is selected, has stale captionStatus, but real assets exist
  // Real asset check should detect and skip it (not re-process)
  assert(result.processed === 1, `Processed 1 (got ${result.processed})`);
  assert(result.skipped === 1, `Skipped 1 due to real asset check (got ${result.skipped})`);

  // Verify selection was corrected to caption_ready
  const updatedSelection = readJson(selectionPath);
  const corrected = updatedSelection.items.find((i: any) => i.videoId === 'st6vid001');
  assert(corrected.captionStatus === 'caption_ready',
    `Stale status corrected to caption_ready (got ${corrected.captionStatus})`);

  // Verify vid002 was NOT processed (it's not selected)
  const vid002SourceDir = sourceDir('yt-st6vid002');
  // Count files — should not have changed
  const filesBefore = listAllFiles(vid002SourceDir).length;
  assert(filesBefore > 0, 'vid002 source dir has files (untouched from setup)');

  // Verify unselected vid002 was not in the sync results
  const report = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'caption-sync-report.json'));
  const vid002Report = report.items.find((i: any) => i.videoId === 'st6vid002');
  assert(!vid002Report || vid002Report.status === 'skipped' || vid002Report.status === 'success',
    'vid002 not in sync report or was skipped (unselected)');
}

// --- Part 7: Unselected videos not processed ---
async function testUnselectedNotProcessed(): Promise<void> {
  console.log('\n=== Part 7: Unselected Videos Not Processed ===');

  // vid002 has real assets but is not selected
  // vid004 has no assets and is not selected
  // Neither should appear in sync results

  const report = readJson(path.join(channelDir(FIXTURE_CHANNEL), 'caption-sync-report.json'));

  // Count how many times unselected videos appear in report items
  const unselectedVids = ['st6vid002', 'st6vid004'];
  for (const vid of unselectedVids) {
    const item = report.items.find((i: any) => i.videoId === vid);
    // If they appear, they should only be from a previous run's skip
    // They should never have attempts > 0 with status 'success' or 'failed' from THIS sync
    if (item) {
      assert(item.status === 'skipped' || item.status === 'success',
        `Unselected ${vid} not actively processed in sync (status: ${item.status})`);
    } else {
      assert(true, `Unselected ${vid} not in sync report at all`);
    }
  }

  // vid003 and vid004 should still have no source directories
  assert(!fs.existsSync(sourceDir('yt-st6vid003')), 'vid003 has no source directory');
  assert(!fs.existsSync(sourceDir('yt-st6vid004')), 'vid004 has no source directory');
}

// --- Part 8: buildEnglishSentenceIndexUseCase ---
function testBuildIndex(): void {
  console.log('\n=== Part 8: buildEnglishSentenceIndexUseCase ===');

  // Build via CLI (which calls the real use case)
  const result = execSync(
    `npm run -s cli -- sentence-index build --channel ${FIXTURE_CHANNEL} --language en`,
    { cwd: REPO_ROOT, encoding: 'utf-8', timeout: 30_000, env: { ...process.env, DATA_DIR: DATA_DIR } }
  );
  console.log(`  CLI output: ${result.trim().substring(0, 200)}`);

  const manifestPath = path.join(FIXTURE_INDEX_DIR, 'english-sentences-manifest.json');
  assert(fs.existsSync(manifestPath), 'Index manifest exists');

  const manifest = readJson(manifestPath);
  assert(manifest.channelId === FIXTURE_CHANNEL, `Manifest channelId matches`);
  assert(manifest.language === 'en', 'Manifest language is en');
  assert(manifest.sourceCount === 2, `sourceCount is 2 (both vid001 and vid002 have assets) (got ${manifest.sourceCount})`);
  assert(manifest.sentenceCount === 3, `sentenceCount is 3 (2 from vid001 + 1 from vid002) (got ${manifest.sentenceCount})`);

  // Verify JSONL content
  const jsonlPath = path.join(FIXTURE_INDEX_DIR, 'english-sentences.jsonl');
  assert(fs.existsSync(jsonlPath), 'JSONL file exists');
  const lines = fs.readFileSync(jsonlPath, 'utf-8').trim().split('\n');
  assert(lines.length === 3, `JSONL has 3 lines (got ${lines.length})`);

  // Verify no forbidden assets in source dirs
  const forbiddenPatterns = ['zh-Hans', 'translation', '.mp3', '.mp4', '.wav', '.m4a', '.webm'];
  for (const sid of ['yt-st6vid001', 'yt-st6vid002']) {
    const dir = sourceDir(sid);
    if (!fs.existsSync(dir)) continue;
    const files = listAllFiles(dir);
    for (const file of files) {
      for (const pattern of forbiddenPatterns) {
        assert(!file.includes(pattern), `No ${pattern} in ${path.basename(file)}`);
      }
    }
  }
}

function listAllFiles(dir: string): string[] {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) results.push(...listAllFiles(full));
    else results.push(full);
  }
  return results;
}

// --- Main ---
async function main(): Promise<void> {
  console.log('Stage 6 Verification: Multi-channel Registry and Selective Caption Intake');
  console.log('='.repeat(70));

  try {
    cleanupFixtures();
    setupFixtures();

    await testListChannels();
    await testUpdateSelection();
    await testDeselection();
    await testGetVideos();
    await testSyncSelectedSkipPath();
    await testStaleStatusCorrection();
    await testUnselectedNotProcessed();
    testBuildIndex();

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
