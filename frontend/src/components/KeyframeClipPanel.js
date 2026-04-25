import React, { useState, useEffect, useRef, useCallback } from 'react';
import { formatTime } from '../utils/formatTime';

const KeyframeClipPanel = ({ taskUuid, onClipSegments, videoRef }) => {
  const [keyframes, setKeyframes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const [extractSettings, setExtractSettings] = useState({
    method: 'interval',
    interval: 10,
    count: 100,
    quality: 'medium',
    enableMaxCount: true  // 是否启用最大数量限制
  });
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'timeline'
  const [clipMode, setClipMode] = useState(false);
  const [segments, setSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState({ start: null, end: null });
  const [showSettings, setShowSettings] = useState(false);
  const [gridColumns, setGridColumns] = useState(4); // 默认4列
  const [showTimestamps, setShowTimestamps] = useState(false); // 默认关闭时间戳显示
  const [isLoopPlaying, setIsLoopPlaying] = useState(false); // 循环播放状态
  const [currentLoopSegment, setCurrentLoopSegment] = useState(null); // 当前循环播放的片段
  const loopIntervalRef = useRef(null);

  // 拖拽选择相关状态
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragEnd, setDragEnd] = useState({ x: 0, y: 0 });
  const [dragSelection, setDragSelection] = useState(new Set());
  const [lastClickedFrame, setLastClickedFrame] = useState(null);

  const timelineRef = useRef(null);
  const gridContainerRef = useRef(null);
  const frameRefs = useRef(new Map());

  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskUuid}/keyframes`);
        if (response.ok) {
          const data = await response.json();
          setKeyframes(data.keyframes || []);
        } else if (response.status === 404) {
          setKeyframes([]);
        } else {
          throw new Error('Failed to load keyframes');
        }
      } catch (err) {
        console.error('Error loading keyframes:', err);
        setError('加载关键帧失败');
      } finally {
        setLoading(false);
      }

      try {
        const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskUuid}/keyframes/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } catch (err) {
        console.error('Error loading stats:', err);
      }
    };
    loadInitial();
  }, [taskUuid]);

  // 监听选中关键帧变化，自动更新循环播放片段
  useEffect(() => {
    if (!clipMode && isLoopPlaying) {
      if (selectedFrames.length < 2) {
        console.log('选中关键帧少于2个，停止循环播放');
        stopLoopPlaying();
        return;
      }

      const sortedFrames = [...selectedFrames].sort((a, b) => a - b);
      const firstFrame = keyframes.find(f => f.index === sortedFrames[0]);
      const lastFrame = keyframes.find(f => f.index === sortedFrames[sortedFrames.length - 1]);

      if (firstFrame && lastFrame) {
        const newSegment = {
          start: firstFrame.timestamp,
          end: lastFrame.timestamp
        };

        if (!currentLoopSegment ||
            newSegment.start !== currentLoopSegment.start ||
            newSegment.end !== currentLoopSegment.end) {

          console.log(`选中关键帧变化，更新循环播放片段: ${formatTime(newSegment.start)} → ${formatTime(newSegment.end)}`);

          if (loopIntervalRef.current) {
            clearInterval(loopIntervalRef.current);
            loopIntervalRef.current = null;
          }

          startLoopPlayingSegment(newSegment);
        }
      }
    }
    // stopLoopPlaying and startLoopPlayingSegment access only refs and setters (stable references)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFrames, clipMode, isLoopPlaying, keyframes, currentLoopSegment]);

  // 组件卸载时清理循环播放
  useEffect(() => {
    return () => {
      if (loopIntervalRef.current) {
        clearInterval(loopIntervalRef.current);
      }
    };
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskUuid}/keyframes/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const extractKeyframes = async () => {
    setExtracting(true);
    setError(null);
    try {
      // 处理无限制模式
      const requestData = {
        method: extractSettings.method,
        interval: extractSettings.interval,
        count: extractSettings.method === 'interval' && !extractSettings.enableMaxCount ? -1 : extractSettings.count,
        quality: extractSettings.quality,
        regenerate: true
      };

      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskUuid}/extract_keyframes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('提取关键帧失败');
      }

      const data = await response.json();
      setKeyframes(data.keyframes_data.keyframes || []);
      loadStats();
    } catch (err) {
      console.error('Error extracting keyframes:', err);
      setError(err.message);
    } finally {
      setExtracting(false);
    }
  };

  const deleteKeyframes = async () => {
    if (!window.confirm('确定要删除所有关键帧吗？')) return;
    
    try {
      await fetch(`http://127.0.0.1:8000/api/tasks/${taskUuid}/keyframes`, { method: 'DELETE' });
      setKeyframes([]);
      setStats(null);
      setSelectedFrames([]);
      setSegments([]);
    } catch (err) {
      console.error('Error deleting keyframes:', err);
      setError('删除关键帧失败');
    }
  };

  const toggleFrameSelection = (frameIndex) => {
    setSelectedFrames(prev => {
      if (prev.includes(frameIndex)) {
        return prev.filter(i => i !== frameIndex);
      } else {
        return [...prev, frameIndex].sort((a, b) => a - b);
      }
    });
  };

  const handleFrameClick = (frame, event) => {
    if (!clipMode) {
      const isCtrlPressed = event?.ctrlKey || event?.metaKey;
      const isShiftPressed = event?.shiftKey;
      
      if (isShiftPressed && lastClickedFrame !== null) {
        // Shift+点击：范围选择
        // 基于关键帧在数组中的位置，而不是frame.index
        const currentFramePosition = keyframes.findIndex(f => f.index === frame.index);
        const lastFramePosition = keyframes.findIndex(f => f.index === lastClickedFrame);
        
        if (currentFramePosition !== -1 && lastFramePosition !== -1) {
          const startPos = Math.min(lastFramePosition, currentFramePosition);
          const endPos = Math.max(lastFramePosition, currentFramePosition);
          
          // 获取范围内所有关键帧的index
          const rangeFrames = keyframes
            .slice(startPos, endPos + 1)
            .map(f => f.index);
          
          setSelectedFrames(prev => {
            // 智能范围选择：如果范围内大部分帧已选中，则取消选择；否则添加选择
            const currentlySelected = rangeFrames.filter(frameIndex => prev.includes(frameIndex));
            const shouldDeselect = currentlySelected.length > rangeFrames.length / 2;
            
            if (shouldDeselect) {
              // 取消选择范围内的帧
              return prev.filter(frameIndex => !rangeFrames.includes(frameIndex));
            } else {
              // 添加选择范围内的帧
              const newSelection = new Set([...prev, ...rangeFrames]);
              return Array.from(newSelection).sort((a, b) => a - b);
            }
          });
        }
      } else if (isCtrlPressed) {
        // Ctrl+点击：切换选择
        toggleFrameSelection(frame.index);
      } else {
        // 普通单击：选择并跳转到时间戳，但不自动播放
        setSelectedFrames([frame.index]);
        
        // 跳转到关键帧时间戳但不播放
        if (videoRef?.current) {
          console.log(`单击关键帧 #${frame.index}，跳转到时间戳: ${frame.timestamp}s (不自动播放)`);
          videoRef.current.seekToTimestamp(frame.timestamp);
          // 确保视频暂停
          if (videoRef.current.video && !videoRef.current.video.paused) {
            videoRef.current.video.pause();
          }
        }
      }
      
      // 注意：Shift+点击时不更新lastClickedFrame，保持原有的锚点
      if (!isShiftPressed) {
        setLastClickedFrame(frame.index);
      }
      return;
    }

    // 剪辑模式下的逻辑
    if (currentSegment.start === null) {
      setCurrentSegment({ start: frame.timestamp, end: null });
      console.log(`设置开始点: ${formatTime(frame.timestamp)}`);
    } else if (currentSegment.end === null) {
      const start = Math.min(currentSegment.start, frame.timestamp);
      const end = Math.max(currentSegment.start, frame.timestamp);
      
      const newSegment = { start, end };
      setSegments(prev => [...prev, newSegment]);
      setCurrentSegment({ start: null, end: null });
      console.log(`创建片段: ${formatTime(start)} → ${formatTime(end)}`);
    }
  };

  // 处理双击事件
  const handleFrameDoubleClick = (frame, event) => {
    if (!clipMode) {
      // 双击：跳转到关键帧时间戳
      if (videoRef?.current) {
        console.log(`双击关键帧 #${frame.index}，跳转到时间戳: ${frame.timestamp}s`);
        videoRef.current.seekToTimestamp(frame.timestamp);
      }
    }
  };

  const createSegmentsFromSelected = () => {
    if (selectedFrames.length < 2) {
      alert('请至少选择2个关键帧来创建片段');
      return;
    }

    const selectedTimestamps = selectedFrames
      .map(index => keyframes.find(f => f.index === index)?.timestamp)
      .filter(t => t !== undefined)
      .sort((a, b) => a - b);

    // 创建一个连续的片段，从第一个选中的关键帧到最后一个选中的关键帧
    // 这样可以避免视频跳跃和卡顿
    const newSegment = {
      start: selectedTimestamps[0],
      end: selectedTimestamps[selectedTimestamps.length - 1]
    };

    setSegments(prev => [...prev, newSegment]);
    setSelectedFrames([]);
    
    // 提示用户创建的是连续片段
    const duration = newSegment.end - newSegment.start;
    console.log(`创建连续片段: ${formatTime(newSegment.start)} → ${formatTime(newSegment.end)} (时长: ${formatTime(duration)})`);
  };

  const removeSegment = (index) => {
    setSegments(prev => prev.filter((_, i) => i !== index));
  };

  const clearSegments = () => {
    setSegments([]);
    setCurrentSegment({ start: null, end: null });
  };

  const handleClip = () => {
    if (segments.length === 0) {
      alert('请先创建片段');
      return;
    }
    onClipSegments(segments);
  };

  // 拖拽选择工具函数
  const getElementBounds = (element) => {
    const rect = element.getBoundingClientRect();
    const containerRect = gridContainerRef.current?.getBoundingClientRect();
    if (!containerRect) return null;
    
    return {
      left: rect.left - containerRect.left,
      top: rect.top - containerRect.top,
      right: rect.right - containerRect.left,
      bottom: rect.bottom - containerRect.top,
      width: rect.width,
      height: rect.height
    };
  };

  const isElementInSelection = (elementBounds, selectionBounds) => {
    if (!elementBounds || !selectionBounds) return false;
    
    const { left: selLeft, top: selTop, right: selRight, bottom: selBottom } = selectionBounds;
    const { left: elLeft, top: elTop, right: elRight, bottom: elBottom } = elementBounds;
    
    // 检查是否有重叠
    return !(elRight < selLeft || elLeft > selRight || elBottom < selTop || elTop > selBottom);
  };

  const updateDragSelection = useCallback(() => {
    if (!isDragging || !gridContainerRef.current) return;

    const selectionBounds = {
      left: Math.min(dragStart.x, dragEnd.x),
      top: Math.min(dragStart.y, dragEnd.y),
      right: Math.max(dragStart.x, dragEnd.x),
      bottom: Math.max(dragStart.y, dragEnd.y)
    };

    const newSelection = new Set();
    
    keyframes.forEach(frame => {
      const frameElement = frameRefs.current.get(frame.index);
      if (frameElement) {
        const elementBounds = getElementBounds(frameElement);
        if (isElementInSelection(elementBounds, selectionBounds)) {
          newSelection.add(frame.index);
        }
      }
    });

    setDragSelection(newSelection);
  }, [isDragging, dragStart, dragEnd, keyframes]);

  // 处理鼠标事件
  const handleMouseDown = useCallback((e) => {
    if (clipMode) return; // 剪辑模式下不启用拖拽选择
    
    const containerRect = gridContainerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    // 检查是否点击在关键帧元素上
    const clickedFrame = e.target.closest('[data-frame-index]');
    if (clickedFrame) {
      const frameIndex = parseInt(clickedFrame.dataset.frameIndex);
      const frame = keyframes.find(f => f.index === frameIndex);
      if (frame) {
        handleFrameClick(frame, e);
      }
      return;
    }

    // 开始拖拽选择
    const startX = e.clientX - containerRect.left;
    const startY = e.clientY - containerRect.top;
    
    setIsDragging(true);
    setDragStart({ x: startX, y: startY });
    setDragEnd({ x: startX, y: startY });
    setDragSelection(new Set());
    
    e.preventDefault();
    // handleFrameClick reads keyframes/state via closure; only re-bind when clipMode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipMode]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !gridContainerRef.current) return;

    const containerRect = gridContainerRef.current.getBoundingClientRect();
    const currentX = e.clientX - containerRect.left;
    const currentY = e.clientY - containerRect.top;
    
    setDragEnd({ x: currentX, y: currentY });
  }, [isDragging]);

  const handleMouseUp = useCallback((e) => {
    if (!isDragging) return;

    const isCtrlPressed = e.ctrlKey || e.metaKey;
    
    if (dragSelection.size > 0) {
      setSelectedFrames(prev => {
        if (isCtrlPressed) {
          // Ctrl+拖拽：切换选择状态
          const newSelection = new Set(prev);
          dragSelection.forEach(frameIndex => {
            if (newSelection.has(frameIndex)) {
              newSelection.delete(frameIndex);
            } else {
              newSelection.add(frameIndex);
            }
          });
          return Array.from(newSelection).sort((a, b) => a - b);
        } else {
          // 普通拖拽：替换选择
          return Array.from(dragSelection).sort((a, b) => a - b);
        }
      });
    }

    setIsDragging(false);
    setDragSelection(new Set());
  }, [isDragging, dragSelection]);

  // 更新拖拽选择
  useEffect(() => {
    updateDragSelection();
  }, [updateDragSelection]);

  // 添加全局鼠标事件监听
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      // 空格键：播放/暂停或循环播放
      if (e.code === 'Space') {
        e.preventDefault();
        console.log('空格键被按下，调用 togglePlayPause');
        togglePlayPause();
        return;
      }
      
      // Escape: 取消循环播放或清空选择
      if (e.key === 'Escape') {
        e.preventDefault();
        if (isLoopPlaying) {
          stopLoopPlaying();
          console.log('取消循环播放');
        } else if (clipMode) {
          // 剪辑模式下清空当前片段
          setCurrentSegment({ start: null, end: null });
          console.log('取消当前片段标记');
        } else {
          // 非剪辑模式下清空选择
          setSelectedFrames([]);
          setLastClickedFrame(null);
          console.log('清空关键帧选择');
        }
        return;
      }
      
      // 只在非剪辑模式下处理其他键盘事件
      if (clipMode) return;
      
      // Ctrl/Cmd + A: 全选
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        setSelectedFrames(keyframes.map(f => f.index));
      }
      
      // Ctrl/Cmd + I: 反选
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        setSelectedFrames(keyframes.filter(f => !selectedFrames.includes(f.index)).map(f => f.index));
      }
      
      // Delete: 删除选中的关键帧（可以根据需要实现）
      if (e.key === 'Delete' && selectedFrames.length > 0) {
        // 这里可以添加删除选中关键帧的逻辑
        console.log('Delete selected frames:', selectedFrames);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
    // stopLoopPlaying and togglePlayPause access only refs and setters (stable)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clipMode, keyframes, selectedFrames, isLoopPlaying]);

  const renderKeyframeGrid = () => {
    const selectionStyle = isDragging ? {
      position: 'absolute',
      left: Math.min(dragStart.x, dragEnd.x),
      top: Math.min(dragStart.y, dragEnd.y),
      width: Math.abs(dragEnd.x - dragStart.x),
      height: Math.abs(dragEnd.y - dragStart.y),
      border: '2px dashed #3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      pointerEvents: 'none',
      zIndex: 1000
    } : {};

    return (
      <div 
        ref={gridContainerRef}
        className="relative select-none"
        onMouseDown={handleMouseDown}
        style={{ userSelect: 'none' }}
      >
        <div 
          className="grid gap-2"
          style={{ 
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
          }}
        >
          {keyframes.map((frame) => {
            const isSelected = selectedFrames.includes(frame.index) || dragSelection.has(frame.index);
            const isAnchor = !clipMode && lastClickedFrame === frame.index;
            
            return (
              <div
                key={frame.index}
                ref={el => {
                  if (el) {
                    frameRefs.current.set(frame.index, el);
                  } else {
                    frameRefs.current.delete(frame.index);
                  }
                }}
                data-frame-index={frame.index}
                className={`relative cursor-pointer border-2 rounded transition-all overflow-hidden group ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : isAnchor
                    ? 'border-purple-400 bg-purple-50'
                    : clipMode && currentSegment.start === frame.timestamp
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-400'
                }`}
                onClick={(e) => handleFrameClick(frame, e)}
                onDoubleClick={(e) => handleFrameDoubleClick(frame, e)}
              >
                {/* 16:9 等比例容器 */}
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <img
                    src={`http://127.0.0.1:8000/files/${taskUuid}/${frame.relative_path}`}
                    alt={`Frame ${frame.index}`}
                    className="absolute inset-0 w-full h-full object-cover rounded transition-transform group-hover:scale-105"
                    loading="lazy"
                    draggable={false}
                  />
                  {/* 时间戳叠加层 */}
                  {showTimestamps && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 rounded-b">
                      <div className="font-medium">{formatTime(frame.timestamp)}</div>
                      {gridColumns <= 4 && (
                        <div className="text-gray-300 text-[10px]">#{frame.index}</div>
                      )}
                    </div>
                  )}
                  {/* 选中标记 */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                      ✓
                    </div>
                  )}
                  {/* 锚点标记 */}
                  {isAnchor && !isSelected && (
                    <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                      ⚓
                    </div>
                  )}
                  {/* 剪辑模式起始帧标记 */}
                  {clipMode && currentSegment.start === frame.timestamp && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                      ▶
                    </div>
                  )}
                  {/* 悬停效果 */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* 拖拽选择框 */}
        {isDragging && (
          <div style={selectionStyle} />
        )}
      </div>
    );
  };

  const renderTimeline = () => {
    const videoDuration = stats?.video_duration || 0;
    const timelineWidth = 800;
    
    return (
      <div className="relative" style={{ width: timelineWidth, height: 120 }}>
        <div className="absolute top-0 w-full h-2 bg-gray-200 rounded">
          {/* 时间轴背景 */}
        </div>
        
        {/* 关键帧标记 */}
        {keyframes.map((frame) => {
          const position = (frame.timestamp / videoDuration) * timelineWidth;
          return (
            <div
              key={frame.index}
              className={`absolute cursor-pointer ${
                selectedFrames.includes(frame.index) ? 'z-20' : 'z-10'
              }`}
              style={{ left: position - 30, top: 10 }}
              onClick={(e) => handleFrameClick(frame, e)}
              onDoubleClick={(e) => handleFrameDoubleClick(frame, e)}
            >
              <img
                src={`http://127.0.0.1:8000/files/${taskUuid}/${frame.relative_path}`}
                alt={`Frame ${frame.index}`}
                className={`w-16 h-12 object-cover border-2 rounded ${
                  selectedFrames.includes(frame.index)
                    ? 'border-blue-500'
                    : 'border-gray-300'
                }`}
              />
              {showTimestamps && (
                <div className="text-xs text-center mt-1">
                  {formatTime(frame.timestamp)}
                </div>
              )}
            </div>
          );
        })}
        
        {/* 片段标记 */}
        {segments.map((segment, index) => {
          const startPos = (segment.start / videoDuration) * timelineWidth;
          const endPos = (segment.end / videoDuration) * timelineWidth;
          const width = endPos - startPos;
          
          return (
            <div
              key={index}
              className="absolute bg-green-400 bg-opacity-50 border border-green-600 rounded"
              style={{
                left: startPos,
                top: 80,
                width: width,
                height: 20
              }}
            >
              <span className="text-xs text-green-800 px-1">
                片段 {index + 1}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  // 播放选中关键帧的功能
  const playSelectedFrame = () => {
    if (selectedFrames.length === 0) {
      alert('请先选择一个关键帧');
      return;
    }

    // 如果选中多个关键帧，创建临时片段并循环播放
    if (selectedFrames.length > 1) {
      const selectedTimestamps = selectedFrames
        .map(index => keyframes.find(f => f.index === index)?.timestamp)
        .filter(t => t !== undefined)
        .sort((a, b) => a - b);

      const tempSegment = {
        start: selectedTimestamps[0],
        end: selectedTimestamps[selectedTimestamps.length - 1]
      };

      console.log(`循环播放选中的关键帧片段: ${formatTime(tempSegment.start)} → ${formatTime(tempSegment.end)} (${selectedFrames.length}个关键帧)`);
      
      // 开始循环播放选中的片段
      startLoopPlayingSegment(tempSegment);
      return;
    }

    // 如果只选中一个关键帧，正常播放
    const firstSelectedIndex = selectedFrames[0];
    const selectedFrame = keyframes.find(f => f.index === firstSelectedIndex);
    
    if (!selectedFrame || !videoRef?.current) {
      console.error('无法找到选中的关键帧或视频播放器');
      return;
    }

    console.log(`播放关键帧 #${selectedFrame.index} 时间戳: ${selectedFrame.timestamp}s`);
    
    // 跳转到关键帧时间戳并播放
    const success = videoRef.current.seekToTimestamp(selectedFrame.timestamp);
    if (success) {
      console.log(`成功跳转到关键帧 #${selectedFrame.index}`);
      // 延迟一点确保跳转完成，然后开始播放
      setTimeout(() => {
        if (videoRef.current?.video) {
          videoRef.current.video.play().catch(err => console.log('播放选中关键帧失败:', err));
          console.log(`开始播放关键帧 #${selectedFrame.index}`);
        }
      }, 100);
    }
  };

  // 暂停播放
  const pauseVideo = () => {
    if (videoRef?.current?.video) {
      videoRef.current.video.pause();
    }
  };

  // 停止循环播放
  const stopLoopPlaying = () => {
    if (loopIntervalRef.current) {
      clearInterval(loopIntervalRef.current);
      loopIntervalRef.current = null;
    }
    setIsLoopPlaying(false);
    setCurrentLoopSegment(null);
    if (videoRef?.current?.video) {
      videoRef.current.video.pause();
    }
  };

  // 开始循环播放指定片段（通用函数）
  const startLoopPlayingSegment = (segment) => {
    const duration = segment.end - segment.start;
    
    if (duration <= 0) {
      alert('无效的片段时长');
      return;
    }

    console.log(`开始循环播放片段: ${formatTime(segment.start)} → ${formatTime(segment.end)} (时长: ${formatTime(duration)})`);
    
    setIsLoopPlaying(true);
    setCurrentLoopSegment(segment);
    
    // 跳转到开始位置并手动播放
    if (videoRef?.current) {
      // 先跳转到开始位置
      videoRef.current.seekToTimestamp(segment.start);
      
      // 延迟一点确保跳转完成，然后开始播放
      setTimeout(() => {
        if (videoRef.current?.video) {
          videoRef.current.video.play().catch(err => console.log('播放失败:', err));
          console.log(`开始播放片段，当前时间: ${videoRef.current.video.currentTime}s`);
        }
      }, 100);
    }

    // 设置循环定时器
    loopIntervalRef.current = setInterval(() => {
      if (videoRef?.current) {
        console.log(`循环播放：跳转回开始位置 ${segment.start}s`);
        videoRef.current.seekToTimestamp(segment.start);
        
        // 延迟一点确保跳转完成，然后继续播放
        setTimeout(() => {
          if (videoRef.current?.video) {
            videoRef.current.video.play().catch(err => console.log('循环播放失败:', err));
          }
        }, 100);
      }
    }, duration * 1000);
  };

  // 开始循环播放片段（剪辑模式使用）
  const startLoopPlaying = () => {
    if (segments.length === 0) {
      alert('请先标记开始和结束点创建片段');
      return;
    }

    // 使用最新创建的片段
    const segment = segments[segments.length - 1];
    startLoopPlayingSegment(segment);
  };

  // 切换播放/暂停
  const togglePlayPause = () => {
    console.log(`togglePlayPause 被调用: clipMode=${clipMode}, segments.length=${segments.length}, isLoopPlaying=${isLoopPlaying}`);
    
    // 如果正在循环播放，停止循环播放
    if (isLoopPlaying) {
      console.log('停止循环播放');
      stopLoopPlaying();
      return;
    }

    // 如果在剪辑模式且已标记开始和结束点，开始循环播放
    if (clipMode && segments.length > 0) {
      console.log('开始循环播放，片段数量:', segments.length);
      startLoopPlaying();
      return;
    }

    if (!videoRef?.current?.video) {
      // 如果视频播放器不可用，尝试播放选中的关键帧
      playSelectedFrame();
      return;
    }

    const video = videoRef.current.video;
    
    console.log(`视频状态: paused=${video.paused}, selectedFrames.length=${selectedFrames.length}`);
    
    // 优先处理选中的关键帧
    if (selectedFrames.length > 0) {
      console.log('播放选中的关键帧');
      playSelectedFrame();
    } else if (video.paused) {
      // 如果没有选中关键帧且视频暂停，在当前位置播放
      console.log('在当前位置播放视频');
      video.play().catch(err => console.log('播放失败:', err));
    } else {
      // 如果正在播放且没有选中关键帧，暂停
      console.log('暂停视频');
      pauseVideo();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载关键帧...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 头部控制面板 */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-lg font-semibold">关键帧剪辑</h3>
          
          {stats && (
            <div className="text-sm text-gray-600">
              已提取 {stats.count} 个关键帧 | 质量: {stats.quality} | 
              成功率: {(stats.success_rate * 100).toFixed(1)}%
              {!showSettings && (
                <span className="ml-2 text-blue-600">
                  (对结果不满意？点击"修改设置"重新提取)
                </span>
              )}
            </div>
          )}
          
          <div className="flex gap-2 ml-auto items-center">
            {/* 网格列数调整 */}
            {viewMode === 'grid' && keyframes.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-sm text-gray-600">列数:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setGridColumns(Math.max(2, gridColumns - 1))}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={gridColumns <= 2}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium bg-gray-50 rounded px-2 py-1">
                    {gridColumns}
                  </span>
                  <button
                    onClick={() => setGridColumns(Math.min(12, gridColumns + 1))}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={gridColumns >= 12}
                  >
                    +
                  </button>
                </div>
                {/* 快捷列数按钮 */}
                <div className="flex gap-1 ml-2">
                  {[3, 4, 6, 8].map(cols => (
                    <button
                      key={cols}
                      onClick={() => setGridColumns(cols)}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        gridColumns === cols 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {cols}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'timeline' : 'grid')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              {viewMode === 'grid' ? '时间轴视图' : '网格视图'}
            </button>
            
            <button
              onClick={() => setShowTimestamps(!showTimestamps)}
              className={`px-3 py-1 rounded text-sm ${
                showTimestamps 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {showTimestamps ? '隐藏时间戳' : '显示时间戳'}
            </button>
            
            <button
              onClick={() => setClipMode(!clipMode)}
              className={`px-3 py-1 rounded text-sm ${
                clipMode 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {clipMode ? '退出剪辑模式' : '进入剪辑模式'}
            </button>
            
            {/* 批量选择操作按钮 */}
            {!clipMode && keyframes.length > 0 && (
              <>
                <div className="h-4 border-l border-gray-300"></div>
                <button
                  onClick={() => setSelectedFrames(keyframes.map(f => f.index))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  全选
                </button>
                <button
                  onClick={() => setSelectedFrames([])}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  disabled={selectedFrames.length === 0}
                >
                  清空选择
                </button>
                <button
                  onClick={() => setSelectedFrames(keyframes.filter(f => !selectedFrames.includes(f.index)).map(f => f.index))}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                  disabled={keyframes.length === 0}
                >
                  反选
                </button>
              </>
            )}
          </div>
        </div>

        {/* 提取设置 */}
        {(keyframes.length === 0 || showSettings) && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">提取设置</h4>
              {keyframes.length > 0 && (
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  隐藏设置
                </button>
              )}
            </div>
            {/* 方案选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">提取方案</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div 
                  className={`p-3 border-2 rounded cursor-pointer transition-all ${
                    extractSettings.method === 'interval' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setExtractSettings(prev => ({ ...prev, method: 'interval' }))}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">⏱️</span>
                    <span className="font-medium">方案1: 固定间隔</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    按指定时间间隔提取关键帧，适合教学视频等需要均匀采样的场景
                  </p>
                </div>
                
                <div 
                  className={`p-3 border-2 rounded cursor-pointer transition-all ${
                    extractSettings.method === 'count' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setExtractSettings(prev => ({ ...prev, method: 'count' }))}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">🎯</span>
                    <span className="font-medium">方案2: 固定数量</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    均匀分布提取指定数量的关键帧，适合生成预览、缩略图等场景
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {extractSettings.method === 'interval' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">间隔 (秒)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={extractSettings.interval}
                      onChange={(e) => setExtractSettings(prev => ({
                        ...prev,
                        interval: parseInt(e.target.value)
                      }))}
                      className="w-full px-3 py-1 border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      每隔多少秒提取一个关键帧
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium">最大数量限制</label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={extractSettings.enableMaxCount}
                          onChange={(e) => setExtractSettings(prev => ({
                            ...prev,
                            enableMaxCount: e.target.checked
                          }))}
                          className="mr-1"
                        />
                        <span className="text-xs text-gray-600">启用</span>
                      </label>
                    </div>
                    
                    {extractSettings.enableMaxCount ? (
                      <>
                        <input
                          type="number"
                          min="10"
                          max="500"
                          value={extractSettings.count}
                          onChange={(e) => setExtractSettings(prev => ({
                            ...prev,
                            count: parseInt(e.target.value)
                          }))}
                          className="w-full px-3 py-1 border rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          最多提取的关键帧数量
                        </p>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value="无限制"
                          disabled
                          className="w-full px-3 py-1 border rounded bg-gray-100 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          按间隔提取所有关键帧，不限制数量
                        </p>
                      </>
                    )}
                  </div>
                </>
              )}
              
              {extractSettings.method === 'count' && (
                <div>
                  <label className="block text-sm font-medium mb-1">数量</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={extractSettings.count}
                    onChange={(e) => setExtractSettings(prev => ({
                      ...prev,
                      count: parseInt(e.target.value)
                    }))}
                    className="w-full px-3 py-1 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    要提取的关键帧总数量
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">质量</label>
                <select
                  value={extractSettings.quality}
                  onChange={(e) => setExtractSettings(prev => ({
                    ...prev,
                    quality: e.target.value
                  }))}
                  className="w-full px-3 py-1 border rounded"
                >
                  <option value="low">低 (160x90)</option>
                  <option value="medium">中 (320x180)</option>
                  <option value="high">高 (640x360)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  关键帧图片的分辨率
                </p>
              </div>
            </div>
            
            {/* 当前设置预览 */}
            {stats && (
              <div className="mt-3 space-y-3">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>当前设置预览:</strong> 
                    方案{extractSettings.method === 'interval' ? '1(固定间隔)' : '2(固定数量)'}，
                    {extractSettings.method === 'interval' && extractSettings.enableMaxCount && `间隔 ${extractSettings.interval}秒，最多 ${extractSettings.count} 个关键帧，`}
                    {extractSettings.method === 'interval' && !extractSettings.enableMaxCount && `间隔 ${extractSettings.interval}秒，无数量限制，`}
                    {extractSettings.method === 'count' && `总数量 ${extractSettings.count} 个关键帧，`}
                    质量 {extractSettings.quality === 'low' ? '低' : extractSettings.quality === 'medium' ? '中' : '高'}
                    {stats.video_duration && extractSettings.method === 'interval' && extractSettings.enableMaxCount && (
                      <span>
                        {' '}→ 预计提取 {Math.min(Math.floor(stats.video_duration / extractSettings.interval) + 1, extractSettings.count)} 个关键帧
                      </span>
                    )}
                    {stats.video_duration && extractSettings.method === 'interval' && !extractSettings.enableMaxCount && (
                      <span>
                        {' '}→ 预计提取 {Math.floor(stats.video_duration / extractSettings.interval) + 1} 个关键帧
                      </span>
                    )}
                    {stats.video_duration && extractSettings.method === 'count' && (
                      <span>
                        {' '}→ 间隔约 {(stats.video_duration / (extractSettings.count - 1)).toFixed(1)}秒
                      </span>
                    )}
                  </p>
                </div>
                
                {keyframes.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-700 mb-2">
                      <strong>提取建议:</strong>
                    </p>
                                         <div className="text-xs text-yellow-600 space-y-1">
                       {extractSettings.method === 'interval' && (
                         <>
                           <p>• <strong>关键帧太少？</strong> 减小间隔时间 (如改为 {Math.max(1, extractSettings.interval - 5)}秒){extractSettings.enableMaxCount && ' 或增加最大数量'}</p>
                           <p>• <strong>关键帧太多？</strong> 增大间隔时间 (如改为 {extractSettings.interval + 5}秒){extractSettings.enableMaxCount ? ' 或减少最大数量' : ' 或启用最大数量限制'}</p>
                           {!extractSettings.enableMaxCount && (
                             <p>• <strong>无限制模式:</strong> 当前会提取所有间隔位置的关键帧，适合详细分析</p>
                           )}
                         </>
                       )}
                       {extractSettings.method === 'count' && (
                         <>
                           <p>• <strong>关键帧太少？</strong> 增加数量设置</p>
                           <p>• <strong>关键帧太多？</strong> 减少数量设置</p>
                         </>
                       )}
                       <p>• <strong>图片不够清晰？</strong> 提高质量等级 (当前: {extractSettings.quality === 'low' ? '低' : extractSettings.quality === 'medium' ? '中' : '高'})</p>
                       <p>• <strong>加载太慢？</strong> 降低质量等级或减少关键帧数量</p>
                     </div>
                     
                     {/* 快速设置按钮 */}
                     <div className="mt-3 pt-3 border-t border-yellow-300">
                       <p className="text-sm text-yellow-700 mb-2"><strong>快速调整:</strong></p>
                       <div className="flex flex-wrap gap-2">
                         {extractSettings.method === 'interval' && (
                           <>
                             <button
                               onClick={() => setExtractSettings(prev => ({ ...prev, interval: Math.max(1, prev.interval - 5) }))}
                               className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                             >
                               更密集 (-5秒)
                             </button>
                             <button
                               onClick={() => setExtractSettings(prev => ({ ...prev, interval: prev.interval + 5 }))}
                               className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                             >
                               更稀疏 (+5秒)
                             </button>
                           </>
                         )}
                         {(extractSettings.method === 'count' || (extractSettings.method === 'interval' && extractSettings.enableMaxCount)) && (
                           <>
                             <button
                               onClick={() => setExtractSettings(prev => ({ ...prev, count: Math.min(500, prev.count + 50) }))}
                               className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                             >
                               更多帧 (+50)
                             </button>
                             <button
                               onClick={() => setExtractSettings(prev => ({ ...prev, count: Math.max(10, prev.count - 50) }))}
                               className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                             >
                               更少帧 (-50)
                             </button>
                           </>
                         )}
                         {extractSettings.method === 'interval' && !extractSettings.enableMaxCount && (
                           <button
                             onClick={() => setExtractSettings(prev => ({ ...prev, enableMaxCount: true }))}
                             className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                           >
                             启用数量限制
                           </button>
                         )}
                         {extractSettings.quality !== 'high' && (
                           <button
                             onClick={() => setExtractSettings(prev => ({ 
                               ...prev, 
                               quality: prev.quality === 'low' ? 'medium' : 'high' 
                             }))}
                             className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                           >
                             提高质量
                           </button>
                         )}
                         {extractSettings.quality !== 'low' && (
                           <button
                             onClick={() => setExtractSettings(prev => ({ 
                               ...prev, 
                               quality: prev.quality === 'high' ? 'medium' : 'low' 
                             }))}
                             className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                           >
                             降低质量
                           </button>
                         )}
                       </div>
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {keyframes.length === 0 ? (
            <button
              onClick={extractKeyframes}
              disabled={extracting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {extracting ? '提取中...' : '提取关键帧'}
            </button>
          ) : (
            <>
              <button
                onClick={extractKeyframes}
                disabled={extracting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {extracting ? '重新提取中...' : '重新提取'}
              </button>
              
              {!showSettings && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  修改设置
                </button>
              )}
              
              <button
                onClick={deleteKeyframes}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                删除关键帧
              </button>
              
              {!clipMode && selectedFrames.length >= 2 && (
                <button
                  onClick={createSegmentsFromSelected}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  创建连续片段 ({selectedFrames.length} 帧)
                </button>
              )}
              
              {segments.length > 0 && (
                <>
                  <button
                    onClick={clearSegments}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    清除片段
                  </button>
                  
                  <button
                    onClick={handleClip}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    开始剪辑 ({segments.length} 个片段)
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 片段列表 */}
      {segments.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-3">剪辑片段 ({segments.length})</h4>
          <div className="space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>
                  片段 {index + 1}: {formatTime(segment.start)} → {formatTime(segment.end)}
                  <span className="text-gray-500 ml-2">
                    (时长: {formatTime(segment.end - segment.start)})
                  </span>
                </span>
                <button
                  onClick={() => removeSegment(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 关键帧显示 */}
      {keyframes.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium">
                关键帧 ({keyframes.length})
                {clipMode && (
                  <span className="ml-2 text-sm text-green-600">
                    剪辑模式: 点击两个关键帧创建连续片段
                    {currentSegment.start !== null && (
                      <span className="ml-2 text-orange-600">
                        (已选择起始: {formatTime(currentSegment.start)})
                      </span>
                    )}
                    {isLoopPlaying && (
                      <span className="ml-2 text-purple-600 animate-pulse">
                        🔄 循环播放中 (按ESC取消)
                      </span>
                    )}
                  </span>
                )}
                {!clipMode && selectedFrames.length > 0 && (
                  <span className="ml-2 text-sm text-blue-600">
                    已选择 {selectedFrames.length} 个关键帧
                  </span>
                )}
              </h4>
            </div>
            
            {/* 当前显示状态 */}
            {viewMode === 'grid' && (
              <div className="text-sm text-gray-500">
                {gridColumns} 列网格 • 等比例 16:9 显示
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto">
            {viewMode === 'grid' ? renderKeyframeGrid() : renderTimeline()}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      {keyframes.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">使用说明</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>单击关键帧</strong>: 标记选择关键帧，左侧播放器跳转到时间戳(不自动播放)</p>
            <p>• <strong>双击关键帧</strong>: 左侧视频播放器跳转到对应时间戳</p>
            <p>• <strong>网格模式</strong>: 选择多个关键帧后点击"创建片段" - 会创建从第一帧到最后一帧的连续片段</p>
            <p>• <strong>剪辑模式</strong>: 依次点击两个关键帧自动创建连续片段 - 包含中间所有画面，避免卡顿</p>
            <p>• <strong>循环播放</strong>: 标记开始和结束点后，按空格键循环播放片段，ESC取消</p>
            <p>• <strong>时间轴模式</strong>: 在时间轴上可视化查看关键帧分布</p>
            <p>• <strong>连续剪辑</strong>: 选中的关键帧之间会自动补全中间画面，确保视频流畅</p>
            <p>• 创建片段后点击"开始剪辑"进行视频剪切</p>
          </div>
        </div>
      )}

      {/* 使用说明 */}
      {!clipMode && keyframes.length > 0 && (
        <div className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <div className="flex flex-wrap gap-4">
            <span>💡 <strong>选择提示:</strong></span>
            <span>• 单击关键帧标记选择</span>
            <span>• 双击关键帧跳转时间戳</span>
            <span>• 鼠标拖拽框选多个关键帧</span>
            <span>• Ctrl/Cmd+点击切换选择</span>
            <span>• Shift+点击范围选择(从锚点⚓到当前帧)</span>
            <span>• Ctrl/Cmd+拖拽切换框选区域</span>
          </div>
          <div className="flex flex-wrap gap-4 mt-1">
            <span>⌨️ <strong>快捷键:</strong></span>
            <span>• 空格键 播放选中关键帧(多选时循环播放片段)</span>
            <span>• Ctrl/Cmd+A 全选</span>
            <span>• Escape 取消循环播放或清空选择</span>
            <span>• Ctrl/Cmd+I 反选</span>
          </div>
          {lastClickedFrame !== null && (
            <div className="mt-1 text-purple-600">
              <span>⚓ <strong>当前锚点:</strong> 关键帧 #{lastClickedFrame} (Shift+点击其他帧可选择范围)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default KeyframeClipPanel;