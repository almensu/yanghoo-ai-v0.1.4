import type { TaskSummary, TaskDetail, SourceChannelCollectionSummary, TaskLocalMediaFile, OpenTaskMediaFolderResult } from '../types';

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

export async function listSourceCollections(): Promise<SourceChannelCollectionSummary[]> {
  const response = await fetch(`${API_BASE}/api/source-collections`);
  const data = await handleResponse(response);
  return data.collections;
}

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

export async function startTaskActionJob(taskId: string, action: TaskJobAction, options: TaskJobOptions = {}): Promise<BackgroundJob> {
  const response = await fetch(`${API_BASE}/api/jobs/task-action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ taskId, action, options })
  });
  const data = await handleResponse(response);
  return data.job;
}

export async function listBackgroundJobs(): Promise<BackgroundJob[]> {
  const response = await fetch(`${API_BASE}/api/jobs`);
  const data = await handleResponse(response);
  return data.jobs;
}

export async function getTaskMediaFile(taskId: string): Promise<TaskLocalMediaFile> {
  const response = await fetch(`${API_BASE}/api/tasks/${encodeURIComponent(taskId)}/media-file`);
  return handleResponse(response);
}

export async function openTaskMediaFolder(taskId: string): Promise<OpenTaskMediaFolderResult> {
  const response = await fetch(`${API_BASE}/api/tasks/${encodeURIComponent(taskId)}/media-file/open`, {
    method: 'POST'
  });
  return handleResponse(response);
}

export interface SearchResult {
  sourceId: string;
  platform: string;
  title: string;
  author?: string;
  timestamp?: string;
  seconds?: number;
  snippet: string;
  score: number;
  lineIndex: number;
  language: 'zh-Hans' | 'source';
  playbackUrl?: string;
}

export async function searchDocuments(query: string, limit = 30): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(limit)
  });
  const response = await fetch(`${API_BASE}/api/search?${params.toString()}`);
  const data = await handleResponse(response);
  return data.results;
}

export interface EnglishSentenceSearchResult {
  entry: {
    sourceId: string;
    videoId: string;
    channelId: string;
    channelTitle?: string;
    title?: string;
    publishedAt?: string;
    start: number;
    end: number;
    text: string;
    normalizedText: string;
    captionKind?: string;
    captionLanguage: string;
  };
  youtubeTimestampUrl: string;
  youtubeEmbedUrl: string;
  startSeconds: number;
}

export interface EnglishSearchResponse {
  results: EnglishSentenceSearchResult[];
  warnings: string[];
  page: {
    limit: number;
    offset: number;
    returned: number;
    hasMore: boolean;
  };
}

export type EnglishSearchDiversity = 'balanced' | 'all' | 'one_per_video';
export type EnglishSearchSort = 'recent' | 'variety';
export type EnglishSearchCaptionKind = 'all' | 'manual' | 'auto';

export interface EnglishSearchOptions {
  limit?: number;
  offset?: number;
  diversity?: EnglishSearchDiversity;
  sort?: EnglishSearchSort;
  captionKind?: EnglishSearchCaptionKind;
}

export async function searchEnglishSentences(
  channelIds: string[], q: string, options: EnglishSearchOptions = {}
): Promise<EnglishSearchResponse> {
  const joinedChannelIds = channelIds.join(',');
  const params = new URLSearchParams({
    channelIds: joinedChannelIds,
    channelId: channelIds[0] ?? '',
    q,
    limit: String(options.limit ?? 20),
    offset: String(options.offset ?? 0),
    diversity: options.diversity ?? 'balanced',
    sort: options.sort ?? 'recent',
    captionKind: options.captionKind ?? 'all'
  });
  const response = await fetch(
    `${API_BASE}/api/english-sentences/search?${params.toString()}`
  );
  const data = await handleResponse(response);
  return {
    results: data.results,
    warnings: data.warnings || [],
    page: data.page || { limit: options.limit ?? 20, offset: options.offset ?? 0, returned: data.results?.length ?? 0, hasMore: false }
  };
}

export interface EnglishSentenceContextItem {
  start: number;
  end: number;
  text: string;
  isMatch: boolean;
}

export interface EnglishSentenceContextResponse {
  sourceId: string;
  videoId: string;
  start: number;
  items: EnglishSentenceContextItem[];
  warnings: string[];
}

export async function getEnglishSentenceContext(
  channelId: string,
  sourceId: string,
  start: number,
  windowSize = 1
): Promise<EnglishSentenceContextResponse> {
  const params = new URLSearchParams({
    channelId,
    sourceId,
    start: String(start),
    window: String(windowSize)
  });
  const response = await fetch(`${API_BASE}/api/english-sentences/context?${params.toString()}`);
  return handleResponse(response);
}

// --- Learning Channels ---

export interface LearningChannelSummary {
  channelId: string;
  title: string;
  videoCount: number;
  selectedCount: number;
  captionReadyCount: number;
  indexedSentenceCount: number;
  updatedAt: string;
  category?: string;
  tags: string[];
  taxonomyNote?: string;
}

export interface LearningChannelVideoRow {
  videoId: string;
  sourceId?: string;
  title: string;
  publishedAt?: string;
  selected: boolean;
  captionStatus: string;
  indexStatus: string;
  youtubeUrl: string;
  lastError?: string;
  discoveryStatus?: 'existing' | 'new' | 'remote_missing';
}

export async function registerLearningChannel(url: string, limit = 50): Promise<{ channelId: string; title: string; videoCount: number }> {
  const response = await fetch(`${API_BASE}/api/learning-channels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, limit })
  });
  return handleResponse(response);
}

