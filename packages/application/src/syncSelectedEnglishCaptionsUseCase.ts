import { channelStorage, documentStorage } from '@yanghoo/storage';
import { captureSourceUseCase } from './index.js';
import { ensureTranscriptUseCase } from './ensureTranscriptUseCase.js';
import type {
  VideoSelection,
  VideoSelectionItem,
  CaptionSyncReport,
  CaptionSyncReportItem,
  FailureKind
} from '@yanghoo/domain';

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

export interface SyncSelectedCaptionsResult {
  channelId: string;
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  items: CaptionSyncReportItem[];
}

export async function syncSelectedEnglishCaptionsUseCase(params: {
  channelId: string;
  batchSize: number;
  force?: boolean;
}): Promise<SyncSelectedCaptionsResult> {
  const manifest = await channelStorage.getChannelManifest(params.channelId);
  if (!manifest) {
    throw new Error(`Channel not found: ${params.channelId}`);
  }

  const videos = await channelStorage.getChannelVideos(params.channelId) || [];
  if (videos.length === 0) {
    return { channelId: params.channelId, processed: 0, succeeded: 0, failed: 0, skipped: 0, items: [] };
  }

  let selection = await channelStorage.getVideoSelection(params.channelId);
  if (!selection) {
    selection = { channelId: params.channelId, updatedAt: new Date().toISOString(), items: [] };
  }

  const selMap = new Map(selection.items.map(i => [i.videoId, i]));

  // Load or initialize caption sync report
  let report: CaptionSyncReport = await channelStorage.getCaptionSyncReport(params.channelId) || {
    channelId: params.channelId,
    language: 'en',
    status: 'partial',
    items: [],
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const reportIndex = new Map<string, CaptionSyncReportItem>();
  for (const item of report.items) {
    reportIndex.set(item.videoId, item);
  }

  // Filter to selected videos that haven't been synced yet
  const candidates = videos.filter(v => {
    const item = selMap.get(v.videoId);
    return item?.selected === true && item?.captionStatus !== 'caption_ready' && item?.captionStatus !== 'caption_failed';
  });

  const batch = candidates.slice(0, params.batchSize);

  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  let skipped = 0;
  const batchReportItems: CaptionSyncReportItem[] = [];

  for (const video of batch) {
    const now = new Date().toISOString();
    processed++;

    // Derive sourceId from selection, report, or video.id — no network needed
    const selItem = selMap.get(video.videoId);
    const existingReport = reportIndex.get(video.videoId);
    const derivedSourceId = selItem?.sourceId || existingReport?.sourceId || video.id;

    // Local-first skip: check real English caption assets before any network call
    if (!params.force && await hasEnglishCaptionAssets(derivedSourceId)) {
      const reportItem: CaptionSyncReportItem = {
        videoId: video.videoId,
        sourceId: derivedSourceId,
        status: existingReport?.status === 'success' ? 'success' : 'skipped',
        attempts: existingReport?.attempts ?? 0,
        captionLanguage: 'en',
        updatedAt: now
      };
      reportIndex.set(video.videoId, reportItem);
      batchReportItems.push(reportItem);

      const item: VideoSelectionItem = {
        videoId: video.videoId,
        sourceId: derivedSourceId,
        selected: true,
        captionStatus: 'caption_ready',
        indexStatus: selItem?.indexStatus ?? 'not_indexed',
        updatedAt: now
      };
      selMap.set(video.videoId, item);
      skipped++;
      continue;
    }

    // Not ready locally — capture from network
    try {
      const source = await captureSourceUseCase(video.url);
      const sourceId = source.id;

      // Double-check assets after capture (source might already exist with assets)
      if (!params.force && await hasEnglishCaptionAssets(sourceId)) {
        const existing = reportIndex.get(video.videoId);
        const reportItem: CaptionSyncReportItem = {
          videoId: video.videoId,
          sourceId,
          status: existing?.status === 'success' ? 'success' : 'skipped',
          attempts: existing?.attempts ?? 0,
          captionLanguage: 'en',
          updatedAt: now
        };
        reportIndex.set(video.videoId, reportItem);
        batchReportItems.push(reportItem);

        const item: VideoSelectionItem = {
          videoId: video.videoId,
          sourceId,
          selected: true,
          captionStatus: 'caption_ready',
          indexStatus: selMap.get(video.videoId)?.indexStatus ?? 'not_indexed',
          updatedAt: now
        };
        selMap.set(video.videoId, item);
        skipped++;
        continue;
      }

      try {
        await ensureTranscriptUseCase(sourceId, { language: 'en' });

        const reportItem: CaptionSyncReportItem = {
          videoId: video.videoId,
          sourceId,
          status: 'success',
          attempts: (reportIndex.get(video.videoId)?.attempts ?? 0) + 1,
          captionLanguage: 'en',
          updatedAt: now
        };
        reportIndex.set(video.videoId, reportItem);
        batchReportItems.push(reportItem);

        const item: VideoSelectionItem = {
          videoId: video.videoId,
          sourceId,
          selected: true,
          captionStatus: 'caption_ready',
          indexStatus: 'not_indexed',
          updatedAt: now
        };
        selMap.set(video.videoId, item);
        succeeded++;
      } catch (err: any) {
        const reportItem: CaptionSyncReportItem = {
          videoId: video.videoId,
          sourceId,
          status: 'failed',
          attempts: (reportIndex.get(video.videoId)?.attempts ?? 0) + 1,
          failureKind: classifyFailure(err.message),
          errorMessage: err.message?.substring(0, 500),
          captionLanguage: 'en',
          updatedAt: now
        };
        reportIndex.set(video.videoId, reportItem);
        batchReportItems.push(reportItem);

        const item: VideoSelectionItem = {
          videoId: video.videoId,
          sourceId,
          selected: true,
          captionStatus: 'caption_failed',
          indexStatus: 'not_indexed',
          lastError: err.message?.substring(0, 500),
          updatedAt: now
        };
        selMap.set(video.videoId, item);
        failed++;
      }
    } catch (err: any) {
      const reportItem: CaptionSyncReportItem = {
        videoId: video.videoId,
        status: 'failed',
        attempts: (reportIndex.get(video.videoId)?.attempts ?? 0) + 1,
        failureKind: classifyFailure(err.message),
        errorMessage: err.message?.substring(0, 500),
        captionLanguage: 'en',
        updatedAt: new Date().toISOString()
      };
      reportIndex.set(video.videoId, reportItem);
      batchReportItems.push(reportItem);

      const item: VideoSelectionItem = {
        videoId: video.videoId,
        selected: true,
        captionStatus: 'caption_failed',
        indexStatus: 'not_indexed',
        lastError: err.message?.substring(0, 500),
        updatedAt: new Date().toISOString()
      };
      selMap.set(video.videoId, item);
      failed++;
    }
  }

  selection.items = Array.from(selMap.values());
  selection.updatedAt = new Date().toISOString();
  await channelStorage.saveVideoSelection(selection);

  // Persist caption sync report
  report.items = Array.from(reportIndex.values());
  report.updatedAt = new Date().toISOString();
  report.status = 'partial';
  await channelStorage.saveCaptionSyncReport(report);

  return {
    channelId: params.channelId,
    processed,
    succeeded,
    failed,
    skipped,
    items: batchReportItems
  };
}
