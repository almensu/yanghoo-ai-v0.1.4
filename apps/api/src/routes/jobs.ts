import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  getBackgroundJob,
  listBackgroundJobs,
  startTaskActionJob
} from '../backgroundJobs.js';

const taskActionJobSchema = z.object({
  taskId: z.string().min(1),
  action: z.enum([
    'ensure-transcript',
    'fetch-audio',
    'transcribe-audio',
    'download-media',
    'transcribe-media',
    'translate'
  ]),
  options: z.object({
    modelId: z.string().optional(),
    force: z.boolean().optional()
  }).optional()
});

export async function registerJobRoutes(app: FastifyInstance) {
  app.get('/api/jobs', async () => ({
    jobs: listBackgroundJobs()
  }));

  app.get('/api/jobs/:jobId', async (request, reply) => {
    const { jobId } = request.params as { jobId: string };
    const job = getBackgroundJob(jobId);
    if (!job) return reply.code(404).send({ message: 'Job not found' });
    return { job };
  });

  app.post('/api/jobs/task-action', async (request, reply) => {
    try {
      const input = taskActionJobSchema.parse(request.body);
      const job = startTaskActionJob(input.taskId, input.action, input.options || {});
      return reply.code(202).send({ job });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ message: 'Invalid background job request', details: error.errors });
      }
      return reply.code(500).send({ message: error.message });
    }
  });
}
