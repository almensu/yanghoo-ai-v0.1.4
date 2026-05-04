import { channelStorage } from '@yanghoo/storage';
import { youtubeAdapter } from '@yanghoo/source-adapters';
import { ChannelManifest, ChannelVideo } from '@yanghoo/domain';

export async function captureChannelUseCase(url: string, options?: { limit?: number }): Promise<{ manifest: ChannelManifest, videosCount: number }> {
  // For now, only YouTube is supported for channel greedy capture
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    throw new Error('Only YouTube channels are supported for capture.');
  }

  const { manifest, videos } = await youtubeAdapter.captureChannel(url, options);

  // Check if channel already exists to preserve capturedAt
  const existingManifest = await channelStorage.getChannelManifest(manifest.id);
  if (existingManifest) {
    manifest.capturedAt = existingManifest.capturedAt;
  }

  await channelStorage.saveChannelManifest(manifest);
  await channelStorage.saveChannelVideos(manifest.id, videos);

  return {
    manifest,
    videosCount: videos.length
  };
}
