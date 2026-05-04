import { EnglishSentenceIndexEntry, normalizeSearchText } from '@yanghoo/domain';
import { indexInputStorage, createEnglishSentenceIndexStorage } from '@yanghoo/storage';

export interface SearchSentenceIndexOptions {
  channelId: string;
  language: string;
  query: string;
  limit?: number;
}

export interface SearchResult {
  entry: EnglishSentenceIndexEntry;
  youtubeTimestampUrl: string;
}

export async function searchEnglishSentenceIndexUseCase(
  options: SearchSentenceIndexOptions
): Promise<SearchResult[]> {
  if (options.language !== 'en') {
    throw new Error(`Only English ("en") is supported in this stage. Got: "${options.language}"`);
  }

  const dataRoot = indexInputStorage.getDataRoot();
  const indexStorage = createEnglishSentenceIndexStorage(dataRoot);

  const manifest = await indexStorage.readManifest(options.channelId);
  if (!manifest) {
    throw new Error(`No index found for channel ${options.channelId}. Run "sentence-index build" first.`);
  }

  const entries = await indexStorage.readEntries(options.channelId);
  if (entries.length === 0) return [];

  const normalizedQuery = normalizeSearchText(options.query);
  const limit = options.limit ?? 50;

  const isPhrase = normalizedQuery.includes(' ');

  const matches: SearchResult[] = [];
  for (const entry of entries) {
    if (entry.captionLanguage !== options.language) continue;

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
      const timestamp = Math.floor(entry.start);
      matches.push({
        entry,
        youtubeTimestampUrl: `https://www.youtube.com/watch?v=${entry.videoId}&t=${timestamp}s`
      });
    }
  }

  // Sort: publishedAt desc, then video order (by videoId for stability), then sentence start time
  matches.sort((a, b) => {
    const aDate = a.entry.publishedAt || '';
    const bDate = b.entry.publishedAt || '';
    if (aDate !== bDate) return bDate.localeCompare(aDate);
    if (a.entry.videoId !== b.entry.videoId) return a.entry.videoId.localeCompare(b.entry.videoId);
    return a.entry.start - b.entry.start;
  });

  return matches.slice(0, limit);
}

function isAlphaChar(c: string): boolean {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}
