import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

import VideoPlayer from './VideoPlayer';
import VttPreviewer from './VttPreviewer';
import MarkdownViewer from './MarkdownViewer';

// Props:
// - taskUuid: The UUID of the task to display in the studio.
// - apiBaseUrl: The base URL for the API.

function Studio({ taskUuid, apiBaseUrl }) {
  // Refs
  const videoElementRef = useRef(null);

  // State for fetched data
  const [localVideoSrc, setLocalVideoSrc] = useState('');
  const [vttContent, setVttContent] = useState('');
  const [markdownContent, setMarkdownContent] = useState('');

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    if (!taskUuid || !apiBaseUrl) {
      // Clear data if props are missing
      setLocalVideoSrc('');
      setVttContent('');
      setMarkdownContent('');
      setError(null);
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      console.log(`Studio: Fetching data for UUID: ${taskUuid}`);

      // --- Construct Video URL (Adjust based on your backend serving strategy) ---
      // Example: Assuming videos are served directly via a path
      // **IMPORTANT**: This requires your backend to serve the video file at this URL!
      // You might need to fetch task details first to get the correct video filename/path.
      const potentialVideoUrl = `${apiBaseUrl}/api/tasks/${taskUuid}/media/default_video.mp4`; // Adjust filename/logic as needed
      // You might want to add a check here to see if the video actually exists
      // For now, we'll just set it.
      setLocalVideoSrc(potentialVideoUrl);

      // --- Fetch VTT and Markdown concurrently ---
      try {
        // **ASSUMPTION**: Backend endpoints for VTT and Markdown
        // Changed language code from zh to zh-Hans to match backend file/metadata
        const vttPromise = axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/vtt/zh-Hans`);
        // Corrected Markdown URL and added responseType: 'text'
        const markdownPromise = axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/markdown/parallel`, {
          responseType: 'text' // Ensure response is treated as plain text
        });

        const [vttResult, markdownResult] = await Promise.allSettled([
          vttPromise,
          markdownPromise,
        ]);

        let fetchError = null;

        // Process VTT Result
        if (vttResult.status === 'fulfilled') {
          if (typeof vttResult.value.data === 'string') {
            setVttContent(vttResult.value.data);
            console.log("Studio: VTT content loaded.");
          } else {
            console.warn("Studio: Received non-string VTT data", vttResult.value.data);
            setVttContent(''); // Clear if format is wrong
          }
        } else {
          console.error("Studio: Failed to fetch VTT:", vttResult.reason);
          fetchError = fetchError ? `${fetchError}\nFailed to load VTT.` : 'Failed to load VTT.';
          setVttContent('');
        }

        // Process Markdown Result
        if (markdownResult.status === 'fulfilled') {
          // Expecting a string directly from FileResponse
          if (typeof markdownResult.value.data === 'string') {
            setMarkdownContent(markdownResult.value.data);
             console.log("Studio: Markdown content loaded.");
          } else {
            // If it's not a string, log warning and clear content
            console.warn("Studio: Received unexpected Markdown data format (expected string)", markdownResult.value.data);
            setMarkdownContent('');
          }
        } else {
          console.error("Studio: Failed to fetch Markdown:", markdownResult.reason);
           fetchError = fetchError ? `${fetchError}\nFailed to load Markdown.` : 'Failed to load Markdown.';
          setMarkdownContent('');
        }

        if (fetchError) {
          setError(fetchError);
        }

      } catch (err) {
        // Catch potential errors during Promise.allSettled setup (unlikely here)
        console.error("Studio: Unexpected error during data fetch setup:", err);
        setError("An unexpected error occurred while fetching data.");
        setVttContent('');
        setMarkdownContent('');
      } finally {
        setIsLoading(false);
         console.log("Studio: Data fetching finished.");
      }
    };

    fetchData();

  }, [taskUuid, apiBaseUrl]); // Re-fetch if UUID or API URL changes

  // --- Render Logic ---
  if (!taskUuid) {
    return <div className="p-4 text-center text-gray-500">Please select a task to view in Studio.</div>;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full p-8">
        <span className="loading loading-lg loading-spinner"></span>
        <p className="ml-4 text-xl">Loading Studio Data...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full p-4 gap-4 overflow-hidden" data-theme="cupcake">
      
      {/* --- Left Column (Video + Subtitles) --- */} 
      <div className="flex flex-col w-2/5 flex-shrink-0 gap-4 overflow-hidden">
        <div className="video-container flex-shrink-0">
           {/* Pass the ref here */} 
          <VideoPlayer ref={videoElementRef} localVideoSrc={localVideoSrc} title={`Video for ${taskUuid}`} />
        </div>
        <div className="vtt-container flex-grow overflow-auto"> {/* Allow VTT to scroll */} 
           {/* Pass the ref and content here */} 
          <VttPreviewer videoRef={videoElementRef} vttContent={vttContent} />
        </div>
      </div>

      {/* --- Middle Column (AI Chat Placeholder) --- */} 
      <div className="flex flex-col flex-1 bg-base-200 p-4 rounded-lg shadow overflow-auto">
        <h3 className="text-lg font-semibold mb-2 border-b border-base-300 pb-2 flex-shrink-0">AI 对话</h3>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-400 italic">(AI Chat Interface Placeholder)</p>
        </div>
      </div>

      {/* --- Right Column (Markdown Viewer) --- */} 
      <div className="flex flex-col w-1/4 flex-shrink-0 bg-base-200 p-0 rounded-lg shadow overflow-auto">
        {/* Wrap MarkdownViewer in a div if needed, or style it directly */}
        {/* Pass fetched content here */} 
        <MarkdownViewer markdownContent={markdownContent} />
      </div>

      {/* Display general error if any fetch failed */}
      {error && (
        <div className="absolute bottom-4 right-4 alert alert-error shadow-lg w-auto max-w-md z-50">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>Error loading Studio data: <pre className="whitespace-pre-wrap text-xs">{error}</pre></span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Studio; 