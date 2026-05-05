/**
 * Verification script for Stage 11: Channel UI Batch Summary Layout Clarification
 *
 * Proves:
 * 1. Three visual bands exist: URL Library, Selection, Subtitle Sync
 * 2. Each band is wrapped in its own container div
 * 3. URL Library band contains header + filter bar
 * 4. Selection band contains controls + batch summary
 * 5. Subtitle Sync band contains progress line + sync controls + result
 * 6. No download wording introduced
 *
 * Run from repo root: npx tsx scripts/ops/verify-stage11-channel-ui-batch-summary-layout-clarification.ts
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

const tableFile = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelVideoTable.tsx');
const content = fs.readFileSync(tableFile, 'utf-8');

// --- Test 1: Three band containers ---
function testThreeBandContainers(): void {
  console.log('\n=== Test 1: Three band containers ===');

  // Each band has a {/* Band N: ... */} comment and a wrapping div
  assert(content.includes('{/* Band 1: URL Library */}'), 'Band 1 comment: URL Library');
  assert(content.includes('{/* Band 2: Selection */}'), 'Band 2 comment: Selection');
  assert(content.includes('{/* Band 3: Subtitle Sync */}'), 'Band 3 comment: Subtitle Sync');
}

// --- Test 2: Band 1 contains header + filter ---
function testBand1ContainsHeaderAndFilter(): void {
  console.log('\n=== Test 2: Band 1 (URL Library) contains header + filter ===');

  const band1Start = content.indexOf('{/* Band 1: URL Library */}');
  const band2Start = content.indexOf('{/* Band 2: Selection */}');
  const band1 = content.substring(band1Start, band2Start);

  assert(band1.includes('URL Library'), 'Band 1 has "URL Library" label');
  assert(band1.includes('channel.title'), 'Band 1 has channel title');
  assert(band1.includes('Refresh URLs'), 'Band 1 has Refresh URLs button');
  assert(band1.includes('FILTER_OPTIONS'), 'Band 1 has filter bar');
  assert(band1.includes('filteredVideos.length'), 'Band 1 has filtered count');
}

// --- Test 3: Band 2 contains selection controls + summary ---
function testBand2ContainsSelection(): void {
  console.log('\n=== Test 3: Band 2 (Selection) contains controls + summary ===');

  const band2Start = content.indexOf('{/* Band 2: Selection */}');
  const band3Start = content.indexOf('{/* Band 3: Subtitle Sync */}');
  const band2 = content.substring(band2Start, band3Start);

  assert(band2.includes('>Selection<'), 'Band 2 has "Selection" label');
  assert(band2.includes('Select All'), 'Band 2 has Select All');
  assert(band2.includes('Select New'), 'Band 2 has Select New');
  assert(band2.includes('Select first'), 'Band 2 has Select first N');
  assert(band2.includes('Clear selected'), 'Band 2 has Clear selected');
  assert(band2.includes('URLs selected for English subtitle sync'), 'Band 2 has batch summary');
  assert(band2.includes('No URLs selected'), 'Band 2 has empty state');
}

// --- Test 4: Band 3 contains sync controls + progress + result ---
function testBand3ContainsSync(): void {
  console.log('\n=== Test 4: Band 3 (Subtitle Sync) contains sync controls ===');

  const band3Start = content.indexOf('{/* Band 3: Subtitle Sync */}');
  const errorBlock = content.indexOf('{error && (');
  const band3 = content.substring(band3Start, errorBlock);

  assert(band3.includes('>Subtitle Sync<'), 'Band 3 has "Subtitle Sync" label');
  assert(band3.includes('subtitleReadyCount'), 'Band 3 has progress summary');
  assert(band3.includes('needsSubtitleCount'), 'Band 3 has waiting count');
  assert(band3.includes('Sync English Subtitles'), 'Band 3 has sync button');
  assert(band3.includes('Build Index'), 'Band 3 has build index button');
  assert(band3.includes('syncResult'), 'Band 3 shows sync result');
  assert(band3.includes('buildResult'), 'Band 3 shows build result');
}

// --- Test 5: Visual separators between bands ---
function testVisualSeparators(): void {
  console.log('\n=== Test 5: Visual separators between bands ===');

  // Band 1 and Band 2 should have border-b separators
  assert(content.includes('border-b border-slate-100'), 'Bands use border-b separator');
  assert(content.match(/border-b border-slate-100/g)?.length === 2,
    'Exactly 2 border separators (between Band 1→2 and Band 2→3)');
}

// --- Test 6: Table is outside bands ---
function testTableOutsideBands(): void {
  console.log('\n=== Test 6: Table is outside bands ===');

  const band3End = content.indexOf('{/* Band 3: Subtitle Sync */}');
  const tableStart = content.indexOf('<table className');
  const band3SectionEnd = content.indexOf('{error && (');

  // Table should be after band 3
  assert(tableStart > band3SectionEnd, 'Table comes after all three bands');
}

// --- Test 7: No download wording ---
function testNoDownloadWording(): void {
  console.log('\n=== Test 7: No download wording ===');
  assert(!content.match(/download/i), 'No download wording in video table');
}

// --- Test 8: Library component unchanged ---
function testLibraryUnchanged(): void {
  console.log('\n=== Test 8: Library component wording unchanged ===');
  const libFile = path.join(REPO_ROOT, 'apps/web/src/components/LearningChannelLibrary.tsx');
  const libContent = fs.readFileSync(libFile, 'utf-8');

  assert(libContent.includes('Channel URL Library'), 'Library title unchanged');
  assert(libContent.includes('Add Channel URL'), 'Library button unchanged');
}

// --- Main ---
async function main(): Promise<void> {
  console.log('Stage 11 Verification: Channel UI Batch Summary Layout Clarification');
  console.log('='.repeat(70));

  testThreeBandContainers();
  testBand1ContainsHeaderAndFilter();
  testBand2ContainsSelection();
  testBand3ContainsSync();
  testVisualSeparators();
  testTableOutsideBands();
  testNoDownloadWording();
  testLibraryUnchanged();

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
