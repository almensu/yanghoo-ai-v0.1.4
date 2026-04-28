import * as fs from 'fs';
import * as path from 'path';
import {
  Source,
  TranscriptAsset,
  DocumentAsset,
  AudioAsset,
  MediaAsset,
  MediaAssetStatus,
  MediaKind,
  getSourceRecordPath,
  getSourceDir,
  getTranscriptRawPath,
  getTranscriptSentencesPath,
  getTranscriptVttPath,
  getTranscriptManifestPath,
  getDocumentMarkdownPath,
  getAudioPath,
  getAudioManifestPath,
  getMediaManifestPath,
  DocumentReadiness,
  ReadinessStatus
} from '@yanghoo/domain';

/**
 * Interface for source record persistence.
 */
export interface SourceStorage {
  saveSource(source: Source): Promise<void>;
  getSource(id: string): Promise<Source | null>;
  listSources(): Promise<Source[]>;
}

/**
 * Interface for transcript asset persistence.
 */
export interface TranscriptStorage {
  saveTranscript(asset: TranscriptAsset): Promise<void>;
  getTranscript(sourceId: string): Promise<TranscriptAsset | null>;
}

/**
 * Interface for document asset persistence.
 */
export interface DocumentStorage {
  saveDocument(asset: DocumentAsset): Promise<void>;
  getDocument(sourceId: string): Promise<DocumentAsset | null>;
  getDocumentReadiness(sourceId: string): Promise<DocumentReadiness>;
}

/**
 * Interface for audio asset persistence.
 */
export interface AudioStorage {
  saveAudio(asset: AudioAsset): Promise<void>;
  getAudio(sourceId: string): Promise<AudioAsset | null>;
}

/**
 * Interface for media asset persistence (video/audio downloads).
 */
export interface MediaStorage {
  saveMedia(asset: MediaAsset): Promise<void>;
  getMedia(sourceId: string): Promise<MediaAsset | null>;
}

/**
 * File system implementation of SourceStorage, TranscriptStorage, and DocumentStorage.
 */
export class FileStorage implements SourceStorage, TranscriptStorage, DocumentStorage, AudioStorage, MediaStorage {
  private get dataRoot(): string {
    if (process.env.DATA_DIR) return path.resolve(process.env.DATA_DIR);
    
    // Heuristic to find repo root data dir
    const cwd = process.cwd();
    if (cwd.includes('apps/api')) {
      return path.resolve(cwd, '../../data');
    }
    if (cwd.includes('apps/web')) {
      return path.resolve(cwd, '../../data');
    }
    // Default to local data dir from project root
    return path.resolve(cwd, 'data');
  }

  private resolvePath(relPath: string): string {
    const root = this.dataRoot;
    // If relPath starts with 'data/', it's referring to the logical storage root defined in domain
    const cleanPath = relPath.startsWith('data/') ? relPath.substring(5) : relPath;
    return path.resolve(root, cleanPath);
  }

