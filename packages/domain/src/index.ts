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
export type TranscriptFallback = 'audio_transcription' | 'media_transcription';

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
  captionVariants?: {
    language: string;
    label: string;
    isTranslated?: boolean;
    sourceLanguage?: string;
    rawPath?: string;
    sentencesPath?: string;
    vttPath?: string;
    documentPath?: string;
  }[];
  segments: TranscriptSegment[];
  rawSegmentsCount?: number;
  rawPath?: string;
  sentencesPath?: string;
  vttPath?: string;
  generatedAt: string;
}
export type DocumentStatus = 'draft' | 'published';
export type DocumentFormat = 'markdown' | 'text';
export type TranslationStatus = 'translated' | 'failed';

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
  transcriptStatus?: TranscriptStatus;
  transcriptErrorMessage?: string;
  transcriptFallback?: TranscriptFallback;
  needsMediaTranscriptionFallback?: boolean;
  hasTranslation?: boolean;
  translationStatus?: TranslationStatus;
  translatedPath?: string;
  translationErrorMessage?: string;
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

export interface ChannelManifest {
  id: string;
  platform: Platform;
  url: string;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  capturedAt: string;
  isPartial?: boolean;
}

export interface ChannelVideo {
  id: string;
  videoId: string;
  title: string;
  url: string;
  publishedAt?: string;
  duration?: number;
}

export type SyncCheckpointStatus = 'in_progress' | 'completed';

export interface SyncCheckpoint {
  channelId: string;
  language: string;
  mode: string;
  status: SyncCheckpointStatus;
  nextIndex: number;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  startedAt: string;
  updatedAt: string;
}

export type CaptionSyncItemStatus = 'success' | 'skipped' | 'failed';
export type FailureKind = 'missing_caption' | 'rate_limit' | 'network' | 'unknown';

export interface CaptionSyncReportItem {
  videoId: string;
  sourceId?: string;
  status: CaptionSyncItemStatus;
  attempts: number;
  captionLanguage?: string;
  failureKind?: FailureKind;
  errorMessage?: string;
  updatedAt: string;
}

export type CaptionSyncReportStatus = 'partial' | 'completed';

export interface CaptionSyncReport {
  channelId: string;
  language: string;
  status: CaptionSyncReportStatus;
  items: CaptionSyncReportItem[];
  startedAt: string;
  updatedAt: string;
}

// --- Channel Refresh ---

export type ChannelRefreshMode = 'latest' | 'full';

export type ChannelVideoDiscoveryStatus = 'existing' | 'new' | 'remote_missing';

export interface ChannelRefreshAddedVideo {
  videoId: string;
  title: string;
  url: string;
  publishedAt?: string;
  duration?: number;
}

export interface ChannelRefreshReport {
  channelId: string;
  mode: ChannelRefreshMode;
  fetchLimit: number;
  fetchedAt: string;
  localVideoCount: number;
  remoteVideoCount: number;
  addedCount: number;
  updatedCount: number;
  preservedCount: number;
  remoteMissingCount: number;
  addedVideos: ChannelRefreshAddedVideo[];
  remoteMissingVideoIds: string[];
}

export interface ChannelDeleteResult {
  channelId: string;
  deletedChannel: boolean;
  deletedSources: number;
  skippedSources: number;
  deletedPaths: string[];
  skippedPaths: string[];
  warnings: string[];
}

export * from './storage.js';
export * from './englishSentenceIndex.js';
export * from './channelVideoSelection.js';

// --- Saved English Examples ---

export type SavedEnglishExampleStatus = 'saved' | 'learning' | 'mastered';

export interface SavedEnglishExample {
  id: string;
  channelId: string;
  channelTitle?: string;
  sourceId: string;
  videoId: string;
  videoTitle?: string;
  publishedAt?: string;
  start: number;
  end: number;
  text: string;
  normalizedText: string;
  captionKind?: string;
  captionLanguage: string;
  youtubeTimestampUrl: string;
  youtubeEmbedUrl: string;
  startSeconds: number;
  query?: string;
  note: string;
  tags: string[];
  status: SavedEnglishExampleStatus;
  savedAt: string;
  updatedAt: string;
  lastReviewedAt: string | null;
  reviewCount: number;
}

export interface SavedEnglishExamplesFile {
  version: 1;
  updatedAt: string;
  items: SavedEnglishExample[];
}
