import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import {
  captureChannelUseCase,
  listLearningChannelsUseCase,
  getLearningChannelVideosUseCase,
  updateChannelVideoSelectionUseCase,
  syncSelectedEnglishCaptionsUseCase,
  buildEnglishSentenceIndexUseCase,
  refreshChannelVideosUseCase
} from '@yanghoo/application';

const registerSchema = z.object({
  url: z.string().trim().min(1),
  limit: z.coerce.number().int().min(1).max(500).optional().default(50)
});

const selectionSchema = z.object({
  videoIds: z.array(z.string().trim().min(1)).min(1),
  selected: z.boolean()
});

const syncSchema = z.object({
  batchSize: z.coerce.number().int().min(1).max(100).optional().default(10),
  force: z.boolean().optional().default(false)
});

const refreshSchema = z.object({
  mode: z.enum(['latest', 'full']).optional().default('latest'),
  limit: z.coerce.number().int().min(1).max(500).optional().default(50)
});

const channelIdParam = z.object({
  channelId: z.string().trim().min(1)
});

export async function registerLearningChannelRoutes(app: FastifyInstance) {
  // Register / add a channel from URL
  app.post('/api/learning-channels', async (request, reply) => {
    const parsed = registerSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ message: parsed.error.message });
    }

    const result = await captureChannelUseCase(parsed.data.url, { limit: parsed.data.limit });
    return {
      channelId: result.manifest.id,
      title: result.manifest.title,
      videoCount: result.videosCount
    };
  });

  // List local channels
  app.get('/api/learning-channels', async () => {
    const channels = await listLearningChannelsUseCase();
    return { channels };
  });

  // Get channel video inventory
  app.get('/api/learning-channels/:channelId/videos', async (request, reply) => {
    const paramParsed = channelIdParam.safeParse(request.params);
    if (!paramParsed.success) {
      return reply.code(400).send({ message: paramParsed.error.message });
    }

    try {
      const result = await getLearningChannelVideosUseCase(paramParsed.data.channelId);
      return result;
    } catch (error: any) {
      const message = error?.message || 'Failed to get channel videos';
      if (message.includes('not found')) {
        return reply.code(404).send({ message });
      }
      throw error;
    }
  });

  // Update video selection
  app.put('/api/learning-channels/:channelId/selection', async (request, reply) => {
    const paramParsed = channelIdParam.safeParse(request.params);
    if (!paramParsed.success) {
      return reply.code(400).send({ message: paramParsed.error.message });
    }

    const bodyParsed = selectionSchema.safeParse(request.body);
    if (!bodyParsed.success) {
      return reply.code(400).send({ message: bodyParsed.error.message });
    }

    try {
      const result = await updateChannelVideoSelectionUseCase({
        channelId: paramParsed.data.channelId,
        videoIds: bodyParsed.data.videoIds,
        selected: bodyParsed.data.selected
      });
      return result;
    } catch (error: any) {
      const message = error?.message || 'Failed to update selection';
      if (message.includes('not found')) {
        return reply.code(404).send({ message });
      }
      throw error;
    }
  });

  // Sync English captions for selected videos
  app.post('/api/learning-channels/:channelId/sync-selected', async (request, reply) => {
    const paramParsed = channelIdParam.safeParse(request.params);
    if (!paramParsed.success) {
      return reply.code(400).send({ message: paramParsed.error.message });
    }

    const bodyParsed = syncSchema.safeParse(request.body ?? {});
    if (!bodyParsed.success) {
      return reply.code(400).send({ message: bodyParsed.error.message });
    }

    try {
      const result = await syncSelectedEnglishCaptionsUseCase({
        channelId: paramParsed.data.channelId,
        batchSize: bodyParsed.data.batchSize,
        force: bodyParsed.data.force
      });
      return result;
    } catch (error: any) {
      const message = error?.message || 'Sync failed';
      if (message.includes('not found')) {
        return reply.code(404).send({ message });
      }
      throw error;
    }
  });

  // Build channel sentence index
  app.post('/api/learning-channels/:channelId/build-index', async (request, reply) => {
    const paramParsed = channelIdParam.safeParse(request.params);
    if (!paramParsed.success) {
      return reply.code(400).send({ message: paramParsed.error.message });
    }

    try {
      const result = await buildEnglishSentenceIndexUseCase(paramParsed.data.channelId, 'en');
      return {
        channelId: result.channelId,
        language: result.language,
        sourceCount: result.sourceCount,
        sentenceCount: result.sentenceCount,
        skippedCount: result.skippedCount,
        failedCount: result.failedCount,
        warnings: result.warnings
      };
    } catch (error: any) {
      const message = error?.message || 'Build index failed';
      if (message.includes('not found')) {
        return reply.code(404).send({ message });
      }
      throw error;
    }
  });

  // Refresh channel videos (incremental discovery)
  app.post('/api/learning-channels/:channelId/refresh', async (request, reply) => {
    const paramParsed = channelIdParam.safeParse(request.params);
    if (!paramParsed.success) {
      return reply.code(400).send({ message: paramParsed.error.message });
    }

    const bodyParsed = refreshSchema.safeParse(request.body ?? {});
    if (!bodyParsed.success) {
      return reply.code(400).send({ message: bodyParsed.error.message });
    }

    try {
      const report = await refreshChannelVideosUseCase({
        channelId: paramParsed.data.channelId,
        mode: bodyParsed.data.mode,
        limit: bodyParsed.data.limit
      });
      return {
        channelId: report.channelId,
        mode: report.mode,
        fetchedAt: report.fetchedAt,
        localVideoCount: report.localVideoCount,
        remoteVideoCount: report.remoteVideoCount,
        addedCount: report.addedCount,
        updatedCount: report.updatedCount,
        preservedCount: report.preservedCount,
        remoteMissingCount: report.remoteMissingCount,
        addedVideos: report.addedVideos,
        remoteMissingVideoIds: report.remoteMissingVideoIds
      };
    } catch (error: any) {
      const message = error?.message || 'Refresh failed';
      if (message.includes('not found')) {
        return reply.code(404).send({ message });
      }
      throw error;
    }
  });
}
