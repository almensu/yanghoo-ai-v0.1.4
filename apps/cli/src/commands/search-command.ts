import type { CliContext } from '../cli-runtime-config.js';
import { parseCommandArgs, readNumberFlag } from '../cli-runtime-config.js';
import { printResult, truncate } from '../cli-output-renderer.js';

export async function runSearchCommand(args: string[], context: CliContext): Promise<void> {
  const parsed = parseCommandArgs(args);
  const query = parsed.positional.join(' ').trim();
  if (!query) throw new Error('Usage: yanghoo search <query> [--limit 30]');

  const limit = readNumberFlag(parsed.flags, 'limit');
  const { searchDocumentsUseCase } = await import('@yanghoo/application');
  const results = await searchDocumentsUseCase({ query, limit });

  printResult(
    context,
    { query, results },
    results.length
      ? results.flatMap((result, index) => [
          `${index + 1}. [${result.platform}] ${result.title}${result.timestamp ? ` @ ${result.timestamp}` : ''}`,
          `   ${truncate(result.snippet)}`,
          result.playbackUrl ? `   ${result.playbackUrl}` : ''
        ]).filter(Boolean)
      : `没有找到: ${query}`
  );
}
