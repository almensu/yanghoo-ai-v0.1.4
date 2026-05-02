import type { CliContext } from '../cli-runtime-config.js';
import { parseCommandArgs, readBooleanFlag, readStringFlag } from '../cli-runtime-config.js';
import { printResult } from '../cli-output-renderer.js';

type NotebookLmExportMode = 'markdown' | 'url-list';

export async function runExportCommand(args: string[], context: CliContext): Promise<void> {
  const [target, ...rest] = args;
  if (target !== 'notebooklm') {
    throw new Error('Usage: yanghoo export notebooklm <sourceId...> --mode markdown|url-list --open');
  }

  const parsed = parseCommandArgs(rest);
  const sourceIds = parsed.positional;
  if (!sourceIds.length) {
    throw new Error('Usage: yanghoo export notebooklm <sourceId...> --mode markdown|url-list --open');
  }

  const mode = readExportMode(readStringFlag(parsed.flags, 'mode') || 'markdown');
  const shouldOpen = readBooleanFlag(parsed.flags, 'open');
  const { exportNotebookLmUseCase, openNotebookLmExportDirUseCase } = await import('@yanghoo/application');

  const result = await exportNotebookLmUseCase({
    sourceIds,
    mode,
    language: 'zh-Hans-preferred'
  });

  const openResult = shouldOpen ? openNotebookLmExportDirUseCase(result.exportId) : undefined;

  printResult(
    context,
    { export: result, opened: openResult },
    [
      `NotebookLM 导出目录: ${result.exportDir}`,
      `模式: ${result.mode}`,
      `文件数: ${result.files.length}`,
      `跳过数: ${result.skipped.length}`,
      shouldOpen ? '已打开导出目录。' : '使用 --open 可直接打开导出目录。'
    ]
  );
}

function readExportMode(value: string): NotebookLmExportMode {
  if (value === 'markdown' || value === 'url-list') return value;
  throw new Error(`Unsupported export mode: ${value}`);
}
