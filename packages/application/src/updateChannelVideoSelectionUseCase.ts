import { channelStorage } from '@yanghoo/storage';
import type { VideoSelection, VideoSelectionItem } from '@yanghoo/domain';

export async function updateChannelVideoSelectionUseCase(params: {
  channelId: string;
  videoIds: string[];
  selected: boolean;
}): Promise<{ selectedCount: number; totalVideos: number }> {
  const manifest = await channelStorage.getChannelManifest(params.channelId);
  if (!manifest) {
    throw new Error(`Channel not found: ${params.channelId}`);
  }

  let selection = await channelStorage.getVideoSelection(params.channelId);
  const now = new Date().toISOString();

  if (!selection) {
    selection = {
      channelId: params.channelId,
      updatedAt: now,
      items: []
    };
  }

  const itemMap = new Map(selection.items.map(i => [i.videoId, i]));

  for (const videoId of params.videoIds) {
    const existing = itemMap.get(videoId);
    if (existing) {
      existing.selected = params.selected;
      existing.updatedAt = now;
    } else {
      const item: VideoSelectionItem = {
        videoId,
        selected: params.selected,
        captionStatus: params.selected ? 'selected' : 'not_captured',
        indexStatus: 'not_indexed',
        updatedAt: now
      };
      itemMap.set(videoId, item);
    }
  }

  selection.items = Array.from(itemMap.values());
  selection.updatedAt = now;

  await channelStorage.saveVideoSelection(selection);

  const videos = await channelStorage.getChannelVideos(params.channelId) || [];
  const selectedCount = selection.items.filter(i => i.selected).length;

  return {
    selectedCount,
    totalVideos: videos.length
  };
}
