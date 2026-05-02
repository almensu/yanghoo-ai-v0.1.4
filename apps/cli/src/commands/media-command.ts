import { documentStorage } from '@yanghoo/storage';
import type { CliContext } from '../cli-runtime-config.js';
import { formatReadinessLines, printResult, readinessSummary } from '../cli-output-renderer.js';

export async function runMediaCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand, sourceId] = args;
  if (subcommand !== 'download' || !sourceId) {
    throw new Error('Usage: yanghoo media download <sourceId>');
  }

  const { downloadSourceMediaUseCase } = await import('@yanghoo/application');
  const media = await downloadSourceMediaUseCase(sourceId);
  const readiness = await documentStorage.getDocumentReadiness(sourceId);

  printResult(
    context,
    { media, readiness: readinessSummary(readiness) },
    [
      `已下载媒体: ${media.localPath || media.sourceId}`,
      `类型: ${media.mediaKind}`,
      `包含音频: ${media.hasAudio ? 'yes' : 'no'}`,
      '',
      ...formatReadinessLines(readiness)
    ]
  );
}
