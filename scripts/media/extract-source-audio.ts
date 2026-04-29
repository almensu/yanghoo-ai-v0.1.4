import { extractSourceAudioUseCase } from '../../packages/application/src/extractSourceAudioUseCase.js';

async function main() {
  const sourceId = process.argv[2];
  if (!sourceId) {
    console.error('Usage: npx tsx scripts/media/extract-source-audio.ts <sourceId>');
    process.exit(1);
  }

  try {
    const asset = await extractSourceAudioUseCase(sourceId);
    console.log('Audio extracted successfully:', asset);
  } catch (error: any) {
    console.error('Extraction failed:', error.message);
    process.exit(1);
  }
}

main();
