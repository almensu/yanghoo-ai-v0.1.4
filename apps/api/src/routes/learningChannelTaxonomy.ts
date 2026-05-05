import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  listChannelTaxonomyUseCase,
  updateChannelTaxonomyUseCase,
  deleteChannelTaxonomyUseCase
} from '@yanghoo/application';

const channelIdParam = z.object({
  channelId: z.string().trim().min(1)
});

const updateBody = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  note: z.string().optional()
});

export async function registerLearningChannelTaxonomyRoutes(app: FastifyInstance) {
  // List all taxonomy items
  app.get('/api/learning-channel-taxonomy', async () => {
    const items = await listChannelTaxonomyUseCase();
    return { items };
  });

  // Update taxonomy for a channel
  app.put('/api/learning-channel-taxonomy/:channelId', async (request, reply) => {
    const paramParsed = channelIdParam.safeParse(request.params);
    if (!paramParsed.success) {
      return reply.code(400).send({ message: paramParsed.error.message });
    }

    const bodyParsed = updateBody.safeParse(request.body);
    if (!bodyParsed.success) {
      return reply.code(400).send({ message: bodyParsed.error.message });
    }

    const item = await updateChannelTaxonomyUseCase(paramParsed.data.channelId, bodyParsed.data);
    return { item };
  });

  // Delete taxonomy for a channel
  app.delete('/api/learning-channel-taxonomy/:channelId', async (request, reply) => {
    const paramParsed = channelIdParam.safeParse(request.params);
    if (!paramParsed.success) {
      return reply.code(400).send({ message: paramParsed.error.message });
    }

    const deleted = await deleteChannelTaxonomyUseCase(paramParsed.data.channelId);
    if (!deleted) return reply.code(404).send({ message: 'Taxonomy not found' });
    return { deleted: true };
  });
}
