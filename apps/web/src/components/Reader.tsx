import { X, Send, User, Bot, Loader2, Languages, Copy, Check } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getTaskDetail, sendChatMessage } from '../api/client';
import type { TaskDetail } from '../types';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ReaderProps {
  taskId: string;
  initialLineIndex?: number;
  highlightQuery?: string;
  initialDocumentLanguage?: 'english' | 'chinese';
  onClose: () => void;
}

function parseTimestampSeconds(timestamp: string): number | null {
  const parts = timestamp.split(':').map(part => Number(part));
  if (parts.length < 2 || parts.length > 3 || parts.some(part => Number.isNaN(part))) {
    return null;
  }

  if (parts.length === 2) {
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  }

  const [hours, minutes, seconds] = parts;
  return hours * 3600 + minutes * 60 + seconds;
}

function formatTimestampParam(seconds: number): string {
  return Number.isInteger(seconds) ? String(seconds) : seconds.toFixed(1);
}

function buildTimestampUrl(task: TaskDetail, seconds: number): string | null {
  const sourceUrl = task.url || task.sourceUrl;
  if (!sourceUrl) return null;

  try {
    const url = new URL(sourceUrl);
    const secondsParam = formatTimestampParam(seconds);

    if (task.platform === 'youtube') {
      url.searchParams.set('t', secondsParam);
      return url.toString();
    }

    if (task.platform === 'bilibili') {
      url.searchParams.set('t', secondsParam);
      return url.toString();
    }

    if (task.platform === 'xiaoyuzhou') {
      const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
      hashParams.set('ts', secondsParam);
      url.hash = hashParams.toString();
      return url.toString();
    }
  } catch (error) {
    console.warn('Failed to build timestamp URL:', error);
  }

  return null;
}

function renderDocumentLine(
  line: string,
  index: number,
  task: TaskDetail,
  targetLineIndex?: number,
  highlightQuery?: string
) {
  const isTargetLine = targetLineIndex === index;
  const targetClassName = isTargetLine ? 'rounded-lg bg-amber-50 px-3 py-2 ring-1 ring-amber-200' : '';

  if (!line.trim()) {
    return <div key={index} id={`reader-line-${index}`} className="h-3" />;
  }

  const headingMatch = line.match(/^#\s+(.+)$/);
  if (headingMatch) {
    return (
      <h1 key={index} id={`reader-line-${index}`} className={`mb-6 text-2xl font-semibold leading-snug text-ink ${targetClassName}`}>
        {headingMatch[1]}
      </h1>
    );
  }

  const timestampMatch = line.match(/^\s*(?:\*\*)?\[([0-9]+(?::[0-9]{1,2}){1,2}(?:\.\d+)?)\](?:\*\*)?\s*(.*)$/);
  if (timestampMatch) {
    const [, timestamp, text] = timestampMatch;
    const seconds = parseTimestampSeconds(timestamp);
    const timestampUrl = seconds === null ? null : buildTimestampUrl(task, seconds);

    return (
      <p key={index} id={`reader-line-${index}`} className={`my-4 flex gap-3 text-sm leading-7 text-ink ${targetClassName}`}>
        {timestampUrl ? (
          <a
            href={timestampUrl}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded border border-line bg-white px-2 py-0.5 font-mono text-xs text-accent no-underline transition-colors hover:border-accent hover:bg-blue-50"
            title="跳转到原页面时间戳"
          >
            {timestamp}
          </a>
        ) : (
          <span className="shrink-0 rounded border border-line bg-white px-2 py-0.5 font-mono text-xs text-muted">
            {timestamp}
          </span>
        )}
        <span>{renderHighlightedText(text, isTargetLine ? highlightQuery : undefined)}</span>
      </p>
    );
  }

  return (
    <p key={index} id={`reader-line-${index}`} className={`my-4 text-sm leading-7 text-ink ${targetClassName}`}>
      {renderHighlightedText(line, isTargetLine ? highlightQuery : undefined)}
    </p>
  );
}

function renderHighlightedText(text: string, query?: string) {
  const cleanQuery = query?.trim();
  if (!cleanQuery) return text;

  const index = text.toLocaleLowerCase().indexOf(cleanQuery.toLocaleLowerCase());
  if (index < 0) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-yellow-200 px-0.5 text-ink">{text.slice(index, index + cleanQuery.length)}</mark>
      {text.slice(index + cleanQuery.length)}
    </>
  );
}

