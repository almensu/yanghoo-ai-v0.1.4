/**
 * Verification script for Stage 4: English Sentence Index
 *
 * Tests build and search use cases with controlled local fixtures.
 * No network access required.
 *
 * Run: npx tsx scripts/ops/verify-stage4-english-sentence-index.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const REPO_ROOT = path.resolve(__dirname, '../..');
const DATA_DIR = path.join(REPO_ROOT, 'data');
const FIXTURE_CHANNEL_ID = 'test-verify-stage4';
const FIXTURE_CHANNEL_DIR = path.join(DATA_DIR, 'channels', FIXTURE_CHANNEL_ID);
const FIXTURE_INDEX_DIR = path.join(DATA_DIR, 'indexes', FIXTURE_CHANNEL_ID);

const CLI_CMD = `npm run -s cli --`;

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

function setupFixtures(): void {
  // Create test channel manifest
  const channelDir = FIXTURE_CHANNEL_DIR;
  if (!fs.existsSync(channelDir)) fs.mkdirSync(channelDir, { recursive: true });

  const channelManifest = {
    id: FIXTURE_CHANNEL_ID,
    platform: 'youtube',
    url: 'https://www.youtube.com/@TestChannel',
    title: 'Test English Channel',
    capturedAt: '2026-05-04T00:00:00.000Z'
  };
  fs.writeFileSync(
    path.join(channelDir, 'channel-manifest.json'),
    JSON.stringify(channelManifest, null, 2),
    'utf-8'
  );

  // Create 4 test videos
  const videos = [
    { id: 'yt-vid001', videoId: 'vid001', title: 'Test Video One', url: 'https://www.youtube.com/watch?v=vid001', publishedAt: '2026-01-01T00:00:00.000Z' },
    { id: 'yt-vid002', videoId: 'vid002', title: 'Test Video Two', url: 'https://www.youtube.com/watch?v=vid002', publishedAt: '2026-01-02T00:00:00.000Z' },
    { id: 'yt-vid003', videoId: 'vid003', title: 'Test Video Three', url: 'https://www.youtube.com/watch?v=vid003', publishedAt: '2026-01-03T00:00:00.000Z' },
    { id: 'yt-vid004', videoId: 'vid004', title: 'Test Video Four (malformed)', url: 'https://www.youtube.com/watch?v=vid004', publishedAt: '2026-01-04T00:00:00.000Z' }
  ];
  fs.writeFileSync(
    path.join(channelDir, 'videos.json'),
    JSON.stringify(videos, null, 2),
    'utf-8'
  );

  // Create source directories with English captions for vid001 and vid002
  for (const video of videos.slice(0, 2)) {
    const sourceDir = path.join(DATA_DIR, 'sources', video.id);
    if (!fs.existsSync(sourceDir)) fs.mkdirSync(sourceDir, { recursive: true });

    // Source record
    const record = {
      id: video.id,
      sourceClass: 'long_video',
      platform: 'youtube',
      url: video.url,
      title: video.title,
      capturedAt: '2026-05-04T00:00:00.000Z',
      canonicalId: video.videoId,
      metadata: { videoId: video.videoId }
    };
    fs.writeFileSync(path.join(sourceDir, 'record.json'), JSON.stringify(record, null, 2), 'utf-8');

    // English caption sentences
    const sentences = video.videoId === 'vid001'
      ? [
          { text: 'I would have done it differently.', start: 10.0, end: 13.5 },
          { text: 'Because she wanted to learn English.', start: 14.0, end: 17.2 },
          { text: 'They would have gone to the park.', start: 20.0, end: 23.0 }
        ]
      : [
          { text: 'He said he would have come earlier.', start: 5.0, end: 8.5 },
          { text: 'Because the weather was nice.', start: 9.0, end: 11.5 }
        ];

    const captionEnDir = path.join(sourceDir, 'captions', 'en');
    if (!fs.existsSync(captionEnDir)) fs.mkdirSync(captionEnDir, { recursive: true });
    fs.writeFileSync(
      path.join(captionEnDir, 'transcript-sentences.json'),
      JSON.stringify(sentences, null, 2),
      'utf-8'
    );

    // Transcript manifest
    const transcriptManifest = {
      sourceType: 'platform_caption',
      status: 'refined',
      language: 'en',
      engine: 'youtube-innertube (English (auto-generated))',
      captionVariants: [{
        language: 'en',
        label: '英文',
        isTranslated: false,
        rawPath: `data/sources/${video.id}/captions/en/transcript-raw.json`,
        sentencesPath: `data/sources/${video.id}/captions/en/transcript-sentences.json`
      }],
      generatedAt: '2026-05-04T00:00:00.000Z'
    };
    fs.writeFileSync(
      path.join(sourceDir, 'transcript-manifest.json'),
      JSON.stringify(transcriptManifest, null, 2),
      'utf-8'
    );
  }

  // vid003: no source directory (simulates not-yet-captured video)

  // vid004: source exists but has malformed caption JSON
  const malformedSourceDir = path.join(DATA_DIR, 'sources', 'yt-vid004');
  if (!fs.existsSync(malformedSourceDir)) fs.mkdirSync(malformedSourceDir, { recursive: true });
  const malformedRecord = {
    id: 'yt-vid004',
    sourceClass: 'long_video',
    platform: 'youtube',
    url: 'https://www.youtube.com/watch?v=vid004',
    title: 'Test Video Four (malformed)',
    capturedAt: '2026-05-04T00:00:00.000Z',
    canonicalId: 'vid004',
    metadata: { videoId: 'vid004' }
  };
  fs.writeFileSync(path.join(malformedSourceDir, 'record.json'), JSON.stringify(malformedRecord, null, 2), 'utf-8');
  const malformedCaptionDir = path.join(malformedSourceDir, 'captions', 'en');
  if (!fs.existsSync(malformedCaptionDir)) fs.mkdirSync(malformedCaptionDir, { recursive: true });
  fs.writeFileSync(path.join(malformedCaptionDir, 'transcript-sentences.json'), '{invalid json content!!!', 'utf-8');
  fs.writeFileSync(
    path.join(malformedSourceDir, 'transcript-manifest.json'),
    JSON.stringify({
      sourceType: 'platform_caption', status: 'refined', language: 'en', engine: 'auto',
      captionVariants: [{ language: 'en' }], generatedAt: '2026-05-04T00:00:00.000Z'
    }, null, 2),
    'utf-8'
  );
}

function cleanupFixtures(): void {
  // Remove test channel
  const channelDir = path.join(DATA_DIR, 'channels', FIXTURE_CHANNEL_ID);
  if (fs.existsSync(channelDir)) fs.rmSync(channelDir, { recursive: true, force: true });

  // Remove test sources
  for (const sid of ['yt-vid001', 'yt-vid002', 'yt-vid003', 'yt-vid004']) {
    const sourceDir = path.join(DATA_DIR, 'sources', sid);
    if (fs.existsSync(sourceDir)) fs.rmSync(sourceDir, { recursive: true, force: true });
  }

  // Remove test index
  if (fs.existsSync(FIXTURE_INDEX_DIR)) fs.rmSync(FIXTURE_INDEX_DIR, { recursive: true, force: true });
}

function runCli(args: string): string {
  return execSync(`${CLI_CMD} ${args}`, {
    cwd: REPO_ROOT,
    encoding: 'utf-8',
    timeout: 30_000,
    env: { ...process.env, DATA_DIR: DATA_DIR }
  });
}

function tryRunCli(args: string): { stdout: string; stderr: string; exitCode: number } {
  try {
    const stdout = execSync(`${CLI_CMD} ${args}`, {
      cwd: REPO_ROOT,
      encoding: 'utf-8',
      timeout: 30_000,
      stdio: ['pipe', 'pipe', 'pipe'],
      env: { ...process.env, DATA_DIR: DATA_DIR }
    });
    return { stdout, stderr: '', exitCode: 0 };
  } catch (e: any) {
    return {
      stdout: e.stdout?.toString() || '',
      stderr: e.stderr?.toString() || '',
      exitCode: e.status || 1
    };
  }
}

// --- Part 1: Build Index ---
function testBuildIndex(): void {
  console.log('\n=== Part 1: Build Index ===');

  const result = tryRunCli(`sentence-index build --channel ${FIXTURE_CHANNEL_ID} --language en`);
  assert(result.exitCode === 0, `Build command exits 0 (got ${result.exitCode})`);

  // Check files exist
  const jsonlPath = path.join(FIXTURE_INDEX_DIR, 'english-sentences.jsonl');
  const manifestPath = path.join(FIXTURE_INDEX_DIR, 'english-sentences-manifest.json');
  assert(fs.existsSync(jsonlPath), 'english-sentences.jsonl exists');
  assert(fs.existsSync(manifestPath), 'english-sentences-manifest.json exists');

  // Parse manifest
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  assert(manifest.channelId === FIXTURE_CHANNEL_ID, `Manifest channelId matches`);
  assert(manifest.language === 'en', 'Manifest language is en');
  assert(manifest.sourceCount === 2, `Manifest sourceCount is 2 (got ${manifest.sourceCount})`);
  assert(typeof manifest.sentenceCount === 'number' && manifest.sentenceCount > 0, `Manifest sentenceCount > 0 (got ${manifest.sentenceCount})`);
  assert(manifest.skippedCount === 1, `Manifest skippedCount is 1 (got ${manifest.skippedCount})`);
  assert(manifest.failedCount === 1, `Manifest failedCount is 1 (got ${manifest.failedCount})`);
  assert(manifest.warnings.length > 0, `Manifest has warnings for malformed source (got ${manifest.warnings.length})`);
  assert(manifest.warnings.some(w => w.includes('vid004') && w.includes('malformed')),
    `Warning mentions vid004 and malformed (got: ${manifest.warnings.join('; ')})`);

  // Parse JSONL
  const jsonlContent = fs.readFileSync(jsonlPath, 'utf-8');
  const lines = jsonlContent.trim().split('\n').filter(Boolean);
  assert(lines.length === manifest.sentenceCount, `JSONL lines match sentenceCount (${lines.length} vs ${manifest.sentenceCount})`);

  // Validate first entry
  const firstEntry = JSON.parse(lines[0]);
  assert(firstEntry.indexVersion === 1, 'Entry has indexVersion 1');
  assert(firstEntry.sourceId === 'yt-vid001', `Entry sourceId is yt-vid001 (got ${firstEntry.sourceId})`);
  assert(firstEntry.videoId === 'vid001', 'Entry videoId is vid001');
  assert(firstEntry.channelId === FIXTURE_CHANNEL_ID, 'Entry channelId matches');
  assert(firstEntry.channelTitle === 'Test English Channel', 'Entry channelTitle matches');
  assert(typeof firstEntry.start === 'number', 'Entry has numeric start');
  assert(typeof firstEntry.end === 'number', 'Entry has numeric end');
  assert(typeof firstEntry.text === 'string' && firstEntry.text.length > 0, 'Entry has text');
  assert(firstEntry.normalizedText === firstEntry.text.toLowerCase().trim(), 'Entry normalizedText matches');
  assert(firstEntry.captionLanguage === 'en', 'Entry captionLanguage is en');
  assert(firstEntry.captionKind === 'auto', `Entry captionKind is auto (got ${firstEntry.captionKind})`);
}

// --- Part 2: Idempotent Build ---
function testIdempotentBuild(): void {
  console.log('\n=== Part 2: Idempotent Build ===');

  // Build again
  const result = tryRunCli(`sentence-index build --channel ${FIXTURE_CHANNEL_ID} --language en`);
  assert(result.exitCode === 0, `Second build exits 0`);

  const manifest = JSON.parse(
    fs.readFileSync(path.join(FIXTURE_INDEX_DIR, 'english-sentences-manifest.json'), 'utf-8')
  );

  // Read JSONL and verify no duplication
  const jsonl = fs.readFileSync(path.join(FIXTURE_INDEX_DIR, 'english-sentences.jsonl'), 'utf-8');
  const lines = jsonl.trim().split('\n').filter(Boolean);

  assert(lines.length === manifest.sentenceCount, `JSONL row count matches manifest after rebuild (${lines.length})`);
  assert(manifest.sourceCount === 2, `Manifest sourceCount unchanged (got ${manifest.sourceCount})`);
}

// --- Part 3: Search ---
function testSearch(): void {
  console.log('\n=== Part 3: Search ===');

  // Phrase search
  const phraseResult = tryRunCli(`sentence-index search "would have" --channel ${FIXTURE_CHANNEL_ID} --language en --limit 20 --json`);
  assert(phraseResult.exitCode === 0, `Phrase search exits 0 (got ${phraseResult.exitCode})`);

  // Parse JSON output - find the JSON array in stdout
  const phraseMatches = extractJson(phraseResult.stdout);
  assert(Array.isArray(phraseMatches), `Phrase search returns JSON array (got ${typeof phraseMatches})`);
  if (Array.isArray(phraseMatches)) {
    assert(phraseMatches.length === 3, `Phrase "would have" finds 3 results (got ${phraseMatches.length})`);

    // Verify result structure
    if (phraseMatches.length > 0) {
      const first = phraseMatches[0];
      assert(first.entry !== undefined, 'Result has entry field');
      assert(first.youtubeTimestampUrl !== undefined, 'Result has youtubeTimestampUrl');
      assert(first.youtubeTimestampUrl.includes('youtube.com/watch'), 'Timestamp URL includes youtube.com');
      assert(first.youtubeTimestampUrl.includes('t='), 'Timestamp URL includes t= parameter');
    }
  }

  // Single word search
  const wordResult = tryRunCli(`sentence-index search "because" --channel ${FIXTURE_CHANNEL_ID} --language en --limit 20 --json`);
  assert(wordResult.exitCode === 0, `Word search exits 0`);
  const wordMatches = extractJson(wordResult.stdout);
  assert(Array.isArray(wordMatches) && wordMatches.length === 2, `Word "because" finds 2 results (got ${wordMatches?.length ?? 'null'})`);

  // Limit test
  const limitedResult = tryRunCli(`sentence-index search "would have" --channel ${FIXTURE_CHANNEL_ID} --language en --limit 1 --json`);
  const limitedMatches = extractJson(limitedResult.stdout);
  assert(Array.isArray(limitedMatches) && limitedMatches.length === 1, `Limit 1 returns 1 result (got ${limitedMatches?.length ?? 'null'})`);
}

// --- Part 4: Error Handling ---
function testErrorHandling(): void {
  console.log('\n=== Part 4: Error Handling ===');

  // Search without build for nonexistent channel
  const noIndex = tryRunCli(`sentence-index search "test" --channel nonexistent-channel --language en --json`);
  assert(noIndex.exitCode !== 0, 'Search on nonexistent channel fails');

  // Unsupported language on build
  const badLang = tryRunCli(`sentence-index build --channel ${FIXTURE_CHANNEL_ID} --language fr`);
  assert(badLang.exitCode !== 0, 'Build with unsupported language fails');
  const output = badLang.stdout + badLang.stderr;
  assert(output.toLowerCase().includes('english') || output.toLowerCase().includes('unsupported') || output.toLowerCase().includes('en'),
    'Error message mentions English/en requirement');

  // Unsupported language on search
  const badSearchLang = tryRunCli(`sentence-index search "test" --channel ${FIXTURE_CHANNEL_ID} --language fr --json`);
  assert(badSearchLang.exitCode !== 0, 'Search with unsupported language fails');
}

function extractJson(stdout: string): any {
  const trimmed = stdout.trim();

  // Try parsing entire output as JSON
  try { return JSON.parse(trimmed); } catch {}

  // Find the top-level JSON array using bracket depth scanning
  const lastBracket = trimmed.lastIndexOf(']');
  if (lastBracket > -1) {
    let depth = 0;
    for (let i = lastBracket; i >= 0; i--) {
      if (trimmed[i] === ']') depth++;
      if (trimmed[i] === '[') depth--;
      if (depth === 0) {
        try { return JSON.parse(trimmed.substring(i, lastBracket + 1)); } catch {}
        break;
      }
    }
  }

  // Find the top-level JSON object using brace depth scanning
  const lastBrace = trimmed.lastIndexOf('}');
  if (lastBrace > -1) {
    let depth = 0;
    for (let i = lastBrace; i >= 0; i--) {
      if (trimmed[i] === '}') depth++;
      if (trimmed[i] === '{') depth--;
      if (depth === 0) {
        try { return JSON.parse(trimmed.substring(i, lastBrace + 1)); } catch {}
        break;
      }
    }
  }

  return null;
}

// --- Main ---
console.log('Stage 4: English Sentence Index Verification\n');

// Clean up any previous run
cleanupFixtures();

try {
  setupFixtures();
  testBuildIndex();
  testIdempotentBuild();
  testSearch();
  testErrorHandling();
} finally {
  cleanupFixtures();
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
process.exit(failed > 0 ? 1 : 0);
