import { createHash } from 'crypto';
import { savedEnglishExampleStorage } from '@yanghoo/storage';
import type { SavedEnglishExample, SavedEnglishExamplesFile, SavedEnglishExampleStatus, EnglishSentenceIndexEntry } from '@yanghoo/domain';

function generateStableId(item: { channelId: string; sourceId: string; videoId: string; start: number; end: number; normalizedText: string }): string {
  const raw = `${item.channelId}|${item.sourceId}|${item.videoId}|${item.start}|${item.end}|${item.normalizedText}`;
  return createHash('sha1').update(raw).digest('hex').substring(0, 20);
}

function normalizeTags(tags: string[]): string[] {
  return [...new Set(tags.map(t => t.trim().toLowerCase()).filter(Boolean))];
}

export interface SaveEnglishExampleInput {
  entry: EnglishSentenceIndexEntry;
  youtubeTimestampUrl: string;
  youtubeEmbedUrl: string;
  startSeconds: number;
  query?: string;
}

export async function saveEnglishExampleUseCase(input: SaveEnglishExampleInput): Promise<{ item: SavedEnglishExample; created: boolean }> {
  const file = await savedEnglishExampleStorage.readSavedEnglishExamples();

  const stableId = generateStableId({
    channelId: input.entry.channelId,
    sourceId: input.entry.sourceId,
    videoId: input.entry.videoId,
    start: input.entry.start,
    end: input.entry.end,
    normalizedText: input.entry.normalizedText
  });

  const existing = file.items.find(i => i.id === stableId);
  if (existing) {
    return { item: existing, created: false };
  }

  const now = new Date().toISOString();
  const item: SavedEnglishExample = {
    id: stableId,
    channelId: input.entry.channelId,
    channelTitle: input.entry.channelTitle,
    sourceId: input.entry.sourceId,
    videoId: input.entry.videoId,
    videoTitle: input.entry.title,
    publishedAt: input.entry.publishedAt,
    start: input.entry.start,
    end: input.entry.end,
    text: input.entry.text,
    normalizedText: input.entry.normalizedText,
    captionKind: input.entry.captionKind,
    captionLanguage: input.entry.captionLanguage,
    youtubeTimestampUrl: input.youtubeTimestampUrl,
    youtubeEmbedUrl: input.youtubeEmbedUrl,
    startSeconds: input.startSeconds,
    query: input.query,
    note: '',
    tags: [],
    status: 'saved',
    savedAt: now,
    updatedAt: now,
    lastReviewedAt: null,
    reviewCount: 0
  };

  file.items.unshift(item);
  file.updatedAt = now;
  await savedEnglishExampleStorage.writeSavedEnglishExamples(file);

  return { item, created: true };
}

export async function listSavedEnglishExamplesUseCase(filters?: {
  q?: string;
  channelId?: string;
  tag?: string;
  status?: SavedEnglishExampleStatus;
}): Promise<SavedEnglishExample[]> {
  const file = await savedEnglishExampleStorage.readSavedEnglishExamples();
  let items = file.items;

  if (filters?.q) {
    const lq = filters.q.toLowerCase();
    items = items.filter(i => i.text.toLowerCase().includes(lq) || i.normalizedText.includes(lq));
  }
  if (filters?.channelId) {
    items = items.filter(i => i.channelId === filters.channelId);
  }
  if (filters?.tag) {
    items = items.filter(i => i.tags.includes(filters.tag!.toLowerCase()));
  }
  if (filters?.status) {
    items = items.filter(i => i.status === filters.status);
  }

  return items;
}

export async function updateSavedEnglishExampleUseCase(id: string, updates: {
  note?: string;
  tags?: string[];
  status?: SavedEnglishExampleStatus;
}): Promise<SavedEnglishExample> {
  const file = await savedEnglishExampleStorage.readSavedEnglishExamples();
  const item = file.items.find(i => i.id === id);
  if (!item) throw new Error(`Saved example not found: ${id}`);

  if (updates.note !== undefined) item.note = updates.note;
  if (updates.tags !== undefined) item.tags = normalizeTags(updates.tags);
  if (updates.status !== undefined) item.status = updates.status;
  item.updatedAt = new Date().toISOString();

  file.updatedAt = item.updatedAt;
  await savedEnglishExampleStorage.writeSavedEnglishExamples(file);
  return item;
}

export async function deleteSavedEnglishExampleUseCase(id: string): Promise<void> {
  const file = await savedEnglishExampleStorage.readSavedEnglishExamples();
  const idx = file.items.findIndex(i => i.id === id);
  if (idx === -1) throw new Error(`Saved example not found: ${id}`);

  file.items.splice(idx, 1);
  file.updatedAt = new Date().toISOString();
  await savedEnglishExampleStorage.writeSavedEnglishExamples(file);
}

export async function markSavedEnglishExampleReviewedUseCase(id: string): Promise<SavedEnglishExample> {
  const file = await savedEnglishExampleStorage.readSavedEnglishExamples();
  const item = file.items.find(i => i.id === id);
  if (!item) throw new Error(`Saved example not found: ${id}`);

  const now = new Date().toISOString();
  item.lastReviewedAt = now;
  item.reviewCount++;
  item.updatedAt = now;

  file.updatedAt = now;
  await savedEnglishExampleStorage.writeSavedEnglishExamples(file);
  return item;
}

export async function listSavedEnglishExampleIdsUseCase(): Promise<Set<string>> {
  const file = await savedEnglishExampleStorage.readSavedEnglishExamples();
  return new Set(file.items.map(i => i.id));
}
