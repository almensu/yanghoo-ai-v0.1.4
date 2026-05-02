import { Source } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { runYtDlpMetadata, stringifyYtDlpArgs } from './ytDlpMetadataOptions.js';

export class XiaohongshuSourceAdapter {
  async capture(input: string): Promise<Source> {
    // 1. Extract URL from text (handles mobile share snippets)
    // Supports:
    // https://www.xiaohongshu.com/discovery/item/ID
    // https://www.xiaohongshu.com/explore/ID
    // http://xhslink.com/o/TOKEN
    const xhsUrlRegex = /(https?:\/\/(?:www\.xiaohongshu\.com|xhslink\.com)\/[^\s，,。！!）)]+)/;
    const urlMatch = input.match(xhsUrlRegex);
    const url = urlMatch ? urlMatch[0] : input.trim();

    console.log(`[XiaohongshuAdapter] Extracted URL: ${url}`);

    let title = 'Xiaohongshu Post';
    let author = 'XHS User';
    let thumbnailUrl = '';
    let duration = 0;
    let canonicalId = '';

    // Try to pre-extract ID from PC URLs for a better default title/ID
    const pcIdMatch = url.match(/\/(?:explore|discovery\/item)\/([a-zA-Z0-9]+)/);
    if (pcIdMatch) {
      canonicalId = pcIdMatch[1];
      title = `Xiaohongshu Post ${canonicalId}`;
    }

    try {
      // 2. Use yt-dlp to get real canonical metadata
      const args = ['--dump-json', '--skip-download', url];
      console.log(`[XiaohongshuAdapter] Running: yt-dlp ${stringifyYtDlpArgs(args)}`);
      
      const result = runYtDlpMetadata(args);
      
      if (result.status === 0) {
        const metadata = JSON.parse(result.stdout);
        
        // Use the canonical ID returned by yt-dlp to ensure deduplication
        if (metadata.id) {
          canonicalId = metadata.id;
        }
        
        title = metadata.title || title;
        author = metadata.uploader || metadata.channel || author;
        thumbnailUrl = metadata.thumbnail || '';
        duration = metadata.duration || 0;
      } else {
        const stderr = result.stderr?.trim() || 'Unknown yt-dlp error';
        console.warn(`[XiaohongshuAdapter] yt-dlp fetch failed for ${url}: ${stderr}`);
        
        // If we have a pre-extracted ID, we can still create the card but mark it?
        // Actually, instructions say "expose real issues". 
        if (!canonicalId) {
          throw new Error(`Xiaohongshu metadata capture failed: ${stderr}`);
        }
      }
    } catch (e: any) {
      console.warn(`[XiaohongshuAdapter] Capture process warning: ${e.message}`);
      if (e.message.includes('metadata capture failed')) {
        throw e;
      }
    }

    // Ensure postId is path-safe and canonical by stripping query strings or trailing garbage
    // Some legacy or edge cases might include URL parameters in the ID
    let postId = canonicalId || nanoid();
    if (postId.includes('?')) {
      postId = postId.split('?')[0];
    }
    if (postId.includes('#')) {
      postId = postId.split('#')[0];
    }

    return {
      id: `xhs-${postId}`,
      sourceClass: 'short_video',
      platform: 'xiaohongshu',
      url, // Preserve the input URL for history, but could also use metadata.webpage_url
      title,
      author,
      thumbnailUrl,
      duration,
      capturedAt: new Date().toISOString(),
      canonicalId: postId,
      metadata: {
        postId,
        originalInput: input !== url ? input : undefined
      }
    };
  }
}

export const xiaohongshuAdapter = new XiaohongshuSourceAdapter();
