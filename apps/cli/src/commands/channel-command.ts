import { captureChannelUseCase, syncChannelCaptionsUseCase, validateLanguage } from '@yanghoo/application';
import type { CliContext } from '../cli-runtime-config.js';
import { printResult } from '../cli-output-renderer.js';

export async function runChannelCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand, ...rest] = args;

  if (subcommand === 'add') {
    await captureChannel(rest, context);
    return;
  }

  if (subcommand === 'captions') {
    await syncChannelCaptions(rest, context);
    return;
  }

  throw new Error('Usage: yanghoo channel add <url> [--limit <number>]\n       yanghoo channel captions <channelId> [--language <lang>] [--batch-size <number>] [--limit <number>] [--resume] [--retry-failed] [--force]');
}

async function captureChannel(args: string[], context: CliContext): Promise<void> {
  const limitIndex = args.indexOf('--limit');
  let limit: number | undefined;
  if (limitIndex !== -1) {
    limit = parseInt(args[limitIndex + 1], 10);
    args.splice(limitIndex, 2);
  }

  const input = args.join(' ').trim();
  if (!input) throw new Error('Usage: yanghoo channel add <url> [--limit <number>]');

  if (!context.json) {
    console.log(`正在获取频道信息: ${input}`);
  }
  const result = await captureChannelUseCase(input, { limit });

  printResult(
    context,
    result,
    [
      `Channel captured successfully!`,
      `Channel ID: ${result.manifest.id}`,
      `Title: ${result.manifest.title}`,
      `Discovered ${result.videosCount} videos.`
    ]
  );
}

async function syncChannelCaptions(args: string[], context: CliContext): Promise<void> {
  let batchSize: number | undefined;
  let language = 'en';
  let resume = false;
  let retryFailed = false;
  let force = false;

  // Parse --batch-size
  const batchIndex = args.indexOf('--batch-size');
  if (batchIndex !== -1) {
    batchSize = parseInt(args[batchIndex + 1], 10);
    args.splice(batchIndex, 2);
  }

  // Parse --limit (alias for --batch-size for backward compat)
  const limitIndex = args.indexOf('--limit');
  if (limitIndex !== -1 && batchSize === undefined) {
    batchSize = parseInt(args[limitIndex + 1], 10);
    args.splice(limitIndex, 2);
  }

  // Default batch size
  if (batchSize === undefined) batchSize = 20;

  // Parse --language
  const langIndex = args.indexOf('--language');
  if (langIndex !== -1) {
    language = args[langIndex + 1];
    args.splice(langIndex, 2);
  }

  // Parse flags
  if (args.includes('--resume')) {
    resume = true;
    args.splice(args.indexOf('--resume'), 1);
  }
  if (args.includes('--retry-failed')) {
    retryFailed = true;
    args.splice(args.indexOf('--retry-failed'), 1);
  }
  if (args.includes('--force')) {
    force = true;
    args.splice(args.indexOf('--force'), 1);
  }

  const channelId = args.join(' ').trim();
  if (!channelId) throw new Error('Usage: yanghoo channel captions <channelId> [--language <lang>] [--batch-size <number>] [--resume] [--retry-failed] [--force]');

  validateLanguage(language);

  if (!context.json) {
    console.log(`正在同步频道字幕: ${channelId} (语言: ${language}, 批次: ${batchSize}${resume ? ', 续传' : ''}${retryFailed ? ', 重试失败' : ''})`);
  }

  const result = await syncChannelCaptionsUseCase(channelId, {
    language,
    batchSize,
    resume,
    retryFailed,
    force
  });

  printResult(
    context,
    result,
    [
      `Channel captions sync completed!`,
      `Processed: ${result.processed}`,
      `Succeeded: ${result.succeeded}`,
      `Failed: ${result.failed}`,
      `Skipped: ${result.skipped}`,
      ...(result.failed > 0 ? ['Failures:', ...result.items.filter(i => i.status === 'failed').map((f: any) => `  ${f.videoId}: ${f.failureKind} - ${f.errorMessage}`)] : [])
    ]
  );
}