export async function listLearningChannels(): Promise<LearningChannelSummary[]> {
  const response = await fetch(`${API_BASE}/api/learning-channels`);
  const data = await handleResponse(response);
  return data.channels;
}

export async function getChannelVideos(channelId: string): Promise<{ channelId: string; videos: LearningChannelVideoRow[] }> {
  const response = await fetch(`${API_BASE}/api/learning-channels/${encodeURIComponent(channelId)}/videos`);
  return handleResponse(response);
}

export async function updateVideoSelection(channelId: string, videoIds: string[], selected: boolean): Promise<{ selectedCount: number; totalVideos: number }> {
  const response = await fetch(`${API_BASE}/api/learning-channels/${encodeURIComponent(channelId)}/selection`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ videoIds, selected })
  });
  return handleResponse(response);
}

export async function syncSelectedCaptions(channelId: string, batchSize = 10, force = false): Promise<{ channelId: string; processed: number; succeeded: number; failed: number; skipped: number }> {
  const response = await fetch(`${API_BASE}/api/learning-channels/${encodeURIComponent(channelId)}/sync-selected`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ batchSize, force })
  });
  return handleResponse(response);
}

export async function buildChannelIndex(channelId: string): Promise<{ channelId: string; language: string; sourceCount: number; sentenceCount: number; skippedCount: number; failedCount: number; warnings: string[] }> {
  const response = await fetch(`${API_BASE}/api/learning-channels/${encodeURIComponent(channelId)}/build-index`, {
    method: 'POST'
  });
  return handleResponse(response);
}

export interface ChannelDeleteResult {
  channelId: string;
  deletedChannel: boolean;
  deletedSources: number;
  skippedSources: number;
  deletedPaths: string[];
  skippedPaths: string[];
  warnings: string[];
}

export async function deleteLearningChannel(channelId: string): Promise<ChannelDeleteResult> {
  const response = await fetch(`${API_BASE}/api/learning-channels/${encodeURIComponent(channelId)}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

export interface ChannelRefreshResult {
  channelId: string;
  mode: string;
  fetchedAt: string;
  localVideoCount: number;
  remoteVideoCount: number;
  addedCount: number;
  updatedCount: number;
  preservedCount: number;
  remoteMissingCount: number;
  addedVideos: { videoId: string; title: string; url: string }[];
  remoteMissingVideoIds: string[];
}

export async function refreshChannelVideos(channelId: string, mode: 'latest' | 'full' = 'latest', limit = 50): Promise<ChannelRefreshResult> {
  const response = await fetch(`${API_BASE}/api/learning-channels/${encodeURIComponent(channelId)}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode, limit })
  });
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

export interface TranslateDocumentOptions {
  modelId?: string;
  force?: boolean;
}

