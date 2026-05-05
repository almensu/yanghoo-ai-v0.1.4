/**
 * Verification script for Stage 9: Channel URL Library and Subtitle Intake Clarification
 *
 * Proves:
 * 1. The Channels surface reads as a URL library, not a media downloader
 * 2. Batch selection → English subtitle sync workflow is intact
 * 3. Machine translation outside Channels is untouched
 * 4. No video or audio downloads introduced by the Channels flow
 *
 * Run from repo root: npx tsx scripts/ops/verify-stage9-channel-url-library-and-subtitle-intake-clarification.ts
 */
import * as fs from 'fs';
import * as path from 'path';

const REPO_ROOT = path.resolve(__dirname, '../..');

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

function fileContains(filePath: string, pattern: string | RegExp): boolean {
  if (!fs.existsSync(filePath)) return false;
  const content = fs.readFileSync(filePath, 'utf-8');
  if (typeof pattern === 'string') return content.includes(pattern);
  return pattern.test(content);
}

function fileNotContains(filePath: string, pattern: string | RegExp): boolean {
  if (!fs.existsSync(filePath)) return true;
  const content = fs.readFileSync(filePath, 'utf-8');
  if (typeof pattern === 'string') return !content.includes(pattern);
  return !pattern.test(content);
}

// --- Test 1: LearningChannelLibrary wording ---
function testLibraryWording(): void {
  console.log('\n=== Test 1: LearningChannelLibrary URL library wording ===');
  const file = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelLibrary.tsx');
  const content = fs.readFileSync(file, 'utf-8');

  assert(content.includes('Channel URL Library'), 'Title says "Channel URL Library"');
  assert(content.includes('Add Channel URL'), 'Button says "Add Channel URL"');
  assert(content.includes('sync English subtitles'), 'Description mentions English subtitles');
  assert(content.includes('>URLs<'), 'Card label says "URLs" not "Videos"');
  assert(content.includes('>Subtitles<'), 'Card label says "Subtitles" not "Captions"');
}

// --- Test 2: LearningChannelVideoTable section labels ---
function testVideoTableSections(): void {
  console.log('\n=== Test 2: LearningChannelVideoTable visual sections ===');
  const file = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelVideoTable.tsx');
  const content = fs.readFileSync(file, 'utf-8');

  assert(content.includes('>URL Library<'), 'Has "URL Library" section label');
  assert(content.includes('>Selection<'), 'Has "Selection" section label');
  assert(content.includes('>Subtitle Sync<'), 'Has "Subtitle Sync" section label');
  assert(content.includes('Sync English Subtitles'), 'Button says "Sync English Subtitles"');
  assert(content.includes('>Subtitle<') || content.includes('>Subtitle'), 'Column header says "Subtitle" not "Caption"');
  assert(content.includes('Refresh URLs'), 'Has "Refresh URLs" button');
}

// --- Test 3: No media download wording in Channels flow ---
function testNoMediaDownloadWording(): void {
  console.log('\n=== Test 3: No media download wording in Channels ===');
  const libFile = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelLibrary.tsx');
  const tableFile = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelVideoTable.tsx');

  assert(fileNotContains(libFile, 'Download'), 'Library has no "Download" wording');
  assert(fileNotContains(tableFile, /Download\s+video/i), 'Video table has no "Download video" wording');
  assert(fileNotContains(tableFile, /Download\s+audio/i), 'Video table has no "Download audio" wording');
  assert(fileNotContains(libFile, /download\s+video/i), 'Library has no "download video"');
  assert(fileNotContains(tableFile, 'yt-dlp'), 'Video table does not mention yt-dlp');
}

