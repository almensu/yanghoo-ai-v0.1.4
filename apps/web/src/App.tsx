import { useState, useEffect, useMemo, useRef } from 'react';
import { AlertCircle, CheckCircle2, Home, Loader2, User, X } from 'lucide-react';
import { TaskCard } from './components/TaskCard';
import { Reader } from './components/Reader';
import { GlobalSearch, type SearchPreviewTarget } from './components/GlobalSearch';
import EnglishSentenceSearch from './components/EnglishSentenceSearch';
import LearningChannelLibrary from './components/LearningChannelLibrary';
import {
  exportNotebookLm,
  listBackgroundJobs,
  listModels,
  listSourceCollections,
  listTasks,
  openNotebookLmExport,
  startTaskActionJob,
  type BackgroundJob,
  type LLMModel,
  type NotebookLmExportResult,
  type TaskJobAction,
  type TaskJobOptions
} from './api/client';
import type { SourceChannelCollectionSummary, TaskSummary } from './types';

interface CollectionNavigationProps {
  collections: SourceChannelCollectionSummary[];
  activeCollection: SourceChannelCollectionSummary | null;
  totalCount: number;
  onSelect: (collectionId: string | null) => void;
}

function CollectionAvatar({ collection }: { collection: SourceChannelCollectionSummary }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initial = collection.title.trim().charAt(0).toUpperCase() || collection.platform.charAt(0).toUpperCase();

  if (collection.thumbnailUrl && !imageFailed) {
    return (
      <img
        src={collection.thumbnailUrl}
        alt=""
        onError={() => setImageFailed(true)}
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }

  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-muted">
      {initial}
    </span>
  );
}

function CollectionHeroAvatar({ collection }: { collection: SourceChannelCollectionSummary }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (collection.thumbnailUrl && !imageFailed) {
    return (
      <img
        src={collection.thumbnailUrl}
        alt=""
        onError={() => setImageFailed(true)}
        className="h-full w-full object-cover"
      />
    );
  }

  return <User className="h-7 w-7 text-muted" />;
}

function CollectionSidebar({ collections, activeCollection, totalCount, onSelect }: CollectionNavigationProps) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-line pr-4 lg:block">
      <nav className="sticky top-6 space-y-5">
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
              !activeCollection ? 'bg-slate-100 text-ink' : 'text-ink hover:bg-slate-100'
            }`}
          >
            <Home className="h-4 w-4" />
            <span className="min-w-0 flex-1 truncate">全部来源</span>
            <span className="text-xs text-muted">{totalCount}</span>
          </button>
        </div>

        <div className="border-t border-line pt-4">
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted">频道</p>
          <div className="mt-2 max-h-[calc(100vh-180px)] space-y-1 overflow-y-auto pr-1">
            {collections.map((collection) => (
              <button
                key={collection.id}
                type="button"
                onClick={() => onSelect(collection.id)}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left transition-colors ${
                  activeCollection?.id === collection.id ? 'bg-slate-100 text-ink' : 'text-ink hover:bg-slate-100'
                }`}
              >
                <CollectionAvatar collection={collection} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{collection.title}</span>
                  <span className="mt-0.5 block truncate text-[11px] uppercase tracking-wide text-muted">
                    {collection.platform} · {collection.sourceCount}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </aside>
  );
}

