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
  getCaptionDir,
  getAudioPath,
  getAudioManifestPath,
  getMediaManifestPath,
  getDocumentTranslationPath,
  getTranslationDir,
  getTranslationManifestPath,
  DocumentReadiness,
  ReadinessStatus,
  AudioStatus,
  DeleteSourceAssetsScope,
  TranslationStatus,
  TranscriptFallback,
  TranscriptStatus
} from '@yanghoo/domain';

/**
 * Interface for source record persistence.
 */
export interface SourceStorage {
  saveSource(source: Source): Promise<void>;
  getSource(id: string): Promise<Source | null>;
  listSources(): Promise<Source[]>;
  deleteSource(id: string): Promise<{ deleted: string[], skipped: string[], failed: { path: string, reason: string }[] }>;
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
  deleteAssets(sourceId: string, scope: DeleteSourceAssetsScope): Promise<{ deleted: string[], skipped: string[], failed: { path: string, reason: string }[] }>;
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

    // Deduplication by platform + canonicalId
    const seen = new Map<string, Source>();
    for (const s of sources) {
      if (s.platform && s.canonicalId) {
        let canonicalKey = s.canonicalId;
        // Normalize XHS canonical IDs for deduplication (strip query strings from legacy dirty records)
        if (s.platform === 'xiaohongshu' && canonicalKey.includes('?')) {
          canonicalKey = canonicalKey.split('?')[0];
        }
        
        const key = `${s.platform}:${canonicalKey}`;
        const existing = seen.get(key);
        
        // If we have a duplicate, prefer the one with the cleaner ID (no '?')
        // or the more recently captured one if both are same "cleanliness"
        const isCurrentDirty = s.id.includes('?');
        const isExistingDirty = existing?.id.includes('?');

        if (!existing) {
          seen.set(key, s);
        } else if (isExistingDirty && !isCurrentDirty) {
          // Current is clean, existing is dirty -> prefer clean
          seen.set(key, s);
        } else if (!isExistingDirty && isCurrentDirty) {
          // Current is dirty, existing is clean -> keep existing
        } else {
          // Both clean or both dirty -> prefer newest
          if (new Date(s.capturedAt) > new Date(existing.capturedAt)) {
            seen.set(key, s);
          }
        }
      } else {
        // Fallback for sources without canonicalId (legacy or other)
        seen.set(s.id, s);
      }
    }

