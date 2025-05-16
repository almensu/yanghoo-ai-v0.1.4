import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// Use the installed webvtt-parser
// import { WebVTT } from 'vtt.js'; 
import { WebVTTParser } from 'webvtt-parser';
import { formatTime } from '../utils/formatTime'; // Import the utility function
import MonoCueItem from './MonoCueItem';
import BilingualCueItem from './BilingualCueItem';

// MonoCueItem 和 BilingualCueItem
// Helper function to format time (seconds to HH:MM:SS.mmm)
// const formatTime = (timeInSeconds) => { ... MOVED TO UTILS ... };

// VTT 字幕预览器主组件
// Props:
// - cues: 字幕对象数组，结构可能是单语或双语
//   - 单语: { startTime, endTime, text, isBilingual: false }
//   - 双语: { startTime, endTime, enText, zhText, isBilingual: true }
// - videoRef: 指向 HTML <video> 元素的 React ref 对象
// - syncEnabled: 是否启用视频同步 (boolean)
// NEW Props for Selection:
// - onCueSelect: 可选的回调函数，用于处理 cue 选择 (function)，接收 cueId 作为参数
// - selectedCues: 可选的 Set，包含当前选中的 cue ID

// --- Simple Throttle Implementation (简单的节流函数实现) ---
// (Source: Simplified from common implementations)
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
// ----------------------------------------------------------

