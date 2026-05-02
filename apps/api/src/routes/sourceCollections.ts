import type { FastifyInstance } from 'fastify';
import { listSourceChannelCollectionsUseCase } from '@yanghoo/application';

export async function registerSourceCollectionRoutes(app: FastifyInstance) {
  app.get('/api/source-collections', async () => {
    const collections = await listSourceChannelCollectionsUseCase();
    return { collections };
  });
}
