import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { searchDocumentsUseCase } from '@yanghoo/application';

const searchQuerySchema = z.object({
  q: z.string().optional().default(''),
  limit: z.coerce.number().int().min(1).max(100).optional().default(30)
});

export async function registerSearchRoutes(app: FastifyInstance) {
  app.get('/api/search', async (request, reply) => {
    const parsed = searchQuerySchema.safeParse(request.query);
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.message });
    }

    const results = await searchDocumentsUseCase({
      query: parsed.data.q,
      limit: parsed.data.limit
    });

    return { results };
  });
}
