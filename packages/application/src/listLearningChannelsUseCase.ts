import { channelStorage, sourceStorage, createEnglishSentenceIndexStorage, indexInputStorage } from '@yanghoo/storage';
import type { LearningChannelSummary } from '@yanghoo/domain';

export async function listLearningChannelsUseCase(): Promise<LearningChannelSummary[]> {
  const channelIds = await channelStorage.listChannels();
  const summaries: LearningChannelSummary[] = [];

  for (const channelId of channelIds) {
    const manifest = await channelStorage.getChannelManifest(channelId);
    if (!manifest) continue;

    const videos = await channelStorage.getChannelVideos(channelId) || [];
    const selection = await channelStorage.getVideoSelection(channelId);

    const selectedCount = selection?.items.filter(i => i.selected).length ?? 0;
    const captionReadyCount = selection?.items.filter(i => i.captionStatus === 'caption_ready').length ?? 0;

    let indexedSentenceCount = 0;
    try {
      const dataRoot = indexInputStorage.getDataRoot();
      const indexStorage = createEnglishSentenceIndexStorage(dataRoot);
      const indexManifest = await indexStorage.readManifest(channelId);
      indexedSentenceCount = indexManifest?.sentenceCount ?? 0;
    } catch {
      // No index yet
    }

    summaries.push({
      channelId,
      title: manifest.title,
      videoCount: videos.length,
      selectedCount,
      captionReadyCount,
      indexedSentenceCount,
      updatedAt: manifest.capturedAt
    });
  }

  return summaries;
}
