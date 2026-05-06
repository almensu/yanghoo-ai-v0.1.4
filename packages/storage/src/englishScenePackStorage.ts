import * as fs from 'fs';
import * as path from 'path';
import {
  EnglishScenePack,
  EnglishScenePackSummary,
  getEnglishScenePackIndexPath,
  getEnglishScenePackPath,
  getEnglishScenePacksDir
} from '@yanghoo/domain';

export interface EnglishScenePackStorage {
  readIndex(): Promise<{ version: 1; updatedAt: string; items: EnglishScenePackSummary[] }>;
  writeIndex(data: { version: 1; updatedAt: string; items: EnglishScenePackSummary[] }): Promise<void>;
  readPack(packId: string): Promise<EnglishScenePack | null>;
  writePack(pack: EnglishScenePack): Promise<void>;
  deletePack(packId: string): Promise<boolean>;
}

export class FileEnglishScenePackStorage implements EnglishScenePackStorage {
  private get dataRoot(): string {
    if (process.env.DATA_DIR) return path.resolve(process.env.DATA_DIR);
    const cwd = process.cwd();
    if (cwd.includes('apps/api')) return path.resolve(cwd, '../../data');
    if (cwd.includes('apps/web')) return path.resolve(cwd, '../../data');
    return path.resolve(cwd, 'data');
  }

  private resolvePath(relPath: string): string {
    const cleanPath = relPath.startsWith('data/') ? relPath.substring(5) : relPath;
    return path.resolve(this.dataRoot, cleanPath);
  }

  async readIndex(): Promise<{ version: 1; updatedAt: string; items: EnglishScenePackSummary[] }> {
    const filePath = this.resolvePath(getEnglishScenePackIndexPath());
    if (!fs.existsSync(filePath)) {
      return { version: 1, updatedAt: new Date().toISOString(), items: [] };
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  async writeIndex(data: { version: 1; updatedAt: string; items: EnglishScenePackSummary[] }): Promise<void> {
    const filePath = this.resolvePath(getEnglishScenePackIndexPath());
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  async readPack(packId: string): Promise<EnglishScenePack | null> {
    const filePath = this.resolvePath(getEnglishScenePackPath(packId));
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  async writePack(pack: EnglishScenePack): Promise<void> {
    const filePath = this.resolvePath(getEnglishScenePackPath(pack.id));
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(pack, null, 2), 'utf-8');
  }

  async deletePack(packId: string): Promise<boolean> {
    const filePath = this.resolvePath(getEnglishScenePackPath(packId));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  }
}

export const englishScenePackStorage = new FileEnglishScenePackStorage();
