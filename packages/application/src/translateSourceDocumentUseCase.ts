import {
  getDocumentMarkdownPath,
  getDocumentTranslationPath,
  getTranslationAnalysisPath,
  getTranslationChunkOutputPath,
  getTranslationChunkPath,
  getTranslationManifestPath,
  getTranslationPromptPath
} from '@yanghoo/domain';
import { llmGateway } from '@yanghoo/llm-gateway';
import { documentStorage, sourceStorage } from '@yanghoo/storage';
import { normalizeTranscriptText } from '@yanghoo/transcript';
import * as fs from 'fs';
import { loadPromptTemplate, parsePromptDocument } from './promptLoader.js';

const DEFAULT_MODEL_ID = 'Qwen/Qwen3-4B-MLX-4bit';
const DEFAULT_PROMPT_PATH = 'docs/prompts/translation/en-to-zh-simplified.md';
const DEFAULT_GLOSSARY_PATH = 'docs/prompts/translation/glossary-en-zh.md';

export interface TranslationModelConfig {
  id: string;
  label: string;
  sourceChunkTargetTokens: number;
  maxRequestTokens: number;
  sharedPromptBudgetTokens: number;
  reservedOutputTokens: number;
  safetyMarginTokens: number;
}

export const TRANSLATION_MODEL_CONFIGS: TranslationModelConfig[] = [
  {
    id: 'Qwen/Qwen3-4B-MLX-4bit',
    label: 'Qwen3 4B MLX 4-bit',
    sourceChunkTargetTokens: 4000,
    maxRequestTokens: 12000,
    sharedPromptBudgetTokens: 2000,
    reservedOutputTokens: 5000,
    safetyMarginTokens: 1000
  },
  {
    id: 'Qwen/Qwen3-8B-MLX-4bit',
    label: 'Qwen3 8B MLX 4-bit',
    sourceChunkTargetTokens: 3000,
    maxRequestTokens: 10000,
    sharedPromptBudgetTokens: 1800,
    reservedOutputTokens: 4500,
    safetyMarginTokens: 1200
  }
];

interface WritableAssetStorage {
  resolvePath(filePath: string): string;
  writeAssetFile(filePath: string, content: string): Promise<void>;
}

export interface TranslateOptions {
  modelId?: string;
  force?: boolean;
  promptPath?: string;
  glossaryPath?: string;
  sourceChunkTargetTokens?: number;
  maxRequestTokens?: number;
  sharedPromptBudgetTokens?: number;
  reservedOutputTokens?: number;
  safetyMarginTokens?: number;
}

interface TranslationChunk {
  index: number;
  text: string;
  estimatedTokens: number;
}

/**
 * Use Case: Translate a source document to Simplified Chinese using local MLX LM.
 */
