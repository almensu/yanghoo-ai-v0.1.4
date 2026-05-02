import { Source, Platform } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { runYtDlpMetadata, stringifyYtDlpArgs } from './ytDlpMetadataOptions.js';

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
      const args = ['--dump-json', '--skip-download', url];
      console.log(`[XAdapter] Running: yt-dlp ${stringifyYtDlpArgs(args)}`);
      
      const result = runYtDlpMetadata(args);
      
      if (result.status === 0) {
        const metadata = JSON.parse(result.stdout);
        title = metadata.title || metadata.description || title;
        author = metadata.uploader || metadata.channel || author;
        thumbnailUrl = metadata.thumbnail || '';
      } else {
        const stderr = result.stderr?.trim() || 'Unknown yt-dlp error';
        console.warn(`[XAdapter] yt-dlp fetch failed for ${url}: ${stderr}`);
        
        // X is notorious for needing cookies. If it fails, we should expose it 
        // if we want "real exposure" as per instructions.
        if (stderr.includes('Sign in to confirm you’re not a bot') || stderr.includes('Available only to registered users')) {
          throw new Error(`X metadata capture failed (requires cookies/auth): ${stderr}`);
        }
      }
    } catch (e: any) {
      console.warn(`[XAdapter] Metadata fetch failed: ${e.message}`);
      if (e.message.includes('metadata capture failed')) {
        throw e;
      }
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
      canonicalId: statusId,
      metadata: {
        statusId
      }
    };
  }
}

export const xAdapter = new XSourceAdapter();
