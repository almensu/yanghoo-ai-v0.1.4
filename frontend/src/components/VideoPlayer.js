import React, { useState, useEffect, forwardRef } from 'react';

// Props:
// - localVideoPath: Relative path to a video file served by the backend (e.g., task_uuid/video_360p.mp4)
// - embedUrl: URL for embedding in an iframe (e.g., YouTube embed URL)
// - apiBaseUrl: Base URL for the backend API (e.g., http://127.0.0.1:8000)
// - allowToggle: Boolean indicating if switching between sources is allowed (defaults to true)
// - title: Optional title for the video/iframe

const VideoPlayer = forwardRef(({ localVideoPath, embedUrl, apiBaseUrl, allowToggle = true, title = 'Video Player' }, ref) => {
  const [preferLocalVideo, setPreferLocalVideo] = useState(true); // Internal state for preference

  // --- Determine available sources and construct full local URL --- 
  const localVideoAvailable = Boolean(localVideoPath);
  const embedVideoAvailable = Boolean(embedUrl);
  
  let localVideoSrc = null;
  if (localVideoAvailable && apiBaseUrl) {
    // Ensure no double slashes if apiBaseUrl ends with / and path starts with /
    const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    // Construct the URL to the file serving endpoint
    const filename = localVideoPath.split('/').pop();
    const taskUuid = localVideoPath.split('/')[0]; // Assuming path format uuid/filename
    if (filename && taskUuid) {
        localVideoSrc = `${base}/api/tasks/${taskUuid}/files/${filename}`;
    }
  } else if (localVideoAvailable && !apiBaseUrl) {
      console.warn('VideoPlayer: localVideoPath provided but apiBaseUrl is missing.');
  }

  // --- Determine which source to USE based on preference and availability ---
  let currentSrc = null;
  let currentEmbedUrl = null;
  const canToggle = localVideoAvailable && embedVideoAvailable && allowToggle;

  useEffect(() => {
    // Reset preference if availability changes (e.g., local video deleted)
    // If preferred source becomes unavailable, switch to the other if possible
    if (preferLocalVideo && !localVideoAvailable && embedVideoAvailable) {
        setPreferLocalVideo(false);
    } else if (!preferLocalVideo && !embedVideoAvailable && localVideoAvailable) {
        setPreferLocalVideo(true);
    }
    // If currently preferred source IS available, stick with it
  }, [localVideoAvailable, embedVideoAvailable, preferLocalVideo]);

  if (preferLocalVideo && localVideoSrc) {
      currentSrc = localVideoSrc;
  } else if (!preferLocalVideo && embedUrl) {
      currentEmbedUrl = embedUrl;
  } else if (localVideoSrc) { // Fallback if preference not met but local exists
      currentSrc = localVideoSrc;
  } else if (embedUrl) { // Fallback if preference not met but embed exists
      currentEmbedUrl = embedUrl;
  }

  const handleToggle = () => {
    if (canToggle) {
        setPreferLocalVideo(!preferLocalVideo);
    }
  };

  return (
    <div> { /* Wrap content and button */}
        <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg">
        {currentSrc ? (
            // Render HTML5 video player for local files
            <video 
            controls 
            src={currentSrc} 
            title={title}
            className="w-full h-full"
            ref={ref} // Forward the ref to the video element
            key={currentSrc} // Add key to force re-render on src change
            >
            Your browser does not support the video tag.
            </video>
        ) : currentEmbedUrl ? (
            // Render iframe for embeddable URLs
            <iframe 
            src={currentEmbedUrl}
            title={title}
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            allowFullScreen
            className="w-full h-full"
            key={currentEmbedUrl} // Add key to force re-render on src change
            // Note: ref cannot control iframe content time
            ></iframe>
        ) : (
            // Placeholder if no video source is available
            <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
            <p>No video available.</p>
            </div>
        )}
        </div>
        {/* Add Toggle Button if toggling allowed and both sources are available */} 
        {canToggle && (
            <button 
                onClick={handleToggle}
                className="mt-2 btn btn-xs btn-outline" // Smaller button
            >
                {preferLocalVideo ? "切换到在线视频" : "切换到本地视频"}
            </button>
        )}
    </div>
  );
});

export default VideoPlayer; 