export async function translateSourceDocumentUseCase(sourceId: string, options: TranslateOptions = {}): Promise<string> {
  const modelConfig = resolveTranslationModelConfig(options.modelId);
  const modelId = modelConfig.id;
  const promptPath = options.promptPath || DEFAULT_PROMPT_PATH;
  const glossaryPath = options.glossaryPath || DEFAULT_GLOSSARY_PATH;
  const sourceChunkTargetTokens = options.sourceChunkTargetTokens ?? modelConfig.sourceChunkTargetTokens;
  const maxRequestTokens = options.maxRequestTokens ?? modelConfig.maxRequestTokens;
  const sharedPromptBudgetTokens = options.sharedPromptBudgetTokens ?? modelConfig.sharedPromptBudgetTokens;
  const reservedOutputTokens = options.reservedOutputTokens ?? modelConfig.reservedOutputTokens;
  const safetyMarginTokens = options.safetyMarginTokens ?? modelConfig.safetyMarginTokens;

  console.log(`[UseCase] translateSourceDocumentUseCase for source: ${sourceId} using ${modelId}`);

  const source = await sourceStorage.getSource(sourceId);
  if (!source) throw new Error(`Source not found: ${sourceId}`);

  const docAsset = await documentStorage.getDocument(sourceId);
  if (!docAsset || !docAsset.content) {
    throw new Error(`No readable document found for source: ${sourceId}`);
  }

  const assetStorage = documentStorage as unknown as WritableAssetStorage;
  const translatedPath = getDocumentTranslationPath(sourceId, 'zh-Hans');
  const manifestPath = getTranslationManifestPath(sourceId);
  const translatedAbsPath = assetStorage.resolvePath(translatedPath);
  const manifestAbsPath = assetStorage.resolvePath(manifestPath);

  if (!options.force && fs.existsSync(translatedAbsPath) && fs.existsSync(manifestAbsPath)) {
    try {
      const existingManifest = JSON.parse(fs.readFileSync(manifestAbsPath, 'utf-8'));
      if (existingManifest.status === 'translated') {
        console.log(`[UseCase] Document already translated for ${sourceId}. Returning existing.`);
        return translatedPath;
      }
    } catch (e) {
      // Regenerate if the manifest is not readable.
    }
  }

  const promptContent = loadPromptTemplate(promptPath);
  const glossaryContent = loadPromptTemplate(glossaryPath);
  const parsedPrompt = parsePromptDocument(promptContent);
  const chunks = chunkMarkdownByTokenBudget(docAsset.content, sourceChunkTargetTokens);
  const extractedTerms = extractJobTerms(docAsset.content, glossaryContent);
  const analysisContent = buildAnalysisContent({
    sourceId,
    sourceTitle: source.title,
    platform: source.platform,
    content: docAsset.content,
    extractedTerms,
    modelId,
    sourceChunkTargetTokens,
    maxRequestTokens,
    sharedPromptBudgetTokens,
    reservedOutputTokens,
    safetyMarginTokens
  });
  const sharedPrompt = buildSharedPrompt({
    parsedPrompt,
    glossaryContent,
    analysisContent,
    extractedTerms
  });

  const analysisPath = getTranslationAnalysisPath(sourceId);
  const assembledPromptPath = getTranslationPromptPath(sourceId);

  await assetStorage.writeAssetFile(analysisPath, analysisContent);
  await assetStorage.writeAssetFile(assembledPromptPath, sharedPrompt);

  const translatedChunks: string[] = [];
  const chunkAssets: Array<{
    sourcePath: string;
    translatedPath: string;
    estimatedSourceTokens: number;
  }> = [];

  try {
    for (const chunk of chunks) {
      const chunkPath = getTranslationChunkPath(sourceId, chunk.index);
      const chunkOutputPath = getTranslationChunkOutputPath(sourceId, chunk.index, 'zh-Hans');

      console.log(`[UseCase] Translating chunk ${chunk.index + 1}/${chunks.length} (${chunk.estimatedTokens} estimated tokens)`);
      await assetStorage.writeAssetFile(chunkPath, chunk.text);

      const translated = await llmGateway.generateContent('mlx-lm', [
        {
          role: 'system',
          content: sharedPrompt,
          timestamp: new Date().toISOString()
        },
        {
          role: 'user',
          content: renderChunkUserPrompt(parsedPrompt.userTemplate, chunk.text),
          timestamp: new Date().toISOString()
        }
      ], {
        modelId,
        temperature: 0,
        maxTokens: reservedOutputTokens
      });

      const normalizedTranslation = normalizeTranscriptText(translated.trim());
      translatedChunks.push(normalizedTranslation);
      await assetStorage.writeAssetFile(chunkOutputPath, normalizedTranslation);
      chunkAssets.push({
        sourcePath: chunkPath,
        translatedPath: chunkOutputPath,
        estimatedSourceTokens: chunk.estimatedTokens
      });
    }

    const finalContent = normalizeTranscriptText(translatedChunks.join('\n\n').trim() + '\n');
    await assetStorage.writeAssetFile(translatedPath, finalContent);

    const manifest = {
      sourceId,
      status: 'translated',
      sourcePath: getDocumentMarkdownPath(sourceId),
      translatedPath,
      provider: 'mlx-lm',
      model: modelId,
      promptPath,
      glossaryPath,
      analysisPath,
      assembledPromptPath,
      chunksCount: chunks.length,
      sourceChunkTargetTokens,
      maxRequestTokens,
      sharedPromptBudgetTokens,
      reservedOutputTokens,
      safetyMarginTokens,
      estimatedSourceTokens: estimateTokens(docAsset.content),
      chunkAssets,
      generatedAt: new Date().toISOString()
    };
    await assetStorage.writeAssetFile(manifestPath, JSON.stringify(manifest, null, 2));

    console.log(`[UseCase] Translation complete for: ${sourceId}`);
    return translatedPath;
  } catch (error: any) {
    const failedManifest = {
      sourceId,
      status: 'failed',
      sourcePath: getDocumentMarkdownPath(sourceId),
      translatedPath,
      provider: 'mlx-lm',
      model: modelId,
      promptPath,
      glossaryPath,
      analysisPath,
      assembledPromptPath,
      chunksCount: chunks.length,
      sourceChunkTargetTokens,
      maxRequestTokens,
      sharedPromptBudgetTokens,
      reservedOutputTokens,
      safetyMarginTokens,
      errorMessage: error.message,
      generatedAt: new Date().toISOString()
    };
    await assetStorage.writeAssetFile(manifestPath, JSON.stringify(failedManifest, null, 2));
    throw error;
  }
}

