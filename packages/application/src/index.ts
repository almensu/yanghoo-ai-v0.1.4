import {
  Source,
  TranscriptAsset,
  TranscriptSegment,
  Conversation,
  getTranscriptRawPath,
  getTranscriptSentencesPath,
  getTranscriptVttPath,
  getDocumentMarkdownPath,
  getAudioPath,
  AudioAsset,
  Message
} from '@yanghoo/domain';
import { execSync } from 'child_process';
import {
  youtubeAdapter,
  xiaoyuzhouAdapter,
  douyinAdapter,
  xiaohongshuAdapter
} from '@yanghoo/source-adapters';
import { sourceStorage, transcriptStorage, documentStorage, audioStorage } from '@yanghoo/storage';
import {
  refineTranscriptSentences,
  convertToVTT,
  convertToMarkdown
} from '@yanghoo/transcript';
import { llmGateway } from '@yanghoo/llm-gateway';
import { mockLLMProvider } from '@yanghoo/llm-adapters';

// Initialize Gateway
llmGateway.registerProvider(mockLLMProvider);

/**
 * Use Case: Fetch audio for a source.
 */
export async function fetchAudioUseCase(sourceId: string): Promise<AudioAsset> {
  console.log(`[UseCase] fetchAudioUseCase for source: ${sourceId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  const audioUrl = source.audioUrl || source.metadata?.mediaUrl;
  if (!audioUrl) throw new Error(`No audio URL available for source: ${sourceId}`);

  const ext = audioUrl.split('?')[0].split('.').pop() || 'mp3';
  const localPath = getAudioPath(sourceId, ext);

  console.log(`[UseCase] Downloading audio from ${audioUrl} to ${localPath}`);

  try {
    const absoluteLocalPath = (audioStorage as any).resolvePath(localPath);
    execSync(`mkdir -p "$(dirname "${absoluteLocalPath}")"`);
    execSync(`curl -sL "${audioUrl}" -o "${absoluteLocalPath}"`);

    const asset: AudioAsset = {
      sourceId,
      status: 'fetched',
      url: audioUrl,
      localPath,
      fetchedAt: new Date().toISOString()
    };

    await audioStorage.saveAudio(asset);
    return asset;
  } catch (error: any) {
    console.error(`[UseCase] Audio fetch failed: ${error.message}`);
    const failedAsset: AudioAsset = {
      sourceId,
      status: 'failed'
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
  let transcriberAvailable = false;
  try {
    execSync('python3 -c "import mlx_audio; import mlx.core" && python3 -m mlx_audio.stt.generate --help');
    transcriberAvailable = true;
  } catch (e) {
    console.warn('[UseCase] MLX Audio environment check failed.');
  }

  if (!transcriberAvailable) {
     throw new Error(`Real transcription engine (mlx-audio) is not correctly installed or compatible with this environment. 
     Note: Local ASR requires an Apple Silicon Mac and the 'mlx' core library.
     Current status: ModuleNotFoundError: No module named 'mlx'
     Resolution: Please run 'pip install mlx-audio mlx' in a compatible environment.`);
  }

  const model = 'mlx-community/whisper-large-v3-turbo-asr-fp16';
  console.log(`[UseCase] Running MLX ASR with model: ${model}`);
  
  try {
    const cmd = `python3 -m mlx_audio.stt.generate --model "${model}" --audio "${absoluteAudioPath}" --output-format json`;
    const resultJson = execSync(cmd).toString();
    const result = JSON.parse(resultJson);

    const rawSegments: TranscriptSegment[] = result.segments.map((s: any) => ({
      start: s.start,
      end: s.end,
      text: s.text.trim()
    }));

    const refinedSegments = refineTranscriptSentences(rawSegments);
    const asset: TranscriptAsset = {
      id: `ts-${sourceId}`,
      sourceId,
      status: 'refined',
      sourceType: 'mlx_audio',
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

    const mdContent = convertToMarkdown(source.title || 'Untitled', refinedSegments);
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

/**
 * Use Case: Ensure a transcript exists for a given source.
 */
export async function ensureTranscriptUseCase(sourceId: string): Promise<TranscriptAsset> {
  console.log(`[UseCase] ensureTranscriptUseCase for source: ${sourceId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  if (source.platform === 'youtube') {
    const videoId = source.metadata?.videoId;
    if (!videoId) throw new Error(`YouTube videoId missing for source: ${sourceId}`);
    const result = await youtubeAdapter.fetchTranscript(videoId);
    
    const refinedSegments = refineTranscriptSentences(result.segments);
    const asset: TranscriptAsset = {
      id: `ts-${sourceId}`,
      sourceId,
      status: 'refined',
      sourceType: 'platform_caption',
      language: result.language,
      engine: result.trackName ? `youtube-innertube (${result.trackName})` : 'youtube-innertube',
      segments: refinedSegments,
      rawSegmentsCount: result.segments.length,
      rawPath: getTranscriptRawPath(sourceId),
      sentencesPath: getTranscriptSentencesPath(sourceId),
      vttPath: getTranscriptVttPath(sourceId),
      generatedAt: new Date().toISOString()
    };

    await transcriptStorage.saveTranscript(asset);
    await sourceStorage.writeAssetFile(asset.vttPath!, convertToVTT(refinedSegments));
    await documentStorage.saveDocument({
      id: `doc-${sourceId}`,
      sourceId,
      transcriptId: asset.id,
      status: 'published',
      content: convertToMarkdown(source.title || 'Untitled', refinedSegments),
      format: 'markdown',
      markdownPath: getDocumentMarkdownPath(sourceId)
    });
    return asset;
  } else if (source.platform === 'xiaoyuzhou' || source.sourceClass === 'podcast_audio') {
    const readiness = await documentStorage.getDocumentReadiness(sourceId);
    if (!readiness.hasAudio) {
       throw new Error(`Audio processing required. Please use 'Fetch Audio' first.`);
    }
    return transcribeAudioUseCase(sourceId);
  } else {
    throw new Error(`Automated transcript fetching not supported for platform: ${source.platform}`);
  }
}

export * from './resolveSourceMediaUseCase.js';
export * from './downloadSourceMediaUseCase.js';

/**
 * Use Case: Capture a source from a URL.
 */
export async function captureSourceUseCase(url: string): Promise<Source> {
  console.log(`[UseCase] captureSourceUseCase for url: ${url}`);

  let source: Source;

  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    source = await youtubeAdapter.capture(url);
  } else if (url.includes('xiaoyuzhoufm.com')) {
    source = await xiaoyuzhouAdapter.capture(url);
  } else if (url.includes('douyin.com')) {
    source = await douyinAdapter.capture(url);
  } else if (url.includes('xiaohongshu.com')) {
    source = await xiaohongshuAdapter.capture(url);
  } else if (url.includes('x.com') || url.includes('twitter.com')) {
    const { xAdapter } = await import('@yanghoo/source-adapters');
    source = await xAdapter.capture(url);
  } else {
    throw new Error(`Unsupported platform for URL: ${url}`);
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