  async saveSource(source: Source): Promise<void> {
    const filePath = this.resolvePath(getSourceRecordPath(source.id));
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(source, null, 2), 'utf-8');
  }

  async getSource(id: string): Promise<Source | null> {
    const filePath = this.resolvePath(getSourceRecordPath(id));
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Source;
  }

  async listSources(): Promise<Source[]> {
    const sourcesDir = this.resolvePath('sources');
    if (!fs.existsSync(sourcesDir)) return [];
    const dirs = fs.readdirSync(sourcesDir);
    const sources: Source[] = [];
    for (const id of dirs) {
      const source = await this.getSource(id);
      if (source) sources.push(source);
    }
    return sources;
  }

  async saveTranscript(asset: TranscriptAsset): Promise<void> {
    const dirPath = this.resolvePath(getSourceDir(asset.sourceId));
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    if (asset.rawPath) {
      fs.writeFileSync(this.resolvePath(asset.rawPath), JSON.stringify(asset.segments, null, 2), 'utf-8');
    }
    if (asset.sentencesPath) {
      fs.writeFileSync(this.resolvePath(asset.sentencesPath), JSON.stringify(asset.segments, null, 2), 'utf-8');
    }

    // Save manifest for metadata
    const manifestPath = this.resolvePath(getTranscriptManifestPath(asset.sourceId));
    const manifest = {
      sourceType: asset.sourceType,
      language: asset.language,
      engine: asset.engine,
      model: asset.model,
      generatedAt: asset.generatedAt,
      rawSegmentsCount: asset.rawSegmentsCount,
      refinedSegmentsCount: asset.segments.length
    };
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  }

  async getTranscript(sourceId: string): Promise<TranscriptAsset | null> {
    const sentencesPath = this.resolvePath(getTranscriptSentencesPath(sourceId));
    if (!fs.existsSync(sentencesPath)) return null;

    const manifestPath = this.resolvePath(getTranscriptManifestPath(sourceId));
    let sourceType: any = 'none';
    let engine = '';
    let model = '';
    let generatedAt = '';

    if (fs.existsSync(manifestPath)) {
      try {
        const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        sourceType = m.sourceType;
        engine = m.engine;
        model = m.model;
        generatedAt = m.generatedAt;
      } catch (e) {}
    }

    try {
      const content = fs.readFileSync(sentencesPath, 'utf-8');
      const segments = JSON.parse(content);
      return {
        id: `ts-${sourceId}`,
        sourceId,
        status: 'refined',
        sourceType,
        engine,
        model,
        segments,
        generatedAt
      };
    } catch (e) {
      return null;
    }
  }

  async saveDocument(asset: DocumentAsset): Promise<void> {
    const dirPath = this.resolvePath(getSourceDir(asset.sourceId));
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    if (asset.markdownPath) {
      fs.writeFileSync(this.resolvePath(asset.markdownPath), asset.content, 'utf-8');
    }
  }

  async getDocument(sourceId: string): Promise<DocumentAsset | null> {
    const mdPath = this.resolvePath(getDocumentMarkdownPath(sourceId));
    if (!fs.existsSync(mdPath)) return null;

    try {
      const content = fs.readFileSync(mdPath, 'utf-8');
      return {
        id: `doc-${sourceId}`,
        sourceId,
        transcriptId: `ts-${sourceId}`,
        status: 'published',
        content,
        format: 'markdown'
      };
    } catch (e) {
      return null;
    }
  }

  async getDocumentReadiness(sourceId: string): Promise<DocumentReadiness> {
    const hasRaw = fs.existsSync(this.resolvePath(getTranscriptRawPath(sourceId)));
    const hasSentences = fs.existsSync(this.resolvePath(getTranscriptSentencesPath(sourceId)));
    const hasVtt = fs.existsSync(this.resolvePath(getTranscriptVttPath(sourceId)));
    const hasMarkdown = fs.existsSync(this.resolvePath(getDocumentMarkdownPath(sourceId)));
    const hasAudio = fs.existsSync(this.resolvePath(getAudioManifestPath(sourceId)));
    const hasMedia = fs.existsSync(this.resolvePath(getMediaManifestPath(sourceId)));
    const manifestPath = this.resolvePath(getTranscriptManifestPath(sourceId));

    let status: ReadinessStatus = 'metadata_only';
    if (hasMarkdown) {
      status = 'markdown_ready';
    } else if (hasSentences) {
      status = 'refined_ready';
    } else if (hasRaw) {
      status = 'raw_ready';
    }

    let sourceType: any = 'none';
    if (fs.existsSync(manifestPath)) {
      try {
        const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        sourceType = m.sourceType;
      } catch (e) {}
    }

    let sentencesCount = 0;
    if (hasSentences) {
      try {
        const content = fs.readFileSync(this.resolvePath(getTranscriptSentencesPath(sourceId)), 'utf-8');
        const segments = JSON.parse(content);
        sentencesCount = segments.length;
      } catch (e) {}
    }

    let mediaStatus: MediaAssetStatus | undefined;
    let mediaKind: MediaKind | undefined;
    if (hasMedia) {
      try {
        const m = JSON.parse(fs.readFileSync(this.resolvePath(getMediaManifestPath(sourceId)), 'utf-8'));
        mediaStatus = m.status;
        mediaKind = m.mediaKind;
      } catch (e) {}
    }

    return {
      status,
      source: sourceType,
      sentencesCount,
      chaptersCount: 0,
      hasMarkdown,
      hasRefined: hasSentences,
      hasVtt,
      hasAudio,
      hasMedia,
      mediaStatus,
      mediaKind
    };
  }

  async saveAudio(asset: AudioAsset): Promise<void> {
    const dirPath = this.resolvePath(getSourceDir(asset.sourceId));
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    const manifestPath = this.resolvePath(getAudioManifestPath(asset.sourceId));
    fs.writeFileSync(manifestPath, JSON.stringify(asset, null, 2), 'utf-8');
  }

  async getAudio(sourceId: string): Promise<AudioAsset | null> {
    const manifestPath = this.resolvePath(getAudioManifestPath(sourceId));
    if (!fs.existsSync(manifestPath)) return null;

    try {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      return JSON.parse(content) as AudioAsset;
    } catch (e) {
      return null;
    }
  }

  async saveMedia(asset: MediaAsset): Promise<void> {
    const dirPath = this.resolvePath(getSourceDir(asset.sourceId));
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });

    const manifestPath = this.resolvePath(getMediaManifestPath(asset.sourceId));
    fs.writeFileSync(manifestPath, JSON.stringify(asset, null, 2), 'utf-8');
  }

  async getMedia(sourceId: string): Promise<MediaAsset | null> {
    const manifestPath = this.resolvePath(getMediaManifestPath(sourceId));
    if (!fs.existsSync(manifestPath)) return null;

    try {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      return JSON.parse(content) as MediaAsset;
    } catch (e) {
      return null;
    }
  }

  // Helper to write raw data to a specific path
  async writeAssetFile(filePath: string, content: string): Promise<void> {
    const absolutePath = this.resolvePath(filePath);
    const dirPath = path.dirname(absolutePath);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(absolutePath, content, 'utf-8');
  }
}

// Current singleton for simplicity in MVP
export const sourceStorage = new FileStorage();
export const transcriptStorage = sourceStorage;
export const documentStorage = sourceStorage;
export const audioStorage = sourceStorage;
export const mediaStorage = sourceStorage;
