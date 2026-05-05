import type { EnglishSentenceIndexEntry, TranscriptSegment } from '@yanghoo/domain';
import { createEnglishSentenceIndexStorage, indexInputStorage } from '@yanghoo/storage';

export interface EnglishSentenceContextItem extends TranscriptSegment {
  isMatch: boolean;
}

export interface EnglishSentenceContextResponse {
  sourceId: string;
  videoId: string;
  start: number;
  items: EnglishSentenceContextItem[];
  warnings: string[];
}

export interface EnglishSentenceContextOptions {
  channelId: string;
  sourceId: string;
  start: number;
  window?: number;
}

export async function getEnglishSentenceContextUseCase(
  options: EnglishSentenceContextOptions
): Promise<EnglishSentenceContextResponse> {
  const contextWindow = Math.min(3, Math.max(0, Math.floor(options.window ?? 1)));
  const dataRoot = indexInputStorage.getDataRoot();
  const indexStorage = createEnglishSentenceIndexStorage(dataRoot);
  const entries = await indexStorage.readEntries(options.channelId);

  const sourceEntries = entries
    .filter(entry => entry.sourceId === options.sourceId)
    .sort((a, b) => a.start - b.start);

  if (sourceEntries.length === 0) {
    return {
      sourceId: options.sourceId,
      videoId: '',
      start: options.start,
      items: [],
      warnings: [`No sentence entries found for source ${options.sourceId}`]
    };
  }

  const matchIndex = findClosestEntryIndex(sourceEntries, options.start);
  if (matchIndex === -1) {
    return {
      sourceId: options.sourceId,
      videoId: sourceEntries[0]?.videoId ?? '',
      start: options.start,
      items: [],
      warnings: [`No sentence found near ${options.start} for source ${options.sourceId}`]
    };
  }

  const first = Math.max(0, matchIndex - contextWindow);
  const last = Math.min(sourceEntries.length - 1, matchIndex + contextWindow);
  const items = sourceEntries.slice(first, last + 1).map((entry, idx) => ({
    start: entry.start,
    end: entry.end,
    text: entry.text,
    isMatch: first + idx === matchIndex
  }));

  return {
    sourceId: options.sourceId,
    videoId: sourceEntries[matchIndex].videoId,
    start: sourceEntries[matchIndex].start,
    items,
    warnings: []
  };
}

function findClosestEntryIndex(entries: EnglishSentenceIndexEntry[], start: number): number {
  let bestIndex = -1;
  let bestDistance = Number.POSITIVE_INFINITY;

  entries.forEach((entry, index) => {
    const distance = Math.abs(entry.start - start);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });

  return bestDistance <= 2 ? bestIndex : -1;
}
