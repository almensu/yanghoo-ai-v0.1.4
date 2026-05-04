export interface EnglishSentenceIndexEntry {
  indexVersion: 1;
  sourceId: string;
  videoId: string;
  channelId: string;
  channelTitle?: string;
  title?: string;
  publishedAt?: string;
  start: number;
  end: number;
  text: string;
  normalizedText: string;
  captionKind?: string;
  captionLanguage: string;
}

export interface EnglishSentenceIndexManifest {
  indexId: string;
  channelId: string;
  language: string;
  createdAt: string;
  updatedAt: string;
  sourceCount: number;
  sentenceCount: number;
  skippedCount: number;
  failedCount: number;
  sourceIds: string[];
  warnings: string[];
}

export function normalizeSearchText(text: string): string {
  return text.toLowerCase().trim();
}
