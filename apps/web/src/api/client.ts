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

export async function getTaskDetail(taskId: string): Promise<TaskDetail> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}`);
  return handleResponse(response);
}

export async function ensureTranscript(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/ensure-transcript`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function fetchAudio(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/fetch-audio`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function transcribeAudio(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/transcribe-audio`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function resolveMedia(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/resolve-media`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function downloadMedia(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/download-media`, {
    method: 'POST'
  });
  await handleResponse(response);
}

export async function transcribeMedia(taskId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/tasks/${taskId}/transcribe-media`, {
    method: 'POST'
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
