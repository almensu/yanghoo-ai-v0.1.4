import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { 
  captureSourceUseCase, 
  ensureTranscriptUseCase,
  fetchAudioUseCase,
  transcribeAudioUseCase,
  resolveSourceMediaUseCase,
  downloadSourceMediaUseCase,
  transcribeSourceMediaUseCase
} from '@yanghoo/application';
import { sourceStorage, documentStorage } from '@yanghoo/storage';
import type { TaskRecord, TranscriptSource } from '../types.js';

const createTaskSchema = z.object({
  sourceUrl: z.string().url(),
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

    return task;
  });

  app.post('/api/tasks', async (request, reply) => {
    const input = createTaskSchema.parse(request.body);
    const source = await captureSourceUseCase(input.sourceUrl);
    const task = await mapSourceToTask(source);
    return reply.code(201).send(task);
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
}
