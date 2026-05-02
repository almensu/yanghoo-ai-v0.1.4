import { documentStorage } from '@yanghoo/storage';
import type { CliContext } from '../cli-runtime-config.js';
import { formatReadinessLines, printResult, readinessSummary } from '../cli-output-renderer.js';

export async function runTranscriptCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand, sourceId] = args;
  if (subcommand !== 'ensure' || !sourceId) {
    throw new Error('Usage: yanghoo transcript ensure <sourceId>');
  }

  const { ensureTranscriptUseCase } = await import('@yanghoo/application');
  const transcript = await ensureTranscriptUseCase(sourceId);
  const readiness = await documentStorage.getDocumentReadiness(sourceId);

  printResult(
    context,
    { transcript, readiness: readinessSummary(readiness) },
    [
      `已生成字幕: ${transcript.id}`,
      `来源: ${transcript.sourceType}`,
      '',
      ...formatReadinessLines(readiness)
    ]
  );
}
