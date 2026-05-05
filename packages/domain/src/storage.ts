/**
 * Storage Path Contracts
 */

export const STORAGE_ROOT = 'data';

export const getSourceDir = (sourceId: string) => `${STORAGE_ROOT}/sources/${sourceId}`;

export const getSourceRecordPath = (sourceId: string) => `${getSourceDir(sourceId)}/record.json`;

export const getTranscriptRawPath = (sourceId: string) => `${getSourceDir(sourceId)}/transcript-raw.json`;

export const getTranscriptSentencesPath = (sourceId: string) => `${getSourceDir(sourceId)}/transcript-sentences.json`;

export const getTranscriptManifestPath = (sourceId: string) => `${getSourceDir(sourceId)}/transcript-manifest.json`;

export const getTranscriptVttPath = (sourceId: string) => `${getSourceDir(sourceId)}/transcript.vtt`;

export const getDocumentMarkdownPath = (sourceId: string) => `${getSourceDir(sourceId)}/document.md`;

export const getCaptionDir = (sourceId: string) => `${getSourceDir(sourceId)}/captions`;

export const getCaptionLanguageDir = (sourceId: string, lang: string) => `${getCaptionDir(sourceId)}/${lang}`;

export const getCaptionRawPath = (sourceId: string, lang: string) => `${getCaptionLanguageDir(sourceId, lang)}/transcript-raw.json`;

export const getCaptionSentencesPath = (sourceId: string, lang: string) => `${getCaptionLanguageDir(sourceId, lang)}/transcript-sentences.json`;

export const getCaptionVttPath = (sourceId: string, lang: string) => `${getCaptionLanguageDir(sourceId, lang)}/transcript.vtt`;

export const getCaptionDocumentPath = (sourceId: string, lang: string) => `${getCaptionLanguageDir(sourceId, lang)}/document.md`;

export const getCaptionBundleManifestPath = (sourceId: string) => `${getCaptionDir(sourceId)}/captions-manifest.json`;

export const getAudioPath = (sourceId: string, ext: string = 'mp3') => `${getSourceDir(sourceId)}/audio.${ext}`;

export const getAudioManifestPath = (sourceId: string) => `${getSourceDir(sourceId)}/audio-manifest.json`;

export const getThumbnailPath = (sourceId: string, ext: string = 'jpg') => `${getSourceDir(sourceId)}/thumbnail.${ext}`;

export const getMediaManifestPath = (sourceId: string) => `${getSourceDir(sourceId)}/media-manifest.json`;

export const getMediaDownloadPath = (sourceId: string, ext: string) => `${getSourceDir(sourceId)}/media.${ext}`;

export const getTranslationDir = (sourceId: string) => `${getSourceDir(sourceId)}/translation`;

export const getTranslationChunksDir = (sourceId: string) => `${getTranslationDir(sourceId)}/chunks`;

export const formatTranslationChunkNumber = (index: number) => (index + 1).toString().padStart(3, '0');

export const getTranslationAnalysisPath = (sourceId: string) => `${getTranslationDir(sourceId)}/01-analysis.md`;

export const getTranslationPromptPath = (sourceId: string) => `${getTranslationDir(sourceId)}/02-prompt.md`;

export const getTranslationChunkPath = (sourceId: string, index: number) =>
  `${getTranslationChunksDir(sourceId)}/chunk-${formatTranslationChunkNumber(index)}.md`;

export const getTranslationChunkOutputPath = (sourceId: string, index: number, lang: string = 'zh-Hans') =>
  `${getTranslationChunksDir(sourceId)}/chunk-${formatTranslationChunkNumber(index)}.${lang}.md`;

export const getDocumentTranslationPath = (sourceId: string, lang: string) =>
  `${getTranslationDir(sourceId)}/document.${lang}.md`;

export const getTranslationManifestPath = (sourceId: string) => `${getTranslationDir(sourceId)}/translation-manifest.json`;

export const getChannelDir = (channelId: string) => `${STORAGE_ROOT}/channels/${channelId}`;

export const getChannelManifestPath = (channelId: string) => `${getChannelDir(channelId)}/channel-manifest.json`;

export const getChannelVideosPath = (channelId: string) => `${getChannelDir(channelId)}/videos.json`;

export const getChannelSyncCheckpointPath = (channelId: string) => `${getChannelDir(channelId)}/sync-checkpoint.json`;

export const getChannelCaptionSyncReportPath = (channelId: string) => `${getChannelDir(channelId)}/caption-sync-report.json`;

export const getVideoSelectionPath = (channelId: string) => `${getChannelDir(channelId)}/video-selection.json`;

export const getChannelRefreshReportPath = (channelId: string) => `${getChannelDir(channelId)}/channel-refresh-report.json`;

export const getIndexDir = (channelId: string) => `${STORAGE_ROOT}/indexes/${channelId}`;
export const getEnglishSentencesJsonlPath = (channelId: string) => `${getIndexDir(channelId)}/english-sentences.jsonl`;
export const getEnglishSentencesManifestPath = (channelId: string) => `${getIndexDir(channelId)}/english-sentences-manifest.json`;

export const getLearningDir = () => `${STORAGE_ROOT}/learning`;
export const getSavedEnglishExamplesPath = () => `${getLearningDir()}/english-saved-examples.json`;
