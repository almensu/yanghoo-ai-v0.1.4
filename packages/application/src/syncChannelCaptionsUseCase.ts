import { channelStorage, sourceStorage, documentStorage } from '@yanghoo/storage';
import { captureSourceUseCase } from './index.js';
import { ensureTranscriptUseCase } from './ensureTranscriptUseCase.js';
import type {
  SyncCheckpoint,
  CaptionSyncReport,
  CaptionSyncReportItem,
  FailureKind,
  CaptionSyncReportStatus
} from '@yanghoo/domain';

const SUPPORTED_LANGUAGES = new Set(['en', 'zh-Hans']);

export interface SyncChannelCaptionsOptions {
  language: string;
  batchSize: number;
  resume?: boolean;
  retryFailed?: boolean;
  force?: boolean;
}

export interface SyncChannelCaptionsResult {
  channelId: string;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  items: CaptionSyncReportItem[];
}

function classifyFailure(message: string): FailureKind {
  const lower = message.toLowerCase();
  if (lower.includes('429') || lower.includes('too many requests') || lower.includes('rate')) return 'rate_limit';
  if (lower.includes('no caption') || lower.includes('没有可用')) return 'missing_caption';
  if (lower.includes('network') || lower.includes('timeout') || lower.includes('econnrefused') || lower.includes('fetch failed') || lower.includes('ssl')) return 'network';
  return 'unknown';
}

async function hasEnglishCaptionAssets(sourceId: string): Promise<boolean> {
  try {
    const readiness = await documentStorage.getDocumentReadiness(sourceId);
    return readiness.hasMarkdown && readiness.source === 'platform_caption';
  } catch {
    return false;
  }
}

export function validateLanguage(language: string): void {
  if (!SUPPORTED_LANGUAGES.has(language)) {
    throw new Error(`Unsupported language: "${language}". Supported: ${Array.from(SUPPORTED_LANGUAGES).join(', ')}`);
  }
}

async function persistProgress(
  checkpoint: SyncCheckpoint,
  report: CaptionSyncReport,
  reportIndex: Map<string, CaptionSyncReportItem>,
  allVideosLength: number
): Promise<void> {
  report.items = Array.from(reportIndex.values());
  report.updatedAt = new Date().toISOString();
  report.status = checkpoint.status === 'completed' ? 'completed' : 'partial';
  checkpoint.updatedAt = new Date().toISOString();

  await channelStorage.saveSyncCheckpoint(checkpoint);
  await channelStorage.saveCaptionSyncReport(report);
}

