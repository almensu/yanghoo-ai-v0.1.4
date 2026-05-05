import { buildEnglishSentenceIndexUseCase, searchEnglishSentenceIndexUseCase } from '@yanghoo/application';
import type { CliContext } from '../cli-runtime-config.js';
import { printResult } from '../cli-output-renderer.js';

export async function runSentenceIndexCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand, ...rest] = args;

  if (subcommand === 'build') {
    await buildIndex(rest, context);
    return;
  }

  if (subcommand === 'search') {
    await searchIndex(rest, context);
    return;
  }

  throw new Error('Usage: yanghoo sentence-index build --channel <channelId> [--language en]\n       yanghoo sentence-index search "query" --channel <channelId> [--language en] [--limit 20] [--json]');
}

async function buildIndex(args: string[], context: CliContext): Promise<void> {
  let channelId = '';
  let language = 'en';

  const channelIndex = args.indexOf('--channel');
  if (channelIndex !== -1) {
    channelId = args[channelIndex + 1];
    args.splice(channelIndex, 2);
  }

  const langIndex = args.indexOf('--language');
  if (langIndex !== -1) {
    language = args[langIndex + 1];
    args.splice(langIndex, 2);
  }

  if (!channelId) throw new Error('Usage: yanghoo sentence-index build --channel <channelId> [--language en]');

  if (!context.json) {
    console.log(`Building sentence index for channel: ${channelId} (language: ${language})`);
  }

  const result = await buildEnglishSentenceIndexUseCase(channelId, language);

  printResult(
    context,
    result,
    [
      `Sentence index built successfully!`,
      `Channel: ${result.channelId}`,
      `Sources indexed: ${result.sourceCount}`,
      `Sentences: ${result.sentenceCount}`,
      `Skipped: ${result.skippedCount}`,
      `Failed: ${result.failedCount}`,
      ...(result.warnings.length > 0 ? ['Warnings:', ...result.warnings.map(w => `  - ${w}`)] : [])
    ]
  );
}

async function searchIndex(args: string[], context: CliContext): Promise<void> {
  let channelId = '';
  let language = 'en';
  let limit = 50;

  // First arg is the query (may contain spaces, but quoted by shell)
  const query = args.find(a => !a.startsWith('--') && !channelId);
  if (!query) throw new Error('Usage: yanghoo sentence-index search "query" --channel <channelId> [--language en] [--limit 20]');

  const channelIndex = args.indexOf('--channel');
  if (channelIndex !== -1) {
    channelId = args[channelIndex + 1];
  }

  const langIndex = args.indexOf('--language');
  if (langIndex !== -1) {
    language = args[langIndex + 1];
  }

  const limitIndex = args.indexOf('--limit');
  if (limitIndex !== -1) {
    limit = parseInt(args[limitIndex + 1], 10);
  }

  if (!channelId) throw new Error('Usage: yanghoo sentence-index search "query" --channel <channelId> [--language en]');

  if (!context.json) {
    console.log(`Searching "${query}" in channel: ${channelId} (language: ${language}, limit: ${limit})`);
  }

  const { results } = await searchEnglishSentenceIndexUseCase({
    channelId,
    language,
    query,
    limit
  });

  if (context.json) {
    process.stdout.write(JSON.stringify(results, null, 2) + '\n');
  } else {
    if (results.length === 0) {
      console.log('No results found.');
      return;
    }
    console.log(`Found ${results.length} result(s):\n`);
    for (const r of results) {
      const e = r.entry;
      console.log(`[${e.videoId} t=${e.start.toFixed(1)}s] ${e.title || 'Untitled'}`);
      console.log(`  "${e.text}"`);
      console.log(`  ${r.youtubeTimestampUrl}`);
      console.log();
    }
  }
}
