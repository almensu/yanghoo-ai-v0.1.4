import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import IngestForm from '../components/IngestForm';
import TaskList from '../components/TaskList';

function TaskListPage({ apiBaseUrl, wsBaseUrl }) {
  const [tasks, setTasks] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const ws = useRef(null);
  const navigate = useNavigate();

  // Modified: Ensure all tasks are included, archiving status is handled by backend/display only
  const filteredTasks = useMemo(() => {
    // The sorting logic based on 'archived' can remain if you want archived tasks
    // to appear at the bottom, but they will still be visible and interactable.
    // If you want no visual distinction in order, remove the sort or adjust.
    // For now, keeping the sort as it doesn't filter out.
    return tasks.sort((a, b) => {
      if (a.archived !== b.archived) {
        return a.archived ? 1 : -1; // Archived tasks sort to the bottom
      }
      return 0; // Maintain original order for tasks with same archive status
    });
  }, [tasks]);

  const fetchTasks = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks`);
      const sortedTasks = response.data.sort((a, b) => {
        // This initial sort from fetch can also be simplified if the useMemo sort handles it,
        // or if the backend already provides a preferred order.
        // For now, let's match the useMemo sort for consistency.
        if (a.archived !== b.archived) {
          return a.archived ? 1 : -1;
        }
        return 0; 
      });
      setTasks(sortedTasks);
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

  const handleMergeVtt = async (uuid, format = 'all') => {
    setFetchLoading(true);
    setFetchError(null);
    let mergeError = null;
    try {
      try { await axios.post(`${apiBaseUrl}/api/tasks/${uuid}/merge_vtt`, { format: format }); } catch (err) { mergeError = err; }
      if (mergeError) throw mergeError;
      alert('VTT 处理请求已发送。');
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

  return (
    <div className="container mx-auto p-4 pt-8 flex flex-col h-full">
      <IngestForm
        API_BASE_URL={apiBaseUrl}
        onIngestComplete={fetchTasks}
      />
      <TaskList
        tasks={filteredTasks}
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
        onMergeVtt={handleMergeVtt}
        onTranscribeWhisperX={handleTranscribeWhisperX}
        onDeleteWhisperX={handleDeleteWhisperX}
        onCreateVideo={handleCreateVideo}
        onOpenFolder={handleOpenFolder}
        onGoToStudio={handleGoToStudio}
      />
    </div>
  );
}

export default TaskListPage; 