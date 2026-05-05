import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Check, Loader2, AlertCircle, RefreshCw, Trash2, X, Tag } from 'lucide-react';
import {
  getChannelVideos,
  updateVideoSelection,
  syncSelectedCaptions,
  buildChannelIndex,
  refreshChannelVideos,
  deleteLearningChannel,
  updateChannelTaxonomy,
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
  const [deleting, setDeleting] = useState(false);
  const [editingTaxonomy, setEditingTaxonomy] = useState(false);
  const [taxonomyCategory, setTaxonomyCategory] = useState(channel.category || '');
  const [taxonomyTags, setTaxonomyTags] = useState(channel.tags?.join(', ') || '');
  const [taxonomyNote, setTaxonomyNote] = useState(channel.taxonomyNote || '');
  const [taxonomySaving, setTaxonomySaving] = useState(false);

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
  const subtitleReadyCount = videos.filter(v => v.captionStatus === 'caption_ready').length;
  const needsSubtitleCount = videos.filter(v => v.selected && v.captionStatus !== 'caption_ready' && v.captionStatus !== 'caption_failed').length;
  const failedSubtitleCount = videos.filter(v => v.captionStatus === 'caption_failed').length;

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
      const parts: string[] = [];
      if (result.succeeded > 0) parts.push(`${result.succeeded} English subtitle${result.succeeded > 1 ? 's' : ''} synced`);
      if (result.failed > 0) parts.push(`${result.failed} failed`);
      setSyncResult(parts.join(', ') || `0 subtitles processed`);
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

  const handleDelete = async () => {
    if (deleting) return;
    const confirmed = window.confirm(
      `Delete channel "${channel.title}"?\n\nThis will remove the channel URL library and all English subtitle assets for this channel. This cannot be undone.`
    );
    if (!confirmed) return;
    setDeleting(true);
    setError(null);
    try {
      await deleteLearningChannel(channel.channelId);
      onRefreshChannel(false);
      onBack();
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleSaveTaxonomy = async () => {
    setTaxonomySaving(true);
    setError(null);
    try {
      await updateChannelTaxonomy(channel.channelId, {
        category: taxonomyCategory,
        tags: taxonomyTags.split(',').map(t => t.trim()).filter(Boolean),
        note: taxonomyNote
      });
      setEditingTaxonomy(false);
      onRefreshChannel(false);
    } catch (err: any) {
      setError(err.message || 'Taxonomy save failed');
    } finally {
      setTaxonomySaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] px-0 py-2">
      {/* Band 1: URL Library */}
      <div className="border-b border-slate-100 pb-3 mb-3">
        <div className="mb-2 flex items-center justify-between">
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
              <p className="text-xs text-muted">{channel.videoCount} URLs · {channel.channelId}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-red-200 bg-white px-3 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Delete Channel
            </button>
            <button
              type="button"
              onClick={() => handleRefresh('latest')}
              disabled={refreshing}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-line bg-white px-3 text-xs font-medium text-ink hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh URLs
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
        </div>
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">URL Library</p>
        {/* Taxonomy display/edit */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
          <Tag className="h-3.5 w-3.5 text-muted" />
          {editingTaxonomy ? (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={taxonomyCategory}
                  onChange={e => setTaxonomyCategory(e.target.value)}
                  placeholder="category (e.g. news, interview)"
                  className="h-7 w-40 rounded border border-line px-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <input
                  type="text"
                  value={taxonomyTags}
                  onChange={e => setTaxonomyTags(e.target.value)}
                  placeholder="tags (comma separated)"
                  className="h-7 w-48 rounded border border-line px-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={taxonomyNote}
                  onChange={e => setTaxonomyNote(e.target.value)}
                  placeholder="optional note..."
                  className="h-7 flex-1 rounded border border-line px-2 text-xs text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                />
                <button type="button" onClick={handleSaveTaxonomy} disabled={taxonomySaving} className="inline-flex h-7 items-center gap-1 rounded-md bg-ink px-2.5 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50">
                  {taxonomySaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                  Save
                </button>
                <button type="button" onClick={() => setEditingTaxonomy(false)} className="text-xs font-medium text-muted hover:underline">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <>
              {channel.category ? (
                <span className="inline-block rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-medium text-white">{channel.category}</span>
              ) : (
                <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-muted">uncategorized</span>
              )}
              {channel.tags.map(t => (
                <span key={t} className="inline-block max-w-[100px] truncate rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-muted">{t}</span>
              ))}
              {channel.taxonomyNote && (
                <span className="truncate text-muted">{channel.taxonomyNote}</span>
              )}
              <button type="button" onClick={() => { setTaxonomyCategory(channel.category || ''); setTaxonomyTags(channel.tags?.join(', ') || ''); setTaxonomyNote(channel.taxonomyNote || ''); setEditingTaxonomy(true); }} className="text-[10px] font-medium text-accent hover:underline">
                Edit
              </button>
            </>
          )}
        </div>
        {refreshResult && (
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700">
            <Check className="h-3.5 w-3.5" /> {refreshResult}
          </div>
        )}
        <div className="flex flex-wrap items-center gap-1.5">
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
      </div>

      {/* Band 2: Selection */}
      <div className="border-b border-slate-100 pb-3 mb-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">Selection</p>
        <div className="flex flex-wrap items-center gap-2">
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
          <span className="text-xs text-muted">
            {selectedIds.length > 0
              ? `${selectedIds.length} of ${videos.length} URLs selected for English subtitle sync`
              : 'No URLs selected'}
          </span>
        </div>
      </div>

      {/* Band 3: Subtitle Sync */}
      <div className="pb-3 mb-3">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-muted">Subtitle Sync</p>
        {videos.length > 0 && (
          <p className="mb-2 text-xs text-muted">
            {subtitleReadyCount} of {videos.length} URLs have English subtitles
            {failedSubtitleCount > 0 && ` · ${failedSubtitleCount} failed`}
            {needsSubtitleCount > 0 && ` · ${needsSubtitleCount} selected and waiting`}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2">
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
            Sync English Subtitles
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
                <th className="px-3 py-2.5">Subtitle</th>
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
