import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  AlertCircle,
  BookOpen,
  Captions,
  Check,
  ChevronDown,
  ChevronUp,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  Play,
  Search,
  SkipBack,
  SkipForward
} from 'lucide-react';
import {
  getEnglishSentenceContext,
  listLearningChannels,
  searchEnglishSentences,
  saveEnglishExample,
  deleteSavedExample,
  listSavedExampleIds
} from '../api/client';
import type {
  EnglishSearchCaptionKind,
  EnglishSearchDiversity,
  EnglishSearchSort,
  EnglishSentenceContextItem,
  EnglishSentenceSearchResult,
  LearningChannelSummary
} from '../api/client';
import { Bookmark } from 'lucide-react';

const QUICK_QUERY_GROUPS = [
  { label: 'Chunks', items: ['would have', 'could have', 'should have', 'supposed to', 'used to'] },
  { label: 'Spoken', items: ['I mean', 'you know', 'kind of', 'sort of'] },
  { label: 'Connectors', items: ['turns out', 'end up', 'as long as', 'even though'] }
];
const RESULT_LIMITS = [20, 50, 100];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.split(regex).map((part, i) => (
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="rounded-sm bg-amber-100 px-0.5 text-ink">{part}</mark>
      : part
  ));
}

async function computeStableId(entry: { channelId: string; sourceId: string; videoId: string; start: number; end: number; normalizedText: string }): Promise<string> {
  const raw = `${entry.channelId}|${entry.sourceId}|${entry.videoId}|${entry.start}|${entry.end}|${entry.normalizedText}`;
  const buffer = new TextEncoder().encode(raw);
  const hash = await crypto.subtle.digest('SHA-1', buffer);
  const hex = Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  return hex.substring(0, 20);
}

function resultKey(result: EnglishSentenceSearchResult): string {
  return `${result.entry.channelId}:${result.entry.sourceId}:${result.entry.start}`;
}

