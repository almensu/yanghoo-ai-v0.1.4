/**
 * Stage 26 Verification: English Search Deeplink Command
 *
 * Proves:
 * 1. english-search url "Linux" returns correct URL.
 * 2. spaces and Chinese queries encode correctly.
 * 3. urls command processes scene-brief JSON.
 * 4. optional params (limit, category, tag, channels) appear in URL.
 */

import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';

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

function runCli(args: string[]): any {
  const res = spawnSync('npm', ['run', '-s', 'cli', '--', ...args, '--json'], { encoding: 'utf-8' });
  if (res.status !== 0) {
    throw new Error(`CLI failed with status ${res.status}: ${res.stderr}`);
  }
  try {
    return JSON.parse(res.stdout);
  } catch (e) {
    throw new Error(`Failed to parse CLI output as JSON: ${res.stdout}`);
  }
}

async function testSingleUrl() {
  console.log('\n=== Single URL Generation ===');

  const res = runCli(['english-search', 'url', 'Linux']);
  assert(res.query === 'Linux', 'Query preserved');
  assert(res.url.includes('view=english-search'), 'Includes view=english-search');
  assert(res.url.includes('q=Linux'), 'Includes q=Linux');

  const res2 = runCli(['english-search', 'url', 'wake up child']);
  assert(res2.url.includes('q=wake+up+child') || res2.url.includes('q=wake%20up%20child'), 'Spaces encoded');

  const res3 = runCli(['english-search', 'url', '小孩 起床']);
  assert(res3.url.includes('q=%E5%B0%8F%E5%AD%A9+%E8%B5%B7%E5%BA%8A') || res3.url.includes('q=%E5%B0%8F%E5%AD%A9%20%E8%B5%B7%E5%BA%8A'), 'Chinese encoded');
}

async function testUrlParams() {
  console.log('\n=== URL Parameters ===');

  const res = runCli([
    'english-search', 'url', 'Linux',
    '--limit', '50',
    '--category', 'Education',
    '--tag', 'Tutorial',
    '--channels', 'ch1,ch2'
  ]);

  assert(res.url.includes('limit=50'), 'Includes limit=50');
  assert(res.url.includes('category=Education'), 'Includes category=Education');
  assert(res.url.includes('tag=Tutorial'), 'Includes tag=Tutorial');
  assert(res.url.includes('channels=ch1%2Cch2'), 'Includes channels=ch1,ch2');
}

async function testBatchUrls() {
  console.log('\n=== Batch URLs from Scene Brief ===');

  const briefPath = path.join(process.cwd(), 'tmp', 'test-scene-brief-26.json');
  if (!fs.existsSync(path.dirname(briefPath))) {
    fs.mkdirSync(path.dirname(briefPath), { recursive: true });
  }
  const brief = {
    kind: 'scene-brief',
    id: 'test-26',
    scene: 'Test.Scene26',
    queries: ['hello', 'world']
  };
  fs.writeFileSync(briefPath, JSON.stringify(brief));

  const res = runCli(['english-search', 'urls', briefPath]);
  assert(res.briefId === 'test-26', 'Brief ID preserved');
  assert(res.urls.length === 2, 'Generated 2 URLs');
  assert(res.urls[0].query === 'hello', 'First query correct');
  assert(res.urls[0].url.includes('q=hello'), 'First URL correct');

  fs.unlinkSync(briefPath);
}

async function main() {
  console.log('Stage 26 Verification: English Search Deeplink Command\n');

  try {
    await testSingleUrl();
    await testUrlParams();
    await testBatchUrls();
  } catch (err: any) {
    console.error('Test error:', err);
    failed++;
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log(`${'='.repeat(50)}`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
