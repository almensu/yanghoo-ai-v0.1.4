import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer'; // Adjust path if necessary

const TestPage_VideoPlayer = () => {
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preferLocalVideo, setPreferLocalVideo] = useState(true); // State to manage preference

  // --- Hardcoded Task UUID for testing --- 
  const testTaskUuid = "dc7d6006-815c-4a62-a09e-c6233a21219d"; 

  useEffect(() => {
    const fetchTaskData = async () => {
      setLoading(true);
      setError(null);
      setPreferLocalVideo(true); // Reset preference on new data fetch
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/tasks/${testTaskUuid}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTaskData(data);
      } catch (e) {
        console.error("Failed to fetch task data:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTaskData();
  }, [testTaskUuid]); // Re-fetch if UUID changes

  // --- Determine available video sources --- 
  let localVideoSrc = null;
  let embedUrl = null;
  let videoTitle = "Video Player";
  let localVideoAvailable = false;
  let embedVideoAvailable = false;

  if (taskData) {
    videoTitle = taskData.title || videoTitle;
    
    // Check for local video
    const localVideoPath = taskData.media_files?.['best'] || taskData.media_files?.['360p'];
    if (localVideoPath) {
      const filename = localVideoPath.split('/').pop();
      if (filename) {
         localVideoSrc = `http://127.0.0.1:8000/api/tasks/${taskData.uuid}/files/${filename}`;
         localVideoAvailable = true;
      }
    }

    // Check for embed video
    if (taskData.embed_url) {
      embedUrl = taskData.embed_url;
      embedVideoAvailable = true;
    }
  }

  // --- Determine which source to USE based on preference and availability ---
  let currentSrc = null;
  let currentEmbedUrl = null;
  const canToggle = localVideoAvailable && embedVideoAvailable;

  if (preferLocalVideo && localVideoAvailable) {
      currentSrc = localVideoSrc;
  } else if (!preferLocalVideo && embedVideoAvailable) {
      currentEmbedUrl = embedUrl;
  } else if (localVideoAvailable) { // Fallback if preference not met
      currentSrc = localVideoSrc;
  } else if (embedVideoAvailable) { // Fallback if preference not met
      currentEmbedUrl = embedUrl;
  }

  const handleToggle = () => {
    if (canToggle) {
        setPreferLocalVideo(!preferLocalVideo);
    }
  };

  // --- Render component based on state --- 
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Video Player Test Page (Fetching Data)</h1>
      
      {loading && <p>Loading task data...</p>}
      {error && <p className="text-red-500">Error loading data: {error}</p>}
      
      {taskData && (
        <div className="mb-4 p-4 border rounded bg-base-200">
          <h2 className="text-lg font-semibold">Task Data:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(taskData, null, 2)}</pre>
        </div>
      )}

      <div className="max-w-3xl mx-auto"> {/* Constrain width for better viewing */}
         {/* Only render player if we have a source */} 
         {(currentSrc || currentEmbedUrl) ? (
            <div>
                 <VideoPlayer 
                     localVideoSrc={currentSrc} 
                     embedUrl={currentEmbedUrl} 
                     title={videoTitle} 
                 />
                 {/* Add Toggle Button if both sources are available */} 
                 {canToggle && (
                     <button 
                         onClick={handleToggle}
                         className="mt-4 btn btn-sm btn-outline"
                     >
                         {preferLocalVideo ? "切换到在线视频" : "切换到本地视频"}
                     </button>
                 )}
            </div>
         ) : (
             !loading && !error && <p>此任务没有可用的视频源。</p> 
         )}
      </div>

    </div>
  );
};

export default TestPage_VideoPlayer; 