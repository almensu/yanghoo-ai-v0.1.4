import { channelStorage, createEnglishSentenceIndexStorage, indexInputStorage } from '@yanghoo/storage';
import type { LearningChannelVideoRow, VideoSelectionStatus, VideoIndexStatus, ChannelVideoDiscoveryStatus } from '@yanghoo/domain';

export async function getLearningChannelVideosUseCase(channelId: string): Promise<{
  channelId: string;
  videos: LearningChannelVideoRow[];
}> {
  const manifest = await channelStorage.getChannelManifest(channelId);
  if (!manifest) {
    throw new Error(`Channel not found: ${channelId}`);
  }

  const videos = await channelStorage.getChannelVideos(channelId) || [];
  const selection = await channelStorage.getVideoSelection(channelId);
  const selectionMap = new Map((selection?.items ?? []).map(i => [i.videoId, i]));

  // Build set of indexed source IDs
  const indexedSourceIds = new Set<string>();
  try {
    const dataRoot = indexInputStorage.getDataRoot();
    const indexStorage = createEnglishSentenceIndexStorage(dataRoot);
    const indexManifest = await indexStorage.readManifest(channelId);
    if (indexManifest?.sourceIds) {
      for (const sid of indexManifest.sourceIds) {
        indexedSourceIds.add(sid);
      }
    }
  } catch {
    // No index
  }

  const report = await channelStorage.getCaptionSyncReport(channelId);
  const reportMap = new Map((report?.items ?? []).map(i => [i.videoId, i]));

  const refreshReport = await channelStorage.getChannelRefreshReport(channelId);
  const newVideoIds = new Set(refreshReport?.addedVideos.map(v => v.videoId) ?? []);
  const remoteMissingIds = new Set(refreshReport?.remoteMissingVideoIds ?? []);

  const rows: LearningChannelVideoRow[] = videos.map(video => {
    const sel = selectionMap.get(video.videoId);
    const rpt = reportMap.get(video.videoId);

    let captionStatus: VideoSelectionStatus = 'not_captured';
    if (rpt?.status === 'success' || sel?.captionStatus === 'caption_ready') {
      captionStatus = 'caption_ready';
    } else if (rpt?.status === 'failed' || sel?.captionStatus === 'caption_failed') {
      captionStatus = 'caption_failed';
    }
    if (sel?.selected && captionStatus === 'not_captured') {
      captionStatus = 'selected';
    }

    const sourceId = sel?.sourceId || rpt?.sourceId || video.id;
    const indexStatus: VideoIndexStatus = indexedSourceIds.has(sourceId) ? 'indexed' : 'not_indexed';

    let discoveryStatus: ChannelVideoDiscoveryStatus | undefined;
    if (newVideoIds.has(video.videoId)) {
      discoveryStatus = 'new';
    } else if (remoteMissingIds.has(video.videoId)) {
      discoveryStatus = 'remote_missing';
    } else if (refreshReport) {
      discoveryStatus = 'existing';
    }

    return {
      videoId: video.videoId,
      sourceId,
      title: video.title,
      publishedAt: video.publishedAt,
      selected: sel?.selected ?? false,
      captionStatus,
      indexStatus,
      youtubeUrl: video.url,
      lastError: rpt?.errorMessage || sel?.lastError,
      discoveryStatus
    };
  });

  return { channelId, videos: rows };
}
