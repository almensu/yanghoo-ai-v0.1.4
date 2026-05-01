import type { FastifyInstance } from 'fastify';
import * as fs from 'fs';
import { z } from 'zod';
import { 
  captureSourceUseCase, 
  ensureTranscriptUseCase,
  fetchAudioUseCase,
  transcribeAudioUseCase,
  resolveSourceMediaUseCase,
  downloadSourceMediaUseCase,
  transcribeSourceMediaUseCase,
  translateSourceDocumentUseCase,
  deleteSourceAssetsUseCase,
  deleteSourceUseCase
} from '@yanghoo/application';
import { sourceStorage, documentStorage } from '@yanghoo/storage';
import { getTranslationManifestPath } from '@yanghoo/domain';
import type { TaskRecord, TranscriptSource } from '../types.js';

const createTaskSchema = z.object({
  sourceUrl: z.string(), // Allow text snippets
  title: z.string().optional()
});

/**
 * Maps a Domain Source to an API TaskRecord.
 */
async function mapSourceToTask(source: any): Promise<TaskRecord> {
  const readiness = await documentStorage.getDocumentReadiness(source.id);
  const task: TaskRecord = {
    ...source,
    sourceUrl: source.url,
    sourceType: source.platform,
    createdAt: source.capturedAt,
    updatedAt: source.capturedAt,
    documentAssets: readiness
  };
  return task;
}

