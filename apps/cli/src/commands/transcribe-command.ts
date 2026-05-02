import { documentStorage } from '@yanghoo/storage';
import type { CliContext } from '../cli-runtime-config.js';
import { formatReadinessLines, printResult, readinessSummary } from '../cli-output-renderer.js';

export async function runTranscribeCommand(args: string[], context: CliContext): Promise<void> {
  const sourceId = args[0];
  if (!sourceId) throw new Error('Usage: yanghoo transcribe <sourceId>');

  const readinessBefore = await documentStorage.getDocumentReadiness(sourceId);
  const application = await import('@yanghoo/application');
  const transcript = readinessBefore.hasMedia
    ? await application.transcribeSourceMediaUseCase(sourceId)
    : await application.transcribeAudioUseCase(sourceId);
  const readiness = await documentStorage.getDocumentReadiness(sourceId);

  printResult(
    context,
    { transcript, readiness: readinessSummary(readiness) },
    [
      `已完成转录: ${transcript.id}`,
      `来源: ${transcript.sourceType}`,
      '',
      ...formatReadinessLines(readiness)
    ]
  );
}
