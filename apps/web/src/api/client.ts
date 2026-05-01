import type { TaskSummary, TaskDetail } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE ?? '';

async function handleResponse(response: Response) {
  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const errorData = await response.json();
      message = errorData.message || errorData.error || message;
    } catch (e) {
      // Body not JSON
    }
    throw new Error(message);
  }
  return response.json();
}

export async function listTasks(): Promise<TaskSummary[]> {
  const response = await fetch(`${API_BASE}/api/tasks`);
  return handleResponse(response);
}

function taskPath(taskId: string): string {
  return `${API_BASE}/api/tasks/${encodeURIComponent(taskId)}`;
}

export async function getTaskDetail(taskId: string): Promise<TaskDetail> {
  const response = await fetch(taskPath(taskId));
  return handleResponse(response);
}

export async function ensureTranscript(taskId: string): Promise<void> {
  const response = await fetch(`${taskPath(taskId)}/ensure-transcript`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function fetchAudio(taskId: string): Promise<void> {
  const response = await fetch(`${taskPath(taskId)}/fetch-audio`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function transcribeAudio(taskId: string): Promise<void> {
  const response = await fetch(`${taskPath(taskId)}/transcribe-audio`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function resolveMedia(taskId: string): Promise<void> {
  const response = await fetch(`${taskPath(taskId)}/resolve-media`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function downloadMedia(taskId: string): Promise<void> {
  const response = await fetch(`${taskPath(taskId)}/download-media`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function translateDocument(taskId: string): Promise<void> {
  const response = await fetch(`${taskPath(taskId)}/translate`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export interface NotebookLmExportResult {
  exportId: string;
  exportDir: string;
  files: { sourceId?: string; path: string; kind: 'markdown' | 'url-list' | 'manifest' }[];
  skipped: { sourceId: string; reason: string }[];
  mode: 'markdown' | 'url-list';
  generatedAt: string;
}

export async function exportNotebookLm(sourceIds: string[], mode: 'markdown' | 'url-list'): Promise<NotebookLmExportResult> {
  const response = await fetch(`${API_BASE}/api/exports/notebooklm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sourceIds,
      mode,
      language: 'zh-Hans-preferred'
    })
  });
  return handleResponse(response);
}

export async function openNotebookLmExport(exportId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/exports/notebooklm/${encodeURIComponent(exportId)}/open`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function transcribeMedia(taskId: string): Promise<void> {
  const response = await fetch(`${taskPath(taskId)}/transcribe-media`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function deleteAssets(taskId: string, scope: 'media' | 'audio' | 'transcript' | 'generated'): Promise<void> {
  const response = await fetch(`${taskPath(taskId)}/assets`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scope })
  });
  await handleResponse(response);
}

export async function deleteTask(taskId: string): Promise<void> {
  const response = await fetch(taskPath(taskId), {
    method: 'DELETE'
  });
  await handleResponse(response);
}

export async function sendChatMessage(taskId: string, message: string, history: any[] = []): Promise<string> {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, message, history })
  });
  const data = await handleResponse(response);
  return data.response;
}

export async function listModels(): Promise<any[]> {
  const response = await fetch(`${API_BASE}/api/models`);
  return handleResponse(response);
}
