import { Source } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { spawnSync } from 'child_process';

export class BilibiliSourceAdapter {
  async capture(url: string): Promise<Source> {
    console.log(`[BilibiliAdapter] Capturing URL: ${url}`);

    let title = `Bilibili Video`;
    let author = 'Bilibili Creator';
    let thumbnailUrl = '';
    let duration = 0;
    let canonicalId = '';

    try {
      // Use yt-dlp to get real metadata
      const args = ['--proxy', '', '--socket-timeout', '30', '--dump-json', '--skip-download', url];
      console.log(`[BilibiliAdapter] Running: yt-dlp ${args.join(' ')}`);
      
      const result = spawnSync('yt-dlp', args, { encoding: 'utf-8' });
      
      if (result.status === 0) {
        const metadata = JSON.parse(result.stdout);
        if (metadata.id) {
          canonicalId = metadata.id;
        }
        title = metadata.title || metadata.description || `Bilibili Video ${canonicalId}`;
        author = metadata.uploader || metadata.channel || author;
        thumbnailUrl = metadata.thumbnail || '';
        duration = metadata.duration || 0;
      } else {
        const stderr = result.stderr?.trim() || 'Unknown yt-dlp error';
        console.warn(`[BilibiliAdapter] yt-dlp fetch failed for ${url}: ${stderr}`);
        
        // If it's a direct video link, we might be able to extract ID from URL as fallback
        const bvMatch = url.match(/(BV[a-zA-Z0-9]+)/);
        const avMatch = url.match(/(av\d+)/);
        canonicalId = bvMatch ? bvMatch[1] : (avMatch ? avMatch[1] : '');

        if (!canonicalId) {
          throw new Error(`Bilibili metadata capture failed: ${stderr}`);
        }
      }
    } catch (e: any) {
      console.warn(`[BilibiliAdapter] Metadata fetch failed: ${e.message}`);
      if (e.message.includes('metadata capture failed')) {
        throw e;
      }
    }

    const finalId = canonicalId || nanoid();

    return {
      id: `bili-${finalId}`,
      sourceClass: 'long_video',
      platform: 'bilibili',
      url,
      title: title === 'Bilibili Video' ? `Bilibili Video ${finalId}` : title,
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

export const bilibiliAdapter = new BilibiliSourceAdapter();