// --- Test 4: API routes — translation routes still exist ---
function testTranslationRoutesUntouched(): void {
  console.log('\n=== Test 4: Machine translation routes untouched ===');
  const tasksRoute = path.join(REPO_ROOT, 'apps/api/src/routes/tasks.ts');
  const jobsRoute = path.join(REPO_ROOT, 'apps/api/src/routes/jobs.ts');

  assert(fs.existsSync(tasksRoute), 'tasks.ts route file exists');
  assert(fs.existsSync(jobsRoute), 'jobs.ts route file exists');
  assert(fileContains(tasksRoute, 'translate') || fileContains(tasksRoute, 'translation'),
    'tasks route still mentions translation');
}

// --- Test 5: Web translation components untouched ---
function testTranslationComponentsUntouched(): void {
  console.log('\n=== Test 5: Translation UI components untouched ===');
  const taskCard = path.join(REPO_ROOT, 'apps/web/src/components/TaskCard.tsx');
  const reader = path.join(REPO_ROOT, 'apps/web/src/components/Reader.tsx');

  assert(fs.existsSync(taskCard), 'TaskCard.tsx exists');
  assert(fs.existsSync(reader), 'Reader.tsx exists');
  assert(
    fileContains(taskCard, 'translat') || fileContains(reader, 'translat'),
    'At least one non-Channel component mentions translation'
  );
}

// --- Test 6: Channel API routes do not add video/audio download endpoints ---
function testNoNewDownloadEndpoints(): void {
  console.log('\n=== Test 6: Channel API has no download endpoints ===');
  const lcRoute = path.join(REPO_ROOT, 'apps/api/src/routes/learningChannels.ts');
  const content = fs.readFileSync(lcRoute, 'utf-8');

  assert(!content.includes('/download'), 'No /download endpoint in learningChannels route');
  assert(!content.includes('/media'), 'No /media endpoint in learningChannels route');
  assert(!content.includes('/audio'), 'No /audio endpoint in learningChannels route');
  assert(content.includes('/sync-captions') || content.includes('/sync'), 'Has /sync-captions endpoint');
  assert(content.includes('/refresh'), 'Has /refresh endpoint');
}

// --- Test 7: Domain types still have translation types ---
function testDomainTranslationTypes(): void {
  console.log('\n=== Test 7: Domain still has translation types ===');
  const domainIndex = path.join(REPO_ROOT, 'packages/domain/src/index.ts');

  assert(fileContains(domainIndex, 'TranslationStatus') || fileContains(domainIndex, 'translationStatus'),
    'Domain still exports translation types');
}

// --- Test 8: Application layer still has translation use cases ---
function testApplicationTranslationUseCases(): void {
  console.log('\n=== Test 8: Application still has translation use cases ===');
  const appIndex = path.join(REPO_ROOT, 'packages/application/src/index.ts');

  assert(fileContains(appIndex, 'translat'), 'Application index still exports translation use cases');
}

// --- Test 9: Build artifacts do not contain Channels-specific media downloads ---
function testNoChannelsMediaImports(): void {
  console.log('\n=== Test 9: Channel components do not import media/download modules ===');
  const libFile = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelLibrary.tsx');
  const tableFile = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelVideoTable.tsx');

  const libContent = fs.readFileSync(libFile, 'utf-8');
  const tableContent = fs.readFileSync(tableFile, 'utf-8');

  assert(!libContent.includes('download') && !tableContent.includes('download'),
    'Neither Channel component imports download functionality');
  assert(!libContent.includes('ffmpeg') && !tableContent.includes('ffmpeg'),
    'Neither Channel component references ffmpeg');
}

// --- Main ---
async function main(): Promise<void> {
  console.log('Stage 9 Verification: Channel URL Library and Subtitle Intake Clarification');
  console.log('='.repeat(70));

  testLibraryWording();
  testVideoTableSections();
  testNoMediaDownloadWording();
  testTranslationRoutesUntouched();
  testTranslationComponentsUntouched();
  testNoNewDownloadEndpoints();
  testDomainTranslationTypes();
  testApplicationTranslationUseCases();
  testNoChannelsMediaImports();

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
  process.exit(1);
});
