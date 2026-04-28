import { Source } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { execSync } from 'child_process';

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
      // Douyin often requires a mobile User-Agent or specific headers
      const cmd = `yt-dlp --dump-json --skip-download "${url}"`;
      console.log(`[DouyinAdapter] Running: ${cmd}`);
      const json = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      const metadata = JSON.parse(json);
      
      title = metadata.title || metadata.description || title;
      author = metadata.uploader || metadata.channel || author;
      thumbnailUrl = metadata.thumbnail || '';
      duration = metadata.duration || 0;
    } catch (e: any) {
      console.warn(`[DouyinAdapter] Metadata fetch failed: ${e.message}`);
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
      metadata: {
        videoId
      }
    };
  }
}

export const douyinAdapter = new DouyinSourceAdapter();
