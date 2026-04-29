import cors from '@fastify/cors';
import staticFiles from '@fastify/static';
import path from 'path';
import fastify from 'fastify';
import { config } from './config.js';
import { registerTaskRoutes } from './routes/tasks.js';
import { registerChatRoutes } from './routes/chat.js';

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
await app.register(registerChatRoutes);

app.get('/api/health', async () => ({
  ok: true,
  service: 'yanghoo-transcript-backend'
}));

await app.listen({
  host: config.host,
  port: config.port
});
