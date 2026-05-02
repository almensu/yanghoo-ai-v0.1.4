import { Platform, Source, DocumentReadiness, ReadinessStatus, TranscriptSourceType } from '@yanghoo/domain';

export type TranscriptSource = TranscriptSourceType;
export type { ReadinessStatus as DocumentStatus };

export interface TaskSummary extends Source {
  sourceUrl: string; // for legacy compatibility
  sourceType: Platform | 'other';
  documentAssets: DocumentReadiness;
  updatedAt: string;
}

export interface TaskDetail extends TaskSummary {
  content?: string;
  translatedContent?: string;
}

export interface SourceChannelCollectionSummary {
  id: string;
  type: 'channel';
  platform: Platform;
  title: string;
  sourceIds: string[];
  sourceCount: number;
  latestCapturedAt: string;
  thumbnailUrl?: string;
}
