import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, Loader2, AlertCircle, RefreshCw, X } from 'lucide-react';
import {
  getChannelVideos,
  updateVideoSelection,
  syncSelectedCaptions,
  buildChannelIndex,
  refreshChannelVideos,
  type LearningChannelSummary,
  type LearningChannelVideoRow
} from '../api/client';

function statusBadge(status: string, label?: string) {
  const colors: Record<string, string> = {
    not_captured: 'bg-slate-100 text-slate-500',
    selected: 'bg-amber-50 text-amber-700',
    caption_ready: 'bg-emerald-50 text-emerald-700',
    caption_failed: 'bg-red-50 text-red-700',
    indexed: 'bg-emerald-50 text-emerald-700',
    not_indexed: 'bg-slate-100 text-slate-500',
    index_failed: 'bg-red-50 text-red-700'
  };
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-medium ${colors[status] || 'bg-slate-100 text-slate-500'}`}>
      {label || status.replace(/_/g, ' ')}
    </span>
  );
}

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'new', label: 'New' },
  { key: 'selected', label: 'Selected' },
  { key: 'caption_ready', label: 'Caption Ready' },
  { key: 'failed', label: 'Failed' },
  { key: 'remote_missing', label: 'Remote Missing' }
] as const;

type FilterKey = typeof FILTER_OPTIONS[number]['key'];

function filterVideos(videos: LearningChannelVideoRow[], filter: FilterKey): LearningChannelVideoRow[] {
  switch (filter) {
    case 'new': return videos.filter(v => v.discoveryStatus === 'new');
    case 'selected': return videos.filter(v => v.selected);
    case 'caption_ready': return videos.filter(v => v.captionStatus === 'caption_ready');
    case 'failed': return videos.filter(v => v.captionStatus === 'caption_failed');
    case 'remote_missing': return videos.filter(v => v.discoveryStatus === 'remote_missing');
    default: return videos;
  }
}

export default function LearningChannelVideoTable({
  channel,
  onBack,
  onRefreshChannel
}: {
  channel: LearningChannelSummary;
  onBack: () => void;
  onRefreshChannel: (showLoading?: boolean) => void;
}) {
  const [videos, setVideos] = useState<LearningChannelVideoRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [building, setBuilding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [buildResult, setBuildResult] = useState<string | null>(null);
  const [refreshResult, setRefreshResult] = useState<string | null>(null);
  const [batchSize, setBatchSize] = useState(10);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [refreshLimit, setRefreshLimit] = useState(50);

  const refreshVideos = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await getChannelVideos(channel.channelId);
      setVideos(data.videos);
    } catch (err: any) {
      setError(err.message || 'Failed to load videos');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, [channel.channelId]);

  useEffect(() => {
    refreshVideos();
  }, [refreshVideos]);

  const filteredVideos = filterVideos(videos, activeFilter);
  const selectedIds = videos.filter(v => v.selected).map(v => v.videoId);
  const allVisibleSelected = videos.length > 0 && selectedIds.length === videos.length;

  const toggleSelect = async (videoIds: string[], selected: boolean) => {
    try {
      await updateVideoSelection(channel.channelId, videoIds, selected);
      await refreshVideos(false);
      onRefreshChannel(false);
    } catch (err: any) {
      setError(err.message || 'Selection update failed');
    }
  };

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncResult(null);
    setError(null);
    try {
      const result = await syncSelectedCaptions(channel.channelId, batchSize);
      setSyncResult(`Processed: ${result.processed} | Succeeded: ${result.succeeded} | Failed: ${result.failed}`);
      await refreshVideos(false);
      onRefreshChannel(false);
    } catch (err: any) {
      setError(err.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const handleBuildIndex = async () => {
    if (building) return;
    setBuilding(true);
    setBuildResult(null);
    setError(null);
    try {
      const result = await buildChannelIndex(channel.channelId);
      setBuildResult(`${result.sentenceCount} sentences from ${result.sourceCount} sources`);
      await refreshVideos(false);
      onRefreshChannel(false);
    } catch (err: any) {
      setError(err.message || 'Build index failed');
    } finally {
      setBuilding(false);
    }
  };

  const handleRefresh = async (mode: 'latest' | 'full') => {
    if (refreshing) return;
    setRefreshing(true);
    setRefreshResult(null);
    setError(null);
    try {
      const result = await refreshChannelVideos(channel.channelId, mode, refreshLimit);
      setRefreshResult(`+${result.addedCount} new, ${result.updatedCount} updated, ${result.preservedCount} preserved`);
      await refreshVideos(false);
      onRefreshChannel(false);
    } catch (err: any) {
      setError(err.message || 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] px-0 py-2">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h2 className="text-lg font-semibold text-ink">{channel.title}</h2>
            <p className="text-xs text-muted">{channel.channelId}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleRefresh('latest')}
          disabled={refreshing}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-xs font-medium text-ink hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh latest {refreshLimit}
        </button>
        <button
          type="button"
          onClick={() => handleRefresh('full')}
          disabled={refreshing}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-xs font-medium text-ink hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Full refresh
        </button>
        <input
          type="number"
          value={refreshLimit}
          onChange={e => setRefreshLimit(Number(e.target.value))}
          min={1}
          max={500}
          className="h-8 w-16 rounded-md border border-line px-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {refreshResult && (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
          <Check className="h-3.5 w-3.5" /> {refreshResult}
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {FILTER_OPTIONS.map(f => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActiveFilter(f.key)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              activeFilter === f.key
                ? 'bg-ink text-white'
                : 'border border-line bg-white text-muted hover:text-ink'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted">{filteredVideos.length} / {videos.length}</span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => toggleSelect(videos.map(v => v.videoId), !allVisibleSelected)}
          className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-slate-50"
        >
          {allVisibleSelected ? 'Deselect All' : 'Select All'}
        </button>
        <button
          type="button"
          onClick={() => toggleSelect(videos.filter(v => v.discoveryStatus === 'new').map(v => v.videoId), true)}
          className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-slate-50"
        >
          Select New
        </button>
        <span className="text-xs text-muted">|</span>
        {[20, 50, 100].map(n => (
          <button
            key={n}
            type="button"
            onClick={() => toggleSelect(filteredVideos.slice(0, n).map(v => v.videoId), true)}
            disabled={filteredVideos.length === 0}
            className="rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-slate-50 disabled:opacity-50"
          >
            Select first {n}
          </button>
        ))}
        <button
          type="button"
          onClick={() => toggleSelect(selectedIds, false)}
          disabled={selectedIds.length === 0}
          className="rounded-md border border-line bg-white px-3 py-1.5 text-xs font-medium text-muted hover:text-ink hover:bg-slate-50 disabled:opacity-50"
        >
          Clear selected
        </button>
        <span className="text-xs text-muted">{selectedIds.length} selected</span>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          type="number"
          value={batchSize}
          onChange={e => setBatchSize(Number(e.target.value))}
          min={1}
          max={100}
          className="h-8 w-16 rounded-md border border-line px-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="button"
          onClick={handleSync}
          disabled={syncing || selectedIds.length === 0}
          className="inline-flex h-8 items-center gap-1 rounded-md bg-ink px-3 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Sync English Captions
        </button>
        <button
          type="button"
          onClick={handleBuildIndex}
          disabled={building}
          className="inline-flex h-8 items-center gap-1 rounded-md border border-line bg-white px-3 text-xs font-medium text-ink hover:bg-slate-50 disabled:opacity-50"
        >
          {building ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          Build Index
        </button>
        {syncResult && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
            <Check className="h-3.5 w-3.5" /> {syncResult}
          </span>
        )}
        {buildResult && (
          <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
            <Check className="h-3.5 w-3.5" /> {buildResult}
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="shrink-0"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading videos...
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-muted">
                <th className="w-10 px-3 py-2.5"></th>
                <th className="px-3 py-2.5">Title</th>
                <th className="px-3 py-2.5">Published</th>
                <th className="px-3 py-2.5">Caption</th>
                <th className="px-3 py-2.5">Index</th>
                <th className="px-3 py-2.5">Error</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filteredVideos.map(video => (
                <tr key={video.videoId} className={`transition-colors ${video.selected ? 'bg-amber-50/40' : 'hover:bg-slate-50'}`}>
                  <td className="px-3 py-2.5">
                    <input
                      type="checkbox"
                      checked={video.selected}
                      onChange={() => toggleSelect([video.videoId], !video.selected)}
                      className="h-4 w-4 rounded border-slate-300 text-ink focus:ring-accent"
                    />
                  </td>
                  <td className="max-w-xs px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <a
                        href={video.youtubeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate font-medium text-ink hover:underline"
                      >
                        {video.title}
                      </a>
                      {video.discoveryStatus === 'new' && (
                        <span className="shrink-0 rounded bg-blue-100 px-1 py-0.5 text-[10px] font-semibold text-blue-700">NEW</span>
                      )}
                      {video.discoveryStatus === 'remote_missing' && (
                        <span className="shrink-0 rounded bg-slate-200 px-1 py-0.5 text-[10px] font-semibold text-slate-600">MISSING</span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-xs text-muted">
                    {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-3 py-2.5">{statusBadge(video.captionStatus)}</td>
                  <td className="px-3 py-2.5">{statusBadge(video.indexStatus)}</td>
                  <td className="max-w-[200px] truncate px-3 py-2.5 text-xs text-red-600">
                    {video.lastError || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredVideos.length === 0 && (
            <div className="px-6 py-8 text-center text-sm text-muted">
              {videos.length === 0 ? 'No videos found for this channel.' : 'No videos match this filter.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
