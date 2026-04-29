import { Source, SourceClass, Platform, TranscriptSegment } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';

export interface RawYouTubeMetadata {
  id: string;
  title: string;
  author: string;
  duration: number;
  thumbnailUrl: string;
  url: string;
}

export interface FetchTranscriptResult {
  segments: TranscriptSegment[];
  language?: string;
  trackName?: string;
}

export class YouTubeSourceAdapter {
  private readonly WATCH_URL = 'https://www.youtube.com/watch?v=';
  private readonly INNERTUBE_URL = 'https://www.youtube.com/youtubei/v1/player';
  private readonly INNERTUBE_CTX = { 
    client: { 
      clientName: 'ANDROID', 
      clientVersion: '20.10.38'
    } 
  };

  /**
   * Captures metadata from a YouTube URL using InnerTube API.
   */
  async capture(url: string): Promise<Source> {
    const videoIdMatch = url.match(/(?:v=|\/be\/|embed\/|v\/|shorts\/)([^#&?]*)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : nanoid();

    console.log(`[YouTubeAdapter] Capturing URL: ${url} (Video ID: ${videoId})`);

    const source: Source = {
      id: `yt-${videoId}`,
      sourceClass: 'long_video',
      platform: 'youtube',
      url,
      title: `YouTube Video ${videoId}`,
      author: 'Unknown Creator',
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: 0,
      capturedAt: new Date().toISOString(),
      canonicalId: videoId,
      metadata: {
        videoId
      }
    };

    try {
      const metadata = await this.fetchMetadataFromInnerTube(videoId);
      if (metadata) {
        const videoDetails = metadata.videoDetails;
        if (videoDetails) {
          source.title = videoDetails.title || source.title;
          source.author = videoDetails.author || source.author;
          source.duration = parseInt(videoDetails.lengthSeconds || '0', 10);
          
          if (videoDetails.thumbnail?.thumbnails?.length > 0) {
            // Pick the largest thumbnail
            const thumbnails = videoDetails.thumbnail.thumbnails;
            source.thumbnailUrl = thumbnails[thumbnails.length - 1].url;
          }
        }
        
        // Store caption tracks in metadata for later use
        if (metadata.captions?.playerCaptionsTracklistRenderer?.captionTracks) {
          source.metadata = {
            ...source.metadata,
            captionTracks: metadata.captions.playerCaptionsTracklistRenderer.captionTracks
          };
        }
      }
    } catch (e: any) {
      console.warn(`[YouTubeAdapter] InnerTube metadata fetch failed: ${e.message}`);
      // Fallback to minimal metadata
    }

    return source;
  }

  private async fetchHtml(videoId: string): Promise<string> {
    const url = this.WATCH_URL + videoId;
    console.log(`[YouTubeAdapter] Fetching watch page: ${url}`);
    
    try {
      const r = await fetch(url, {
        headers: { 
          'Accept-Language': 'en-US',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
        },
      });
      if (!r.ok) throw new Error(`HTTP ${r.status} fetching video page`);
      let html = await r.text();
      
      if (html.includes('action="https://consent.youtube.com/s"')) {
        console.log(`[YouTubeAdapter] Handling consent for ${videoId}`);
        const cv = html.match(/name="v" value="(.*?)"/);
        if (cv) {
          const r2 = await fetch(url, {
            headers: {
              'Accept-Language': 'en-US',
              'User-Agent': 'Mozilla/5.0',
              Cookie: `CONSENT=YES+${cv[1]}`,
            },
          });
          if (r2.ok) html = await r2.text();
          else throw new Error(`HTTP ${r2.status} fetching video page (consent)`);
        } else {
           throw new Error("Failed to create consent cookie");
        }
      }
      return html;
    } catch (e: any) {
      // Fallback to curl
      console.warn(`[YouTubeAdapter] fetchHtml failed, using curl fallback: ${e.message}`);
      const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7897';
      const proxyArg = proxy ? `-x ${proxy}` : '';
      try {
        return execSync(`curl ${proxyArg} -sL "${url}" -H "User-Agent: Mozilla/5.0" -H "Accept-Language: en-US"`, { maxBuffer: 10 * 1024 * 1024 }).toString();
      } catch (curlError: any) {
        throw new Error(`fetchHtml curl failed: ${curlError.message}`);
      }
    }
  }

  private extractApiKey(html: string, videoId: string): string {
    const m = html.match(/"INNERTUBE_API_KEY":\s*"([a-zA-Z0-9_-]+)"/);
    if (!m) {
      if (html.includes('class="g-recaptcha"')) throw new Error(`IP blocked for ${videoId} (reCAPTCHA)`);
      throw new Error(`Cannot extract API key for ${videoId}`);
    }
    return m[1];
  }

  private assertPlayability(data: any, videoId: string) {
    const ps = data?.playabilityStatus;
    if (!ps) return;
    const status = ps.status;
    if (status === "OK" || !status) return;
    const reason = ps.reason || "";
    if (status === "LOGIN_REQUIRED") {
      if (reason.includes("bot")) throw new Error(`Request blocked for ${videoId}: bot detected`);
      if (reason.includes("inappropriate")) throw new Error(`Age restricted: ${videoId}`);
    }
    if (status === "ERROR" && reason.includes("unavailable")) {
      throw new Error(`Video unavailable: ${videoId}`);
    }
    const subreasons = ps.errorScreen?.playerErrorMessageRenderer?.subreason?.runs?.map((r: any) => r.text).join("") || "";
    throw new Error(`Video unplayable (${videoId}): ${reason} ${subreasons}`.trim());
  }

  /**
   * Calls YouTube's internal InnerTube API dynamically.
   */
  private async fetchMetadataFromInnerTube(videoId: string): Promise<any> {
    try {
      const html = await this.fetchHtml(videoId);
      const apiKey = this.extractApiKey(html, videoId);
      
      const url = `${this.INNERTUBE_URL}?key=${apiKey}`;
      const payload = {
        context: this.INNERTUBE_CTX,
        videoId
      };

      console.log(`[YouTubeAdapter] Calling InnerTube v1/player for: ${videoId}`);

      let data: any;
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0'
          },
          body: JSON.stringify(payload)
        });
        
        if (response.status === 429) throw new Error(`IP blocked for ${videoId} (429)`);
        if (!response.ok) {
          throw new Error(`InnerTube API returned HTTP ${response.status}`);
        }
        
        data = await response.json();
      } catch (e: any) {
        if (e.message.includes('429')) throw e;
        const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7897';
        const proxyArg = proxy ? `-x ${proxy}` : '';
        const payloadStr = JSON.stringify(payload).replace(/"/g, '\\"');
        const cmd = `curl ${proxyArg} -s -X POST "${url}" -H "Content-Type: application/json" -H "User-Agent: Mozilla/5.0" -d "${payloadStr}"`;
        const result = execSync(cmd, { maxBuffer: 10 * 1024 * 1024 }).toString();
        data = JSON.parse(result);
      }
      
      this.assertPlayability(data, videoId);
      return data;
    } catch (e: any) {
      console.error(`[YouTubeAdapter] InnerTube call failed: ${e.message}`);
      // Return clear errors
      if (e.message.includes('ENOTFOUND') || e.message.includes('ETIMEDOUT') || e.message.includes('ECONNREFUSED') || e.message.includes('SSL') || e.message.includes('fetch') || e.message.includes('curl failed')) {
        throw new Error('YouTube 字幕接口连接失败，请检查网络或代理');
      }
      if (e.message.includes('Cannot extract')) {
        throw new Error('YouTube 字幕接口配置无效');
      }
      if (e.message.includes('IP blocked') || e.message.includes('429')) {
        throw new Error('请求频繁，已被 YouTube 暂时限制 IP，请稍后再试或切换代理');
      }
      if (e.message.includes('Video unavailable') || e.message.includes('unplayable')) {
        throw new Error(`视频无法播放: ${e.message}`);
      }
      throw e;
    }
  }

