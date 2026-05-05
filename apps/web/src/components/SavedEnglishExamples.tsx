import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, Bookmark, Check, Clock3, Copy, ExternalLink, Loader2, Play, Trash2, X } from 'lucide-react';
import {
  listSavedExamples,
  deleteSavedExample,
  updateSavedExample,
  markSavedExampleReviewed,
  type SavedEnglishExample
} from '../api/client';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    saved: 'bg-slate-100 text-slate-600',
    learning: 'bg-amber-50 text-amber-700',
    mastered: 'bg-emerald-50 text-emerald-700'
  };
  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-medium ${colors[status] || colors.saved}`}>
      {status}
    </span>
  );
}

export default function SavedEnglishExamples() {
  const [items, setItems] = useState<SavedEnglishExample[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [editingTags, setEditingTags] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listSavedExamples(searchQuery ? { q: searchQuery } : undefined);
      setItems(data);
      if (data.length > 0) setActiveId(prev => data.find(d => d.id === prev) ? prev : data[0].id);
    } catch (err: any) {
      setError(err.message || 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => { refresh(); }, [refresh]);

  const active = items.find(i => i.id === activeId);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this saved example?')) return;
    try {
      await deleteSavedExample(id);
      if (activeId === id) setActiveId(null);
      await refresh();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleReview = async (id: string) => {
    try {
      const updated = await markSavedExampleReviewed(id);
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveNote = async (id: string) => {
    const note = editingNote ?? '';
    try {
      const updated = await updateSavedExample(id, { note });
      setItems(prev => prev.map(i => i.id === id ? updated : i));
      setEditingNote(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSaveTags = async (id: string) => {
    const raw = editingTags ?? '';
    const tags = raw.split(',').map(t => t.trim()).filter(Boolean);
    try {
      const updated = await updateSavedExample(id, { tags });
      setItems(prev => prev.map(i => i.id === id ? updated : i));
      setEditingTags(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const updated = await updateSavedExample(id, { status });
      setItems(prev => prev.map(i => i.id === id ? updated : i));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyText = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch { setCopiedKey(null); }
  };

  return (
    <div className="mx-auto max-w-[1180px] px-0 py-2">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Review queue</p>
          <h1 className="mt-1 text-2xl font-semibold text-ink">Saved English Examples</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>{items.length} saved</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search saved examples..."
          className="h-10 w-full max-w-md rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 py-8 text-sm text-muted">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-white px-6 py-12 text-center">
          <Bookmark className="mx-auto h-8 w-8 text-muted" />
          <p className="mt-4 text-sm font-medium text-ink">No saved examples yet</p>
          <p className="mt-1 text-sm text-muted">Save sentences from English Search to build your review queue.</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-2">
            {items.map(item => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveId(item.id)}
                className={`block w-full rounded-lg border bg-white p-3 text-left shadow-sm transition-colors ${
                  activeId === item.id ? 'border-slate-900 ring-1 ring-slate-900' : 'border-line hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] leading-7 text-ink">{item.text}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                      <span className="truncate font-medium text-ink">{item.channelTitle || item.channelId}</span>
                      <span className="font-mono text-accent"><Clock3 className="mr-1 inline h-3 w-3" />{formatTime(item.start)}</span>
                      {statusBadge(item.status)}
                      {item.reviewCount > 0 && <span>reviewed {item.reviewCount}x</span>}
                    </div>
                    {item.tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {item.tags.map(tag => (
                          <span key={tag} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-muted">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {active ? (
            <aside className="space-y-4 lg:sticky lg:top-4">
              <div className="overflow-hidden rounded-lg border border-line bg-black shadow-sm">
                <iframe
                  key={active.youtubeEmbedUrl}
                  title={active.videoTitle || 'English sentence'}
                  src={active.youtubeEmbedUrl}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>

              <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Now playing</p>
                <h2 className="mt-1 truncate text-base font-semibold text-ink">{active.videoTitle || 'Untitled video'}</h2>
                <p className="mt-1 text-xs text-muted">{active.channelTitle || active.channelId} · {formatTime(active.start)}</p>

                <p className="mt-4 text-[15px] leading-7 text-ink">{active.text}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleReview(active.id)}
                    className="inline-flex items-center gap-1.5 rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
                  >
                    <Check className="h-3.5 w-3.5" /> Mark reviewed
                  </button>
                  <button
                    type="button"
                    onClick={() => copyText(active.text, active.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-slate-50"
                  >
                    {copiedKey === active.id ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    Sentence
                  </button>
                  <a
                    href={active.youtubeTimestampUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-slate-50"
                  >
                    <Play className="h-3.5 w-3.5" /> YouTube
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDelete(active.id)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </button>
                </div>

                <div className="mt-4 space-y-3 border-t border-line pt-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Status</p>
                    <div className="mt-1 flex gap-1.5">
                      {(['saved', 'learning', 'mastered'] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => handleStatusChange(active.id, s)}
                          className={`rounded-md px-2 py-1 text-xs font-medium ${active.status === s ? 'bg-ink text-white' : 'border border-line bg-white text-muted hover:text-ink'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Note</p>
                    {editingNote !== null ? (
                      <div className="mt-1 space-y-1">
                        <textarea
                          value={editingNote}
                          onChange={e => setEditingNote(e.target.value)}
                          className="w-full rounded-md border border-line px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleSaveNote(active.id)} className="text-xs font-medium text-accent">Save</button>
                          <button type="button" onClick={() => setEditingNote(null)} className="text-xs font-medium text-muted">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingNote(active.note)}
                        className="mt-1 block min-h-[2rem] w-full rounded-md border border-line px-2 py-1.5 text-left text-sm text-ink hover:bg-slate-50"
                      >
                        {active.note || <span className="text-muted">Add a note...</span>}
                      </button>
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Tags</p>
                    {editingTags !== null ? (
                      <div className="mt-1 space-y-1">
                        <input
                          type="text"
                          value={editingTags}
                          onChange={e => setEditingTags(e.target.value)}
                          placeholder="comma, separated, tags"
                          className="w-full rounded-md border border-line px-2 py-1.5 text-sm text-ink focus:outline-none focus:ring-1 focus:ring-accent"
                        />
                        <div className="flex gap-2">
                          <button type="button" onClick={() => handleSaveTags(active.id)} className="text-xs font-medium text-accent">Save</button>
                          <button type="button" onClick={() => setEditingTags(null)} className="text-xs font-medium text-muted">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setEditingTags(active.tags.join(', '))}
                        className="mt-1 block w-full rounded-md border border-line px-2 py-1.5 text-left text-sm hover:bg-slate-50"
                      >
                        {active.tags.length > 0 ? (
                          <span className="text-ink">{active.tags.join(', ')}</span>
                        ) : (
                          <span className="text-muted">Add tags...</span>
                        )}
                      </button>
                    )}
                  </div>

                  <div className="text-xs text-muted">
                    Saved {new Date(active.savedAt).toLocaleDateString()}
                    {active.reviewCount > 0 && <> · Reviewed {active.reviewCount}x</>}
                    {active.lastReviewedAt && <> · Last {new Date(active.lastReviewedAt).toLocaleDateString()}</>}
                  </div>
                </div>
              </div>
            </aside>
          ) : (
            <aside className="hidden lg:block">
              <div className="rounded-lg border border-dashed border-line bg-white px-5 py-10 text-center">
                <Play className="mx-auto h-8 w-8 text-muted" />
                <p className="mt-3 text-sm font-medium text-ink">Select a sentence to play</p>
              </div>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
