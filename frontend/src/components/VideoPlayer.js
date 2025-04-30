import React, { useEffect, forwardRef, useRef, useImperativeHandle } from 'react';

// Custom CSS for subtitles - Updated to position subtitles at the red rectangle area with more specific selectors
const subtitleStyles = `
  video::cue,
  ::cue {
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 2px;
    font-size: 16px;
    line-height: 1.5;
    bottom: 60px !important; /* Moved higher from bottom */
    display: inline-block;
    max-width: 80%;
    white-space: pre-line;
    position: relative !important;
  }
  
  /* Make sure subtitles have enough room */
  .custom-subtitle-video::cue {
    /* Adjust margin if needed, but primary positioning is via 'bottom' now */
    margin-bottom: 60px !important; 
  }
  
  /* Enhancing visibility of subtitles - make stronger selector */
  video::-webkit-media-text-track-container,
  ::cue-region,
  ::-webkit-media-text-track-container {
    transform: translateY(-60px) !important; /* Increased negative translate to move container up */
    overflow: visible !important;
    bottom: 60px !important;
  }
  
  /* Ensures text tracks have enough height for bilingual content */
  video::-webkit-media-text-track-display,
  ::-webkit-media-text-track-display {
    min-height: 6em;
    padding-top: 1em;
    padding-bottom: 3em;
    position: relative !important;
    bottom: 60px !important;
  }
  
  /* Ensures text is readable */
  video::-webkit-media-text-track-display-backdrop,
  ::-webkit-media-text-track-display-backdrop {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    padding: 1em;
  }
`;

// Props:
// - localVideoPath: Relative path to a video file
// - embedUrl: URL for embedding in an iframe
// - apiBaseUrl: Base URL for the backend API
// - taskUuid: The UUID of the task
// - preferLocalVideo: Boolean indicating if local video should be preferred (passed from parent)
// - title: Optional title
// - vttUrl: NEW - Blob URL for the cleaned VTT file for the native track
// - vttLang: NEW - Language code (e.g., 'en', 'zh') for the native track
// - trackKey: Optional - Key to force track update if needed