export function Reader({ taskId, initialLineIndex, highlightQuery, initialDocumentLanguage = 'english', onClose }: ReaderProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [documentLanguage, setDocumentLanguage] = useState<'english' | 'chinese'>('english');
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTaskDetail(taskId);
        setTask(data);
      } catch (error) {
        console.error('Failed to load detail:', error);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [taskId]);

  useEffect(() => {
    setDocumentLanguage(initialDocumentLanguage);
    setCopyState('idle');
  }, [taskId, initialDocumentLanguage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input || isSending) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setUrl('');
    setIsSending(true);

    try {
      const response = await sendChatMessage(taskId, input, messages);
      const botMsg: Message = { role: 'assistant', content: response };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error('Chat failed:', error);
      setMessages(prev => [...prev, { role: 'system', content: 'Error: Failed to get response from AI.' }]);
    } finally {
      setIsSending(false);
    }
  };

  const hasTranslation = Boolean(task?.translatedContent);
  const displayContent = documentLanguage === 'chinese' && task?.translatedContent
    ? task.translatedContent
    : task?.content;
  const documentLabel = documentLanguage === 'chinese' ? '中文' : '英文';

  useEffect(() => {
    if (isLoading || !displayContent || initialLineIndex === undefined || initialLineIndex < 0) return;

    const timeoutId = window.setTimeout(() => {
      document.getElementById(`reader-line-${initialLineIndex}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }, 80);

    return () => window.clearTimeout(timeoutId);
  }, [isLoading, displayContent, initialLineIndex, taskId, documentLanguage]);

  const copyDocument = async () => {
    if (!displayContent) return;
    try {
      await writeClipboardText(displayContent);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1600);
    } catch (error) {
      console.error('Copy document failed:', error);
    }
  };

  const selectDocumentLanguage = (language: 'english' | 'chinese') => {
    setDocumentLanguage(language);
    setCopyState('idle');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm">
      <div className="flex h-[95vh] w-full max-w-6xl flex-col rounded-xl bg-white shadow-2xl overflow-hidden">
        <header className="flex items-center justify-between border-b border-line px-6 py-4 bg-white shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-ink">{task?.title || 'Loading...'}</h2>
            {task?.platform && (
              <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted">
                {task.platform}
              </span>
            )}
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-slate-100">
            <X className="h-5 w-5 text-muted" />
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Main Reader View */}
          <main className="flex flex-1 flex-col overflow-hidden border-r border-line bg-slate-50/30">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted animate-pulse">Loading document content...</p>
              </div>
            ) : displayContent && task ? (
              <>
                <div className="shrink-0 border-b border-line bg-white px-6 py-3 lg:px-8">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="inline-flex w-fit rounded-md border border-line bg-slate-50 p-1">
                      <button
                        onClick={() => selectDocumentLanguage('english')}
                        className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                          documentLanguage === 'english' ? 'bg-ink text-white shadow-sm' : 'text-muted hover:bg-white'
                        }`}
                      >
                        英文
                      </button>
                      <button
                        onClick={() => hasTranslation && selectDocumentLanguage('chinese')}
                        disabled={!hasTranslation}
                        className={`inline-flex items-center gap-1 rounded px-3 py-1.5 text-xs font-medium transition-colors ${
                          documentLanguage === 'chinese' ? 'bg-ink text-white shadow-sm' : 'text-muted hover:bg-white'
                        } disabled:cursor-not-allowed disabled:opacity-40`}
                      >
                        <Languages className="h-3 w-3" />
                        中文
                      </button>
                    </div>

                    <button
                      onClick={copyDocument}
                      className="inline-flex w-fit items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-xs font-medium text-ink transition-colors hover:bg-slate-50"
                    >
                      {copyState === 'copied' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                      {copyState === 'copied' ? '已复制' : `复制${documentLabel}全文`}
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                  <div className="max-w-none">
                    {displayContent.split('\n').map((line, i) => renderDocumentLine(line, i, task, initialLineIndex, highlightQuery))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="text-lg font-medium text-ink">No document available</p>
                <p className="mt-1 text-sm text-muted">Please run "Ensure Transcript" first.</p>
              </div>
            )}
          </main>

          {/* Chat Sidebar */}
          <aside className="w-96 flex flex-col bg-white shrink-0">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <Bot className="h-8 w-8 text-accent mb-2 opacity-50" />
                  <p className="text-sm font-medium text-ink">Ask about this document</p>
                  <p className="text-xs text-muted mt-1">Try "summarize this video" or "what are the main points?"</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`mt-1 shrink-0 rounded-full p-1.5 ${msg.role === 'user' ? 'bg-ink text-white' : 'bg-slate-100 text-ink'}`}>
                    {msg.role === 'user' ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                  </div>
                  <div className={`rounded-lg p-3 text-sm max-w-[85%] ${msg.role === 'user' ? 'bg-ink text-white' : 'bg-slate-100 text-ink'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex gap-3">
                  <div className="mt-1 shrink-0 rounded-full p-1.5 bg-slate-100 text-ink">
                    <Bot className="h-3 w-3" />
                  </div>
                  <div className="rounded-lg p-3 text-sm bg-slate-100 text-muted flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" /> Thinking...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-line bg-white shrink-0">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  className="flex-1 rounded-md border border-line px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                  value={input}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                />
                <button
                  onClick={handleSend}
                  disabled={!input || isSending}
                  className="rounded-md bg-ink p-2 text-white disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

async function writeClipboardText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.style.position = 'fixed';
  textArea.style.opacity = '0';
  document.body.appendChild(textArea);
  textArea.select();

  try {
    document.execCommand('copy');
  } finally {
    document.body.removeChild(textArea);
  }
}
