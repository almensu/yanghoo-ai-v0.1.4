import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MarkdownWithTimestamps from './MarkdownWithTimestamps';

/**
 * 时间戳格式测试组件
 * 用于测试不同格式的时间戳如何与视频播放器互动
 * 
 * Props:
 * - videoRef: 视频元素的 React ref
 * - apiBaseUrl: API 基础 URL
 * - testFileUuid: 测试文件的 UUID (可选，默认为测试文件 UUID)
 * - testFileName: 测试文件名 (可选，默认为 test_timestamp_formats.md)
 * - className: 组件容器类名 (可选)
 */
const TimestampFormatTest = ({ 
  videoRef, 
  apiBaseUrl,
  testFileUuid = 'f4f02537-a244-4627-bfbf-87cb78390042',
  testFileName = 'test_timestamp_formats.md',
  className = ''
}) => {
  const [testContent, setTestContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastClickedFormat, setLastClickedFormat] = useState(null);

  // 自定义时间戳点击处理函数，用于跟踪点击了哪种格式
  const handleTimestampClick = (timeStr) => {
    console.log(`[TimestampTest] Clicked timestamp: ${timeStr}`);
    setLastClickedFormat(timeStr);
    
    if (!videoRef?.current) {
      console.warn("[TimestampTest] Video reference is not available");
      return;
    }
    
    try {
      // 转换时间字符串为秒数
      const parts = timeStr.split(':');
      let hours = 0, minutes = 0, seconds = 0;
      
      if (parts.length === 3) {
        // HH:MM:SS or HH:MM:SS.mmm 格式
        [hours, minutes, seconds] = parts;
      } else if (parts.length === 2) {
        // MM:SS or MM:SS.mmm 格式
        [minutes, seconds] = parts;
      } else if (parts.length === 1) {
        // 只有秒数，可能包含毫秒
        seconds = parts[0];
      }
      
      // 处理毫秒部分
      let milliseconds = 0;
      if (String(seconds).includes('.')) {
        const secParts = String(seconds).split('.');
        seconds = secParts[0];
        milliseconds = secParts[1] || 0;
        milliseconds = Number(`0.${milliseconds}`);
      }
      
      const timeInSeconds = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + milliseconds;
      console.log(`[TimestampTest] Seeking to ${timeInSeconds} seconds`);
      
      videoRef.current.currentTime = timeInSeconds;
      
      if (videoRef.current.paused) {
        videoRef.current.play()
          .then(() => console.log('[TimestampTest] Video playback started'))
          .catch(err => console.error("[TimestampTest] Error starting playback:", err));
      }
    } catch (error) {
      console.error("[TimestampTest] Error processing timestamp click:", error);
    }
  };

  // 组件挂载时获取测试内容
  useEffect(() => {
    const fetchTestContent = async () => {
      try {
        setIsLoading(true);
        // 使用 apiBaseUrl
        if (!apiBaseUrl) {
          throw new Error("API Base URL is not available");
        }
        
        // 使用正确的端点结构获取测试内容
        const response = await axios.get(`${apiBaseUrl}/api/tasks/${testFileUuid}/files/${testFileName}`, { 
          responseType: 'text'
        });
        setTestContent(response.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching test content:", err);
        setError(`Failed to load test content: ${err.message}`);
        // 如果获取失败，使用硬编码的测试内容作为备用
        setTestContent(`# Timestamp Format Test

这个文件用于测试不同格式的时间戳如何与视频播放器互动。

## VTT格式时间戳 (00:00:01.919)

在VTT文件中，时间戳格式包含毫秒：\`00:00:01.919\`

## Markdown格式时间戳 (00:22:45)

在Markdown中，时间戳格式通常没有毫秒：\`00:22:45\`

## 测试各种格式

### 标准格式 (无转义)

1. [00:00:00] - 视频开始：Did you know that ambush predators tend
2. [00:01:00] - 一分钟标记：This would be where the film will be or the receptors
3. [00:03:00] - 三分钟标记：mystery what exactly they're using that eye for

### 转义格式

1. \\[00:00:20\\] - 转义格式：light onto the retina and forms an image
2. \\[00:01:30\\] - 转义格式：Octopus have chambered eye type and in
3. \\[00:02:45\\] - 转义格式：Mantis shrimp one of the most bizarre animals

### 括号格式

1. (00:00:10) - 括号格式：Behind which we have the optical system
2. (00:00:40) - 括号格式：they do have a centralized nervous system
3. (00:02:00) - 括号格式：and they're super fast

### 短格式 (分:秒)

1. [02:30] - 短格式没有小时：Splitting the job into different parts
2. [04:15] - 短格式：acuity and give you lots of detailed information

### 毫秒格式

1. [00:00:01.919] - 带毫秒：Did you know that ambush predators tend
2. [00:03:30.500] - 带毫秒：directly onto the retina`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestContent();
  }, [apiBaseUrl, testFileUuid, testFileName]);

  if (isLoading) {
    return <div className="p-3 bg-base-200 rounded text-sm text-center">加载测试内容中...</div>;
  }

  if (error) {
    return <div className="p-3 bg-error/20 rounded text-sm text-error">{error}</div>;
  }

  return (
    <div className={`timestamp-test p-4 bg-white rounded shadow ${className}`}>
      <h3 className="text-lg font-semibold mb-2">时间戳格式测试</h3>
      {lastClickedFormat && (
        <div className="mb-3 p-2 bg-blue-100 rounded text-sm">
          <p>最近点击的时间戳: <code className="font-bold">{lastClickedFormat}</code></p>
        </div>
      )}
      <MarkdownWithTimestamps
        markdownContent={testContent}
        videoRef={videoRef}
        className="text-sm custom-scrollbar max-h-[500px] overflow-y-auto"
        onTimestampClick={handleTimestampClick}
      />
      <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
        <p>点击上面的时间戳测试不同格式与视频播放器的交互。</p>
        <p>推荐时间戳格式: <code className="bg-gray-100 p-1 rounded">[HH:MM:SS.mmm]</code> 例如 <code>[00:00:01.919]</code></p>
      </div>
    </div>
  );
};

export default TimestampFormatTest; 