import React, { useEffect, useState, useCallback, useMemo } from 'react';
import './markdown.css'; // 保留自定义 markdown 样式

/**
 * 带时间戳处理功能的Markdown查看器
 * 
 * Props:
 * - markdownContent: Markdown内容字符串
 * - videoRef: 指向视频元素的引用
 * - className: 可选的额外CSS类名
 * - timestampClassName: 时间戳按钮的自定义类名
 * - onTimestampClick: 可选的自定义时间戳点击处理函数
 */
const MarkdownWithTimestamps = ({ 
  markdownContent, 
  videoRef, 
  className = '',
  timestampClassName = '',
  onTimestampClick
}) => {
  // 视频引用状态
  const [isVideoAvailable, setIsVideoAvailable] = useState(false);
  
  // 定期检查视频引用
  useEffect(() => {
    const checkVideoRef = () => {
      const isAvailable = Boolean(videoRef?.current);
      setIsVideoAvailable(isAvailable);
      return isAvailable;
    };
    
    // 初始检查
    const isAvailable = checkVideoRef();
    console.log(`[MarkdownWithTimestamps] 视频引用检查: ${isAvailable ? '可用' : '不可用'}`);
    console.log(`[MarkdownWithTimestamps] 自定义点击处理函数: ${onTimestampClick ? '已提供' : '未提供'}`);
    
    // 设置定期检查(每2秒)
    const interval = setInterval(checkVideoRef, 2000);
    return () => clearInterval(interval);
  }, [videoRef, onTimestampClick]);

  // 时间戳转换为秒数
  const timeToSeconds = (timeStr) => {
    try {
      if (!timeStr) return 0;
      
      // 处理不同的时间戳格式
      const parts = timeStr.split(':');
      let hours = 0, minutes = 0, seconds = 0;
      
      if (parts.length === 3) {
        // HH:MM:SS 或 HH:MM:SS.mmm 格式
        [hours, minutes, seconds] = parts;
      } else if (parts.length === 2) {
        // MM:SS 或 MM:SS.mmm 格式
        [minutes, seconds] = parts;
      } else if (parts.length === 1) {
        // 仅秒数，可能带毫秒
        seconds = parts[0];
      }
      
      // 处理可能的毫秒部分
      let milliseconds = 0;
      if (String(seconds).includes('.')) {
        const secParts = String(seconds).split('.');
        seconds = secParts[0];
        milliseconds = secParts[1] || 0;
        milliseconds = Number(`0.${milliseconds}`);
      }
      
      return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + milliseconds;
    } catch (error) {
      console.error("[MarkdownWithTimestamps] 时间戳转换错误:", error);
      return 0;
    }
  };

  // 默认的时间戳点击处理函数
  const defaultHandleTimestampClick = useCallback((timeStr) => {
    console.log(`[MarkdownWithTimestamps] 默认处理时间戳点击: ${timeStr}`);
    if (!videoRef?.current) {
      console.warn("[MarkdownWithTimestamps] 视频引用无效，无法跳转到时间戳");
      return;
    }
    
    try {
      const seconds = timeToSeconds(timeStr);
      console.log(`[MarkdownWithTimestamps] 跳转到时间点: ${timeStr} (${seconds}秒)`);
      
      videoRef.current.currentTime = seconds;
      console.log(`[DEBUG] 已设置视频当前时间为 ${seconds} 秒`);
      
      // 点击的按钮添加视觉反馈
      const buttons = document.querySelectorAll('.timestamp-btn');
      buttons.forEach(button => {
        if (button.dataset.time === timeStr) {
          button.classList.add('bg-blue-300');
          setTimeout(() => button.classList.remove('bg-blue-300'), 1000);
        }
      });
      
      // 可选地开始播放
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => console.log('[MarkdownWithTimestamps] 开始播放'))
          .catch(err => console.error("[MarkdownWithTimestamps] 自动播放失败:", err));
      }
    } catch (error) {
      console.error("[MarkdownWithTimestamps] 处理时间戳点击时出错:", error);
    }
  }, [videoRef, timeToSeconds]);
  
  // 使用提供的自定义处理函数或默认处理函数
  const handleTimestampClick = useCallback((timeStr) => {
    console.log(`[MarkdownWithTimestamps] 处理时间戳点击: ${timeStr}`);
    console.log(`[MarkdownWithTimestamps] 将使用${onTimestampClick ? '自定义' : '默认'}处理函数`);
    
    if (onTimestampClick) {
      console.log('[MarkdownWithTimestamps] 调用自定义点击处理函数');
      onTimestampClick(timeStr, videoRef);
    } else {
      console.log('[MarkdownWithTimestamps] 调用默认点击处理函数');
      defaultHandleTimestampClick(timeStr);
    }
  }, [onTimestampClick, defaultHandleTimestampClick, videoRef]);

  // 预处理Markdown内容，将时间戳转换为HTML按钮
  const processedContent = useMemo(() => {
    console.log('[MarkdownWithTimestamps] Received markdownContent:', markdownContent);
    if (!markdownContent) return '';
    
    const inlineStyle = `
      display: inline-flex; 
      align-items: center; 
      padding: 2px 6px; 
      margin: 2px; 
      border-radius: 4px; 
      background-color: #dbeafe; 
      color: #1e40af; 
      font-weight: 500; 
      font-size: 0.875rem; 
      cursor: pointer;
      border: none;
      transition: all 0.2s;
    `;
    
    // Define default styling classes separately from the functional 'timestamp-btn' class
    const defaultStylingClasses = 'inline-flex items-center px-1.5 py-0.5 my-0.5 mx-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium';
    // Construct the final button class string: always include 'timestamp-btn', then add custom or default styling
    const finalButtonClass = `timestamp-btn ${timestampClassName || defaultStylingClasses}`;
    
    let processed = markdownContent;
    console.log("[DEBUG] 开始处理Markdown内容中的时间戳");
    
    // 添加对时间戳格式的全面支持

    // 0. 处理时间范围格式 (HH:MM:SS - HH:MM:SS) or [HH:MM:SS - HH:MM:SS]
    // The button will display the full range, but data-time will be the start time.
    const timeRegexPartForRange = '\\d{1,2}:\\d{2}:\\d{2}(?:\\.\\d+)?'; // HH:MM:SS or H:MM:SS, optional .ms
    const timeRangeRegex = new RegExp(`(?:\\(|\\[)(${timeRegexPartForRange})\\s*-\\s*${timeRegexPartForRange}(?:\\)|\\])`, 'g');
    processed = processed.replace(
      timeRangeRegex,
      (match, startTime) => { // startTime is the first captured group (the start HH:MM:SS)
        console.log(`[DEBUG] 匹配时间范围: ${match}, 将使用开始时间: ${startTime}`);
        return `<button class="${finalButtonClass}" style="${inlineStyle}" data-time="${startTime}" type="button">⏱️ ${match}</button>`;
      }
    );
    
    // 1. 处理所有格式的HH:MM:SS时间戳（包括括号、中括号、带或不带毫秒）
    // 匹配 [00:00:00], [00:00:00.000], (00:00:00), (00:00:00.000)
    const fullTimeRegex = /(?:(?:\[|\()(\d{1,2}:\d{2}:\d{2}(?:\.\d+)?)(?:\]|\)))/g;
    processed = processed.replace(
      fullTimeRegex,
      (match, timeStr) => {
        console.log(`[DEBUG] 匹配完整时间戳: ${match} -> ${timeStr}`);
        return `<button class="${finalButtonClass}" style="${inlineStyle}" data-time="${timeStr}" type="button">⏱️ ${timeStr}</button>`;
      }
    );
    
    // 2. 处理短格式MM:SS时间戳（包括括号、中括号、带或不带毫秒）
    // 匹配 [MM:SS], [MM:SS.mmm], (MM:SS), (MM:SS.mmm)
    const shortTimeRegex = /(?:(?:\[|\\()(\\d{1,2}:\\d{2}(?:\\.\\d+)?)(?:\]|\\)))/g;
    processed = processed.replace(
      shortTimeRegex,
      (match, timeStr) => {
        console.log(`[DEBUG] 匹配短格式时间戳: ${match} -> ${timeStr}`);
        return `<button class="${finalButtonClass}" style="${inlineStyle}" data-time="${timeStr}" type="button">⏱️ ${timeStr}</button>`;
      }
    );
    
    // 3. 处理转义的格式
    // 匹配 \\\[00:00:00\\\], \\\[MM:SS\\\]
    const escapedTimeRegex = /\\\\\\[((?:\\d{1,2}:\\d{2}(?::\\d{2})?)(?:\\.\\d+)?)\\\\\\]/g;
    processed = processed.replace(
      escapedTimeRegex,
      (match, timeStr) => {
        console.log(`[DEBUG] 匹配转义格式时间戳: ${match} -> ${timeStr}`);
        return `<button class="${finalButtonClass}" style="${inlineStyle}" data-time="${timeStr}" type="button">⏱️ ${timeStr}</button>`;
      }
    );
    
    // 记录处理后的内容是否包含按钮
    const hasButtons = processed.includes('class="timestamp-btn"');
    console.log(`[DEBUG] 处理后的内容${hasButtons ? '包含' : '不包含'}时间戳按钮`);
    console.log('[MarkdownWithTimestamps] Generated processedContent:', processed); // Log output
    
    // 转换为HTML保留原始的Markdown格式
    // 注意：这里只使用最基本的markdown转HTML，仅为了测试
    processed = processed
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/# (.*?)$/gm, '<h1>$1</h1>')
      .replace(/## (.*?)$/gm, '<h2>$1</h2>')
      .replace(/### (.*?)$/gm, '<h3>$1</h3>');
    
    return processed;
  }, [markdownContent, timestampClassName]);

  // 处理直接点击事件
  const handleDirectClick = useCallback((e) => {
    console.log("[DEBUG] 容器点击事件被触发");
    console.log("[DEBUG] e.target:", e.target); // Log the exact click target
    const button = e.target.closest('.timestamp-btn');
    if (button) {
      console.log("[DEBUG] 直接点击处理 - 找到时间戳按钮:", button);
      e.preventDefault();
      const timeStr = button.dataset.time;
      if (timeStr) {
        console.log("[DEBUG] 直接点击处理 - 时间戳值:", timeStr);
        console.log(`[DEBUG] 将调用 ${onTimestampClick ? '自定义' : '默认'}处理函数`);
        handleTimestampClick(timeStr);
      }
    } else {
      console.log("[DEBUG] 点击事件不是来自时间戳按钮");
    }
  }, [handleTimestampClick, onTimestampClick]);

  if (!markdownContent) {
    return (
      <div className="text-gray-500 italic flex items-center justify-center p-4 bg-base-100 rounded-lg shadow">
        暂无内容显示或加载。
      </div>
    );
  }

  return (
    <div className={`markdown-timestamps-container markdown-body overflow-auto p-4 bg-base-100 rounded-lg shadow ${className}`}>
      {/* 使用直接插入 HTML 的方式渲染 */}
      <div 
        dangerouslySetInnerHTML={{ __html: processedContent }} 
        onClick={handleDirectClick}
      />
      
      {!isVideoAvailable && videoRef && (
        <div className="text-xs text-amber-600 mt-2 p-1 bg-amber-50 rounded">
          注意：视频播放器未就绪，时间戳点击可能暂时不可用
        </div>
      )}
    </div>
  );
};

export default MarkdownWithTimestamps;
