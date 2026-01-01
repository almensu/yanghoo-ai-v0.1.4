import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import useTaskUpdates from '../features/tasks/hooks/useTaskUpdates';
import {
  getTasks,
  deleteTask as apiDeleteTask,
  archiveTask as apiArchiveTask,
  restoreArchived as apiRestoreArchived,
  downloadMedia as apiDownloadMedia,
  extractAudio as apiExtractAudio,
  deleteVideo as apiDeleteVideo,
  deleteAudio as apiDeleteAudio,
  downloadAudio as apiDownloadAudio,
  downloadVtt as apiDownloadVtt,
  deleteVtt as apiDeleteVtt,
  naturalSegmentVtt as apiNaturalSegmentVtt,
  mergeVtt as apiMergeVtt,
  transcribeWhisperX as apiTranscribeWhisperX,
  deleteWhisperX as apiDeleteWhisperX,
  splitTranscribeWhisperX as apiSplitTranscribeWhisperX,
  createVideo as apiCreateVideo,
  openFolder as apiOpenFolder,
  processSrt as apiProcessSrt,
  mergeSrt as apiMergeSrt,
  deleteSrt as apiDeleteSrt,
  deleteAss as apiDeleteAss,
} from '../services/api';

import IngestForm from '../components/IngestForm';
import TaskList from '../components/TaskList';

// Helper for sorting icons (you can replace with actual icons later)
const SortIndicator = ({ order }) => {
  if (!order) return null;
  return order === 'asc' ? ' ▲' : ' ▼';
};

