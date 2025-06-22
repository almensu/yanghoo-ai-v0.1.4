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
  // 状态跟踪视频引用是否有效
  const [isVideoRefValid, setIsVideoRefValid] = useState(false);
  
  // Calculate token count for the current content
  const tokenCount = estimateTokenCount(markdownContent || '');

  // 检查视频引用是否有效并可用的函数
  const checkVideoRef = useCallback(() => {
    if (videoRef && videoRef.current) {
      console.log('[MD-VIEWER] 视频引用检查: 有效');
      setIsVideoRefValid(true);
      return true;
    } else {
      console.log('[MD-VIEWER] 视频引用检查: 无效');
      setIsVideoRefValid(false);
      return false;
    }
  }, [videoRef]);

  // 只在 videoRef.current 变化时检查
  useEffect(() => {
    console.log('[MD-VIEWER] videoRef.current 发生变化，重新检查视频引用');
    checkVideoRef();
  }, [videoRef, checkVideoRef, videoRef?.current]);

  // 组件加载时检查视频引用
  useEffect(() => {
    console.log("[MD-VIEWER] 组件重新渲染，videoRef:", videoRef ? "存在" : "缺失");
    checkVideoRef();
  }, [videoRef, markdownContent, checkVideoRef]);

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
      // 检查是否videoRef.current有video子属性且有seekToTimestamp方法
      else if (videoRef.current.video && typeof videoRef.current.video.seekToTimestamp === 'function') {
        console.log(`[MD-VIEWER] 使用video.seekToTimestamp跳转到: ${timeStr}`);
        const result = videoRef.current.video.seekToTimestamp(timeStr);
        console.log(`[MD-VIEWER] video.seekToTimestamp返回结果:`, result);
        return result;
      }
      // 回退到直接操作HTML video元素 (兼容旧代码)
      else if (videoRef.current instanceof HTMLVideoElement) {
        console.log(`[MD-VIEWER] 回退到直接操作video元素: ${timeStr}`);
        const timeInSeconds = timeToSeconds(timeStr);
        console.log(`[MD-VIEWER] 正在将视频跳转到: ${timeStr} (${timeInSeconds}秒)`);
        
        videoRef.current.currentTime = timeInSeconds;
        console.log(`[MD-VIEWER] 已设置视频时间为 ${timeInSeconds} 秒`);
        
        // 点击时间戳后尝试播放视频
        if (videoRef.current.paused) {
          videoRef.current.play()
            .then(() => console.log('[MD-VIEWER] 时间戳点击后视频开始播放'))
            .catch(err => console.error("[MD-VIEWER] 无法自动播放视频:", err));
        } else {
          console.log('[MD-VIEWER] 视频已经在播放中，不需要重新开始播放');
        }
        return true;
      }
      // 如果是包装后的video引用，尝试访问其video属性
      else if (videoRef.current.video && videoRef.current.video instanceof HTMLVideoElement) {
        console.log(`[MD-VIEWER] 回退到操作包装的video元素: ${timeStr}`);
        const timeInSeconds = timeToSeconds(timeStr);
        console.log(`[MD-VIEWER] 正在将包装的视频跳转到: ${timeStr} (${timeInSeconds}秒)`);
        
        videoRef.current.video.currentTime = timeInSeconds;
        console.log(`[MD-VIEWER] 已设置包装的视频时间为 ${timeInSeconds} 秒`);
        
        if (videoRef.current.video.paused) {
          videoRef.current.video.play()
            .then(() => console.log('[MD-VIEWER] 包装的视频开始播放'))
            .catch(err => console.error("[MD-VIEWER] 无法自动播放包装的视频:", err));
        }
        return true;
      }
      else {
        console.error("[MD-VIEWER] 无法识别的视频引用格式，无法跳转");
        console.error("  videoRef.current:", videoRef.current);
        console.error("  typeof videoRef.current:", typeof videoRef.current);
        console.error("  videoRef.current.seekToTimestamp:", videoRef.current?.seekToTimestamp);
        console.error("  videoRef.current.video:", videoRef.current?.video);
        return false;
      }
    } catch (error) {
      console.error("[MD-VIEWER] 处理时间戳点击时出错:", error);
      return false;
    }
  }, [videoRef]);

  // 添加特殊调试函数，用于页面加载后验证组件功能
  useEffect(() => {
    console.log('[MD-VIEWER] MarkdownViewer组件已挂载，内容长度:', markdownContent?.length || 0);
    
    // 检查内容中是否包含时间戳格式
    if (markdownContent) {
      const timestampRegex = /(\[|\()(\d{1,2}:\d{2}(:\d{2})?(\.\d+)?)(\]|\))/g;
      const matches = markdownContent.match(timestampRegex);
      console.log(`[MD-VIEWER] 内容中找到 ${matches?.length || 0} 个可能的时间戳`);
    }
    
    // 确认回调函数是否正确绑定
    console.log('[MD-VIEWER] 时间戳点击处理函数是否有效:', typeof handleTimestampClick === 'function');
    
    return () => {
      console.log('[MD-VIEWER] MarkdownViewer组件即将卸载');
    };
  }, [markdownContent, handleTimestampClick]);

  if (!markdownContent) {
    return (
      <div className="text-gray-500 italic flex items-center justify-center flex-grow p-4 bg-base-100 rounded-lg shadow">
        暂无内容显示或加载。
      </div>
    );
  }

  console.log('[MD-VIEWER] 渲染MarkdownViewer组件，传递onTimestampClick处理函数');
  
  return (
    <div className={`markdown-viewer overflow-auto ${className}`}>
      {/* Token count display */}
      {tokenCount > 0 && (
        <div className="flex items-center justify-between mb-2 p-2 bg-gray-50 rounded-lg text-sm">
          <span className="text-gray-600">当前文档 Token 数量:</span>
          <span className={`font-medium px-2 py-1 rounded-full bg-white ${getTokenCountColorClass(tokenCount)}`}>
            {formatTokenCount(tokenCount)} tokens
          </span>
        </div>
      )}
      
      {/* 使用 MarkdownWithTimestamps 替换原来的 ReactMarkdown */}
      <MarkdownWithTimestamps
        markdownContent={markdownContent}
        videoRef={videoRef}
        className="markdown-body flex-grow p-4 bg-base-100 rounded-lg shadow"
        timestampClassName="inline-flex items-center px-1.5 py-0.5 my-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold"
        onTimestampClick={handleTimestampClick}
      />
      
      {!isVideoRefValid && (
        <div className="text-xs text-amber-600 mt-2 p-1 bg-amber-50 rounded">
          注意：视频播放器未就绪，时间戳点击可能暂时不可用
        </div>
      )}
      
      {/* 测试区域 - 用于直接验证时间戳点击功能 */}
      <div className="mt-4 p-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 mb-1">时间戳点击测试区域：</div>
        <button 
          onClick={() => handleTimestampClick("00:00:10")}
          className="px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded"
        >
          测试点击 [00:00:10]
        </button>
        <span className="text-xs text-gray-500 ml-2">
          (点击此测试按钮应该使视频跳转到10秒位置)
        </span>
      </div>
    </div>
  );
};

export default MarkdownViewer;
