/**
 * Domain types for per-channel video selection and caption intake status.
 */

export type VideoSelectionStatus =
  | 'not_captured'
  | 'selected'
  | 'caption_ready'
  | 'caption_failed'
  | 'indexed';

export type VideoIndexStatus = 'not_indexed' | 'indexed' | 'index_failed';

export interface VideoSelectionItem {
  videoId: string;
  sourceId?: string;
  selected: boolean;
  captionStatus: VideoSelectionStatus;
  indexStatus: VideoIndexStatus;
  lastError?: string;
  updatedAt: string;
}

export interface VideoSelection {
  channelId: string;
  updatedAt: string;
  items: VideoSelectionItem[];
}

export interface LearningChannelSummary {
  channelId: string;
  title: string;
  videoCount: number;
  selectedCount: number;
  captionReadyCount: number;
  indexedSentenceCount: number;
  updatedAt: string;
}

export interface LearningChannelVideoRow {
  videoId: string;
  sourceId?: string;
  title: string;
  publishedAt?: string;
  selected: boolean;
  captionStatus: VideoSelectionStatus;
  indexStatus: VideoIndexStatus;
  youtubeUrl: string;
  lastError?: string;
  discoveryStatus?: 'existing' | 'new' | 'remote_missing';
}
