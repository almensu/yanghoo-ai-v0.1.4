import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { searchEnglishSentenceIndexUseCase } from '@yanghoo/application';

const searchSchema = z.object({
  channelId: z.string().trim().min(1),
  q: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20)
});

export async function registerEnglishSentenceRoutes(app: FastifyInstance) {
  app.get('/api/english-sentences/search', async (request, reply) => {
    const parsed = searchSchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.message });
    }

    let results;
    try {
      results = await searchEnglishSentenceIndexUseCase({
        channelId: parsed.data.channelId,
        language: 'en',
        query: parsed.data.q,
        limit: parsed.data.limit
      });
    } catch (error: any) {
      const message = error?.message || 'Search failed';
      if (message.includes('No index found')) {
        return reply.code(404).send({ message });
      }
      throw error;
    }

    return { results };
  });
}
