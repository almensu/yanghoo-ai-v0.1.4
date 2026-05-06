import { listLearningChannelsUseCase } from '@yanghoo/application';
import type { CliContext } from '../cli-runtime-config.js';
import { printResult } from '../cli-output-renderer.js';

export async function runLearningChannelsCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand] = args;

  if (subcommand === 'list') {
    const channels = await listLearningChannelsUseCase();
    printResult(context, { channels }, `Found ${channels.length} channels.`);
    return;
  }

  throw new Error(`Unknown learning-channels subcommand: ${subcommand}`);
}
