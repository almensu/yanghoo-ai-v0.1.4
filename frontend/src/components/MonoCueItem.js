import React from 'react';
import { formatTime } from '../utils/formatTime';

// 单语字幕项组件
// Props:
// - cue: 字幕对象 { id, startTime, text } (需要有 id)
// - isActive: 是否为当前活动字幕 (boolean)
// - onClick: 点击处理函数 (function)，接收 startTime 作为参数 (原始行为)
// NEW Props for Selection:
// - onCueSelect: 可选的回调函数，用于处理 cue 选择 (function)，接收 cueId 作为参数
// - selectedCues: 可选的 Set，包含当前选中的 cue ID
const MonoCueItem = ({ cue, isActive, onClick, onCueSelect, selectedCues }) => {

  // Determine if this cue is selected
  const isSelected = selectedCues && selectedCues.has(cue.id);

  // Handle click: either select or seek video
  const handleClick = (event) => {
    if (onCueSelect) {
      onCueSelect(cue.id, event.shiftKey); // Pass shiftKey status
    } else if (onClick) {
      onClick(cue.startTime); // Fallback to original seek behavior
    }
  };

  // Selection mode is active if onCueSelect is provided
  const selectionModeActive = !!onCueSelect;

  return (
    <li 
      // Combine styles: active, selected, and hover
      className={`
        px-3 py-2 rounded cursor-pointer flex items-start 
        transition-all duration-150 ease-in-out
        ${isActive ? 'bg-primary text-primary-content font-medium' : ''} 
        ${isSelected ? 
          (isActive ? 'border-2 border-accent shadow-sm' : 'border border-accent bg-accent bg-opacity-5 shadow-sm') : 
          (isActive ? '' : 'hover:bg-base-300')
        }
        ${!isActive && !isSelected ? 'bg-base-100' : ''} // Default background if not active/selected
      `}
      onClick={handleClick} // Use the new handler
    >
      {/* 选择指示器 (仅在选择模式下显示) */}
      {selectionModeActive && (
        <div className="mr-2 flex items-center">
          <div className={`w-4 h-4 flex-shrink-0 rounded-sm border ${isSelected ? 'bg-accent border-accent' : 'border-gray-300'} flex items-center justify-center`}>
            {isSelected && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-3 h-3 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}
      
      {/* 时间戳 */}
      <span className="inline-block text-xs opacity-70 pt-1 w-20 min-w-20">
        {formatTime(cue.startTime)}
      </span>
      {/* 字幕文本 */}
      <span className="flex-grow text-sm leading-tight"> 
        {cue.text}
      </span>
    </li>
  );
};

// 使用 React.memo 进行性能优化，避免不必要的重渲染
export default React.memo(MonoCueItem); 