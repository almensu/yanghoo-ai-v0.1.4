import { sourceStorage, documentStorage } from '@yanghoo/storage';
import type { CliContext } from '../cli-runtime-config.js';
import { formatReadinessLines, formatSourceLine, printResult, readinessSummary } from '../cli-output-renderer.js';

export async function runSourceCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand, ...rest] = args;

  if (subcommand === 'add') {
    await addSource(rest, context);
    return;
  }

  if (subcommand === 'list') {
    await listSources(context);
    return;
  }

  if (subcommand === 'show') {
    await showSource(rest, context);
    return;
  }

  throw new Error('Usage: yanghoo source add <url> | source list | source show <sourceId>');
}

async function addSource(args: string[], context: CliContext): Promise<void> {
  const input = args.join(' ').trim();
  if (!input) throw new Error('Usage: yanghoo source add <url>');

  const { captureSourceUseCase } = await import('@yanghoo/application');
  const source = await captureSourceUseCase(input);
  const readiness = await documentStorage.getDocumentReadiness(source.id);

  printResult(
    context,
    { source, readiness: readinessSummary(readiness) },
    ['已保存来源:', formatSourceLine(source, readiness)]
  );
}

async function listSources(context: CliContext): Promise<void> {
  const sources = await sourceStorage.listSources();
  const rows = await Promise.all(
    sources.map(async source => ({
      source,
      readiness: await documentStorage.getDocumentReadiness(source.id)
    }))
  );

  printResult(
    context,
    {
      sources: rows.map(row => ({
        id: row.source.id,
        sourceClass: row.source.sourceClass,
        platform: row.source.platform,
        url: row.source.url,
        title: row.source.title,
        author: row.source.author,
        duration: row.source.duration,
        capturedAt: row.source.capturedAt,
        readiness: readinessSummary(row.readiness)
      }))
    },
    rows.length
      ? rows.map(row => formatSourceLine(row.source, row.readiness))
      : '没有来源卡片。使用 `yanghoo source add <url>` 添加。'
  );
}

async function showSource(args: string[], context: CliContext): Promise<void> {
  const sourceId = args[0];
  if (!sourceId) throw new Error('Usage: yanghoo source show <sourceId>');

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  const readiness = await documentStorage.getDocumentReadiness(sourceId);
  printResult(
    context,
    { source, readiness: readinessSummary(readiness) },
    [
      formatSourceLine(source, readiness),
      '',
      `URL: ${source.url}`,
      `作者: ${source.author || '-'}`,
      `时长: ${source.duration ?? '-'}`,
      '',
      ...formatReadinessLines(readiness)
    ]
  );
}
