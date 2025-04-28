import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { WebVTTParser } from 'webvtt-parser';

import VideoPlayer from './VideoPlayer';
import VttPreviewer from './VttPreviewer';
import MarkdownViewer from './MarkdownViewer';

// --- Robust VTT Parsing Logic (adapted from TestPage_VttPreviewer) ---
const parseVtt = (vttString, lang) => {
  if (!vttString || vttString.trim() === '') return { cues: [], error: null };

  let parser = new WebVTTParser();
  let preprocessedVtt = vttString;
  let parseError = null; // Store potential error message

  // Pre-process the VTT string to fix common issues
  // Ensure file starts with WEBVTT
  if (!preprocessedVtt.trim().startsWith('WEBVTT')) {
      preprocessedVtt = 'WEBVTT\n\n' + preprocessedVtt;
      parseError = 'Prepended missing WEBVTT header.'; // Note preprocessing
  }
  
  // Ensure there's a blank line after WEBVTT header (if it exists now)
  if (preprocessedVtt.startsWith('WEBVTT') && !preprocessedVtt.startsWith('WEBVTT\n\n') && !preprocessedVtt.startsWith('WEBVTT\r\n\r\n')) {
      if (preprocessedVtt.startsWith('WEBVTT\n') || preprocessedVtt.startsWith('WEBVTT\r\n')) {
          preprocessedVtt = preprocessedVtt.replace(/^WEBVTT[\r\n]+/, 'WEBVTT\n\n'); // Replace single newline with double
          if (!parseError) parseError = 'Added missing blank line after WEBVTT.';
      } else {
           // If WEBVTT is immediately followed by content, insert blank line
           preprocessedVtt = preprocessedVtt.replace(/^WEBVTT/, 'WEBVTT\n\n');
           if (!parseError) parseError = 'Added missing blank line after WEBVTT.';
      }
  }
  
  // TODO: Consider adding more robust preprocessing from TestPage_VttPreviewer if needed
  // (e.g., metadata handling, timestamp fixing)
  
  try {
      const tree = parser.parse(preprocessedVtt, 'metadata');
      
      if (tree.errors.length > 0) {
          console.warn(`VTT (${lang}) parsing encountered ${tree.errors.length} errors:`, tree.errors);
          const errorMessages = tree.errors.slice(0, 3).map(e => e.message || e).join(', ');
          const errorSuffix = tree.errors.length > 3 ? ` (and ${tree.errors.length - 3} more)` : '';
          // Prepend initial preprocessing error if it exists
          parseError = (parseError ? parseError + ' ' : '') + 
                       `Parser Errors: ${errorMessages}${errorSuffix}`;
      }
      
      const parsed = tree.cues.map(cue => ({
          startTime: cue.startTime,
          endTime: cue.endTime,
          text: cue.text.replace(/\n/g, ' ') // Replace newlines in cue text
      })).sort((a, b) => a.startTime - b.startTime);
      
      // Return cues even if there were non-fatal errors
      return { cues: parsed, error: parseError }; 
      
  } catch (err) {
      console.error(`Error parsing VTT (${lang}):`, err);
      // Return empty cues and the error message
      return { 
           cues: [], 
           error: (parseError ? parseError + ' ' : '') + 
                  `Fatal Parser Error: ${err.message || 'Unknown error'}` 
       };
  }
};
// --------------------------------------------------------------------

// Props:
// - taskUuid: The UUID of the task to display in the studio.
// - apiBaseUrl: The base URL for the API.