const VideoPlayer = forwardRef(({ 
  localVideoPath, 
  embedUrl, 
  apiBaseUrl, 
  taskUuid, 
  preferLocalVideo, // Receive preference from parent
  title = 'Video Player',
  vttUrl = null,
  vttLang = null,
  trackKey = null
}, ref) => {
  const videoRef = useRef(null); // Ref for the <video> element itself
  const trackRef = useRef(null); // Ref to keep track of the added <track> element

  // Allow parent component (Studio) to get the video element ref if needed (for VttPreviewer sync)
  useImperativeHandle(ref, () => videoRef.current);

  // --- Determine available sources and construct full local URL ---
  const localVideoAvailable = Boolean(localVideoPath);
  const embedVideoAvailable = Boolean(embedUrl);
  // Keep debug logs for now, can remove later
  console.log(`VideoPlayer Debug: localVideoPath=${localVideoPath}, embedUrl=${embedUrl}`);
  console.log(`VideoPlayer Debug: localVideoAvailable=${localVideoAvailable}, embedVideoAvailable=${embedVideoAvailable}`);

  console.log("VideoPlayer: Before URL calculation check (URL 计算检查之前)"); // <-- ADD LOG 1
  let localVideoSrc = null;
  if (localVideoAvailable && apiBaseUrl && taskUuid) {
    console.log("VideoPlayer: Inside URL calculation block (进入 URL 计算块)"); // <-- ADD LOG 2
    const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    let filename = localVideoPath;
    if (filename.includes('/') && filename.split('/')[0].length === 36) { // Basic UUID check
        filename = filename.substring(filename.indexOf('/') + 1);
        // console.log(`VideoPlayer: Extracted filename without UUID prefix: ${filename}`); // Keep concise for now
    }
    localVideoSrc = `${base}/api/tasks/${taskUuid}/files/${filename}`;
    console.log(`VideoPlayer: Constructed video source URL (构建的视频源 URL): ${localVideoSrc}`); // <-- RE-ADD LOG
  } else if (localVideoAvailable && (!apiBaseUrl || !taskUuid)) {
    console.warn(`VideoPlayer: localVideoPath provided but apiBaseUrl or taskUuid is missing.`);
  }

  // --- Determine which source to USE based on preference passed from parent ---
  // Corrected logic: Only show local if preferred AND available
  // (修正逻辑: 仅当倾向本地且本地源可用时显示)
  const shouldShowLocal = preferLocalVideo && localVideoSrc;

  // --- Effect to Dynamically Manage the <track> Element (TEMPORARILY DISABLED) ---
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return; 

    // Add a CSS class to the video element for positioning subtitles
    videoElement.classList.add('custom-subtitle-video');

    // --- 保存当前播放时间 (Save current time before potential modification) ---
    let currentTimeBeforeChange = 0;
    // Only save if we might potentially modify the video/track state
    if (shouldShowLocal || trackRef.current) { 
        currentTimeBeforeChange = videoElement.currentTime;
        // console.log(`VideoPlayer Effect: Saved currentTime: ${currentTimeBeforeChange}`); // Optional log
    }
    // ------------------------------------------------------------------------

    // --- Optimized Track Management Logic ---

    // Case 1: Should NOT have a track (not local video OR no vttUrl provided)
    if (!shouldShowLocal || !vttUrl) {
        if (trackRef.current && trackRef.current.parentNode === videoElement) {
            console.log("VideoPlayer Effect: Removing track (No longer local or no URL).");
            videoElement.removeChild(trackRef.current);
            trackRef.current = null;
        }
        // Restore time here? Probably not needed if track removed due to mode switch.
        return; 
    }

    // Case 2: Should have a track (local video AND vttUrl is present)
    let currentTrackElement = trackRef.current;
    const langLabel = vttLang === 'zh' ? '中文' : (vttLang === 'en' ? 'English' : vttLang);
    const targetLabel = `${langLabel} (Cleaned)`; 

    if (currentTrackElement) {
        // Track exists, check if update is needed
        if (currentTrackElement.src !== vttUrl || currentTrackElement.srclang !== vttLang) {
            console.log(`VideoPlayer Effect: Updating existing track: lang=${vttLang}, src=${vttUrl}`);
            currentTrackElement.src = vttUrl; 
            currentTrackElement.srclang = vttLang;
            currentTrackElement.label = targetLabel; // Use calculated label
            currentTrackElement.default = true; 
            
            // --- Attempt IMMEDIATE time restore ---  (尝试立即恢复时间)
            if (currentTimeBeforeChange > 0) {
                console.log(`VideoPlayer Effect: Attempting IMMEDIATE currentTime restore after track update to ${currentTimeBeforeChange.toFixed(2)}`);
                try { videoElement.currentTime = currentTimeBeforeChange; } catch(e){ console.error("Error setting current time immediately after update:", e); }
            }
            // -------------------------------------

            if (videoElement.textTracks) {
                console.log("VideoPlayer Effect: Attempting to set track mode after update.");
                setTimeout(() => {
                    const currentVideoElement = videoRef.current; 
                    if (!currentVideoElement) return; 
                    
                    const tracks = currentVideoElement.textTracks;
                    if (!tracks) return;
                    for (let i = 0; i < tracks.length; i++) {
                        tracks[i].mode = 'hidden';
                    }
                    // Find by label first (优先用 label 查找)
                    let targetTrack = [...tracks].find(t => t.label === targetLabel);
                    // Fallback find by lang/src (备用查找)
                    if (!targetTrack) targetTrack = [...tracks].find(t => t.language === vttLang && t.src === vttUrl);
                    
                    if(targetTrack) {
                        targetTrack.mode = 'showing';
                        console.log("VideoPlayer Effect: Set updated track mode to 'showing'.");
                    } else {
                         console.warn("VideoPlayer Effect: Could not find the exact track after update timeout (using label/lang/src).");
                    }

                    // Restore time again (fallback) (再次恢复时间 - 备用)
                    // Only restore if time significantly differs (e.g., more than 0.5s off)
                    if (currentTimeBeforeChange > 0 && videoRef.current && Math.abs(videoRef.current.currentTime - currentTimeBeforeChange) > 0.5) { 
                         console.log(`VideoPlayer Effect: Restoring currentTime (fallback) after track update to ${currentTimeBeforeChange.toFixed(2)}`);
                         try { videoRef.current.currentTime = currentTimeBeforeChange; } catch(e){ console.error("Error setting current time in fallback after update:", e); }
                    }
                }, 200); // Increased delay (增加延迟)
            }
        } else {
            // Track exists and is already correct.
        }
    } else {
        // Track does NOT exist, need to add it (Track 不存在, 需要添加)
        console.log(`VideoPlayer Effect: Adding new track: lang=${vttLang}, src=${vttUrl}`);
        try {
            const newTrack = document.createElement('track');
            newTrack.kind = 'subtitles';
            newTrack.label = targetLabel; // Use calculated label
            newTrack.srclang = vttLang;
            newTrack.src = vttUrl;
            newTrack.default = true;

            trackRef.current = newTrack; 
            videoElement.appendChild(newTrack);
            console.log("VideoPlayer Effect: Appended new track element.");

            // --- Attempt IMMEDIATE time restore --- (尝试立即恢复时间)
            if (currentTimeBeforeChange > 0) {
                console.log(`VideoPlayer Effect: Attempting IMMEDIATE currentTime restore after track add to ${currentTimeBeforeChange.toFixed(2)}`);
                 try { videoElement.currentTime = currentTimeBeforeChange; } catch(e){ console.error("Error setting current time immediately after add:", e); }
            }
            // -------------------------------------

            if (videoElement.textTracks) {
                 console.log("VideoPlayer Effect: Attempting to set track mode after adding.");
                 setTimeout(() => {
                    const currentVideoElement = videoRef.current;
                    if (!currentVideoElement) return;
                    const tracks = currentVideoElement.textTracks;
                    if (!tracks) return;
                    for (let i = 0; i < tracks.length; i++) {
                        tracks[i].mode = 'hidden';
                    }
                    // Find by label first (优先用 label 查找)
                    let targetTrack = [...tracks].find(t => t.label === targetLabel);
                    if (!targetTrack) targetTrack = [...tracks].find(t => t.language === vttLang && t.src === vttUrl);

                    if(targetTrack) {
                        targetTrack.mode = 'showing';
                        console.log("VideoPlayer Effect: Set added track mode to 'showing'.");
                    } else {
                         console.warn("VideoPlayer Effect: Could not find the exact new track after add timeout (using label/lang/src).");
                    }

                    // Restore time again (fallback) (再次恢复时间 - 备用)
                    if (currentTimeBeforeChange > 0 && videoRef.current && Math.abs(videoRef.current.currentTime - currentTimeBeforeChange) > 0.5) {
                         console.log(`VideoPlayer Effect: Restoring currentTime (fallback) after track add to ${currentTimeBeforeChange.toFixed(2)}`);
                         try { videoRef.current.currentTime = currentTimeBeforeChange; } catch(e){ console.error("Error setting current time in fallback after add:", e); }
                    }
                }, 200); // Increased delay (增加延迟)
            }
        } catch (error) {
            console.error("VideoPlayer Effect: Error creating or appending track element:", error);
            trackRef.current = null;
        }
    }

  }, [vttUrl, vttLang, shouldShowLocal, localVideoSrc, trackKey]);

  // Debug track presence and status
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    console.log("VideoPlayer Debug: Video element present, checking tracks");
    
    if (videoElement.textTracks) {
      console.log(`VideoPlayer Debug: textTracks.length=${videoElement.textTracks.length}`);
      
      for (let i = 0; i < videoElement.textTracks.length; i++) {
        const track = videoElement.textTracks[i];
        console.log(`VideoPlayer Debug: Track ${i}: mode=${track.mode}, label=${track.label}, language=${track.language}`);
      }
    } else {
      console.log("VideoPlayer Debug: textTracks not available");
    }
    
    // Force showing track if available
    setTimeout(() => {
      const video = videoRef.current;
      if (video && video.textTracks && video.textTracks.length > 0) {
        for (let i = 0; i < video.textTracks.length; i++) {
          try {
            // Force show the first track
            video.textTracks[i].mode = "showing";
            console.log(`VideoPlayer Debug: Force set track ${i} to showing mode`);
          } catch (e) {
            console.error("Error showing track:", e);
          }
        }
      }
    }, 1000);
  }, [vttUrl, shouldShowLocal]);

  return (
    // Removed outer div wrapper, parent will handle layout
    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg"> 
      {/* Apply custom subtitle styles */}
      <style>{subtitleStyles}</style>
      {shouldShowLocal ? (
        <video 
          ref={videoRef} 
          controls 
          src={localVideoSrc} 
          title={title}
          className="w-full h-full object-contain" 
          crossOrigin="anonymous" 
        >
          {/* The <track> element logic is handled in useEffect */} 
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