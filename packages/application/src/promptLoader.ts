import * as fs from 'fs';
import * as path from 'path';
import { resolveProjectRoot } from './resolveProjectRoot.js';

/**
 * Loads a prompt template from the docs/prompts directory.
 */
export function loadPromptTemplate(relativePromptPath: string): string {
  const root = resolveProjectRoot();
  const fullPath = path.resolve(root, relativePromptPath);

  if (!fs.existsSync(fullPath)) {
    throw new Error(`Prompt template not found at: ${fullPath}`);
  }

  return fs.readFileSync(fullPath, 'utf-8');
}

export interface ParsedPromptDocument {
  system: string;
  sharedContext: string;
  tokenBudget: string;
  userTemplate: string;
  mergeRule: string;
}

/**
 * Extracts stable top-level sections from a markdown prompt document.
 */
export function parsePromptDocument(content: string): ParsedPromptDocument {
  return {
    system: extractSection(content, 'System Prompt'),
    sharedContext: extractSection(content, 'Shared Context Prompt'),
    tokenBudget: extractSection(content, 'Token Budget Guidance for Qwen3-4B-MLX-4bit'),
    userTemplate:
      extractSection(content, 'Single-Chunk User Prompt Template') ||
      extractSection(content, 'User Prompt Template'),
    mergeRule: extractSection(content, 'Chunk Merge Rule')
  };
}

function extractSection(content: string, heading: string): string {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const sectionMatch = content.match(new RegExp(`(?:^|\\n)## ${escapedHeading}\\n([\\s\\S]*?)(?=\\n##\\s+|$)`));
  return sectionMatch ? sectionMatch[1].trim() : '';
}
