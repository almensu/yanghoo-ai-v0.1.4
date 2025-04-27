import React, { useState, useEffect } from 'react';
import VideoPlayer from '../components/VideoPlayer'; // Adjust path if necessary

const TestPage_VideoPlayer = () => {
  const [taskData, setTaskData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Removed preferLocalVideo state

  // --- Hardcoded Task UUID for testing --- 
  const testTaskUuid = "dc7d6006-815c-4a62-a09e-c6233a21219d"; 
  // Define API Base URL (could also come from context or env vars)
  const apiBaseUrl = 'http://127.0.0.1:8000'; 

  useEffect(() => {
    const fetchTaskData = async () => {
      setLoading(true);
      setError(null);
      // Removed setPreferLocalVideo call
      try {
        const response = await fetch(`${apiBaseUrl}/api/tasks/${testTaskUuid}`);
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
  }, [testTaskUuid, apiBaseUrl]); // Added apiBaseUrl to dependencies

  // --- Prepare props for VideoPlayer --- 
  let localVideoRelativePath = null;
  let embedUrl = null;
  let videoTitle = "Video Player";

  if (taskData) {
    videoTitle = taskData.title || videoTitle;
    // Get the relative path from metadata
    localVideoRelativePath = taskData.media_files?.['best'] || taskData.media_files?.['360p'];
    // Get embed url directly from metadata
    embedUrl = taskData.embed_url;
  }

  // Removed logic for determining currentSrc, currentEmbedUrl, canToggle, handleToggle

  // --- Render component based on state --- 
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Video Player Test Page (Refactored)</h1>
      
      {loading && <p>Loading task data...</p>}
      {error && <p className="text-red-500">Error loading data: {error}</p>}
      
      {taskData && (
        <div className="mb-4 p-4 border rounded bg-base-200">
          <h2 className="text-lg font-semibold">Task Data:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(taskData, null, 2)}</pre>
        </div>
      )}

      <div className="max-w-3xl mx-auto"> {/* Constrain width for better viewing */}
         {/* Render VideoPlayer if not loading/error, passing derived props */} 
         {!loading && !error && (
            <VideoPlayer 
                localVideoPath={localVideoRelativePath} // Pass relative path
                embedUrl={embedUrl} // Pass embed URL from task data
                apiBaseUrl={apiBaseUrl} // Pass API base URL
                title={videoTitle} 
                allowToggle={true} // Explicitly allow toggling for the test page
            />
         )}
         {/* Message if loading/error complete but no data found */}
         {!loading && !error && !taskData && <p>无法加载任务数据。</p>}
      </div>

    </div>
  );
};

export default TestPage_VideoPlayer; 