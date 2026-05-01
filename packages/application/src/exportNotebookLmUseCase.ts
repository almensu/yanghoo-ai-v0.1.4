import {
  getDocumentMarkdownPath,
  getDocumentTranslationPath,
  Source
} from '@yanghoo/domain';
import { documentStorage, sourceStorage } from '@yanghoo/storage';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { resolveProjectRoot } from './resolveProjectRoot.js';

export type NotebookLmExportMode = 'markdown' | 'url-list';
export type NotebookLmExportLanguage = 'zh-Hans-preferred';

export interface NotebookLmExportOptions {
  sourceIds: string[];
  mode: NotebookLmExportMode;
  language?: NotebookLmExportLanguage;
}

export interface NotebookLmExportFile {
  sourceId?: string;
  path: string;
  kind: 'markdown' | 'url-list' | 'manifest';
}

export interface NotebookLmExportSkipped {
  sourceId: string;
  reason: string;
}

export interface NotebookLmExportResult {
  exportId: string;
  exportDir: string;
  files: NotebookLmExportFile[];
  skipped: NotebookLmExportSkipped[];
  mode: NotebookLmExportMode;
  generatedAt: string;
}

interface ResolvedDocumentContent {
  content: string;
  language: 'zh-Hans' | 'en';
  sourcePath: string;
}

const EXPORT_ROOT = 'data/exports/notebooklm';

