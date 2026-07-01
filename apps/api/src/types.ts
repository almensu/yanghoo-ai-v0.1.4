import { Platform, Source, SourceClass, TranscriptSegment, DocumentReadiness, ReadinessStatus, TranscriptSourceType } from '@yanghoo/domain';

export type SourceType = Platform | 'other';
export type TranscriptSource = TranscriptSourceType;
export type JobStatus = 'queued' | 'running' | 'done' | 'failed';

export type { ReadinessStatus as DocumentStatus };

export interface TaskRecord extends Source {
  sourceUrl: string; // duplicate of url for legacy compatibility
  sourceType: SourceType; // duplicate of platform for legacy compatibility
  documentAssets: DocumentReadiness;
  createdAt: string; // duplicate of capturedAt for legacy compatibility
  updatedAt: string;
  content?: string;
  translatedContent?: string;
}

export interface TaskLocalMediaFile {
  sourceId: string;
  mediaKind: 'video';
  logicalPath: string;
  absolutePath: string;
  byteSize: number;
  exists: true;
}

export interface OpenTaskMediaFolderResult {
  sourceId: string;
  folderAbsolutePath: string;
  mediaAbsolutePath: string;
  opened: true;
}

export interface TranscriptSnippet {
  text: string;
  start: number;
  duration: number;
}

export type TranscriptSentence = TranscriptSegment;
