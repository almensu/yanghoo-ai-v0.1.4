import { refineTranscriptSentences } from '../../packages/transcript/src/index.js';

const testCases = [
  {
    name: 'two complete sentences',
    input: [
      { start: 0, end: 5, text: 'First sentence.' },
      { start: 5, end: 9, text: 'Second sentence.' }
    ],
    expectedCount: 2
  },
  {
    name: 'merged fragments',
    input: [
      { start: 0, end: 2, text: 'This is' },
      { start: 2, end: 5, text: 'a fragment.' },
      { start: 5, end: 9, text: 'And another.' }
    ],
    expectedCount: 2
  },
  {
    name: 'chinese punctuation',
    input: [
      { start: 0, end: 5, text: '第一句话。' },
      { start: 5, end: 9, text: '第二句话！' }
    ],
    expectedCount: 2
  },
  {
    name: 'unterminated final fragment',
    input: [
      { start: 0, end: 5, text: 'Finished.' },
      { start: 5, end: 9, text: 'Not finished' }
    ],
    expectedCount: 2
  }
];

let failed = false;

for (const tc of testCases) {
  const output = refineTranscriptSentences(tc.input as any);
  if (output.length !== tc.expectedCount) {
    console.error(`FAIL [${tc.name}]: expected ${tc.expectedCount} segments, got ${output.length}`);
    console.error('Output:', JSON.stringify(output, null, 2));
    failed = true;
  } else {
    console.log(`PASS [${tc.name}]`);
  }
}

if (failed) {
  process.exit(1);
} else {
  console.log('All refiner tests passed!');
}
