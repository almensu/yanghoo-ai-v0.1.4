import React, { useState, useEffect, useRef, useCallback } from 'react';
import VttPreviewer from './VttPreviewer'; // Your existing component
// import { parseVTT } from './vttParserUtils'; // A function to parse VTT files

const INITIAL_CUES = [ /* ... your loaded cues ... */ ]; // Or load them dynamically

function VideoEditor() {
  const videoRef = useRef(null);
  const lastClickedCueIdForAnchorRef = useRef(null); // New ref for a stable anchor
  const [originalCues, setOriginalCues] = useState([]); // Cues from the VTT file
  const [editedCues, setEditedCues] = useState([]);   // Cues after edits (this is what VttPreviewer will use)
  const [selectedCueIds, setSelectedCueIds] = useState(new Set()); // IDs of selected cues
  const [clipboard, setClipboard] = useState([]); // For copy-pasting cues
  const [playbackCues, setPlaybackCues] = useState([]); // The sequence of cues to PLAY
  const [currentPlaybackCueIndex, setCurrentPlaybackCueIndex] = useState(-1);
  const [isPlayingEditedSequence, setIsPlayingEditedSequence] = useState(false);


  // Example: Load and parse VTT
  useEffect(() => {
    // In a real app, you'd fetch and parse a VTT file
    // For now, let's assume INITIAL_CUES are already parsed with unique IDs
    const cuesWithIds = INITIAL_CUES.map((cue, index) => ({ ...cue, id: cue.id || `cue-${index}-${cue.startTime}` }));
    setOriginalCues(cuesWithIds);
    setEditedCues(cuesWithIds); // Initially, edited cues are same as original
    setPlaybackCues(cuesWithIds);
  }, []);

  // --- 1. Cue Selection Logic ---
  const handleCueSelect = useCallback((cueId, event) => {
    setSelectedCueIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      const isShiftKey = event && event.shiftKey;
      const isMetaOrCtrlKey = event && (event.metaKey || event.ctrlKey);

      const currentCueIndexInEdited = editedCues.findIndex(c => c.id === cueId);
      if (currentCueIndexInEdited === -1) return prevSelected; // Clicked cue not found, do nothing

      if (isShiftKey && editedCues.length > 0) {
        // Range selection
        let anchorIndex = 0; // Default anchor to the beginning
        const anchorId = lastClickedCueIdForAnchorRef.current;

        if (anchorId) {
          const lastKnownAnchorIndex = editedCues.findIndex(c => c.id === anchorId);
          if (lastKnownAnchorIndex !== -1) {
            anchorIndex = lastKnownAnchorIndex;
          }
        }

        const start = Math.min(currentCueIndexInEdited, anchorIndex);
        const end = Math.max(currentCueIndexInEdited, anchorIndex);
        
        if (!isMetaOrCtrlKey) { // Pure Shift-click (no Ctrl/Meta)
            newSelected.clear(); // Clear previous selections
        }
        // For both pure Shift-click and Shift+Ctrl/Meta-click, add the range to selection
        for (let i = start; i <= end; i++) {
            if (editedCues[i]) {
                newSelected.add(editedCues[i].id);
            }
        }
        // Do not update lastClickedCueIdForAnchorRef on shift-click

      } else if (isMetaOrCtrlKey) {
        // Toggle selection (Ctrl/Meta click without Shift)
        if (newSelected.has(cueId)) {
          newSelected.delete(cueId);
        } else {
          newSelected.add(cueId);
        }
        lastClickedCueIdForAnchorRef.current = cueId; // Set anchor to the toggled item
      } else {
        // Single selection (simple click without Shift or Ctrl/Meta)
        newSelected.clear();
        newSelected.add(cueId);
        lastClickedCueIdForAnchorRef.current = cueId; // Set anchor to the selected item
      }
      return newSelected;
    });
  }, [editedCues]); // lastClickedCueIdForAnchorRef is a ref, so not needed in deps


  // --- 2. Editing Operations ---
  const handleDeleteCues = () => {
    if (selectedCueIds.size === 0) return;
    let updatedEditedCues;
    setEditedCues(prevCues => {
        updatedEditedCues = prevCues.filter(cue => !selectedCueIds.has(cue.id));
        return updatedEditedCues;
    });
    // When cues are deleted, the playback sequence should also update
    // Ensure playbackCues is updated after editedCues state has been set,
    // or derive it consistently. For simplicity, let's update it based on the new reality of editedCues.
    setPlaybackCues(prevPlayback => prevPlayback.filter(cue => !selectedCueIds.has(cue.id)));
    setSelectedCueIds(new Set()); // Clear selection
  };

  const handleCopyCues = () => {
    if (selectedCueIds.size === 0) return;
    // Copy the actual cue objects, sorted by their appearance in editedCues
    const copied = editedCues
      .filter(cue => selectedCueIds.has(cue.id))
      .map(cue => ({ ...cue })); // Create deep copies to avoid issues if original cues change
    setClipboard(copied);
    console.log('Copied cues:', copied);
  };

  const handlePasteCues = () => {
    if (clipboard.length === 0) return;
    setEditedCues(prevCues => {
      let insertionIndex = prevCues.length;
      const selectedIndices = Array.from(selectedCueIds)
                                  .map(id => prevCues.findIndex(c => c.id === id))
                                  .filter(idx => idx !== -1)
                                  .sort((a,b) => a-b);

      if (selectedIndices.length > 0) {
        insertionIndex = selectedIndices[selectedIndices.length - 1] + 1;
      }

      const newCues = [...prevCues];
      // Ensure pasted cues have unique IDs if they are pasted multiple times
      const cuesToPaste = clipboard.map(c => ({
        ...c,
        id: `pasted-${c.id}-${Date.now()}-${Math.random()}` // Ensure unique ID
      }));
      newCues.splice(insertionIndex, 0, ...cuesToPaste);
      setPlaybackCues(newCues); // Update playback cues directly with the new structure
      return newCues;
    });
  };

  // --- 3. Custom Playback Logic ---
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isPlayingEditedSequence || currentPlaybackCueIndex < 0 || currentPlaybackCueIndex >= playbackCues.length) {
      if (isPlayingEditedSequence && video && currentPlaybackCueIndex >= playbackCues.length) {
        // Reached end of edited sequence
        setIsPlayingEditedSequence(false);
        setCurrentPlaybackCueIndex(-1);
        if (!video.paused) video.pause();
      }
      return;
    }

    const cue = playbackCues[currentPlaybackCueIndex];
    video.currentTime = cue.startTime;
    video.play().catch(e => console.error("Error playing segment:", e));

    const handleSegmentEnd = () => {
      // Move to the next segment
      setCurrentPlaybackCueIndex(prevIndex => prevIndex + 1);
    };

    // Timeout to detect end of cue segment
    const duration = (cue.endTime - cue.startTime) * 1000;
    // Ensure duration is positive and add a small buffer to prevent premature jump.
    const effectiveDuration = Math.max(50, duration - 20); // Minimum 50ms, with 20ms buffer if longer
    
    const timerId = setTimeout(handleSegmentEnd, effectiveDuration);

    return () => {
      clearTimeout(timerId);
    };
  }, [currentPlaybackCueIndex, playbackCues, isPlayingEditedSequence, videoRef]);

  const playEditedSequence = () => {
    if (playbackCues.length > 0) {
      setIsPlayingEditedSequence(true);
      setCurrentPlaybackCueIndex(0); // Start from the first cue in the edited list
      setSelectedCueIds(new Set()); // Clear selection when starting playback
    }
  };

  const stopEditedSequence = () => {
    setIsPlayingEditedSequence(false);
    setCurrentPlaybackCueIndex(-1);
    if(videoRef.current && !videoRef.current.paused) videoRef.current.pause();
  }


  return (
    <div className="video-editor-container p-4">
      <h1 className="text-2xl font-bold mb-4">Video Editor</h1>
      <div className="flex space-x-4">
        <div className="w-2/3">
          {/* Your video player component */}
          <VideoPlayer videoRef={videoRef} src="your_video_source.mp4" />
        </div>
        <div className="w-1/3">
          <div className="controls mb-4 space-x-2">
            <button onClick={playEditedSequence} className="btn btn-sm btn-primary" disabled={isPlayingEditedSequence || playbackCues.length === 0}>Play Edited</button>
            <button onClick={stopEditedSequence} className="btn btn-sm btn-warning" disabled={!isPlayingEditedSequence}>Stop</button>
            <button onClick={handleDeleteCues} className="btn btn-sm btn-error" disabled={selectedCueIds.size === 0}>Delete Selected</button>
            <button onClick={handleCopyCues} className="btn btn-sm btn-info" disabled={selectedCueIds.size === 0}>Copy</button>
            <button onClick={handlePasteCues} className="btn btn-sm btn-accent" disabled={clipboard.length === 0}>Paste</button>
          </div>
          <VttPreviewer
            cues={editedCues} // Display the edited cues
            videoRef={videoRef}
            syncEnabled={!isPlayingEditedSequence} // Disable VTTPreviewer's sync when custom playback is active
            onCueSelect={handleCueSelect} // Pass the selection handler
            selectedCues={selectedCueIds} // Pass the set of selected cue IDs
          />
        </div>
      </div>
       {/* For Debugging or Export */}
       <div className="mt-4 p-2 bg-gray-100 rounded">
        <h3 className="font-semibold">Playback Cue Order (for FFmpeg):</h3>
        <pre className="text-xs max-h-40 overflow-auto">
          {playbackCues.map(cue => `Segment: ${cue.id} (${formatTime(cue.startTime)} - ${formatTime(cue.endTime)}) - ${cue.text || cue.enText}`).join('\n')}
        </pre>
      </div>
    </div>
  );
}

// Dummy VideoPlayer (replace with your actual player)
function VideoPlayer({ videoRef, src }) {
  return (
    <video ref={videoRef} controls width="100%" src={src} className="bg-black rounded">
      Your browser does not support the video tag.
    </video>
  );
}

// Utility function (you already have this in ../utils/formatTime, but included here as per your example)
const formatTime = (timeInSeconds) => {
  const date = new Date(0);
  date.setSeconds(timeInSeconds);
  // Ensure we get HH:MM:SS.mmm. substr(11,12) is correct for this.
  const timeString = date.toISOString().substr(11, 12);
  // Handle potential NaN or invalid times gracefully
  if (timeString.toLowerCase().includes('nan')) {
    return '00:00:00.000';
  }
  return timeString;
};


export default VideoEditor; 