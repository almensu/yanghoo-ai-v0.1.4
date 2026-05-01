import { FileText, Loader2, Play, Search, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { searchDocuments, type SearchResult } from '../api/client';

export interface SearchPreviewTarget {
  taskId: string;
  lineIndex: number;
  seconds?: number;
  query: string;
  documentLanguage: 'english' | 'chinese';
}

interface GlobalSearchProps {
  onPreview: (target: SearchPreviewTarget) => void;
}

export function GlobalSearch({ onPreview }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    window.setTimeout(() => inputRef.current?.focus(), 0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const trimmedQuery = query.trim();
    setActiveIndex(0);
    setErrorMessage(null);

    if (!trimmedQuery) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = window.setTimeout(async () => {
      try {
        const nextResults = await searchDocuments(trimmedQuery);
        setResults(nextResults);
      } catch (error: any) {
        console.error('Global search failed:', error);
        setErrorMessage(error.message || '搜索失败');
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => window.clearTimeout(timer);
  }, [isOpen, query]);

  const close = () => {
    setIsOpen(false);
    setErrorMessage(null);
  };

  const previewResult = (result: SearchResult) => {
    onPreview({
      taskId: result.sourceId,
      lineIndex: result.lineIndex,
      seconds: result.seconds,
      query,
      documentLanguage: result.language === 'zh-Hans' ? 'chinese' : 'english'
    });
    close();
  };

  const openPlayback = (result: SearchResult) => {
    if (!result.playbackUrl) return;
    window.open(result.playbackUrl, '_blank', 'noopener,noreferrer');
    close();
  };

  const activeResult = results[activeIndex];

  useEffect(() => {
    resultRefs.current[activeIndex]?.scrollIntoView({
      block: 'nearest'
    });
  }, [activeIndex]);

  const handlePanelKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      close();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex(index => Math.min(index + 1, Math.max(results.length - 1, 0)));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(index => Math.max(index - 1, 0));
      return;
    }

    if (event.key === 'Enter' && activeResult) {
      event.preventDefault();
      if ((event.metaKey || event.ctrlKey) && activeResult.playbackUrl) {
        openPlayback(activeResult);
      } else {
        previewResult(activeResult);
      }
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-between rounded-lg border border-line bg-white px-4 py-3 text-left shadow-sm transition-colors hover:bg-slate-50"
      >
        <span className="flex items-center gap-3 text-sm text-muted">
          <Search className="h-4 w-4" />
          搜索全部文档、标题、作者...
        </span>
        <span className="rounded border border-line bg-slate-50 px-2 py-1 text-[11px] font-medium text-muted">
          Cmd K
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-ink/40 p-4 backdrop-blur-sm" onKeyDown={handlePanelKeyDown}>
          <div className="mx-auto mt-[8vh] flex max-h-[78vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="模糊搜索文档内容..."
                className="flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
              />
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted" />}
              <button onClick={close} className="rounded p-1 text-muted hover:bg-slate-100">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-64 flex-1 overflow-y-auto p-2">
              {!query.trim() ? (
                <div className="flex h-56 items-center justify-center text-center text-sm text-muted">
                  输入关键词搜索所有已生成的 Markdown 文档。
                </div>
              ) : errorMessage ? (
                <div className="m-2 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{errorMessage}</div>
              ) : !isLoading && results.length === 0 ? (
                <div className="flex h-56 items-center justify-center text-center text-sm text-muted">
                  没有找到匹配结果。
                </div>
              ) : (
                <div className="space-y-1">
                  {results.map((result, index) => (
                    <div
                      key={`${result.sourceId}-${result.lineIndex}-${index}`}
                      ref={(element) => {
                        resultRefs.current[index] = element;
                      }}
                      className={`rounded-lg border px-3 py-3 transition-colors ${
                        index === activeIndex ? 'border-accent bg-blue-50' : 'border-transparent hover:bg-slate-50'
                      }`}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      <button
                        onClick={() => previewResult(result)}
                        className="block w-full text-left"
                      >
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                          <span>{result.platform}</span>
                          {result.timestamp && <span className="font-mono text-accent">{result.timestamp}</span>}
                          <span>{result.language === 'zh-Hans' ? '中文' : '原文'}</span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-sm font-semibold text-ink">{result.title}</p>
                        {result.author && <p className="mt-0.5 text-xs text-muted">{result.author}</p>}
                        <p className="mt-2 line-clamp-2 text-xs leading-5 text-ink">{result.snippet}</p>
                      </button>

                      <div className="mt-3 flex gap-2">
                        <button
                          onClick={() => previewResult(result)}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-xs font-medium text-ink hover:bg-slate-50"
                        >
                          <FileText className="h-3 w-3" />
                          预览
                        </button>
                        <button
                          onClick={() => openPlayback(result)}
                          disabled={!result.playbackUrl}
                          className="inline-flex items-center gap-1 rounded-md border border-line bg-white px-2 py-1 text-xs font-medium text-ink hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Play className="h-3 w-3" />
                          播放
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line px-4 py-2 text-[11px] text-muted">
              <span>Enter 预览 · Cmd/Ctrl+Enter 播放 · Esc 关闭</span>
              <span>↑ ↓ 选择</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