function Studio({ taskUuid, apiBaseUrl }) {
  // Refs
  const videoElementRef = useRef(null);

  // State for fetched data
  const [taskDetails, setTaskDetails] = useState(null);
  const [videoRelativePath, setVideoRelativePath] = useState(''); // Stores the relative path like 'uuid/video.mp4'
  const [embedUrl, setEmbedUrl] = useState(null); // Stores external embed URL
  const [rawVttContent, setRawVttContent] = useState('');
  const [parsedCues, setParsedCues] = useState([]);
  const [vttParseError, setVttParseError] = useState(null);
  const [markdownContent, setMarkdownContent] = useState('');

  // --- NEW: State for video source preference ---
  const [preferLocalVideo, setPreferLocalVideo] = useState(true); 

  // State for loading and errors
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching Effect ---
  useEffect(() => {
    // Reset state when UUID changes
    setTaskDetails(null);
    setVideoRelativePath('');
    setEmbedUrl(null);
    setRawVttContent('');
    setParsedCues([]);
    setVttParseError(null);
    setMarkdownContent('');
    setError(null);
    setIsLoading(true); // Start loading

    if (!taskUuid || !apiBaseUrl) {
      setError('Missing Task UUID or API Base URL');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // 1. Fetch Task Details first
        console.log(`Studio: Fetching task details for ${taskUuid}`);
        const detailsResponse = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}`);
        const details = detailsResponse.data;
        setTaskDetails(details);
        console.log("Studio: Task details loaded for video check:", details);

        // --- Flexible Extraction of video path and embed url ---
        let relativePath = '';
        const mediaFiles = details.media_files; // Check this field

        if (typeof mediaFiles === 'string' && mediaFiles.trim() !== '') {
            // Handle case where media_files is just a string path
            relativePath = mediaFiles.trim();
            console.log("Studio: Found video path directly as string:", relativePath);
        } else if (typeof mediaFiles === 'object' && mediaFiles !== null) {
            // Handle case where media_files is an object {'360p': 'path', ...}
            console.log("Studio: Looking for video path in media_files object:", mediaFiles);
            // Prioritize common keys (e.g., best quality available first)
            const prioritizedKeys = ['best', '1080p', '720p', '480p', '360p']; // Add/adjust keys as needed
            for (const key of prioritizedKeys) {
                if (typeof mediaFiles[key] === 'string' && mediaFiles[key].trim() !== '') {
                    relativePath = mediaFiles[key].trim();
                    console.log(`Studio: Found video path using prioritized key '${key}':`, relativePath);
                    break; // Found one, stop looking
                }
            }
            
            // If no prioritized key found, try the first available value
            if (!relativePath) {
                 console.log("Studio: No prioritized key found, checking all values...");
                 for (const key in mediaFiles) {
                     if (Object.hasOwnProperty.call(mediaFiles, key) && 
                         typeof mediaFiles[key] === 'string' && 
                         mediaFiles[key].trim() !== '') 
                     {
                         relativePath = mediaFiles[key].trim();
                         console.log(`Studio: Found first available video path with key '${key}':`, relativePath);
                         break; // Found the first one, stop looking
                     }
                 }
            }
        }
        
        // If still no path found after checks
        if (!relativePath) {
             console.warn("Studio: Could not find a valid video path in task details media_files.");
        }
        
        setVideoRelativePath(relativePath); // Update state with found path or empty string
        setEmbedUrl(details.embed_url || null); // Still get embed URL if present
        console.log(`Studio: Final video path state: '${relativePath}', Embed URL state: ${details.embed_url || null}`);
        // --------------------------------------------------------

        // 2. Fetch VTT and Markdown concurrently
        console.log("Studio: Fetching VTT and Markdown...");
        // Changed language code from zh to zh-Hans to match API endpoint (Adjust if your API uses different codes)
        const vttPromise = axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/vtt/zh-Hans`, { 
            responseType: 'text' // Ensure we get raw text
        }).catch(err => { // Add catch block for individual promise
            console.error("Studio: Failed to fetch VTT:", err.response?.data || err.message);
            return { error: 'vtt', reason: err }; // Return an error object
        });

        const markdownPromise = axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/markdown/parallel`, { 
            responseType: 'text' // Ensure we get raw text
        }).catch(err => { // Add catch block for individual promise
            console.error("Studio: Failed to fetch Markdown:", err.response?.data || err.message);
            return { error: 'markdown', reason: err }; // Return an error object
        });


        const [vttResult, markdownResult] = await Promise.all([ // Use Promise.all, handle errors below
          vttPromise,
          markdownPromise,
        ]);

        let fetchErrors = []; // Collect errors

        // Process VTT Result
        if (vttResult && !vttResult.error) { // Check if successful
            const rawVtt = vttResult.data; // Access data directly
            setRawVttContent(rawVtt);
            console.log("Studio: Raw VTT content loaded.");
            // Parse the raw VTT
            const { cues, error: parsingError } = parseVtt(rawVtt, 'zh-Hans');
            setParsedCues(cues);
            setVttParseError(parsingError);
            if (parsingError) {
                console.warn("Studio: VTT parsing issues:", parsingError);
            } else {
                 console.log(`Studio: VTT parsed successfully, ${cues.length} cues found.`);
            }
        } else {
          fetchErrors.push('Failed to load VTT subtitles.');
          setRawVttContent('');
          setParsedCues([]);
          setVttParseError('Failed to fetch VTT file from server.');
        }

        // Process Markdown Result
        if (markdownResult && !markdownResult.error) { // Check if successful
            setMarkdownContent(markdownResult.data); // Access data directly
            console.log("Studio: Markdown content loaded.");
        } else {
          fetchErrors.push('Failed to load Markdown.');
          setMarkdownContent('');
        }

        // Set general error if any fetch failed
        if (fetchErrors.length > 0) {
          setError(fetchErrors.join(' '));
        }

      } catch (err) {
        // This catch block handles errors from the initial task details fetch
        console.error("Studio: Error fetching task details:", err.response?.data || err.message || err);
        setError(err.response?.data?.detail || `An error occurred fetching task details: ${err.message}`);
        // Clear all data on fetch error
        setTaskDetails(null);
        setVideoRelativePath('');
        setEmbedUrl(null);
        setRawVttContent('');
        setParsedCues([]);
        setVttParseError(null);
        setMarkdownContent('');
      } finally {
        setIsLoading(false);
        console.log("Studio: Data fetching finished.");
      }
    };

    fetchData();

    // Cleanup function (optional)
    // return () => { console.log("Studio cleanup"); };

  }, [taskUuid, apiBaseUrl]); // Re-run effect if UUID or API URL changes

  // --- Render Logic ---

  // Show loading state first
  if (isLoading) {
    return <div className="p-4 text-center flex-grow flex items-center justify-center">Loading Studio...</div>;
  }
  
  // Show error if taskUuid is missing (moved from effect for clarity)
  if (!taskUuid) {
    return <div className="p-4 text-center text-gray-500 flex-grow flex items-center justify-center">Please select a task to view in Studio.</div>;
  }

  // Show general fetch error if occurred (excluding VTT/Markdown specific errors handled below)
  if (error && !taskDetails) { // Only show general error if details also failed
      return <div className="p-4 text-center text-red-500 flex-grow flex items-center justify-center">Error: {error}</div>;
  }

  // If loading is finished but no details (maybe API issue)
  if (!taskDetails) {
    return <div className="p-4 text-center text-gray-500 flex-grow flex items-center justify-center">No task details could be loaded.</div>;
  }

  // Determine if sources are available (needed for canToggle)
  const localVideoAvailable = Boolean(videoRelativePath);
  const embedVideoAvailable = Boolean(embedUrl);

  // --- NEW: Calculate canToggle and define handleToggle --- 
  const allowToggle = true; // Or make this configurable if needed
  const canToggle = localVideoAvailable && embedVideoAvailable && allowToggle;

  const handleToggle = () => {
    if (canToggle) {
      setPreferLocalVideo(!preferLocalVideo);
    }
  };

  // Construct local video URL *only* if videoRelativePath is not empty
  // IMPORTANT: Ensure this URL matches your backend file serving route
  const localVideoSrc = videoRelativePath
    ? `${apiBaseUrl}/api/tasks/${taskUuid}/files/${videoRelativePath}`
    : null;

  return (
    // Restore 3-column layout: Left(Video/VTT), Middle(Chat), Right(Markdown)
    <div className="flex flex-row flex-1 h-full p-4 gap-4 overflow-hidden bg-gray-100">
      
      {/* --- Left Column (Video + Subtitles) --- */}
      <div className="flex flex-col w-2/5 flex-shrink-0 gap-4 overflow-hidden">
        {/* Video Player Section */}
        <div className="flex flex-col flex-shrink-0"> 
          <h2 className="text-xl font-semibold mb-2 text-gray-800">Video / Preview</h2>
          <div className="relative bg-black rounded shadow-md aspect-video">
            <div className="absolute top-0 left-0 w-full h-full">
              {/* Pass preferLocalVideo state to VideoPlayer */} 
              {(localVideoAvailable || embedVideoAvailable) ? (
                <VideoPlayer
                  ref={videoElementRef}
                  localVideoPath={videoRelativePath}
                  apiBaseUrl={apiBaseUrl}
                  taskUuid={taskUuid}
                  embedUrl={embedUrl}
                  preferLocalVideo={preferLocalVideo} // Pass the state
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-800">
                  No video preview available.
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600 truncate" title={taskDetails?.title}>
              {taskDetails?.title || 'Untitled Task'}
          </p>
          {/* Render toggle button here if possible */} 
          {canToggle && (
              <button 
                  onClick={handleToggle}
                  className="mt-1 btn btn-xs btn-outline self-start" // Adjust margin/alignment
              >
                  {preferLocalVideo ? "切换到在线视频" : "切换到本地视频"}
              </button>
          )}
        </div>
        
        {/* VTT Previewer Section - Allow to grow and scroll */}
        <div className="flex flex-col flex-grow overflow-hidden bg-white rounded shadow-md"> 
           <h3 className="font-semibold p-4 pb-2 border-b border-gray-200 flex-shrink-0">VTT Subtitles</h3>
           {vttParseError && <p className="text-orange-600 text-sm px-4 pt-2">VTT Warning: {vttParseError}</p>}
           <div className="flex-grow overflow-y-auto p-4 pt-2"> {/* Scrollable content area */}
             {parsedCues.length > 0 ? (
                 <VttPreviewer
                   cues={parsedCues}
                   videoRef={videoElementRef}
                   onCueClick={(cue) => {
                     // Restore seeking logic if needed
                     if (videoElementRef.current && localVideoSrc) {
                       videoElementRef.current.currentTime = cue.startTime;
                       videoElementRef.current.play(); 
                     }
                     console.log("Cue clicked:", cue);
                   }}
                 />
             ) : (
                 <p className="text-gray-500 text-sm">No VTT subtitles loaded.</p>
             )}
           </div>
        </div>
      </div>

      {/* --- Middle Column (AI Chat Placeholder) --- */}
      <div className="flex flex-col flex-1 bg-white p-4 rounded-lg shadow overflow-auto">
        <h3 className="text-lg font-semibold mb-2 border-b border-gray-300 pb-2 flex-shrink-0">AI 对话</h3>
        <div className="flex-grow flex items-center justify-center">
          <p className="text-gray-400 italic">(AI Chat Interface Placeholder)</p>
        </div>
      </div>

      {/* --- Right Column (Markdown Viewer) --- */} 
      <div className="flex flex-col w-1/4 flex-shrink-0 bg-white rounded-lg shadow overflow-hidden">
         <h3 className="text-lg font-semibold p-4 pb-2 border-b border-gray-300 flex-shrink-0">Markdown Summary</h3>
         <div className="flex-grow overflow-y-auto p-4 pt-2"> {/* Scrollable content area */}
            {markdownContent ? (
                <MarkdownViewer markdown={markdownContent} />
            ) : (
                 <p className="text-gray-500 text-sm">No Markdown summary loaded.</p>
            )}
         </div>
      </div>

    </div>
  );
}

export default Studio; 