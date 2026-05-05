import { EnglishSentenceIndexEntry, normalizeSearchText } from '@yanghoo/domain';
import { indexInputStorage, createEnglishSentenceIndexStorage } from '@yanghoo/storage';

export type EnglishSentenceDiversityMode = 'balanced' | 'all' | 'one_per_video';
export type EnglishSentenceSortMode = 'recent' | 'variety';
export type EnglishSentenceCaptionKindFilter = 'all' | 'manual' | 'auto';

export interface SearchSentenceIndexOptions {
  channelId: string;
  language: string;
  query: string;
  limit?: number;
  offset?: number;
  diversity?: EnglishSentenceDiversityMode;
  perVideoLimit?: number;
  sort?: EnglishSentenceSortMode;
  captionKind?: EnglishSentenceCaptionKindFilter;
}

export interface MultiChannelSearchOptions {
  channelIds: string[];
  language: string;
  query: string;
  limit?: number;
  offset?: number;
  diversity?: EnglishSentenceDiversityMode;
  perVideoLimit?: number;
  sort?: EnglishSentenceSortMode;
  captionKind?: EnglishSentenceCaptionKindFilter;
}

export interface SearchResult {
  entry: EnglishSentenceIndexEntry;
  youtubeTimestampUrl: string;
  youtubeEmbedUrl: string;
  startSeconds: number;
}

export interface SearchPage {
  limit: number;
  offset: number;
  returned: number;
  hasMore: boolean;
}

export interface EnglishSentenceSearchResponse {
  results: SearchResult[];
  warnings: string[];
  page: SearchPage;
}

export async function searchEnglishSentenceIndexUseCase(
  options: SearchSentenceIndexOptions | MultiChannelSearchOptions
): Promise<EnglishSentenceSearchResponse> {
  if (options.language !== 'en') {
    throw new Error(`Only English ("en") is supported in this stage. Got: "${options.language}"`);
  }

  const channelIds = 'channelIds' in options ? options.channelIds : [options.channelId];
  const limit = clampNumber(options.limit ?? 20, 1, 100);
  const offset = Math.max(0, options.offset ?? 0);

  if (channelIds.length === 0) {
    return { results: [], warnings: ['No channels selected'], page: { limit, offset, returned: 0, hasMore: false } };
  }

  const dataRoot = indexInputStorage.getDataRoot();
  const indexStorage = createEnglishSentenceIndexStorage(dataRoot);

  const normalizedQuery = normalizeSearchText(options.query);
  const isPhrase = normalizedQuery.includes(' ');
  const captionKind = options.captionKind ?? 'all';
  const diversity = options.diversity ?? 'balanced';
  const perVideoLimit = options.perVideoLimit ?? (diversity === 'one_per_video' ? 1 : 2);
  const sort = options.sort ?? 'recent';

  const allMatches: SearchResult[] = [];
  const warnings: string[] = [];

  for (const channelId of channelIds) {
    const manifest = await indexStorage.readManifest(channelId);
    if (!manifest) {
      warnings.push(`No index found for channel ${channelId}`);
      continue;
    }

    const entries = await indexStorage.readEntries(channelId);
    if (entries.length === 0) continue;

    for (const entry of entries) {
      if (entry.captionLanguage !== options.language) continue;
      if (captionKind !== 'all' && entry.captionKind !== captionKind) continue;

      let matched: boolean;
      if (isPhrase) {
        matched = entry.normalizedText.includes(normalizedQuery);
      } else {
        const idx = entry.normalizedText.indexOf(normalizedQuery);
        if (idx === -1) {
          matched = false;
        } else {
          const before = idx === 0 || !isAlphaChar(entry.normalizedText[idx - 1]);
          const after = idx + normalizedQuery.length === entry.normalizedText.length
            || !isAlphaChar(entry.normalizedText[idx + normalizedQuery.length]);
          matched = before && after;
        }
      }

      if (matched) {
        allMatches.push(toSearchResult(entry));
      }
    }
  }

  sortMatches(allMatches, sort);
  const diversified = applyDiversity(allMatches, diversity, perVideoLimit);
  const paged = diversified.slice(offset, offset + limit);

  return {
    results: paged,
    warnings,
    page: {
      limit,
      offset,
      returned: paged.length,
      hasMore: offset + limit < diversified.length
    }
  };
}

function isAlphaChar(c: string): boolean {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

export function toSearchResult(entry: EnglishSentenceIndexEntry): SearchResult {
  const timestamp = Math.floor(entry.start);
  const startSeconds = Math.max(0, timestamp - 2);
  const encodedVideoId = encodeURIComponent(entry.videoId);
  return {
    entry,
    startSeconds,
    youtubeTimestampUrl: `https://www.youtube.com/watch?v=${encodedVideoId}&t=${timestamp}s`,
    youtubeEmbedUrl: `https://www.youtube.com/embed/${encodedVideoId}?start=${startSeconds}&autoplay=1&rel=0`
  };
}

function sortMatches(matches: SearchResult[], sort: EnglishSentenceSortMode) {
  matches.sort((a, b) => {
    const aDate = a.entry.publishedAt || '';
    const bDate = b.entry.publishedAt || '';
    if (sort === 'variety') {
      if (a.entry.channelId !== b.entry.channelId) return a.entry.channelId.localeCompare(b.entry.channelId);
      if (a.entry.videoId !== b.entry.videoId) return a.entry.videoId.localeCompare(b.entry.videoId);
      return a.entry.start - b.entry.start;
    }
    if (aDate !== bDate) return bDate.localeCompare(aDate);
    if (a.entry.videoId !== b.entry.videoId) return a.entry.videoId.localeCompare(b.entry.videoId);
    return a.entry.start - b.entry.start;
  });
}

function applyDiversity(
  matches: SearchResult[],
  diversity: EnglishSentenceDiversityMode,
  perVideoLimit: number
): SearchResult[] {
  if (diversity === 'all') return matches;
  const videoCounts = new Map<string, number>();
  const maxPerVideo = diversity === 'one_per_video' ? 1 : Math.max(1, perVideoLimit);

  return matches.filter(match => {
    const key = `${match.entry.channelId}:${match.entry.videoId}`;
    const count = videoCounts.get(key) ?? 0;
    if (count >= maxPerVideo) return false;
    videoCounts.set(key, count + 1);
    return true;
  });
}

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}
