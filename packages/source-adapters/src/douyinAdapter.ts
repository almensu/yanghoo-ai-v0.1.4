import { Source } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { runYtDlpMetadata, stringifyYtDlpArgs } from './ytDlpMetadataOptions.js';

export class DouyinSourceAdapter {
  async capture(url: string): Promise<Source> {
    // Typical format: https://v.douyin.com/XYZ/ or https://www.douyin.com/video/ID
    const videoIdMatch = url.match(/\/video\/(\d+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : (url.split('/').filter(Boolean).pop() || nanoid());

    console.log(`[DouyinAdapter] Capturing URL: ${url} (Video ID: ${videoId})`);

    let title = `Douyin Video`;
    let author = 'Douyin Creator';
    let thumbnailUrl = '';
    let duration = 0;
    let canonicalId = videoIdMatch ? videoIdMatch[1] : '';

    try {
      // Use yt-dlp to get real metadata
      const args = ['--dump-json', '--skip-download', url];
      console.log(`[DouyinAdapter] Running: yt-dlp ${stringifyYtDlpArgs(args)}`);
      
      const result = runYtDlpMetadata(args);
      
      if (result.status === 0) {
        const metadata = JSON.parse(result.stdout);
        if (metadata.id) {
          canonicalId = metadata.id;
        }
        title = metadata.title || metadata.description || `Douyin Video ${canonicalId}`;
        author = metadata.uploader || metadata.channel || author;
        thumbnailUrl = metadata.thumbnail || '';
        duration = metadata.duration || 0;
      } else {
        const stderr = result.stderr?.trim() || 'Unknown yt-dlp error';
        console.warn(`[DouyinAdapter] yt-dlp fetch failed for ${url}: ${stderr}`);
        // For short links, we must resolve the canonical ID. If it fails, error out explicitly.
        if (!canonicalId) {
          throw new Error(`Douyin metadata capture failed (likely needs cookies or mobile headers): ${stderr}`);
        }
      }
    } catch (e: any) {
      console.warn(`[DouyinAdapter] Metadata fetch failed: ${e.message}`);
      if (e.message.includes('metadata capture failed')) {
        throw e;
      }
    }

    const finalId = canonicalId || nanoid();

    return {
      id: `dy-${finalId}`,
      sourceClass: 'short_video',
      platform: 'douyin',
      url,
      title: title === 'Douyin Video' ? `Douyin Video ${finalId}` : title,
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

export const douyinAdapter = new DouyinSourceAdapter();
