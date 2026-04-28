import { FileText, Play, RefreshCw, Loader2, Music, Mic, MoreVertical, Database, Download, Link2 } from 'lucide-react';
import { useState } from 'react';
import { ensureTranscript, fetchAudio, transcribeAudio, resolveMedia, downloadMedia } from '../api/client';
import type { TaskSummary } from '../types';

interface TaskCardProps {
  task: TaskSummary;
  onRefresh?: () => void;
  onRead?: (taskId: string) => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return 'Unknown length';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function statusLabel(status: TaskSummary['documentAssets']['status']): string {
  const labels: Record<string, string> = {
    empty: 'No transcript',
    metadata_only: 'Ready to process',
    raw_ready: 'Raw ready',
    refined_ready: 'Refined ready',
    markdown_ready: 'Markdown ready',
    enriched: 'Enriched',
    failed: 'Failed'
  };
  return labels[status] || status;
}

export function TaskCard({ task, onRefresh, onRead }: TaskCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const assets = task.documentAssets;
  const canRead = assets.status === 'markdown_ready' || assets.status === 'enriched';
  const canTranscribe = !canRead && assets.hasAudio;
  const canFetchAudio = !canRead && !assets.hasAudio && (task.platform === 'xiaoyuzhou' || !!task.metadata?.mediaUrl);
  
  // Media logic for video platforms
  const isVideoPlatform = task.platform === 'douyin' || task.platform === 'x' || task.platform === 'youtube';
  const canDownloadMedia = !canRead && !assets.hasMedia && isVideoPlatform;

  const handleAction = async () => {
    if (canRead) {
      onRead?.(task.id);
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      if (canTranscribe) {
        await transcribeAudio(task.id);
      } else if (canFetchAudio) {
        await fetchAudio(task.id);
      } else if (canDownloadMedia) {
        await downloadMedia(task.id);
      } else {
        await ensureTranscript(task.id);
      }
      onRefresh?.();
    } catch (error: any) {
      console.error('Processing failed:', error);
      setErrorMessage(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const getButtonContent = () => {
    if (isProcessing) return <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>;
    if (canRead) return <><Play className="h-4 w-4" /> Read Transcript</>;
    if (canTranscribe) return <><Mic className="h-4 w-4" /> Transcribe Audio</>;
    if (canFetchAudio) return <><Music className="h-4 w-4" /> Fetch Audio</>;
    if (canDownloadMedia) return <><Download className="h-4 w-4" /> Download Video</>;
    return <><RefreshCw className="h-4 w-4" /> Ensure Transcript</>;
  };

  return (
    <article className="panel overflow-hidden rounded-lg">
      <div className="aspect-video bg-slate-200">
        {task.thumbnailUrl ? (
          <img className="h-full w-full object-cover" src={task.thumbnailUrl} alt="" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">No cover</div>
        )}
      </div>
      <div className="space-y-4 p-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-muted">
            <span>{task.platform}</span>
            <span>{formatDuration(task.duration)}</span>
          </div>
          <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{task.title}</h2>
          {task.author ? <p className="mt-1 text-xs text-muted">{task.author}</p> : null}
        </div>

        <div className="rounded-md border border-line bg-slate-50 p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-ink">{statusLabel(assets.status)}</p>
              <p className="mt-1 text-xs text-muted">
                {assets.sentencesCount} sentences · {assets.hasAudio ? 'Audio fetched' : 'No audio'}
              </p>
            </div>
            <FileText className="h-4 w-4 text-accent" />
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-2 text-[10px] leading-relaxed text-red-700 border border-red-100">
            <strong>Error:</strong> {errorMessage}
          </div>
        )}

        <div className="flex gap-2">
          <button 
            onClick={handleAction}
            disabled={isProcessing}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {getButtonContent()}
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-md border border-line p-2 text-muted hover:bg-slate-50"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-48 rounded-md border border-line bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <button 
                  onClick={async () => {
                    setShowMenu(false);
                    setIsProcessing(true);
                    try {
                      await resolveMedia(task.id);
                      onRefresh?.();
                    } catch (e: any) { setErrorMessage(e.message); }
                    finally { setIsProcessing(false); }
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-ink hover:bg-slate-50"
                >
                  <Link2 className="h-3 w-3" /> Resolve Media
                </button>
                <button 
                  onClick={async () => {
                    setShowMenu(false);
                    setIsProcessing(true);
                    try {
                      await downloadMedia(task.id);
                      onRefresh?.();
                    } catch (e: any) { setErrorMessage(e.message); }
                    finally { setIsProcessing(false); }
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-ink hover:bg-slate-50"
                >
                  <Download className="h-3 w-3" /> Force Download
                </button>
                <button 
                  onClick={async () => {
                    setShowMenu(false);
                    setIsProcessing(true);
                    try {
                      await ensureTranscript(task.id);
                      onRefresh?.();
                    } catch (e: any) { setErrorMessage(e.message); }
                    finally { setIsProcessing(false); }
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-ink hover:bg-slate-50"
                >
                  <RefreshCw className="h-3 w-3" /> Force Pipeline
                </button>
                <button 
                  onClick={() => {
                    setShowMenu(false);
                    console.log('Metadata:', task.metadata);
                    alert('Check console for metadata');
                  }}
                  className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-ink hover:bg-slate-50"
                >
                  <Database className="h-3 w-3" /> View Metadata
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
