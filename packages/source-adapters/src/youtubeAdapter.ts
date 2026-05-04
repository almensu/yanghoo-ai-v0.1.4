import { Source, SourceClass, Platform, TranscriptSegment } from '@yanghoo/domain';
import { nanoid } from 'nanoid';
import { execFileSync, execSync } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export const YOUTUBE_NO_CAPTION_TRACKS_MESSAGE = 'YouTube video has no caption tracks';

export function isYouTubeNoCaptionError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes(YOUTUBE_NO_CAPTION_TRACKS_MESSAGE) ||
    message.includes('No caption tracks found') ||
    message.includes('No requested YouTube English/Simplified Chinese caption variants found') ||
    message.includes('Fetched InnerTube transcript has 0 segments')
  );
}

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
  isTranslated?: boolean;
  sourceLanguage?: string;
  requestedLanguage?: string;
}

export interface FetchTranscriptBundleOptions {
  languages?: ('en' | 'zh-Hans')[];
}

export interface FetchTranscriptBundleResult {
  primary: FetchTranscriptResult;
  english?: FetchTranscriptResult;
  simplifiedChinese?: FetchTranscriptResult;
  availableTracks: {
    language: string;
    languageCode: string;
    isGenerated: boolean;
    isTranslatable: boolean;
  }[];
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
        
