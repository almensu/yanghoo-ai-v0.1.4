import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import path from 'path';
import fastify from 'fastify';
import { config } from './config.js';
import { registerTaskRoutes } from './routes/tasks.js';
import { registerChatRoutes } from './routes/chat.js';
import { registerSearchRoutes } from './routes/search.js';
import { registerEnglishSentenceRoutes } from './routes/englishSentences.js';
import { registerLearningChannelRoutes } from './routes/learningChannels.js';
import { registerSourceCollectionRoutes } from './routes/sourceCollections.js';
import { registerJobRoutes } from './routes/jobs.js';
import { registerEnglishSavedExampleRoutes } from './routes/englishSavedExamples.js';
import { registerLearningChannelTaxonomyRoutes } from './routes/learningChannelTaxonomy.js';
import { registerEnglishScenePackRoutes } from './routes/englishScenePacks.js';

const app = fastify({
  logger: true
});

await app.register(cors, {
  origin: true
});

const dataRoot = process.env.DATA_DIR 
  ? path.resolve(process.env.DATA_DIR)
  : path.resolve(process.cwd(), '../../data');

await app.register(staticFiles, {
  root: dataRoot,
  serve: false
});

await app.register(registerTaskRoutes);
await app.register(registerSourceCollectionRoutes);
await app.register(registerJobRoutes);
await app.register(registerChatRoutes);
await app.register(registerSearchRoutes);
await app.register(registerEnglishSentenceRoutes);
await app.register(registerLearningChannelRoutes);
await app.register(registerEnglishSavedExampleRoutes);
await app.register(registerLearningChannelTaxonomyRoutes);
await app.register(registerEnglishScenePackRoutes);

app.get('/api/health', async () => ({
  ok: true,
  service: 'yanghoo-transcript-backend'
}));

await app.listen({
  host: config.host,
  port: config.port
});
