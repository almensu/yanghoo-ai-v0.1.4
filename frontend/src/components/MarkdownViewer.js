import React, { useEffect, useState, useCallback } from "react";
import MarkdownWithTimestamps from "./MarkdownWithTimestamps";
import { estimateTokenCount, formatTokenCount, getTokenCountColorClass } from "../utils/tokenUtils";
import { timeToSeconds } from "../utils/timestampUtils";
import "./markdown.css"; // 保留自定义 markdown 样式

// Props:
// - markdownContent: A string containing the Markdown text to render.
// - videoRef: A ref to the video element.
// - className: Optional additional CSS class.

const MarkdownViewer = ({ markdownContent, videoRef, className = '' }) => {
  // 修改：自定义时间戳点击处理函数，调用VideoPlayer的seekToTimestamp方法
  const handleTimestampClick = useCallback((timeStr) => {
    console.log(`[MD-VIEWER] 时间戳被点击: "${timeStr}" (这条消息来自MarkdownViewer组件)`);
    console.log('[MD-VIEWER] videoRef at time of click:', videoRef?.current);
    
    // 确保视频引用有效
    if (!videoRef?.current) {
      console.warn("[MD-VIEWER] 视频引用无效，无法跳转到时间戳");
      return false;
    }
    
    try {
      // 首先检查是否存在seekToTimestamp方法 (支持YouTube和本地视频)
      if (typeof videoRef.current.seekToTimestamp === 'function') {
        console.log(`[MD-VIEWER] 使用VideoPlayer的seekToTimestamp方法跳转到: ${timeStr}`);
        const result = videoRef.current.seekToTimestamp(timeStr);
        console.log(`[MD-VIEWER] seekToTimestamp返回结果:`, result);
        return result;
      }
      
      // 兼容模式：检查是否存在seekTo方法 (YouTube API)
      if (typeof videoRef.current.seekTo === 'function') {
        console.log('[MD-VIEWER] 使用YouTube API的seekTo方法');
        const timeInSeconds = timeToSeconds(timeStr);
        videoRef.current.seekTo(timeInSeconds, true);
        return true;
      }
      
      // 兼容模式：HTML5 video的currentTime属性
      if (typeof videoRef.current.currentTime !== 'undefined') {
        console.log('[MD-VIEWER] 使用HTML5 video的currentTime属性');
        const timeInSeconds = timeToSeconds(timeStr);
        videoRef.current.currentTime = timeInSeconds;
        return true;
      }
      
      console.warn('[MD-VIEWER] 无法找到合适的视频控制方法');
      return false;
      
    } catch (error) {
      console.error('[MD-VIEWER] 时间戳跳转时发生错误:', error);
      return false;
    }
  }, [videoRef]);

  if (!markdownContent) {
    return (
      <div className="text-gray-500 italic flex items-center justify-center flex-grow p-4 bg-base-100 rounded-lg shadow">
        暂无内容显示或加载。
      </div>
    );
  }

  return (
    <div className={`markdown-viewer overflow-auto ${className}`}>
      {/* 使用 MarkdownWithTimestamps 替换原来的 ReactMarkdown */}
      <MarkdownWithTimestamps
        markdownContent={markdownContent}
        videoRef={videoRef}
        className="markdown-body"
        timestampClassName="inline-flex items-center px-1.5 py-0.5 my-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold"
        onTimestampClick={handleTimestampClick}
      />
    </div>
  );
};

export default MarkdownViewer;
