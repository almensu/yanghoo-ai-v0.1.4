/**
 * Verification script for Stage 10: Channel Batch Summary and Sync Intent Clarification
 *
 * Proves:
 * 1. The selection section shows a batch summary with URL count and intent
 * 2. The subtitle sync section shows progress (how many have subtitles, how many waiting)
 * 3. The sync result uses "English subtitles synced" wording
 * 4. No download wording introduced
 *
 * Run from repo root: npx tsx scripts/ops/verify-stage10-channel-batch-summary-and-sync-intent-clarification.ts
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

const tableFile = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelVideoTable.tsx');

// --- Test 1: Batch summary in Selection section ---
function testBatchSummary(): void {
  console.log('\n=== Test 1: Batch summary in Selection section ===');
  const content = fs.readFileSync(tableFile, 'utf-8');

  assert(content.includes('selectedIds.length > 0'), 'Conditional check for selected count');
  assert(content.includes('of') && content.includes('URLs selected for English subtitle sync'),
    'Summary says "N of M URLs selected for English subtitle sync"');
  assert(content.includes('No URLs selected'), 'Fallback text "No URLs selected"');
}

// --- Test 2: Subtitle progress summary ---
function testSubtitleProgressSummary(): void {
  console.log('\n=== Test 2: Subtitle progress summary ===');
  const content = fs.readFileSync(tableFile, 'utf-8');

  assert(content.includes('subtitleReadyCount'), 'Computes subtitleReadyCount');
  assert(content.includes('needsSubtitleCount'), 'Computes needsSubtitleCount');
  assert(content.includes('failedSubtitleCount'), 'Computes failedSubtitleCount');
  assert(content.includes('URLs have English subtitles'), 'Summary shows "URLs have English subtitles"');
  assert(content.includes('selected and waiting'), 'Summary shows "selected and waiting"');
}

// --- Test 3: Sync result wording ---
function testSyncResultWording(): void {
  console.log('\n=== Test 3: Sync result wording ===');
  const content = fs.readFileSync(tableFile, 'utf-8');

  assert(content.includes('English subtitle') && content.includes('synced'),
    'Sync result says "English subtitles synced"');
  assert(!content.includes('Processed:'), 'No longer uses "Processed:" prefix');
}

// --- Test 4: No download wording ---
function testNoDownloadWording(): void {
  console.log('\n=== Test 4: No download wording ===');
  const libFile = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelLibrary.tsx');

  assert(fileNotContains(tableFile, /download/i), 'Video table has no download wording');
  assert(fileNotContains(libFile, /download/i), 'Library has no download wording');
}

// --- Test 5: Existing batch selection controls unchanged ---
function testSelectionControlsUnchanged(): void {
  console.log('\n=== Test 5: Selection controls still exist ===');
  const content = fs.readFileSync(tableFile, 'utf-8');

  assert(content.includes('Select All'), 'Select All button exists');
  assert(content.includes('Select New'), 'Select New button exists');
  assert(content.includes('Select first'), 'Select first N button exists');
  assert(content.includes('Clear selected'), 'Clear selected button exists');
}

// --- Test 6: Section labels still present ---
function testSectionLabelsPresent(): void {
  console.log('\n=== Test 6: Section labels still present ===');
  const content = fs.readFileSync(tableFile, 'utf-8');

  assert(content.includes('>URL Library<'), 'URL Library section label');
  assert(content.includes('>Selection<'), 'Selection section label');
  assert(content.includes('>Subtitle Sync<'), 'Subtitle Sync section label');
}

// --- Test 7: Library wording unchanged from Stage 9 ---
function testLibraryWordingUnchanged(): void {
  console.log('\n=== Test 7: Library wording unchanged ===');
  const libFile = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelLibrary.tsx');
  const content = fs.readFileSync(libFile, 'utf-8');

  assert(content.includes('Channel URL Library'), 'Title still says "Channel URL Library"');
  assert(content.includes('Add Channel URL'), 'Button still says "Add Channel URL"');
  assert(content.includes('>URLs<'), 'Card label still says "URLs"');
  assert(content.includes('>Subtitles<'), 'Card label still says "Subtitles"');
}

// --- Test 8: Sync button still present ---
function testSyncButtonPresent(): void {
  console.log('\n=== Test 8: Sync button still present ===');
  const content = fs.readFileSync(tableFile, 'utf-8');

  assert(content.includes('Sync English Subtitles'), 'Sync English Subtitles button text');
  assert(content.includes('Build Index'), 'Build Index button text');
}

// --- Main ---
async function main(): Promise<void> {
  console.log('Stage 10 Verification: Channel Batch Summary and Sync Intent Clarification');
  console.log('='.repeat(70));

  testBatchSummary();
  testSubtitleProgressSummary();
  testSyncResultWording();
  testNoDownloadWording();
  testSelectionControlsUnchanged();
  testSectionLabelsPresent();
  testLibraryWordingUnchanged();
  testSyncButtonPresent();

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
