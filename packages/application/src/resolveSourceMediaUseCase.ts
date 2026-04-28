import { MediaAsset, MediaAssetStatus } from '@yanghoo/domain';
import { sourceStorage, mediaStorage } from '@yanghoo/storage';
import { execSync } from 'child_process';

/**
 * Use Case: Resolve real media URL for a given source using yt-dlp.
 */
export async function resolveSourceMediaUseCase(sourceId: string): Promise<MediaAsset> {
  console.log(`[UseCase] resolveSourceMediaUseCase for source: ${sourceId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  try {
    const cmd = `yt-dlp --dump-json --skip-download "${source.url}"`;
    console.log(`[UseCase] Running: ${cmd}`);
    const json = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
    const metadata = JSON.parse(json);

    const asset: MediaAsset = {
      sourceId,
      status: 'resolved',
      platform: source.platform,
      mediaKind: metadata.vcodec && metadata.vcodec !== 'none' ? 'video' : 'audio',
      sourceUrl: source.url,
      resolvedUrl: metadata.url,
      ext: metadata.ext,
      mimeType: metadata.format_id,
      byteSize: metadata.filesize || metadata.filesize_approx,
      durationSeconds: metadata.duration,
      fetchedAt: new Date().toISOString()
    };

    await mediaStorage.saveMedia(asset);
    return asset;
  } catch (error: any) {
    console.error(`[UseCase] Media resolution failed: ${error.message}`);
    const failedAsset: MediaAsset = {
      sourceId,
      status: 'failed',
      platform: source.platform,
      mediaKind: 'unknown',
      errorMessage: error.message,
      fetchedAt: new Date().toISOString()
    };
    await mediaStorage.saveMedia(failedAsset);
    throw error;
  }
}