export async function syncChannelCaptionsUseCase(
  channelId: string,
  options: SyncChannelCaptionsOptions
): Promise<SyncChannelCaptionsResult> {
  validateLanguage(options.language);

  const manifest = await channelStorage.getChannelManifest(channelId);
  if (!manifest) {
    throw new Error(`Channel not found: ${channelId}`);
  }

  const allVideos = await channelStorage.getChannelVideos(channelId) || [];
  if (allVideos.length === 0) {
    return { channelId, processed: 0, succeeded: 0, failed: 0, skipped: 0, items: [] };
  }

  // Load or initialize checkpoint
  let checkpoint: SyncCheckpoint = await channelStorage.getSyncCheckpoint(channelId) || {
    channelId,
    language: options.language,
    mode: 'greedy_english_captions',
    status: 'in_progress',
    nextIndex: 0,
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  // Load or initialize report
  let report: CaptionSyncReport = await channelStorage.getCaptionSyncReport(channelId) || {
    channelId,
    language: options.language,
    status: 'partial',
    items: [],
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const reportIndex = new Map<string, CaptionSyncReportItem>();
  for (const item of report.items) {
    reportIndex.set(item.videoId, item);
  }

  // Determine which videos to process
  let targetVideos: { video: typeof allVideos[0]; index: number }[];

  if (options.retryFailed) {
    const failedItems = report.items.filter(i => i.status === 'failed');
    targetVideos = failedItems.slice(0, options.batchSize).map(item => {
      const idx = allVideos.findIndex(v => v.videoId === item.videoId);
      return { video: allVideos[idx], index: idx };
    }).filter(t => t.video);
  } else if (options.resume) {
    const startIndex = checkpoint.nextIndex;
    targetVideos = allVideos.slice(startIndex, startIndex + options.batchSize).map((video, i) => ({
      video,
      index: startIndex + i
    }));
  } else {
    targetVideos = allVideos.slice(0, options.batchSize).map((video, i) => ({
      video,
      index: i
    }));
  }

  const batchItems: CaptionSyncReportItem[] = [];
  let batchSucceeded = 0;
  let batchFailed = 0;
  let batchSkipped = 0;
  let maxIndex = checkpoint.nextIndex;

  for (const { video, index } of targetVideos) {
    const now = new Date().toISOString();
    maxIndex = Math.max(maxIndex, index + 1);

    try {
      const source = await captureSourceUseCase(video.url);

      // Skip check: already has English captions?
      if (!options.force && await hasEnglishCaptionAssets(source.id)) {
        const existing = reportIndex.get(video.videoId);
        // Preserve success status, don't downgrade to skipped
        const item: CaptionSyncReportItem = {
          videoId: video.videoId,
          sourceId: source.id,
          status: existing?.status === 'success' ? 'success' : 'skipped',
          attempts: existing?.attempts ?? 0,
          captionLanguage: options.language,
          updatedAt: now
        };
        batchItems.push(item);
        reportIndex.set(video.videoId, item);
        batchSkipped++;
      } else {
        try {
          await ensureTranscriptUseCase(source.id, { language: options.language });
          const item: CaptionSyncReportItem = {
            videoId: video.videoId,
            sourceId: source.id,
            status: 'success',
            attempts: (reportIndex.get(video.videoId)?.attempts ?? 0) + 1,
            captionLanguage: options.language,
            updatedAt: now
          };
          batchItems.push(item);
          reportIndex.set(video.videoId, item);
          batchSucceeded++;
        } catch (err: any) {
          const item: CaptionSyncReportItem = {
            videoId: video.videoId,
            sourceId: source.id,
            status: 'failed',
            attempts: (reportIndex.get(video.videoId)?.attempts ?? 0) + 1,
            failureKind: classifyFailure(err.message),
            errorMessage: err.message,
            updatedAt: now
          };
          batchItems.push(item);
          reportIndex.set(video.videoId, item);
          batchFailed++;
        }
      }
    } catch (err: any) {
      const item: CaptionSyncReportItem = {
        videoId: video.videoId,
        status: 'failed',
        attempts: (reportIndex.get(video.videoId)?.attempts ?? 0) + 1,
        failureKind: classifyFailure(err.message),
        errorMessage: err.message,
        updatedAt: now
      };
      batchItems.push(item);
      reportIndex.set(video.videoId, item);
      batchFailed++;
    }

    // Per-video checkpoint update
    checkpoint.nextIndex = Math.max(maxIndex, checkpoint.nextIndex);
    checkpoint.processed += 1;
    checkpoint.succeeded += batchItems[batchItems.length - 1].status === 'success' ? 1 : 0;
    checkpoint.failed += batchItems[batchItems.length - 1].status === 'failed' ? 1 : 0;
    checkpoint.skipped += batchItems[batchItems.length - 1].status === 'skipped' ? 1 : 0;
    if (checkpoint.nextIndex >= allVideos.length) {
      checkpoint.status = 'completed';
    }
    await persistProgress(checkpoint, report, reportIndex, allVideos.length);
  }

  return {
    channelId,
    processed: batchItems.length,
    succeeded: batchSucceeded,
    failed: batchFailed,
    skipped: batchSkipped,
    items: batchItems
  };
}
