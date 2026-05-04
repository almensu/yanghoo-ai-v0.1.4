import * as fs from 'fs';
import * as path from 'path';
import {
  EnglishSentenceIndexEntry,
  EnglishSentenceIndexManifest,
  getIndexDir,
  getEnglishSentencesJsonlPath,
  getEnglishSentencesManifestPath
} from '@yanghoo/domain';

export interface EnglishSentenceIndexStorage {
  writeIndex(channelId: string, entries: EnglishSentenceIndexEntry[], manifest: EnglishSentenceIndexManifest): Promise<void>;
  readManifest(channelId: string): Promise<EnglishSentenceIndexManifest | null>;
  readEntries(channelId: string): Promise<EnglishSentenceIndexEntry[]>;
}

export function createEnglishSentenceIndexStorage(dataRoot: string): EnglishSentenceIndexStorage {
  const resolve = (rel: string) => path.resolve(dataRoot, rel.startsWith('data/') ? rel.substring(5) : rel);

  return {
    async writeIndex(channelId, entries, manifest) {
      const indexDir = resolve(getIndexDir(channelId));
      if (!fs.existsSync(indexDir)) fs.mkdirSync(indexDir, { recursive: true });

      const jsonlPath = resolve(getEnglishSentencesJsonlPath(channelId));
      const lines = entries.map(e => JSON.stringify(e));
      fs.writeFileSync(jsonlPath, lines.join('\n') + '\n', 'utf-8');

      const manifestPath = resolve(getEnglishSentencesManifestPath(channelId));
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
    },

    async readManifest(channelId) {
      const manifestPath = resolve(getEnglishSentencesManifestPath(channelId));
      if (!fs.existsSync(manifestPath)) return null;
      return JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    },

    async readEntries(channelId) {
      const jsonlPath = resolve(getEnglishSentencesJsonlPath(channelId));
      if (!fs.existsSync(jsonlPath)) return [];
      const content = fs.readFileSync(jsonlPath, 'utf-8');
      return content.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
    }
  };
}