export async function registerTaskRoutes(app: FastifyInstance) {
  app.get('/api/tasks', async () => {
    const sources = await sourceStorage.listSources();
    const tasks: TaskRecord[] = [];
    for (const s of sources) {
      tasks.push(await mapSourceToTask(s));
    }
    return tasks;
  });

  app.get('/api/tasks/:taskId', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    const source = await sourceStorage.getSource(taskId);
    if (!source) return reply.code(404).send({ error: 'Source not found' });
    
    const task = await mapSourceToTask(source);
    
    // Content is already fetched inside getDocument if needed by logic
    const docAsset = await documentStorage.getDocument(taskId);
    if (docAsset) {
      task.content = docAsset.content;
    }

    // Check for translation
    const translationManifestPath = getTranslationManifestPath(taskId);
    if (fs.existsSync((sourceStorage as any).resolvePath(translationManifestPath))) {
      const manifest = JSON.parse(fs.readFileSync((sourceStorage as any).resolvePath(translationManifestPath), 'utf-8'));
      if (manifest.translatedPath && fs.existsSync((sourceStorage as any).resolvePath(manifest.translatedPath))) {
        task.translatedContent = fs.readFileSync((sourceStorage as any).resolvePath(manifest.translatedPath), 'utf-8');
      }
    }

    return task;
  });

  app.get('/api/tasks/:taskId/translation', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    const source = await sourceStorage.getSource(taskId);
    if (!source) return reply.code(404).send({ error: 'Source not found' });

    const translationManifestPath = getTranslationManifestPath(taskId);
    const translationManifestAbsPath = (sourceStorage as any).resolvePath(translationManifestPath);
    if (!fs.existsSync(translationManifestAbsPath)) {
      return reply.code(404).send({ error: 'Translation not found' });
    }

    const manifest = JSON.parse(fs.readFileSync(translationManifestAbsPath, 'utf-8'));
    if (manifest.status !== 'translated' || !manifest.translatedPath) {
      return reply.code(409).send({ error: 'Translation is not ready', manifest });
    }

    const translatedAbsPath = (sourceStorage as any).resolvePath(manifest.translatedPath);
    if (!fs.existsSync(translatedAbsPath)) {
      return reply.code(404).send({ error: 'Translated document file not found', manifest });
    }

    return {
      manifest,
      content: fs.readFileSync(translatedAbsPath, 'utf-8')
    };
  });

  app.get('/api/tasks/:taskId/thumbnail', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    
    // Try common extensions
    const extensions = ['jpg', 'png', 'webp', 'jpeg'];
    for (const ext of extensions) {
      const relPath = `sources/${taskId}/thumbnail.${ext}`;
      const absPath = (sourceStorage as any).resolvePath(relPath);
      if (fs.existsSync(absPath)) {
        return reply.sendFile(relPath);
      }
    }

    return reply.code(404).send({ error: 'Thumbnail not found' });
  });

  app.post('/api/tasks', async (request, reply) => {
    try {
      const input = createTaskSchema.parse(request.body);
      const source = await captureSourceUseCase(input.sourceUrl);
      const task = await mapSourceToTask(source);
      return reply.code(201).send(task);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Validation failed', details: error.errors });
      }
      
      const message = error.message || '';
      if (
        message.includes('No supported source URL found in input.') ||
        message.includes('Unsupported platform for URL')
      ) {
        return reply.code(400).send({ message });
      }
      
      console.error(`[API] createTask failed: ${error.stack || error.message}`);
      return reply.code(500).send({ message: error.message });
    }
  });

  app.post('/api/tasks/:taskId/ensure-transcript', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    try {
      await ensureTranscriptUseCase(taskId);
      const readiness = await documentStorage.getDocumentReadiness(taskId);
      return { assets: readiness };
    } catch (error: any) {
      return reply.code(500).send({ message: error.message });
    }
  });

  app.post('/api/tasks/:taskId/fetch-audio', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    try {
      await fetchAudioUseCase(taskId);
      const readiness = await documentStorage.getDocumentReadiness(taskId);
      return { assets: readiness };
    } catch (error: any) {
      return reply.code(500).send({ message: error.message });
    }
  });

  app.post('/api/tasks/:taskId/transcribe-audio', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    try {
      await transcribeAudioUseCase(taskId);
      const readiness = await documentStorage.getDocumentReadiness(taskId);
      return { assets: readiness };
    } catch (error: any) {
      return reply.code(500).send({ message: error.message });
    }
  });

  app.post('/api/tasks/:taskId/translate', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    try {
      const translatedPath = await translateSourceDocumentUseCase(taskId);
      const readiness = await documentStorage.getDocumentReadiness(taskId);
      return { assets: readiness, translatedPath };
    } catch (error: any) {
      console.error(`[API] translate failed for ${taskId}: ${error.stack || error.message}`);
      return reply.code(500).send({ message: error.message });
    }
  });

  app.post('/api/tasks/:taskId/resolve-media', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    try {
      await resolveSourceMediaUseCase(taskId);
      const readiness = await documentStorage.getDocumentReadiness(taskId);
      return { assets: readiness };
    } catch (error: any) {
      return reply.code(500).send({ message: error.message });
    }
  });

  app.post('/api/tasks/:taskId/download-media', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    try {
      await downloadSourceMediaUseCase(taskId);
      const readiness = await documentStorage.getDocumentReadiness(taskId);
      return { assets: readiness };
    } catch (error: any) {
      return reply.code(500).send({ message: error.message });
    }
  });

  app.post('/api/tasks/:taskId/transcribe-media', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    try {
      await transcribeSourceMediaUseCase(taskId);
      const readiness = await documentStorage.getDocumentReadiness(taskId);
      return { assets: readiness };
    } catch (error: any) {
      return reply.code(500).send({ message: error.message });
    }
  });

  app.delete('/api/tasks/:taskId', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    try {
      const result = await deleteSourceUseCase(taskId);
      return result;
    } catch (error: any) {
      if (error.message.includes('Source not found')) {
        return reply.code(404).send({ message: error.message });
      }
      return reply.code(500).send({ message: error.message });
    }
  });

  app.delete('/api/tasks/:taskId/assets', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };
    const schema = z.object({
      scope: z.enum(['media', 'audio', 'transcript', 'generated']),
      dryRun: z.boolean().optional()
    });

    try {
      const body = request.body as any;
      const { scope, dryRun } = schema.parse(body);
      const result = await deleteSourceAssetsUseCase(taskId, scope, { dryRun });
      return result;
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Invalid scope', details: error.errors });
      }
      if (error.message.includes('Source not found')) {
        return reply.code(404).send({ message: error.message });
      }
      return reply.code(500).send({ message: error.message });
    }
  });
}
