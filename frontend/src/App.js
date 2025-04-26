import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import { FaArchive, FaUndo } from 'react-icons/fa'; // Import new icons
// Uncomment the view components
import CardView from './components/CardView';
import TableView from './components/TableView';
import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000'; // Replace with your backend URL
const WS_BASE_URL = 'ws://127.0.0.1:8000'; // WebSocket URL

function App() {
  // State for the URL input form
  const [url, setUrl] = useState('');
  const [ingestResponse, setIngestResponse] = useState(null);
  const [ingestLoading, setIngestLoading] = useState(false);
  const [ingestError, setIngestError] = useState(null);

  // State for the task list
  const [tasks, setTasks] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true); // Loading state for fetching tasks
  const [fetchError, setFetchError] = useState(null); // Error state for fetching tasks
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArchived, setFilterArchived] = useState(false); // State for filtering archived tasks

  // Ref for the WebSocket object
  const ws = useRef(null);

  // --- Fetch Tasks --- 
  const fetchTasks = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/tasks`);
      // Sort tasks so unarchived appear first, then potentially by date or title
      const sortedTasks = response.data.sort((a, b) => {
          if (a.archived !== b.archived) {
              return a.archived ? 1 : -1; // Unarchived first
          }
          // Add secondary sorting if needed, e.g., by title
          // return a.title.localeCompare(b.title);
          return 0; // Keep original order among same archive status for now
      });
      setTasks(sortedTasks);
      setFetchError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setFetchError('Failed to fetch tasks. Please check the backend connection.');
      setTasks([]); // Clear tasks on error
    } finally {
      setFetchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --- WebSocket Connection --- 
  useEffect(() => {
    // Function to establish connection
    const connectWebSocket = () => {
        ws.current = new WebSocket(`${WS_BASE_URL}/ws`);
        console.log('Attempting WebSocket connection...');

        ws.current.onopen = () => {
            console.log('WebSocket Connected');
        };

        ws.current.onclose = (event) => {
            console.log('WebSocket Disconnected', event.reason, `Code: ${event.code}`);
            // Optional: Attempt to reconnect after a delay
            // setTimeout(connectWebSocket, 5000); 
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket Error:', error);
        };

        ws.current.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log('WebSocket Message Received:', message);

                // Check message type (we expect 'task_update')
                if (message.type === 'task_update' && message.uuid && message.task_data) {
                    setTasks(currentTasks => {
                        // Find the task and update it
                        const taskExists = currentTasks.some(task => task.uuid === message.uuid);
                        if (taskExists) {
                            return currentTasks.map(task =>
                                task.uuid === message.uuid
                                ? { ...task, ...message.task_data } // Merge the updated data
                                : task
                            );
                        } else {
                            // If task doesn't exist locally yet (e.g., freshly ingested), add it
                            // This might need refinement based on how ingestion updates work
                            // console.warn('Received update for non-existing task:', message.uuid);
                            // return [...currentTasks, message.task_data]; 
                            return currentTasks; // Or simply ignore if task not found
                        }
                    });
                     // Optional: Add a visual cue/notification that a task updated
                    if (message.status === 'failed') {
                        alert(`Task ${message.uuid} failed processing: ${message.error || 'Unknown error'}`);
                    } else {
                         // Maybe a subtle notification instead of alert for success?
                        console.log(`Task ${message.uuid} updated via WebSocket.`);
                    }
                } else {
                     console.warn('Received unknown WebSocket message format:', message);
                }
            } catch (error) {
                console.error('Error parsing WebSocket message or updating state:', error);
            }
        };
    }

    connectWebSocket(); // Initial connection attempt

    // Cleanup function on component unmount
    return () => {
        if (ws.current) {
            console.log('Closing WebSocket connection...');
            ws.current.close();
        }
    };
}, []); // Empty dependency array ensures this runs only once on mount

  // --- Handle Ingest and Fetch Info ---
  const handleIngestSubmit = async (event) => {
    event.preventDefault();
    setIngestLoading(true);
    setIngestError(null);
    setIngestResponse(null);
    let ingestedTaskUuid = null; // Variable to hold the UUID

    try {
      // --- Step 1: Ingest URL ---
      const ingestRes = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const ingestData = await ingestRes.json();
      if (!ingestRes.ok) {
        throw new Error(`Ingest failed: ${ingestData.detail || `HTTP error! status: ${ingestRes.status}`}`);
      }
      
      // Store the UUID from the successful ingest response
      ingestedTaskUuid = ingestData.metadata?.uuid; 
      if (!ingestedTaskUuid) {
          throw new Error("Ingest successful, but no UUID received in metadata.");
      }
      
      setIngestResponse(ingestData); // Keep original response if needed
      setUrl(''); // Clear input on initial success

      // --- Step 2: Fetch Info JSON ---
      // Use the UUID obtained from the ingest step
      console.log(`Ingest successful for ${ingestedTaskUuid}. Now fetching info.json...`);
      try {
         const fetchInfoRes = await fetch(`/api/tasks/${ingestedTaskUuid}/fetch_info_json`, {
             method: 'POST',
             // No body needed if the backend doesn't require it
         });
         const fetchInfoData = await fetchInfoRes.json();
         if (!fetchInfoRes.ok) {
             // Log this error, but don't necessarily stop the whole process
             // The task list will still refresh, showing the ingested task
             console.error(`Failed to fetch info.json for ${ingestedTaskUuid}: ${fetchInfoData.detail || `HTTP error! status: ${fetchInfoRes.status}`}`);
             setIngestError(`Ingest successful, but failed to auto-fetch info.json: ${fetchInfoData.detail || fetchInfoRes.statusText}`);
         } else {
              console.log(`Successfully fetched info.json for ${ingestedTaskUuid}`, fetchInfoData);
              // Optional: Show a more specific success message
         }
      } catch (fetchInfoError) {
          console.error(`Error during fetch_info_json call for ${ingestedTaskUuid}:`, fetchInfoError);
          setIngestError(`Ingest successful, but an error occurred during auto-fetch of info.json: ${fetchInfoError.message}`);
      }

      // --- Step 3: Refresh Task List ---
      // Always refresh the task list regardless of info.json fetch outcome
      await fetchTasks();

    } catch (e) {
      console.error("Error during ingest process:", e);
      setIngestError(e.message || 'An unexpected error occurred during ingest.');
      // Do not clear URL input on error
    } finally {
      setIngestLoading(false);
    }
  };

  // --- Handle Delete --- 
  const handleDeleteTask = async (taskUuid) => {
    // Optional: Add confirmation dialog
    // if (!window.confirm("Are you sure you want to delete this task and its data?")) {
    //   return;
    // }

    // Indicate deletion in UI (e.g., disable button, change style) - TBD
    console.log(`Attempting to delete task: ${taskUuid}`); 

    try {
      const res = await fetch(`/api/tasks/${taskUuid}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        // Try to get error detail from backend if possible
        let errorDetail = `HTTP error! status: ${res.status}`;
        try {
          const errorData = await res.json();
          errorDetail = errorData.detail || errorDetail;
        } catch (jsonError) {
          // Ignore if response is not JSON
        }
        throw new Error(errorDetail);
      }

      // If deletion is successful (status 204 No Content or 200 OK)
      console.log(`Successfully deleted task: ${taskUuid}`);
      setTasks(currentTasks => currentTasks.filter(task => task.uuid !== taskUuid));
      
    } catch (e) {
      console.error("Error deleting task:", e);
      // Display error to the user (e.g., using a toast notification library or state)
      alert(`Failed to delete task: ${e.message}`); // Simple alert for now
    }
  };

  // --- START: Handle Archive --- 
  const handleArchiveTask = async (taskUuid) => {
    if (!window.confirm("Are you sure you want to archive this task? It will be removed from the active list.")) {
      return;
    }
    console.log(`Attempting to archive task: ${taskUuid}`);
    try {
      const res = await fetch(`/api/tasks/${taskUuid}/archive`, {
        method: 'POST',
      });

      // Expect 200 OK with updated task data
      if (res.ok) { 
        const updatedTaskData = await res.json(); // Get the updated task
        console.log(`Successfully archived task: ${taskUuid}`, updatedTaskData);
        alert(`Task ${taskUuid} archived successfully.`);
        
        // Update local state instead of filtering
        setTasks(currentTasks => 
          currentTasks.map(task => 
            task.uuid === taskUuid ? { ...task, ...updatedTaskData } : task
          )
        );
      } else {
          let errorDetail = `HTTP error! status: ${res.status}`;
          try {
              // Attempt to parse error details (e.g., 409 Conflict message)
              if (res.headers.get("content-length") !== "0" && res.headers.get("content-type")?.includes("application/json")) {
                  const errorData = await res.json();
                  errorDetail = errorData.detail || errorDetail;
              }
          } catch (jsonError) { 
              console.warn("Could not parse error JSON from archive response:", jsonError);
          }
           throw new Error(errorDetail);
      }

    } catch (e) {
      console.error("Error archiving task:", e);
      alert(`Failed to archive task: ${e.message}`);
    }
  };
  // --- END: Handle Archive --- 

  // --- START: Handle Restore --- 
  const handleRestoreArchived = async () => {
     if (!window.confirm("Are you sure you want to restore all archived tasks? This is only possible if the current task list is empty.")) {
      return;
    }
    console.log("Attempting to restore archived tasks...");
    try {
      const res = await fetch(`/api/tasks/restore_archived`, {
        method: 'POST',
      });
      
      const data = await res.json(); // Expect JSON response
      
      if (!res.ok) {
         // Handle specific error like list not being empty
         throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      }
      
      // Handle success (even if 0 restored)
      console.log("Restore response:", data);
      alert(data.message || "Restore request processed.");
      await fetchTasks(); // Refresh the task list
      
    } catch (e) {
      console.error("Error restoring archived tasks:", e);
      alert(`Failed to restore archived tasks: ${e.message}`);
    }
  };
  // --- END: Handle Restore ---

  // --- Handle Download Media (Video or Audio) --- 
  const handleDownloadRequest = async (taskUuid, quality) => {
    // Ensure quality is provided
    if (!quality) {
      alert("Download quality must be specified.");
      return;
    }
    console.log(`Attempting to download media for task: ${taskUuid}, quality: ${quality}`);
    alert(`Starting download for ${taskUuid} (Quality: ${quality})... Check console for progress/errors.`); 

    try {
      const res = await fetch(`/api/tasks/${taskUuid}/download_media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quality }),
      });

      const data = await res.json(); // Assuming backend sends back JSON on success/error

      if (!res.ok) {
        throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      }

      console.log(`Successfully started/completed download for task: ${taskUuid}`, data);
      // Update UI or state if needed based on `data` (e.g., show file path)
      alert(`Download request for ${taskUuid} successful! Backend response: ${data.message}`);
      await fetchTasks(); 

    } catch (e) {
      console.error("Error downloading media:", e);
      alert(`Failed to download media for task ${taskUuid}: ${e.message}`);
    } finally {
      // Clear loading state indicator if you added one
    }
  };

  // --- Handle Extract Audio --- 
  const handleExtractAudio = async (taskUuid) => {
    console.log(`Attempting to extract audio for task: ${taskUuid}`);
    // Indicate loading/processing start (e.g., via state or simple alert)
    alert(`Starting audio extraction for ${taskUuid}... This might take a while.`);

    try {
      const res = await fetch(`/api/tasks/${taskUuid}/extract_audio`, {
        method: 'POST',
        // No body needed for this request
      });

      const data = await res.json(); // Expect JSON response on success or structured error

      if (!res.ok) {
        // Handle specific errors like needing to download first, or generic errors
        const errorMsg = data.detail || `HTTP error! status: ${res.status}`;
        console.error("Audio extraction error:", errorMsg);
        alert(`Failed to extract audio for task ${taskUuid}: ${errorMsg}`);
        return; // Stop processing on error
      }

      // Handle success
      console.log(`Successfully extracted audio for task: ${taskUuid}`, data);
      alert(`Audio extraction successful for ${taskUuid}! Output: ${data.wav_path} (${data.message})`);
      
      await fetchTasks(); 

    } catch (e) {
      console.error("Error during audio extraction fetch:", e);
      alert(`Failed to extract audio for task ${taskUuid}: An unexpected network or parsing error occurred. ${e.message}`);
    } finally {
       // Clear loading/processing state indicator if implemented
    }
  };

  // --- Handle Delete Video Only --- 
  const handleDeleteVideo = async (taskUuid) => {
    if (!window.confirm("Are you sure you want to delete all video files for this task?")) {
      return;
    }
    console.log(`Attempting to delete video files for task: ${taskUuid}`);
    try {
      const res = await fetch(`/api/tasks/${taskUuid}/media/video`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        let errorDetail = `HTTP error! status: ${res.status}`;
        try {
          if (res.headers.get("content-length") !== "0" && res.headers.get("content-type")?.includes("application/json")) {
             const errorData = await res.json();
             errorDetail = errorData.detail || errorDetail;
          }
        } catch (jsonError) { console.warn("Could not parse error JSON:", jsonError); }
        throw new Error(errorDetail);
      }
      console.log(`Successfully deleted video files for task: ${taskUuid}`);
      alert(`Video files for task ${taskUuid} deleted successfully.`);
      await fetchTasks(); // Refresh tasks to update UI state
    } catch (e) {
      console.error("Error deleting video files:", e);
      alert(`Failed to delete video files: ${e.message}`);
    }
  };

  // --- Handle Delete Audio Only --- 
  const handleDeleteAudio = async (taskUuid) => {
    if (!window.confirm("Are you sure you want to delete the audio file for this task?")) {
      return;
    }
    console.log(`Attempting to delete audio file for task: ${taskUuid}`);
    try {
      const res = await fetch(`/api/tasks/${taskUuid}/media/audio`, {
        method: 'DELETE',
      });
       if (!res.ok) {
        let errorDetail = `HTTP error! status: ${res.status}`;
        try {
          if (res.headers.get("content-length") !== "0" && res.headers.get("content-type")?.includes("application/json")) {
             const errorData = await res.json();
             errorDetail = errorData.detail || errorDetail;
          }
        } catch (jsonError) { console.warn("Could not parse error JSON:", jsonError); }
        throw new Error(errorDetail);
      }
      console.log(`Successfully deleted audio file for task: ${taskUuid}`);
      alert(`Audio file for task ${taskUuid} deleted successfully.`);
      await fetchTasks(); // Refresh tasks to update UI state
    } catch (e) {
      console.error("Error deleting audio file:", e);
      alert(`Failed to delete audio file: ${e.message}`);
    }
  };

  // Add the new VTT handlers
  const handleDownloadVtt = async (taskUuid, langCode) => {
    console.log(`Attempting to download available VTTs (triggered by ${langCode} button) for task: ${taskUuid}`);
    alert(`Starting VTT download for ${taskUuid}... Backend will attempt to fetch available languages (EN/ZH).`); 
    try {
      // Call the new endpoint, no body needed
      const res = await fetch(`/api/tasks/${taskUuid}/download_vtt`, { 
        method: 'POST',
        headers: { 
           // No Content-Type needed if no body is sent
        },
        // No body: body: JSON.stringify({ lang_code: langCode }), 
      });
      
      const data = await res.json(); // Get the response data (message and potentially vtt_files)
      
      if (!res.ok) {
        throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      }
      
      console.log(`Successfully initiated VTT download for task: ${taskUuid}`, data);
      // Provide more informative feedback based on response
      const filesDownloaded = data.vtt_files ? Object.keys(data.vtt_files).join(', ') : 'None found or specified in response.';
      alert(`VTT download request for ${taskUuid} finished. Message: ${data.message}. Files listed in metadata: ${filesDownloaded}`);
      
      await fetchTasks(); // Refresh tasks to update UI with new vtt_files status
    } catch (e) {
      console.error(`Error requesting VTT download for task ${taskUuid}:`, e);
      alert(`Failed to request VTT download for task ${taskUuid}: ${e.message}`);
    }
  };

  const handleDeleteVtt = async (taskUuid, langCode) => {
    if (!window.confirm(`Are you sure you want to delete the ${langCode} VTT file for this task?`)) {
      return;
    }
    console.log(`Attempting to delete VTT (${langCode}) for task: ${taskUuid}`);
    try {
      // Call the new, correct endpoint
      const res = await fetch(`/api/tasks/${taskUuid}/vtt/${langCode}`, { 
        method: 'DELETE',
      });
      
      // Check response status for success (204 No Content means success for DELETE)
      if (res.status === 204) {
          console.log(`Successfully deleted VTT (${langCode}) for task: ${taskUuid}`);
          alert(`VTT (${langCode}) file for task ${taskUuid} deleted successfully.`);
          await fetchTasks(); // Refresh tasks to update UI
      } else {
          // Handle potential errors even if fetch didn't throw (e.g., 404, 500)
          let errorDetail = `HTTP error! status: ${res.status}`;
          try {
              // Attempt to parse error detail from response body if it exists and is JSON
              if (res.headers.get("content-length") !== "0" && res.headers.get("content-type")?.includes("application/json")) {
                  const errorData = await res.json();
                  errorDetail = errorData.detail || errorDetail;
              }
          } catch (jsonError) { 
              console.warn("Could not parse error JSON from DELETE response:", jsonError);
          }
           throw new Error(errorDetail);
      }
      
    } catch (e) {
      console.error(`Error deleting VTT (${langCode}):`, e);
      alert(`Failed to delete VTT (${langCode}) file: ${e.message}`);
    }
  };

  // --- Handle Merge Transcripts --- 
  const handleMergeTranscripts = async (taskUuid) => {
    console.log(`Attempting to merge transcripts for task: ${taskUuid}`);
    alert(`Starting transcript merge for ${taskUuid}...`);
    try {
      const res = await fetch(`/api/tasks/${taskUuid}/merge`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      }
      console.log(`Successfully merged transcripts for task: ${taskUuid}`, data);
      alert(`Transcript merge successful for ${taskUuid}! Output: ${data.merged_file_path}`);
      await fetchTasks(); // Refresh tasks
    } catch (e) {
      console.error("Error merging transcripts:", e);
      alert(`Failed to merge transcripts for task ${taskUuid}: ${e.message}`);
    }
  };

  // --- START: Handle Download Audio --- 
  const handleDownloadAudio = async (taskUuid) => {
    console.log(`Attempting to download audio directly for task: ${taskUuid}`);
    alert(`Starting direct audio download for ${taskUuid}...`);
    try {
      const res = await fetch(`/api/tasks/${taskUuid}/download_audio`, {
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
  // --- END: Handle Download Audio ---

  // --- Merge VTT Handler ---
  // Remove format parameter and call API twice
  const handleMergeVtt = async (uuid) => { 
    setFetchLoading(true);
    setFetchError(null);
    let mergeError = null; // Track potential errors
    try {
      console.log(`Starting VTT merge requests for ${uuid} (merged & parallel)...`);
      // Call for 'merged' format
      try {
        await axios.post(`${API_BASE_URL}/api/tasks/${uuid}/merge_vtt`, { format: 'merged' });
        console.log(`VTT merge request for ${uuid} (format: merged) sent.`);
      } catch (err) {
         console.error("Error requesting VTT merge (merged):", err);
         mergeError = err; // Store first error encountered
      }

      // Call for 'parallel' format
      try {
        await axios.post(`${API_BASE_URL}/api/tasks/${uuid}/merge_vtt`, { format: 'parallel' });
        console.log(`VTT merge request for ${uuid} (format: parallel) sent.`);
      } catch (err) {
         console.error("Error requesting VTT merge (parallel):", err);
         if (!mergeError) mergeError = err; // Store error if no previous one
      }
      
      if (mergeError) {
          throw mergeError; // Re-throw if any error occurred
      }

      alert('VTT merge requests (merged & parallel) sent. Refresh list later to see the updated status.');
      setTimeout(fetchTasks, 2000); // Refetch to update UI state
    } catch (err) {
      // Use the stored error or provide a generic message
      setFetchError(err.response?.data?.detail || 'Failed to merge VTT files (one or both formats).');
      alert(`Error during VTT merge: ${err.response?.data?.detail || 'Failed to merge VTT files.'}`); // Also show alert on error
    } finally {
      setFetchLoading(false);
    }
  };

  // --- START: Handle WhisperX Transcription (REMOVE setTimeout) --- 
  const handleTranscribeWhisperX = async (taskUuid, model) => {
    if (!taskUuid || !model) {
        alert("Task UUID and WhisperX model are required.");
        return;
    }
    console.log(`Attempting WhisperX transcription for task: ${taskUuid} with model: ${model}`);
    // Indicate processing started (maybe update task state locally to 'processing')
    // setTasks(currentTasks => currentTasks.map(t => t.uuid === taskUuid ? {...t, status: 'processing'} : t));
    alert(`Starting WhisperX transcription for ${taskUuid} with model ${model}... This may block other actions. Status will update automatically.`); // Updated alert

    try {
        const res = await fetch(`${API_BASE_URL}/api/tasks/${taskUuid}/transcribe_whisperx`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: model }),
        });

        // API now waits and returns the final task data on success
        if (res.ok) { 
             const updatedTaskData = await res.json(); 
             console.log(`WhisperX transcription request completed for ${taskUuid}. Final state received.`, updatedTaskData);
             // Update state immediately with the final result (though WebSocket should also handle this)
             // It's slightly redundant but ensures immediate feedback after the await
              setTasks(currentTasks => 
                 currentTasks.map(task => 
                     task.uuid === taskUuid ? { ...task, ...updatedTaskData } : task
                 )
              );
              // Alert can be removed as state update + WS message provide feedback
              // alert(`Transcription completed for ${taskUuid}.`); 
        } else {
            // Handle non-OK responses (e.g., 4xx, 5xx from the synchronous API call)
            const errorData = await res.json();
            throw new Error(errorData.detail || `WhisperX transcription failed with status: ${res.status}`);
        }

    } catch (e) {
        console.error("Error during WhisperX transcription request:", e);
        alert(`Failed to start or complete WhisperX transcription: ${e.message}`);
        // Reset local 'processing' state if implemented
        // setTasks(currentTasks => currentTasks.map(t => t.uuid === taskUuid ? {...t, status: 'idle'} : t));
    }
  };
  // --- END: Handle WhisperX Transcription ---

  // --- START: Handle Delete WhisperX Transcript ---
  const handleDeleteWhisperX = async (taskUuid) => {
    if (!taskUuid) {
        alert("Task UUID is required.");
        return;
    }
    if (!window.confirm(`Are you sure you want to delete the WhisperX transcript for task ${taskUuid}?`)) {
        return;
    }
    console.log(`Attempting to delete WhisperX transcript for task: ${taskUuid}`);

    // TODO: Implement task-specific loading state if needed

    try {
        const res = await fetch(`${API_BASE_URL}/api/tasks/${taskUuid}/transcribe_whisperx`, {
            method: 'DELETE',
        });

        const data = await res.json(); // Expect updated task data or status message

        if (!res.ok) {
            throw new Error(data.detail || `Failed to delete WhisperX transcript with status: ${res.status}`);
        }

        console.log(`Successfully deleted WhisperX transcript for ${taskUuid}:`, data);
        alert(data.message || `WhisperX transcript deleted for ${taskUuid}.`);

        // Update the task state using the data returned from the backend
        if (data.task_data) {
            setTasks(currentTasks =>
                currentTasks.map(task =>
                    task.uuid === taskUuid
                    ? { ...task, ...data.task_data } // Merge the updated data
                    : task
                )
            );
        } else {
            // Fallback: Manually clear the fields if backend didn't return full data
            setTasks(currentTasks =>
                currentTasks.map(task =>
                    task.uuid === taskUuid
                    ? { ...task, whisperx_json_path: null, transcription_model: null } 
                    : task
                )
            );
            // Consider calling fetchTasks() as another fallback
            // await fetchTasks();
        }

    } catch (e) {
        console.error("Error deleting WhisperX transcript:", e);
        alert(`Failed to delete WhisperX transcript: ${e.message}`);
        // TODO: Reset task-specific loading state if implemented
    }
  };
  // --- END: Handle Delete WhisperX Transcript ---

  // --- NEW: Handle Create Video --- 
  const handleCreateVideo = async (taskUuid) => {
    console.log(`Attempting to create video for task: ${taskUuid}`);
    // Optionally add a loading indicator specific to this task/button
    try {
      const res = await fetch(`/api/tasks/${taskUuid}/create_video`, {
        method: 'POST',
      });

      if (!res.ok) {
        let errorDetail = `HTTP error! status: ${res.status}`;
        try {
          const errorData = await res.json();
          errorDetail = errorData.detail || errorDetail;
        } catch (jsonError) {
          console.warn("Could not parse error response as JSON", jsonError);
        }
        throw new Error(errorDetail);
      }

      const result = await res.json();
      console.log('Video creation successful:', result);
      alert(`视频创建成功: ${result.output_path}`);
      // The WebSocket update should ideally handle refreshing the task state,
      // but we can trigger a manual fetch as a fallback or for immediate UI update.
      // await fetchTasks(); 
      
    } catch (e) {
      console.error("Error creating video:", e);
      alert(`视频创建失败: ${e.message}`);
    }
  };
  // --- END: Handle Create Video --- 

  // Filter tasks based on search term and archive status
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = searchTerm === '' || 
                          (task.title && task.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (task.url && task.url.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesArchive = !filterArchived || !task.archived;
    return matchesSearch && matchesArchive;
  });

  // --- Render --- 
  return (
    // Using data-theme for daisyUI theming
    <div className="container mx-auto p-4" data-theme="cupcake">
      {/* Ingest Form Section */}
      <div className="mb-8 p-6 bg-base-200 rounded-box shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Ingest New URL</h1>
        <form onSubmit={handleIngestSubmit} className="flex items-end gap-2">
          <div className="form-control flex-grow">
             <label htmlFor="url-input" className="label">
                <span className="label-text">URL to Ingest:</span>
             </label>
             <input
                id="url-input"
                type="text"
                placeholder="Enter URL and press Enter"
                className="input input-bordered w-full"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={ingestLoading}
              />
          </div>
           <button type="submit" className={`btn btn-primary ${ingestLoading ? 'loading' : ''}`} disabled={ingestLoading || !url}>
              Ingest
            </button>
        </form>
        {ingestLoading && <p className="text-info mt-2">Ingesting...</p>}
        {ingestError && <p className="text-error mt-2">Error: {ingestError}</p>}
        {ingestResponse && !ingestError && ( // Show success only if no subsequent error occurred
           <p className="text-success mt-2">
             Ingest successful! Task created with UUID: {ingestResponse.metadata?.uuid}
           </p>
        )}
      </div>

      {/* Task List Section */}
      <div className="p-6 bg-base-100 rounded-box shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ingested Tasks ({tasks.length})</h2>
          
          {/* --- START: Conditional Restore Button --- */}
          {!fetchLoading && !fetchError && tasks.length === 0 && (
            <button 
              className="btn btn-sm btn-outline btn-accent flex items-center gap-1"
              onClick={handleRestoreArchived}
            >
              <FaUndo /> Restore Archived
            </button>
          )}
           {/* --- END: Conditional Restore Button --- */}
           
          {/* View Mode Toggle */}
          <div className="tabs tabs-boxed">
            <a className={`tab ${viewMode === 'card' ? 'tab-active' : ''}`} onClick={() => setViewMode('card')}>Card View</a> 
            <a className={`tab ${viewMode === 'table' ? 'tab-active' : ''}`} onClick={() => setViewMode('table')}>Table View</a>
          </div>
        </div>

        {/* Loading/Error state for task list */}
        {fetchLoading && <progress className="progress progress-primary w-full"></progress>}
        {fetchError && <div className="alert alert-error shadow-lg"><div><span>Error loading tasks: {fetchError}</span></div></div>}

        {/* Render based on view mode - Pass onArchive prop */} 
        {!fetchLoading && !fetchError && (
          <div>
            {viewMode === 'card' ? (
              <CardView 
                tasks={filteredTasks} 
                onDelete={handleDeleteTask} 
                onArchive={handleArchiveTask}
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
              />
            ) : (
              <TableView 
                tasks={filteredTasks} 
                onDelete={handleDeleteTask} 
                onArchive={handleArchiveTask}
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
              />
            )}
            {tasks.length === 0 && !fetchLoading && <p className="text-center text-gray-500 mt-4">No tasks ingested yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
