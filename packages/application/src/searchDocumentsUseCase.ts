import {
  Platform,
  Source,
  getDocumentMarkdownPath,
  getDocumentTranslationPath
} from '@yanghoo/domain';
import { documentStorage, sourceStorage } from '@yanghoo/storage';
import * as fs from 'fs';

export interface SearchDocumentsOptions {
  query: string;
  limit?: number;
}

export interface SearchDocumentsResult {
  sourceId: string;
  platform: Platform;
  title: string;
  author?: string;
  timestamp?: string;
  seconds?: number;
  snippet: string;
  score: number;
  lineIndex: number;
  language: 'zh-Hans' | 'source';
  playbackUrl?: string;
}

interface ResolvedSearchDocument {
  content: string;
  language: 'zh-Hans' | 'source';
}

interface CandidateMatch {
  source: Source;
  line: string;
  lineIndex: number;
  score: number;
}

const MAX_RESULTS_PER_SOURCE = 4;

export async function searchDocumentsUseCase(options: SearchDocumentsOptions): Promise<SearchDocumentsResult[]> {
  const query = options.query.trim();
  if (!query) return [];

  const limit = Math.max(1, Math.min(options.limit ?? 30, 100));
  const sources = await sourceStorage.listSources();
  const results: SearchDocumentsResult[] = [];

  for (const source of sources) {
    const document = resolveSearchDocument(source.id);
    const sourceResults: SearchDocumentsResult[] = [];

    const metadataLine = [source.title, source.author, source.platform].filter(Boolean).join(' · ');
    const metadataScore = scoreText(query, metadataLine);
    if (metadataScore !== null) {
      sourceResults.push(createSearchResult({
        source,
        line: metadataLine,
        lineIndex: 0,
        score: metadataScore + 120
      }, query, document?.language ?? 'source'));
    }

    if (document) {
      const lines = document.content.split('\n');
      for (let index = 0; index < lines.length; index += 1) {
        const cleanLine = stripMarkdown(lines[index]).trim();
        if (!cleanLine) continue;

        const score = scoreText(query, cleanLine);
        if (score === null) continue;

        sourceResults.push(createSearchResult({
          source,
          line: lines[index],
          lineIndex: index,
          score: score + (parseTimestampLine(lines[index]) ? 40 : 0)
        }, query, document.language));
      }
    }

    results.push(
      ...sourceResults
        .sort((a, b) => b.score - a.score)
        .slice(0, MAX_RESULTS_PER_SOURCE)
    );
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function resolveSearchDocument(sourceId: string): ResolvedSearchDocument | null {
  const storage = documentStorage as unknown as { resolvePath(filePath: string): string };

  const translatedPath = getDocumentTranslationPath(sourceId, 'zh-Hans');
  const translatedAbsPath = storage.resolvePath(translatedPath);
  if (fs.existsSync(translatedAbsPath)) {
    return {
      content: fs.readFileSync(translatedAbsPath, 'utf-8'),
      language: 'zh-Hans'
    };
  }

  const markdownPath = getDocumentMarkdownPath(sourceId);
  const markdownAbsPath = storage.resolvePath(markdownPath);
  if (!fs.existsSync(markdownAbsPath)) return null;

  return {
    content: fs.readFileSync(markdownAbsPath, 'utf-8'),
    language: 'source'
  };
}

function createSearchResult(match: CandidateMatch, query: string, language: 'zh-Hans' | 'source'): SearchDocumentsResult {
  const timestamp = parseTimestampLine(match.line);
  const seconds = timestamp ? parseTimestampSeconds(timestamp) : undefined;

  return {
    sourceId: match.source.id,
    platform: match.source.platform,
    title: match.source.title || match.source.id,
    author: match.source.author,
    timestamp,
    seconds,
    snippet: createSnippet(stripMarkdown(match.line), query),
    score: Math.round(match.score),
    lineIndex: match.lineIndex,
    language,
    playbackUrl: seconds === undefined ? undefined : buildTimestampUrl(match.source, seconds)
  };
}

function parseTimestampLine(line: string): string | undefined {
  return line.match(/^\s*(?:\*\*)?\[([0-9]+(?::[0-9]{1,2}){1,2}(?:\.\d+)?)\]/)?.[1];
}

function parseTimestampSeconds(timestamp: string): number | undefined {
  const parts = timestamp.split(':').map(part => Number(part));
  if (parts.length < 2 || parts.length > 3 || parts.some(part => Number.isNaN(part))) {
    return undefined;
  }
  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  const [hours, minutes, seconds] = parts;
  return hours * 3600 + minutes * 60 + seconds;
}

function buildTimestampUrl(source: Source, seconds: number): string | undefined {
  if (!source.url) return undefined;

  try {
    const url = new URL(source.url);
    const secondsParam = Number.isInteger(seconds) ? String(seconds) : seconds.toFixed(1);

    if (source.platform === 'youtube' || source.platform === 'bilibili') {
      url.searchParams.set('t', secondsParam);
      return url.toString();
    }

    if (source.platform === 'xiaoyuzhou') {
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
      hashParams.set('ts', secondsParam);
      url.hash = hashParams.toString();
      return url.toString();
    }
  } catch (error) {
    console.warn(`[Search] Failed to build timestamp URL for ${source.id}:`, error);
  }

  return undefined;
}

function scoreText(query: string, text: string): number | null {
  const normalizedQuery = normalizeForSearch(query);
  const normalizedText = normalizeForSearch(text);
  if (!normalizedQuery || !normalizedText) return null;

  const exactIndex = normalizedText.indexOf(normalizedQuery);
  if (exactIndex >= 0) {
    return 1000 + Math.max(0, 200 - exactIndex);
  }

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  if (terms.length > 1) {
    const termScores = terms.map(term => scoreText(term, normalizedText)).filter((score): score is number => score !== null);
    if (termScores.length === terms.length) {
      return termScores.reduce((sum, score) => sum + score, 0) / terms.length + 120;
    }
  }

  let queryIndex = 0;
  let score = 0;
  let streak = 0;
  for (let textIndex = 0; textIndex < normalizedText.length && queryIndex < normalizedQuery.length; textIndex += 1) {
    if (normalizedText[textIndex] === normalizedQuery[queryIndex]) {
      streak += 1;
      score += 10 + streak * 3;
      if (textIndex === 0) score += 30;
      queryIndex += 1;
    } else {
      streak = 0;
    }
  }

  if (queryIndex !== normalizedQuery.length) return null;
  return score;
}

function normalizeForSearch(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/g, ' ').trim();
}

function stripMarkdown(value: string): string {
  return value
    .replace(/^\s*#+\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

function createSnippet(text: string, query: string): string {
  const cleanText = text.replace(/\s+/g, ' ').trim();
  if (cleanText.length <= 160) return cleanText;

  const normalizedText = normalizeForSearch(cleanText);
  const normalizedQuery = normalizeForSearch(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);
  const center = matchIndex >= 0 ? matchIndex : 0;
  const start = Math.max(0, center - 50);
  const end = Math.min(cleanText.length, start + 160);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < cleanText.length ? '...' : '';
  return `${prefix}${cleanText.slice(start, end).trim()}${suffix}`;
}