function MobileCollectionRail({ collections, activeCollection, totalCount, onSelect }: CollectionNavigationProps) {
  if (!collections.length) return null;

  return (
    <div className="mt-5 lg:hidden">
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => onSelect(null)}
          className={`shrink-0 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
            !activeCollection ? 'bg-slate-900 text-white' : 'bg-white text-ink hover:bg-slate-100'
          }`}
        >
          全部 · {totalCount}
        </button>
        {collections.map((collection) => (
          <button
            key={collection.id}
            type="button"
            onClick={() => onSelect(collection.id)}
            className={`shrink-0 rounded-md px-3 py-2 text-left text-xs transition-colors ${
              activeCollection?.id === collection.id ? 'bg-slate-900 text-white' : 'bg-white text-ink hover:bg-slate-100'
            }`}
          >
            <span className="block max-w-44 truncate font-medium">{collection.title}</span>
            <span className={`mt-0.5 block text-[10px] uppercase tracking-wide ${
              activeCollection?.id === collection.id ? 'text-slate-300' : 'text-muted'
            }`}>
              {collection.platform} · {collection.sourceCount}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function isActiveJob(job: BackgroundJob): boolean {
  return job.status === 'queued' || job.status === 'running';
}

function mergeJobs(current: BackgroundJob[], incoming: BackgroundJob[]): BackgroundJob[] {
  const byId = new Map<string, BackgroundJob>();
  for (const job of current) byId.set(job.id, job);
  for (const job of incoming) byId.set(job.id, job);
  return Array.from(byId.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function JobToastStack({
  jobs,
  dismissedJobIds,
  onDismiss
}: {
  jobs: BackgroundJob[];
  dismissedJobIds: Set<string>;
  onDismiss: (jobId: string) => void;
}) {
  const visibleJobs = jobs
    .filter(job => !dismissedJobIds.has(job.id))
    .filter(job => isActiveJob(job) || job.status === 'succeeded' || job.status === 'failed')
    .slice(0, 4);

  if (!visibleJobs.length) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(360px,calc(100vw-2rem))] space-y-2">
      {visibleJobs.map((job) => {
        const isFailed = job.status === 'failed';
        const isSucceeded = job.status === 'succeeded';
        const Icon = isFailed ? AlertCircle : isSucceeded ? CheckCircle2 : Loader2;

        return (
          <div key={job.id} className="rounded-lg border border-line bg-white p-3 shadow-lg">
            <div className="flex items-start gap-3">
              <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${
                isFailed ? 'text-red-600' : isSucceeded ? 'text-emerald-600' : 'animate-spin text-accent'
              }`} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-sm font-semibold text-ink">
                    {isFailed ? `${job.label}失败` : isSucceeded ? `${job.label}完成` : `${job.label}中`}
                  </p>
                  <button
                    type="button"
                    onClick={() => onDismiss(job.id)}
                    className="rounded p-1 text-muted hover:bg-slate-100"
                    aria-label="关闭任务通知"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-1 truncate text-xs text-muted">{job.message}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        isFailed ? 'bg-red-500' : isSucceeded ? 'bg-emerald-500' : 'bg-accent'
                      }`}
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-[11px] font-medium text-muted">{job.progress}%</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function App() {
  type View = 'workbench' | 'channels' | 'english-search';
  const [activeView, setActiveView] = useState<View>('workbench');
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [url, setUrl] = useState('');
  const [readingTarget, setReadingTarget] = useState<SearchPreviewTarget | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [isOpeningExport, setIsOpeningExport] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [exportResult, setExportResult] = useState<NotebookLmExportResult | null>(null);
  const [translationModels, setTranslationModels] = useState<LLMModel[]>([]);
  const [sourceCollections, setSourceCollections] = useState<SourceChannelCollectionSummary[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [dismissedJobIds, setDismissedJobIds] = useState<Set<string>>(new Set());
  const completedJobIdsRef = useRef<Set<string>>(new Set());

  const refreshTasks = async (options: { showLoading?: boolean } = {}) => {
    const showLoading = options.showLoading ?? true;
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const [taskData, collectionData] = await Promise.all([
        listTasks(),
        listSourceCollections()
      ]);
      setTasks(taskData);
      setSourceCollections(collectionData);
      setSelectedTaskIds((current) => current.filter(id => taskData.some(task => task.id === id)));
      setActiveCollectionId((current) => {
        if (!current) return current;
        return collectionData.some(collection => collection.id === current) ? current : null;
      });
    } catch (err: any) {
      console.error('Refresh failed:', err);
      setError(err.message || 'Failed to connect to API');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  const updateTaskSelection = (taskId: string, selected: boolean) => {
    setSelectedTaskIds((current) => {
      if (selected) return current.includes(taskId) ? current : [...current, taskId];
      return current.filter(id => id !== taskId);
    });
    setExportError(null);
  };

  const runNotebookLmExport = async (mode: 'markdown' | 'url-list') => {
    if (!selectedTaskIds.length || isExporting) return;
    setIsExporting(true);
    setExportError(null);
    setExportResult(null);
    try {
      const result = await exportNotebookLm(selectedTaskIds, mode);
      setExportResult(result);
    } catch (error: any) {
      console.error('NotebookLM export failed:', error);
      setExportError(error.message || 'NotebookLM export failed');
    } finally {
      setIsExporting(false);
    }
  };

  const openExportDir = async () => {
    if (!exportResult) return;
    setIsOpeningExport(true);
    setExportError(null);
    try {
      await openNotebookLmExport(exportResult.exportId);
    } catch (error: any) {
      console.error('Open NotebookLM export failed:', error);
      setExportError(error.message || 'Open NotebookLM export failed');
    } finally {
      setIsOpeningExport(false);
    }
  };

  useEffect(() => {
    refreshTasks();
    listBackgroundJobs()
      .then((jobData) => setJobs(jobData))
      .catch((error) => console.error('Load background jobs failed:', error));

    async function loadTranslationModels() {
      try {
        const models = await listModels();
        setTranslationModels(models.filter(model => model.provider === 'mlx-lm' && model.id.includes('Qwen3')));
      } catch (error) {
        console.error('Load translation models failed:', error);
      }
    }
    loadTranslationModels();
  }, []);

  const activeJobs = useMemo(() => jobs.filter(isActiveJob), [jobs]);

  useEffect(() => {
    if (!activeJobs.length) return;

    const interval = window.setInterval(async () => {
      try {
        const nextJobs = await listBackgroundJobs();
        setJobs((current) => mergeJobs(current, nextJobs));
      } catch (error) {
        console.error('Poll background jobs failed:', error);
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [activeJobs.length]);

  useEffect(() => {
    const newlyFinished = jobs.filter(job => !isActiveJob(job) && !completedJobIdsRef.current.has(job.id));
    if (!newlyFinished.length) return;

    for (const job of newlyFinished) {
      completedJobIdsRef.current.add(job.id);
    }

    refreshTasks({ showLoading: false });
  }, [jobs]);

  const activeCollection = useMemo(
    () => sourceCollections.find(collection => collection.id === activeCollectionId) || null,
    [sourceCollections, activeCollectionId]
  );

  const collectionIdByTaskId = useMemo(() => {
    const map = new Map<string, string>();
    for (const collection of sourceCollections) {
      for (const sourceId of collection.sourceIds) {
        map.set(sourceId, collection.id);
      }
    }
    return map;
  }, [sourceCollections]);

  const visibleTasks = useMemo(() => {
    if (!activeCollection) return tasks;
    const sourceIds = new Set(activeCollection.sourceIds);
    return tasks.filter(task => sourceIds.has(task.id));
  }, [tasks, activeCollection]);

  const jobByTaskId = useMemo(() => {
    const map = new Map<string, BackgroundJob>();
    for (const job of jobs) {
      if (dismissedJobIds.has(job.id)) continue;
      if (isActiveJob(job) && !map.has(job.taskId)) {
        map.set(job.taskId, job);
      }
    }
    return map;
  }, [jobs, dismissedJobIds]);

  const startCardJob = async (taskId: string, action: TaskJobAction, options: TaskJobOptions = {}) => {
    const job = await startTaskActionJob(taskId, action, options);
    setDismissedJobIds((current) => {
      const next = new Set(current);
      next.delete(job.id);
      return next;
    });
    setJobs((current) => mergeJobs(current, [job]));
  };

  const handleImport = async () => {
    if (!url || isImporting) return;
    setIsImporting(true);
    setImportError(null);
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: url })
      });
      if (response.ok) {
        setUrl('');
        refreshTasks();
      } else {
        const data = await response.json();
        setImportError(data.message || 'Import failed');
      }
    } catch (error: any) {
      console.error('Import failed:', error);
      setImportError(error.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Yanghoo AI v0.3.0</p>
              <h1 className="text-xl font-semibold text-ink">Transcript Workbench</h1>
            </div>
            <div className="inline-flex w-fit rounded-md border border-line bg-slate-50 p-0.5 sm:ml-4">
              <button
                onClick={() => setActiveView('workbench')}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${activeView === 'workbench' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:bg-white'}`}
              >
                Tasks
              </button>
              <button
                onClick={() => setActiveView('channels')}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${activeView === 'channels' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:bg-white'}`}
              >
                Channels
              </button>
              <button
                onClick={() => setActiveView('english-search')}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${activeView === 'english-search' ? 'bg-white text-ink shadow-sm' : 'text-muted hover:bg-white'}`}
              >
                English Search
              </button>
            </div>
          </div>
          {activeView === 'workbench' && (
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="粘贴链接或分享文本..." 
                className="w-80 rounded-md border border-line px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isImporting}
              />
              <button 
                onClick={handleImport}
                disabled={isImporting || !url}
                className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {isImporting ? 'Importing...' : 'Import'}
              </button>
            </div>
            {importError && (
              <p className="text-[10px] text-red-500 font-medium">{importError}</p>
            )}
          </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6">
        {activeView === 'english-search' ? (
          <EnglishSentenceSearch />
        ) : activeView === 'channels' ? (
          <LearningChannelLibrary />
        ) : (
        <div className="flex gap-6">
        <CollectionSidebar
          collections={sourceCollections}
          activeCollection={activeCollection}
          totalCount={tasks.length}
          onSelect={setActiveCollectionId}
        />

        <div className="min-w-0 flex-1">
          <section className="mb-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Document Assets</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Import a video, prefer existing captions, fall back to mlx-audio, then generate timestamped reading assets.
            </p>
            <div className="mt-4 max-w-3xl">
              <GlobalSearch onPreview={setReadingTarget} />
            </div>

            <MobileCollectionRail
              collections={sourceCollections}
              activeCollection={activeCollection}
              totalCount={tasks.length}
              onSelect={setActiveCollectionId}
            />
          </section>

          {activeCollection && (
            <section className="mb-6 border-b border-line pb-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-slate-100">
                    <CollectionHeroAvatar collection={activeCollection} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">{activeCollection.platform} 频道</p>
                    <h2 className="mt-1 text-lg font-semibold text-ink">{activeCollection.title}</h2>
                    <p className="mt-1 text-sm text-muted">
                      {activeCollection.sourceCount} 个已捕获来源。这里显示当前本地已有的视频、播客或帖子。
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCollectionId(null)}
                  className="w-fit rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50"
                >
                  返回全部
                </button>
              </div>
            </section>
          )}

          {selectedTaskIds.length > 0 && (
            <section className="mb-6 rounded-lg border border-line bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-ink">已选择 {selectedTaskIds.length} 个卡片</p>
                <p className="mt-1 text-xs text-muted">导出给 NotebookLM：Markdown 中文优先，URL 为卡片自身链接。</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runNotebookLmExport('markdown')}
                  disabled={isExporting}
                  className="rounded-md bg-ink px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {isExporting ? '导出中...' : '导出 MD'}
                </button>
                <button
                  onClick={() => runNotebookLmExport('url-list')}
                  disabled={isExporting}
                  className="rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50 disabled:opacity-50"
                >
                  导出 URL
                </button>
                <button
                  onClick={() => {
                    setSelectedTaskIds([]);
                    setExportResult(null);
                    setExportError(null);
                  }}
                  disabled={isExporting}
                  className="rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-muted hover:bg-slate-50 disabled:opacity-50"
                >
                  清除选择
                </button>
              </div>
            </div>

            {exportError && (
              <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{exportError}</p>
            )}

            {exportResult && (
              <div className="mt-4 rounded-md bg-slate-50 p-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ink">
                      已导出 {exportResult.files.filter(file => file.kind !== 'manifest').length} 个文件
                      {exportResult.skipped.length ? `，跳过 ${exportResult.skipped.length} 个` : ''}
                    </p>
                    <p className="mt-1 break-all font-mono text-[11px] text-muted">{exportResult.exportDir}</p>
                  </div>
                  <button
                    onClick={openExportDir}
                    disabled={isOpeningExport}
                    className="w-fit rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50 disabled:opacity-50"
                  >
                    {isOpeningExport ? '打开中...' : '打开文件夹'}
                  </button>
                </div>
                {exportResult.skipped.length > 0 && (
                  <ul className="mt-3 space-y-1 text-[11px] text-muted">
                    {exportResult.skipped.map(item => (
                      <li key={item.sourceId}>{item.sourceId}: {item.reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        )}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm font-medium text-red-800">Connection Error</p>
            <p className="mt-1 text-xs text-red-600">{error}</p>
            <button 
              onClick={() => refreshTasks()}
              className="mt-4 rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        ) : isLoading ? (
          <p className="text-sm text-muted">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-line p-12 text-center">
            <p className="text-sm font-medium text-ink">No sources captured yet</p>
            <p className="mt-1 text-xs text-muted">Paste a YouTube URL above to get started.</p>
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-line p-12 text-center">
            <p className="text-sm font-medium text-ink">这个频道暂无可显示来源</p>
            <button
              type="button"
              onClick={() => setActiveCollectionId(null)}
              className="mt-3 rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50"
            >
              返回全部
            </button>
          </div>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleTasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                translationModels={translationModels}
                collectionId={collectionIdByTaskId.get(task.id)}
                onOpenCollection={setActiveCollectionId}
                runningJob={jobByTaskId.get(task.id)}
                onStartJob={startCardJob}
                isSelected={selectedTaskIds.includes(task.id)}
                onSelectionChange={updateTaskSelection}
                onRefresh={refreshTasks} 
                onRead={(id) => setReadingTarget({ taskId: id, lineIndex: -1, query: '', documentLanguage: 'english' })}
                onDelete={(id) => {
                  if (readingTarget?.taskId === id) setReadingTarget(null);
                  setSelectedTaskIds((current) => current.filter(taskId => taskId !== id));
                  refreshTasks();
                }}
              />
            ))}
          </section>
        )}
        </div>
        </div>
        )}
      </main>

      {readingTarget && (
        <Reader
          taskId={readingTarget.taskId}
          initialLineIndex={readingTarget.lineIndex}
          highlightQuery={readingTarget.query}
          initialDocumentLanguage={readingTarget.documentLanguage}
          onClose={() => setReadingTarget(null)}
        />
      )}
      <JobToastStack
        jobs={jobs}
        dismissedJobIds={dismissedJobIds}
        onDismiss={(jobId) => setDismissedJobIds((current) => new Set(current).add(jobId))}
      />
    </div>
  );
}
