import { MediaAsset, getMediaDownloadPath } from '@yanghoo/domain';
import { sourceStorage, mediaStorage } from '@yanghoo/storage';
import { execSync } from 'child_process';
import * as fs from 'fs';

/**
 * Use Case: Download real media for a source using yt-dlp.
 */
export async function downloadSourceMediaUseCase(sourceId: string): Promise<MediaAsset> {
  console.log(`[UseCase] downloadSourceMediaUseCase for source: ${sourceId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  // 1. Resolve first if needed
  let asset = await mediaStorage.getMedia(sourceId);
  if (!asset || asset.status === 'failed') {
    // We could call resolveSourceMediaUseCase here, but for explicit staging, 
    // we require it or just run yt-dlp download directly which also resolves.
  }

  try {
    // Use yt-dlp to download. We don't know the extension yet, so we let yt-dlp decide 
    // but try to force a common one or just use the logical path.
    const logicalPath = getMediaDownloadPath(sourceId, '%(ext)s');
    const absolutePathPattern = (mediaStorage as any).resolvePath(logicalPath);
    
    // Command to download best video+audio and merge into mp4/mkv or best single file
    const cmd = `yt-dlp -f "best" -o "${absolutePathPattern}" "${source.url}"`;
    console.log(`[UseCase] Running: ${cmd}`);
    execSync(cmd, { stdio: 'inherit' });

    // Find the actual file (since %(ext)s was resolved by yt-dlp)
    const dirPath = (mediaStorage as any).resolvePath(`sources/${sourceId}`);
    const files = fs.readdirSync(dirPath).filter(f => f.startsWith('media.'));
    if (files.length === 0) throw new Error("yt-dlp finished but no media file found.");
    
    const actualFile = files[0];
    const ext = actualFile.split('.').pop();
    const stats = fs.statSync(`${dirPath}/${actualFile}`);

    const updatedAsset: MediaAsset = {
      sourceId,
      status: 'downloaded',
      platform: source.platform,
      mediaKind: 'video', // Simplified
      sourceUrl: source.url,
      localPath: `data/sources/${sourceId}/${actualFile}`,
      ext: ext,
      byteSize: stats.size,
      fetchedAt: new Date().toISOString()
    };

    await mediaStorage.saveMedia(updatedAsset);
    return updatedAsset;
  } catch (error: any) {
    console.error(`[UseCase] Media download failed: ${error.message}`);
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
