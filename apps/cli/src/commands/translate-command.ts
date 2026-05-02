import { documentStorage } from '@yanghoo/storage';
import type { CliContext } from '../cli-runtime-config.js';
import { parseCommandArgs, readBooleanFlag, readStringFlag } from '../cli-runtime-config.js';
import { formatReadinessLines, printResult, readinessSummary } from '../cli-output-renderer.js';

export async function runTranslateCommand(args: string[], context: CliContext): Promise<void> {
  const parsed = parseCommandArgs(args);
  const sourceId = parsed.positional[0];
  if (!sourceId) throw new Error('Usage: yanghoo translate <sourceId> --model <modelName>');

  const modelId = readStringFlag(parsed.flags, 'model');
  const force = readBooleanFlag(parsed.flags, 'force');
  const { translateSourceDocumentUseCase } = await import('@yanghoo/application');
  const translatedPath = await translateSourceDocumentUseCase(sourceId, { modelId, force });
  const readiness = await documentStorage.getDocumentReadiness(sourceId);

  printResult(
    context,
    { translatedPath, readiness: readinessSummary(readiness) },
    [
      `已生成中文翻译: ${translatedPath}`,
      '',
      ...formatReadinessLines(readiness)
    ]
  );
}