function resolveTranslationModelConfig(modelId?: string): TranslationModelConfig {
  const requestedModelId = modelId || DEFAULT_MODEL_ID;
  const config = TRANSLATION_MODEL_CONFIGS.find(model => model.id === requestedModelId);
  if (!config) {
    throw new Error(`Unsupported translation model: ${requestedModelId}`);
  }
  return config;
}

function buildSharedPrompt(input: {
  parsedPrompt: ReturnType<typeof parsePromptDocument>;
  glossaryContent: string;
  analysisContent: string;
  extractedTerms: string[];
}): string {
  const jobGlossary = input.extractedTerms.length
    ? input.extractedTerms.map(term => `- ${term} -> keep consistent; translate only when a standard Simplified Chinese translation is obvious from context`).join('\n')
    : '- No recurring job-specific terms extracted.';

  return [
    '# Translation Shared Context',
    '',
    'The target language is Simplified Chinese (zh-Hans). Use Mainland Simplified Chinese wording and normalize any Traditional Chinese to Simplified Chinese.',
    '',
    '## System Instructions',
    input.parsedPrompt.system,
    '',
    '## Reusable Context',
    input.parsedPrompt.sharedContext,
    '',
    '## Token Budget',
    input.parsedPrompt.tokenBudget,
    '',
    '## Project Glossary',
    input.glossaryContent.trim(),
    '',
    '## Job Glossary',
    jobGlossary,
    '',
    '## Job Analysis',
    input.analysisContent,
    '',
    '## Merge Rule',
    input.parsedPrompt.mergeRule
  ].filter(Boolean).join('\n');
}

