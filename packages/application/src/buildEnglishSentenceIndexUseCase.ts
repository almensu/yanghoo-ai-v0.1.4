import {
  EnglishSentenceIndexEntry,
  EnglishSentenceIndexManifest
} from '@yanghoo/domain';
import {
  channelStorage,
  sourceStorage,
  indexInputStorage,
  createEnglishSentenceIndexStorage
} from '@yanghoo/storage';

export interface BuildSentenceIndexResult {
  channelId: string;
  language: string;
  sourceCount: number;
  sentenceCount: number;
  skippedCount: number;
  failedCount: number;
  warnings: string[];
}

function getCaptionKind(manifest: Record<string, unknown> | null): string | undefined {
  if (!manifest) return undefined;
  const engine = String(manifest.engine || '');
  if (engine.includes('auto-generated') || engine.includes('auto')) return 'auto';
  return 'manual';
}

export async function buildEnglishSentenceIndexUseCase(
  channelId: string,
  language: string = 'en'
): Promise<BuildSentenceIndexResult> {
  if (language !== 'en') {
    throw new Error(`Only English ("en") is supported in this stage. Got: "${language}"`);
  }

  const manifest = await channelStorage.getChannelManifest(channelId);
  if (!manifest) {
    throw new Error(`Channel not found: ${channelId}`);
  }

  const videos = await channelStorage.getChannelVideos(channelId) || [];
  if (videos.length === 0) {
    return {
      channelId,
      language,
      sourceCount: 0,
      sentenceCount: 0,
      skippedCount: 0,
      failedCount: 0,
      warnings: ['No videos found for channel.']
    };
  }

  const dataRoot = indexInputStorage.getDataRoot();
  const indexStorage = createEnglishSentenceIndexStorage(dataRoot);

  const entries: EnglishSentenceIndexEntry[] = [];
  const warnings: string[] = [];
  const processedSourceIds: string[] = [];
  let skippedCount = 0;
  let failedCount = 0;

  for (const video of videos) {
    const sourceId = video.id;
    const source = await sourceStorage.getSource(sourceId);

    // Source doesn't exist yet (not captured)
    if (!source) {
      skippedCount++;
      continue;
    }

    // Try caption-specific path first
    const captionResult = indexInputStorage.readCaptionSentences(sourceId, language);

    if (captionResult.status === 'parse_error') {
      warnings.push(`Source ${sourceId}: malformed caption sentences: ${captionResult.error}`);
      failedCount++;
      continue;
    }

    if (captionResult.status === 'invalid_shape') {
      warnings.push(`Source ${sourceId}: invalid caption sentences: ${captionResult.error}`);
      failedCount++;
      continue;
    }

    let sentences = captionResult.status === 'ok' ? captionResult.sentences : null;

    // Fallback to top-level if no caption sentences found
    if (!sentences) {
      const transcriptManifest = indexInputStorage.readTranscriptManifest(sourceId);
      if (transcriptManifest && transcriptManifest.language === language) {
        const topLevelResult = indexInputStorage.readTopLevelSentences(sourceId);

        if (topLevelResult.status === 'parse_error') {
          warnings.push(`Source ${sourceId}: malformed transcript sentences: ${topLevelResult.error}`);
          failedCount++;
          continue;
        }

        if (topLevelResult.status === 'invalid_shape') {
          warnings.push(`Source ${sourceId}: invalid transcript sentences: ${topLevelResult.error}`);
          failedCount++;
          continue;
        }

        if (topLevelResult.status === 'ok') {
          sentences = topLevelResult.sentences;
        }
      }
    }

    if (!sentences) {
      skippedCount++;
      continue;
    }

    if (sentences.length === 0) {
      warnings.push(`Source ${sourceId}: empty sentence data`);
      skippedCount++;
      continue;
    }

    const transcriptManifest = indexInputStorage.readTranscriptManifest(sourceId);
    const captionKind = getCaptionKind(transcriptManifest);

    for (const seg of sentences) {
      if (!seg.text || typeof seg.start !== 'number' || typeof seg.end !== 'number') {
        continue;
      }

      entries.push({
        indexVersion: 1,
        sourceId,
        videoId: video.videoId,
        channelId,
        channelTitle: manifest.title,
        title: video.title || source.title,
        publishedAt: video.publishedAt || source.publishedAt,
        start: seg.start,
        end: seg.end,
        text: seg.text,
        normalizedText: seg.text.toLowerCase().trim(),
        captionKind,
        captionLanguage: language
      });
    }

    processedSourceIds.push(sourceId);
  }

  const now = new Date().toISOString();
  const indexManifest: EnglishSentenceIndexManifest = {
    indexId: `${channelId}-${language}`,
    channelId,
    language,
    createdAt: now,
    updatedAt: now,
    sourceCount: processedSourceIds.length,
    sentenceCount: entries.length,
    skippedCount,
    failedCount,
    sourceIds: processedSourceIds,
    warnings
  };

  await indexStorage.writeIndex(channelId, entries, indexManifest);

  return {
    channelId,
    language,
    sourceCount: processedSourceIds.length,
    sentenceCount: entries.length,
    skippedCount,
    failedCount,
    warnings
  };
}
