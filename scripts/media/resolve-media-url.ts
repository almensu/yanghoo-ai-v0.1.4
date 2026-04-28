#!/usr/bin/env npx tsx
import { resolveSourceMediaUseCase } from '../../packages/application/src/index.js';

async function main() {
  const sourceId = process.argv[2];
  if (!sourceId) {
    console.error('Usage: resolve-media-url.ts <SourceID>');
    process.exit(1);
  }

  try {
    const asset = await resolveSourceMediaUseCase(sourceId);
    console.log('Success!');
    console.log(JSON.stringify(asset, null, 2));
  } catch (error) {
    console.error('Failed to resolve media URL:', error);
    process.exit(1);
  }
}

main();
