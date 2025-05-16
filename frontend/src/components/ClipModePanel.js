import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MonoCueItem from './MonoCueItem';
import BilingualCueItem from './BilingualCueItem';

// 简单的节流函数实现
function throttle(func, limit) {
  let lastFunc;
  let lastRan;
  return function(...args) {
    const context = this;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  }
}

/**
 * ClipModePanel - Descript-style editing panel
 * @param {Object} props - Component props
 * @param {Object} props.data - Data from Studio (includes selectedCues, videoRef)
 * @param {Function} props.onClose - Function to close the panel
 * @param {Function} props.onFinalizeClip - Function to finalize a clip
 */
function ClipModePanel({ data, onClose, onFinalizeClip }) {
  const { 
    selectedCues: initialCues = [], // These are the cues passed to the panel initially
    displayLang = '', 
    taskInfo = {}, 
    videoRef = null 
  } = data || {};

  // State for editable transcript cues
  const [transcriptCues, setTranscriptCues] = useState([]);
  const [videoDuration, setVideoDuration] = useState(600); // Default 10 minutes
  const [currentTime, setCurrentTime] = useState(0); // Synced with video
  
  // Editing and selection state
  const [editingCueId, setEditingCueId] = useState(null); // For text editing
  const [selectedTranscriptCueIds, setSelectedTranscriptCueIds] = useState(new Set()); // Renamed from selectedCueIdsForClipping
  const lastClickedCueIdForAnchorRef = useRef(null); // New ref for a stable anchor for selection

  // Timeline/Waveform state
  const timelineRef = useRef(null); // Ref for the timeline/waveform DOM element
  const [timelineScale, setTimelineScale] = useState(1); // Zoom level
  const [timelineOffset, setTimelineOffset] = useState(0); // Scroll position
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);
  const [hoverTimePosition, setHoverTimePosition] = useState(null);

  // Video sync and playback state
  const [syncEnabled, setSyncEnabled] = useState(true);
  const [activeCueIndex, setActiveCueIndex] = useState(-1); // For highlighting in transcript
  const lastActiveIndexRef = useRef(0);
  const cueListRef = useRef(null); // For scrolling active cue into view
  const [editingText, setEditingText] = useState(''); // For textarea value during edit

  // Initialize transcriptCues from initialCues
  useEffect(() => {
    if (initialCues && initialCues.length > 0) {
      const sortedCues = [...initialCues]
        .sort((a, b) => a.startTime - b.startTime)
        .map((cue, idx) => ({
          ...cue,
          // Ensure unique ID for editing and selection, fall back if cue.id is missing
          editId: cue.id || `transcript-cue-${idx}-${cue.startTime}`,
          id: cue.id || `transcript-cue-${idx}-${cue.startTime}`, // Used by Mono/BilingualCueItem
          isModified: false, // For text editing status
        }));
      
      setTranscriptCues(sortedCues);
      
      const lastEndTime = sortedCues[sortedCues.length - 1]?.endTime || 0;
      setVideoDuration(Math.max(600, lastEndTime + 60)); // Ensure enough space on timeline
    } else {
      setTranscriptCues([]);
    }
  }, [initialCues]);

  // --- Video Time Sync Logic (Adapted from VttPreviewer) ---
  const timeUpdateLogic = useCallback(() => {
    if (!syncEnabled || !videoRef?.current || transcriptCues.length === 0) {
      if (activeCueIndex !== -1 && syncEnabled) setActiveCueIndex(-1); // Reset if sync is on but no video/cues
      return;
    }
    const currentVideoTime = videoRef.current.currentTime;
    setCurrentTime(currentVideoTime);

    let foundIndex = -1;
    const cues = transcriptCues; // Use the panel's cues

    // Optimized search for active cue
    const lastIdx = lastActiveIndexRef.current;
    if (lastIdx >= 0 && lastIdx < cues.length && 
        currentVideoTime >= cues[lastIdx].startTime && currentVideoTime < cues[lastIdx].endTime) {
      foundIndex = lastIdx;
    } else {
      // Binary search if quick check fails
      let low = 0, high = cues.length - 1;
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (cues[mid].startTime <= currentVideoTime && cues[mid].endTime > currentVideoTime) {
          foundIndex = mid;
          break;
        }
        if (cues[mid].startTime > currentVideoTime) high = mid - 1;
        else low = mid + 1;
      }
    }
    
    if (foundIndex !== activeCueIndex) {
      setActiveCueIndex(foundIndex);
      if (foundIndex !== -1) lastActiveIndexRef.current = foundIndex;
    }
  }, [syncEnabled, videoRef, transcriptCues, activeCueIndex]);

  const handleTimeUpdateThrottled = useMemo(() => throttle(timeUpdateLogic, 200), [timeUpdateLogic]);

  useEffect(() => {
    const videoElement = videoRef?.current;
    
    // 严格检查videoElement是否为有效的HTML视频元素
    if (!videoElement || !(videoElement instanceof HTMLVideoElement)) {
      console.log("ClipModePanel: Video element ref is not a valid HTMLVideoElement, listener not added");
      return;
    }
    
    try {
      videoElement.addEventListener('timeupdate', handleTimeUpdateThrottled);
      timeUpdateLogic(); // Initial call
      
      return () => {
        try {
          videoElement.removeEventListener('timeupdate', handleTimeUpdateThrottled);
        } catch (error) {
          console.error("ClipModePanel: Error removing timeupdate event listener:", error);
        }
      };
    } catch (error) {
      console.error("ClipModePanel: Error adding timeupdate event listener:", error);
      return;
    }
  }, [videoRef, videoRef?.current, handleTimeUpdateThrottled, timeUpdateLogic]);

  // Scroll active cue into view in transcript
  useEffect(() => {
    if (activeCueIndex >= 0 && cueListRef.current) {
      const activeItemElement = cueListRef.current.children[activeCueIndex];
      if (activeItemElement) {
        const listRect = cueListRef.current.getBoundingClientRect();
        const itemRect = activeItemElement.getBoundingClientRect();
        if (itemRect.bottom > listRect.bottom || itemRect.top < listRect.top) {
          activeItemElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [activeCueIndex]);
  
  // --- Timeline/Waveform Interaction Logic ---
  const handleTimelineClick = (e) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + timelineRef.current.scrollLeft;
    const totalWidth = timelineRef.current.scrollWidth;
    const clickPercentage = Math.max(0, Math.min(1, clickX / totalWidth));
    const newTime = videoDuration * clickPercentage;
    setCurrentTime(newTime);
    if (videoRef?.current && syncEnabled) videoRef.current.currentTime = newTime;
  };

  const handleTimelineScroll = (e) => setTimelineOffset(e.target.scrollLeft);
  const handleZoomChange = (e) => setTimelineScale(parseFloat(e.target.value));

  // --- NEW: Advanced Cue Selection Logic (adapted from VideoEditor/Studio) ---
  const handleTranscriptCueSelect = useCallback((cueId, event) => {
    setSelectedTranscriptCueIds(prevSelected => {
      const newSelected = new Set(prevSelected);
      const isShiftKey = event && event.shiftKey;
      const isMetaOrCtrlKey = event && (event.metaKey || event.ctrlKey);

      // Use transcriptCues for indexing within this panel
      const currentCueIndexInPanel = transcriptCues.findIndex(c => c.id === cueId);
      if (currentCueIndexInPanel === -1) return prevSelected; 

      if (isShiftKey && transcriptCues.length > 0) {
        let anchorIndex = 0; 
        const anchorId = lastClickedCueIdForAnchorRef.current;

        if (anchorId) {
          const lastKnownAnchorIndex = transcriptCues.findIndex(c => c.id === anchorId);
          if (lastKnownAnchorIndex !== -1) {
            anchorIndex = lastKnownAnchorIndex;
          }
        }

        const start = Math.min(currentCueIndexInPanel, anchorIndex);
        const end = Math.max(currentCueIndexInPanel, anchorIndex);
        
        if (!isMetaOrCtrlKey) { 
            newSelected.clear(); 
        }
        for (let i = start; i <= end; i++) {
            if (transcriptCues[i]) {
                newSelected.add(transcriptCues[i].id);
            }
        }
      } else if (isMetaOrCtrlKey) {
        if (newSelected.has(cueId)) {
          newSelected.delete(cueId);
        } else {
          newSelected.add(cueId);
        }
        lastClickedCueIdForAnchorRef.current = cueId; 
      } else {
        newSelected.clear();
        newSelected.add(cueId);
        lastClickedCueIdForAnchorRef.current = cueId; 
      }
      return newSelected;
    });
  }, [transcriptCues]); // Dependency on transcriptCues

  // --- OLD Cue Interaction Logic (handleCueSelectionToggle can be removed or repurposed if needed) ---
  // const handleCueSelectionToggle = (cueId) => { ... }

  // --- Transcript Cue Interaction Logic ---
  const handleCueTimestampClick = (startTime) => {
    setCurrentTime(startTime);
    if (videoRef?.current) {
      videoRef.current.currentTime = startTime;
      if (videoRef.current.paused) videoRef.current.play().catch(console.error);
    }
  };
  
  // For text editing within the transcript
  const handleEditCueText = (cueId) => {
    const cueToEdit = transcriptCues.find(c => c.id === cueId);
    if (cueToEdit) {
      setEditingText(cueToEdit.isBilingual ? `${cueToEdit.enText || ''}\n${cueToEdit.zhText || ''}` : cueToEdit.text);
      setEditingCueId(cueId);
    }
  };

  const handleSaveCueText = (cueId) => {
    setTranscriptCues(prev => 
      prev.map(c => {
        if (c.id === cueId) {
          let updatedText = {};
          if (c.isBilingual) {
            const parts = editingText.split('\n');
            updatedText = { enText: parts[0] || '', zhText: parts[1] || '' };
          } else {
            updatedText = { text: editingText };
          }
          return { ...c, ...updatedText, isModified: true };
        }
        return c;
      })
    );
    setEditingCueId(null);
    setEditingText('');
  };

  // Add new cue (placeholder for now)
  const handleAddCue = () => {
    const newCueTime = currentTime;
    const newCue = {
      id: `new-cue-${Date.now()}`,
      editId: `new-cue-${Date.now()}`,
      startTime: newCueTime,
      endTime: newCueTime + 2, // Default 2s duration
      text: "New subtitle text...",
      enText: transcriptCues[0]?.isBilingual ? "New EN text..." : null,
      zhText: transcriptCues[0]?.isBilingual ? "New ZH text..." : null,
      isBilingual: transcriptCues[0]?.isBilingual || false,
      isModified: true,
      isNew: true,
    };
    setTranscriptCues(prev => [...prev, newCue].sort((a,b) => a.startTime - b.startTime));
    handleEditCueText(newCue.id);
  };

  const handleDeleteCue = (cueId) => {
    setTranscriptCues(prev => prev.filter(c => c.id !== cueId));
    setSelectedTranscriptCueIds(prev => {
      const newSelection = new Set(prev);
      newSelection.delete(cueId);
      return newSelection;
    });
    if (editingCueId === cueId) {
      setEditingCueId(null);
      setEditingText('');
    }
  };
  
  // --- Helper Functions ---
  const formatTimeDisplay = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
    return `${h}:${m}:${s}.${ms}`;
  };
  const formatTimeMMSS = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- Generate Clip Logic --- 
  const handleGenerateClip = () => {
    if (selectedTranscriptCueIds.size === 0) {
      alert("请选择至少一个片段来生成剪辑。");
      return;
    }

    const segmentsToClip = transcriptCues
      .filter(cue => selectedTranscriptCueIds.has(cue.id))
      .map(cue => ({ 
        start: cue.startTime, 
        end: cue.endTime,
        // Optionally include text if your backend might use it or for logging
        // text: cue.isBilingual ? `${cue.enText || ''}${cue.zhText ? '\n' + cue.zhText : ''}` : cue.text 
      }))
      .sort((a, b) => a.start - b.start); // Ensure segments are ordered by start time

    if (segmentsToClip.length > 0) {
      if (onFinalizeClip) {
        onFinalizeClip(segmentsToClip);
        // Consider if onClose() should be called here or if Studio should handle it after API call
        // onClose(); 
      } else {
        console.warn("ClipModePanel: onFinalizeClip prop was not provided. Cannot generate clip.");
        alert("无法生成剪辑：回调函数 (onFinalizeClip) 未设置。");
      }
    } else {
      // This case should ideally not be hit if selectedTranscriptCueIds.size > 0 check passes
      alert("没有有效的选定片段来生成剪辑。"); 
    }
  };

  // --- Render Logic ---
  return (
    <div className="h-full flex flex-col bg-base-100 text-sm">
      {/* Header */}
      <div className="flex justify-between items-center p-2 border-b border-base-300 bg-base-200 sticky top-0 z-20">
        <h2 className="text-base font-semibold">剪辑模式 (Descript 风格)</h2>
        <div className="flex items-center gap-3">
          <span className="text-xs">播放时间: {formatTimeDisplay(currentTime)}</span>
          <button onClick={onClose} className="btn btn-xs btn-ghost btn-circle">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>

      {/* Main Content Area (Transcript + Waveform/Timeline) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Controls: Playback, Add Cue, Sync Toggle, Generate Clip Button */}
        <div className="p-2 border-b border-base-300 flex justify-between items-center">
          <div className="flex items-center gap-2">
            {videoRef?.current && (
              <button 
                onClick={() => videoRef.current.paused ? videoRef.current.play() : videoRef.current.pause()}
                className="btn btn-xs btn-outline"
              >
                {videoRef.current.paused ? '播放' : '暂停'}
              </button>
            )}
            <button onClick={handleAddCue} className="btn btn-xs btn-primary">+ 添加字幕</button>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 cursor-pointer text-xs">
              <span>视频同步</span>
              <input type="checkbox" className="toggle toggle-primary toggle-xs" checked={syncEnabled} onChange={() => setSyncEnabled(!syncEnabled)} />
            </label>
             <button 
                className="btn btn-xs btn-accent"
                disabled={selectedTranscriptCueIds.size === 0}
                onClick={handleGenerateClip}
              >
                生成剪辑 ({selectedTranscriptCueIds.size})
            </button>
          </div>
        </div>

        {/* Waveform/Timeline Section */}
        <div className="p-2 border-b border-base-300">
          <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">音频波形 / 时间轴</span>
              <div className="flex items-center gap-1">
                <span className="text-xs">缩放:</span>
                <input type="range" min="1" max="10" step="0.5" value={timelineScale} onChange={handleZoomChange} className="range range-xs range-primary w-20" />
              </div>
          </div>
          <div 
            ref={timelineRef}
            className="h-16 bg-base-200 rounded relative cursor-pointer overflow-x-auto select-none"
            style={{ width: '100%' }}
            onClick={handleTimelineClick}
            onScroll={handleTimelineScroll}
            onMouseEnter={() => setIsHoveringTimeline(true)}
            onMouseLeave={() => setIsHoveringTimeline(false)}
            onMouseMove={(e) => {
              if (!timelineRef.current) return;
              const rect = timelineRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
              const totalWidth = timelineRef.current.scrollWidth;
              setHoverTimePosition((x/totalWidth) * videoDuration);
            }}
          >
            <div className="absolute top-0 left-0 h-full" style={{ width: `${100 * timelineScale}%`, minWidth: '100%' }}>
              {/* Background pseudo-waveform */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 200 50">
                      <path d="M0 25 Q 10 10, 20 25 T 40 25 Q 50 40, 60 25 T 80 25 Q 90 5, 100 25 T 120 25 Q 130 45, 140 25 T 160 25 Q 170 15, 180 25 T 200 25" stroke="currentColor" fill="none" strokeWidth="1"/>
                  </svg>
              </div>
              {/* Time Markers */}
              {Array.from({ length: Math.ceil((videoDuration / (60 / timelineScale))) + 1 }).map((_, idx) => {
                const timeMark = idx * (60 / timelineScale);
                if (timeMark > videoDuration) return null;
                return (
                  <div key={idx} className="absolute top-0 h-full border-l border-base-300 opacity-50" style={{ left: `${(timeMark / videoDuration) * 100}%` }}>
                    <span className="absolute top-0 left-1 text-xs text-base-content opacity-70">{formatTimeMMSS(timeMark)}</span>
                  </div>
                );
              })}
              {/* Selected Cue Highlights on Timeline */}
              {transcriptCues.filter(c => selectedTranscriptCueIds.has(c.id)).map(cue => (
                  <div key={`hl-${cue.id}`} 
                       className="absolute h-full bg-accent opacity-30 pointer-events-none rounded-sm"
                       style={{
                           left: `${(cue.startTime / videoDuration) * 100}%`,
                           width: `${((cue.endTime - cue.startTime) / videoDuration) * 100}%`
                       }} />
              ))}
              {/* Current Time Indicator */}
              <div className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none" style={{ left: `${(currentTime / videoDuration) * 100}%` }} />
              {/* Hover Time Indicator */}
              {isHoveringTimeline && hoverTimePosition !== null && (
                <div className="absolute top-0 bottom-0 w-0.5 bg-blue-500 z-10 opacity-70 pointer-events-none" style={{ left: `${(hoverTimePosition / videoDuration) * 100}%` }} />
              )}
            </div>
          </div>
        </div>

        {/* Transcript / Cue List Section */}
        <div ref={cueListRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 bg-base-100">
          {transcriptCues.length === 0 ? (
            <p className="text-center text-gray-400 italic py-4">加载字幕...</p>
          ) : (
            transcriptCues.map((cue, index) => {
              const isActive = index === activeCueIndex;
              const isSelected = selectedTranscriptCueIds.has(cue.id);
              const Component = cue.isBilingual ? BilingualCueItem : MonoCueItem;
              const isCurrentlyEditingThisCue = editingCueId === cue.id;

              return (
                <Component
                  key={cue.id}
                  cue={cue}
                  isActive={isActive}
                  isSelected={isSelected}
                  isEditing={isCurrentlyEditingThisCue}
                  onSelect={(event) => handleTranscriptCueSelect(cue.id, event)}
                  onTimestampClick={handleCueTimestampClick}
                  onEditClick={() => handleEditCueText(cue.id)}
                  onDeleteClick={() => handleDeleteCue(cue.id)}
                >
                  {isCurrentlyEditingThisCue && (
                    <div className="mt-1 p-1">
                      <textarea 
                        className="w-full p-1.5 border rounded text-xs bg-white focus:ring-primary focus:border-primary" 
                        value={editingText} 
                        onChange={(e) => setEditingText(e.target.value)}
                        onBlur={() => handleSaveCueText(cue.id)} 
                        autoFocus 
                        rows={cue.isBilingual ? 3 : 2}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSaveCueText(cue.id);
                          } else if (e.key === 'Escape') {
                            setEditingCueId(null);
                            setEditingText('');
                          }
                        }}
                      />
                      <div className="flex justify-end mt-1">
                        <button 
                          onClick={() => handleSaveCueText(cue.id)}
                          className="btn btn-xs btn-primary mr-1"
                        >保存</button>
                        <button 
                          onClick={() => {
                            setEditingCueId(null);
                            setEditingText('');
                          }}
                          className="btn btn-xs btn-ghost"
                        >取消</button>
                      </div>
                    </div>
                  )}
                </Component>
              );
            })
          )}
        </div>
      </div>

      {/* Footer (Simplified) */}
      <div className="p-2 border-t border-base-300 bg-base-200 flex justify-end">
        <button onClick={onClose} className="btn btn-sm btn-ghost">关闭</button>
      </div>
    </div>
  );
}

export default React.memo(ClipModePanel); 