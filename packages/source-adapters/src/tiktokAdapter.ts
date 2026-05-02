import { Source } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { runYtDlpMetadata, stringifyYtDlpArgs } from './ytDlpMetadataOptions.js';

export class TikTokSourceAdapter {
  async capture(url: string): Promise<Source> {
    console.log(`[TikTokAdapter] Capturing URL: ${url}`);

    let title = `TikTok Video`;
    let author = 'TikTok Creator';
    let thumbnailUrl = '';
    let duration = 0;
    let canonicalId = '';

    try {
      // Use yt-dlp to get real metadata
      // TikTok often needs specific headers or cookies, and is sensitive to network/TLS impersonation.
      const args = ['--dump-json', '--skip-download', url];
      console.log(`[TikTokAdapter] Running: yt-dlp ${stringifyYtDlpArgs(args)}`);
      
      const result = runYtDlpMetadata(args);
      
      if (result.status === 0) {
        const metadata = JSON.parse(result.stdout);
        if (metadata.id) {
          canonicalId = metadata.id;
        }
        title = metadata.title || metadata.description || `TikTok Video ${canonicalId}`;
        author = metadata.uploader || metadata.channel || author;
        thumbnailUrl = metadata.thumbnail || '';
        duration = metadata.duration || 0;
      } else {
        let stderr = result.stderr?.trim() || 'Unknown yt-dlp error';
        console.warn(`[TikTokAdapter] yt-dlp fetch failed for ${url}: ${stderr}`);
        
        // Enhance error message with common TikTok solutions
        if (stderr.includes('impersonation')) {
          stderr += '\n\nResolution: TikTok requires TLS impersonation. Try: pip install "yt-dlp[build-in]" or use cookies.';
        }
        if (stderr.includes('Read timed out')) {
          stderr += '\n\nResolution: Network timeout. Check your connection or proxy settings.';
        }

        // TikTok short links MUST be resolved to get the canonical ID
        if (!canonicalId) {
          throw new Error(`TikTok metadata capture failed: ${stderr}`);
        }
      }
    } catch (e: any) {
      console.warn(`[TikTokAdapter] Metadata fetch failed: ${e.message}`);
      if (e.message.includes('metadata capture failed')) {
        throw e;
      }
    }

    const finalId = canonicalId || nanoid();

    return {
      id: `tiktok-${finalId}`,
      sourceClass: 'short_video',
      platform: 'tiktok',
      url,
      title: title === 'TikTok Video' ? `TikTok Video ${finalId}` : title,
      author,
      thumbnailUrl,
      duration,
      capturedAt: new Date().toISOString(),
      canonicalId: finalId,
      metadata: {
        videoId: finalId
      }
    };
  }
}

export const tiktokAdapter = new TikTokSourceAdapter();
