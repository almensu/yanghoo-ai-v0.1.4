import React, { useEffect, forwardRef } from 'react';

// Props:
// - localVideoPath: Relative path to a video file
// - embedUrl: URL for embedding in an iframe
// - apiBaseUrl: Base URL for the backend API
// - taskUuid: The UUID of the task
// - preferLocalVideo: Boolean indicating if local video should be preferred (passed from parent)
// - title: Optional title

const VideoPlayer = forwardRef(({ 
  localVideoPath, 
  embedUrl, 
  apiBaseUrl, 
  taskUuid, 
  preferLocalVideo, // Receive preference from parent
  title = 'Video Player' 
}, ref) => {
  // Removed internal preferLocalVideo state
  // Removed handleToggle function
  // Removed canToggle calculation

  // --- Determine available sources and construct full local URL ---
  const localVideoAvailable = Boolean(localVideoPath);
  const embedVideoAvailable = Boolean(embedUrl);
  // Keep debug logs for now, can remove later
  console.log(`VideoPlayer Debug: localVideoPath=${localVideoPath}, embedUrl=${embedUrl}`);
  console.log(`VideoPlayer Debug: localVideoAvailable=${localVideoAvailable}, embedVideoAvailable=${embedVideoAvailable}`);

  let localVideoSrc = null;
  if (localVideoAvailable && apiBaseUrl && taskUuid) {
    const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    let filename = localVideoPath;
    if (filename.startsWith(taskUuid + '/')) {
      filename = filename.substring(taskUuid.length + 1);
      console.log(`VideoPlayer: Extracted filename without UUID: ${filename}`);
    }
    localVideoSrc = `${base}/api/tasks/${taskUuid}/files/${filename}`;
    console.log(`VideoPlayer: Constructed video source URL: ${localVideoSrc}`); 
  } else if (localVideoAvailable && (!apiBaseUrl || !taskUuid)) {
    console.warn(`VideoPlayer: localVideoPath provided but apiBaseUrl or taskUuid is missing.`);
  }

  // Removed useEffect for managing preference

  // --- Determine which source to USE based on preference passed from parent ---
  // Simplified logic: Use the preference passed via props
  const shouldShowLocal = (preferLocalVideo && localVideoSrc) || (!embedVideoAvailable && localVideoSrc);

  return (
    // Removed outer div wrapper, parent will handle layout
    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg"> 
      {shouldShowLocal ? (
        <video 
          controls 
          src={localVideoSrc} 
          title={title}
          className="w-full h-full"
          ref={ref} 
        >
          Your browser does not support the video tag.
        </video>
      ) : embedVideoAvailable ? ( // Show iframe if embed is available and local wasn't chosen
        <iframe 
          src={embedUrl} 
          title={title}
          frameBorder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
          className="w-full h-full"
          key={embedUrl} 
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
          <p>No video available.</p>
        </div>
      )}
      {/* Button rendering is removed */}
    </div>
  );
});

export default VideoPlayer; 