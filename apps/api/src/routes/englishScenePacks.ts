import { FastifyInstance } from 'fastify';
import { 
  listEnglishScenePacksUseCase, 
  getEnglishScenePackUseCase, 
  deleteEnglishScenePackUseCase 
} from '@yanghoo/application';

export async function registerEnglishScenePackRoutes(app: FastifyInstance) {
  app.get('/api/english-scene-packs', async () => {
    const packs = await listEnglishScenePacksUseCase();
    return { packs };
  });

  app.get('/api/english-scene-packs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const pack = await getEnglishScenePackUseCase(id);
    if (!pack) {
      reply.status(404).send({ error: 'Scene pack not found' });
      return;
    }
    return pack;
  });

  app.delete('/api/english-scene-packs/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const deleted = await deleteEnglishScenePackUseCase(id);
    if (!deleted) {
      reply.status(404).send({ error: 'Scene pack not found' });
      return;
    }
    return { success: true };
  });
}
