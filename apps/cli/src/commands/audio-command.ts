import { documentStorage } from '@yanghoo/storage';
import type { CliContext } from '../cli-runtime-config.js';
import { formatReadinessLines, printResult, readinessSummary } from '../cli-output-renderer.js';

export async function runAudioCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand, sourceId] = args;
  if (subcommand !== 'fetch' || !sourceId) {
    throw new Error('Usage: yanghoo audio fetch <sourceId>');
  }

  const { fetchAudioUseCase } = await import('@yanghoo/application');
  const audio = await fetchAudioUseCase(sourceId);
  const readiness = await documentStorage.getDocumentReadiness(sourceId);

  printResult(
    context,
    { audio, readiness: readinessSummary(readiness) },
    [
      `已获取音频: ${audio.localPath || audio.sourceId}`,
      '',
      ...formatReadinessLines(readiness)
    ]
  );
}
