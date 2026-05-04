import {
  TranscriptAsset,
  TranscriptSegment
} from '@yanghoo/domain';
import {
  youtubeAdapter,
  isYouTubeNoCaptionError
} from '@yanghoo/source-adapters';
import type { FetchTranscriptResult, FetchTranscriptBundleOptions } from '@yanghoo/source-adapters';
import { sourceStorage, transcriptStorage, documentStorage } from '@yanghoo/storage';
import {
  refineTranscriptSentences,
  normalizeTranscriptSegments,
  normalizeTranscriptText,
  convertToVTT,
  convertToMarkdown
} from '@yanghoo/transcript';
import {
  getTranscriptRawPath,
  getTranscriptSentencesPath,
  getTranscriptManifestPath,
  getTranscriptVttPath,
  getDocumentMarkdownPath,
  getCaptionRawPath,
  getCaptionSentencesPath,
  getCaptionVttPath,
  getCaptionDocumentPath,
  getCaptionBundleManifestPath,
  getDocumentTranslationPath,
  getTranslationManifestPath
} from '@yanghoo/domain';

export interface EnsureTranscriptOptions {
  language?: string;
}

async function recordTranscriptFallback(sourceId: string, errorMessage: string): Promise<void> {
  await (transcriptStorage as any).writeAssetFile(
    getTranscriptManifestPath(sourceId),
    JSON.stringify(
      {
        sourceType: 'platform_caption',
        status: 'failed',
        errorMessage,
        fallback: 'audio_transcription',
        generatedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
}

interface PreparedCaptionVariant {
  language: 'en' | 'zh-Hans';
  label: string;
  result: FetchTranscriptResult;
  rawSegments: TranscriptSegment[];
  refinedSegments: TranscriptSegment[];
  rawPath: string;
  sentencesPath: string;
  vttPath: string;
  documentPath: string;
}

function prepareYouTubeCaptionVariant(
  sourceId: string,
  sourceTitle: string | undefined,
  language: 'en' | 'zh-Hans',
  result: FetchTranscriptResult
): PreparedCaptionVariant {
  const rawSegments = language === 'zh-Hans'
    ? normalizeTranscriptSegments(result.segments)
    : result.segments;
  const refinedSegments = refineTranscriptSentences(rawSegments);

  return {
    language,
    label: language === 'zh-Hans' ? '简体中文' : '英文',
    result,
    rawSegments,
    refinedSegments,
    rawPath: getCaptionRawPath(sourceId, language),
    sentencesPath: getCaptionSentencesPath(sourceId, language),
    vttPath: getCaptionVttPath(sourceId, language),
    documentPath: getCaptionDocumentPath(sourceId, language)
  };
}

async function saveYouTubeCaptionVariant(sourceId: string, sourceTitle: string | undefined, variant: PreparedCaptionVariant): Promise<void> {
  const assetStorage = sourceStorage as any;
  const documentContent = convertToMarkdown(normalizeTranscriptText(sourceTitle || 'Untitled'), variant.refinedSegments);

  await assetStorage.writeAssetFile(variant.rawPath, JSON.stringify(variant.rawSegments, null, 2));
  await assetStorage.writeAssetFile(variant.sentencesPath, JSON.stringify(variant.refinedSegments, null, 2));
  await assetStorage.writeAssetFile(variant.vttPath, convertToVTT(variant.refinedSegments));
  await assetStorage.writeAssetFile(variant.documentPath, documentContent);
}

async function saveYouTubeMachineTranslatedDocument(sourceId: string, sourceTitle: string | undefined, variant: PreparedCaptionVariant): Promise<void> {
  const assetStorage = sourceStorage as any;
  const translatedPath = getDocumentTranslationPath(sourceId, 'zh-Hans');
  const manifestPath = getTranslationManifestPath(sourceId);
  const translatedContent = convertToMarkdown(normalizeTranscriptText(sourceTitle || 'Untitled'), variant.refinedSegments);

  await assetStorage.writeAssetFile(translatedPath, translatedContent);
  await assetStorage.writeAssetFile(
    manifestPath,
    JSON.stringify(
      {
        status: 'translated',
        sourceId,
        sourceLanguage: variant.result.sourceLanguage || 'youtube-caption',
        targetLanguage: 'zh-Hans',
        provider: variant.result.isTranslated ? 'youtube-timedtext-machine-translation' : 'youtube-caption',
        translatedPath,
        generatedAt: new Date().toISOString()
      },
      null,
      2
    )
  );
}

export async function ensureTranscriptUseCase(sourceId: string, options?: EnsureTranscriptOptions): Promise<TranscriptAsset> {
  const requestedLanguage = options?.language;

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  if (source.platform === 'youtube') {
    const videoId = source.metadata?.videoId;
    if (!videoId) throw new Error(`YouTube videoId missing for source: ${sourceId}`);
    const adapterLanguages: ('en' | 'zh-Hans')[] = requestedLanguage
      ? [requestedLanguage as 'en' | 'zh-Hans']
      : ['en', 'zh-Hans'];

    let bundle;
    try {
      bundle = await youtubeAdapter.fetchTranscriptBundle(videoId, { languages: adapterLanguages });
    } catch (error: any) {
      if (isYouTubeNoCaptionError(error)) {
        const message = '该 YouTube 视频没有可用英文/简体中文字幕，请先下载音频，再使用转录生成文档。';
        await recordTranscriptFallback(sourceId, message);
        throw new Error(message);
      }
      throw error;
    }

    const variants: PreparedCaptionVariant[] = [];
    if (bundle.english) {
      variants.push(prepareYouTubeCaptionVariant(sourceId, source.title, 'en', bundle.english));
    }

    // Only include zh-Hans when no language filter is set, or when explicitly requesting zh-Hans
    const includeZhHans = !requestedLanguage || requestedLanguage === 'zh-Hans';
    if (includeZhHans && bundle.simplifiedChinese) {
      variants.push(prepareYouTubeCaptionVariant(sourceId, source.title, 'zh-Hans', bundle.simplifiedChinese));
    }

    if (variants.length === 0) {
      const message = '该 YouTube 视频没有可用英文/简体中文字幕，请先下载音频，再使用转录生成文档。';
      await recordTranscriptFallback(sourceId, message);
      throw new Error(message);
    }

    for (const variant of variants) {
      await saveYouTubeCaptionVariant(sourceId, source.title, variant);
    }

    const primaryVariant = variants.find(variant => variant.language === 'en') ?? variants[0];
    const simplifiedVariant = variants.find(variant => variant.language === 'zh-Hans');

    const asset: TranscriptAsset = {
      id: `ts-${sourceId}`,
      sourceId,
      status: 'refined',
      sourceType: 'platform_caption',
      language: primaryVariant.language,
      engine: primaryVariant.result.trackName ? `youtube-innertube (${primaryVariant.result.trackName})` : 'youtube-innertube',
      captionVariants: variants.map(variant => ({
        language: variant.language,
        label: variant.label,
        isTranslated: variant.result.isTranslated,
        sourceLanguage: variant.result.sourceLanguage,
        rawPath: variant.rawPath,
        sentencesPath: variant.sentencesPath,
        vttPath: variant.vttPath,
        documentPath: variant.documentPath
      })),
      segments: primaryVariant.refinedSegments,
      rawSegmentsCount: primaryVariant.rawSegments.length,
      rawPath: getTranscriptRawPath(sourceId),
      sentencesPath: getTranscriptSentencesPath(sourceId),
      vttPath: getTranscriptVttPath(sourceId),
      generatedAt: new Date().toISOString()
    };

    await transcriptStorage.saveTranscript(asset);
    await sourceStorage.writeAssetFile(asset.vttPath!, convertToVTT(primaryVariant.refinedSegments));
    await documentStorage.saveDocument({
      id: `doc-${sourceId}`,
      sourceId,
      transcriptId: asset.id,
      status: 'published',
      content: convertToMarkdown(normalizeTranscriptText(source.title || 'Untitled'), primaryVariant.refinedSegments),
      format: 'markdown',
      markdownPath: getDocumentMarkdownPath(sourceId)
    });

    if (simplifiedVariant) {
      await saveYouTubeMachineTranslatedDocument(sourceId, source.title, simplifiedVariant);
    }

    await (sourceStorage as any).writeAssetFile(
      getCaptionBundleManifestPath(sourceId),
      JSON.stringify(
        {
          status: 'fetched',
          sourceId,
          primaryLanguage: primaryVariant.language,
          requestedLanguages: requestedLanguage ? [requestedLanguage] : ['en', 'zh-Hans'],
          availableTracks: bundle.availableTracks,
          variants: asset.captionVariants,
          generatedAt: asset.generatedAt
        },
        null,
        2
      )
    );
    return asset;
  } else if (source.platform === 'xiaoyuzhou' || source.sourceClass === 'podcast_audio') {
    // Transcription-only platforms are not affected by language filtering
    const { transcribeAudioUseCase } = await import('./index.js');
    const readiness = await documentStorage.getDocumentReadiness(sourceId);
    if (!readiness.hasAudio) {
       throw new Error(`Audio processing required. Please use 'Fetch Audio' first.`);
    }
    return transcribeAudioUseCase(sourceId);
  } else {
    throw new Error(`Automated transcript fetching not supported for platform: ${source.platform}`);
  }
}
