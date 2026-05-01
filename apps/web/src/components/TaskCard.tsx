import {
  FileText,
  Play,
  Loader2,
  Download,
  Mic,
  MoreVertical,
  Trash2,
  Captions,
  Languages
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { ensureTranscript, fetchAudio, transcribeAudio, downloadMedia, transcribeMedia, deleteTask, translateDocument } from '../api/client';
import type { LLMModel } from '../api/client';
import type { TaskSummary } from '../types';

interface TaskCardProps {
  task: TaskSummary;
  onRefresh?: () => void;
  onRead?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  isSelected?: boolean;
  onSelectionChange?: (taskId: string, selected: boolean) => void;
  translationModels?: LLMModel[];
}

const DEFAULT_TRANSLATION_MODELS: LLMModel[] = [
  { id: 'Qwen/Qwen3-4B-MLX-4bit', name: 'Qwen3 4B (4-bit)', provider: 'mlx-lm' },
  { id: 'Qwen/Qwen3-8B-MLX-4bit', name: 'Qwen3 8B (4-bit)', provider: 'mlx-lm' }
];

function TaskThumbnail({ src, platform }: { src?: string, platform: string }) {
  const [error, setError] = useState(false);

  if (!src || error) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-100 text-[10px] text-muted uppercase tracking-widest">
        {platform} COVER
      </div>
    );
  }

  return (
    <img
      className="h-full w-full object-cover"
      src={src}
      alt=""
      onError={() => setError(true)}
    />
  );
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

function translationModelLabel(models: LLMModel[], modelId: string): string {
  return models.find(model => model.id === modelId)?.name || modelId;
}

