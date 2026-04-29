import { Source } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { execSync } from 'child_process';

export class XiaoyuzhouSourceAdapter {
  async capture(url: string): Promise<Source> {
    // URL example: https://www.xiaoyuzhoufm.com/episode/662a...
    const episodeIdMatch = url.match(/\/episode\/([a-zA-Z0-9]+)/);
    const episodeId = episodeIdMatch ? episodeIdMatch[1] : nanoid();

    console.log(`[XiaoyuzhouAdapter] Capturing URL: ${url} (Episode ID: ${episodeId})`);

    let title = `Xiaoyuzhou Episode ${episodeId}`;
    let author = 'Unknown Podcast';
    let duration = 0;
    let thumbnailUrl = '';
    let mediaUrl = '';
    let publishedAt = '';
    let shownotes = '';

    try {
      // Use curl fallback if fetch fails (same as YouTube)
      let html = '';
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        html = await response.text();
      } catch (e) {
        html = execSync(`curl -sL "${url}" -H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"`, { maxBuffer: 10 * 1024 * 1024 }).toString();
      }

      // Xiaoyuzhou uses Next.js, metadata is often in __NEXT_DATA__
      const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
      if (nextDataMatch) {
        const nextData = JSON.parse(nextDataMatch[1]);
        const episode = nextData.props?.pageProps?.episode;
        if (episode) {
          title = episode.title || title;
          author = episode.podcast?.title || author;
          duration = episode.duration || 0;
          thumbnailUrl = episode.image?.picUrl || episode.podcast?.image?.picUrl || '';
          mediaUrl = episode.media?.source?.url || episode.media?.url || '';
          publishedAt = episode.pubDate || '';
          shownotes = episode.shownotes || '';
        }
      } else {
        // Fallback to basic meta tags
        const titleMatch = html.match(/<meta property="og:title" content="(.*?)"/);
        if (titleMatch) title = titleMatch[1];
      }
    } catch (error: any) {
      console.warn(`[XiaoyuzhouAdapter] Failed to fetch full metadata: ${error.message}. Using partial data.`);
    }

    return {
      id: `xyz-${episodeId}`,
      sourceClass: 'podcast_audio',
      platform: 'xiaoyuzhou',
      url,
      title,
      author,
      thumbnailUrl,
      duration,
      publishedAt,
      capturedAt: new Date().toISOString(),
      canonicalId: episodeId,
      shownotes,
      metadata: {
        episodeId,
        mediaUrl
      }
    };
  }
}

export const xiaoyuzhouAdapter = new XiaoyuzhouSourceAdapter();
