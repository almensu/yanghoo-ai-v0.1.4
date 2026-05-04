import { channelStorage } from '@yanghoo/storage';
import { youtubeAdapter } from '@yanghoo/source-adapters';
import type {
  ChannelVideo,
  ChannelRefreshMode,
  ChannelRefreshReport,
  ChannelRefreshAddedVideo
} from '@yanghoo/domain';

export function mergeChannelVideos(
  localVideos: ChannelVideo[],
  remoteVideos: ChannelVideo[],
  mode: ChannelRefreshMode
): {
  merged: ChannelVideo[];
  addedVideos: ChannelRefreshAddedVideo[];
  updatedCount: number;
  remoteMissingVideoIds: string[];
} {
  const localMap = new Map(localVideos.map(v => [v.videoId, v]));
  const seenVideoIds = new Set(localVideos.map(v => v.videoId));
  const remoteSet = new Set(remoteVideos.map(v => v.videoId));

  const newRemoteVideos: ChannelVideo[] = [];
  const addedVideos: ChannelRefreshAddedVideo[] = [];
  let updatedCount = 0;

  for (const remote of remoteVideos) {
    if (seenVideoIds.has(remote.videoId)) {
      const local = localMap.get(remote.videoId);
      if (local) {
        let changed = false;
        if (remote.title && remote.title !== local.title) {
          local.title = remote.title;
          changed = true;
        }
        if (remote.url && remote.url !== local.url) {
          local.url = remote.url;
          changed = true;
        }
        if (remote.duration != null && remote.duration !== local.duration) {
          local.duration = remote.duration;
          changed = true;
        }
        if (remote.publishedAt && !local.publishedAt) {
          local.publishedAt = remote.publishedAt;
          changed = true;
        }
        if (changed) updatedCount++;
      }
      continue;
    }

    seenVideoIds.add(remote.videoId);
    newRemoteVideos.push(remote);
    addedVideos.push({
      videoId: remote.videoId,
      title: remote.title,
      url: remote.url,
      publishedAt: remote.publishedAt,
      duration: remote.duration
    });
  }

  const merged: ChannelVideo[] = [...newRemoteVideos, ...localVideos];

  const remoteMissingVideoIds: string[] = [];
  if (mode === 'full') {
    for (const local of localVideos) {
      if (!remoteSet.has(local.videoId)) {
        remoteMissingVideoIds.push(local.videoId);
      }
    }
  }

  return { merged, addedVideos, updatedCount, remoteMissingVideoIds };
}

export async function refreshChannelVideosUseCase(options: {
  channelId: string;
  mode: ChannelRefreshMode;
  limit: number;
}): Promise<ChannelRefreshReport> {
  const manifest = await channelStorage.getChannelManifest(options.channelId);
  if (!manifest) {
    throw new Error(`Channel not found: ${options.channelId}`);
  }

  const { videos: remoteVideos } = await youtubeAdapter.captureChannel(
    manifest.url,
    { limit: options.limit }
  );

  const localVideos = await channelStorage.getChannelVideos(options.channelId) || [];

  const { merged, addedVideos, updatedCount, remoteMissingVideoIds } =
    mergeChannelVideos(localVideos, remoteVideos, options.mode);

  const now = new Date().toISOString();

  const report: ChannelRefreshReport = {
    channelId: options.channelId,
    mode: options.mode,
    fetchLimit: options.limit,
    fetchedAt: now,
    localVideoCount: merged.length,
    remoteVideoCount: remoteVideos.length,
    addedCount: addedVideos.length,
    updatedCount,
    preservedCount: localVideos.length - updatedCount,
    remoteMissingCount: remoteMissingVideoIds.length,
    addedVideos,
    remoteMissingVideoIds
  };

  await channelStorage.saveChannelVideos(options.channelId, merged);
  await channelStorage.saveChannelRefreshReport(report);

  return report;
}
