import * as path from 'path';
import { fileURLToPath } from 'url';

export interface CliContext {
  json: boolean;
  cwd: string;
  dataDir?: string;
}

export interface ParsedGlobalArgs {
  context: CliContext;
  args: string[];
}

export interface ParsedCommandArgs {
  positional: string[];
  flags: Map<string, string | true>;
}

export function extractGlobalArgs(argv: string[]): ParsedGlobalArgs {
  const args: string[] = [];
  let json = false;
  let dataDir: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--json') {
      json = true;
      continue;
    }

    if (value === '--data-dir') {
      const next = argv[index + 1];
      if (!next) throw new Error('--data-dir requires a path');
      dataDir = path.resolve(next);
      process.env.DATA_DIR = dataDir;
      index += 1;
      continue;
    }

    args.push(value);
  }

  if (!dataDir && !process.env.DATA_DIR) {
    dataDir = resolveDefaultDataDir();
    process.env.DATA_DIR = dataDir;
  }

  return {
    context: {
      json,
      cwd: process.cwd(),
      dataDir: dataDir || process.env.DATA_DIR
    },
    args
  };
}

function resolveDefaultDataDir(): string {
  const currentFilePath = fileURLToPath(import.meta.url);
  return path.resolve(path.dirname(currentFilePath), '../../..', 'data');
}

export function parseCommandArgs(args: string[]): ParsedCommandArgs {
  const positional: string[] = [];
  const flags = new Map<string, string | true>();

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (!value.startsWith('--')) {
      positional.push(value);
      continue;
    }

    const [rawName, inlineValue] = value.slice(2).split('=', 2);
    if (!rawName) continue;

    if (inlineValue !== undefined) {
      flags.set(rawName, inlineValue);
      continue;
    }

    const next = args[index + 1];
    if (next && !next.startsWith('--')) {
      flags.set(rawName, next);
      index += 1;
    } else {
      flags.set(rawName, true);
    }
  }

  return { positional, flags };
}

export function readStringFlag(flags: Map<string, string | true>, name: string): string | undefined {
  const value = flags.get(name);
  return typeof value === 'string' ? value : undefined;
}

export function readBooleanFlag(flags: Map<string, string | true>, name: string): boolean {
  return flags.has(name);
}

export function readNumberFlag(flags: Map<string, string | true>, name: string): number | undefined {
  const value = readStringFlag(flags, name);
  if (value === undefined) return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) throw new Error(`--${name} requires a number`);
  return parsed;
}