        // Store caption availability in metadata for later use.
        const captionTracks = metadata.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (captionTracks) {
          source.metadata = {
            ...source.metadata,
            captionTracks,
            hasCaptionTracks: captionTracks.length > 0
          };
        } else if (metadata.captions?.playerCaptionsTracklistRenderer) {
          source.metadata = {
            ...source.metadata,
            captionTracks: [],
            hasCaptionTracks: false
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

    const captionTracks = metadata?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    if (captionTracks) {
      source.metadata = {
        ...source.metadata,
        captionTracks,
        hasCaptionTracks: captionTracks.length > 0
      };
    } else if (metadata?.captions?.playerCaptionsTracklistRenderer) {
      source.metadata = {
        ...source.metadata,
        captionTracks: [],
        hasCaptionTracks: false
      };
    }
    
    return source;
  }

  /**
   * Fetches English and Simplified Chinese transcript variants. Simplified Chinese
   * is actively requested through YouTube's timedtext machine translation
   * (`tlang=zh-Hans`) when a native zh-Hans caption track is not available.
   */
  async fetchTranscriptBundle(videoId: string, options?: FetchTranscriptBundleOptions): Promise<FetchTranscriptBundleResult> {
    const requestedLanguages = options?.languages || ['en', 'zh-Hans'];
    const label = requestedLanguages.length === 1 ? requestedLanguages[0] : 'bilingual';
    console.log(`[YouTubeAdapter] Fetching ${label} InnerTube transcript for video: ${videoId}`);

    try {
      const metadata = await this.fetchMetadataFromInnerTube(videoId);
      const captionsRenderer = metadata?.captions?.playerCaptionsTracklistRenderer;
      const captionTracks = captionsRenderer?.captionTracks;

      if (!captionTracks || captionTracks.length === 0) {
        throw new Error(`${YOUTUBE_NO_CAPTION_TRACKS_MESSAGE}: ${videoId}`);
      }

      const translationLanguages = this.extractTranslationLanguages(captionsRenderer);

      const fetchEn = requestedLanguages.includes('en')
        ? this.fetchCaptionVariant(videoId, captionTracks, translationLanguages, 'en')
        : Promise.resolve(null);
      const fetchZh = requestedLanguages.includes('zh-Hans')
        ? this.fetchCaptionVariant(videoId, captionTracks, translationLanguages, 'zh-Hans')
        : Promise.resolve(null);

      const [english, simplifiedChinese] = await Promise.all([fetchEn, fetchZh]);

      if (!english && !simplifiedChinese) {
        throw new Error(`No requested YouTube caption variants found for video: ${videoId} (requested: ${requestedLanguages.join(', ')})`);
      }

      return {
        primary: english ?? simplifiedChinese!,
        english: english ?? undefined,
        simplifiedChinese: simplifiedChinese ?? undefined,
        availableTracks: captionTracks.map((track: any) => ({
          language: this.getTrackName(track),
          languageCode: track.languageCode,
          isGenerated: track.kind === 'asr',
          isTranslatable: !!track.isTranslatable
        }))
      };
    } catch (error: any) {
      console.error(`[YouTubeAdapter] Error fetching InnerTube transcript: ${error.message}`);
      throw error;
    }
  }

  /**
   * Backward-compatible single transcript API. Prefer the bilingual bundle in
   * application code so English and zh-Hans assets can be persisted together.
   */
  async fetchTranscript(videoId: string): Promise<FetchTranscriptResult> {
    const bundle = await this.fetchTranscriptBundle(videoId);
    return bundle.simplifiedChinese ?? bundle.english ?? bundle.primary;
  }

  private async fetchCaptionVariant(
    videoId: string,
    captionTracks: any[],
    translationLanguages: { language: string; languageCode: string }[],
    requestedLanguage: 'en' | 'zh-Hans'
  ): Promise<FetchTranscriptResult | null> {
    const candidates = this.buildCaptionCandidates(captionTracks, translationLanguages, requestedLanguage);
    const errors: string[] = [];

    for (const candidate of candidates) {
      const transcriptUrl = this.buildTranscriptUrl(candidate.track.baseUrl, candidate.translateTo);
      try {
        console.log(
          `[YouTubeAdapter] Loading ${requestedLanguage} transcript from InnerTube URL` +
          ` (track: ${candidate.track.languageCode}, translated: ${candidate.isTranslated ? 'yes' : 'no'})`
        );
        const transcriptData = await this.fetchTranscriptJson(transcriptUrl);
        const segments = this.parseTranscriptJsonSegments(transcriptData);

        if (segments.length === 0) {
          throw new Error(`Fetched InnerTube transcript has 0 segments`);
        }

        return {
          segments,
          language: requestedLanguage,
          requestedLanguage,
          isTranslated: candidate.isTranslated,
          sourceLanguage: candidate.isTranslated ? candidate.track.languageCode : undefined,
          trackName: candidate.isTranslated
            ? `${this.getTrackName(candidate.track)} -> ${requestedLanguage} (YouTube machine translation)`
            : this.getTrackName(candidate.track)
        };
      } catch (error: any) {
        errors.push(`${requestedLanguage} via ${candidate.track.languageCode}${candidate.translateTo ? `->${candidate.translateTo}` : ''}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      console.warn(`[YouTubeAdapter] ${requestedLanguage} transcript attempts failed: ${errors.join(' | ')}`);
    }

    try {
      return this.fetchCaptionVariantWithYtDlp(videoId, requestedLanguage, errors);
    } catch (error: any) {
      console.warn(`[YouTubeAdapter] yt-dlp ${requestedLanguage} subtitle fallback failed: ${error.message}`);
      return null;
    }
  }

  private buildCaptionCandidates(
    captionTracks: any[],
    translationLanguages: { language: string; languageCode: string }[],
    requestedLanguage: 'en' | 'zh-Hans'
  ): { track: any; translateTo?: string; isTranslated: boolean }[] {
    const directTracks = requestedLanguage === 'en'
      ? captionTracks.filter((track: any) => this.isEnglishLanguage(track.languageCode))
      : captionTracks.filter((track: any) => this.isSimplifiedChineseLanguage(track.languageCode));

    const candidates: { track: any; translateTo?: string; isTranslated: boolean }[] = directTracks.map((track: any) => ({
      track,
      isTranslated: false
    }));

    const translateTo = this.resolveTranslationTargetCode(translationLanguages, requestedLanguage);
    if (translateTo) {
      const preferredBaseTracks = [...captionTracks].sort((a: any, b: any) => {
        const aScore = this.translationBaseTrackScore(a, requestedLanguage);
        const bScore = this.translationBaseTrackScore(b, requestedLanguage);
        return bScore - aScore;
      });

      for (const track of preferredBaseTracks) {
        if (!track.isTranslatable) continue;
        if (this.isSameLanguageFamily(track.languageCode, requestedLanguage)) continue;
        candidates.push({
          track,
          translateTo,
          isTranslated: true
        });
      }
    }

    const seen = new Set<string>();
    return candidates.filter((candidate) => {
      const key = `${candidate.track.languageCode}:${candidate.translateTo ?? 'direct'}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private resolveTranslationTargetCode(
    translationLanguages: { language: string; languageCode: string }[],
    requestedLanguage: 'en' | 'zh-Hans'
  ): string | undefined {
    const targetCodes = requestedLanguage === 'zh-Hans' ? ['zh-Hans', 'zh-CN', 'zh'] : ['en'];
    if (translationLanguages.length === 0) return targetCodes[0];

    for (const code of targetCodes) {
      if (translationLanguages.some((language) => language.languageCode === code)) {
        return code;
      }
    }

    // Some InnerTube clients mark caption tracks as translatable but omit or
    // vary the translationLanguages list. Timedtext still accepts explicit
    // tlang values, so keep the requested machine translation path active.
    return targetCodes[0];
  }

  private translationBaseTrackScore(track: any, requestedLanguage: 'en' | 'zh-Hans'): number {
    const code = track.languageCode || '';
    let score = track.kind === 'asr' ? 1 : 2;
    if (requestedLanguage === 'zh-Hans' && this.isEnglishLanguage(code)) score += 5;
    if (requestedLanguage === 'en' && this.isChineseLanguage(code)) score += 5;
    return score;
  }

  private isSameLanguageFamily(languageCode: string, requestedLanguage: 'en' | 'zh-Hans'): boolean {
    return requestedLanguage === 'en'
      ? this.isEnglishLanguage(languageCode)
      : this.isChineseLanguage(languageCode);
  }

  private isEnglishLanguage(languageCode: string): boolean {
    return languageCode === 'en' || languageCode.startsWith('en-');
  }

  private isChineseLanguage(languageCode: string): boolean {
    return languageCode === 'zh' || languageCode.startsWith('zh-');
  }

  private isSimplifiedChineseLanguage(languageCode: string): boolean {
    return languageCode === 'zh-Hans' || languageCode === 'zh-CN' || languageCode === 'zh';
  }

  private extractTranslationLanguages(captionsRenderer: any): { language: string; languageCode: string }[] {
    return (captionsRenderer?.translationLanguages || []).map((language: any) => ({
      language: language.languageName?.runs?.map((run: any) => run.text).join('') || language.languageName?.simpleText || '',
      languageCode: language.languageCode
    }));
  }

  private getTrackName(track: any): string {
    return track.name?.runs?.map((run: any) => run.text).join('') || track.name?.simpleText || track.languageCode || 'InnerTube platform caption';
  }

  private buildTranscriptUrl(baseUrl: string, translateTo?: string): string {
    const url = new URL(baseUrl);
    url.searchParams.delete('fmt');
    url.searchParams.set('fmt', 'json3');
    url.searchParams.delete('tlang');
    if (translateTo) {
      url.searchParams.set('tlang', translateTo);
    }
    return url.toString();
  }

  private async fetchTranscriptJson(transcriptUrl: string): Promise<any> {
    try {
      const response = await fetch(transcriptUrl, {
        headers: {
          'Accept-Language': 'en-US',
          'User-Agent': 'Mozilla/5.0'
        }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      return JSON.parse(text);
    } catch (e) {
      const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY || 'http://127.0.0.1:7897';
      const proxyArg = proxy ? `-x ${proxy}` : '';
      const result = execSync(`curl ${proxyArg} -sL "${transcriptUrl}"`, { maxBuffer: 10 * 1024 * 1024 }).toString();
      return JSON.parse(result);
    }
  }

  private parseTranscriptJsonSegments(transcriptData: any): TranscriptSegment[] {
    if (!transcriptData.events) {
      throw new Error(`Invalid transcript data format from InnerTube`);
    }

    return transcriptData.events
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
      })
      .filter((segment: TranscriptSegment) => segment.text.length > 0);
  }

  private fetchCaptionVariantWithYtDlp(
    videoId: string,
    requestedLanguage: 'en' | 'zh-Hans',
    priorErrors: string[]
  ): FetchTranscriptResult {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `yanghoo-youtube-captions-${videoId}-`));
    try {
      const outputPattern = path.join(tmpDir, '%(id)s');
      const args = [
        ...this.buildYtDlpCaptionNetworkArgs(),
        '--skip-download',
        '--no-playlist',
        '--write-subs',
        '--write-auto-subs',
        '--sub-langs', requestedLanguage,
        '--sub-format', 'json3',
        '-o', outputPattern,
        `${this.WATCH_URL}${videoId}`
      ];

      execFileSync('yt-dlp', args, {
        stdio: 'pipe',
        timeout: 180_000,
        maxBuffer: 20 * 1024 * 1024
      });

      const subtitleFile = fs.readdirSync(tmpDir)
        .find((file) => file.endsWith(`.${requestedLanguage}.json3`));

      if (!subtitleFile) {
        throw new Error(`yt-dlp did not create ${requestedLanguage} subtitle file`);
      }

      const transcriptData = JSON.parse(fs.readFileSync(path.join(tmpDir, subtitleFile), 'utf-8'));
      const segments = this.parseTranscriptJsonSegments(transcriptData);
      if (segments.length === 0) {
        throw new Error(`yt-dlp ${requestedLanguage} subtitle has 0 segments`);
      }

      return {
        segments,
        language: requestedLanguage,
        requestedLanguage,
        isTranslated: requestedLanguage === 'zh-Hans',
        sourceLanguage: requestedLanguage === 'zh-Hans' ? 'en' : undefined,
        trackName: requestedLanguage === 'zh-Hans'
          ? 'YouTube machine translation via yt-dlp subtitle fallback'
          : 'YouTube subtitle via yt-dlp fallback'
      };
    } catch (error: any) {
      const stderr = error.stderr?.toString() || error.stdout?.toString() || error.message;
      throw new Error([stderr, ...priorErrors].filter(Boolean).join('\n'));
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  }

  async captureChannel(url: string, options?: { limit?: number }): Promise<{ manifest: import('@yanghoo/domain').ChannelManifest, videos: import('@yanghoo/domain').ChannelVideo[] }> {
    // We use yt-dlp to extract channel playlist and videos
    const args = [
      '--dump-json',
      '--flat-playlist',
      '--ignore-errors',
      '--no-warnings',
      ...this.buildYtDlpCaptionNetworkArgs().filter((arg, i, arr) => {
        if (arg === '--cookies-from-browser') return false;
        if (i > 0 && arr[i - 1] === '--cookies-from-browser') return false;
        return true;
      })
    ];

    if (options?.limit && options.limit > 0) {
      args.push('--playlist-end', options.limit.toString());
    }
    
    args.push(url);

    let output = '';
    try {
      output = execFileSync('yt-dlp', args, {
        encoding: 'utf-8',
        maxBuffer: 50 * 1024 * 1024,
        timeout: 300_000 // 5 minutes timeout for large channels
      });
    } catch (e: any) {
      if (e.stdout) {
        output = e.stdout; // Some videos might error but we still have output
      } else {
        throw new Error(`yt-dlp channel capture failed: ${e.message}`);
      }
    }

    const lines = output.split('\n').filter(l => l.trim().length > 0);
    let videos: import('@yanghoo/domain').ChannelVideo[] = [];
    const seenIds = new Set<string>();
    let channelId = '';
    let channelTitle = '';
    let totalPlaylistCount: number | undefined;

    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (item.id && item.title && !seenIds.has(item.id)) {
          seenIds.add(item.id);
          videos.push({
            id: `yt-${item.id}`,
            videoId: item.id,
            title: item.title,
            url: item.url || `https://www.youtube.com/watch?v=${item.id}`,
            duration: item.duration
          });
          
          if (item.playlist_count !== undefined && item.playlist_count !== null) {
             totalPlaylistCount = item.playlist_count;
          }

          if (!channelId && item.playlist_channel_id) {
            channelId = item.playlist_channel_id;
            channelTitle = item.playlist_channel || item.playlist_uploader || item.uploader || 'Unknown Channel';
          } else if (!channelId && item.channel_id) {
            channelId = item.channel_id;
            channelTitle = item.channel || item.uploader || 'Unknown Channel';
          }
        }
      } catch (err) {
        // ignore parse errors for single lines
      }
    }

    let isPartial = false;
    if (options?.limit && options.limit > 0) {
      isPartial = videos.length >= options.limit;
      videos = videos.slice(0, options.limit);
    } else if (totalPlaylistCount !== undefined && videos.length < totalPlaylistCount) {
      isPartial = true;
    }

    if (!channelId) {
      // Fallback if we couldn't parse channel ID from videos
      const match = url.match(/@([^/?#]+)/);
      if (match) channelId = match[1];
      else channelId = nanoid();
      
      channelTitle = channelTitle || channelId;
    }

    const manifest: import('@yanghoo/domain').ChannelManifest = {
      id: `youtube-${channelId}`,
      platform: 'youtube',
      url,
      title: channelTitle,
      capturedAt: new Date().toISOString(),
      isPartial
    };

    return { manifest, videos };
  }

  private buildYtDlpCaptionNetworkArgs(): string[] {
    const args = [
      '--socket-timeout', process.env.YTDLP_SOCKET_TIMEOUT || '30',
      '--retries', process.env.YTDLP_RETRIES || '10',
      '--extractor-retries', process.env.YTDLP_EXTRACTOR_RETRIES || '5',
      '--user-agent', process.env.YTDLP_USER_AGENT || 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];

    const proxy = process.env.YTDLP_PROXY?.trim()
      || process.env.HTTPS_PROXY
      || process.env.HTTP_PROXY
      || process.env.https_proxy
      || process.env.http_proxy
      || 'http://127.0.0.1:7897';

    if (proxy.toLowerCase() === 'direct' || proxy.toLowerCase() === 'none' || proxy.toLowerCase() === 'off') {
      args.push('--proxy', '');
    } else {
      args.push('--proxy', proxy);
    }

    const cookiesPath = process.env.YTDLP_COOKIES;
    if (cookiesPath) {
      args.push('--cookies', cookiesPath);
    }

    const cookiesFromBrowser = process.env.YOUTUBE_CAPTION_COOKIES_FROM_BROWSER
      ?? process.env.YTDLP_COOKIES_FROM_BROWSER
      ?? 'chrome';
    const normalizedCookiesFromBrowser = cookiesFromBrowser.toLowerCase();
    if (
      cookiesFromBrowser &&
      normalizedCookiesFromBrowser !== 'off' &&
      normalizedCookiesFromBrowser !== 'none' &&
      normalizedCookiesFromBrowser !== 'false'
    ) {
      args.push('--cookies-from-browser', cookiesFromBrowser);
    }

    return args;
  }
}

export const youtubeAdapter = new YouTubeSourceAdapter();
