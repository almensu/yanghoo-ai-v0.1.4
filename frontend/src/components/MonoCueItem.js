import React from 'react';
import { formatTime } from '../utils/formatTime';

// 单语字幕项组件
// Props:
// - cue: 字幕对象 { startTime, text }
// - isActive: 是否为当前活动字幕 (boolean)
// - onClick: 点击处理函数 (function)，接收 startTime 作为参数
const MonoCueItem = ({ cue, isActive, onClick }) => {
  return (
    <li 
      className={`px-3 py-2 rounded cursor-pointer flex items-start ${ 
        isActive ? 'bg-base-300 font-medium' : 'hover:bg-base-300'
      }`}
      onClick={() => onClick(cue.startTime)} // 调用传入的 onClick 处理函数
    >
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