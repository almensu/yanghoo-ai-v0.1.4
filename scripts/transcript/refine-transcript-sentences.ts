#!/usr/bin/env npx tsx
import { ensureTranscriptUseCase } from '../../packages/application/src/index.js';

async function main() {
  const sourceId = process.argv[2];
  if (!sourceId) {
    console.error('Usage: refine-transcript-sentences.ts <SourceID>');
    process.exit(1);
  }

  try {
    const asset = await ensureTranscriptUseCase(sourceId);
    console.log('Success!');
    console.log(`Transcript Status: ${asset.status}`);
    console.log(`Assets generated in data/sources/${sourceId}/`);
  } catch (error) {
    console.error('Failed to refine transcript:', error);
    process.exit(1);
  }
}

main();
