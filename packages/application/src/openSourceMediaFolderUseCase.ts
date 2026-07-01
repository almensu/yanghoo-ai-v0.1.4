import { getSourceDir } from '@yanghoo/domain';
import { mediaStorage } from '@yanghoo/storage';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { getSourceMediaFileUseCase } from './getSourceMediaFileUseCase.js';

export interface OpenSourceMediaFolderResult {
  sourceId: string;
  folderAbsolutePath: string;
  mediaAbsolutePath: string;
  opened: true;
}

export async function openSourceMediaFolderUseCase(sourceId: string): Promise<OpenSourceMediaFolderResult> {
  const mediaFile = await getSourceMediaFileUseCase(sourceId);
  const sourceDir = mediaStorage.resolveStoragePath(getSourceDir(sourceId));
  assertPathInsideDir(mediaFile.absolutePath, sourceDir);

  if (!fs.existsSync(sourceDir) || !fs.statSync(sourceDir).isDirectory()) {
    throw new Error('Downloaded video folder not found');
  }

  const result = spawnSync('open', [sourceDir], {
    encoding: 'utf-8',
    timeout: 10_000
  });

  if (result.error || result.status !== 0) {
    throw new Error(result.stderr || result.error?.message || 'Failed to open downloaded video folder');
  }

  return {
    sourceId: mediaFile.sourceId,
    folderAbsolutePath: sourceDir,
    mediaAbsolutePath: mediaFile.absolutePath,
    opened: true
  };
}

function assertPathInsideDir(filePath: string, dirPath: string): void {
  const relative = path.relative(dirPath, filePath);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Downloaded video file is outside source folder');
  }
}
