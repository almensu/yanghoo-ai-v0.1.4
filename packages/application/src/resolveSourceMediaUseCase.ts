import { MediaAsset } from '@yanghoo/domain';
import { sourceStorage, mediaStorage } from '@yanghoo/storage';
import { runYtDlp } from './ytDlpNetworkOptions.js';

/**
 * Use Case: Resolve real media URL for a given source using yt-dlp.
 */
export async function resolveSourceMediaUseCase(sourceId: string): Promise<MediaAsset> {
  console.log(`[UseCase] resolveSourceMediaUseCase for source: ${sourceId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  try {
    console.log(`[UseCase] Resolving media metadata with yt-dlp: ${source.url}`);
    const json = runYtDlp([
      '--dump-json',
      '--skip-download',
      source.url
    ], { timeoutMs: 120_000, preferProxy: true }).toString();
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
