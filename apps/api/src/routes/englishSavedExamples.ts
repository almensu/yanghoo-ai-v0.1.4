import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  saveEnglishExampleUseCase,
  listSavedEnglishExamplesUseCase,
  updateSavedEnglishExampleUseCase,
  deleteSavedEnglishExampleUseCase,
  markSavedEnglishExampleReviewedUseCase,
  listSavedEnglishExampleIdsUseCase
} from '@yanghoo/application';
import type { EnglishSentenceIndexEntry } from '@yanghoo/domain';

const saveSchema = z.object({
  result: z.object({
    entry: z.object({
      sourceId: z.string(),
      videoId: z.string(),
      channelId: z.string(),
      channelTitle: z.string().optional(),
      title: z.string().optional(),
      publishedAt: z.string().optional(),
      start: z.number(),
      end: z.number(),
      text: z.string(),
      normalizedText: z.string(),
      captionKind: z.string().optional(),
      captionLanguage: z.string()
    }),
    youtubeTimestampUrl: z.string(),
    youtubeEmbedUrl: z.string(),
    startSeconds: z.number()
  }),
  query: z.string().optional()
});

const updateSchema = z.object({
  note: z.string().optional(),
  tags: z.array(z.string()).optional(),
  status: z.enum(['saved', 'learning', 'mastered']).optional()
});

const exampleIdParam = z.object({
  id: z.string().trim().min(1)
});

export async function registerEnglishSavedExampleRoutes(app: FastifyInstance) {
  // List saved examples
  app.get('/api/english-saved-examples', async (request) => {
    const query = request.query as Record<string, string | undefined>;
    const filters: Parameters<typeof listSavedEnglishExamplesUseCase>[0] = {};
    if (query.q) filters.q = query.q;
    if (query.channelId) filters.channelId = query.channelId;
    if (query.tag) filters.tag = query.tag;
    if (query.status && ['saved', 'learning', 'mastered'].includes(query.status)) {
      filters.status = query.status as 'saved' | 'learning' | 'mastered';
    }

    const items = await listSavedEnglishExamplesUseCase(filters);
    return { items };
  });

  // Get saved ids (lightweight, for English Search to check state)
  app.get('/api/english-saved-examples/ids', async () => {
    const ids = await listSavedEnglishExampleIdsUseCase();
    return { ids: Array.from(ids) };
  });

  // Save a new example
  app.post('/api/english-saved-examples', async (request) => {
    const parsed = saveSchema.safeParse(request.body);
    if (!parsed.success) {
      return { item: null, created: false, error: parsed.error.message };
    }

    const result = await saveEnglishExampleUseCase({
      entry: {
        indexVersion: 1,
        ...parsed.data.result.entry
      } as EnglishSentenceIndexEntry,
      youtubeTimestampUrl: parsed.data.result.youtubeTimestampUrl,
      youtubeEmbedUrl: parsed.data.result.youtubeEmbedUrl,
      startSeconds: parsed.data.result.startSeconds,
      query: parsed.data.query
    });
    return { item: result.item, created: result.created };
  });

  // Update note/tags/status
  app.patch('/api/english-saved-examples/:id', async (request, reply) => {
    const paramParsed = exampleIdParam.safeParse(request.params);
    if (!paramParsed.success) {
      return reply.code(400).send({ message: paramParsed.error.message });
    }

    const bodyParsed = updateSchema.safeParse(request.body);
    if (!bodyParsed.success) {
      return reply.code(400).send({ message: bodyParsed.error.message });
    }

    try {
      const item = await updateSavedEnglishExampleUseCase(paramParsed.data.id, bodyParsed.data);
      return { item };
    } catch (error: any) {
      const message = error?.message || 'Update failed';
      if (message.includes('not found')) return reply.code(404).send({ message });
      throw error;
    }
  });

  // Delete a saved example
  app.delete('/api/english-saved-examples/:id', async (request, reply) => {
    const paramParsed = exampleIdParam.safeParse(request.params);
    if (!paramParsed.success) {
      return reply.code(400).send({ message: paramParsed.error.message });
    }

    try {
      await deleteSavedEnglishExampleUseCase(paramParsed.data.id);
      return { deleted: true };
    } catch (error: any) {
      const message = error?.message || 'Delete failed';
      if (message.includes('not found')) return reply.code(404).send({ message });
      throw error;
    }
  });

  // Mark reviewed
  app.post('/api/english-saved-examples/:id/review', async (request, reply) => {
    const paramParsed = exampleIdParam.safeParse(request.params);
    if (!paramParsed.success) {
      return reply.code(400).send({ message: paramParsed.error.message });
    }

    try {
      const item = await markSavedEnglishExampleReviewedUseCase(paramParsed.data.id);
      return { item };
    } catch (error: any) {
      const message = error?.message || 'Review failed';
      if (message.includes('not found')) return reply.code(404).send({ message });
      throw error;
    }
  });
}
