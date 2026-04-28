import { useState, useEffect } from 'react';
import { TaskCard } from './components/TaskCard';
import { Reader } from './components/Reader';
import { listTasks } from './api/client';
import type { TaskSummary } from './types';

export function App() {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState('');
  const [readingTaskId, setReadingTaskId] = useState<string | null>(null);

  const refreshTasks = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listTasks();
      setTasks(data);
    } catch (err: any) {
      console.error('Refresh failed:', err);
      setError(err.message || 'Failed to connect to API');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  const handleImport = async () => {
    if (!url) return;
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sourceUrl: url })
      });
      if (response.ok) {
        setUrl('');
        refreshTasks();
      }
    } catch (error) {
      console.error('Import failed:', error);
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
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Paste YouTube URL..." 
              className="w-64 rounded-md border border-line px-3 py-2 text-sm"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button 
              onClick={handleImport}
              className="rounded-md bg-ink px-4 py-2 text-sm font-medium text-white"
            >
              Import Source
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Document Assets</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Import a video, prefer existing captions, fall back to mlx-audio, then generate timestamped reading assets.
          </p>
        </section>

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
                onRefresh={refreshTasks} 
                onRead={(id) => setReadingTaskId(id)}
              />
            ))}
          </section>
        )}
      </main>

      {readingTaskId && (
        <Reader taskId={readingTaskId} onClose={() => setReadingTaskId(null)} />
      )}
    </div>
  );
}
