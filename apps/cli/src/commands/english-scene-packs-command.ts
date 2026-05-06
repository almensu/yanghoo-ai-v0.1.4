import * as fs from 'fs';
import { 
  importEnglishScenePackUseCase,
  listEnglishScenePacksUseCase,
  getEnglishScenePackUseCase,
  deleteEnglishScenePackUseCase
} from '@yanghoo/application';
import { parseCommandArgs, readStringFlag } from '../cli-runtime-config.js';
import type { CliContext } from '../cli-runtime-config.js';
import { printResult } from '../cli-output-renderer.js';

export async function runEnglishScenePacksCommand(args: string[], context: CliContext): Promise<void> {
  const [subcommand, ...rest] = args;

  if (subcommand === 'import') {
    await handleImport(rest, context);
  } else if (subcommand === 'list') {
    await handleList(rest, context);
  } else if (subcommand === 'show') {
    await handleShow(rest, context);
  } else if (subcommand === 'delete') {
    await handleDelete(rest, context);
  } else {
    throw new Error('english-scene-packs requires a subcommand: import, list, show, or delete');
  }
}

async function handleImport(args: string[], context: CliContext): Promise<void> {
  const parsed = parseCommandArgs(args);
  const sceneBriefPath = readStringFlag(parsed.flags, 'scene-brief');
  const evidencePackPath = readStringFlag(parsed.flags, 'evidence-pack');
  const studyPackPath = readStringFlag(parsed.flags, 'study-pack');
  const request = readStringFlag(parsed.flags, 'request');

  if (!sceneBriefPath || !evidencePackPath) {
    throw new Error('import requires --scene-brief <path> and --evidence-pack <path>');
  }

  const sceneBrief = JSON.parse(fs.readFileSync(sceneBriefPath, 'utf-8'));
  const evidencePack = JSON.parse(fs.readFileSync(evidencePackPath, 'utf-8'));

  const pack = await importEnglishScenePackUseCase({
    sceneBrief,
    evidencePack,
    studyPackPath,
    request
  });

  printResult(context, { pack }, [
    `✅ Scene pack imported: ${pack.id}`,
    `   Scene: ${pack.scene}`,
    `   Queries: ${pack.queries.length}`,
    `   Examples: ${pack.examples.length}`,
    `   Path: data/learning/english-scene-packs/${pack.id}.json`
  ]);
}

async function handleList(args: string[], context: CliContext): Promise<void> {
  const packs = await listEnglishScenePacksUseCase();
  const lines = packs.length === 0 
    ? ['No scene packs found.']
    : packs.map(p => `- ${p.id}: ${p.title} (${p.queryCount} queries, ${p.exampleCount} examples)`);
  
  printResult(context, { packs }, [
    `Found ${packs.length} scene pack(s):`,
    ...lines
  ]);
}

async function handleShow(args: string[], context: CliContext): Promise<void> {
  const parsed = parseCommandArgs(args);
  const id = parsed.positional[0];
  if (!id) throw new Error('show requires a pack ID');

  const pack = await getEnglishScenePackUseCase(id);
  if (!pack) {
    throw new Error(`Scene pack not found: ${id}`);
  }

  const lines = [
    `Scene Pack: ${pack.id}`,
    `Title: ${pack.title}`,
    `Scene: ${pack.scene}`,
    `Request: ${pack.request || 'N/A'}`,
    `Level: ${pack.level}`,
    `Queries: ${pack.queries.join(', ')}`,
    `Examples: ${pack.examples.length}`,
    '',
    'Examples:',
    ...pack.examples.slice(0, 20).map(ex => `  - [${ex.query}] ${ex.text.substring(0, 60)}... (${ex.youtubeTimestampUrl})`)
  ];
  if (pack.examples.length > 20) {
    lines.push(`  ... and ${pack.examples.length - 20} more`);
  }

  printResult(context, { pack }, lines);
}

async function handleDelete(args: string[], context: CliContext): Promise<void> {
  const parsed = parseCommandArgs(args);
  const id = parsed.positional[0];
  if (!id) throw new Error('delete requires a pack ID');

  const deleted = await deleteEnglishScenePackUseCase(id);
  if (deleted) {
    printResult(context, { deleted: true, id }, [`✅ Scene pack deleted: ${id}`]);
  } else {
    throw new Error(`Scene pack not found or could not be deleted: ${id}`);
  }
}
