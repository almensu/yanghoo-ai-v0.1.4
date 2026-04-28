#!/usr/bin/env npx tsx
import { downloadSourceMediaUseCase } from '../../packages/application/src/index.js';

async function main() {
  const sourceId = process.argv[2];
  if (!sourceId) {
    console.error('Usage: download-source-media.ts <SourceID>');
    process.exit(1);
  }

  try {
    const asset = await downloadSourceMediaUseCase(sourceId);
    console.log('Success!');
    console.log(JSON.stringify(asset, null, 2));
  } catch (error) {
    console.error('Failed to download source media:', error);
    process.exit(1);
  }
}

main();