export async function translateDocument(taskId: string, options: TranslateDocumentOptions = {}): Promise<void> {
  const response = await fetch(`${taskPath(taskId)}/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
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

// --- Channel Taxonomy ---

export interface ChannelTaxonomyItem {
  channelId: string;
  category?: string;
  tags: string[];
  note?: string;
  updatedAt: string;
}

export async function listChannelTaxonomy(): Promise<ChannelTaxonomyItem[]> {
  const response = await fetch(`${API_BASE}/api/learning-channel-taxonomy`);
  const data = await handleResponse(response);
  return data.items;
}

export async function updateChannelTaxonomy(
  channelId: string,
  input: { category?: string; tags?: string[]; note?: string }
): Promise<ChannelTaxonomyItem> {
  const response = await fetch(`${API_BASE}/api/learning-channel-taxonomy/${encodeURIComponent(channelId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });
  const data = await handleResponse(response);
  return data.item;
}

export async function deleteChannelTaxonomy(channelId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/learning-channel-taxonomy/${encodeURIComponent(channelId)}`, {
    method: 'DELETE'
  });
  await handleResponse(response);
}

// --- Saved English Examples ---

export interface SavedEnglishExample {
  id: string;
  channelId: string;
  channelTitle?: string;
  sourceId: string;
  videoId: string;
  videoTitle?: string;
  publishedAt?: string;
  start: number;
  end: number;
  text: string;
  normalizedText: string;
  captionKind?: string;
  captionLanguage: string;
  youtubeTimestampUrl: string;
  youtubeEmbedUrl: string;
  startSeconds: number;
  query?: string;
  scenePackId?: string;
  scenePackTitle?: string;
  scenePackScene?: string;
  scenePackRequest?: string;
  scenePackQuery?: string;
  note: string;
  tags: string[];
  status: 'saved' | 'learning' | 'mastered';
  savedAt: string;
  updatedAt: string;
  lastReviewedAt: string | null;
  reviewCount: number;
}

export async function listSavedExamples(filters?: { q?: string; channelId?: string; tag?: string; status?: string }): Promise<SavedEnglishExample[]> {
  const params = new URLSearchParams();
  if (filters?.q) params.set('q', filters.q);
  if (filters?.channelId) params.set('channelId', filters.channelId);
  if (filters?.tag) params.set('tag', filters.tag);
  if (filters?.status) params.set('status', filters.status);
  const qs = params.toString();
  const response = await fetch(`${API_BASE}/api/english-saved-examples${qs ? `?${qs}` : ''}`);
  const data = await handleResponse(response);
  return data.items;
}

export async function listSavedExampleIds(): Promise<string[]> {
  const response = await fetch(`${API_BASE}/api/english-saved-examples/ids`);
  const data = await handleResponse(response);
  return data.ids;
}

export async function saveEnglishExample(
  result: EnglishSentenceSearchResult,
  query?: string,
  scenePack?: {
    id: string;
    title: string;
    scene: string;
    request?: string;
    query: string;
  }
): Promise<{ item: SavedEnglishExample; created: boolean; updated?: boolean }> {
  const response = await fetch(`${API_BASE}/api/english-saved-examples`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ result, query, scenePack })
  });
  return handleResponse(response);
}

export async function deleteSavedExample(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/english-saved-examples/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  await handleResponse(response);
}

export async function updateSavedExample(id: string, updates: { note?: string; tags?: string[]; status?: string }): Promise<SavedEnglishExample> {
  const response = await fetch(`${API_BASE}/api/english-saved-examples/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await handleResponse(response);
  return data.item;
}

export async function markSavedExampleReviewed(id: string): Promise<SavedEnglishExample> {
  const response = await fetch(`${API_BASE}/api/english-saved-examples/${encodeURIComponent(id)}/review`, {
    method: 'POST'
  });
  const data = await handleResponse(response);
  return data.item;
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

export interface LLMModel {
  id: string;
  name: string;
  provider: string;
}

export async function listModels(): Promise<LLMModel[]> {
  const response = await fetch(`${API_BASE}/api/models`);
  return handleResponse(response);
}

// --- English Scene Packs ---

export interface EnglishScenePackSummary {
  id: string;
  title: string;
  scene: string;
  request?: string;
  queryCount: number;
  exampleCount: number;
  updatedAt: string;
}

export interface EnglishScenePackExample {
  query: string;
  text: string;
  channelId: string;
  videoId: string;
  sourceId: string;
  title?: string;
  start: number;
  end?: number;
  youtubeTimestampUrl: string;
  youtubeEmbedUrl: string;
  startSeconds: number;
  captionKind?: string;
  captionLanguage: 'en';
}

export interface EnglishScenePack {
  id: string;
  title: string;
  scene: string;
  request?: string;
  level: string;
  queries: string[];
  examples: EnglishScenePackExample[];
  warnings: string[];
  studyPackPath?: string;
  updatedAt: string;
}

export async function listEnglishScenePacks(): Promise<EnglishScenePackSummary[]> {
  const response = await fetch(`${API_BASE}/api/english-scene-packs`);
  const data = await handleResponse(response);
  return data.packs;
}

export async function getEnglishScenePack(id: string): Promise<EnglishScenePack> {
  const response = await fetch(`${API_BASE}/api/english-scene-packs/${encodeURIComponent(id)}`);
  return handleResponse(response);
}

export async function deleteEnglishScenePack(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/api/english-scene-packs/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
  await handleResponse(response);
}
