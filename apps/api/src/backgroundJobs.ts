import { spawn } from 'child_process';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { resolveApiProjectRoot } from './resolveApiProjectRoot.js';

export type TaskJobAction =
  | 'ensure-transcript'
  | 'fetch-audio'
  | 'transcribe-audio'
  | 'download-media'
  | 'transcribe-media'
  | 'translate';

export type BackgroundJobStatus = 'queued' | 'running' | 'succeeded' | 'failed';

export interface TaskJobOptions {
  modelId?: string;
  force?: boolean;
}

export interface BackgroundJob {
  id: string;
  taskId: string;
  action: TaskJobAction;
  label: string;
  status: BackgroundJobStatus;
  progress: number;
  message: string;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  errorMessage?: string;
  stdoutTail?: string;
  stderrTail?: string;
}

interface StoredBackgroundJob extends BackgroundJob {
  estimateMs: number;
}

const jobs = new Map<string, StoredBackgroundJob>();
const MAX_TAIL_LENGTH = 5000;

export function startTaskActionJob(taskId: string, action: TaskJobAction, options: TaskJobOptions = {}): BackgroundJob {
  const existing = findRunningJob(taskId, action);
  if (existing) return toPublicJob(existing);

  const job: StoredBackgroundJob = {
    id: randomUUID(),
    taskId,
    action,
    label: labelForAction(action),
    status: 'queued',
    progress: 3,
    message: '已加入后台队列',
    createdAt: new Date().toISOString(),
    estimateMs: estimateMsForAction(action)
  };
  jobs.set(job.id, job);

  queueMicrotask(() => runJob(job.id, options));
  return toPublicJob(job);
}

export function listBackgroundJobs(): BackgroundJob[] {
  pruneOldJobs();
  return Array.from(jobs.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(toPublicJob);
}

export function getBackgroundJob(jobId: string): BackgroundJob | null {
  const job = jobs.get(jobId);
  return job ? toPublicJob(job) : null;
}

function findRunningJob(taskId: string, action: TaskJobAction): StoredBackgroundJob | null {
  for (const job of jobs.values()) {
    if (
      job.taskId === taskId &&
      job.action === action &&
      (job.status === 'queued' || job.status === 'running')
    ) {
      return job;
    }
  }

  return null;
}

function runJob(jobId: string, options: TaskJobOptions): void {
  const job = jobs.get(jobId);
  if (!job) return;

  const repoRoot = resolveApiProjectRoot();
  const dataRoot = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(repoRoot, 'data');
  const cliArgs = buildCliArgs(job.taskId, job.action, options);

  job.status = 'running';
  job.startedAt = new Date().toISOString();
  job.progress = 10;
  job.message = '后台任务正在执行';

  const child = spawn('npm', ['run', '-s', 'cli', '--', '--data-dir', dataRoot, ...cliArgs, '--json'], {
    cwd: repoRoot,
    env: {
      ...process.env,
      DATA_DIR: dataRoot,
      YANGHOO_REPO_ROOT: repoRoot
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  child.stdout.on('data', (chunk: Buffer) => {
    job.stdoutTail = appendTail(job.stdoutTail, chunk.toString('utf-8'));
    job.message = summarizeOutput(job.stdoutTail) || job.message;
  });

  child.stderr.on('data', (chunk: Buffer) => {
    job.stderrTail = appendTail(job.stderrTail, chunk.toString('utf-8'));
    const outputSummary = summarizeOutput(job.stderrTail);
    if (outputSummary) job.message = outputSummary;
  });

  child.on('error', (error) => {
    job.status = 'failed';
    job.progress = 100;
    job.errorMessage = error.message;
    job.message = error.message;
    job.finishedAt = new Date().toISOString();
  });

  child.on('close', (code) => {
    job.finishedAt = new Date().toISOString();
    job.progress = 100;

    if (code === 0) {
      job.status = 'succeeded';
      job.message = `${job.label}完成`;
      return;
    }

    job.status = 'failed';
    job.errorMessage = extractErrorMessage(job.stderrTail || job.stdoutTail || `Job exited with code ${code}`);
    job.message = job.errorMessage;
  });
}

function buildCliArgs(taskId: string, action: TaskJobAction, options: TaskJobOptions): string[] {
  if (action === 'ensure-transcript') return ['transcript', 'ensure', taskId];
  if (action === 'fetch-audio') return ['audio', 'fetch', taskId];
  if (action === 'download-media') return ['media', 'download', taskId];
  if (action === 'transcribe-audio' || action === 'transcribe-media') return ['transcribe', taskId];

  if (action === 'translate') {
    const args = ['translate', taskId];
    if (options.modelId) args.push('--model', options.modelId);
    if (options.force) args.push('--force');
    return args;
  }

  throw new Error(`Unsupported background job action: ${action}`);
}

function labelForAction(action: TaskJobAction): string {
  const labels: Record<TaskJobAction, string> = {
    'ensure-transcript': '下载字幕',
    'fetch-audio': '下载音频',
    'transcribe-audio': '转录音频',
    'download-media': '下载视频',
    'transcribe-media': '转录视频',
    translate: '翻译中文'
  };
  return labels[action];
}

function estimateMsForAction(action: TaskJobAction): number {
  const estimates: Record<TaskJobAction, number> = {
    'ensure-transcript': 45_000,
    'fetch-audio': 180_000,
    'transcribe-audio': 420_000,
    'download-media': 240_000,
    'transcribe-media': 480_000,
    translate: 600_000
  };
  return estimates[action];
}

function toPublicJob(job: StoredBackgroundJob): BackgroundJob {
  return {
    id: job.id,
    taskId: job.taskId,
    action: job.action,
    label: job.label,
    status: job.status,
    progress: computeProgress(job),
    message: job.message,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    errorMessage: job.errorMessage,
    stdoutTail: job.stdoutTail,
    stderrTail: job.stderrTail
  };
}

function computeProgress(job: StoredBackgroundJob): number {
  if (job.status === 'succeeded' || job.status === 'failed') return 100;
  if (job.status === 'queued' || !job.startedAt) return job.progress;

  const startedAt = new Date(job.startedAt).getTime();
  const elapsed = Math.max(0, Date.now() - startedAt);
  const estimated = Math.min(90, 10 + Math.round((elapsed / job.estimateMs) * 80));
  return Math.max(job.progress, estimated);
}

function appendTail(current: string | undefined, next: string): string {
  const combined = `${current || ''}${next}`;
  return combined.length > MAX_TAIL_LENGTH ? combined.slice(combined.length - MAX_TAIL_LENGTH) : combined;
}

function summarizeOutput(output?: string): string | undefined {
  if (!output) return undefined;
  const lines = output
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  return lines[lines.length - 1];
}

function extractErrorMessage(output: string): string {
  const jsonMatch = output.match(/\{\s*"ok"\s*:\s*false[\s\S]*?\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error) return parsed.error;
    } catch {
      // Fall through to line summary.
    }
  }

  const lines = output
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  return lines.reverse().find(line => !line.startsWith('>')) || '后台任务失败';
}

function pruneOldJobs(): void {
  const cutoff = Date.now() - 60 * 60 * 1000;
  for (const [jobId, job] of jobs.entries()) {
    if (!job.finishedAt) continue;
    if (new Date(job.finishedAt).getTime() < cutoff) {
      jobs.delete(jobId);
    }
  }
}