function ResultCard({
  result,
  query,
  index,
  active,
  copiedKey,
  isSaved,
  onSelect,
  onCopySentence,
  onCopyUrl,
  onToggleSave
}: {
  result: EnglishSentenceSearchResult;
  query: string;
  index: number;
  active: boolean;
  copiedKey: string | null;
  isSaved: boolean;
  onSelect: () => void;
  onCopySentence: () => void;
  onCopyUrl: () => void;
  onToggleSave: () => void;
}) {
  const e = result.entry;

  return (
    <article
      className={`rounded-lg border bg-white p-3 shadow-sm transition-colors ${
        active ? 'border-slate-900 ring-1 ring-slate-900' : 'border-line hover:border-slate-300'
      }`}
    >
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="flex items-start gap-3">
          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
            active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-muted'
          }`}>
            {index + 1}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] leading-7 text-ink">
              {highlightMatch(e.text, query)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted">
              <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 font-medium text-ink">
                <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted" />
                <span className="truncate">{e.title || 'Untitled video'}</span>
              </span>
              <span className="inline-flex items-center gap-1 font-mono text-accent">
                <Clock3 className="h-3.5 w-3.5" />
                {formatTime(e.start)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Captions className="h-3.5 w-3.5" />
                {e.captionKind === 'auto' ? 'auto' : e.captionKind || 'caption'}
              </span>
            </div>
            <p className="mt-1 truncate text-xs text-muted">{e.channelTitle || e.channelId}</p>
          </div>
        </div>
      </button>

      <div className="mt-3 flex flex-wrap items-center gap-2 pl-10">
        <button
          type="button"
          onClick={onSelect}
          className="inline-flex items-center gap-1.5 rounded-md bg-ink px-2.5 py-1.5 text-xs font-medium text-white hover:bg-slate-800"
        >
          <Play className="h-3.5 w-3.5" />
          Play here
        </button>
        <button
          type="button"
          onClick={onToggleSave}
          className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium ${
            isSaved
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-line bg-white text-ink hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
          {isSaved ? 'Saved' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCopySentence}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-slate-50"
        >
          {copiedKey === `${resultKey(result)}:sentence` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          Sentence
        </button>
        <button
          type="button"
          onClick={onCopyUrl}
          className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-slate-50"
        >
          {copiedKey === `${resultKey(result)}:url` ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          Link
        </button>
      </div>
    </article>
  );
}

function PlayerPanel({
  result,
  nextEmbedUrl,
  contextItems,
  contextLoading,
  isSaved,
  onPrevious,
  onNext,
  canPrevious,
  canNext,
  onCopySentence,
  onToggleSave
}: {
  result: EnglishSentenceSearchResult | null;
  nextEmbedUrl?: string;
  contextItems: EnglishSentenceContextItem[];
  contextLoading: boolean;
  isSaved: boolean;
  onPrevious: () => void;
  onNext: () => void;
  canPrevious: boolean;
  canNext: boolean;
  onCopySentence: () => void;
  onToggleSave: () => void;
}) {
  if (!result) {
    return (
      <div className="rounded-lg border border-dashed border-line bg-white px-5 py-10 text-center">
        <Play className="mx-auto h-8 w-8 text-muted" />
        <p className="mt-3 text-sm font-medium text-ink">Select a sentence to play</p>
      </div>
    );
  }

  const e = result.entry;

  return (
    <div className="space-y-4 lg:sticky lg:top-4">
      <link rel="preconnect" href="https://www.youtube.com" />
      <link rel="preconnect" href="https://www.google.com" />
      {nextEmbedUrl && <link rel="prefetch" href={nextEmbedUrl} />}

      <div className="overflow-hidden rounded-lg border border-line bg-black shadow-sm">
        <iframe
          key={result.youtubeEmbedUrl}
          title={e.title || 'English sentence video'}
          src={result.youtubeEmbedUrl}
          className="aspect-video w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Now playing</p>
            <h2 className="mt-1 truncate text-base font-semibold text-ink">{e.title || 'Untitled video'}</h2>
            <p className="mt-1 text-xs text-muted">{e.channelTitle || e.channelId} · {formatTime(e.start)}</p>
          </div>
          <a
            href={result.youtubeTimestampUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 rounded-md border border-line bg-white px-2.5 py-1.5 text-xs font-medium text-ink hover:bg-slate-50"
          >
            YouTube
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <p className="mt-4 text-[15px] leading-7 text-ink">{e.text}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onPrevious}
            disabled={!canPrevious}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SkipBack className="h-3.5 w-3.5" />
            Previous
          </button>
          <button
            type="button"
            onClick={onNext}
            disabled={!canNext}
            className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
            <SkipForward className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={onCopySentence}
            className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50"
          >
            <Copy className="h-3.5 w-3.5" />
            Copy sentence
          </button>
          <button
            type="button"
            onClick={onToggleSave}
            className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium ${
              isSaved
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-line bg-white text-ink hover:bg-slate-50'
            }`}
          >
            <Bookmark className={`h-3.5 w-3.5 ${isSaved ? 'fill-current' : ''}`} />
            {isSaved ? 'Saved' : 'Save sentence'}
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Context</p>
          {contextLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" />}
        </div>
        <div className="mt-3 space-y-2">
          {contextItems.length > 0 ? contextItems.map(item => (
            <p
              key={`${item.start}-${item.end}`}
              className={`rounded-md px-3 py-2 text-sm leading-6 ${
                item.isMatch ? 'bg-amber-50 text-ink ring-1 ring-amber-200' : 'bg-slate-50 text-muted'
              }`}
            >
              <span className="mr-2 font-mono text-[11px] text-accent">{formatTime(item.start)}</span>
              {item.text}
            </p>
          )) : (
            <p className="text-sm text-muted">Context will appear when the selected source has nearby indexed sentences.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EnglishSentenceSearch() {
  const [query, setQuery] = useState('would have');
  const [limit, setLimit] = useState(20);
  const [diversity, setDiversity] = useState<EnglishSearchDiversity>('balanced');
  const [sort, setSort] = useState<EnglishSearchSort>('recent');
  const [captionKind, setCaptionKind] = useState<EnglishSearchCaptionKind>('all');
  const [results, setResults] = useState<EnglishSentenceSearchResult[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchWarnings, setSearchWarnings] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [contextItems, setContextItems] = useState<EnglishSentenceContextItem[]>([]);
  const [contextLoading, setContextLoading] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const searchSeq = useRef(0);

  const [channels, setChannels] = useState<LearningChannelSummary[]>([]);
  const [selectedChannelIds, setSelectedChannelIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [resultStableIds, setResultStableIds] = useState<Map<string, string>>(new Map());

  const isResultSaved = (result: EnglishSentenceSearchResult): boolean => {
    const stableId = resultStableIds.get(resultKey(result));
    return stableId != null && savedIds.has(stableId);
  };
  const selectedChannelKey = useMemo(
    () => Array.from(selectedChannelIds).sort().join(','),
    [selectedChannelIds]
  );
  const selectedChannels = channels.filter(c => selectedChannelIds.has(c.channelId));
  const totalSentences = selectedChannels.reduce((sum, c) => sum + c.indexedSentenceCount, 0);
  const activeResult = results[activeIndex] ?? null;
  const nextEmbedUrl = results[activeIndex + 1]?.youtubeEmbedUrl;

  useEffect(() => {
    listLearningChannels()
      .then(chs => {
        const indexed = chs.filter(c => c.indexedSentenceCount > 0);
        setChannels(indexed);
        setSelectedChannelIds(new Set(indexed.map(c => c.channelId)));
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    listSavedExampleIds()
      .then(ids => setSavedIds(new Set(ids)))
      .catch(() => {});
  }, []);

  // Compute stable ids for current results via Promise.all → React state
  useEffect(() => {
    if (results.length === 0) return;
    const entries = results.map(r => ({ key: resultKey(r), promise: computeStableId(r.entry) }));
    void Promise.all(entries.map(e => e.promise)).then(ids => {
      const next = new Map<string, string>();
      entries.forEach((e, i) => next.set(e.key, ids[i]));
      setResultStableIds(next);
    });
  }, [results]);

  const runSearch = useCallback(async (opts: { append?: boolean; offset?: number } = {}) => {
    if (!query.trim() || selectedChannelIds.size === 0) {
      setResults([]);
      setHasMore(false);
      setHasSearched(false);
      return;
    }

    const seq = ++searchSeq.current;
    const offset = opts.offset ?? 0;
    setIsLoading(true);
    setErrorMessage(null);
    if (!opts.append) {
      setSearchWarnings([]);
    }

    try {
      const data = await searchEnglishSentences(Array.from(selectedChannelIds), query, {
        limit,
        offset,
        diversity,
        sort,
        captionKind
      });
      if (seq !== searchSeq.current) return;
      setResults(prev => opts.append ? [...prev, ...data.results] : data.results);
      setHasMore(data.page.hasMore);
      setSearchWarnings(data.warnings);
      setHasSearched(true);
      if (!opts.append) setActiveIndex(0);
    } catch (err: any) {
      if (seq !== searchSeq.current) return;
      setErrorMessage(err.message || 'Search failed');
      setResults([]);
      setHasMore(false);
      setHasSearched(true);
    } finally {
      if (seq === searchSeq.current) setIsLoading(false);
    }
  }, [captionKind, diversity, limit, query, selectedChannelIds, sort]);

  const scheduleSearch = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void runSearch(), 300);
  }, [runSearch]);

  useEffect(() => {
    if (selectedChannelIds.size > 0 && query.trim()) {
      scheduleSearch();
    } else {
      setResults([]);
      setHasMore(false);
      setHasSearched(false);
      setSearchWarnings([]);
      setErrorMessage(null);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [captionKind, diversity, limit, query, scheduleSearch, selectedChannelKey, selectedChannelIds.size, sort]);

  useEffect(() => {
    if (!activeResult) {
      setContextItems([]);
      return;
    }

    let cancelled = false;
    setContextLoading(true);
    getEnglishSentenceContext(
      activeResult.entry.channelId,
      activeResult.entry.sourceId,
      activeResult.entry.start,
      1
    )
      .then(data => {
        if (!cancelled) setContextItems(data.items);
      })
      .catch(() => {
        if (!cancelled) setContextItems([]);
      })
      .finally(() => {
        if (!cancelled) setContextLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeResult]);

  const toggleChannel = (channelId: string) => {
    setSelectedChannelIds(prev => {
      const next = new Set(prev);
      if (next.has(channelId)) next.delete(channelId);
      else next.add(channelId);
      return next;
    });
  };

  const selectAllChannels = () => setSelectedChannelIds(new Set(channels.map(c => c.channelId)));
  const clearChannels = () => setSelectedChannelIds(new Set());

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      window.setTimeout(() => setCopiedKey(null), 1600);
    } catch {
      setCopiedKey(null);
    }
  };

  const toggleSave = async (result: EnglishSentenceSearchResult) => {
    const key = resultKey(result);
    let stableId = resultStableIds.get(key);
    if (!stableId) {
      stableId = await computeStableId(result.entry);
      setResultStableIds(prev => new Map(prev).set(key, stableId!));
    }
    if (savedIds.has(stableId)) {
      try {
        await deleteSavedExample(stableId);
        setSavedIds(prev => { const n = new Set(prev); n.delete(stableId!); return n; });
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to unsave');
      }
    } else {
      try {
        const res = await saveEnglishExample(result, query);
        setResultStableIds(prev => new Map(prev).set(key, res.item.id));
        setSavedIds(prev => new Set(prev).add(res.item.id));
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to save');
      }
    }
  };

  const loadMore = () => {
    void runSearch({ append: true, offset: results.length });
  };

  const noChannelsSelected = selectedChannelIds.size === 0;

  return (
    <div className="mx-auto max-w-[1440px] px-0 py-2">
      <section className="grid gap-5 xl:grid-cols-[300px_minmax(420px,1fr)_420px]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                  <Search className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-semibold text-ink">English Search</h2>
                  <p className="truncate text-xs text-muted">{selectedChannels.length} channel{selectedChannels.length === 1 ? '' : 's'} selected</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setFiltersOpen(v => !v)}
                className="inline-flex items-center rounded-md border border-line bg-white p-2 text-ink lg:hidden"
                aria-label="Toggle filters"
              >
                {filtersOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
            </div>

            <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
              <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="english-query">
                Search
              </label>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  id="english-query"
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search a word or phrase"
                  className="h-11 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>

              <div className="mt-4 space-y-3">
                {QUICK_QUERY_GROUPS.map(group => (
                  <div key={group.label}>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{group.label}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {group.items.map(q => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setQuery(q)}
                          className={`rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
                            query.toLowerCase() === q.toLowerCase()
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-line bg-white text-ink hover:bg-slate-50'
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={`${filtersOpen ? 'block' : 'hidden'} space-y-4 lg:block`}>
            <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Results</p>
              <div className="mt-2 grid grid-cols-3 gap-1 rounded-md bg-slate-100 p-1">
                {RESULT_LIMITS.map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setLimit(value)}
                    className={`rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                      limit === value ? 'bg-white text-ink shadow-sm' : 'text-muted hover:bg-white'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="diversity">
                Diversity
              </label>
              <select id="diversity" value={diversity} onChange={e => setDiversity(e.target.value as EnglishSearchDiversity)} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink">
                <option value="balanced">Balanced</option>
                <option value="one_per_video">One per video</option>
                <option value="all">All matches</option>
              </select>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="sort">
                Sort
              </label>
              <select id="sort" value={sort} onChange={e => setSort(e.target.value as EnglishSearchSort)} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink">
                <option value="recent">Recent</option>
                <option value="variety">Variety</option>
              </select>

              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="caption-kind">
                Captions
              </label>
              <select id="caption-kind" value={captionKind} onChange={e => setCaptionKind(e.target.value as EnglishSearchCaptionKind)} className="mt-2 h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink">
                <option value="all">All</option>
                <option value="manual">Manual</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted">Channels</p>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllChannels} className="text-[10px] font-medium text-accent hover:underline">Select all</button>
                  <button type="button" onClick={clearChannels} className="text-[10px] font-medium text-muted hover:underline">Clear</button>
                </div>
              </div>
              {channels.length > 0 ? (
                <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                  {channels.map(ch => (
                    <label key={ch.channelId} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={selectedChannelIds.has(ch.channelId)}
                        onChange={() => toggleChannel(ch.channelId)}
                        className="h-4 w-4 rounded border-slate-300 text-ink focus:ring-accent"
                      />
                      <span className="min-w-0 flex-1 truncate text-ink">{ch.title}</span>
                      <span className="shrink-0 text-[10px] text-muted">{ch.indexedSentenceCount.toLocaleString()}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-muted">No indexed channels</p>
              )}
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-muted">Language</dt>
                  <dd className="mt-1 font-medium text-ink">English</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted">Sentences</dt>
                  <dd className="mt-1 font-medium text-ink">{totalSentences.toLocaleString()}</dd>
                </div>
              </dl>
            </div>
          </div>
        </aside>

        <main className="min-w-0 space-y-4">
          <div className="flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sentence queue</p>
              <h1 className="mt-1 text-2xl font-semibold text-ink">Search, listen, repeat</h1>
            </div>
            <p className="text-sm text-muted">
              {isLoading && results.length === 0 ? 'Searching indexed sentences' : hasSearched ? `Showing ${results.length} result${results.length === 1 ? '' : 's'}` : 'Search real spoken English'}
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errorMessage}</div>
          )}

          {searchWarnings.length > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{searchWarnings.join('; ')}</span>
            </div>
          )}

          {isLoading && results.length === 0 ? (
            <div className="rounded-lg border border-line bg-white px-6 py-14 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-accent" />
              <p className="mt-3 text-sm text-muted">Searching local sentence index</p>
            </div>
          ) : results.length > 0 ? (
            <>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <ResultCard
                    key={resultKey(result)}
                    result={result}
                    query={query}
                    index={index}
                    active={index === activeIndex}
                    copiedKey={copiedKey}
                    isSaved={isResultSaved(result)}
                    onSelect={() => setActiveIndex(index)}
                    onCopySentence={() => void copyText(`${resultKey(result)}:sentence`, result.entry.text)}
                    onCopyUrl={() => void copyText(`${resultKey(result)}:url`, result.youtubeTimestampUrl)}
                    onToggleSave={() => void toggleSave(result)}
                  />
                ))}
              </div>
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={loadMore}
                  disabled={!hasMore || isLoading}
                  className="inline-flex items-center gap-2 rounded-md border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {hasMore ? 'Load more' : 'No more results'}
                </button>
              </div>
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-line bg-white px-6 py-12 text-center">
              <Search className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-4 text-sm font-medium text-ink">
                {noChannelsSelected ? 'Select at least one channel to search' : query.trim() ? 'No matching sentences found' : 'Search real English examples'}
              </p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                {noChannelsSelected ? 'Check one or more indexed channels in the filters.' : 'Try a shorter phrase or one of the learning chunks.'}
              </p>
            </div>
          )}
        </main>

        <aside className="min-w-0">
          <PlayerPanel
            result={activeResult}
            nextEmbedUrl={nextEmbedUrl}
            contextItems={contextItems}
            contextLoading={contextLoading}
            isSaved={activeResult ? isResultSaved(activeResult) : false}
            canPrevious={activeIndex > 0}
            canNext={activeIndex < results.length - 1}
            onPrevious={() => setActiveIndex(i => Math.max(0, i - 1))}
            onNext={() => setActiveIndex(i => Math.min(results.length - 1, i + 1))}
            onCopySentence={() => activeResult && void copyText(`${resultKey(activeResult)}:sentence`, activeResult.entry.text)}
            onToggleSave={() => activeResult && void toggleSave(activeResult)}
          />
        </aside>
      </section>
    </div>
  );
}