function TaskListPage({ apiBaseUrl, wsBaseUrl }) {
  const [tasks, setTasks] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [sortField, setSortField] = useState('created_at'); // Default sort field to created_at
  const [sortOrder, setSortOrder] = useState('desc'); // Default sort order to descending
  const ws = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSort = useCallback((field, order) => {
    if (order) { // If an explicit order is provided (e.g., from CardView dropdown)
      setSortField(field);
      setSortOrder(order);
    } else { // Toggle order if no explicit order is given (e.g., from TableView header click)
      setSortOrder(currentOrder => {
        if (sortField === field) {
          return currentOrder === 'asc' ? 'desc' : 'asc';
        }
        return 'asc'; // Default to ascending for new field
      });
      setSortField(field);
    }
  }, [sortField]);

  const sortedTasks = useMemo(() => {
    let sorted = [...tasks];
    if (sortField) {
      sorted.sort((a, b) => {
        let valA, valB;

        // Handle date fields (created_at and last_modified)
        if (sortField === 'created_at' || sortField === 'last_modified') {
          valA = a[sortField] ? new Date(a[sortField]).getTime() : 0;
          valB = b[sortField] ? new Date(b[sortField]).getTime() : 0;
        } else {
          // Handle string fields (title, platform, url)
          valA = a[sortField] ? String(a[sortField]).toLowerCase() : '';
          valB = b[sortField] ? String(b[sortField]).toLowerCase() : '';
        }
        
        let comparison = 0;
        if (valA > valB) {
          comparison = 1;
        } else if (valA < valB) {
          comparison = -1;
        }
        return sortOrder === 'asc' ? comparison : comparison * -1;
      });
    }

    // Secondary sort by archived status (archived tasks at the bottom)
    // This should ideally run AFTER the primary sort, so we apply it here again
    // or ensure the primary sort is stable if items have same primary sort value.
    // For simplicity, applying it again on the already primary-sorted list.
    sorted.sort((a, b) => {
      if (a.archived !== b.archived) {
        return a.archived ? 1 : -1;
      }
      return 0;
    });
    return sorted;
  }, [tasks, sortField, sortOrder]);

  const fetchTasks = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const data = await getTasks(apiBaseUrl);
      // Initial sort from backend might not be needed if client-side sort is comprehensive
      // For now, remove initial client-side sort here to rely on the main sortedTasks useMemo
      setTasks(data);
      setFetchError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setFetchError('Failed to fetch tasks. Please check the backend connection.');
      setTasks([]);
    } finally {
      setFetchLoading(false);
    }
  }, [apiBaseUrl]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useTaskUpdates(wsBaseUrl, {
    onTaskUpdate: (message) => {
      setTasks(currentTasks => {
        const taskExists = currentTasks.some(task => task.uuid === message.uuid);
        if (taskExists) {
          return currentTasks.map(task => task.uuid === message.uuid ? { ...task, ...message.task_data } : task);
        } else {
          fetchTasks();
          return currentTasks;
        }
      });
    },
    onUnknownTask: () => {},
    onError: (message) => {
      toast.error(`任务 ${message.uuid} 处理失败：${message.error || '未知错误'}`);
    }
  });

  const handleDeleteTask = async (taskUuid) => {
    console.log(`Attempting to delete task: ${taskUuid}`);
    try {
      await apiDeleteTask(apiBaseUrl, taskUuid);
      console.log(`Successfully deleted task: ${taskUuid}`);
      setTasks(currentTasks => currentTasks.filter(task => task.uuid !== taskUuid));
      toast.success(`删除任务 ${taskUuid} 成功`);
    } catch (e) {
      console.error("Error deleting task:", e);
      toast.error(`删除任务失败：${e.message}`);
    }
  };

  const handleArchiveTask = async (taskUuid) => {
    if (!window.confirm("Are you sure you want to archive this task?")) return;
    try {
      const updatedTaskData = await apiArchiveTask(apiBaseUrl, taskUuid);
      setTasks(currentTasks => currentTasks.map(task => task.uuid === taskUuid ? { ...task, ...updatedTaskData } : task));
      toast.success(`任务 ${taskUuid} 已归档`);
    } catch (e) { toast.error(`归档失败：${e.message}`); }
  };

  const handleRestoreArchived = async () => {
    if (!window.confirm("Are you sure you want to restore archived tasks?")) return;
    try {
      const data = await apiRestoreArchived(apiBaseUrl);
      toast.success(data.message || "归档任务已恢复");
      await fetchTasks();
    } catch (e) { toast.error(`恢复归档任务失败：${e.message}`); }
  };

  const handleDownloadRequest = async (taskUuid, quality) => {
    if (!quality) { alert("Quality required."); return; }
    try {
      const data = await apiDownloadMedia(apiBaseUrl, taskUuid, quality);
      toast.success(`开始下载 ${taskUuid}：${data.message}`);
      await fetchTasks();
    } catch (e) {
      toast.error(`下载失败 ${taskUuid}：${e.message}`);
    }
  };

  const handleExtractAudio = async (taskUuid) => {
    try {
      const data = await apiExtractAudio(apiBaseUrl, taskUuid);
      toast.success(`音频提取完成 ${taskUuid}：${data.wav_path}`);
      await fetchTasks();
    } catch (e) {
      toast.error(`音频提取失败 ${taskUuid}：${e.message}`);
    }
  };

  const handleDeleteVideo = async (taskUuid) => {
    if (!window.confirm("Delete video files?")) return;
    try {
      await apiDeleteVideo(apiBaseUrl, taskUuid);
      toast.success(`已删除视频文件：${taskUuid}`);
      await fetchTasks();
    } catch (e) {
      toast.error(`删除视频失败：${e.message}`);
    }
  };

  const handleDeleteAudio = async (taskUuid) => {
    if (!window.confirm("Delete audio file?")) return;
    try {
      await apiDeleteAudio(apiBaseUrl, taskUuid);
      toast.success(`已删除音频文件：${taskUuid}`);
      await fetchTasks();
    } catch (e) {
      toast.error(`删除音频失败：${e.message}`);
    }
  };

  const handleDownloadAudio = async (taskUuid) => {
    console.log(`Attempting to download audio directly for task: ${taskUuid}`);
    toast.info(`开始音频下载：${taskUuid}`);
    try {
      const data = await apiDownloadAudio(apiBaseUrl, taskUuid);
      console.log(`Successfully downloaded audio for task: ${taskUuid}`, data);
      toast.success(`音频下载成功：${taskUuid}，路径：${data.audio_path}`);
      await fetchTasks(); // Refresh tasks
    } catch (e) {
      console.error("Error downloading audio:", e);
      toast.error(`音频下载失败 ${taskUuid}：${e.message}`);
    }
  };

  const handleDownloadVtt = async (taskUuid, langCode) => {
    try {
      const data = await apiDownloadVtt(apiBaseUrl, taskUuid);
      const files = data.vtt_files ? Object.keys(data.vtt_files).join(', ') : 'None';
      toast.success(`VTT 下载：${taskUuid}，${data.message}。文件：${files}`);
      await fetchTasks();
    } catch (e) {
      toast.error(`VTT 下载失败 ${taskUuid}：${e.message}`);
    }
  };

  const handleDeleteVtt = async (taskUuid, langCode) => {
    if (!window.confirm(`Delete ${langCode} VTT?`)) return;
    try {
      const status = await apiDeleteVtt(apiBaseUrl, taskUuid, langCode);
      if (status === 204) {
        toast.success(`已删除 ${langCode} VTT：${taskUuid}`);
        await fetchTasks();
      } else {
        throw new Error(`HTTP ${status}`);
      }
    } catch (e) {
      toast.error(`删除 ${langCode} VTT 失败：${e.message}`);
    }
  };

  const handleNaturalSegmentVtt = async (taskUuid, mergeThreshold = 0.8) => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const data = await apiNaturalSegmentVtt(apiBaseUrl, taskUuid, mergeThreshold);
      toast.success(`VTT 自然断句完成：处理 ${Object.keys(data.result.processed_files).length} 个文件`);
      await fetchTasks();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed VTT natural segmentation.';
      setFetchError(msg);
      toast.error(`VTT 自然断句失败：${msg}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleMergeVtt = async (uuid, format = 'all', useSegmented = false) => {
    setFetchLoading(true);
    setFetchError(null);
    let mergeError = null;
    try {
      try { await apiMergeVtt(apiBaseUrl, uuid, format, useSegmented); } catch (err) { mergeError = err; }
      if (mergeError) throw mergeError;
      toast.success(`已发送 VTT ${useSegmented ? '(自然断句)' : ''} 处理请求`);
      setTimeout(fetchTasks, 2000);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed VTT merge.';
      setFetchError(msg);
      toast.error(`VTT 合并失败：${msg}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleTranscribeWhisperX = async (taskUuid, model) => {
    if (!taskUuid || !model) { alert("UUID/Model required."); return; }
    try {
      const data = await apiTranscribeWhisperX(apiBaseUrl, taskUuid, model);
      setTasks(ts => ts.map(t => t.uuid === taskUuid ? { ...t, ...data } : t));
      toast.success(`WhisperX 转写已启动：${taskUuid}`);
    } catch (e) {
      toast.error(`WhisperX 失败 ${taskUuid}：${e.message}`);
    }
  };

  const handleDeleteWhisperX = async (taskUuid) => {
    if (!window.confirm("Delete WhisperX transcript?")) return;
    try {
      const data = await apiDeleteWhisperX(apiBaseUrl, taskUuid);
      toast.success(data.message || `WhisperX 已删除：${taskUuid}`);
      if (data.task_data) setTasks(ts => ts.map(t => t.uuid === taskUuid ? { ...t, ...data.task_data } : t)); else fetchTasks();
    } catch (e) {
      toast.error(`删除 WhisperX 失败：${e.message}`);
    }
  };

  const handleSplitTranscribeWhisperX = async (taskUuid, model) => {
    if (!taskUuid || !model) { alert("UUID/Model required."); return; }
    try {
      await apiSplitTranscribeWhisperX(apiBaseUrl, taskUuid, model);
      toast.success(`已启动拆分转写：${taskUuid}（模型：${model}）`);
      setTasks(ts => ts.map(t => t.uuid === taskUuid ? { ...t, transcription_status: "processing", transcription_model: model } : t));
    } catch (e) {
      toast.error(`拆分转写失败 ${taskUuid}：${e.message}`);
    }
  };

  const handleCreateVideo = async (taskUuid) => {
    try {
      const result = await apiCreateVideo(apiBaseUrl, taskUuid);
      toast.success(`视频已创建：${result.output_path}`);
    } catch (e) {
      toast.error(`创建视频失败：${e.message}`);
    }
  };

  const handleOpenFolder = async (taskUuid) => {
    try {
      await apiOpenFolder(apiBaseUrl, taskUuid);
      toast.info(`已请求打开目录：${taskUuid}`);
    } catch (e) {
      toast.error(`打开目录失败：${e.message}`);
    }
  };

  const handleGoToStudio = (taskUuid) => {
    if (taskUuid) {
      navigate(`/studio/${taskUuid}`);
    }
  };

  const handleProcessSrt = async (taskUuid) => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const data = await apiProcessSrt(apiBaseUrl, taskUuid);
      const processedCount = Object.keys(data.processed_files || {}).length;
      toast.success(`SRT 处理完成：生成 ${processedCount} 个分离文件`);
      await fetchTasks();
    } catch (err) {
      const msg = err.message || 'Failed SRT processing.';
      setFetchError(msg);
      toast.error(`SRT 处理失败：${msg}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleMergeSrt = async (taskUuid) => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const data = await apiMergeSrt(apiBaseUrl, taskUuid);
      const generatedCount = Object.keys(data.generated_files || {}).length;
      toast.success(`SRT 合并完成：生成 ${generatedCount} 个 MD 文件`);
      await fetchTasks();
    } catch (err) {
      const msg = err.message || 'Failed SRT merge.';
      setFetchError(msg);
      toast.error(`SRT 合并失败：${msg}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleDeleteSrt = async (taskUuid, langCode) => {
    if (!window.confirm(`Delete ${langCode} SRT?`)) return;
    try {
      const status = await apiDeleteSrt(apiBaseUrl, taskUuid, langCode);
      if (status === 204) {
        toast.success(`已删除 ${langCode} SRT：${taskUuid}`);
        await fetchTasks();
      } else {
        throw new Error(`HTTP ${status}`);
      }
    } catch (e) {
      toast.error(`删除 ${langCode} SRT 失败：${e.message}`);
    }
  };

  const handleDeleteAss = async (taskUuid, langCode) => {
    if (!window.confirm(`Delete ${langCode} ASS?`)) return;
    try {
      const status = await apiDeleteAss(apiBaseUrl, taskUuid, langCode);
      if (status === 204) {
        toast.success(`已删除 ${langCode} ASS：${taskUuid}`);
        await fetchTasks();
      } else {
        throw new Error(`HTTP ${status}`);
      }
    } catch (e) {
      toast.error(`删除 ${langCode} ASS 失败：${e.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 pt-8 flex flex-col h-full">
      <IngestForm
        API_BASE_URL={apiBaseUrl}
        onIngestComplete={fetchTasks}
      />
      {fetchError && <div className="text-red-500 text-center my-4">{fetchError}</div>}
      {fetchLoading ? (
        <div className="text-center my-10">Loading tasks...</div>
      ) : (
        <TaskList
          tasks={sortedTasks}
          isLoading={fetchLoading}
          error={fetchError}
          onDelete={handleDeleteTask}
          onArchive={handleArchiveTask}
          onRestoreArchived={handleRestoreArchived}
          onDownloadRequest={handleDownloadRequest}
          onDownloadAudio={handleDownloadAudio}
          onExtractAudio={handleExtractAudio}
          onDeleteVideo={handleDeleteVideo}
          onDeleteAudio={handleDeleteAudio}
          onDownloadVtt={handleDownloadVtt}
          onDeleteVtt={handleDeleteVtt}
          onNaturalSegmentVtt={handleNaturalSegmentVtt}
          onMergeVtt={handleMergeVtt}
          onProcessSrt={handleProcessSrt}
          onMergeSrt={handleMergeSrt}
          onDeleteSrt={handleDeleteSrt}
          onDeleteAss={handleDeleteAss}
          onTranscribeWhisperX={handleTranscribeWhisperX}
          onDeleteWhisperX={handleDeleteWhisperX}
          onSplitTranscribeWhisperX={handleSplitTranscribeWhisperX}
          onCreateVideo={handleCreateVideo}
          onOpenFolder={handleOpenFolder}
          onGoToStudio={handleGoToStudio}
          sortField={sortField}
          sortOrder={sortOrder}
          handleSort={handleSort}
          SortIndicator={SortIndicator}
        />
      )}
    </div>
  );
}

export default TaskListPage; 
