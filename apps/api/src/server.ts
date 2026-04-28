import cors from '@fastify/cors';
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
