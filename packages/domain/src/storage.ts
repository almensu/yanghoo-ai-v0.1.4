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

export const getAudioPath = (sourceId: string, ext: string = 'mp3') => `${getSourceDir(sourceId)}/audio.${ext}`;

export const getAudioManifestPath = (sourceId: string) => `${getSourceDir(sourceId)}/audio-manifest.json`;

export const getThumbnailPath = (sourceId: string, ext: string = 'jpg') => `${getSourceDir(sourceId)}/thumbnail.${ext}`;

export const getMediaManifestPath = (sourceId: string) => `${getSourceDir(sourceId)}/media-manifest.json`;

export const getMediaDownloadPath = (sourceId: string, ext: string) => `${getSourceDir(sourceId)}/media.${ext}`;
