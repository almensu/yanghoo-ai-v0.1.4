import { X, Send, User, Bot, Loader2 } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { getTaskDetail, sendChatMessage } from '../api/client';
import type { TaskDetail } from '../types';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ReaderProps {
  taskId: string;
  onClose: () => void;
}

export function Reader({ taskId, onClose }: ReaderProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setUrl] = useState('');
  const [isSending, setIsSending] = useState(false);
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
          <main className="flex-1 overflow-y-auto p-8 lg:p-12 border-r border-line bg-slate-50/30">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted animate-pulse">Loading document content...</p>
              </div>
            ) : task?.content ? (
              <div className="prose prose-slate max-w-none">
                {task.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
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
