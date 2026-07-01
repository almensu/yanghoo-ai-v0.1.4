import { MediaKind, getSourceDir } from '@yanghoo/domain';
import { mediaStorage, sourceStorage } from '@yanghoo/storage';
import * as fs from 'fs';
import * as path from 'path';

export interface TaskLocalMediaFile {
  sourceId: string;
  mediaKind: MediaKind;
  logicalPath: string;
  absolutePath: string;
  byteSize: number;
  exists: true;
}

export type SourceMediaFileErrorCode =
  | 'SOURCE_NOT_FOUND'
  | 'MEDIA_NOT_DOWNLOADED'
  | 'MEDIA_NOT_VIDEO'
  | 'MEDIA_FILE_NOT_FOUND';

export class SourceMediaFileError extends Error {
  constructor(
    public readonly code: SourceMediaFileErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'SourceMediaFileError';
  }
}

export async function getSourceMediaFileUseCase(sourceId: string): Promise<TaskLocalMediaFile> {
  const source = await sourceStorage.getSource(sourceId);
  if (!source) {
    throw new SourceMediaFileError('SOURCE_NOT_FOUND', `Source not found: ${sourceId}`);
  }

  const media = await mediaStorage.getMedia(sourceId);
  if (!media || media.status !== 'downloaded' || !media.localPath) {
    throw new SourceMediaFileError('MEDIA_NOT_DOWNLOADED', 'Media is not downloaded');
  }
  if (media.mediaKind !== 'video') {
    throw new SourceMediaFileError('MEDIA_NOT_VIDEO', 'Downloaded media is not video');
  }

  const absolutePath = mediaStorage.resolveStoragePath(media.localPath);
  const sourceDir = mediaStorage.resolveStoragePath(getSourceDir(sourceId));
  assertPathInsideDir(absolutePath, sourceDir);

  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    throw new SourceMediaFileError('MEDIA_FILE_NOT_FOUND', 'Downloaded video file not found');
  }

  const stat = fs.statSync(absolutePath);
  return {
    sourceId,
    mediaKind: media.mediaKind,
    logicalPath: media.localPath,
    absolutePath,
    byteSize: stat.size,
    exists: true
  };
}

function assertPathInsideDir(filePath: string, dirPath: string): void {
  const relative = path.relative(dirPath, filePath);
  if (relative === '' || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new SourceMediaFileError('MEDIA_FILE_NOT_FOUND', 'Downloaded video file not found');
  }
}
