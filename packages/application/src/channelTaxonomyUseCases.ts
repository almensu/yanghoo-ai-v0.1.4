import { channelTaxonomyStorage } from '@yanghoo/storage';
import type { ChannelTaxonomyItem, ChannelTaxonomyFile } from '@yanghoo/domain';

export function normalizeChannelCategory(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function normalizeChannelTags(raw: string[]): string[] {
  const normalized = raw
    .map(t => t.trim().toLowerCase().replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean);
  return [...new Set(normalized)].sort();
}

export async function listChannelTaxonomyUseCase(): Promise<ChannelTaxonomyItem[]> {
  const file = await channelTaxonomyStorage.readChannelTaxonomy();
  return file.items;
}

export async function updateChannelTaxonomyUseCase(
  channelId: string,
  input: { category?: string; tags?: string[]; note?: string }
): Promise<ChannelTaxonomyItem> {
  const category = input.category != null ? normalizeChannelCategory(input.category) : undefined;
  const tags = input.tags != null ? normalizeChannelTags(input.tags) : [];
  const note = input.note ?? '';

  const item: ChannelTaxonomyItem = {
    channelId,
    category: category || undefined,
    tags,
    note,
    updatedAt: new Date().toISOString()
  };

  const file = await channelTaxonomyStorage.readChannelTaxonomy();
  const idx = file.items.findIndex(i => i.channelId === channelId);
  if (idx >= 0) {
    file.items[idx] = item;
  } else {
    file.items.push(item);
  }
  file.updatedAt = new Date().toISOString();
  await channelTaxonomyStorage.writeChannelTaxonomy(file);

  return item;
}

export async function deleteChannelTaxonomyUseCase(channelId: string): Promise<boolean> {
  const file = await channelTaxonomyStorage.readChannelTaxonomy();
  const before = file.items.length;
  file.items = file.items.filter(i => i.channelId !== channelId);
  if (file.items.length === before) return false;
  file.updatedAt = new Date().toISOString();
  await channelTaxonomyStorage.writeChannelTaxonomy(file);
  return true;
}
