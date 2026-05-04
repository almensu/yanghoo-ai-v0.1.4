import { useState, useEffect, useCallback } from 'react';
import { Loader2, Plus, RefreshCw } from 'lucide-react';
import {
  listLearningChannels,
  registerLearningChannel,
  getChannelVideos,
  updateVideoSelection,
  syncSelectedCaptions,
  buildChannelIndex,
  type LearningChannelSummary
} from '../api/client';
import LearningChannelVideoTable from './LearningChannelVideoTable';

export default function LearningChannelLibrary() {
  const [channels, setChannels] = useState<LearningChannelSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [channelUrl, setChannelUrl] = useState('');
  const [channelLimit, setChannelLimit] = useState(50);
  const [isAdding, setIsAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);

  const refreshChannels = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await listLearningChannels();
      setChannels(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load channels');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshChannels();
  }, [refreshChannels]);

  const handleAddChannel = async () => {
    if (!channelUrl.trim() || isAdding) return;
    setIsAdding(true);
    setAddError(null);
    try {
      await registerLearningChannel(channelUrl.trim(), channelLimit);
      setChannelUrl('');
      await refreshChannels(false);
    } catch (err: any) {
      setAddError(err.message || 'Failed to add channel');
    } finally {
      setIsAdding(false);
    }
  };

  const activeChannel = channels.find(c => c.channelId === activeChannelId);

  if (activeChannelId && activeChannel) {
    return (
      <LearningChannelVideoTable
        channel={activeChannel}
        onBack={() => setActiveChannelId(null)}
        onRefreshChannel={refreshChannels}
      />
    );
  }

  return (
    <div className="mx-auto max-w-[1180px] px-0 py-2">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-ink">Channel Library</h2>
        <p className="mt-1 text-sm text-muted">Register YouTube channels to build your English learning library.</p>
      </div>

      <div className="mb-6 rounded-lg border border-line bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Add Channel</p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={channelUrl}
            onChange={e => setChannelUrl(e.target.value)}
            placeholder="https://www.youtube.com/@ChannelName"
            className="h-10 flex-1 rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
            disabled={isAdding}
          />
          <input
            type="number"
            value={channelLimit}
            onChange={e => setChannelLimit(Number(e.target.value))}
            min={1}
            max={500}
            className="h-10 w-20 rounded-md border border-line bg-white px-3 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
            disabled={isAdding}
          />
          <button
            type="button"
            onClick={handleAddChannel}
            disabled={isAdding || !channelUrl.trim()}
            className="inline-flex h-10 items-center gap-1.5 rounded-md bg-ink px-4 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Channel
          </button>
        </div>
        {addError && <p className="mt-2 text-xs text-red-600">{addError}</p>}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">
          {channels.length} channel{channels.length === 1 ? '' : 's'}
        </p>
        <button
          type="button"
          onClick={() => refreshChannels()}
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => refreshChannels()}
            className="mt-3 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading channels...
        </div>
      ) : channels.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-ink">No channels registered</p>
          <p className="mt-1 text-sm text-muted">Add a YouTube channel URL above to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {channels.map(ch => (
            <button
              key={ch.channelId}
              type="button"
              onClick={() => setActiveChannelId(ch.channelId)}
              className="rounded-lg border border-line bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="truncate text-sm font-semibold text-ink">{ch.title}</p>
              <p className="mt-2 truncate text-xs text-muted">{ch.channelId}</p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-muted">Videos</dt>
                  <dd className="font-medium text-ink">{ch.videoCount}</dd>
                </div>
                <div>
                  <dt className="text-muted">Selected</dt>
                  <dd className="font-medium text-ink">{ch.selectedCount}</dd>
                </div>
                <div>
                  <dt className="text-muted">Captions</dt>
                  <dd className="font-medium text-ink">{ch.captionReadyCount}</dd>
                </div>
                <div>
                  <dt className="text-muted">Sentences</dt>
                  <dd className="font-medium text-ink">{ch.indexedSentenceCount.toLocaleString()}</dd>
                </div>
              </dl>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
