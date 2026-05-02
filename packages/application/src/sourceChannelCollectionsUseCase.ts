import type { Platform, Source } from '@yanghoo/domain';
import { sourceStorage } from '@yanghoo/storage';

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

interface MutableSourceChannelCollection {
  id: string;
  type: 'channel';
  platform: Platform;
  title: string;
  sourceIds: string[];
  sources: Source[];
  latestCapturedAt: string;
  thumbnailUrl?: string;
}

export async function listSourceChannelCollectionsUseCase(): Promise<SourceChannelCollectionSummary[]> {
  const sources = await sourceStorage.listSources();
  const collections = new Map<string, MutableSourceChannelCollection>();

  for (const source of sources) {
    const identity = resolveChannelIdentity(source);
    const id = createCollectionId(source.platform, identity);
    const existing = collections.get(id);

    if (!existing) {
      collections.set(id, {
        id,
        type: 'channel',
        platform: source.platform,
        title: identity.label,
        sourceIds: [source.id],
        sources: [source],
        latestCapturedAt: source.capturedAt,
        thumbnailUrl: source.thumbnailUrl
      });
      continue;
    }

    existing.sourceIds.push(source.id);
    existing.sources.push(source);
    if (new Date(source.capturedAt).getTime() > new Date(existing.latestCapturedAt).getTime()) {
      existing.latestCapturedAt = source.capturedAt;
      existing.thumbnailUrl = source.thumbnailUrl || existing.thumbnailUrl;
    }
  }

  return Array.from(collections.values())
    .map(collection => ({
      id: collection.id,
      type: collection.type,
      platform: collection.platform,
      title: collection.title,
      sourceIds: collection.sourceIds,
      sourceCount: collection.sourceIds.length,
      latestCapturedAt: collection.latestCapturedAt,
      thumbnailUrl: collection.thumbnailUrl
    }))
    .sort((a, b) => {
      if (b.sourceCount !== a.sourceCount) return b.sourceCount - a.sourceCount;
      return new Date(b.latestCapturedAt).getTime() - new Date(a.latestCapturedAt).getTime();
    });
}

interface ChannelIdentity {
  stableValue: string;
  label: string;
}

function resolveChannelIdentity(source: Source): ChannelIdentity {
  const metadata = source.metadata || {};
  const stableValue =
    readString(metadata.channelId) ||
    readString(metadata.channel_id) ||
    readString(metadata.uploaderId) ||
    readString(metadata.uploader_id) ||
    readString(metadata.channelUrl) ||
    readString(metadata.channel_url) ||
    readString(metadata.uploaderUrl) ||
    readString(metadata.uploader_url) ||
    source.author ||
    `Unknown ${source.platform}`;

  const label =
    source.author ||
    readString(metadata.channel) ||
    readString(metadata.uploader) ||
    `Unknown ${source.platform}`;

  return {
    stableValue,
    label
  };
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function createCollectionId(platform: Platform, identity: ChannelIdentity): string {
  const normalizedIdentity = normalizeIdentity(identity.stableValue);
  return `${platform}-${toBase64Url(normalizedIdentity)}`;
}

function normalizeIdentity(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function toBase64Url(value: string): string {
  return Buffer.from(value, 'utf-8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}
