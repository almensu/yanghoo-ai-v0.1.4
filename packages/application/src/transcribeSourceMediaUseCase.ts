import { TranscriptAsset } from '@yanghoo/domain';
import { extractSourceAudioUseCase } from './extractSourceAudioUseCase.js';
import { transcribeAudioUseCase } from './index.js';

/**
 * Use Case: Transcribe a downloaded media file.
 * Orchestrates: Media -> Extract Audio -> Transcribe Audio.
 */
export async function transcribeSourceMediaUseCase(sourceId: string): Promise<TranscriptAsset> {
  console.log(`[UseCase] transcribeSourceMediaUseCase for source: ${sourceId}`);

  // 1. Extract audio if not already done or just always run to ensure fresh wav
  await extractSourceAudioUseCase(sourceId);

  // 2. Transcribe the extracted audio
  return transcribeAudioUseCase(sourceId);
}