function VttPreviewer({ cues = [], videoRef, syncEnabled = true, onCueSelect, selectedCues }) {
  // 状态：当前活动字幕的索引
  const [activeCueIndex, setActiveCueIndex] = useState(-1);
  // Ref: 指向字幕列表的滚动容器
  const cueListRef = useRef(null); 
  // Ref: 存储上一个活动的索引，用于优化搜索
  const lastActiveIndexRef = useRef(0); 
  
  // Original time update handler logic (原始的时间更新处理逻辑)
  const timeUpdateLogic = useCallback(() => {
    // Ensure sync is enabled before proceeding
    if (!syncEnabled) {
        // If sync gets disabled, reset active index? Or just stop updating?
        // Let's reset to be clearer.
        if (activeCueIndex !== -1) setActiveCueIndex(-1);
        return;
    }

    const video = videoRef.current;
    if (!video || !cues || cues.length === 0) {
      if (activeCueIndex !== -1) setActiveCueIndex(-1);
      return;
    }
    const currentTime = video.currentTime;
    let foundIndex = -1;

    // 优化：使用二分搜索查找正确的字幕位置，更高效地处理大量字幕
    let low = 0;
    let high = cues.length - 1;
    
    // 先进行快速检查 - 如果上次活跃的字幕仍然活跃，直接使用它
    const lastActiveIndex = lastActiveIndexRef.current;
    if (lastActiveIndex >= 0 && lastActiveIndex < cues.length) {
      const cue = cues[lastActiveIndex];
      if (currentTime >= cue.startTime && currentTime < cue.endTime) {
        if (lastActiveIndex !== activeCueIndex) {
          setActiveCueIndex(lastActiveIndex);
        }
        return;
      }
    }
    
    // 二分搜索查找字幕
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const cue = cues[mid];
      
      if (currentTime < cue.startTime) {
        high = mid - 1;
      } else if (currentTime >= cue.endTime) {
        low = mid + 1;
      } else {
        // 找到了正在活跃的字幕
        foundIndex = mid;
        break;
      }
    }
    
    // 如果二分搜索没找到，可能是在两个字幕之间
    // 此时我们可以选择显示即将到来的字幕，或者不显示任何字幕
    if (foundIndex === -1 && low < cues.length) {
      // 检查是否即将到来的字幕（小于200ms）
      const nextCue = cues[low];
      if (nextCue && (nextCue.startTime - currentTime) < 0.2) {
        foundIndex = low;
      }
    }

    // Only update state if the index actually changed
    if (foundIndex !== activeCueIndex) {
      setActiveCueIndex(foundIndex);
      if (foundIndex !== -1) {
         lastActiveIndexRef.current = foundIndex;
      }
    }
  // Depend on syncEnabled as well
  }, [videoRef, cues, activeCueIndex, syncEnabled]);

  // --- Throttled version of the handler (节流后的处理函数) ---
  // Use useMemo to ensure the throttled function is created only once
  // or when its dependencies change (though throttle itself doesn't depend on them here)
  const handleTimeUpdateThrottled = useMemo(() =>
      // Throttle the core logic, e.g., update max 4 times per second (250ms)
      // (对核心逻辑进行节流, 例如最多每秒更新4次)
      throttle(timeUpdateLogic, 250), 
      [timeUpdateLogic] // Depend on the memoized core logic function
  );

  // Effect: Add/Remove 'timeupdate' listener (添加/移除监听器)
  useEffect(() => {
    const videoElement = videoRef?.current;
    
    // 严格检查videoElement是否为有效的HTML视频元素
    if (!videoElement || !(videoElement instanceof HTMLVideoElement)) {
      console.log("VttPreviewer: Video element ref is not a valid HTMLVideoElement, listener not added");
      return;
    }
    
    console.log("VttPreviewer: Adding throttled timeupdate listener (添加节流后的 timeupdate 监听器).");
    
    // 使用try-catch包裹事件监听代码，避免可能的错误
    try {
      // Use the throttled handler
      videoElement.addEventListener('timeupdate', handleTimeUpdateThrottled);
      // Initial call still uses the original logic for immediate feedback
      // (初始调用仍用原始逻辑以获得即时反馈)
      timeUpdateLogic(); 
    } catch (error) {
      console.error("VttPreviewer: Error adding timeupdate event listener:", error);
      return; // 如果添加失败，直接返回，避免后续清理代码出错
    }

    return () => {
      try {
        console.log("VttPreviewer: Removing throttled timeupdate listener (移除节流后的 timeupdate 监听器).");
        // Remove the throttled handler
        videoElement.removeEventListener('timeupdate', handleTimeUpdateThrottled);
        
        // Cleanup for the throttle function itself (clear any pending timeout)
        if (handleTimeUpdateThrottled && typeof handleTimeUpdateThrottled.cancel === 'function') { 
          // Note: Our simple throttle doesn't have cancel, lodash does.
          // If using lodash: handleTimeUpdateThrottled.cancel();
        }
      } catch (error) {
        console.error("VttPreviewer: Error removing timeupdate event listener:", error);
      }
    };
  // Depend on the throttled handler instance and the original logic for initial call
  }, [videoRef, videoRef?.current, handleTimeUpdateThrottled, timeUpdateLogic]);

  // 回调：处理字幕项点击事件（仅在非选择模式下用于跳转）
  const handleCueClickForSeek = useCallback((startTime) => {
    // Only seek if onCueSelect is NOT provided (i.e., not in selection mode)
    if (!onCueSelect) {
      const video = videoRef?.current;
      if (video) {
        video.currentTime = startTime; // 设置视频播放时间
        if (video.paused) { 
          video.play().catch(e => console.error("点击字幕播放视频时出错:", e));
        }
      }
    }
    // If onCueSelect is provided, the click is handled by the item itself calling onCueSelect
  }, [videoRef, onCueSelect]); // Added onCueSelect dependency

  // Effect: 将当前活动的字幕项滚动到视图中 (优化版)
  useEffect(() => {
    if (activeCueIndex >= 0 && cueListRef.current) {
      const listElement = cueListRef.current;
      const activeItemElement = listElement.children[activeCueIndex];

      if (activeItemElement) {
        // --- Optimization: Check if element is already reasonably centered --- 
        const listRect = listElement.getBoundingClientRect();
        const itemRect = activeItemElement.getBoundingClientRect();
        
        // Calculate midpoints relative to the viewport
        const listMidY = listRect.top + listRect.height / 2;
        const itemMidY = itemRect.top + itemRect.height / 2;
        
        // Define a tolerance (e.g., 1/6th of the list height)
        const tolerance = listRect.height / 6;
        
        // Only scroll if the item midpoint is outside the tolerance range around the list midpoint
        if (Math.abs(itemMidY - listMidY) > tolerance) {
            // console.log(`Scrolling needed: Item ${activeCueIndex} mid ${itemMidY.toFixed(0)} vs List mid ${listMidY.toFixed(0)}, Tolerance ${tolerance.toFixed(0)}`);
            activeItemElement.scrollIntoView({
                behavior: 'smooth', 
                block: 'center',
            });
        } else {
            // console.log(`Skipping scroll: Item ${activeCueIndex} already centered.`);
        }
        // --- End Optimization ---
      }
    }
  }, [activeCueIndex]); // Dependency remains activeCueIndex

  // Add conditional rendering based on syncEnabled for clarity?
  if (!syncEnabled && activeCueIndex !== -1) {
      // If sync is disabled but we have an active index, reset it.
      // This might happen if syncEnabled changes while a cue is active.
      setActiveCueIndex(-1);
  }

  return (
    <div className="vtt-previewer bg-base-200 p-4 rounded-lg shadow h-full flex flex-col custom-scrollbar">
      {/* <h3 className="text-lg font-semibold mb-2 border-b border-base-300 pb-2">字幕预览</h3> */}
      {/* 如果没有字幕数据，显示提示信息 */}
      {(!cues || cues.length === 0) && (
         <p className="text-gray-500 italic flex-grow flex items-center justify-center">未加载字幕或无可用字幕。</p>
      )}
      {/* 如果有字幕数据，渲染字幕列表 */}
      {cues && cues.length > 0 && (
        <ul ref={cueListRef} className="space-y-1 overflow-y-auto flex-grow pr-2"> 
          {/* 遍历字幕数据，根据 isBilingual 渲染对应的子组件 */} 
          {cues.map((cue, index) => { 
            // Pass isActive based on state (pass isActve 基于 state)
            const isActive = syncEnabled && index === activeCueIndex; 
            // Ensure cue has an ID, fallback if necessary (though parser should provide it)
            const key = cue.id || `${index}-${cue.startTime}`;

            return cue.isBilingual ? (
              <BilingualCueItem 
                key={key} 
                cue={cue} 
                isActive={isActive} 
                onClick={handleCueClickForSeek}
                onCueSelect={onCueSelect}
                selectedCues={selectedCues}
              />
            ) : (
              <MonoCueItem 
                key={key} 
                cue={cue} 
                isActive={isActive} 
                onClick={handleCueClickForSeek}
                onCueSelect={onCueSelect}
                selectedCues={selectedCues}
              />
            );
          })} 
        </ul>
      )}
    </div>
  );
}

// --- Wrap with React.memo for performance (使用 React.memo 优化性能) ---
export default React.memo(VttPreviewer); 