export async function exportNotebookLmUseCase(options: NotebookLmExportOptions): Promise<NotebookLmExportResult> {
  const sourceIds = Array.from(new Set(options.sourceIds.filter(Boolean)));
  if (!sourceIds.length) {
    throw new Error('No sourceIds provided for NotebookLM export');
  }

  const mode = options.mode;
  const generatedAt = new Date().toISOString();
  const exportId = createUniqueExportId(generatedAt);
  const exportDir = path.join(EXPORT_ROOT, exportId);
  const exportAbsDir = path.resolve(resolveProjectRoot(), exportDir);
  const files: NotebookLmExportFile[] = [];
  const skipped: NotebookLmExportSkipped[] = [];

  fs.mkdirSync(exportAbsDir, { recursive: true });

  if (mode === 'markdown') {
    const markdownAbsDir = path.join(exportAbsDir, 'markdown');
    fs.mkdirSync(markdownAbsDir, { recursive: true });
    const usedNames = new Set<string>();

    for (const sourceId of sourceIds) {
      const source = await sourceStorage.getSource(sourceId);
      if (!source) {
        skipped.push({ sourceId, reason: 'Source not found' });
        continue;
      }

      const documentContent = resolveDocumentContent(sourceId);
      if (!documentContent) {
        skipped.push({ sourceId, reason: '没有可导出的 Markdown 文档' });
        continue;
      }

      const fileName = createUniqueFileName(createMarkdownFileBaseName(source), usedNames, '.md');
      const relPath = path.join(exportDir, 'markdown', fileName);
      const absPath = path.join(exportAbsDir, 'markdown', fileName);
      fs.writeFileSync(absPath, buildNotebookLmMarkdown(source, documentContent, generatedAt), 'utf-8');
      files.push({ sourceId, path: relPath, kind: 'markdown' });
    }
  } else if (mode === 'url-list') {
    const urlsAbsDir = path.join(exportAbsDir, 'urls');
    fs.mkdirSync(urlsAbsDir, { recursive: true });
    const urls: string[] = [];

    for (const sourceId of sourceIds) {
      const source = await sourceStorage.getSource(sourceId);
      if (!source) {
        skipped.push({ sourceId, reason: 'Source not found' });
        continue;
      }
      if (!source.url) {
        skipped.push({ sourceId, reason: '没有可导出的 URL' });
        continue;
      }
      urls.push(source.url);
    }

    if (urls.length) {
      const relPath = path.join(exportDir, 'urls', 'sources.txt');
      fs.writeFileSync(path.join(urlsAbsDir, 'sources.txt'), `${urls.join('\n')}\n`, 'utf-8');
      files.push({ path: relPath, kind: 'url-list' });
    }
  } else {
    throw new Error(`Unsupported NotebookLM export mode: ${mode}`);
  }

  const manifest: NotebookLmExportResult = {
    exportId,
    exportDir,
    files,
    skipped,
    mode,
    generatedAt
  };
  const manifestRelPath = path.join(exportDir, 'export-manifest.json');
  fs.writeFileSync(path.join(exportAbsDir, 'export-manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');
  manifest.files.push({ path: manifestRelPath, kind: 'manifest' });
  fs.writeFileSync(path.join(exportAbsDir, 'export-manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  return manifest;
}

export function openNotebookLmExportDirUseCase(exportId: string): { exportId: string; exportDir: string; opened: boolean } {
  const safeExportId = exportId.trim();
  if (!/^[A-Za-z0-9._-]+$/.test(safeExportId)) {
    throw new Error('Invalid NotebookLM export id');
  }

  const root = resolveProjectRoot();
  const exportRootAbsPath = path.resolve(root, EXPORT_ROOT);
  const exportAbsPath = path.resolve(exportRootAbsPath, safeExportId);
  if (!exportAbsPath.startsWith(`${exportRootAbsPath}${path.sep}`)) {
    throw new Error('Export directory is outside NotebookLM export root');
  }
  if (!fs.existsSync(exportAbsPath) || !fs.statSync(exportAbsPath).isDirectory()) {
    throw new Error(`NotebookLM export directory not found: ${safeExportId}`);
  }

  const result = spawnSync('open', [exportAbsPath], {
    encoding: 'utf-8',
    timeout: 10_000
  });
  if (result.error || result.status !== 0) {
    throw new Error(result.stderr || result.error?.message || 'Failed to open NotebookLM export directory');
  }

  return {
    exportId: safeExportId,
    exportDir: path.join(EXPORT_ROOT, safeExportId),
    opened: true
  };
}

function resolveDocumentContent(sourceId: string): ResolvedDocumentContent | null {
  const storage = documentStorage as unknown as { resolvePath(filePath: string): string };
  const translatedPath = getDocumentTranslationPath(sourceId, 'zh-Hans');
  const translatedAbsPath = storage.resolvePath(translatedPath);
  if (fs.existsSync(translatedAbsPath)) {
    return {
      content: fs.readFileSync(translatedAbsPath, 'utf-8'),
      language: 'zh-Hans',
      sourcePath: translatedPath
    };
  }

  const markdownPath = getDocumentMarkdownPath(sourceId);
  const markdownAbsPath = storage.resolvePath(markdownPath);
  if (!fs.existsSync(markdownAbsPath)) {
    return null;
  }

  return {
    content: fs.readFileSync(markdownAbsPath, 'utf-8'),
    language: 'en',
    sourcePath: markdownPath
  };
}

function buildNotebookLmMarkdown(source: Source, documentContent: ResolvedDocumentContent, exportedAt: string): string {
  const frontmatter = [
    '---',
    `title: ${yamlScalar(source.title || source.id)}`,
    `platform: ${yamlScalar(platformLabel(source.platform))}`,
    `author: ${yamlScalar(source.author || 'Unknown')}`,
    `sourceUrl: ${yamlScalar(source.url)}`,
    `sourceId: ${yamlScalar(source.id)}`,
    `language: ${yamlScalar(documentContent.language)}`,
    `documentPath: ${yamlScalar(documentContent.sourcePath)}`,
    `exportedAt: ${yamlScalar(exportedAt)}`,
    '---'
  ].join('\n');

  return `${frontmatter}\n\n${documentContent.content.trim()}\n`;
}

function createUniqueExportId(generatedAt: string): string {
  const rootAbsDir = path.resolve(resolveProjectRoot(), EXPORT_ROOT);
  const baseExportId = createExportId(generatedAt);
  let exportId = baseExportId;
  let index = 2;
  while (fs.existsSync(path.join(rootAbsDir, exportId))) {
    exportId = `${baseExportId}-${index}`;
    index += 1;
  }
  return exportId;
}

function createExportId(generatedAt: string): string {
  const date = new Date(generatedAt);
  const pad = (value: number) => value.toString().padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
    'notebooklm-export'
  ].join('-');
}

function createMarkdownFileBaseName(source: Source): string {
  return [
    platformLabel(source.platform),
    source.author || 'Unknown',
    source.title || source.id
  ].map(sanitizeFileNamePart).filter(Boolean).join('-') || source.id;
}

function createUniqueFileName(baseName: string, usedNames: Set<string>, ext: string): string {
  const truncatedBase = truncateFileName(baseName, 120);
  let candidate = `${truncatedBase}${ext}`;
  let index = 2;
  while (usedNames.has(candidate)) {
    candidate = `${truncateFileName(truncatedBase, 116)}-${index}${ext}`;
    index += 1;
  }
  usedNames.add(candidate);
  return candidate;
}

function sanitizeFileNamePart(value: string): string {
  return value
    .replace(/[\/\\:*?"<>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateFileName(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength).trim();
}

function platformLabel(platform: Source['platform']): string {
  const labels: Partial<Record<Source['platform'], string>> = {
    youtube: 'YouTube',
    xiaohongshu: 'XHS',
    douyin: 'Douyin',
    bilibili: 'Bilibili',
    tiktok: 'TikTok',
    x: 'X',
    xiaoyuzhou: 'Podcast',
    apple_podcast: 'Podcast',
    webpage: 'Web'
  };
  return labels[platform] || platform;
}

function yamlScalar(value: string): string {
  return JSON.stringify(value);
}
