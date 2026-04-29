import { Source } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { execSync, spawnSync } from 'child_process';

export class DouyinSourceAdapter {
  async capture(url: string): Promise<Source> {
    // Typical format: https://v.douyin.com/XYZ/ or https://www.douyin.com/video/ID
    const videoIdMatch = url.match(/\/video\/(\d+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : (url.split('/').filter(Boolean).pop() || nanoid());

    console.log(`[DouyinAdapter] Capturing URL: ${url} (Video ID: ${videoId})`);

    let title = `Douyin Video ${videoId}`;
    let author = 'Douyin Creator';
    let thumbnailUrl = '';
    let duration = 0;

    try {
      // Use yt-dlp to get real metadata
      const args = ['--proxy', '', '--dump-json', '--skip-download', url];
      console.log(`[DouyinAdapter] Running: yt-dlp ${args.join(' ')}`);
      
      const result = spawnSync('yt-dlp', args, { encoding: 'utf-8' });
      
      if (result.status === 0) {
        const metadata = JSON.parse(result.stdout);
        title = metadata.title || metadata.description || title;
        author = metadata.uploader || metadata.channel || author;
        thumbnailUrl = metadata.thumbnail || '';
        duration = metadata.duration || 0;
      } else {
        const stderr = result.stderr?.trim() || 'Unknown yt-dlp error';
        console.warn(`[DouyinAdapter] yt-dlp fetch failed for ${url}: ${stderr}`);
        // For short links, we might not have a good ID yet if yt-dlp fails
        if (url.includes('v.douyin.com') && !videoIdMatch) {
          throw new Error(`Douyin metadata capture failed (likely needs cookies or mobile headers): ${stderr}`);
        }
      }
    } catch (e: any) {
      console.warn(`[DouyinAdapter] Metadata fetch failed: ${e.message}`);
      if (e.message.includes('metadata capture failed')) {
        throw e;
      }
    }

    return {
      id: `dy-${videoId}`,
      sourceClass: 'short_video',
      platform: 'douyin',
      url,
      title,
      author,
      thumbnailUrl,
      duration,
      capturedAt: new Date().toISOString(),
      canonicalId: videoId,
      metadata: {
        videoId
      }
    };
  }
}

export const douyinAdapter = new DouyinSourceAdapter();
