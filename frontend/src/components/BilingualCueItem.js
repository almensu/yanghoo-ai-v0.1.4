import React from 'react';
import { formatTime } from '../utils/formatTime';

// 双语字幕项组件
// Props:
// - cue: 字幕对象 { id, startTime, enText, zhText } (需要有 id)
// - isActive: 是否为当前活动字幕 (boolean)
// - onClick: 点击处理函数 (function)，接收 startTime 作为参数
// NEW Props for Selection:
// - onCueSelect: 可选的回调函数，用于处理 cue 选择 (function)，接收 cueId 作为参数
// - selectedCues: 可选的 Set，包含当前选中的 cue ID
const BilingualCueItem = ({ cue, isActive, onClick, onCueSelect, selectedCues }) => {

  // Determine if this cue is selected
  const isSelected = selectedCues && selectedCues.has(cue.id);

  // Handle click: either select or seek video
  const handleClick = () => {
    if (onCueSelect) {
      onCueSelect(cue.id);
    } else if (onClick) {
      onClick(cue.startTime);
    }
  };

  // 处理 null 值并设置占位符
  const en = cue.enText ?? "[Missing EN]";
  const zh = cue.zhText ?? "[缺失中文]"; // 使用中文占位符

  // 根据文本是否存在确定占位符样式（例如，斜体和灰色）
  const enStyle = cue.enText ? "text-sm leading-tight mb-1" : "text-sm italic text-gray-400 leading-tight mb-1";
  const zhStyle = cue.zhText ? "text-sm text-gray-700 leading-tight" : "text-sm italic text-gray-400 leading-tight";

  return (
    <li 
      // Combine styles: active, selected, and hover
      className={`
        px-3 py-2 rounded cursor-pointer flex items-start
        transition-colors duration-150 ease-in-out
        ${isActive ? 'bg-primary text-primary-content font-medium' : ''}
        ${isSelected ?
          (isActive ? 'border-2 border-secondary' : 'bg-secondary bg-opacity-30') :
          (isActive ? '' : 'hover:bg-base-300')
        }
        ${!isActive && !isSelected ? 'bg-base-100' : ''} // Default background if not active/selected
      `}
      onClick={handleClick} // Use the new handler
    >
      {/* 时间戳 */}
      <span className="inline-block text-xs opacity-70 pt-1 w-20 min-w-20">
        {formatTime(cue.startTime)}
      </span>
      {/* 双语文本区域 */}
      <span className="flex-grow">
        <p className={enStyle}>{en}</p>
        <p className={zhStyle}>{zh}</p>
      </span>
    </li>
  );
};

// 使用 React.memo 进行性能优化，避免不必要的重渲染
export default React.memo(BilingualCueItem); 