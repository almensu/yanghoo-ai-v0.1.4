import { useState, useEffect } from 'react';
import { TaskCard } from './components/TaskCard';
import { Reader } from './components/Reader';
import { GlobalSearch, type SearchPreviewTarget } from './components/GlobalSearch';
import { exportNotebookLm, listTasks, openNotebookLmExport, type NotebookLmExportResult } from './api/client';
import type { TaskSummary } from './types';

export function App() {
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

  const refreshTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listTasks();
      setTasks(data);
      setSelectedTaskIds((current) => current.filter(id => data.some(task => task.id === id)));
    } catch (err: any) {
      console.error('Refresh failed:', err);
      setError(err.message || 'Failed to connect to API');
    } finally {
      setIsLoading(false);
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
  }, []);

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
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">Yanghoo AI v0.3.0</p>
            <h1 className="text-xl font-semibold text-ink">Transcript Workbench</h1>
          </div>
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
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Document Assets</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Import a video, prefer existing captions, fall back to mlx-audio, then generate timestamped reading assets.
          </p>
          <div className="mt-4 max-w-3xl">
            <GlobalSearch onPreview={setReadingTarget} />
          </div>
        </section>

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
              onClick={refreshTasks}
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
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
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
    </div>
  );
}
