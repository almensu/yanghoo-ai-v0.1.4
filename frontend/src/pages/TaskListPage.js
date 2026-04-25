import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import IngestForm from '../components/IngestForm';
import TaskList from '../components/TaskList';

// Helper for sorting icons
const SortIndicator = ({ order }) => {
  if (!order) return null;
  return order === 'asc' ? ' ▲' : ' ▼';
};

function TaskListPage({ apiBaseUrl, wsBaseUrl }) {
  const [tasks, setTasks] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('all');
  const [archiveFilter, setArchiveFilter] = useState('active'); // 'all', 'active', 'archived'
  const [assetFilter, setAssetFilter] = useState('all'); // 'all', 'has_subtitles', 'has_markdown', 'has_keyframes'

  const ws = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('search')) setSearchQuery(params.get('search'));
    if (params.get('platform')) setPlatformFilter(params.get('platform'));
    if (params.get('archive')) setArchiveFilter(params.get('archive'));
    if (params.get('asset')) setAssetFilter(params.get('asset'));
    if (params.get('sort')) setSortField(params.get('sort'));
    if (params.get('order')) setSortOrder(params.get('order'));
  }, [location.search]); // Sync when search string changes

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (platformFilter !== 'all') params.set('platform', platformFilter);
    if (archiveFilter !== 'active') params.set('archive', archiveFilter);
    if (assetFilter !== 'all') params.set('asset', assetFilter);
    if (sortField !== 'created_at') params.set('sort', sortField);
    if (sortOrder !== 'desc') params.set('order', sortOrder);
    
    const newRelativePathQuery = window.location.pathname + '?' + params.toString();
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [searchQuery, platformFilter, archiveFilter, assetFilter, sortField, sortOrder]);

  const handleSort = useCallback((field, order) => {
    if (order) {
      setSortField(field);
      setSortOrder(order);
    } else {
      setSortOrder(currentOrder => {
        if (sortField === field) {
          return currentOrder === 'asc' ? 'desc' : 'asc';
        }
        return 'asc';
      });
      setSortField(field);
    }
  }, [sortField]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Search Query
      const query = searchQuery.toLowerCase();
      const matchesSearch = !query || 
        (task.title && task.title.toLowerCase().includes(query)) ||
        (task.url && task.url.toLowerCase().includes(query)) ||
        (task.uuid && task.uuid.toLowerCase().includes(query));
      
      if (!matchesSearch) return false;

      // 2. Platform Filter
      if (platformFilter !== 'all' && task.platform !== platformFilter) return false;

      // 3. Archive Filter
      if (archiveFilter === 'active' && task.archived) return false;
      if (archiveFilter === 'archived' && !task.archived) return false;

      // 4. Asset Filter
      if (assetFilter === 'has_subtitles') {
        const hasVtt = task.vtt_files && Object.keys(task.vtt_files).length > 0;
        const hasSrt = task.srt_files && Object.keys(task.srt_files).length > 0;
        const hasSentences = !!task.sentences_json_path;
        if (!hasVtt && !hasSrt && !hasSentences) return false;
      }
      if (assetFilter === 'has_markdown') {
        const hasMd = !!task.markdown_path || !!task.parallel_vtt_md_path || (task.srt_md_files && Object.keys(task.srt_md_files).length > 0);
        if (!hasMd) return false;
      }
      if (assetFilter === 'has_keyframes') {
        if (!task.keyframes_count || task.keyframes_count <= 0) return false;
      }

      return true;
    });
  }, [tasks, searchQuery, platformFilter, archiveFilter, assetFilter]);

  const sortedTasks = useMemo(() => {
    let sorted = [...filteredTasks];
    if (sortField) {
      sorted.sort((a, b) => {
        let valA, valB;

        if (sortField === 'created_at' || sortField === 'last_modified') {
          valA = a[sortField] ? new Date(a[sortField]).getTime() : 0;
          valB = b[sortField] ? new Date(b[sortField]).getTime() : 0;
        } else {
          valA = a[sortField] ? String(a[sortField]).toLowerCase() : '';
          valB = b[sortField] ? String(b[sortField]).toLowerCase() : '';
        }
        
        let comparison = 0;
        if (valA > valB) comparison = 1;
        else if (valA < valB) comparison = -1;
        return sortOrder === 'asc' ? comparison : comparison * -1;
      });
    }
    return sorted;
  }, [filteredTasks, sortField, sortOrder]);

  const fetchTasks = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks`);
      // Initial sort from backend might not be needed if client-side sort is comprehensive
      // For now, remove initial client-side sort here to rely on the main sortedTasks useMemo
      setTasks(response.data);
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

  useEffect(() => {
    const connectWebSocket = () => {
      ws.current = new WebSocket(`${wsBaseUrl}/ws`);
      console.log('Attempting WebSocket connection...');

      ws.current.onopen = () => console.log('WebSocket Connected');
      ws.current.onclose = (event) => console.log('WebSocket Disconnected', event.reason, `Code: ${event.code}`);
      ws.current.onerror = (error) => console.error('WebSocket Error:', error);

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log('WebSocket Message Received:', message);

          if (message.type === 'task_update' && message.uuid && message.task_data) {
            setTasks(currentTasks => {
              const taskExists = currentTasks.some(task => task.uuid === message.uuid);
              if (taskExists) {
                return currentTasks.map(task =>
                  task.uuid === message.uuid ? { ...task, ...message.task_data } : task
                );
              } else {
                console.warn('Received update for non-existing task via WS:', message.uuid, 'Refetching tasks.');
                fetchTasks();
                return currentTasks;
              }
            });
            if (message.status === 'failed') {
              alert(`Task ${message.uuid} failed processing: ${message.error || 'Unknown error'}`);
            }
          } else {
            console.warn('Received unknown WebSocket message format:', message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message or updating state:', error);
        }
      };
    };

    if (wsBaseUrl) {
      connectWebSocket();
    }

    return () => {
      if (ws.current) {
        console.log('Closing WebSocket connection...');
        ws.current.close();
      }
    };
  }, [wsBaseUrl, fetchTasks]);

  const handleDeleteTask = async (taskUuid) => {
    console.log(`Attempting to delete task: ${taskUuid}`);
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        let errorDetail = `HTTP error! status: ${res.status}`;
        try { const errorData = await res.json(); errorDetail = errorData.detail || errorDetail; } catch (jsonError) { }
        throw new Error(errorDetail);
      }
      console.log(`Successfully deleted task: ${taskUuid}`);
      setTasks(currentTasks => currentTasks.filter(task => task.uuid !== taskUuid));
    } catch (e) {
      console.error("Error deleting task:", e);
      alert(`Failed to delete task: ${e.message}`);
    }
  };

  const handleArchiveTask = async (taskUuid) => {
    if (!window.confirm("Are you sure you want to archive this task?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/archive`, { method: 'POST' });
      if (res.ok) {
        const updatedTaskData = await res.json();
        setTasks(currentTasks => currentTasks.map(task => task.uuid === taskUuid ? { ...task, ...updatedTaskData } : task));
        alert(`Task ${taskUuid} archived successfully.`);
      } else {
        let errorDetail = `HTTP error! status: ${res.status}`;
        try { if (res.headers.get("content-length") !== "0" && res.headers.get("content-type")?.includes("application/json")) { const errorData = await res.json(); errorDetail = errorData.detail || errorDetail; }} catch (jsonError) { console.warn("Could not parse error JSON", jsonError); }
        throw new Error(errorDetail);
      }
    } catch (e) { alert(`Failed to archive task: ${e.message}`); }
  };

  const handleRestoreArchived = async () => {
    if (!window.confirm("Are you sure you want to restore archived tasks?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/restore_archived`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      alert(data.message || "Restore request processed.");
      await fetchTasks();
    } catch (e) { alert(`Failed to restore archived tasks: ${e.message}`); }
  };

  const handleDownloadRequest = async (taskUuid, quality) => {
    if (!quality) { alert("Quality required."); return; }
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/download_media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      alert(`Download request for ${taskUuid} successful: ${data.message}`);
      await fetchTasks();
    } catch (e) {
      alert(`Failed download for ${taskUuid}: ${e.message}`);
    }
  };

  const handleExtractAudio = async (taskUuid) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/extract_audio`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      alert(`Audio extraction for ${taskUuid} successful: ${data.wav_path}`);
      await fetchTasks();
    } catch (e) {
      alert(`Failed extraction for ${taskUuid}: ${e.message}`);
    }
  };

  const handleDeleteVideo = async (taskUuid) => {
    if (!window.confirm("Delete video files?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/media/video`, { method: 'DELETE' });
      if (!res.ok) {
        let error = `HTTP ${res.status}`;
        try { const d = await res.json(); error = d.detail || error; } catch (e) { }
        throw new Error(error);
      }
      alert(`Video deleted for ${taskUuid}.`);
      await fetchTasks();
    } catch (e) {
      alert(`Failed delete video: ${e.message}`);
    }
  };

  const handleDeleteAudio = async (taskUuid) => {
    if (!window.confirm("Delete audio file?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/media/audio`, { method: 'DELETE' });
      if (!res.ok) {
        let error = `HTTP ${res.status}`;
        try { const d = await res.json(); error = d.detail || error; } catch (e) { }
        throw new Error(error);
      }
      alert(`Audio deleted for ${taskUuid}.`);
      await fetchTasks();
    } catch (e) {
      alert(`Failed delete audio: ${e.message}`);
    }
  };

  const handleDownloadAudio = async (taskUuid) => {
    console.log(`Attempting to download audio directly for task: ${taskUuid}`);
    alert(`Starting direct audio download for ${taskUuid}...`);
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/download_audio`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      }
      console.log(`Successfully downloaded audio for task: ${taskUuid}`, data);
      alert(`Audio download successful for ${taskUuid}! Path: ${data.audio_path}`);
      await fetchTasks(); // Refresh tasks
    } catch (e) {
      console.error("Error downloading audio:", e);
      alert(`Failed to download audio for task ${taskUuid}: ${e.message}`);
    }
  };

  const handleDownloadVtt = async (taskUuid, langCode) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/download_vtt`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      const files = data.vtt_files ? Object.keys(data.vtt_files).join(', ') : 'None';
      alert(`VTT DL for ${taskUuid}: ${data.message}. Files: ${files}`);
      await fetchTasks();
    } catch (e) {
      alert(`Failed VTT DL for ${taskUuid}: ${e.message}`);
    }
  };

  const handleDeleteVtt = async (taskUuid, langCode) => {
    if (!window.confirm(`Delete ${langCode} VTT?`)) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/vtt/${langCode}`, { method: 'DELETE' });
      if (res.status === 204) {
        alert(`VTT ${langCode} deleted for ${taskUuid}.`);
        await fetchTasks();
      } else {
        let error = `HTTP ${res.status}`;
        try { const d = await res.json(); error = d.detail || error; } catch (e) { }
        throw new Error(error);
      }
    } catch (e) {
      alert(`Failed delete ${langCode} VTT: ${e.message}`);
    }
  };

  const handleNaturalSegmentVtt = async (taskUuid, mergeThreshold = 0.8) => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/natural-segment-vtt/${taskUuid}?merge_threshold=${mergeThreshold}`, {
        method: 'POST'
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      }
      
      alert(`VTT自然断句处理完成！处理了 ${Object.keys(data.result.processed_files).length} 个文件`);
      await fetchTasks();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed VTT natural segmentation.';
      setFetchError(msg);
      alert(`VTT自然断句处理失败: ${msg}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleMergeVtt = async (uuid, format = 'all', useSegmented = false) => {
    setFetchLoading(true);
    setFetchError(null);
    let mergeError = null;
    try {
      try { 
        await axios.post(`${apiBaseUrl}/api/tasks/${uuid}/merge_vtt`, { 
          format: format, 
          use_segmented: useSegmented 
        }); 
      } catch (err) { mergeError = err; }
      if (mergeError) throw mergeError;
      alert(`VTT ${useSegmented ? '(使用自然断句版本) ' : ''}处理请求已发送。`);
      setTimeout(fetchTasks, 2000);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed VTT merge.';
      setFetchError(msg);
      alert(`Error VTT merge: ${msg}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleTranscribeWhisperX = async (taskUuid, model) => {
    if (!taskUuid || !model) { alert("UUID/Model required."); return; }
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/transcribe_whisperx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(ts => ts.map(t => t.uuid === taskUuid ? { ...t, ...data } : t));
      } else {
        const data = await res.json();
        throw new Error(data.detail || `WhisperX failed: ${res.status}`);
      }
    } catch (e) {
      alert(`Failed WhisperX for ${taskUuid}: ${e.message}`);
    }
  };

  const handleDeleteWhisperX = async (taskUuid) => {
    if (!window.confirm("Delete WhisperX transcript?")) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/transcribe_whisperx`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || `Delete failed: ${res.status}`);
      alert(data.message || `WhisperX deleted for ${taskUuid}.`);
      if (data.task_data) setTasks(ts => ts.map(t => t.uuid === taskUuid ? { ...t, ...data.task_data } : t));
      else fetchTasks();
    } catch (e) {
      alert(`Failed delete WhisperX: ${e.message}`);
    }
  };

  const handleSplitTranscribeWhisperX = async (taskUuid, model) => {
    if (!taskUuid || !model) { alert("UUID/Model required."); return; }
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/split_transcribe_whisperx`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model })
      });
      if (res.ok) {
        await res.json();
        alert(`Started split-transcribe job for ${taskUuid} using model ${model}`);
        setTasks(ts => ts.map(t => t.uuid === taskUuid ? { ...t, transcription_status: "processing", transcription_model: model } : t));
      } else {
        const data = await res.json();
        throw new Error(data.detail || `Split-transcribe WhisperX failed: ${res.status}`);
      }
    } catch (e) {
      alert(`Failed split-transcribe WhisperX for ${taskUuid}: ${e.message}`);
    }
  };

  const handleCreateVideo = async (taskUuid) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/create_video`, { method: 'POST' });
      if (!res.ok) {
        let error = `HTTP ${res.status}`;
        try { const d = await res.json(); error = d.detail || error; } catch (e) { }
        throw new Error(error);
      }
      const result = await res.json();
      alert(`Video created: ${result.output_path}`);
    } catch (e) {
      alert(`Failed create video: ${e.message}`);
    }
  };

  const handleOpenFolder = async (taskUuid) => {
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/open_folder`, { method: 'POST' });
      if (!res.ok) {
        let error = `HTTP ${res.status}`;
        try { const d = await res.json(); error = d.detail || error; } catch (e) { }
        throw new Error(error);
      }
      console.log(`Open folder requested for ${taskUuid}`);
    } catch (e) {
      alert(`Failed folder open: ${e.message}`);
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
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/process_srt`, { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      }
      
      const processedCount = Object.keys(data.processed_files || {}).length;
      alert(`SRT处理完成！生成了 ${processedCount} 个分离文件。统计：${JSON.stringify(data.stats)}`);
      await fetchTasks();
    } catch (err) {
      const msg = err.message || 'Failed SRT processing.';
      setFetchError(msg);
      alert(`SRT处理失败: ${msg}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleMergeSrt = async (taskUuid) => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/merge_srt`, { method: 'POST' });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      }
      
      const generatedCount = Object.keys(data.generated_files || {}).length;
      alert(`SRT合并完成！生成了 ${generatedCount} 个MD文件。`);
      await fetchTasks();
    } catch (err) {
      const msg = err.message || 'Failed SRT merge.';
      setFetchError(msg);
      alert(`SRT合并失败: ${msg}`);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleDeleteSrt = async (taskUuid, langCode) => {
    if (!window.confirm(`Delete ${langCode} SRT?`)) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/srt/${langCode}`, { method: 'DELETE' });
      if (res.status === 204) {
        alert(`SRT ${langCode} deleted for ${taskUuid}.`);
        await fetchTasks();
      } else {
        let error = `HTTP ${res.status}`;
        try { const d = await res.json(); error = d.detail || error; } catch (e) { }
        throw new Error(error);
      }
    } catch (e) {
      alert(`Failed delete ${langCode} SRT: ${e.message}`);
    }
  };

  const handleDeleteAss = async (taskUuid, langCode) => {
    if (!window.confirm(`Delete ${langCode} ASS?`)) return;
    try {
      const res = await fetch(`${apiBaseUrl}/api/tasks/${taskUuid}/ass/${langCode}`, { method: 'DELETE' });
      if (res.status === 204) {
        alert(`ASS ${langCode} deleted for ${taskUuid}.`);
        await fetchTasks();
      } else {
        let error = `HTTP ${res.status}`;
        try { const d = await res.json(); error = d.detail || error; } catch (e) { }
        throw new Error(error);
      }
    } catch (e) {
      alert(`Failed delete ${langCode} ASS: ${e.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 pt-8 flex flex-col h-full">
      <IngestForm
        API_BASE_URL={apiBaseUrl}
        onIngestComplete={fetchTasks}
      />
      
      <TaskList
        tasks={sortedTasks}
        totalTasksCount={tasks.length}
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
        
        // Sorting
        sortField={sortField}
        sortOrder={sortOrder}
        handleSort={handleSort}
        SortIndicator={SortIndicator}

        // Filtering
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        platformFilter={platformFilter}
        setPlatformFilter={setPlatformFilter}
        archiveFilter={archiveFilter}
        setArchiveFilter={setArchiveFilter}
        assetFilter={assetFilter}
        setAssetFilter={setAssetFilter}
      />
    </div>
  );
}

export default TaskListPage; 