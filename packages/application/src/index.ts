import {
  Source,
  TranscriptAsset,
  TranscriptSegment,
  Conversation,
  getTranscriptRawPath,
  getTranscriptSentencesPath,
  getTranscriptManifestPath,
  getTranscriptVttPath,
  getDocumentMarkdownPath,
  getAudioPath,
  getThumbnailPath,
  AudioAsset,
  Message
} from '@yanghoo/domain';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import {
  youtubeAdapter,
  xiaoyuzhouAdapter,
  douyinAdapter,
  xiaohongshuAdapter,
  applePodcastAdapter,
  bilibiliAdapter,
  tiktokAdapter
} from '@yanghoo/source-adapters';
import { sourceStorage, transcriptStorage, documentStorage, audioStorage } from '@yanghoo/storage';
import {
  refineTranscriptSentences,
  normalizeTranscriptSegments,
  normalizeTranscriptText,
  convertToVTT,
  convertToMarkdown
} from '@yanghoo/transcript';
import { llmGateway } from '@yanghoo/llm-gateway';
import { mockLLMProvider, MlxLmProvider } from '@yanghoo/llm-adapters';
import { resolveRootScript } from './resolveProjectRoot.js';
import { runYtDlp } from './ytDlpNetworkOptions.js';

// Initialize Gateway
llmGateway.registerProvider(mockLLMProvider);

// Register MLX LM Provider
try {
  const mlxLmPython = process.env.MLX_LM_PYTHON || '/Users/a123/Yanghoo-lab/MLX-Community/mlx-lm/.venv/bin/python';
  const mlxLmScript = resolveRootScript('scripts/llm/run-mlx-lm-generate.py');
  llmGateway.registerProvider(new MlxLmProvider({
    pythonExec: mlxLmPython,
    scriptPath: mlxLmScript
  }));
  // console.log('[Application] Registered MlxLmProvider');
} catch (e: any) {
  // console.warn(`[Application] Failed to register MlxLmProvider: ${e.message}`);
}

/**
 * Use Case: Fetch audio for a source.
 */
