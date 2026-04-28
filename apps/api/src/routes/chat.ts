import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { chatWithSourceUseCase, listModelsUseCase } from '@yanghoo/application';

const chatSchema = z.object({
  taskId: z.string(),
  message: z.string(),
  history: z.array(z.any()).optional()
});

export async function registerChatRoutes(app: FastifyInstance) {
  app.get('/api/models', async () => {
    return listModelsUseCase();
  });

  app.post('/api/chat', async (request, reply) => {
    const input = chatSchema.parse(request.body);
    try {
      const response = await chatWithSourceUseCase({
        sourceId: input.taskId,
        message: input.message,
        history: input.history
      });
      return { response };
    } catch (error: any) {
      return reply.code(500).send({ error: error.message });
    }
  });
}
