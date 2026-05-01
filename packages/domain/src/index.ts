/**
 * Core Domain Types for Yanghoo AI
 */

export type SourceClass =
  | 'long_video'
  | 'podcast_audio'
  | 'short_video'
  | 'webpage'
  | 'social_post'
  | 'channel'
  | 'feed';

export type Platform =
  | 'youtube'
  | 'xiaoyuzhou'
  | 'apple_podcast'
  | 'douyin'
  | 'xiaohongshu'
  | 'x'
  | 'webpage'
  | 'bilibili'
  | 'tiktok'
  | 'other';

export interface Source {
  id: string;
  sourceClass: SourceClass;
  platform: Platform;
  url: string;
  title?: string;
  author?: string;
  thumbnailUrl?: string;
  duration?: number; // in seconds
  publishedAt?: string;
  capturedAt: string;
  canonicalId?: string;
  metadata?: Record<string, any>;
  audioUrl?: string;
  shownotes?: string;
}

export type AudioStatus = 'missing' | 'fetched' | 'failed';

export interface AudioAsset {
  sourceId: string;
  status: AudioStatus;
  localPath?: string;
  url?: string;
  size?: number;
  fetchedAt?: string;
  errorMessage?: string;
}

export type MediaAssetStatus = 'missing' | 'resolved' | 'downloaded' | 'failed';
export type MediaKind = 'video' | 'audio' | 'image' | 'unknown';

export interface MediaAsset {
  sourceId: string;
  status: MediaAssetStatus;
  platform: Platform;
  mediaKind: MediaKind;
  sourceUrl?: string;
  resolvedUrl?: string;
  localPath?: string;
  ext?: string;
  mimeType?: string;
  byteSize?: number;
  durationSeconds?: number;
  hasAudio?: boolean;
  notTranscribableReason?: string;
  fetchedAt?: string;
  errorMessage?: string;
}

export interface Collection {
  id: string;
  type: 'channel' | 'playlist' | 'feed' | 'manual';
  url?: string;
  title: string;
  description?: string;
  sourceIds: string[];
}

export type TranscriptStatus = 'raw' | 'refined' | 'failed';
export type TranscriptSourceType =
  | 'platform_caption'
  | 'vtt'
  | 'srt'
  | 'mlx_audio'
  | 'manual'
  | 'none';

export interface TranscriptSegment {
  text: string;
  start: number;
  end: number;
}

export interface TranscriptAsset {
  id: string;
  sourceId: string;
  status: TranscriptStatus;
  sourceType: TranscriptSourceType;
  language?: string;
  engine?: string;
  model?: string;
  segments: TranscriptSegment[];
  rawSegmentsCount?: number;
  rawPath?: string;
  sentencesPath?: string;
  vttPath?: string;
  generatedAt: string;
}
export type DocumentStatus = 'draft' | 'published';
export type DocumentFormat = 'markdown' | 'text';

/**
 * Task-level readiness for cards and tables.
 * Derived from persisted assets.
 */
export type ReadinessStatus =
  | 'empty'
  | 'metadata_only'
  | 'raw_ready'
  | 'refined_ready'
  | 'markdown_ready'
  | 'enriched'
  | 'failed';

export interface DocumentReadiness {
  status: ReadinessStatus;
  source: TranscriptSourceType;
  sentencesCount: number;
  chaptersCount: number;
  hasMarkdown: boolean;
  hasRefined: boolean;
  hasVtt: boolean;
  hasAudio: boolean;
  hasMedia: boolean;
  mediaStatus?: MediaAssetStatus;
  mediaKind?: MediaKind;
  mediaHasAudio?: boolean;
  notTranscribableReason?: string;
  audioStatus?: AudioStatus;
  audioErrorMessage?: string;
}

export interface DocumentAsset {
  id: string;
  sourceId: string;
  transcriptId: string;
  status: DocumentStatus;
  content: string;
  format: DocumentFormat;
  markdownPath?: string;
  sections?: any[]; // Placeholder for chapters/structural analysis
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export type ConversationScopeType = 'source' | 'selected_sources' | 'collection' | 'library';

export interface Conversation {
  id: string;
  scopeType: ConversationScopeType;
  scopeIds: string[];
  messages: Message[];
  modelProvider?: string;
  modelName?: string;
}

export type GeneratedDocumentType = 'summary' | 'article' | 'script' | 'study_notes' | 'custom';

export interface GeneratedDocument {
  id: string;
  conversationId: string;
  sourceIds: string[];
  type: GeneratedDocumentType;
  title: string;
  content: string;
  markdownPath?: string;
}

export type DeleteSourceAssetsScope = 'media' | 'audio' | 'transcript' | 'generated';

export interface DeleteAssetsResponse {
  deleted: string[];
  skipped: string[];
  failed: { path: string; reason: string }[];
  readiness: DocumentReadiness;
}

export * from './storage.js';
