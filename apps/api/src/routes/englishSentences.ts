import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { getEnglishSentenceContextUseCase, searchEnglishSentenceIndexUseCase } from '@yanghoo/application';

const searchSchema = z.object({
  channelId: z.string().trim().min(1).optional(),
  channelIds: z.string().trim().min(1).optional(),
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  diversity: z.enum(['balanced', 'all', 'one_per_video']).optional().default('balanced'),
  sort: z.enum(['recent', 'variety']).optional().default('recent'),
  captionKind: z.enum(['all', 'manual', 'auto']).optional().default('all')
});

const contextSchema = z.object({
  channelId: z.string().trim().min(1),
  sourceId: z.string().trim().min(1),
  start: z.coerce.number(),
  window: z.coerce.number().int().min(0).max(3).optional().default(1)
});

export async function registerEnglishSentenceRoutes(app: FastifyInstance) {
  app.get('/api/english-sentences/search', async (request, reply) => {
    const parsed = searchSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.message });
    }

    const channelIdsStr = parsed.data.channelIds || parsed.data.channelId;
    if (!channelIdsStr) {
      return reply.code(400).send({ message: 'channelId or channelIds is required' });
    }

    const channelIds = channelIdsStr.split(',').map(s => s.trim()).filter(Boolean);
    if (channelIds.length === 0) {
      return { results: [], warnings: ['No channels selected'] };
    }

    let result;
    try {
      result = await searchEnglishSentenceIndexUseCase({
        channelIds,
        language: 'en',
        query: parsed.data.q,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
        diversity: parsed.data.diversity,
        sort: parsed.data.sort,
        captionKind: parsed.data.captionKind
      });
    } catch (error: any) {
      const message = error?.message || 'Search failed';
      if (message.includes('No index found')) {
        return reply.code(404).send({ message });
      }
      throw error;
    }

    return result;
  });

  app.get('/api/english-sentences/context', async (request, reply) => {
    const parsed = contextSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.message });
    }

    const result = await getEnglishSentenceContextUseCase(parsed.data);
    return result;
  });
}
