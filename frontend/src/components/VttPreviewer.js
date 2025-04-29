import React, { useState, useEffect, useRef, useCallback } from 'react';
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

function VttPreviewer({ cues = [], videoRef }) { 
  // 状态：当前活动字幕的索引
  const [activeCueIndex, setActiveCueIndex] = useState(-1);
  // Ref: 指向字幕列表的滚动容器
  const cueListRef = useRef(null); 
  // Ref: 存储上一个活动的索引，用于优化搜索
  const lastActiveIndexRef = useRef(0); 
  
  // 回调：处理视频时间更新，查找当前活动字幕索引 (优化版)
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || !cues || cues.length === 0) { 
      setActiveCueIndex(-1);
      return;
    }
    const currentTime = video.currentTime;
    let foundIndex = -1;
    
    // --- Optimization: Start search near the last active index --- 
    const searchStart = Math.max(0, lastActiveIndexRef.current - 2); // Start a bit before last known index
    
    for (let i = searchStart; i < cues.length; i++) {
      if (currentTime >= cues[i].startTime && currentTime < cues[i].endTime) {
        foundIndex = i;
        break;
      }
      // Optimization: If current cue's start time is already way past current time, stop searching
      if (cues[i].startTime > currentTime + 1) { // Add a small buffer (1 second)
          break;
      }
    }
    
    // If not found in the forward search, maybe we jumped back or started mid-way
    // Search backwards from the start point if needed (less common case)
    if (foundIndex === -1) {
        for (let i = searchStart -1; i >=0; i--) {
             if (currentTime >= cues[i].startTime && currentTime < cues[i].endTime) {
                foundIndex = i;
                break;
            }
        }
    }
    // --- End Optimization ---

    // 只有当活动索引实际发生变化时才更新状态
    if (foundIndex !== activeCueIndex) {
      setActiveCueIndex(foundIndex);
      if (foundIndex !== -1) {
         lastActiveIndexRef.current = foundIndex; // Update last known index
      }
    }
  }, [videoRef, cues, activeCueIndex]); // Keep activeCueIndex dependency for correct comparison

  // Effect: 添加和移除视频的 timeupdate 事件监听器
  useEffect(() => {
    const videoElement = videoRef?.current; 
    if (videoElement) {
      console.log("VttPreviewer: 添加 timeupdate 监听器于", videoElement);
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
      handleTimeUpdate(); // 组件加载时立即调用一次，设置初始高亮
      // 清理函数：组件卸载时移除监听器
      return () => {
        if (videoElement) { 
            console.log("VttPreviewer: 移除 timeupdate 监听器于", videoElement);
             videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        } else if (videoRef?.current) { // 备用检查
            console.log("VttPreviewer: 移除 timeupdate 监听器 (备用检查) 于", videoRef.current);
            videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
        }
      };
    } else {
        console.log("VttPreviewer: 视频元素 ref 不可用，未添加监听器。");
    }
    // 依赖项：videoRef 及其 current 值的变化，以及 handleTimeUpdate 回调的变化
  }, [videoRef, videoRef?.current, handleTimeUpdate]);

  // 回调：处理字幕项点击事件（传递给子组件）
  const handleCueClick = useCallback((startTime) => {
    const video = videoRef?.current;
    if (video) {
      video.currentTime = startTime; // 设置视频播放时间
      if (video.paused) { // 如果视频是暂停的，则开始播放
        video.play().catch(e => console.error("点击字幕播放视频时出错:", e));
      }
    }
  }, [videoRef]); // 依赖项：仅 videoRef

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

  return (
    <div className="vtt-previewer bg-base-200 p-4 rounded-lg shadow max-h-[400px] flex flex-col">
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
            const isActive = index === activeCueIndex; // 判断是否为活动字幕
            // 生成唯一的 key
            const key = `${index}-${cue.startTime}`;

            // 根据 isBilingual 标志分发到不同的子组件
            return cue.isBilingual ? (
              <BilingualCueItem 
                key={key} 
                cue={cue} // 传递双语字幕数据
                isActive={isActive} // 传递活动状态
                onClick={handleCueClick} // 传递点击处理函数
              />
            ) : (
              <MonoCueItem 
                key={key} 
                cue={cue} // 传递单语字幕数据
                isActive={isActive} // 传递活动状态
                onClick={handleCueClick} // 传递点击处理函数
              />
            );
          })} 
        </ul>
      )}
    </div>
  );
}

export default VttPreviewer; 