  async fetchMetadata(url: string): Promise<any> {
    const videoIdMatch = url.match(/(?:v=|\/be\/|embed\/|v\/|shorts\/)([^#&?]*)/);
    if (!videoIdMatch) return null;
    const metadata = await this.fetchMetadataFromInnerTube(videoIdMatch[1]);
    if (!metadata?.videoDetails) return null;
    
    return {
      title: metadata.videoDetails.title,
      uploader: metadata.videoDetails.author,
      duration: parseInt(metadata.videoDetails.lengthSeconds || '0', 10),
      thumbnail: metadata.videoDetails.thumbnail?.thumbnails?.[0]?.url
    };
  }

  async refreshMetadata(source: Source): Promise<Source> {
    const videoId = source.metadata?.videoId || source.canonicalId;
    if (!videoId) return source;

    console.log(`[YouTubeAdapter] Refreshing metadata for: ${source.id} via InnerTube`);
    
    const metadata = await this.fetchMetadataFromInnerTube(videoId);
    if (metadata?.videoDetails) {
      const videoDetails = metadata.videoDetails;
      source.title = videoDetails.title || source.title;
      source.author = videoDetails.author || source.author;
      source.duration = parseInt(videoDetails.lengthSeconds || '0', 10);
      if (videoDetails.thumbnail?.thumbnails?.length > 0) {
        source.thumbnailUrl = videoDetails.thumbnail.thumbnails[videoDetails.thumbnail.thumbnails.length - 1].url;
      }
    }
    
    return source;
  }

  /**
   * Fetches real transcript segments for a given video ID using InnerTube caption tracks.
   */
  async fetchTranscript(videoId: string): Promise<FetchTranscriptResult> {
    console.log(`[YouTubeAdapter] Fetching InnerTube transcript for video: ${videoId}`);
    
    try {
      const metadata = await this.fetchMetadataFromInnerTube(videoId);
      const captionTracks = metadata?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      
      if (!captionTracks || captionTracks.length === 0) {
        throw new Error(`No caption tracks found for video: ${videoId}`);
      }
      
      // Preferred languages: Chinese (Simplified/Traditional), then English, then first available
      const preferredLangs = ['zh-Hans', 'zh-Hant', 'zh', 'en'];
      let selectedTrack = captionTracks[0];
      
      for (const lang of preferredLangs) {
        const track = captionTracks.find((t: any) => t.languageCode === lang);
        if (track) {
          selectedTrack = track;
          break;
        }
      }
      
      const baseUrl = selectedTrack.baseUrl.replace(/&fmt=[^&]*/g, '');
      const transcriptUrl = baseUrl + (baseUrl.includes('?') ? '&' : '?') + 'fmt=json3';
      
      console.log(`[YouTubeAdapter] Loading transcript from InnerTube URL: ${transcriptUrl} (lang: ${selectedTrack.languageCode})`);
      
      let transcriptData: any;
      try {
        const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7897';
        const response = await fetch(transcriptUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const text = await response.text();
        transcriptData = JSON.parse(text);
      } catch (e) {
        const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7897';
        const proxyArg = proxy ? `-x ${proxy}` : '';
        const result = execSync(`curl ${proxyArg} -sL "${transcriptUrl}"`, { maxBuffer: 10 * 1024 * 1024 }).toString();
        transcriptData = JSON.parse(result);
      }
      
      if (!transcriptData.events) {
        throw new Error(`Invalid transcript data format from InnerTube for video: ${videoId}`);
      }
      
      const segments: TranscriptSegment[] = transcriptData.events
        .filter((event: any) => event.segs)
        .map((event: any) => {
          const text = event.segs.map((seg: any) => seg.utf8).join('').trim();
          const start = event.tStartMs / 1000;
          const duration = (event.dDurationMs || 0) / 1000;
          return {
            text,
            start,
            end: start + duration
          };
        });
        
      if (segments.length === 0) {
        throw new Error(`Fetched InnerTube transcript has 0 segments for video: ${videoId}`);
      }

      return {
        segments,
        language: selectedTrack.languageCode,
        trackName: selectedTrack.name?.simpleText || 'InnerTube platform caption'
      };
    } catch (error: any) {
      console.error(`[YouTubeAdapter] Error fetching InnerTube transcript: ${error.message}`);
      throw error;
    }
  }
}

export const youtubeAdapter = new YouTubeSourceAdapter();