export async function fetchAudioUseCase(sourceId: string): Promise<AudioAsset> {
  console.log(`[UseCase] fetchAudioUseCase for source: ${sourceId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  const audioUrl = source.audioUrl || source.metadata?.mediaUrl;
  
  // If it's an apple podcast or a YouTube no-caption fallback, yt-dlp should extract audio from the canonical source URL.
  const isApplePodcast = source.platform === 'apple_podcast';
  const isYouTube = source.platform === 'youtube';
  const shouldExtractAudioWithYtDlp = isApplePodcast || isYouTube;
  if (!shouldExtractAudioWithYtDlp && !audioUrl) throw new Error('音频下载失败：没有可用音频地址');

  const ext = shouldExtractAudioWithYtDlp ? 'mp3' : (audioUrl?.split('?')[0].split('.').pop() || 'mp3');
  const targetUrl = shouldExtractAudioWithYtDlp ? source.url : audioUrl!;
  const localPath = getAudioPath(sourceId, ext);
  const absoluteLocalPath = (audioStorage as any).resolvePath(localPath);

  console.log(`[UseCase] Downloading audio from ${targetUrl} to ${localPath}`);

  const classifyError = (raw: string): string => {
    const lower = raw.toLowerCase();
    if (lower.includes('proxy') || lower.includes('connection refused') || lower.includes('failed to connect')) {
      return '音频下载失败：代理或网络连接失败，请检查 YTDLP_PROXY/HTTPS_PROXY';
    }
    if (lower.includes('ssl') || lower.includes('tls') || lower.includes('certificate') || lower.includes('ssl_error')) {
      return '音频下载失败：网络或 SSL 连接失败';
    }
    if (lower.includes('403') || lower.includes('forbidden')) {
      return '音频下载失败：远程文件不可访问 (403)';
    }
    if (lower.includes('404') || lower.includes('not found')) {
      return '音频下载失败：远程文件不存在 (404)';
    }
    if (lower.includes('timed out') || lower.includes('timeout') || lower.includes('etimedout')) {
      return '音频下载失败：连接超时';
    }
    if (lower.includes('no video formats found') || lower.includes('no audio formats found') || lower.includes('extractor failed')) {
      return '音频下载失败：没有找到可用的音频流';
    }
    return '音频下载失败：网络或 SSL 连接失败';
  };

  try {
    fs.mkdirSync(path.dirname(absoluteLocalPath), { recursive: true });

    console.log(`[UseCase] Trying yt-dlp for audio fetch: ${targetUrl}`);
    try {
      if (shouldExtractAudioWithYtDlp) {
        // Native yt-dlp audio extraction for platforms where the page URL is the source of truth.
        runYtDlp([
          '--no-playlist',
          '-x',
          '--audio-format', 'mp3',
          '--audio-quality', '0',
          '-o', absoluteLocalPath,
          targetUrl
        ], { timeoutMs: 300_000, preferProxy: isYouTube });
      } else {
        runYtDlp([
          '--no-playlist',
          '-f', 'bestaudio/best',
          '-o', absoluteLocalPath,
          targetUrl
        ], { timeoutMs: 120_000 });
      }
    } catch (ytDlpError: any) {
      const ytDlpStderr = ytDlpError.stderr?.toString() || ytDlpError.message;
      console.warn(`[UseCase] yt-dlp failed: ${ytDlpStderr.substring(0, 200)}`);

      if (isApplePodcast) {
        // If native yt-dlp fails for Apple Podcast, we can't reliably fallback to curl because curl doesn't parse Apple Podcast HTML/RSS to get the audio stream.
        // We could try curl on audioUrl if it exists, but yt-dlp is the preferred method.
        if (audioUrl) {
          console.warn(`[UseCase] Apple Podcast native yt-dlp failed, trying curl fallback on extracted mediaUrl: ${audioUrl}`);
          try {
            execSync(`curl -sL --max-time 120 --connect-timeout 30 -A "Mozilla/5.0" -o "${absoluteLocalPath}" "${audioUrl}"`, { stdio: 'pipe', timeout: 130_000 });
          } catch (curlError: any) {
            const curlStderr = curlError.stderr?.toString() || curlError.message;
            throw new Error(classifyError(curlStderr));
          }
        } else {
          throw new Error(classifyError(ytDlpStderr));
        }
      } else if (isYouTube) {
        throw new Error(classifyError(ytDlpStderr));
      } else {
        // Fallback to curl with timeout, User-Agent, and follow redirects for generic audio URLs
        try {
          execSync(`curl -sL --max-time 120 --connect-timeout 30 -A "Mozilla/5.0" -o "${absoluteLocalPath}" "${targetUrl}"`, { stdio: 'pipe', timeout: 130_000 });
        } catch (curlError: any) {
          const curlStderr = curlError.stderr?.toString() || curlError.message;
          throw new Error(classifyError(curlStderr));
        }
      }
    }

    // Validate downloaded file exists and is non-empty
    if (!fs.existsSync(absoluteLocalPath)) {
      throw new Error('音频下载失败：下载后文件为空');
    }
    const stat = fs.statSync(absoluteLocalPath);
    if (stat.size === 0) {
      fs.unlinkSync(absoluteLocalPath);
      throw new Error('音频下载失败：下载后文件为空');
    }

    const asset: AudioAsset = {
      sourceId,
      status: 'fetched',
      url: targetUrl,
      localPath,
      size: stat.size,
      fetchedAt: new Date().toISOString()
    };

    await audioStorage.saveAudio(asset);
    return asset;
  } catch (error: any) {
    console.error(`[UseCase] Audio fetch failed: ${error.message}`);
    const failedAsset: AudioAsset = {
      sourceId,
      status: 'failed',
      errorMessage: error.message
    };
    await audioStorage.saveAudio(failedAsset);
    throw error;
  }
}

/**
 * Use Case: Transcribe audio for a source using MLX ASR.
 */
export async function transcribeAudioUseCase(sourceId: string): Promise<TranscriptAsset> {
  console.log(`[UseCase] transcribeAudioUseCase for source: ${sourceId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  const audioAsset = await audioStorage.getAudio(sourceId);
  if (!audioAsset || audioAsset.status !== 'fetched' || !audioAsset.localPath) {
    throw new Error(`Audio not fetched for source: ${sourceId}. Please run fetch-audio first.`);
  }

  const absoluteAudioPath = (audioStorage as any).resolvePath(audioAsset.localPath);
  
  // 1. Strict MLX check
  const pythonExec = process.env.MLX_AUDIO_PYTHON;
  if (!pythonExec) {
    throw new Error(`MLX_AUDIO_PYTHON is not configured. Transcription requires a valid MLX Python runtime.
Resolution: Start the API with:
MLX_AUDIO_PYTHON=/Users/a123/Yanghoo-lab/MLX-Community/mlx-audio/.venv/bin/python npm run dev`);
  }

  let transcriberAvailable = false;
  let envCheckErrorMsg = '';
  try {
    // Check if mlx_audio can be imported
    execSync(`"${pythonExec}" -c "import mlx_audio; import mlx.core"`, { stdio: 'pipe' });
    transcriberAvailable = true;
  } catch (e: any) {
    envCheckErrorMsg = e.stderr?.toString() || e.message;
    console.warn(`[UseCase] MLX Audio environment check failed with executable: ${pythonExec}`);
  }

  if (!transcriberAvailable) {
     throw new Error(`Real transcription engine (mlx-audio) is not correctly installed in the configured Python environment. 
     Attempted executable: ${pythonExec}
     Error details: ${envCheckErrorMsg.trim()}
     Resolution: Please ensure mlx_audio and mlx are installed in that environment.`);
  }

  const model = 'mlx-community/whisper-large-v3-turbo-asr-fp16';
  console.log(`[UseCase] Running MLX ASR with model: ${model} using ${pythonExec}`);
  
  const outputDir = path.dirname(absoluteAudioPath);
  const outputJsonPath = path.join(outputDir, `mlx-script-output-${sourceId}.json`);

  // Path to our project-native script resolved independent of process.cwd()
  const scriptPath = resolveRootScript('scripts/transcript/run-mlx-audio-transcription.py');

  try {
    const cmd = `"${pythonExec}" "${scriptPath}" --model "${model}" --audio "${absoluteAudioPath}" --output-json "${outputJsonPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    
    if (!fs.existsSync(outputJsonPath)) {
      throw new Error(`Transcription completed but output JSON not found at ${outputJsonPath}`);
    }
    
    const resultJson = fs.readFileSync(outputJsonPath, 'utf-8');
    const result = JSON.parse(resultJson);

    if (!result.segments) {
      throw new Error(`Invalid JSON shape from MLX script: missing 'segments'. Output path: ${outputJsonPath}`);
    }

    const rawSegments: TranscriptSegment[] = result.segments.map((s: any) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim()
    }));

    const normalizedSegments = normalizeTranscriptSegments(rawSegments);
    const refinedSegments = refineTranscriptSentences(normalizedSegments);

    // Detect if output is Chinese to set language metadata
    const fullText = normalizedSegments.map(s => s.text).join(' ');
    const language = /[\u4e00-\u9fa5]/.test(fullText) ? 'zh-Hans' : undefined;

    const asset: TranscriptAsset = {
      id: `ts-${sourceId}`,
      sourceId,
      status: 'refined',
      sourceType: 'mlx_audio',
      language,
      engine: 'mlx-audio',
      model: model,
      segments: refinedSegments,
      rawSegmentsCount: rawSegments.length,
      rawPath: getTranscriptRawPath(sourceId),
      sentencesPath: getTranscriptSentencesPath(sourceId),
      vttPath: getTranscriptVttPath(sourceId),
      generatedAt: new Date().toISOString()
    };

    await transcriptStorage.saveTranscript(asset);

    const vttContent = convertToVTT(refinedSegments);
    await sourceStorage.writeAssetFile(asset.vttPath!, vttContent);

    const mdContent = convertToMarkdown(normalizeTranscriptText(source.title || 'Untitled'), refinedSegments);
    const mdPath = getDocumentMarkdownPath(sourceId);
    await documentStorage.saveDocument({
      id: `doc-${sourceId}`,
      sourceId,
      transcriptId: asset.id,
      status: 'published',
      content: mdContent,
      format: 'markdown',
      markdownPath: mdPath
    });

    console.log(`[UseCase] MLX Transcription complete for: ${sourceId}`);
    return asset;
  } catch (error: any) {
    console.error(`[UseCase] Transcription failed: ${error.message}`);
    throw error;
  }
}

export { ensureTranscriptUseCase } from './ensureTranscriptUseCase.js';
export type { EnsureTranscriptOptions } from './ensureTranscriptUseCase.js';

import { extractSupportedSourceUrl } from './extractSupportedSourceUrl.js';
import { deleteSourceUseCase } from './deleteSourceUseCase.js';

export { resolveSourceMediaUseCase } from './resolveSourceMediaUseCase.js';
export { downloadSourceMediaUseCase } from './downloadSourceMediaUseCase.js';
export { extractSourceAudioUseCase } from './extractSourceAudioUseCase.js';
export { transcribeSourceMediaUseCase } from './transcribeSourceMediaUseCase.js';
export { translateSourceDocumentUseCase } from './translateSourceDocumentUseCase.js';
export { exportNotebookLmUseCase, openNotebookLmExportDirUseCase } from './exportNotebookLmUseCase.js';
export { searchDocumentsUseCase } from './searchDocumentsUseCase.js';
export { listSourceChannelCollectionsUseCase } from './sourceChannelCollectionsUseCase.js';
export { deleteSourceAssetsUseCase } from './deleteSourceAssetsUseCase.js';
export { extractSupportedSourceUrl, deleteSourceUseCase };

/**
 * Use Case: Cache a remote thumbnail locally.
 */
export async function cacheThumbnailUseCase(sourceId: string, remoteUrl: string): Promise<string> {
  console.log(`[UseCase] cacheThumbnailUseCase for source: ${sourceId}, url: ${remoteUrl}`);
  
  const ext = remoteUrl.split('?')[0].split('.').pop() || 'jpg';
  // Standardize on jpg if it's too long or weird
  const safeExt = ext.length > 4 ? 'jpg' : ext;
  const localPath = getThumbnailPath(sourceId, safeExt);
  const absoluteLocalPath = (sourceStorage as any).resolvePath(localPath);

  try {
    execSync(`mkdir -p "$(dirname "${absoluteLocalPath}")"`);
    // Use -L to follow redirects, -s for silent
    execSync(`curl -sL "${remoteUrl}" -o "${absoluteLocalPath}"`);
    console.log(`[UseCase] Thumbnail cached at ${absoluteLocalPath}`);
    
    // Return a virtual API path that the frontend can use
    return `/api/tasks/${sourceId}/thumbnail`;
  } catch (error: any) {
    console.warn(`[UseCase] Thumbnail cache failed: ${error.message}`);
    return remoteUrl; // Fallback to remote URL
  }
}

/**
 * Use Case: Capture a source from a URL or text snippet.
 */
export async function captureSourceUseCase(input: string): Promise<Source> {
  console.log(`[UseCase] captureSourceUseCase for input: ${input.substring(0, 50)}${input.length > 50 ? '...' : ''}`);

  const url = extractSupportedSourceUrl(input);
  if (!url) {
    throw new Error('No supported source URL found in input.');
  }

  let source: Source;

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    source = await youtubeAdapter.capture(url);
  } else if (url.includes('xiaoyuzhoufm.com')) {
    source = await xiaoyuzhouAdapter.capture(url);
  } else if (url.includes('douyin.com') || url.includes('iesdouyin.com')) {
    source = await douyinAdapter.capture(url);
  } else if (url.includes('xiaohongshu.com') || url.includes('xhslink.com')) {
    source = await xiaohongshuAdapter.capture(url);
  } else if (url.includes('podcasts.apple.com')) {
    source = await applePodcastAdapter.capture(url);
  } else if (url.includes('bilibili.com') || url.includes('b23.tv')) {
    source = await bilibiliAdapter.capture(url);
  } else if (url.includes('tiktok.com')) {
    source = await tiktokAdapter.capture(url);
  } else if (url.includes('x.com') || url.includes('twitter.com')) {
    const { xAdapter } = await import('@yanghoo/source-adapters');
    source = await xAdapter.capture(url);
  } else {
    throw new Error(`Unsupported platform for URL: ${url}`);
  }

  // Deduplication: check if source already exists
  const existing = await sourceStorage.getSource(source.id);
  if (existing) {
    console.log(`[UseCase] Source already exists: ${source.id}. Returning existing.`);
    return existing;
  }

  // Xiaohongshu specific: Cache thumbnail locally if available
  if (source.platform === 'xiaohongshu' && source.thumbnailUrl) {
    const remoteThumbnailUrl = source.thumbnailUrl;
    const localThumbnailUrl = await cacheThumbnailUseCase(source.id, remoteThumbnailUrl);
    
    if (localThumbnailUrl !== remoteThumbnailUrl) {
      source.thumbnailUrl = localThumbnailUrl;
      source.metadata = {
        ...source.metadata,
        remoteThumbnailUrl
      };
    }
  }

  await sourceStorage.saveSource(source);
  console.log(`[UseCase] Source saved: ${source.id}`);

  return source;
}

/**
 * Use Case: Chat with a source document.
 */
export async function chatWithSourceUseCase(params: {
  sourceId: string;
  message: string;
  history?: Message[];
}): Promise<string> {
  console.log(`[UseCase] chatWithSourceUseCase for source: ${params.sourceId}`);

  const source = await sourceStorage.getSource(params.sourceId);
  if (!source) throw new Error(`Source not found: ${params.sourceId}`);

  let context = '';
  try {
    const docAsset = await documentStorage.getDocument(params.sourceId);
    if (docAsset) {
      context = docAsset.content;
    }
  } catch (e) {
    console.warn('Could not read document for context', e);
  }

  const messages: Message[] = [
    {
      role: 'system',
      content: `You are a helpful assistant analyzing the following source document titled "${source.title}".\n\nDOCUMENT CONTENT:\n${context}`,
      timestamp: new Date().toISOString()
    },
    ...(params.history || []),
    {
      role: 'user',
      content: params.message,
      timestamp: new Date().toISOString()
    }
  ];

  return llmGateway.generateContent('mock-provider', messages, {
    modelId: 'mock-gpt-4'
  });
}

/**
 * Use Case: List available models.
 */
export async function listModelsUseCase() {
  return llmGateway.listModels();
}

/**
 * Use Case: Repair YouTube titles for sources with fallback titles.
 */
export async function repairYouTubeTitlesUseCase(): Promise<{ repaired: string[], skipped: string[], failed: string[] }> {
  console.log('[UseCase] repairYouTubeTitlesUseCase starting');
  const sources = await sourceStorage.listSources();
  const youtubeSources = sources.filter(s => s.platform === 'youtube');
  
  const repaired: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const source of youtubeSources) {
    // Detect fallback title patterns: "YouTube Video <videoId>" or missing title
    const isFallback = !source.title || source.title.startsWith('YouTube Video ') || source.title === 'Untitled';
    
    if (isFallback) {
      try {
        const originalTitle = source.title;
        const refreshed = await youtubeAdapter.refreshMetadata(source);
        if (refreshed.title !== originalTitle) {
          await sourceStorage.saveSource(refreshed);
          repaired.push(source.id);
          console.log(`[UseCase] Repaired title for ${source.id}: ${refreshed.title}`);
        } else {
          skipped.push(source.id);
          console.log(`[UseCase] Metadata refresh didn't change title for ${source.id}`);
        }
      } catch (error: any) {
        failed.push(source.id);
        console.error(`[UseCase] Failed to repair title for ${source.id}: ${error.message}`);
      }
    } else {
      skipped.push(source.id);
    }
  }

  return { repaired, skipped, failed };
}