export function TaskCard({ task, onRefresh, onRead, onDelete, isSelected = false, onSelectionChange, translationModels = [] }: TaskCardProps) {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [translationModelId, setTranslationModelId] = useState(DEFAULT_TRANSLATION_MODELS[0].id);

  const assets = task.documentAssets;
  const isProcessing = !!activeAction;
  const canRead = assets.status === 'markdown_ready' || assets.status === 'enriched';

  // Platform classification
  const isShortVideoPlatform = task.platform === 'douyin' || task.platform === 'x' || task.platform === 'xiaohongshu' || task.platform === 'bilibili' || task.platform === 'tiktok';
  const isYouTube = task.platform === 'youtube';
  const isPodcastPlatform = task.platform === 'xiaoyuzhou' || task.platform === 'apple_podcast' || task.sourceClass === 'podcast_audio';
  const hasAudioUrl = !!(task.audioUrl || task.metadata?.mediaUrl);
  const youtubeKnownNoCaptions = isYouTube && task.metadata?.hasCaptionTracks === false;
  const youtubeNeedsAudioFallback = isYouTube && !canRead && (
    youtubeKnownNoCaptions ||
    assets.needsMediaTranscriptionFallback ||
    assets.transcriptFallback === 'audio_transcription'
  );
  const availableTranslationModels = translationModels.length ? translationModels : DEFAULT_TRANSLATION_MODELS;

  useEffect(() => {
    if (!availableTranslationModels.some(model => model.id === translationModelId)) {
      setTranslationModelId(availableTranslationModels[0].id);
    }
  }, [availableTranslationModels, translationModelId]);

  const runAction = async (actionId: string, fn: () => Promise<any>) => {
    setActiveAction(actionId);
    setErrorMessage(null);
    try {
      await fn();
      onRefresh?.();
    } catch (error: any) {
      console.error(`${actionId} failed:`, error);
      setErrorMessage(error.message);
      onRefresh?.();
    } finally {
      setActiveAction(null);
    }
  };

  const handleDeleteCard = async () => {
    const confirmed = window.confirm(`删除这个卡片和所有本地资产？\n\n卡片和已下载/生成的资产都会被删除。`);
    if (!confirmed) return;

    await runAction('deleteCard', async () => {
      await deleteTask(task.id);
      onDelete?.(task.id);
    });
  };

  const handleTranslate = async () => {
    setShowMenu(false);
    if (assets.hasTranslation) {
      const confirmed = window.confirm(`使用 ${translationModelLabel(availableTranslationModels, translationModelId)} 重新生成中文译文？\n\n现有中文译文会被覆盖。`);
      if (!confirmed) return;
    }

    await runAction('translate', () => translateDocument(task.id, {
      modelId: translationModelId,
      force: assets.hasTranslation
    }));
  };

  // Decide the primary action
  let primaryAction: { label: string; id: string; icon: any; fn: () => Promise<any>; disabled?: boolean; variant?: 'primary' | 'default' | 'danger' } | null = null;

  if (canRead) {
    primaryAction = { label: '阅读', id: 'read', icon: Play, fn: async () => { onRead?.(task.id); }, variant: 'primary' };
  } else if (youtubeNeedsAudioFallback) {
    // YouTube without platform captions: download audio directly, then transcribe.
    if (!assets.hasAudio) {
      primaryAction = {
        label: activeAction === 'fetchAudio' ? '下载中...' : '下载音频',
        id: 'fetchAudio',
        icon: activeAction === 'fetchAudio' ? Loader2 : Download,
        fn: () => fetchAudio(task.id),
        variant: 'primary',
        disabled: isProcessing
      };
    } else {
      primaryAction = {
        label: activeAction === 'transcribe' ? '转录中...' : '转录',
        id: 'transcribe',
        icon: activeAction === 'transcribe' ? Loader2 : Mic,
        fn: () => transcribeAudio(task.id),
        variant: 'primary',
        disabled: isProcessing
      };
    }
  } else if (isYouTube) {
    // YouTube: download platform captions first via Baoyu/InnerTube.
    primaryAction = {
      label: activeAction === 'downloadCaptions' ? '下载中...' : '下载字幕',
      id: 'downloadCaptions',
      icon: activeAction === 'downloadCaptions' ? Loader2 : Captions,
      fn: () => ensureTranscript(task.id),
      variant: 'primary',
      disabled: isProcessing
    };
  } else if (isShortVideoPlatform) {
    // X / XHS / Douyin / Bilibili: 下载视频 -> 转录
    if (!assets.hasMedia) {
      primaryAction = {
        label: activeAction === 'downloadVideo' ? '下载中...' : '下载视频',
        id: 'downloadVideo',
        icon: activeAction === 'downloadVideo' ? Loader2 : Download,
        fn: () => downloadMedia(task.id),
        variant: 'primary',
        disabled: isProcessing
      };
    } else if (assets.mediaHasAudio === false) {
      primaryAction = {
        label: assets.notTranscribableReason || '无音轨，不能转字幕',
        id: 'noAudio',
        icon: Mic,
        fn: async () => {},
        disabled: true
      };
    } else {
      primaryAction = {
        label: activeAction === 'transcribe' ? '转录中...' : '转录',
        id: 'transcribe',
        icon: activeAction === 'transcribe' ? Loader2 : Mic,
        fn: () => transcribeMedia(task.id),
        variant: 'primary',
        disabled: isProcessing
      };
    }
  } else if (isPodcastPlatform || hasAudioUrl) {
    // Podcasts: 下载音频 -> 转录
    if (!assets.hasAudio) {
      primaryAction = {
        label: activeAction === 'fetchAudio' ? '下载中...' : '下载音频',
        id: 'fetchAudio',
        icon: activeAction === 'fetchAudio' ? Loader2 : Download,
        fn: () => fetchAudio(task.id),
        variant: 'primary',
        disabled: isProcessing
      };
    } else {
      primaryAction = {
        label: activeAction === 'transcribe' ? '转录中...' : '转录',
        id: 'transcribe',
        icon: activeAction === 'transcribe' ? Loader2 : Mic,
        fn: () => transcribeAudio(task.id),
        variant: 'primary',
        disabled: isProcessing
      };
    }
  }

  return (
    <article className={`panel relative overflow-hidden rounded-lg ${isSelected ? 'ring-2 ring-accent' : ''}`}>
      <label className="absolute left-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-md border border-white/80 bg-white/95 shadow-sm">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(event) => onSelectionChange?.(task.id, event.target.checked)}
          className="h-4 w-4 rounded border-line accent-blue-600"
          aria-label={`选择 ${task.title || task.id}`}
        />
      </label>
      <div className="aspect-video bg-slate-200">
        <TaskThumbnail src={task.thumbnailUrl} platform={task.platform} />
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
                {assets.sentencesCount} 句 · {youtubeNeedsAudioFallback ? '待音频转录' : transcriptSourceLabel(assets.source)}
              </p>
              <p className="mt-0.5 text-[10px] text-muted opacity-80">
                {youtubeNeedsAudioFallback && !assets.hasAudio
                  ? '无平台字幕，需下载音频转录'
                  : (assets.hasMedia ? `视频已下载 (${assets.mediaKind}) ` : (assets.hasAudio ? '音频已下载 ' : '媒体未下载'))}
                {assets.mediaHasAudio === false && '· 无音轨'}
                {assets.mediaStatus === 'failed' && ' · 下载失败'}
                {assets.hasTranslation && ' · 已翻译'}
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
        {!errorMessage && assets.audioErrorMessage && (
          <div className="rounded-md bg-red-50 p-2 text-[10px] leading-relaxed text-red-700 border border-red-100">
            {assets.audioErrorMessage}
          </div>
        )}
        {!errorMessage && !youtubeNeedsAudioFallback && assets.transcriptErrorMessage && (
          <div className="rounded-md bg-red-50 p-2 text-[10px] leading-relaxed text-red-700 border border-red-100">
            {assets.transcriptErrorMessage}
          </div>
        )}

        <div className="flex gap-2">
          {primaryAction && (() => {
            const Icon = primaryAction.icon;
            const isSpinning = isProcessing && activeAction === primaryAction.id;

            return (
              <button
                onClick={() => runAction(primaryAction!.id, primaryAction!.fn)}
                disabled={primaryAction.disabled}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  primaryAction.variant === 'primary'
                    ? 'bg-accent text-white hover:bg-blue-700'
                    : primaryAction.variant === 'danger'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'border border-line bg-white text-ink hover:bg-slate-50'
                } disabled:opacity-50`}
              >
                <Icon className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />
                {activeAction === 'deleteCard' ? '删除中...' : primaryAction.label}
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
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 bottom-full mb-2 w-64 rounded-md border border-line bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 z-20">
                  {canRead && (
                    <div className="space-y-2 rounded px-2 py-2">
                      <label className="block text-[11px] font-medium text-muted">翻译模型</label>
                      <select
                        value={translationModelId}
                        onChange={(event) => setTranslationModelId(event.target.value)}
                        disabled={isProcessing}
                        className="w-full rounded-md border border-line bg-white px-2 py-1.5 text-xs text-ink outline-none focus:border-accent disabled:opacity-50"
                      >
                        {availableTranslationModels.map(model => (
                          <option key={model.id} value={model.id}>{model.name}</option>
                        ))}
                      </select>
                      <button
                        onClick={handleTranslate}
                        disabled={isProcessing}
                        className="flex w-full items-center gap-2 rounded px-2 py-2 text-xs text-ink hover:bg-slate-50 disabled:opacity-50"
                      >
                        <Languages className="h-3 w-3" /> 
                        {activeAction === 'translate' ? '翻译中...' : (assets.hasTranslation ? '重新翻译中文' : '翻译中文')}
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      handleDeleteCard();
                    }}
                    disabled={isProcessing}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Trash2 className="h-3 w-3" /> 删除卡片
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
