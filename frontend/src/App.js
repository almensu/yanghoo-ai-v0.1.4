import { useState, useEffect, useCallback } from 'react';
import './App.css';
// Uncomment the view components
import CardView from './components/CardView';
import TableView from './components/TableView';

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

  // --- Fetch Tasks --- 
  const fetchTasks = useCallback(async () => {
    setFetchLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/tasks');
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      setTasks(data); // Assuming the endpoint returns an array of TaskMetadata
    } catch (e) {
      console.error("Error fetching tasks:", e);
      setFetchError(e.message || 'Failed to load tasks.');
    } finally {
      setFetchLoading(false);
    }
  }, []); // Empty dependency array means this doesn't depend on props/state

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]); // Run fetchTasks when the component mounts (and when fetchTasks changes, though it's stable)

  // --- Handle Ingest --- 
  const handleIngestSubmit = async (event) => {
    event.preventDefault();
    setIngestLoading(true);
    setIngestError(null);
    setIngestResponse(null);
    try {
      const res = await fetch('/api/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || `HTTP error! status: ${res.status}`);
      }
      setIngestResponse(data);
      setUrl(''); // Clear input on success
      // Refresh the task list after successful ingest
      await fetchTasks(); 
    } catch (e) {
      console.error("Error ingesting URL:", e);
      setIngestError(e.message || 'An unexpected error occurred.');
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
              type="url"
              id="url-input"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              placeholder="Enter URL (e.g., https://www.youtube.com/...)"
              className="input input-bordered w-full"
            />
          </div>
          <button type="submit" className={`btn btn-primary ${ingestLoading ? 'loading' : ''}`} disabled={ingestLoading}>
            {ingestLoading ? 'Ingesting...' : 'Ingest'}
          </button>
        </form>
        {ingestLoading && <progress className="progress progress-primary w-full mt-2"></progress>}
        {ingestError && <div className="alert alert-error shadow-lg mt-4"><div><span>Error: {ingestError}</span></div></div>}
        {ingestResponse && <div className="alert alert-success shadow-lg mt-4"><div><span>Success! Task {ingestResponse.metadata?.uuid} created.</span></div></div>}
      </div>

      {/* Task List Section */}
      <div className="p-6 bg-base-100 rounded-box shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Ingested Tasks ({tasks.length})</h2>
          {/* View Mode Toggle */}
          <div className="tabs tabs-boxed">
            <a className={`tab ${viewMode === 'card' ? 'tab-active' : ''}`} onClick={() => setViewMode('card')}>Card View</a> 
            <a className={`tab ${viewMode === 'table' ? 'tab-active' : ''}`} onClick={() => setViewMode('table')}>Table View</a>
          </div>
        </div>

        {/* Loading/Error state for task list */}
        {fetchLoading && <progress className="progress progress-primary w-full"></progress>}
        {fetchError && <div className="alert alert-error shadow-lg"><div><span>Error loading tasks: {fetchError}</span></div></div>}

        {/* Render based on view mode */} 
        {!fetchLoading && !fetchError && (
          <div>
            {viewMode === 'card' ? (
              // Use CardView component
              <CardView 
                tasks={tasks} 
                onDelete={handleDeleteTask} 
                onDownloadRequest={handleDownloadRequest} 
                onExtractAudio={handleExtractAudio}
                onDeleteVideo={handleDeleteVideo}
                onDeleteAudio={handleDeleteAudio}
               />
            ) : (
              // Use TableView component
              <TableView 
                tasks={tasks} 
                onDelete={handleDeleteTask} 
                onDownloadRequest={handleDownloadRequest} 
                onExtractAudio={handleExtractAudio} 
                onDeleteVideo={handleDeleteVideo}
                onDeleteAudio={handleDeleteAudio}
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
