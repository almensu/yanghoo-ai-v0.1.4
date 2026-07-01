import * as fs from 'fs';
import { searchEnglishSentenceIndexUseCase, listLearningChannelsUseCase } from '@yanghoo/application';
import { parseCommandArgs, readStringFlag, readNumberFlag } from '../cli-runtime-config.js';
import type { CliContext } from '../cli-runtime-config.js';
import { printResult } from '../cli-output-renderer.js';

export async function runEnglishSearchCommand(args: string[], context: CliContext): Promise<void> {
  const [firstArg, ...rest] = args;

  if (!firstArg) {
    throw new Error('english-search requires a query or "batch" subcommand');
  }

  if (firstArg === 'batch') {
    await handleBatchSearch(rest, context);
    return;
  }

  if (firstArg === 'url') {
    await handleUrlHelper(rest, context);
    return;
  }

  if (firstArg === 'urls') {
    await handleUrlsHelper(rest, context);
    return;
  }

  await handleSingleSearch([firstArg, ...rest], context);
}

async function handleUrlHelper(args: string[], context: CliContext): Promise<void> {
  const parsed = parseCommandArgs(args);
  const query = parsed.positional[0];
  if (!query) throw new Error('url command requires a query string');

  const baseUrl = readStringFlag(parsed.flags, 'base-url') ?? 'http://127.0.0.1:3000';
  const limit = readNumberFlag(parsed.flags, 'limit');
  const category = readStringFlag(parsed.flags, 'category');
  const tag = readStringFlag(parsed.flags, 'tag');
  const channels = readStringFlag(parsed.flags, 'channels');
  const open = parsed.flags.has('open');

  const url = buildSearchUrl(baseUrl, { query, limit, category, tag, channels });

  if (open) {
    const { spawnSync } = await import('child_process');
    spawnSync('open', [url]);
  }

  printResult(context, { query, url }, `English Search URL:\n${url}`);
}

async function handleUrlsHelper(args: string[], context: CliContext): Promise<void> {
  const parsed = parseCommandArgs(args);
  const jsonPath = parsed.positional[0];
  if (!jsonPath) throw new Error('urls command requires a path to scene-brief.json');

  const baseUrl = readStringFlag(parsed.flags, 'base-url') ?? 'http://127.0.0.1:3000';
  const limit = readNumberFlag(parsed.flags, 'limit');
  const category = readStringFlag(parsed.flags, 'category');
  const tag = readStringFlag(parsed.flags, 'tag');
  const channels = readStringFlag(parsed.flags, 'channels');
  const openFirst = parsed.flags.has('open-first');

  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const brief = JSON.parse(fileContent);

  if (brief.kind !== 'scene-brief' || !Array.isArray(brief.queries)) {
    throw new Error('Invalid scene-brief format');
  }

  const result = {
    briefId: brief.id,
    scene: brief.scene,
    urls: brief.queries.map((q: any) => ({
      query: String(q),
      url: buildSearchUrl(baseUrl, { query: String(q), limit, category, tag, channels })
    }))
  };

  if (openFirst && result.urls.length > 0) {
    const { spawnSync } = await import('child_process');
    spawnSync('open', [result.urls[0].url]);
  }

  const human = result.urls.map((u: any) => `${u.query}: ${u.url}`).join('\n');
  printResult(context, result, `Generated ${result.urls.length} English Search URLs:\n${human}`);
}

function buildSearchUrl(baseUrl: string, params: {
  query: string;
  limit?: number;
  category?: string;
  tag?: string;
  channels?: string;
}): string {
  const url = new URL(baseUrl);
  url.searchParams.set('view', 'english-search');
  url.searchParams.set('q', params.query);
  if (params.limit) url.searchParams.set('limit', String(params.limit));
  if (params.category) url.searchParams.set('category', params.category);
  if (params.tag) url.searchParams.set('tag', params.tag);
  if (params.channels) url.searchParams.set('channels', params.channels);
  return url.toString();
}

async function resolveChannels(
  channelFlag?: string,
  channelsFlag?: string,
  categoryFlag?: string,
  tagFlag?: string
): Promise<string[]> {
  if (channelFlag) return [channelFlag];
  if (channelsFlag) return channelsFlag.split(',').map(s => s.trim()).filter(Boolean);

  if (categoryFlag || tagFlag) {
    const channels = await listLearningChannelsUseCase();
    return channels.filter(ch => {
      if (categoryFlag && ch.category !== categoryFlag) return false;
      if (tagFlag && !ch.tags.includes(tagFlag)) return false;
      return true;
    }).map(ch => ch.channelId);
  }

  throw new Error('Must specify --channel, --channels, or --category/--tag');
}

