/**
 * API endpoints for task management
 * All API calls are centralized here for maintainability
 * @module core/api/endpoints
 */
import http from './http';
import { API_BASE_URL } from '../config/constants';

/**
 * Get API URL, using environment variable or default
 * @param {string} customBaseUrl - Optional custom base URL
 * @returns {string} Base URL for API
 */
const getBaseUrl = (customBaseUrl) => customBaseUrl || API_BASE_URL;

// ============================================
// Task Management
// ============================================

export const getTasks = async (apiBaseUrl) => {
    const res = await http.get(`${getBaseUrl(apiBaseUrl)}/api/tasks`);
    return res.data;
};

export const deleteTask = async (apiBaseUrl, uuid) => {
    await http.delete(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}`);
};

export const archiveTask = async (apiBaseUrl, uuid) => {
    const res = await http.post(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/archive`);
    return res.data;
};

export const restoreArchived = async (apiBaseUrl) => {
    const res = await http.post(`${getBaseUrl(apiBaseUrl)}/api/tasks/restore_archived`);
    return res.data;
};

// ============================================
// Media Operations
// ============================================

export const downloadMedia = async (apiBaseUrl, uuid, quality) => {
    const res = await http.post(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/download_media`, { quality });
    return res.data;
};

export const extractAudio = async (apiBaseUrl, uuid) => {
    const res = await http.post(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/extract_audio`);
    return res.data;
};

export const deleteVideo = async (apiBaseUrl, uuid) => {
    await http.delete(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/media/video`);
};

export const deleteAudio = async (apiBaseUrl, uuid) => {
    await http.delete(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/media/audio`);
};

export const downloadAudio = async (apiBaseUrl, uuid) => {
    const res = await http.post(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/download_audio`);
    return res.data;
};

// ============================================
// VTT Operations
// ============================================

export const downloadVtt = async (apiBaseUrl, uuid) => {
    const res = await http.post(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/download_vtt`);
    return res.data;
};

export const deleteVtt = async (apiBaseUrl, uuid, langCode) => {
    const res = await http.delete(
        `${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/vtt/${langCode}`,
        { validateStatus: () => true }
    );
    return res.status;
};

export const naturalSegmentVtt = async (apiBaseUrl, uuid, mergeThreshold = 0.8) => {
    const res = await http.post(
        `${getBaseUrl(apiBaseUrl)}/api/tasks/natural-segment-vtt/${uuid}?merge_threshold=${mergeThreshold}`
    );
    return res.data;
};

export const mergeVtt = async (apiBaseUrl, uuid, format = 'all', useSegmented = false) => {
    const res = await http.post(
        `${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/merge_vtt`,
        { format, use_segmented: useSegmented }
    );
    return res.data;
};

// ============================================
// Transcription
// ============================================

export const transcribeWhisperX = async (apiBaseUrl, uuid, model) => {
    const res = await http.post(
        `${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/transcribe_whisperx`,
        { model }
    );
    return res.data;
};

export const deleteWhisperX = async (apiBaseUrl, uuid) => {
    const res = await http.delete(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/transcribe_whisperx`);
    return res.data;
};

export const splitTranscribeWhisperX = async (apiBaseUrl, uuid, model) => {
    const res = await http.post(
        `${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/split_transcribe_whisperx`,
        { model }
    );
    return res.data;
};

// ============================================
// Video Generation
// ============================================

export const createVideo = async (apiBaseUrl, uuid) => {
    const res = await http.post(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/create_video`);
    return res.data;
};

// ============================================
// File Operations
// ============================================

export const openFolder = async (apiBaseUrl, uuid) => {
    const res = await http.post(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/open_folder`);
    return res.data;
};

// ============================================
// SRT Operations
// ============================================

export const processSrt = async (apiBaseUrl, uuid) => {
    const res = await http.post(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/process_srt`);
    return res.data;
};

export const mergeSrt = async (apiBaseUrl, uuid) => {
    const res = await http.post(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/merge_srt`);
    return res.data;
};

export const deleteSrt = async (apiBaseUrl, uuid, langCode) => {
    const res = await http.delete(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/srt/${langCode}`);
    return res.status;
};

export const deleteAss = async (apiBaseUrl, uuid, langCode) => {
    const res = await http.delete(`${getBaseUrl(apiBaseUrl)}/api/tasks/${uuid}/ass/${langCode}`);
    return res.status;
};
