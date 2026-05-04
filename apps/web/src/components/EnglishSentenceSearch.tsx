import { useState, useEffect, useRef, useCallback } from 'react';
import { BookOpen, Captions, Check, Clock3, Copy, ExternalLink, Loader2, Play, Search } from 'lucide-react';
import { searchEnglishSentences } from '../api/client';
import type { EnglishSentenceSearchResult } from '../api/client';

const DEFAULT_CHANNEL_ID = 'youtube-UCxJGMJbjokfnr2-s4_RXPxQ';
const DEFAULT_CHANNEL_TITLE = 'Speak English With Vanessa';
const QUICK_QUERIES = ['would have', 'because', 'kind of', 'I mean', 'pronunciation'];
const RESULT_LIMITS = [10, 20, 30, 50];

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) => {
    const isMatch = part.toLowerCase() === query.toLowerCase();
    return isMatch
      ? <mark key={i} className="rounded-sm bg-amber-100 px-0.5 text-ink">{part}</mark>
      : part;
  });
}

function ResultCard({
  result,
  query,
  index,
  copiedUrl,
  onCopy
}: {
  result: EnglishSentenceSearchResult;
  query: string;
  index: number;
  copiedUrl: string | null;
  onCopy: (url: string) => void;
}) {
  const e = result.entry;
  const isCopied = copiedUrl === result.youtubeTimestampUrl;

  return (
    <article className="rounded-lg border border-line bg-white p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-muted">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base leading-8 text-ink sm:text-[17px]">
            {highlightMatch(e.text, query)}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
            <span className="inline-flex min-w-0 max-w-full items-center gap-1.5 font-medium text-ink">
              <BookOpen className="h-3.5 w-3.5 shrink-0 text-muted" />
              <span className="truncate">{e.title || 'Untitled video'}</span>
            </span>
            <span className="inline-flex items-center gap-1 font-mono text-accent">
              <Clock3 className="h-3.5 w-3.5" />
              {formatTime(e.start)}
            </span>
            <span className="inline-flex items-center gap-1 uppercase tracking-wide">
              <Captions className="h-3.5 w-3.5" />
              {e.captionKind === 'auto' ? 'auto caption' : e.captionKind || 'caption'} · {e.captionLanguage}
            </span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <a
              href={result.youtubeTimestampUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
            >
              <Play className="h-3.5 w-3.5" />
              Open at timestamp
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={() => onCopy(result.youtubeTimestampUrl)}
              className="inline-flex items-center gap-1.5 rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-slate-50"
            >
              {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {isCopied ? 'Copied' : 'Copy link'}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function SearchSummary({
  query,
  resultCount,
  isLoading,
  hasSearched
}: {
  query: string;
  resultCount: number;
  isLoading: boolean;
  hasSearched: boolean;
}) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        Searching indexed sentences
      </div>
    );
  }

  if (!hasSearched) {
    return <p className="text-sm text-muted">Choose an example or search a phrase from the Vanessa index.</p>;
  }

  return (
    <p className="text-sm text-muted">
      <span className="font-semibold text-ink">{resultCount}</span> result{resultCount === 1 ? '' : 's'} for{' '}
      <span className="font-medium text-ink">"{query}"</span>
    </p>
  );
}

function EmptyPanel({ query }: { query: string }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white px-6 py-12 text-center">
      <Search className="mx-auto h-8 w-8 text-muted" />
      <p className="mt-4 text-sm font-medium text-ink">
        {query.trim() ? 'No matching sentences found' : 'Search real English examples'}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {query.trim()
          ? 'Try a shorter phrase or one of the example searches.'
          : 'The first index contains Vanessa channel captions with timestamped sentence examples.'}
      </p>
    </div>
  );
}

export default function EnglishSentenceSearch() {
  const [query, setQuery] = useState('would have');
  const [limit, setLimit] = useState(20);
  const [results, setResults] = useState<EnglishSentenceSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const doSearch = useCallback(async (q: string, resultLimit = limit) => {
    if (!q.trim()) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await searchEnglishSentences(DEFAULT_CHANNEL_ID, q, resultLimit);
      setResults(data);
      setHasSearched(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Search failed');
      setResults([]);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  const scheduleSearch = (value: string, resultLimit = limit) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!value.trim()) {
      setResults([]);
      setHasSearched(false);
      setErrorMessage(null);
      return;
    }
    timerRef.current = setTimeout(() => doSearch(value, resultLimit), 300);
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    scheduleSearch(value);
  };

  const handleQuickQuery = (q: string) => {
    setQuery(q);
    if (timerRef.current) clearTimeout(timerRef.current);
    doSearch(q);
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    scheduleSearch(query, nextLimit);
  };

  const copyTimestampUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      window.setTimeout(() => setCopiedUrl(null), 1600);
    } catch {
      setCopiedUrl(null);
    }
  };

  useEffect(() => {
    void doSearch('would have', 20);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  return (
    <div className="mx-auto max-w-[1180px] px-0 py-2">
      <section className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100">
                <Search className="h-5 w-5 text-accent" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold text-ink">English Search</h2>
                <p className="truncate text-xs text-muted">{DEFAULT_CHANNEL_TITLE}</p>
              </div>
            </div>

            <label className="mt-5 block text-xs font-semibold uppercase tracking-wide text-muted" htmlFor="english-query">
              Search
            </label>
            <div className="relative mt-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input
                id="english-query"
                type="text"
                value={query}
                onChange={e => handleInputChange(e.target.value)}
                placeholder="Search a word or phrase"
                className="h-11 w-full rounded-md border border-line bg-white pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Examples</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_QUERIES.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handleQuickQuery(q)}
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

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Results</p>
              <div className="mt-2 grid grid-cols-4 gap-1 rounded-md bg-slate-100 p-1">
                {RESULT_LIMITS.map(value => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => handleLimitChange(value)}
                    className={`rounded px-2 py-1.5 text-xs font-medium transition-colors ${
                      limit === value ? 'bg-white text-ink shadow-sm' : 'text-muted hover:bg-white'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">Index</p>
            <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs text-muted">Channel</dt>
                <dd className="mt-1 font-medium text-ink">Vanessa</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Language</dt>
                <dd className="mt-1 font-medium text-ink">English</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Sources</dt>
                <dd className="mt-1 font-medium text-ink">20</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Sentences</dt>
                <dd className="mt-1 font-medium text-ink">3,246</dd>
              </div>
            </dl>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="mb-4 flex flex-col gap-2 border-b border-line pb-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Sentence examples</p>
              <h1 className="mt-1 text-2xl font-semibold text-ink">Search real spoken English</h1>
            </div>
            <SearchSummary
              query={query}
              resultCount={results.length}
              isLoading={isLoading}
              hasSearched={hasSearched}
            />
          </div>

          {errorMessage && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          {isLoading && results.length === 0 ? (
            <div className="rounded-lg border border-line bg-white px-6 py-14 text-center">
              <Loader2 className="mx-auto h-7 w-7 animate-spin text-accent" />
              <p className="mt-3 text-sm text-muted">Searching local sentence index</p>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              {results.map((r, i) => (
                <ResultCard
                  key={`${r.entry.sourceId}-${r.entry.start}-${i}`}
                  result={r}
                  query={query}
                  index={i}
                  copiedUrl={copiedUrl}
                  onCopy={copyTimestampUrl}
                />
              ))}
            </div>
          ) : (
            <EmptyPanel query={query} />
          )}
        </section>
      </section>
    </div>
  );
}