function buildAnalysisContent(input: {
  sourceId: string;
  sourceTitle?: string;
  platform: string;
  content: string;
  extractedTerms: string[];
  modelId: string;
  sourceChunkTargetTokens: number;
  maxRequestTokens: number;
  sharedPromptBudgetTokens: number;
  reservedOutputTokens: number;
  safetyMarginTokens: number;
}): string {
  const headings = input.content
    .split('\n')
    .filter(line => /^#{1,3}\s+/.test(line))
    .slice(0, 20);
  const wordCount = input.content.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;
  const estimatedTokens = estimateTokens(input.content);

  return [
    '# Translation Analysis',
    '',
    `Source ID: ${input.sourceId}`,
    `Title: ${input.sourceTitle || 'Untitled'}`,
    `Platform: ${input.platform}`,
    `Model: ${input.modelId}`,
    `Estimated source tokens: ${estimatedTokens}`,
    `Approximate English word count: ${wordCount}`,
    '',
    '## Token Budget',
    `- Max request tokens: ${input.maxRequestTokens}`,
    `- Shared prompt and glossary budget: ${input.sharedPromptBudgetTokens}`,
    `- Source chunk target: ${input.sourceChunkTargetTokens}`,
    `- Reserved output tokens: ${input.reservedOutputTokens}`,
    `- Safety margin: ${input.safetyMarginTokens}`,
    '',
    '## Structure',
    headings.length ? headings.map(line => `- ${line.replace(/^#+\s+/, '')}`).join('\n') : '- No Markdown headings found.',
    '',
    '## Extracted Job Terms',
    input.extractedTerms.length ? input.extractedTerms.map(term => `- ${term}`).join('\n') : '- No recurring terms extracted.',
    '',
    '## Translation Notes',
    '- Preserve timestamps, Markdown structure, URLs, code, API routes, file paths, package names, and model names.',
    '- Translate English transcript prose into natural Simplified Chinese without summarizing or adding commentary.',
    '- Keep output chunk-local; do not add continuation markers or explanations.'
  ].join('\n');
}

function renderChunkUserPrompt(template: string, chunkText: string): string {
  const fallbackTemplate = [
    'Translate the following Markdown chunk to Simplified Chinese:',
    '',
    '```text',
    '{{CHUNK_TEXT}}',
    '```',
    '',
    'Return only the translated chunk.'
  ].join('\n');

  return (template || fallbackTemplate)
    .replaceAll('{{CHUNK_TEXT}}', chunkText)
    .replaceAll('{{DOCUMENT_TEXT}}', chunkText);
}

function chunkMarkdownByTokenBudget(content: string, targetTokens: number): TranslationChunk[] {
  const blocks = splitMarkdownBlocks(content);
  const chunks: string[] = [];
  let currentBlocks: string[] = [];
  let currentTokens = 0;

  const flush = () => {
    if (!currentBlocks.length) return;
    chunks.push(currentBlocks.join('\n\n').trim());
    currentBlocks = [];
    currentTokens = 0;
  };

  for (const block of blocks) {
    const blockTokens = estimateTokens(block);
    if (blockTokens > targetTokens) {
      flush();
      chunks.push(...splitOversizedBlock(block, targetTokens));
      continue;
    }

    if (currentBlocks.length && currentTokens + blockTokens > targetTokens) {
      flush();
    }

    currentBlocks.push(block);
    currentTokens += blockTokens;
  }

  flush();

  return chunks
    .filter(Boolean)
    .map((text, index) => ({
      index,
      text,
      estimatedTokens: estimateTokens(text)
    }));
}

function splitMarkdownBlocks(content: string): string[] {
  const normalized = content.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n');
  const { frontmatter, body } = extractFrontmatter(normalized);
  const blocks: string[] = [];
  if (frontmatter) blocks.push(frontmatter);

  const lines = body.split('\n');
  let current: string[] = [];
  let inFence = false;
  let fenceMarker = '';

  const flush = () => {
    const block = current.join('\n').trim();
    if (block) blocks.push(block);
    current = [];
  };

  for (const line of lines) {
    const fenceMatch = line.match(/^(\s*)(```|~~~)/);
    if (fenceMatch) {
      const marker = fenceMatch[2];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
      }
      current.push(line);
      continue;
    }

    if (!inFence && line.trim() === '') {
      flush();
      continue;
    }

    current.push(line);
  }

  flush();
  return blocks;
}

function extractFrontmatter(content: string): { frontmatter: string; body: string } {
  const lines = content.split('\n');
  if (lines[0] !== '---') {
    return { frontmatter: '', body: content };
  }

  for (let index = 1; index < lines.length; index += 1) {
    if (lines[index] === '---' || lines[index] === '...') {
      return {
        frontmatter: lines.slice(0, index + 1).join('\n'),
        body: lines.slice(index + 1).join('\n').replace(/^\n+/, '')
      };
    }
  }

  return { frontmatter: '', body: content };
}

function splitOversizedBlock(block: string, targetTokens: number): string[] {
  if (/^(```|~~~)/m.test(block.trim())) {
    return [block];
  }

  const lines = block.split('\n').filter(line => line.trim());
  const pieces: string[] = [];
  let currentLines: string[] = [];
  let currentTokens = 0;

  const flush = () => {
    if (!currentLines.length) return;
    pieces.push(currentLines.join('\n').trim());
    currentLines = [];
    currentTokens = 0;
  };

  for (const line of lines) {
    const lineTokens = estimateTokens(line);
    if (lineTokens > targetTokens) {
      flush();
      pieces.push(...splitLongLine(line, targetTokens));
      continue;
    }

    if (currentLines.length && currentTokens + lineTokens > targetTokens) {
      flush();
    }

    currentLines.push(line);
    currentTokens += lineTokens;
  }

  flush();
  return pieces;
}

function splitLongLine(line: string, targetTokens: number): string[] {
  const sentences = line.match(/[^.!?。！？]+[.!?。！？]?/g) || [line];
  const pieces: string[] = [];
  let current = '';

  for (const sentence of sentences) {
    if (estimateTokens(sentence) > targetTokens) {
      if (current) {
        pieces.push(current.trim());
        current = '';
      }
      pieces.push(...splitByApproximateLength(sentence, targetTokens));
      continue;
    }

    if (current && estimateTokens(`${current} ${sentence}`) > targetTokens) {
      pieces.push(current.trim());
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }

  if (current.trim()) pieces.push(current.trim());
  return pieces;
}

function splitByApproximateLength(text: string, targetTokens: number): string[] {
  const maxChars = Math.max(800, targetTokens * 3);
  const pieces: string[] = [];
  for (let index = 0; index < text.length; index += maxChars) {
    pieces.push(text.slice(index, index + maxChars));
  }
  return pieces;
}

function estimateTokens(text: string): number {
  const asciiWords = text.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/g)?.length ?? 0;
  const cjkChars = text.match(/[\u3400-\u9FFF]/g)?.length ?? 0;
  return Math.max(
    Math.ceil(text.length / 3),
    Math.ceil(asciiWords * 1.4 + cjkChars * 1.2)
  );
}

function extractJobTerms(content: string, glossaryContent: string): string[] {
  const stopWords = new Set([
    'A', 'An', 'And', 'As', 'At', 'But', 'By', 'For', 'From', 'He', 'Her', 'His', 'I', 'If', 'In',
    'It', 'Its', 'Not', 'Of', 'On', 'Or', 'She', 'So', 'That', 'The', 'Their', 'They', 'This',
    'To', 'We', 'What', 'When', 'Where', 'Which', 'Who', 'Why', 'You'
  ]);
  const existingGlossary = glossaryContent.toLowerCase();
  const counts = new Map<string, number>();
  const matches = content.match(/\b(?:[A-Z][A-Za-z0-9]+(?:[- ][A-Z][A-Za-z0-9]+){0,4}|[A-Z]{2,}(?:-[A-Z0-9]+)*)\b/g) || [];

  for (const rawTerm of matches) {
    const term = rawTerm.trim();
    if (term.length < 2 || stopWords.has(term)) continue;
    counts.set(term, (counts.get(term) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([term, count]) => count >= 2 || /^[A-Z0-9-]{3,}$/.test(term))
    .filter(([term]) => !existingGlossary.includes(`| ${term.toLowerCase()} |`))
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 40)
    .map(([term]) => term);
}
