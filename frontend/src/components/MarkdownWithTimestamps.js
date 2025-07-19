import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import './markdown.css'; // 保留自定义 markdown 样式
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import { normalizeTimestamp, timeToSeconds } from '../utils/timestampUtils';

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
  // 添加点击历史记录状态，用于显示最近点击的时间戳
  const [lastClickedTimestamp, setLastClickedTimestamp] = useState(null);
  // 容器引用
  const containerRef = useRef(null);
  // 用ref保存handleTimestampClick的最新引用，避免闭包问题
  const handleTimestampClickRef = useRef(null);
  // 独立的ref存储占位符映射
  const placeholderMapRef = useRef(new Map());
  
  // 定期检查视频引用
  useEffect(() => {
    const checkVideoRef = () => {
      const isAvailable = Boolean(videoRef?.current);
      if (isAvailable !== isVideoAvailable) {
        setIsVideoAvailable(isAvailable);
        console.log(`[MarkdownWithTimestamps] 视频引用状态变更: ${isAvailable ? '可用' : '不可用'}`);
      }
      return isAvailable;
    };
    
    // 初始检查
    const isAvailable = checkVideoRef();
    console.log(`[MarkdownWithTimestamps] 视频引用检查: ${isAvailable ? '可用' : '不可用'}`);
    console.log(`[MarkdownWithTimestamps] 自定义点击处理函数: ${onTimestampClick ? '已提供' : '未提供'}`);
    
    // 设置定期检查(每2秒)
    const interval = setInterval(checkVideoRef, 2000);
    return () => clearInterval(interval);
  }, [videoRef, onTimestampClick, isVideoAvailable]);

  // 默认的时间戳点击处理函数
  const defaultHandleTimestampClick = useCallback((timeStr) => {
    console.log(`[MarkdownWithTimestamps] 默认处理时间戳点击: ${timeStr}`);
    console.log(`[MarkdownWithTimestamps] videoRef:`, videoRef);
    console.log(`[MarkdownWithTimestamps] videoRef.current:`, videoRef?.current);
    
    if (!videoRef?.current) {
      console.warn("[MarkdownWithTimestamps] 视频引用无效，无法跳转到时间戳");
      return false;
    }
    
    try {
      // 首先检查是否存在seekToTimestamp方法 (支持YouTube和本地视频)
      if (typeof videoRef.current.seekToTimestamp === 'function') {
        // 使用新的seekToTimestamp方法处理本地和YouTube视频的时间戳跳转
        console.log(`[MarkdownWithTimestamps] 使用seekToTimestamp跳转到: ${timeStr}`);
        
        // 标准化时间戳格式
        console.log(`[MarkdownWithTimestamps] 原始时间戳 (标准化前): "${timeStr}"`);
        const normalizedTimestamp = normalizeTimestamp(timeStr);
        console.log(`[MarkdownWithTimestamps] 时间戳已标准化: "${timeStr}" -> "${normalizedTimestamp}"`);
        
        // 调用VideoPlayer的seekToTimestamp方法
        const result = videoRef.current.seekToTimestamp(normalizedTimestamp);
        console.log(`[MarkdownWithTimestamps] seekToTimestamp返回结果:`, result);
        
        // 记录最近点击的时间戳
        setLastClickedTimestamp(timeStr);
        return true;
      } else if (videoRef.current.video && typeof videoRef.current.video.seekToTimestamp === 'function') {
        // 检查是否videoRef.current有video子属性且有seekToTimestamp方法
        console.log(`[MarkdownWithTimestamps] 使用video.seekToTimestamp跳转到: ${timeStr}`);
        
        const normalizedTimestamp = normalizeTimestamp(timeStr);
        const result = videoRef.current.video.seekToTimestamp(normalizedTimestamp);
        console.log(`[MarkdownWithTimestamps] video.seekToTimestamp返回结果:`, result);
        console.log(`[MarkdownWithTimestamps] 时间戳已标准化: ${timeStr} -> ${normalizedTimestamp}`);
        
        setLastClickedTimestamp(timeStr);
        return true;
      } else if (videoRef.current.video && videoRef.current.video instanceof HTMLVideoElement) {
        // 回退到直接操作video元素
        console.log(`[MarkdownWithTimestamps] 回退到直接操作video元素: ${timeStr}`);
        
        const seconds = timeToSeconds(timeStr);
        console.log(`[MarkdownWithTimestamps] 回退方法: 跳转到时间点: ${timeStr} (${seconds}秒)`);
        
        videoRef.current.video.currentTime = seconds;
        console.log(`[MarkdownWithTimestamps] 已设置video.currentTime为 ${seconds} 秒`);
        
        // 尝试播放
        if (videoRef.current.video.paused) {
          videoRef.current.video.play()
            .then(() => console.log('[MarkdownWithTimestamps] 视频已开始播放'))
            .catch(err => console.error("[MarkdownWithTimestamps] 自动播放失败:", err));
        }
        
        setLastClickedTimestamp(timeStr);
        return true;
      } else if (videoRef.current instanceof HTMLVideoElement) {
        // 直接使用video元素的情况
        const seconds = timeToSeconds(timeStr);
        console.log(`[MarkdownWithTimestamps] 使用直接video引用: ${timeStr} (${seconds}秒)`);
        
        videoRef.current.currentTime = seconds;
        console.log(`[MarkdownWithTimestamps] 已设置视频当前时间为 ${seconds} 秒`);
        
        // 可选地开始播放
        if (videoRef.current.paused) {
          videoRef.current.play()
            .then(() => console.log('[MarkdownWithTimestamps] 开始播放'))
            .catch(err => console.error("[MarkdownWithTimestamps] 自动播放失败:", err));
        }
        
        setLastClickedTimestamp(timeStr);
        return true;
      } else {
        // 找不到合适的视频控制方法 - 添加更详细的调试信息
        console.error("[MarkdownWithTimestamps] 无法识别的视频引用格式:");
        console.error("  videoRef.current:", videoRef.current);
        console.error("  typeof videoRef.current:", typeof videoRef.current);
        console.error("  videoRef.current.seekToTimestamp:", videoRef.current?.seekToTimestamp);
        console.error("  videoRef.current.video:", videoRef.current?.video);
        
        // 尝试强制调用seekToTimestamp，即使类型检查失败
        if (videoRef.current && videoRef.current.seekToTimestamp) {
          console.log("[MarkdownWithTimestamps] 强制尝试调用seekToTimestamp");
          try {
            const normalizedTimestamp = normalizeTimestamp(timeStr);
            videoRef.current.seekToTimestamp(normalizedTimestamp);
            setLastClickedTimestamp(timeStr);
            return true;
          } catch (forceError) {
            console.error("[MarkdownWithTimestamps] 强制调用也失败:", forceError);
          }
        }
        
        return false;
      }
    } catch (error) {
      console.error("[MarkdownWithTimestamps] 处理时间戳点击时出错:", error);
      console.error("  错误堆栈:", error.stack);
      return false;
    }
  }, [videoRef]);
  
  // 使用提供的自定义处理函数或默认处理函数
  const handleTimestampClick = useCallback((timeStr) => {
    console.log(`[MarkdownWithTimestamps] 处理时间戳点击: ${timeStr}`);
    console.log(`[MarkdownWithTimestamps] 将使用${onTimestampClick ? '自定义' : '默认'}处理函数`);
    
    // 执行时间戳处理逻辑
    let success = false;
    if (onTimestampClick) {
      console.log('[MarkdownWithTimestamps] 调用自定义点击处理函数');
      success = onTimestampClick(timeStr, videoRef);
    } else {
      console.log('[MarkdownWithTimestamps] 调用默认点击处理函数');
      success = defaultHandleTimestampClick(timeStr);
    }
    
    // 记录结果
    console.log(`[MarkdownWithTimestamps] 时间戳点击处理结果: ${success ? '成功' : '失败'}`);
    return success;
  }, [onTimestampClick, defaultHandleTimestampClick, videoRef]);

  // 更新ref中的函数引用
  useEffect(() => {
    handleTimestampClickRef.current = handleTimestampClick;
  }, [handleTimestampClick]);

  // 预处理Markdown内容，将时间戳转换为占位符
  const processedContent = useMemo(() => {
    console.log('[MarkdownWithTimestamps] Received markdownContent:', markdownContent);
    if (!markdownContent) return '';
    
    let processed = markdownContent;
    console.log("[DEBUG] 开始处理Markdown内容中的时间戳");
    
    // 简化的时间戳匹配策略 - 使用更安全的占位符格式
    // 定义常用时间戳格式，按优先级排序
    const timestampPatterns = [
      // 1. 完整时间戳格式 HH:MM:SS
      {
        name: '完整时间戳-方括号',
        regex: /\[(\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?)\]/g,
        handler: (match, time) => ({ time, display: match })
      },
      {
        name: '完整时间戳-圆括号',
        regex: /\((\d{1,2}:\d{1,2}:\d{1,2}(?:\.\d+)?)\)/g,
        handler: (match, time) => ({ time, display: match })
      },
      
      // 2. 短格式时间戳 MM:SS
      {
        name: '短格式时间戳-方括号',
        regex: /\[(\d{1,2}:\d{1,2}(?:\.\d+)?)\]/g,
        handler: (match, time) => ({ time, display: match })
      },
      {
        name: '短格式时间戳-圆括号',
        regex: /\((\d{1,2}:\d{1,2}(?:\.\d+)?)\)/g,
        handler: (match, time) => ({ time, display: match })
      }
    ];
    
    // 为每个匹配生成唯一ID，避免占位符冲突
    let placeholderCounter = 0;
    const placeholderMap = new Map();
    
    // 按顺序应用所有模式
    timestampPatterns.forEach(pattern => {
      processed = processed.replace(pattern.regex, (...args) => {
        const match = args[0];
        const result = pattern.handler(...args);
        const placeholderId = `TIMESTAMP_${placeholderCounter++}`;
        
        // 存储占位符信息
        placeholderMap.set(placeholderId, {
          time: result.time,
          display: result.display,
          original: match
        });
        
        console.log(`[DEBUG] 匹配${pattern.name}: ${match} -> time="${result.time}", display="${result.display}", id="${placeholderId}"`);
        return `{{${placeholderId}}}`;
      });
    });
    
    console.log('[MarkdownWithTimestamps] Generated processedContent:', processed);
    console.log('[MarkdownWithTimestamps] PlaceholderMap:', placeholderMap);
    
    // 将占位符映射存储到独立的ref中
    placeholderMapRef.current = placeholderMap;
    
    return processed;
  }, [markdownContent]);

  // 在markdown渲染后，将占位符替换为实际的按钮
  useEffect(() => {
    if (!containerRef.current) return;
    
    const defaultStylingClasses = 'inline-flex items-center px-1.5 py-0.5 my-0.5 mx-0.5 rounded bg-blue-100 text-blue-800 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-medium cursor-pointer';
    const finalButtonClass = `timestamp-btn ${timestampClassName || defaultStylingClasses}`;
    
    // 获取占位符映射
    const placeholderMap = placeholderMapRef.current;
    if (!placeholderMap || placeholderMap.size === 0) {
      console.log('[DEBUG] 没有找到占位符映射或映射为空，跳过替换');
      return;
    }
    
    // 查找所有的时间戳占位符并替换
    const walker = document.createTreeWalker(
      containerRef.current,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );
    
    const textNodes = [];
    let node;
    while (node = walker.nextNode()) {
      if (node.textContent.includes('{{TIMESTAMP_')) {
        textNodes.push(node);
      }
    }
    
    textNodes.forEach(textNode => {
      const text = textNode.textContent;
      const regex = /\{\{(TIMESTAMP_\d+)\}\}/g;
      
      if (regex.test(text)) {
        const parent = textNode.parentNode;
        const newHTML = text.replace(
          /\{\{(TIMESTAMP_\d+)\}\}/g,
          (match, placeholderId) => {
            const placeholderData = placeholderMap.get(placeholderId);
            if (!placeholderData) {
              console.error(`[DEBUG] 无法找到占位符数据: "${placeholderId}"`);
              return match; // 返回原始内容
            }
            
            const { time, display } = placeholderData;
            console.log(`[DEBUG] 生成时间戳按钮: time="${time}", display="${display}", id="${placeholderId}"`);
            return `<button class="${finalButtonClass}" data-time="${time}" type="button">⏱️ ${display}</button>`;
          }
        );
        
        const wrapper = document.createElement('span');
        wrapper.innerHTML = newHTML;
        
        // 替换文本节点
        parent.replaceChild(wrapper, textNode);
      }
    });
    
    // 添加点击事件监听器
    const handleClick = (e) => {
      console.log("[DEBUG] 时间戳按钮点击事件被触发");
      console.log("[DEBUG] 事件目标:", e.target);
      console.log("[DEBUG] 事件目标类名:", e.target.className);
      
      // 查找时间戳按钮 - 使用更宽松的选择器
      const button = e.target.closest('.timestamp-btn') || e.target.closest('button[data-time]');
      
      if (button) {
        console.log("[DEBUG] 找到时间戳按钮:", button);
        console.log("[DEBUG] 按钮data-time属性:", button.dataset.time);
        
        e.preventDefault();
        e.stopPropagation();
        
        const timeStr = button.dataset.time;
        if (timeStr) {
          console.log("[DEBUG] 从按钮获取的原始时间戳值:", timeStr);
          console.log("[DEBUG] 按钮的完整HTML:", button.outerHTML);
          console.log("[DEBUG] handleTimestampClickRef.current:", handleTimestampClickRef.current);
          
          // 使用ref中的最新函数引用，避免闭包问题
          if (handleTimestampClickRef.current) {
            const result = handleTimestampClickRef.current(timeStr);
            console.log("[DEBUG] 时间戳点击处理结果:", result);
          } else {
            console.error("[DEBUG] handleTimestampClickRef.current 为空");
            // 备用处理 - 直接调用handleTimestampClick
            if (typeof handleTimestampClick === 'function') {
              console.log("[DEBUG] 使用备用方法调用handleTimestampClick");
              const result = handleTimestampClick(timeStr);
              console.log("[DEBUG] 备用方法处理结果:", result);
            }
          }
        } else {
          console.error("[DEBUG] 按钮没有data-time属性");
        }
      } else {
        console.log("[DEBUG] 未找到时间戳按钮，点击的是:", e.target);
        console.log("[DEBUG] 检查是否是按钮内的子元素...");
        
        // 检查是否点击了按钮内的子元素（如图标）
        const parentButton = e.target.parentElement;
        if (parentButton && (parentButton.classList.contains('timestamp-btn') || parentButton.hasAttribute('data-time'))) {
          console.log("[DEBUG] 找到父级时间戳按钮:", parentButton);
          e.preventDefault();
          e.stopPropagation();
          
          const timeStr = parentButton.dataset.time;
          if (timeStr && handleTimestampClickRef.current) {
            console.log("[DEBUG] 通过父级按钮处理时间戳:", timeStr);
            const result = handleTimestampClickRef.current(timeStr);
            console.log("[DEBUG] 父级按钮处理结果:", result);
          }
        }
      }
    };
    
    containerRef.current.addEventListener('click', handleClick);
    
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('click', handleClick);
      }
    };
  }, [processedContent, timestampClassName, placeholderMapRef.current]);

  if (!markdownContent) {
    return (
      <div className="text-gray-500 italic flex items-center justify-center p-4 bg-base-100 rounded-lg shadow">
        暂无内容显示或加载。
      </div>
    );
  }

  return (
    <div className={`markdown-timestamps-container markdown-body overflow-auto ${className}`} ref={containerRef}>
      {/* 使用 ReactMarkdown 正确渲染包括表格在内的所有 markdown 内容 */}
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          table: ({ node, ...props }) => (
            <table className="border-collapse w-full my-4" {...props} />
          ),
          th: ({ node, ...props }) => (
            <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left" {...props} />
          ),
          td: ({ node, ...props }) => (
            <td className="border border-gray-300 px-4 py-2" {...props} />
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownWithTimestamps;