#!/usr/bin/env npx tsx
import { captureSourceUseCase } from '../../packages/application/src/index.js';

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: collect-x-url.ts <URL>');
    process.exit(1);
  }

  try {
    const source = await captureSourceUseCase(url);
    console.log('Success!');
    console.log(JSON.stringify(source, null, 2));
  } catch (error) {
    console.error('Failed to capture X source:', error);
    process.exit(1);
  }
}

main();
