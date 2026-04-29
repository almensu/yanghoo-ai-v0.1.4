import { 
  FileText, 
  Play, 
  RefreshCw, 
  Loader2, 
  Music, 
  Mic, 
  MoreVertical, 
  Database, 
  Download, 
  Link2,
  Captions
} from 'lucide-react';
import { useState } from 'react';
import { ensureTranscript, fetchAudio, transcribeAudio, resolveMedia, downloadMedia, transcribeMedia } from '../api/client';
import type { TaskSummary } from '../types';

interface TaskCardProps {
  task: TaskSummary;
  onRefresh?: () => void;
  onRead?: (taskId: string) => void;
}

function formatDuration(seconds?: number): string {
  if (!seconds) return '时长未知';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function statusLabel(status: TaskSummary['documentAssets']['status']): string {
  const labels: Record<string, string> = {
    empty: '无字幕',
    metadata_only: '待处理',
    raw_ready: '原始字幕就绪',
    refined_ready: '精修字幕就绪',
    markdown_ready: '文档就绪',
    enriched: '文档已增强',
    failed: '处理失败'
  };
  return labels[status] || status;
}

function transcriptSourceLabel(source: TaskSummary['documentAssets']['source']): string {
  const labels: Record<string, string> = {
    platform_caption: '平台字幕',
    vtt: 'VTT 文件',
    srt: 'SRT 文件',
    mlx_audio: 'MLX 音频转写',
    manual: '手动上传',
    none: '无'
  };
  return labels[source] || source;
}

export function TaskCard({ task, onRefresh, onRead }: TaskCardProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const assets = task.documentAssets;
  const isProcessing = !!activeAction;
  
  const canRead = assets.status === 'markdown_ready' || assets.status === 'enriched';
  
  // Action Rules
  const isVideoPlatform = task.platform === 'douyin' || task.platform === 'x' || task.platform === 'youtube' || task.platform === 'xiaohongshu' || task.platform === 'bilibili';
  const isPodcastPlatform = task.platform === 'xiaoyuzhou' || task.platform === 'apple_podcast' || task.sourceClass === 'podcast_audio';
  
  const hasAudioUrl = !!(task.audioUrl || task.metadata?.mediaUrl);

  const runAction = async (actionId: string, fn: () => Promise<any>) => {
    setActiveAction(actionId);
    setErrorMessage(null);
    try {
      await fn();
      onRefresh?.();
    } catch (error: any) {
      console.error(`${actionId} failed:`, error);
      setErrorMessage(error.message);
    } finally {
      setActiveAction(null);
    }
  };

  // Decide what to show
  let primaryAction: { label: string; id: string; icon: any; fn: () => Promise<any>; disabled?: boolean; isPrimary?: boolean } | null = null;
  const secondaryActions: { label: string; id: string; icon: any; fn: () => Promise<any> }[] = [];

  if (canRead) {
    primaryAction = { label: '阅读', id: 'read', icon: Play, fn: async () => onRead?.(task.id), isPrimary: true };
  } else if (isVideoPlatform) {
    if (!assets.hasMedia) {
      primaryAction = { 
        label: activeAction === 'downloadVideo' ? '下载中...' : '下载视频', 
        id: 'downloadVideo', 
        icon: activeAction === 'downloadVideo' ? Loader2 : Download, 
        fn: () => downloadMedia(task.id),
        isPrimary: true,
        disabled: isProcessing
      };
    } else if (assets.mediaHasAudio === false) {
      primaryAction = {
        label: '无音轨，不能转字幕',
        id: 'noAudio',
        icon: Mic,
        fn: async () => {},
        isPrimary: false,
        disabled: true
      };
    } else {
      primaryAction = { 
        label: activeAction === 'transcribeVideo' ? '转写中...' : '视频转字幕', 
        id: 'transcribeVideo', 
        icon: activeAction === 'transcribeVideo' ? Loader2 : Mic, 
        fn: () => transcribeMedia(task.id),
        isPrimary: true,
        disabled: isProcessing
      };
    }
  } else if (isPodcastPlatform || hasAudioUrl) {
    if (!assets.hasAudio) {
      primaryAction = { 
        label: activeAction === 'fetchAudio' ? '下载中...' : '下载音频', 
        id: 'fetchAudio', 
        icon: activeAction === 'fetchAudio' ? Loader2 : Download, 
        fn: () => fetchAudio(task.id),
        isPrimary: true,
        disabled: isProcessing
      };
    } else {
      primaryAction = { 
        label: activeAction === 'transcribe' ? '转写中...' : '音频转字幕', 
        id: 'transcribe', 
        icon: activeAction === 'transcribe' ? Loader2 : Mic, 
        fn: () => transcribeAudio(task.id),
        isPrimary: true,
        disabled: isProcessing
      };
    }
  } else if (task.platform === 'youtube') {
    // Fallback for YouTube captions if no media download is preferred
    primaryAction = { 
      label: activeAction === 'loadCaptions' ? '载入中...' : '载字幕', 
      id: 'loadCaptions', 
      icon: activeAction === 'loadCaptions' ? Loader2 : Captions, 
      fn: () => ensureTranscript(task.id),
      isPrimary: true,
      disabled: isProcessing
    };
  }

  return (
    <article className="panel overflow-hidden rounded-lg">
      <div className="aspect-video bg-slate-200">
        {task.thumbnailUrl ? (
          <img className="h-full w-full object-cover" src={task.thumbnailUrl} alt="" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">无封面</div>
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
                {assets.sentencesCount} 句 · {transcriptSourceLabel(assets.source)}
              </p>
              <p className="mt-0.5 text-[10px] text-muted opacity-80">
                {assets.hasMedia ? `视频已下载 (${assets.mediaKind}) ` : (assets.hasAudio ? '音频已下载 ' : '媒体未下载')}
                {assets.mediaHasAudio === false && '· 无音轨'}
                {assets.mediaStatus === 'failed' && ' · 下载失败'}
              </p>
              {assets.notTranscribableReason && assets.status !== 'markdown_ready' && (
                <p className="mt-0.5 text-[10px] text-red-500 italic">{assets.notTranscribableReason}</p>
              )}
            </div>
            <FileText className="h-4 w-4 text-accent" />
          </div>
        </div>

        {errorMessage && (
          <div className="rounded-md bg-red-50 p-2 text-[10px] leading-relaxed text-red-700 border border-red-100">
            <strong>错误:</strong> {errorMessage}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {/* Action Row */}
          <div className="flex gap-2">
            {primaryAction && (() => {
              const Icon = primaryAction.icon;
              const isSpinning = primaryAction.id === 'loadCaptions' || (isProcessing && activeAction === primaryAction.id);
              
              return (
                <button 
                  onClick={() => {
                    if (primaryAction!.id === 'read') {
                      onRead?.(task.id);
                    } else {
                      runAction(primaryAction!.id, primaryAction!.fn);
                    }
                  }}
                  disabled={primaryAction.disabled}
                  className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    primaryAction.isPrimary ? 'bg-accent text-white hover:bg-blue-700' : 'border border-line bg-white text-ink hover:bg-slate-50'
                  } disabled:opacity-50`}
                >
                  <Icon className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />
                  {primaryAction.label}
                </button>
              );
            })()}

            <div className="relative">
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-md border border-line p-2 text-muted hover:bg-slate-50 h-full"
              >
                <MoreVertical className="h-4 w-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 bottom-full mb-2 w-48 rounded-md border border-line bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      runAction('resolve', () => resolveMedia(task.id));
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-ink hover:bg-slate-50"
                  >
                    <Link2 className="h-3 w-3" /> 解析媒体
                  </button>
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      runAction('forceDownload', () => downloadMedia(task.id));
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-ink hover:bg-slate-50"
                  >
                    <Download className="h-3 w-3" /> 强制下载
                  </button>
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      runAction('forceTranscribeVideo', () => transcribeMedia(task.id));
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-ink hover:bg-slate-50"
                  >
                    <RefreshCw className="h-3 w-3" /> 强制处理
                  </button>
                  <div className="my-1 border-t border-line" />
                  <button 
                    onClick={() => {
                      setShowMenu(false);
                      console.log('Metadata:', task.metadata);
                      alert('已在控制台打印元数据');
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-ink hover:bg-slate-50"
                  >
                    <Database className="h-3 w-3" /> 查看元数据
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