    // Sort by capturedAt desc
    return Array.from(seen.values()).sort((a, b) => 
      new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime()
    );
  }

  async deleteSource(id: string): Promise<{ deleted: string[], skipped: string[], failed: { path: string, reason: string }[] }> {
    const recordRelPath = getSourceRecordPath(id);
    const recordAbsPath = this.resolvePath(recordRelPath);
    const dirAbsPath = this.resolvePath(getSourceDir(id));

    const deleted: string[] = [];
    const skipped: string[] = [];
    const failed: { path: string, reason: string }[] = [];

    if (fs.existsSync(recordAbsPath)) {
      try {
        fs.unlinkSync(recordAbsPath);
        deleted.push(recordRelPath);
      } catch (e: any) {
        failed.push({ path: recordRelPath, reason: e.message });
      }
    } else {
      skipped.push(recordRelPath);
    }

    // Try to remove the directory if empty
    if (fs.existsSync(dirAbsPath)) {
      try {
        const remainingFiles = fs.readdirSync(dirAbsPath);
        if (remainingFiles.length === 0) {
          fs.rmdirSync(dirAbsPath);
          deleted.push(getSourceDir(id));
        }
      } catch (e) {
        // Silently ignore directory removal errors (it might not be empty)
      }
    }

    return { deleted, skipped, failed };
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
      status: asset.status,
      language: asset.language,
      engine: asset.engine,
      model: asset.model,
      captionVariants: asset.captionVariants,
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
    let hasTranslation = false;
    let translationStatus: TranslationStatus | undefined;
    let translatedPath: string | undefined;
    let translationErrorMessage: string | undefined;
    const translationManifestPath = this.resolvePath(getTranslationManifestPath(sourceId));
    if (fs.existsSync(translationManifestPath)) {
      try {
        const tm = JSON.parse(fs.readFileSync(translationManifestPath, 'utf-8'));
        translationStatus = tm.status;
        translatedPath = tm.translatedPath;
        translationErrorMessage = tm.errorMessage;
        if (tm.status === 'translated' && tm.translatedPath) {
          hasTranslation = fs.existsSync(this.resolvePath(tm.translatedPath));
        }
      } catch (e) {}
    }
    const hasAudioManifest = fs.existsSync(this.resolvePath(getAudioManifestPath(sourceId)));
    let hasAudio = false;
    let audioStatus: AudioStatus | undefined;
    let audioErrorMessage: string | undefined;
    if (hasAudioManifest) {
      try {
        const am = JSON.parse(fs.readFileSync(this.resolvePath(getAudioManifestPath(sourceId)), 'utf-8'));
        audioStatus = am.status;
        audioErrorMessage = am.errorMessage;
        if (am.status === 'fetched' && am.localPath) {
          const audioFilePath = this.resolvePath(am.localPath);
          if (fs.existsSync(audioFilePath)) {
            const stat = fs.statSync(audioFilePath);
            hasAudio = stat.size > 0;
          }
        }
      } catch (e) {}
    }
    const hasMedia = fs.existsSync(this.resolvePath(getMediaManifestPath(sourceId)));
    const manifestPath = this.resolvePath(getTranscriptManifestPath(sourceId));

    let status: ReadinessStatus = 'metadata_only';
    if (hasMarkdown) {
      status = hasTranslation ? 'enriched' : 'markdown_ready';
    } else if (hasSentences) {
      status = 'refined_ready';
    } else if (hasRaw) {
      status = 'raw_ready';
    }

    let sourceType: any = 'none';
    let transcriptStatus: TranscriptStatus | undefined;
    let transcriptErrorMessage: string | undefined;
    let transcriptFallback: TranscriptFallback | undefined;
    let needsMediaTranscriptionFallback = false;
    if (fs.existsSync(manifestPath)) {
      try {
        const m = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        sourceType = m.sourceType;
        transcriptStatus = m.status;
        transcriptErrorMessage = m.errorMessage;
        transcriptFallback = m.fallback;
        needsMediaTranscriptionFallback =
          m.status === 'failed' &&
          (m.fallback === 'audio_transcription' || m.fallback === 'media_transcription');
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
    let mediaHasAudio: boolean | undefined;
    let notTranscribableReason: string | undefined;
    if (hasMedia) {
      try {
        const m = JSON.parse(fs.readFileSync(this.resolvePath(getMediaManifestPath(sourceId)), 'utf-8'));
        mediaStatus = m.status;
        mediaKind = m.mediaKind;
        mediaHasAudio = m.hasAudio;
        notTranscribableReason = m.notTranscribableReason;
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
      transcriptStatus,
      transcriptErrorMessage,
      transcriptFallback,
      needsMediaTranscriptionFallback,
      hasTranslation,
      translationStatus,
      translatedPath,
      translationErrorMessage,
      mediaStatus,
      mediaKind,
      mediaHasAudio,
      notTranscribableReason,
      audioStatus,
      audioErrorMessage
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

  async deleteAssets(sourceId: string, scope: DeleteSourceAssetsScope): Promise<{ deleted: string[], skipped: string[], failed: { path: string, reason: string }[] }> {
    const dirPath = this.resolvePath(getSourceDir(sourceId));
    if (!fs.existsSync(dirPath)) {
      return { deleted: [], skipped: [], failed: [] };
    }

    const filesToDelete: string[] = [];
    
    // Define patterns for scopes
    if (scope === 'media' || scope === 'generated') {
      filesToDelete.push(getMediaManifestPath(sourceId));
      // For media.* we need to list files
      const dirFiles = fs.readdirSync(dirPath);
      dirFiles.forEach(f => {
        if (f.startsWith('media.')) {
          filesToDelete.push(path.join(getSourceDir(sourceId), f));
        }
      });
    }

    if (scope === 'audio' || scope === 'generated') {
      filesToDelete.push(getAudioManifestPath(sourceId));
      const dirFiles = fs.readdirSync(dirPath);
      dirFiles.forEach(f => {
        if (f.startsWith('audio.')) {
          filesToDelete.push(path.join(getSourceDir(sourceId), f));
        }
      });
    }

    if (scope === 'transcript' || scope === 'generated') {
      filesToDelete.push(getTranscriptManifestPath(sourceId));
      filesToDelete.push(getTranscriptRawPath(sourceId));
      filesToDelete.push(getTranscriptSentencesPath(sourceId));
      filesToDelete.push(getTranscriptVttPath(sourceId));
      filesToDelete.push(getDocumentMarkdownPath(sourceId));
      filesToDelete.push(getDocumentTranslationPath(sourceId, 'zh-Hans'));
      filesToDelete.push(getTranslationManifestPath(sourceId));
      const captionsDirRelPath = getCaptionDir(sourceId);
      const captionsDirAbsPath = this.resolvePath(captionsDirRelPath);
      if (fs.existsSync(captionsDirAbsPath)) {
        filesToDelete.push(...this.listRelativeFiles(captionsDirAbsPath, captionsDirRelPath));
      }
      
      const dirFiles = fs.readdirSync(dirPath);
      dirFiles.forEach(f => {
        if (f.startsWith('mlx_out_') || f.startsWith('mlx-script-output-')) {
          filesToDelete.push(path.join(getSourceDir(sourceId), f));
        }
      });
    }

    if (scope === 'generated') {
      const translationDirRelPath = getTranslationDir(sourceId);
      const translationDirAbsPath = this.resolvePath(translationDirRelPath);
      if (fs.existsSync(translationDirAbsPath)) {
        filesToDelete.push(...this.listRelativeFiles(translationDirAbsPath, translationDirRelPath));
      }
    }

    const deleted: string[] = [];
    const skipped: string[] = [];
    const failed: { path: string, reason: string }[] = [];

    // Deduplicate and filter out empties
    const uniqueFiles = Array.from(new Set(filesToDelete.filter(Boolean)));

    for (const relPath of uniqueFiles) {
      const absPath = this.resolvePath(relPath);
      if (fs.existsSync(absPath)) {
        try {
          fs.unlinkSync(absPath);
          deleted.push(relPath);
        } catch (e: any) {
          failed.push({ path: relPath, reason: e.message });
        }
      } else {
        skipped.push(relPath);
      }
    }

    return { deleted, skipped, failed };
  }

  // Helper to write raw data to a specific path
  async writeAssetFile(filePath: string, content: string): Promise<void> {
    const absolutePath = this.resolvePath(filePath);
    const dirPath = path.dirname(absolutePath);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(absolutePath, content, 'utf-8');
  }

  private listRelativeFiles(absDir: string, relDir: string): string[] {
    const entries = fs.readdirSync(absDir, { withFileTypes: true });
    const files: string[] = [];
    for (const entry of entries) {
      const childAbsPath = path.join(absDir, entry.name);
      const childRelPath = path.join(relDir, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.listRelativeFiles(childAbsPath, childRelPath));
      } else {
        files.push(childRelPath);
      }
    }
    return files;
  }
}

// Current singleton for simplicity in MVP
export const sourceStorage = new FileStorage();
export const transcriptStorage = sourceStorage;
export const documentStorage = sourceStorage;
export const audioStorage = sourceStorage;
export const mediaStorage = sourceStorage;
