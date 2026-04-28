import { Source, Platform } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { execSync } from 'child_process';

export class XSourceAdapter {
  async capture(url: string): Promise<Source> {
    // URL formats:
    // https://x.com/username/status/1234567890
    // https://twitter.com/username/status/1234567890
    const statusIdMatch = url.match(/\/status\/(\d+)/);
    const statusId = statusIdMatch ? statusIdMatch[1] : nanoid();

    console.log(`[XAdapter] Capturing URL: ${url} (Status ID: ${statusId})`);

    let title = `X Post ${statusId}`;
    let author = 'X User';
    let thumbnailUrl = '';

    try {
      // Use yt-dlp to get real metadata if possible
      const cmd = `yt-dlp --dump-json --skip-download "${url}"`;
      console.log(`[XAdapter] Running: ${cmd}`);
      const json = execSync(cmd, { stdio: ['ignore', 'pipe', 'ignore'] }).toString();
      const metadata = JSON.parse(json);
      
      title = metadata.title || metadata.description || title;
      author = metadata.uploader || metadata.channel || author;
      thumbnailUrl = metadata.thumbnail || '';
    } catch (e: any) {
      console.warn(`[XAdapter] Metadata fetch failed (common for X without cookies): ${e.message}`);
    }

    return {
      id: `x-${statusId}`,
      sourceClass: 'social_post',
      platform: 'x',
      url,
      title,
      author,
      thumbnailUrl,
      capturedAt: new Date().toISOString(),
      metadata: {
        statusId
      }
    };
  }
}

export const xAdapter = new XSourceAdapter();
