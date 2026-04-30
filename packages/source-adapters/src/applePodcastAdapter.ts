import { Source } from '@yanghoo/domain';
import { nanoid } from 'nanoid';

export class ApplePodcastSourceAdapter {
  async capture(url: string): Promise<Source> {
    console.log(`[ApplePodcastAdapter] Capturing URL: ${url}`);

    // https://podcasts.apple.com/us/podcast/blackjack/id201671138?i=1000551710062
    const showIdMatch = url.match(/\/id(\d+)/);
    const episodeIdMatch = url.match(/[?&]i=(\d+)/);

    const showId = showIdMatch ? showIdMatch[1] : '';
    const episodeId = episodeIdMatch ? episodeIdMatch[1] : nanoid();

    let title = `Apple Podcast Episode ${episodeId}`;
    let author = 'Unknown Podcast';
    let thumbnailUrl = '';
    let duration = 0;
    let mediaUrl = '';
    let publishedAt = '';

    if (showId && episodeId && episodeId !== showId) {
      try {
        console.log(`[ApplePodcastAdapter] Fetching iTunes API for show: ${showId}, episode: ${episodeId}`);
        // Fetch up to 200 episodes to find the specific one
        const apiUrl = `https://itunes.apple.com/lookup?id=${showId}&entity=podcastEpisode&limit=200`;
        
        let data: any;
        try {
          const response = await fetch(apiUrl);
          if (response.ok) {
            data = await response.json();
          }
        } catch (fetchError) {
          // Fallback to curl if fetch fails
          const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7897';
          const proxyArg = proxy ? `-x ${proxy}` : '';
          const { execSync } = await import('child_process');
          const result = execSync(`curl ${proxyArg} -sL "${apiUrl}"`).toString();
          data = JSON.parse(result);
        }

        if (data && data.results && data.results.length > 0) {
          // The first result is usually the show itself, subsequent results are episodes
          const episode = data.results.find((r: any) => String(r.trackId) === episodeId);
          if (episode) {
            title = episode.trackName || title;
            author = episode.artistName || author;
            thumbnailUrl = episode.artworkUrl600 || episode.artworkUrl160 || thumbnailUrl;
            mediaUrl = episode.episodeUrl || mediaUrl;
            duration = episode.trackTimeMillis ? Math.floor(episode.trackTimeMillis / 1000) : duration;
            publishedAt = episode.releaseDate || publishedAt;
            console.log(`[ApplePodcastAdapter] Successfully matched episode metadata via iTunes API.`);
          } else {
            console.warn(`[ApplePodcastAdapter] Episode ${episodeId} not found in iTunes API results.`);
          }
        }
      } catch (e: any) {
        console.warn(`[ApplePodcastAdapter] Failed to fetch from iTunes API: ${e.message}`);
      }
    }

    // Fallback to basic HTML scraping if iTunes API fails or doesn't find the mediaUrl
    if (!mediaUrl) {
      try {
        console.log(`[ApplePodcastAdapter] Falling back to HTML scrape for URL: ${url}`);
        let html = '';
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
          });
          if (response.ok) html = await response.text();
        } catch (fetchError) {
          const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7897';
          const proxyArg = proxy ? `-x ${proxy}` : '';
          const { execSync } = await import('child_process');
          html = execSync(`curl ${proxyArg} -sL "${url}" -H "User-Agent: Mozilla/5.0"`).toString();
        }
        
        if (html) {
          const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
          if (titleMatch && title.startsWith('Apple Podcast')) title = htmlUnescape(titleMatch[1]);
          
          const authorMatch = html.match(/"author"\s*:\s*"([^"]+)"/);
          if (authorMatch && author === 'Unknown Podcast') author = authorMatch[1].replace(/\\/g, '');

          const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
          if (imageMatch && !thumbnailUrl) thumbnailUrl = imageMatch[1];
          
          const audioMatch = html.match(/"assetUrl"\s*:\s*"([^"]+)"/);
          if (audioMatch) {
            mediaUrl = audioMatch[1].replace(/\\/g, '');
          } else {
            const enclosureMatch = html.match(/<meta property="og:audio" content="([^"]+)"/);
            if (enclosureMatch) mediaUrl = enclosureMatch[1];
          }
        }
      } catch (e: any) {
        console.warn(`[ApplePodcastAdapter] Failed HTML scrape: ${e.message}`);
      }
    }

    return {
      id: `apple-podcast-${episodeId}`,
      sourceClass: 'podcast_audio',
      platform: 'apple_podcast',
      url,
      title,
      author,
      thumbnailUrl,
      duration,
      publishedAt,
      capturedAt: new Date().toISOString(),
      canonicalId: episodeId,
      metadata: {
        showId,
        episodeId,
        mediaUrl
      }
    };
  }
}

function htmlUnescape(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

export const applePodcastAdapter = new ApplePodcastSourceAdapter();