/**
 * Use Case: Create a new conversation for a source or collection.
 */
export async function createConversationUseCase(params: { sourceId?: string; collectionId?: string }): Promise<Conversation> {
  console.log(`[UseCase] createConversationUseCase`, params);
  return {
    id: 'stub-conversation-id',
    scopeType: params.sourceId ? 'source' : 'collection',
    scopeIds: params.sourceId ? [params.sourceId] : (params.collectionId ? [params.collectionId] : []),
    messages: []
  };
}
export * from './captureChannelUseCase.js';
export * from './syncChannelCaptionsUseCase.js';
export { validateLanguage } from './syncChannelCaptionsUseCase.js';
export * from './buildEnglishSentenceIndexUseCase.js';
export * from './searchEnglishSentenceIndexUseCase.js';
export * from './getEnglishSentenceContextUseCase.js';
export * from './listLearningChannelsUseCase.js';
export * from './getLearningChannelVideosUseCase.js';
export * from './updateChannelVideoSelectionUseCase.js';
export * from './syncSelectedEnglishCaptionsUseCase.js';
export * from './refreshChannelVideosUseCase.js';
export * from './deleteLearningChannelUseCase.js';
export * from './savedEnglishExamplesUseCases.js';
export * from './channelTaxonomyUseCases.js';
