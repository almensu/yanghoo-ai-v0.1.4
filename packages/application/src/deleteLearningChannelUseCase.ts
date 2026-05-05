import { channelStorage, sourceStorage, channelTaxonomyStorage } from '@yanghoo/storage';
import type { ChannelDeleteResult } from '@yanghoo/domain';

async function collectSourceIdsReferencedByOtherChannels(excludeChannelId: string): Promise<Set<string>> {
  const allChannelDirs = await channelStorage.listChannels();
  const sharedSourceIds = new Set<string>();

  for (const chId of allChannelDirs) {
    if (chId === excludeChannelId) continue;
    const videos = await channelStorage.getChannelVideos(chId);
    if (videos) {
      for (const video of videos) {
        if (video.id) sharedSourceIds.add(video.id);
      }
    }
    const sel = await channelStorage.getVideoSelection(chId);
    if (sel) {
      for (const item of sel.items) {
        if (item.sourceId) sharedSourceIds.add(item.sourceId);
      }
    }
    const report = await channelStorage.getCaptionSyncReport(chId);
    if (report) {
      for (const item of report.items) {
        if (item.sourceId) sharedSourceIds.add(item.sourceId);
      }
    }
  }

  return sharedSourceIds;
}

export async function deleteLearningChannelUseCase(channelId: string): Promise<ChannelDeleteResult> {
  const manifest = await channelStorage.getChannelManifest(channelId);
  if (!manifest) {
    throw new Error(`Channel not found: ${channelId}`);
  }

  const videos = await channelStorage.getChannelVideos(channelId) || [];
  const selection = await channelStorage.getVideoSelection(channelId);
  const selMap = new Map((selection?.items ?? []).map(i => [i.videoId, i]));

  const sharedSourceIds = await collectSourceIdsReferencedByOtherChannels(channelId);

  const deletedSources: string[] = [];
  const skippedSources: string[] = [];
  const deletedPaths: string[] = [];
  const skippedPaths: string[] = [];
  const warnings: string[] = [];

  for (const video of videos) {
    const sourceId = selMap.get(video.videoId)?.sourceId || video.id;

    if (sharedSourceIds.has(sourceId)) {
      skippedSources.push(sourceId);
      skippedPaths.push(`data/sources/${sourceId}`);
      warnings.push(`Skipped shared source ${sourceId}: still referenced by another channel`);
      continue;
    }

    try {
      const source = await sourceStorage.getSource(sourceId);
      if (source) {
        const delResult = await sourceStorage.deleteSource(sourceId);
        deletedSources.push(sourceId);
        deletedPaths.push(...delResult.deleted);
        skippedPaths.push(...delResult.skipped);
        for (const f of delResult.failed) {
          warnings.push(`Failed to delete ${f.path}: ${f.reason}`);
        }
      } else {
        skippedSources.push(sourceId);
      }
    } catch (err: any) {
      warnings.push(`Failed to delete source ${sourceId}: ${err.message}`);
      skippedSources.push(sourceId);
    }
  }

  try {
    await channelStorage.deleteChannelDir(channelId);
    deletedPaths.push(`data/channels/${channelId}`, `data/indexes/${channelId}`);
  } catch (err: any) {
    warnings.push(`Failed to delete channel directory: ${err.message}`);
  }

  // Clean up taxonomy entry for this channel
  try {
    const taxonomyFile = await channelTaxonomyStorage.readChannelTaxonomy();
    const before = taxonomyFile.items.length;
    taxonomyFile.items = taxonomyFile.items.filter(i => i.channelId !== channelId);
    if (taxonomyFile.items.length < before) {
      taxonomyFile.updatedAt = new Date().toISOString();
      await channelTaxonomyStorage.writeChannelTaxonomy(taxonomyFile);
    }
  } catch (err: any) {
    warnings.push(`Failed to clean up taxonomy: ${err.message}`);
  }

  return {
    channelId,
    deletedChannel: true,
    deletedSources: deletedSources.length,
    skippedSources: skippedSources.length,
    deletedPaths,
    skippedPaths,
    warnings
  };
}
