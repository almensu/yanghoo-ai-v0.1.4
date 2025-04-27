import React, { useState, useEffect, useRef, useCallback } from 'react';
// Use the installed webvtt-parser
// import { WebVTT } from 'vtt.js'; 
import { WebVTTParser } from 'webvtt-parser';

// Helper function to format time (seconds to HH:MM:SS.mmm)
const formatTime = (timeInSeconds) => {
  if (isNaN(timeInSeconds) || timeInSeconds < 0) {
    return '00:00:00.000';
  }
  const hours = Math.floor(timeInSeconds / 3600);
  const minutes = Math.floor((timeInSeconds % 3600) / 60);
  const seconds = Math.floor(timeInSeconds % 60);
  const milliseconds = Math.floor((timeInSeconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(3, '0')}`;
};

// Props:
// - vttContent: String containing the raw VTT content.
// - videoRef: A React ref object pointing to the HTML <video> element.

function VttPreviewer({ vttContent, videoRef }) {
  const [cues, setCues] = useState([]);
  const [activeCueIndex, setActiveCueIndex] = useState(-1);
  const [error, setError] = useState(null);
  const cueListRef = useRef(null); // Ref for the scrollable list container
  const activeCueRef = useRef(null); // Ref for the currently active cue element

  // --- NEW: Robust VTT Parsing Logic ---
  const parseVtt = useCallback((vttString) => {
    if (!vttString) return { cues: [], error: null };
    
    let parser = new WebVTTParser();
    let preprocessedVtt = vttString;
    let parseError = null; // Store potential error message

    // Pre-process the VTT string to fix common issues
    // Ensure there's a blank line after WEBVTT header
    if (preprocessedVtt.startsWith('WEBVTT') && !preprocessedVtt.startsWith('WEBVTT\\n\\n')) {
        preprocessedVtt = preprocessedVtt.replace('WEBVTT', 'WEBVTT\\n');
        if (!preprocessedVtt.startsWith('WEBVTT\\n\\n')) {
            preprocessedVtt = preprocessedVtt.replace('WEBVTT\\n', 'WEBVTT\\n\\n');
        }
    }
    
    // Handle metadata lines properly
    const lines = preprocessedVtt.split('\\n');
    const metadataEndIndex = lines.findIndex((line, i) => 
        i > 0 && line.includes('-->') || (line.trim() === '' && i > 2)
    );
    
    if (metadataEndIndex > 0) {
        // Ensure blank line after metadata
        if (lines[metadataEndIndex].trim() !== '') {
            lines.splice(metadataEndIndex, 0, '');
            preprocessedVtt = lines.join('\\n');
        }
    }
    
    try {
        const tree = parser.parse(preprocessedVtt, 'metadata');
        
        if (tree.errors.length > 0) {
            console.warn("VTT parsing errors (attempting to continue):", JSON.stringify(tree.errors, null, 2));
            // Take the first significant error message for display
            parseError = `Parsing Issue: ${tree.errors[0].message} (line ${tree.errors[0].line || 'unknown'})`; 
        }
        
        const parsed = tree.cues.map(cue => ({
            startTime: cue.startTime,
            endTime: cue.endTime,
            text: cue.text.replace(/\\n/g, ' ') // Replace newlines in cue text
        })).sort((a, b) => a.startTime - b.startTime);
        
        // Return cues even if there were non-fatal errors
        return { cues: parsed, error: parseError }; 
        
    } catch (err) {
        console.error("Error parsing VTT (primary attempt):", err);
        
        // Try a more aggressive fallback approach
        try {
            // Strip all metadata and just keep cues
            const simplifiedVtt = 'WEBVTT\\n\\n' + 
                preprocessedVtt.split('\\n')
                    .filter(line => line.includes('-->') || 
                                   (line.trim() !== '' && 
                                    !line.startsWith('WEBVTT') && 
                                    !line.startsWith('Kind:') && 
                                    !line.startsWith('Language:')))
                    .join('\\n');
            
            // Reset parser for fallback
            parser = new WebVTTParser(); 
            const fallbackTree = parser.parse(simplifiedVtt, 'metadata');
            
            console.warn("Used fallback VTT parsing.");
            
            // Report errors from fallback too, if any
            if (fallbackTree.errors.length > 0) {
                 console.warn("Fallback VTT parsing errors:", JSON.stringify(fallbackTree.errors, null, 2));
                  parseError = `Fallback Parsing Issue: ${fallbackTree.errors[0].message} (line ${fallbackTree.errors[0].line || 'unknown'})`;
            } else {
                 parseError = "Used fallback parsing method."; // Inform user
            }

            const fallbackParsed = fallbackTree.cues.map(cue => ({
                startTime: cue.startTime,
                endTime: cue.endTime,
                text: cue.text.replace(/\\n/g, ' ')
            })).sort((a, b) => a.startTime - b.startTime);
            
            return { cues: fallbackParsed, error: parseError };
            
        } catch (fallbackErr) {
            console.error("Fallback VTT parsing also failed:", fallbackErr);
            // Return empty cues and the fallback error message
            return { 
                 cues: [], 
                 error: `Failed to parse VTT even with fallback: ${fallbackErr.message || 'Unknown error'}` 
             };
        }
    }
  }, []); // useCallback with empty dependency array as it doesn't depend on props/state

  // --- MODIFIED: Use the new parseVtt function ---
  useEffect(() => {
    const { cues: parsedCues, error: parseError } = parseVtt(vttContent);
    
    setCues(parsedCues);
    setError(parseError); // Set error state based on parsing result
    setActiveCueIndex(-1); // Reset active cue on new content

  }, [vttContent, parseVtt]); // Depend on vttContent and the memoized parseVtt function

  // Handle video time updates to find active cue
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || cues.length === 0) {
      setActiveCueIndex(-1);
      return;
    }
    const currentTime = video.currentTime;
    let foundIndex = -1;
    for (let i = 0; i < cues.length; i++) {
      if (currentTime >= cues[i].startTime && currentTime < cues[i].endTime) {
        foundIndex = i;
        break;
      }
    }
    if (foundIndex !== activeCueIndex) {
        setActiveCueIndex(foundIndex);
    }
  }, [videoRef, cues, activeCueIndex]);

  // Add/Remove timeupdate listener
  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      handleTimeUpdate(); 
      return () => {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      };
    }
  }, [videoRef, handleTimeUpdate]);

  // Handle clicking a cue to seek video
  const handleCueClick = (startTime) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = startTime;
    }
  };

  // Scroll active cue into view
  useEffect(() => {
    if (activeCueRef.current) {
      activeCueRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, [activeCueIndex]); 

  return (
    <div className="vtt-previewer bg-base-200 p-4 rounded-lg shadow max-h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-2 border-b border-base-300 pb-2">Subtitle Preview</h3>
      {error && <div className="alert alert-warning shadow-sm"><p className="text-xs">Error parsing VTT: {error}</p></div>} 
      {!error && cues.length === 0 && !vttContent && (
         <p className="text-gray-500 italic">No VTT content loaded.</p>
      )}
       {!error && cues.length === 0 && vttContent && (
         <p className="text-gray-500 italic">VTT loaded, but no cues found or parsed.</p>
      )}
      {!error && cues.length > 0 && (
        <ul ref={cueListRef} className="space-y-1 overflow-y-auto flex-grow pr-2">
          {cues.map((cue, index) => (
            <li 
              key={`${cue.startTime}-${index}`} 
              ref={index === activeCueIndex ? activeCueRef : null} 
              className={`p-2 rounded cursor-pointer transition-colors duration-150 ease-in-out ${index === activeCueIndex ? 'bg-primary text-primary-content' : 'hover:bg-base-300'}`}
              onClick={() => handleCueClick(cue.startTime)}
              title={`Go to ${formatTime(cue.startTime)}`}
            >
              <span className="font-mono text-xs mr-2 opacity-80">
                {formatTime(cue.startTime)}
              </span>
              <span className="text-sm">{cue.text}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default VttPreviewer; 