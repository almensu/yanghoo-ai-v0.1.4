#!/usr/bin/env npx tsx
import { captureSourceUseCase } from '@yanghoo/application';

async function main() {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: collect-apple-podcast-url.ts <URL>');
    process.exit(1);
  }

  try {
    const source = await captureSourceUseCase(url);
    console.log('Success!');
    console.log(JSON.stringify(source, null, 2));
  } catch (error) {
    console.error('Failed to capture source:', error);
    process.exit(1);
  }
}

main();