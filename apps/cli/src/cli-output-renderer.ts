import type { DocumentReadiness, Source } from '@yanghoo/domain';
import type { CliContext } from './cli-runtime-config.js';

export function printResult(context: CliContext, payload: unknown, humanLines: string[] | string): void {
  if (context.json) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  const lines = Array.isArray(humanLines) ? humanLines : [humanLines];
  process.stdout.write(`${lines.join('\n')}\n`);
}

export function printHelp(context: CliContext): void {
  const lines = [
    'Yanghoo CLI',
    '',
    'Usage:',
    '  yanghoo doctor',
    '  yanghoo source add <url>',
    '  yanghoo source list',
    '  yanghoo source show <sourceId>',
    '  yanghoo transcript ensure <sourceId>',
    '  yanghoo media download <sourceId>',
    '  yanghoo audio fetch <sourceId>',
    '  yanghoo transcribe <sourceId>',
    '  yanghoo translate <sourceId> --model <modelName>',
    '  yanghoo search <query>',
    '  yanghoo learning-channels list',
    '  yanghoo english-search <query>',
    '  yanghoo english-search batch <scene-brief.json>',
    '  yanghoo export notebooklm <sourceId...> --mode markdown|url-list --open',
    '',
    'Global flags:',
    '  --json                 Print JSON for automation',
    '  --data-dir <path>      Use a custom data directory'
  ];

  printResult(context, { commands: lines }, lines);
}

export function formatSourceLine(source: Source, readiness?: DocumentReadiness): string {
  const status = readiness ? readiness.status : 'unknown';
  const title = source.title || '(untitled)';
  const author = source.author ? ` / ${source.author}` : '';
  return `${source.id}  ${source.platform}  ${status}  ${title}${author}`;
}

export function readinessSummary(readiness: DocumentReadiness): Record<string, unknown> {
  return {
    status: readiness.status,
    source: readiness.source,
    sentencesCount: readiness.sentencesCount,
    hasMarkdown: readiness.hasMarkdown,
    hasTranslation: readiness.hasTranslation,
    hasAudio: readiness.hasAudio,
    hasMedia: readiness.hasMedia,
    mediaStatus: readiness.mediaStatus,
    mediaHasAudio: readiness.mediaHasAudio,
    audioStatus: readiness.audioStatus,
    transcriptFallback: readiness.transcriptFallback,
    transcriptErrorMessage: readiness.transcriptErrorMessage,
    translationErrorMessage: readiness.translationErrorMessage
  };
}

export function formatReadinessLines(readiness: DocumentReadiness): string[] {
  return [
    `状态: ${readiness.status}`,
    `字幕来源: ${readiness.source}`,
    `句子数: ${readiness.sentencesCount}`,
    `Markdown: ${readiness.hasMarkdown ? 'yes' : 'no'}`,
    `中文翻译: ${readiness.hasTranslation ? 'yes' : 'no'}`,
    `音频: ${readiness.hasAudio ? 'yes' : 'no'}${readiness.audioStatus ? ` (${readiness.audioStatus})` : ''}`,
    `媒体: ${readiness.hasMedia ? 'yes' : 'no'}${readiness.mediaStatus ? ` (${readiness.mediaStatus})` : ''}`
  ];
}

export function truncate(value: string, length = 120): string {
  if (value.length <= length) return value;
  return `${value.slice(0, length - 3)}...`;
}
