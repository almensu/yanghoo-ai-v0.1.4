import { transcribeAudioUseCase } from '../../packages/application/src/index.js';

async function main() {
  const sourceId = process.argv[2];
  if (!sourceId) {
    console.error('Usage: npx tsx scripts/transcript/transcribe-audio-mlx.ts <sourceId>');
    process.exit(1);
  }

  try {
    const asset = await transcribeAudioUseCase(sourceId);
    console.log('Transcription completed successfully:', asset.id);
  } catch (error: any) {
    console.error('Transcription failed:', error.message);
    process.exit(1);
  }
}

main();