async function handleSingleSearch(args: string[], context: CliContext): Promise<void> {
  const parsed = parseCommandArgs(args);
  const query = parsed.positional[0];
  if (!query) throw new Error('english-search requires a query string');

  const channelFlag = readStringFlag(parsed.flags, 'channel');
  const channelsFlag = readStringFlag(parsed.flags, 'channels');
  const categoryFlag = readStringFlag(parsed.flags, 'category');
  const tagFlag = readStringFlag(parsed.flags, 'tag');
  const limit = readNumberFlag(parsed.flags, 'limit') ?? 20;

  const lang = readStringFlag(parsed.flags, 'language');
  if (lang && lang !== 'en') {
    throw new Error('Only English language ("en") is supported');
  }

  let channelIds: string[] = [];
  try {
    channelIds = await resolveChannels(channelFlag, channelsFlag, categoryFlag, tagFlag);
  } catch (err: any) {
    throw new Error(err.message);
  }

  if (channelIds.length === 0) {
    printResult(context, { query, results: [], warnings: ['No channels matched criteria for search'] }, `No channels matched criteria for search`);
    return;
  }

  const result = await searchEnglishSentenceIndexUseCase({
    channelIds,
    language: 'en',
    query,
    limit,
    diversity: 'balanced'
  });

  const formattedResults = result.results.map(r => ({
    channelId: r.entry.channelId,
    videoId: r.entry.videoId,
    sourceId: r.entry.sourceId,
    title: r.entry.title,
    text: r.entry.text,
    start: r.entry.start,
    youtubeTimestampUrl: r.youtubeTimestampUrl,
    captionKind: r.entry.captionKind
  }));

  printResult(context, {
    query,
    results: formattedResults,
    warnings: result.warnings
  }, `Found ${formattedResults.length} results for "${query}"`);
}

async function handleBatchSearch(args: string[], context: CliContext): Promise<void> {
  const parsed = parseCommandArgs(args);
  const jsonPath = parsed.positional[0];
  if (!jsonPath) throw new Error('batch search requires a path to scene-brief.json');

  const channelFlag = readStringFlag(parsed.flags, 'channel');
  const channelsFlag = readStringFlag(parsed.flags, 'channels');
  const categoryFlag = readStringFlag(parsed.flags, 'category');
  const tagFlag = readStringFlag(parsed.flags, 'tag');
  const limitPerQuery = readNumberFlag(parsed.flags, 'limit-per-query') ?? 10;

  const lang = readStringFlag(parsed.flags, 'language');
  if (lang && lang !== 'en') {
    throw new Error('Only English language ("en") is supported');
  }

  const fileContent = fs.readFileSync(jsonPath, 'utf-8');
  const brief = JSON.parse(fileContent);

  if (brief.kind !== 'scene-brief' || !Array.isArray(brief.queries)) {
    throw new Error('Invalid scene-brief format');
  }

  let channelIds: string[] = [];
  try {
    channelIds = await resolveChannels(channelFlag, channelsFlag, categoryFlag, tagFlag);
  } catch (err: any) {
    if (categoryFlag || tagFlag) {
       // Graceful degradation when resolving
       channelIds = [];
    } else {
       throw new Error(err.message);
    }
  }

  const evidencePack = {
    kind: 'yanghoo-evidence-pack',
    briefId: brief.id,
    scene: brief.scene,
    queries: brief.queries,
    examples: [] as any[],
    warnings: [] as string[]
  };

  if (channelIds.length === 0) {
    evidencePack.warnings.push('No channels matched criteria for search');
    printResult(context, evidencePack, `Generated evidence pack with 0 examples (no channels matched).`);
    return;
  }

  const seenExamples = new Set<string>();

  for (const query of brief.queries) {
    const result = await searchEnglishSentenceIndexUseCase({
      channelIds,
      language: 'en',
      query: String(query),
      limit: limitPerQuery,
      diversity: 'balanced'
    });

    if (result.warnings && result.warnings.length > 0) {
       evidencePack.warnings.push(...result.warnings);
    }

    for (const r of result.results) {
      const dedupKey = `${r.entry.channelId}-${r.entry.videoId}-${r.entry.start}-${r.entry.text}`;
      if (!seenExamples.has(dedupKey)) {
        seenExamples.add(dedupKey);
        evidencePack.examples.push({
          query: String(query),
          text: r.entry.text,
          channelId: r.entry.channelId,
          videoId: r.entry.videoId,
          sourceId: r.entry.sourceId,
          title: r.entry.title,
          start: r.entry.start,
          youtubeTimestampUrl: r.youtubeTimestampUrl,
          captionKind: r.entry.captionKind
        });
      }
    }
  }

  printResult(context, evidencePack, `Generated evidence pack with ${evidencePack.examples.length} examples.`);
}
