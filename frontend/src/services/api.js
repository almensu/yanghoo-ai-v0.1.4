import http from './http';

export const getTasks = async (apiBaseUrl) => {
  const res = await http.get(`${apiBaseUrl}/api/tasks`);
  return res.data;
};

export const deleteTask = async (apiBaseUrl, uuid) => {
  await http.delete(`${apiBaseUrl}/api/tasks/${uuid}`);
};

export const archiveTask = async (apiBaseUrl, uuid) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/archive`);
  return res.data;
};

export const restoreArchived = async (apiBaseUrl) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/restore_archived`);
  return res.data;
};

export const downloadMedia = async (apiBaseUrl, uuid, quality) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/download_media`, { quality });
  return res.data;
};

export const extractAudio = async (apiBaseUrl, uuid) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/extract_audio`);
  return res.data;
};

export const deleteVideo = async (apiBaseUrl, uuid) => {
  await http.delete(`${apiBaseUrl}/api/tasks/${uuid}/media/video`);
};

export const deleteAudio = async (apiBaseUrl, uuid) => {
  await http.delete(`${apiBaseUrl}/api/tasks/${uuid}/media/audio`);
};

export const downloadAudio = async (apiBaseUrl, uuid) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/download_audio`);
  return res.data;
};

export const downloadVtt = async (apiBaseUrl, uuid) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/download_vtt`);
  return res.data;
};

export const deleteVtt = async (apiBaseUrl, uuid, langCode) => {
  const res = await http.delete(`${apiBaseUrl}/api/tasks/${uuid}/vtt/${langCode}`, { validateStatus: () => true });
  return res.status;
};

export const naturalSegmentVtt = async (apiBaseUrl, uuid, mergeThreshold = 0.8) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/natural-segment-vtt/${uuid}?merge_threshold=${mergeThreshold}`);
  return res.data;
};

export const mergeVtt = async (apiBaseUrl, uuid, format = 'all', useSegmented = false) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/merge_vtt`, { format, use_segmented: useSegmented });
  return res.data;
};

export const transcribeWhisperX = async (apiBaseUrl, uuid, model) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/transcribe_whisperx`, { model });
  return res.data;
};

export const deleteWhisperX = async (apiBaseUrl, uuid) => {
  const res = await http.delete(`${apiBaseUrl}/api/tasks/${uuid}/transcribe_whisperx`);
  return res.data;
};

export const splitTranscribeWhisperX = async (apiBaseUrl, uuid, model) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/split_transcribe_whisperx`, { model });
  return res.data;
};

export const createVideo = async (apiBaseUrl, uuid) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/create_video`);
  return res.data;
};

export const openFolder = async (apiBaseUrl, uuid) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/open_folder`);
  return res.data;
};

export const processSrt = async (apiBaseUrl, uuid) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/process_srt`);
  return res.data;
};

export const mergeSrt = async (apiBaseUrl, uuid) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/merge_srt`);
  return res.data;
};

export const deleteSrt = async (apiBaseUrl, uuid, langCode) => {
  const res = await http.delete(`${apiBaseUrl}/api/tasks/${uuid}/srt/${langCode}`);
  return res.status;
};

export const deleteAss = async (apiBaseUrl, uuid, langCode) => {
  const res = await http.delete(`${apiBaseUrl}/api/tasks/${uuid}/ass/${langCode}`);
  return res.status;
};

export const translateSubtitles = async (apiBaseUrl, uuid, options = {}) => {
  const res = await http.post(
    `${apiBaseUrl}/api/tasks/${uuid}/translate-subtitles`,
    {
      model: options.model || 'glm-4.7',
      source_lang: options.source_lang || 'English',
      target_lang: options.target_lang || 'Chinese',
      chunk_size: options.chunk_size || 50,
      deduplicate: options.deduplicate !== false
    }
  );
  return res.data;
};

export const generateSrt = async (apiBaseUrl, uuid) => {
  const res = await http.post(`${apiBaseUrl}/api/tasks/${uuid}/generate_srt`);
  return res.data;
};

