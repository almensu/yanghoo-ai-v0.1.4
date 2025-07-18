import React, { useEffect, forwardRef, useRef, useImperativeHandle, useState, useCallback } from 'react';
import axios from 'axios';
import { timeToSeconds } from '../utils/timestampUtils';

// Custom CSS for subtitles - Updated to position subtitles at the red rectangle area with more specific selectors
const subtitleStyles = `
  video::cue,
  ::cue {
    background-color: rgba(0, 0, 0, 0.6);
    color: white;
    padding: 4px 8px;
    border-radius: 2px;
    font-size: 16px;
    font-family: "Source Han Sans CN Bold", "思源黑体 CN Bold", Arial, sans-serif !important;
    line-height: 1.5;
    bottom: 60px !important; /* Moved higher from bottom */
    display: inline-block;
    max-width: 80%;
    white-space: pre-line;
    position: relative !important;
    font-weight: bold !important; /* 字体加粗 */
    text-shadow: 1px 1px 2px black, 0 0 1em black, 0 0 0.2em black !important; /* 添加文字阴影/描边效果 */
  }
  
  /* 中文字幕显示为黄色 - 使用多种选择器确保覆盖各种情况 */
  video::cue:lang(zh),
  ::cue:lang(zh),
  video::cue:lang(zh-Hans),
  ::cue:lang(zh-Hans),
  video::cue:lang(zh-CN),
  ::cue:lang(zh-CN) {
    color: #FFEB3B !important; /* 黄色字体 */
  }
  
  /* 为双语字幕中的中文部分添加黄色（通过标识符或后代选择器） */
  video::cue[voice="中文"],
  ::cue[voice="中文"],
  video::cue[voice="Chinese"],
  ::cue[voice="Chinese"] {
    color: #FFEB3B !important; /* 黄色字体 */
  }
  
  /* 强制覆盖所有字幕容器样式 */
  ::-webkit-media-text-track-display {
    color: white !important;
    font-weight: bold !important;
    text-shadow: 1px 1px 2px black, 0 0 1em black, 0 0 0.2em black !important;
  }
  
  /* Make sure subtitles have enough room */
  .custom-subtitle-video::cue {
    /* Adjust margin if needed, but primary positioning is via 'bottom' now */
    margin-bottom: 60px !important; 
  }
  
  /* Enhancing visibility of subtitles - make stronger selector */
  video::-webkit-media-text-track-container,
  ::cue-region,
  ::-webkit-media-text-track-container {
    transform: translateY(-60px) !important; /* Increased negative translate to move container up */
    overflow: visible !important;
    bottom: 60px !important;
  }
  
  /* Ensures text tracks have enough height for bilingual content */
  video::-webkit-media-text-track-display,
  ::-webkit-media-text-track-display {
    min-height: 6em;
    padding-top: 1em;
    padding-bottom: 3em;
    position: relative !important;
    bottom: 60px !important;
  }
  
  /* Ensures text is readable */
  video::-webkit-media-text-track-display-backdrop,
  ::-webkit-media-text-track-display-backdrop {
    background: rgba(0, 0, 0, 0.5);
    border-radius: 5px;
    padding: 1em;
  }
`;

// ASS字幕渲染器组件
const AssSubtitleRenderer = ({ videoRef, assContent, isVisible }) => {
  const [currentSubtitles, setCurrentSubtitles] = useState({ chinese: null, english: null });
  const [parsedSubtitles, setParsedSubtitles] = useState([]);

  // 解析ASS内容
  useEffect(() => {
    if (!assContent) return;

    const parseAssContent = (content) => {
      const lines = content.split('\n');
      const subtitles = [];
      let inEvents = false;

      for (const line of lines) {
        if (line.trim() === '[Events]') {
          inEvents = true;
          continue;
        }
        
        if (inEvents && line.startsWith('Dialogue:')) {
          const parts = line.split(',');
          if (parts.length >= 10) {
            const startTime = parseAssTime(parts[1]);
            const endTime = parseAssTime(parts[2]);
            const style = parts[3];
            const text = parts.slice(9).join(',').replace(/\\N/g, '\n');
            
            subtitles.push({
              start: startTime,
              end: endTime,
              text: text,
              style: style
            });
          }
        }
      }
      
      return subtitles.sort((a, b) => a.start - b.start);
    };

    const parseAssTime = (timeStr) => {
      // 解析 h:mm:ss.cc 格式
      const match = timeStr.match(/(\d+):(\d+):(\d+)\.(\d+)/);
      if (match) {
        const hours = parseInt(match[1]);
        const minutes = parseInt(match[2]);
        const seconds = parseInt(match[3]);
        const centiseconds = parseInt(match[4]);
        return hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
      }
      return 0;
    };

    const parsed = parseAssContent(assContent);
    setParsedSubtitles(parsed);
  }, [assContent]);

  // 监听视频时间更新
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !parsedSubtitles.length) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      // 找到当前时间段的所有字幕（中英文可能有相同时间段）
      const currentSubs = parsedSubtitles.filter(
        sub => currentTime >= sub.start && currentTime <= sub.end
      );
      
      // 分别找到中文和英文字幕
      const chineseSub = currentSubs.find(sub => sub.style === 'Chinese');
      const englishSub = currentSubs.find(sub => sub.style === 'English');
      
      setCurrentSubtitles({
        chinese: chineseSub || null,
        english: englishSub || null
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [parsedSubtitles, videoRef]);

  // 如果没有任何字幕则不显示
  if (!isVisible || (!currentSubtitles.chinese && !currentSubtitles.english)) return null;

  console.log('AssSubtitleRenderer:', {
    chinese: currentSubtitles.chinese?.text,
    english: currentSubtitles.english?.text,
    chineseStyle: currentSubtitles.chinese?.style,
    englishStyle: currentSubtitles.english?.style,
    totalParsedSubtitles: parsedSubtitles.length,
    isVisible: isVisible
  });

  return (
    <div 
      className="absolute left-1/2 transform -translate-x-1/2 z-10 pointer-events-none"
      style={{
        bottom: '15%', // 固定在底部15%的位置
        maxWidth: '80%', // 最大宽度70%
        width: 'auto',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0px'
      }}
    >
      {/* 中文字幕 - 黄色，在上方 */}
      {currentSubtitles.chinese && (
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#FFEB3B',
            fontSize: '14px',
            fontFamily: '"Source Han Sans CN Bold", "思源黑体 CN Bold", Arial, sans-serif',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            lineHeight: '1.3',
            whiteSpace: 'pre-line',
            padding: '6px 12px',
            borderRadius: '6px',
            maxWidth: '100%',
            wordWrap: 'break-word',
            textAlign: 'center'
          }}
        >
          {currentSubtitles.chinese.text}
        </div>
      )}
      
      {/* 英文字幕 - 白色，在下方 */}
      {currentSubtitles.english && (
        <div
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#FFFFFF',
            fontSize: '14px',
            fontFamily: 'Arial, sans-serif',
            fontWeight: 'normal',
            textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
            lineHeight: '1.3',
            whiteSpace: 'pre-line',
            padding: '6px 12px',
            borderRadius: '6px',
            maxWidth: '100%',
            wordWrap: 'break-word',
            textAlign: 'center'
          }}
        >
          {currentSubtitles.english.text}
        </div>
      )}
    </div>
  );
};

// Props:
// - localVideoPath: Relative path to a video file
// - embedUrl: URL for embedding in an iframe
// - apiBaseUrl: Base URL for the backend API
// - taskUuid: The UUID of the task
// - preferLocalVideo: Boolean indicating if local video should be preferred (passed from parent)
// - title: Optional title
// - vttUrl: NEW - Blob URL for the cleaned VTT file for the native track
// - vttLang: NEW - Language code (e.g., 'en', 'zh') for the native track
// - trackKey: Optional - Key to force track update if needed
// - cues: Optional array of subtitle cues for timestamp navigation

const VideoPlayer = forwardRef(({ 
  localVideoPath, 
  embedUrl, 
  apiBaseUrl, 
  taskUuid, 
  preferLocalVideo, // Receive preference from parent
  title = 'Video Player',
  vttUrl = null,
  vttLang = null,
  trackKey = null,
  cues = null // NEW: Accept cues array for timestamp navigation
}, ref) => {
  const videoRef = useRef(null); // Ref for the <video> element itself
  const trackRef = useRef(null); // Ref to keep track of the added <track> element
  const [currentCueIndex, setCurrentCueIndex] = useState(-1); // Track current cue index
  // 添加标记来防止时间戳跳转和字幕管理逻辑冲突
  const isSeekingToTimestamp = useRef(false);
  // 添加ASS字幕相关状态
  const [assContent, setAssContent] = useState('');
  const [useAssRenderer, setUseAssRenderer] = useState(false);
  // 添加状态存储格式化后的YouTube嵌入URL
  const [formattedEmbedUrl, setFormattedEmbedUrl] = useState(null);
  const [youtubePlayer, setYoutubePlayer] = useState(null); // Store YouTube player instance
  const youtubePlayerRef = useRef(null); // 使用ref存储YouTube player实例，确保在整个组件生命周期中稳定

  // 提取YouTube视频ID的辅助函数
  const extractYouTubeVideoId = (url) => {
    if (!url) return null;
    
    try {
      // 处理/embed/ID格式
      if (url.includes('/embed/')) {
        const match = url.match(/\/embed\/([^?&#]+)/);
        if (match && match[1]) return match[1];
      }
      
      // 处理watch?v=ID格式
      if (url.includes('watch?v=')) {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v');
      }
      
      // 处理youtu.be/ID短链接
      if (url.includes('youtu.be/')) {
        const match = url.match(/youtu\.be\/([^?&#]+)/);
        if (match && match[1]) return match[1];
      }
    } catch (error) {
      console.error('Error extracting YouTube video ID:', error);
    }
    
    return null;
  };

  // 添加一个专门处理YouTube时间戳跳转的函数
  const seekYouTubeVideo = (seconds) => {
    try {
      console.log(`VideoPlayer: Seeking YouTube video to ${seconds}s`);
      
      // 1. 优先使用YT.Player API (最可靠的方法)
      if (youtubePlayerRef.current) {
        console.log(`VideoPlayer: Using stored YouTube player reference to seek to ${seconds}s`);
        youtubePlayerRef.current.seekTo(seconds, true);
        youtubePlayerRef.current.playVideo();
        return true;
      }
      
      // 2. 尝试使用全局YT API对象
      if (window.YT && window.YT.Player && document.getElementById('youtube-player-iframe')) {
        console.log(`VideoPlayer: Using global YT API to seek`);
        try {
          // 如果没有初始化过播放器，尝试创建一个新的播放器实例
          const iframe = document.getElementById('youtube-player-iframe');
          const player = new window.YT.Player('youtube-player-iframe', {
            events: {
              'onReady': (event) => {
                console.log('YouTube player ready, seeking immediately');
                event.target.seekTo(seconds, true);
                event.target.playVideo();
                // 保存player引用以便后续使用
                youtubePlayerRef.current = event.target;
              }
            }
          });
          return true;
        } catch (error) {
          console.error('Error creating YouTube player instance:', error);
        }
      }
      
      // 3. 回退到iframe src更新方法
      // 获取视频ID
      let videoId = '';
      
      // 尝试从当前iframe src获取
      const iframe = document.getElementById('youtube-player-iframe');
      if (iframe && iframe.src) {
        videoId = extractYouTubeVideoId(iframe.src);
      }
      
      // 如果上面没成功，从embedUrl尝试获取
      if (!videoId && embedUrl) {
        videoId = extractYouTubeVideoId(embedUrl);
      }
      
      if (!videoId) {
        console.error('VideoPlayer: Could not extract YouTube video ID');
        return false;
      }
      
      // 构建新的嵌入URL（添加随机参数避免缓存）
      const newSrc = `https://www.youtube.com/embed/${videoId}?start=${Math.floor(seconds)}&autoplay=1&enablejsapi=1&t=${Date.now()}`;
      console.log(`VideoPlayer: Updating YouTube iframe src to ${newSrc}`);
      
      // 强制iframe重新加载 - 最可靠的方法
      if (iframe) {
        iframe.src = newSrc;
        
        // 在iframe上添加一次性加载事件，确认加载完成
        const onLoadHandler = () => {
          console.log('VideoPlayer: YouTube iframe successfully reloaded');
          iframe.removeEventListener('load', onLoadHandler);
          
          // 尝试在iframe加载后重新初始化播放器API
          setTimeout(() => {
            if (window.YT && window.YT.Player) {
              try {
                const player = new window.YT.Player('youtube-player-iframe', {
                  events: {
                    'onReady': (event) => {
                      console.log('YouTube player ready after iframe reload');
                      youtubePlayerRef.current = event.target;
                    }
                  }
                });
              } catch (error) {
                console.error('Error initializing player after reload:', error);
              }
            }
          }, 1000);
        };
        iframe.addEventListener('load', onLoadHandler);
        
        return true;
      } else {
        console.error('VideoPlayer: No YouTube iframe found');
        return false;
      }
    } catch (error) {
      console.error('VideoPlayer: Error seeking YouTube video:', error);
      return false;
    }
  };

  // 移动 shouldShowLocal 计算到这里，确保在方法中能正确访问
  const getIsLocalVideo = () => {
    const localVideoAvailable = Boolean(localVideoPath);
    let localVideoSrc = null;
    if (localVideoAvailable && apiBaseUrl && taskUuid) {
      const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
      let filename = localVideoPath;
      if (filename.includes('/') && filename.split('/')[0].length === 36) {
        filename = filename.substring(filename.indexOf('/') + 1);
      }
      localVideoSrc = `${base}/api/tasks/${taskUuid}/files/${filename}`;
    }
    return preferLocalVideo && !!localVideoSrc;
  };

  // Allow parent component (Studio) to get the video element ref if needed (for VttPreviewer sync)
  useImperativeHandle(ref, () => ({
    // 直接暴露DOM节点引用和必要的方法
    video: videoRef.current, // 直接提供对video元素的引用，不要展开属性
    
    // 时间戳跳转功能
    seekToTimestamp: (timestamp) => {
      // 时间戳合法性检查
      if (!timestamp) {
        console.warn(`VideoPlayer: Invalid timestamp provided: ${timestamp}`);
        return false;
      }
      
      console.log(`VideoPlayer: Attempting to seek to timestamp: ${timestamp}`);
      console.log(`VideoPlayer: Timestamp type: ${typeof timestamp}, value: "${timestamp}"`);
      
      // 使用 timestampUtils 统一处理时间戳转换
      let seconds = 0;
      if (typeof timestamp === 'number') {
        // 如果已经是秒数，直接使用
        seconds = timestamp;
        console.log(`VideoPlayer: Using timestamp as number: ${seconds}s`);
      } else {
        // 使用标准化的时间戳转换函数
        seconds = timeToSeconds(timestamp);
        console.log(`VideoPlayer: Converted "${timestamp}" to ${seconds}s using timeToSeconds`);
      }
      
      // 动态计算当前是否应该使用本地视频
      const shouldShowLocal = getIsLocalVideo();
      
      console.log(`VideoPlayer: Converted timestamp ${timestamp} to ${seconds} seconds`);
      console.log(`VideoPlayer: shouldShowLocal=${shouldShowLocal}, videoRef.current=${!!videoRef.current}`);
      
      try {
        // 根据播放模式处理时间跳转
        if (shouldShowLocal && videoRef.current) {
          // 设置标记，防止字幕管理逻辑干扰
          isSeekingToTimestamp.current = true;
          
          // 本地视频模式 - 直接设置currentTime
          console.log(`VideoPlayer: Seeking local video to ${seconds}s`);
          console.log(`VideoPlayer: Video readyState: ${videoRef.current.readyState}`);
          console.log(`VideoPlayer: Video duration: ${videoRef.current.duration}`);
          console.log(`VideoPlayer: Current time before seek: ${videoRef.current.currentTime}`);
          
          // 确保视频已经准备好播放
          if (videoRef.current.readyState >= 1) { // HAVE_METADATA
            videoRef.current.currentTime = seconds;
            console.log(`VideoPlayer: Current time after seek: ${videoRef.current.currentTime}`);
            
            // 不自动播放，让调用者决定是否播放
            // if (videoRef.current.paused) {
            //   videoRef.current.play().catch(err => console.log('Auto-play prevented:', err));
            // }
            
            // 延迟清除标记，给字幕管理逻辑时间完成处理
            setTimeout(() => {
              isSeekingToTimestamp.current = false;
            }, 1000);
            
            return true;
          } else {
            // 如果视频还没准备好，等待加载完成后再跳转
            console.log('VideoPlayer: Video not ready, waiting for loadedmetadata');
            const onLoadedMetadata = () => {
              console.log('VideoPlayer: Video metadata loaded, now seeking');
              videoRef.current.currentTime = seconds;
              console.log(`VideoPlayer: Current time after delayed seek: ${videoRef.current.currentTime}`);
              // 不自动播放，让调用者决定是否播放
              // if (videoRef.current.paused) {
              //   videoRef.current.play().catch(err => console.log('Auto-play prevented:', err));
              // }
              videoRef.current.removeEventListener('loadedmetadata', onLoadedMetadata);
              
              // 延迟清除标记
              setTimeout(() => {
                isSeekingToTimestamp.current = false;
              }, 1000);
            };
            videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata);
            return true; // 返回true表示操作已启动
          }
        } else if (!shouldShowLocal) {
          // YouTube嵌入模式 - 使用优化的跳转方法
          console.log(`VideoPlayer: Attempting YouTube video seek to ${seconds}s`);
          const result = seekYouTubeVideo(seconds);
          console.log(`VideoPlayer: YouTube seek result: ${result}`);
          return result;
        } else {
          console.error(`VideoPlayer: Cannot seek - shouldShowLocal=${shouldShowLocal}, videoRef.current=${!!videoRef.current}`);
          return false;
        }
      } catch (error) {
        console.error(`VideoPlayer: Error in seekToTimestamp:`, error);
        return false;
      }
    }
  }));

  // --- Determine available sources and construct full local URL ---
  const localVideoAvailable = Boolean(localVideoPath);
  const embedVideoAvailable = Boolean(embedUrl);
  // Keep debug logs for now, can remove later
  console.log(`VideoPlayer Debug: localVideoPath=${localVideoPath}, embedUrl=${embedUrl}`);
  console.log(`VideoPlayer Debug: localVideoAvailable=${localVideoAvailable}, embedVideoAvailable=${embedVideoAvailable}`);

  console.log("VideoPlayer: Before URL calculation check (URL 计算检查之前)"); // <-- ADD LOG 1
  let localVideoSrc = null;
  if (localVideoAvailable && apiBaseUrl && taskUuid) {
    console.log("VideoPlayer: Inside URL calculation block (进入 URL 计算块)"); // <-- ADD LOG 2
    const base = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl;
    let filename = localVideoPath;
    if (filename.includes('/') && filename.split('/')[0].length === 36) { // Basic UUID check
        filename = filename.substring(filename.indexOf('/') + 1);
        // console.log(`VideoPlayer: Extracted filename without UUID prefix: ${filename}`); // Keep concise for now
    }
    localVideoSrc = `${base}/api/tasks/${taskUuid}/files/${filename}`;
    console.log(`VideoPlayer: Constructed video source URL (构建的视频源 URL): ${localVideoSrc}`); // <-- RE-ADD LOG
  } else if (localVideoAvailable && (!apiBaseUrl || !taskUuid)) {
    console.warn(`VideoPlayer: localVideoPath provided but apiBaseUrl or taskUuid is missing.`);
  }

  // --- Determine which source to USE based on preference passed from parent ---
  // Corrected logic: Only show local if preferred AND available
  // (修正逻辑: 仅当倾向本地且本地源可用时显示)
  const shouldShowLocal = preferLocalVideo && !!localVideoSrc;

  // --- 添加JavaScript直接处理字幕样式的代码 ---
  useEffect(() => {
    // 如果不是显示本地视频，不处理字幕样式
    if (!shouldShowLocal) return;
    
    const videoElement = videoRef.current;
    // 严格检查videoElement是否为有效的HTML视频元素
    if (!videoElement || !(videoElement instanceof HTMLVideoElement)) {
      console.log("VideoPlayer: videoElement is not a valid HTMLVideoElement, skipping cuechange setup");
      return;
    }
    
    // 辅助函数：判断文本是否包含中文
    const containsChinese = (text) => {
      return /[\u4e00-\u9fa5]/.test(text);
    };
    
    // 更主动地处理字幕样式，不仅依赖cuechange事件
    const applySubtitleStyles = () => {
      try {
        // 尝试查找字幕显示元素
        const subtitleElements = document.querySelectorAll('::-webkit-media-text-track-display-node');
        
        if (subtitleElements.length > 0) {
          subtitleElements.forEach(element => {
            // 检查元素内容是否包含中文
            if (containsChinese(element.textContent)) {
              // 对中文设置黄色
              element.style.color = '#FFEB3B';
              element.style.fontWeight = 'bold';
              element.classList.add('chinese-subtitle'); // 添加类以确保CSS规则应用
            }
          });
          
          // 备用方法：尝试通过DOM操作直接修改字幕容器样式
          const displayContainer = document.querySelector('::-webkit-media-text-track-display');
          if (displayContainer) {
            // 添加自定义样式类
            displayContainer.classList.add('custom-subtitle-style');
            
            // 直接修改字幕容器内的所有文本节点
            const processTextNodes = (node) => {
              if (node.nodeType === Node.TEXT_NODE) {
                if (containsChinese(node.textContent)) {
                  // 创建一个 span 替换文本节点
                  const span = document.createElement('span');
                  span.textContent = node.textContent;
                  span.style.color = '#FFEB3B';
                  span.style.fontWeight = 'bold';
                  span.classList.add('chinese-subtitle');
                  
                  if (node.parentNode) {
                    node.parentNode.replaceChild(span, node);
                  }
                }
              } else if (node.childNodes) {
                // 递归处理子节点
                node.childNodes.forEach(processTextNodes);
              }
            };
            
            // 处理字幕容器内的所有节点
            displayContainer.childNodes.forEach(processTextNodes);
          }
        }
      } catch (e) {
        console.error("Error processing subtitle styles:", e);
      }
    };
    
    // 监听字幕更新事件
    const handleCueChange = () => {
      try {
        if (!videoElement.textTracks) return;
        
        // 遍历所有文本轨道
        for (let i = 0; i < videoElement.textTracks.length; i++) {
          const track = videoElement.textTracks[i];
          
          // 只处理显示中的轨道
          if (track.mode === 'showing' && track.activeCues) {
            // 立即应用样式
            applySubtitleStyles();
            
            // 再次应用样式（以防DOM更新延迟）
            setTimeout(applySubtitleStyles, 10);
          }
        }
      } catch (e) {
        console.error("Error processing cue change:", e);
      }
    };
    
    console.log("VideoPlayer: Adding cuechange listener to video element");
    
    // 为视频元素添加事件监听
    videoElement.addEventListener('cuechange', handleCueChange);
    videoElement.addEventListener('timeupdate', applySubtitleStyles);
    
    // 初始应用一次样式
    applySubtitleStyles();
    
    // 设置周期性检查（每100ms检查一次）
    const styleInterval = setInterval(applySubtitleStyles, 100);
    
    // 使用 MutationObserver 监听字幕 DOM 变化
    let observer = null;
    try {
      observer = new MutationObserver((mutations) => {
        // 当字幕 DOM 发生变化时立即应用样式
        applySubtitleStyles();
      });
      
      // 监听整个文档的子树变化，以捕获字幕元素的添加
      observer.observe(document.body, { 
        childList: true,
        subtree: true,
        characterData: true
      });
      
      console.log("VideoPlayer: MutationObserver setup for subtitle DOM changes");
    } catch (e) {
      console.error("Error setting up MutationObserver:", e);
    }
    
    // 清理函数
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('cuechange', handleCueChange);
        videoElement.removeEventListener('timeupdate', applySubtitleStyles);
        clearInterval(styleInterval);
        
        // 断开 MutationObserver
        if (observer) {
          observer.disconnect();
        }
        
        console.log("VideoPlayer: Removed event listeners and observers");
      }
    };
  }, [shouldShowLocal]);

  // --- Add keyboard event handlers for timestamp navigation ---
  useEffect(() => {
    // Function to find the current cue index based on video time
    const findCurrentCueIndex = () => {
      if (!cues || cues.length === 0 || !videoRef.current) return -1;
      
      const currentTime = videoRef.current.currentTime;
      
      // First check if we're still in the same cue (optimization)
      if (currentCueIndex >= 0 && currentCueIndex < cues.length) {
        const cue = cues[currentCueIndex];
        if (currentTime >= cue.startTime && currentTime < cue.endTime) {
          return currentCueIndex;
        }
      }
      
      // Binary search for efficiency with large cue sets
      let low = 0;
      let high = cues.length - 1;
      
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const cue = cues[mid];
        
        if (currentTime >= cue.startTime && currentTime < cue.endTime) {
          return mid;
        } else if (currentTime < cue.startTime) {
          high = mid - 1;
        } else {
          low = mid + 1;
        }
      }
      
      // If we're after the last cue, return the last index
      if (currentTime >= cues[cues.length - 1].startTime) {
        return cues.length - 1;
      }
      
      // If we're before the first cue, return first index - 1
      if (currentTime < cues[0].startTime) {
        return -1;
      }
      
      // Find closest cue
      return cues.findIndex(cue => currentTime < cue.endTime);
    };

    // Function to navigate to next subtitle timestamp
    const seekToNextCue = () => {
      if (!cues || cues.length === 0 || !videoRef.current) return;
      
      const current = videoRef.current.currentTime;
      const nextIndex = cues.findIndex(cue => cue.startTime > current);
      
      if (nextIndex !== -1) {
        console.log(`VideoPlayer: Seeking to next cue at ${cues[nextIndex].startTime}s`);
        videoRef.current.currentTime = cues[nextIndex].startTime;
        setCurrentCueIndex(nextIndex);
      }
    };

    // Function to navigate to previous subtitle timestamp
    const seekToPrevCue = () => {
      if (!cues || cues.length === 0 || !videoRef.current) return;
      
      const current = videoRef.current.currentTime;
      
      // Find the last cue that starts before the current time
      const prevCues = cues.filter(cue => cue.startTime < current);
      
      if (prevCues.length > 0) {
        // Get the last cue that starts before current time (closest one)
        const prevCue = prevCues[prevCues.length - 1];
        const prevIndex = cues.findIndex(c => c.startTime === prevCue.startTime);
        
        // If we're already at start of current cue, go to previous one
        if (Math.abs(current - prevCue.startTime) < 0.5 && prevIndex > 0) {
          console.log(`VideoPlayer: At current cue start, seeking to previous cue at ${cues[prevIndex-1].startTime}s`);
          videoRef.current.currentTime = cues[prevIndex-1].startTime;
          setCurrentCueIndex(prevIndex-1);
        } else {
          // Otherwise, go to the start of the current cue
          console.log(`VideoPlayer: Seeking to current cue start at ${prevCue.startTime}s`);
          videoRef.current.currentTime = prevCue.startTime;
          setCurrentCueIndex(prevIndex);
        }
      } else if (cues.length > 0) {
        // If we're before first cue, go to first cue
        console.log(`VideoPlayer: Before first cue, seeking to first cue at ${cues[0].startTime}s`);
        videoRef.current.currentTime = cues[0].startTime;
        setCurrentCueIndex(0);
      }
    };

    // Update current cue index when time updates
    const handleTimeUpdate = () => {
      const newIndex = findCurrentCueIndex();
      if (newIndex !== currentCueIndex) {
        setCurrentCueIndex(newIndex);
      }
    };

    // Keyboard event handler
    const handleKeyDown = (e) => {
      // Only handle if local video is showing
      if (!shouldShowLocal) return;
      
      // Skip if modifier keys are pressed (to avoid interfering with browser shortcuts)
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      
      if (e.key === 'ArrowRight') {
        e.preventDefault(); // Prevent default browser behavior
        seekToNextCue();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault(); // Prevent default browser behavior
        seekToPrevCue();
      } else if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault(); // Prevent page scrolling
        // Toggle play/pause
        if (videoRef.current) {
          if (videoRef.current.paused) {
            videoRef.current.play().catch(err => console.error("Error playing video:", err));
            console.log('VideoPlayer: Playing video after spacebar');
          } else {
            videoRef.current.pause();
            console.log('VideoPlayer: Paused video after spacebar');
          }
        }
      }
    };

    // Add event listeners
    if (shouldShowLocal && videoRef.current) {
      console.log('VideoPlayer: Adding time update and keyboard event listeners');
      videoRef.current.addEventListener('timeupdate', handleTimeUpdate);
      document.addEventListener('keydown', handleKeyDown);
    }

    // Cleanup function
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('timeupdate', handleTimeUpdate);
      }
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [cues, shouldShowLocal, currentCueIndex]);

  // --- Effect to Dynamically Manage the <track> Element ---
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return; 

    // Add a CSS class to the video element for positioning subtitles
    videoElement.classList.add('custom-subtitle-video');

    // 如果使用ASS渲染器，跳过原生字幕处理
    if (useAssRenderer) {
      // 移除现有的track元素
      if (trackRef.current && trackRef.current.parentNode === videoElement) {
        console.log("VideoPlayer Effect: Removing native track (using ASS renderer).");
        videoElement.removeChild(trackRef.current);
        trackRef.current = null;
      }
      return;
    }

    // --- 保存当前播放时间 (Save current time before potential modification) ---
    let currentTimeBeforeChange = 0;
    // Only save if we might potentially modify the video/track state
    if (shouldShowLocal || trackRef.current) { 
        currentTimeBeforeChange = videoElement.currentTime;
        // console.log(`VideoPlayer Effect: Saved currentTime: ${currentTimeBeforeChange}`); // Optional log
    }
    // ------------------------------------------------------------------------

    // --- Optimized Track Management Logic ---

    // Case 1: Should NOT have a track (not local video OR no vttUrl provided OR using ASS)
    if (!shouldShowLocal || !vttUrl || useAssRenderer || assContent) {
        if (trackRef.current && trackRef.current.parentNode === videoElement) {
            console.log("VideoPlayer Effect: Removing track (No longer local or no URL or using ASS).");
            videoElement.removeChild(trackRef.current);
            trackRef.current = null;
        }
        // Restore time here? Probably not needed if track removed due to mode switch.
        return; 
    }

    // Case 2: Should have a track (local video AND vttUrl is present)
    let currentTrackElement = trackRef.current;
    // 支持SRT字幕，当vttLang为'srt'时，使用特殊标签
    const langLabel = vttLang === 'srt' ? '字幕' : 
                     (vttLang === 'zh' ? '中文' : 
                     (vttLang === 'en' ? 'English' : vttLang));
    const targetLabel = `${langLabel} (Cleaned)`; 

    if (currentTrackElement) {
        // Track exists, check if update is needed
        if (currentTrackElement.src !== vttUrl || currentTrackElement.srclang !== vttLang) {
            console.log(`VideoPlayer Effect: Updating existing track: lang=${vttLang}, src=${vttUrl}`);
            currentTrackElement.src = vttUrl; 
            // 对于SRT字幕，我们仍然使用'en'作为srclang，因为浏览器需要有效的语言代码
            currentTrackElement.srclang = vttLang === 'srt' ? 'en' : vttLang;
            currentTrackElement.label = targetLabel; // Use calculated label
            currentTrackElement.default = true; 
            
            // --- Attempt IMMEDIATE time restore ---  (尝试立即恢复时间)
            if (currentTimeBeforeChange > 0 && !isSeekingToTimestamp.current) {
                console.log(`VideoPlayer Effect: Attempting IMMEDIATE currentTime restore after track update to ${currentTimeBeforeChange.toFixed(2)}`);
                try { videoElement.currentTime = currentTimeBeforeChange; } catch(e){ console.error("Error setting current time immediately after update:", e); }
            } else if (isSeekingToTimestamp.current) {
                console.log(`VideoPlayer Effect: Skipping time restore - currently seeking to timestamp`);
            }
            // -------------------------------------

            if (videoElement.textTracks) {
                console.log("VideoPlayer Effect: Attempting to set track mode after update.");
                setTimeout(() => {
                    const currentVideoElement = videoRef.current; 
                    if (!currentVideoElement) return; 
                    
                    const tracks = currentVideoElement.textTracks;
                    if (!tracks) return;
                    for (let i = 0; i < tracks.length; i++) {
                        tracks[i].mode = 'hidden';
                    }
                    // Find by label first (优先用 label 查找)
                    let targetTrack = [...tracks].find(t => t.label === targetLabel);
                    // Fallback find by lang/src (备用查找)
                    if (!targetTrack) targetTrack = [...tracks].find(t => t.language === (vttLang === 'srt' ? 'en' : vttLang) && t.src === vttUrl);
                    
                    if(targetTrack) {
                        targetTrack.mode = 'showing';
                        console.log("VideoPlayer Effect: Set updated track mode to 'showing'.");
                    } else {
                         console.warn("VideoPlayer Effect: Could not find the exact track after update timeout (using label/lang/src).");
                    }

                    // Restore time again (fallback) (再次恢复时间 - 备用)
                    // Only restore if time significantly differs (e.g., more than 0.5s off) and not seeking to timestamp
                    if (currentTimeBeforeChange > 0 && videoRef.current && Math.abs(videoRef.current.currentTime - currentTimeBeforeChange) > 0.5 && !isSeekingToTimestamp.current) { 
                         console.log(`VideoPlayer Effect: Restoring currentTime (fallback) after track update to ${currentTimeBeforeChange.toFixed(2)}`);
                         try { videoRef.current.currentTime = currentTimeBeforeChange; } catch(e){ console.error("Error setting current time in fallback after update:", e); }
                    } else if (isSeekingToTimestamp.current) {
                         console.log(`VideoPlayer Effect: Skipping fallback time restore - currently seeking to timestamp`);
                    }
                }, 200); // Increased delay (增加延迟)
            }
        } else {
            // Track exists and is already correct.
        }
    } else {
        // Track does NOT exist, need to add it (Track 不存在, 需要添加)
        console.log(`VideoPlayer Effect: Adding new track: lang=${vttLang}, src=${vttUrl}`);
        try {
            const newTrack = document.createElement('track');
            newTrack.kind = 'subtitles';
            newTrack.label = targetLabel; // Use calculated label
            // 对于SRT字幕，我们仍然使用'en'作为srclang，因为浏览器需要有效的语言代码
            newTrack.srclang = vttLang === 'srt' ? 'en' : vttLang;
            newTrack.src = vttUrl;
            newTrack.default = true;

            trackRef.current = newTrack; 
            videoElement.appendChild(newTrack);
            console.log("VideoPlayer Effect: Appended new track element.");

            // --- Attempt IMMEDIATE time restore --- (尝试立即恢复时间)
            if (currentTimeBeforeChange > 0 && !isSeekingToTimestamp.current) {
                console.log(`VideoPlayer Effect: Attempting IMMEDIATE currentTime restore after track add to ${currentTimeBeforeChange.toFixed(2)}`);
                 try { videoElement.currentTime = currentTimeBeforeChange; } catch(e){ console.error("Error setting current time immediately after add:", e); }
            } else if (isSeekingToTimestamp.current) {
                console.log(`VideoPlayer Effect: Skipping immediate time restore - currently seeking to timestamp`);
            }
            // -------------------------------------

            if (videoElement.textTracks) {
                 console.log("VideoPlayer Effect: Attempting to set track mode after adding.");
                 setTimeout(() => {
                    const currentVideoElement = videoRef.current;
                    if (!currentVideoElement) return;
                    const tracks = currentVideoElement.textTracks;
                    if (!tracks) return;
                    for (let i = 0; i < tracks.length; i++) {
                        tracks[i].mode = 'hidden';
                    }
                    // Find by label first (优先用 label 查找)
                    let targetTrack = [...tracks].find(t => t.label === targetLabel);
                    if (!targetTrack) targetTrack = [...tracks].find(t => t.language === (vttLang === 'srt' ? 'en' : vttLang) && t.src === vttUrl);

                    if(targetTrack) {
                        targetTrack.mode = 'showing';
                        console.log("VideoPlayer Effect: Set added track mode to 'showing'.");
                    } else {
                         console.warn("VideoPlayer Effect: Could not find the exact new track after add timeout (using label/lang/src).");
                    }

                    // Restore time again (fallback) (再次恢复时间 - 备用)
                    if (currentTimeBeforeChange > 0 && videoRef.current && Math.abs(videoRef.current.currentTime - currentTimeBeforeChange) > 0.5 && !isSeekingToTimestamp.current) {
                         console.log(`VideoPlayer Effect: Restoring currentTime (fallback) after track add to ${currentTimeBeforeChange.toFixed(2)}`);
                         try { videoRef.current.currentTime = currentTimeBeforeChange; } catch(e){ console.error("Error setting current time in fallback after add:", e); }
                    } else if (isSeekingToTimestamp.current) {
                         console.log(`VideoPlayer Effect: Skipping fallback time restore after add - currently seeking to timestamp`);
                    }
                }, 200); // Increased delay (增加延迟)
            }
        } catch (error) {
            console.error("VideoPlayer Effect: Error creating or appending track element:", error);
            trackRef.current = null;
        }
    }

  }, [vttUrl, vttLang, shouldShowLocal, localVideoSrc, trackKey, useAssRenderer, assContent]);

  // Debug track presence and status
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    console.log("VideoPlayer Debug: Video element present, checking tracks");
    
    if (videoElement.textTracks) {
      console.log(`VideoPlayer Debug: textTracks.length=${videoElement.textTracks.length}`);
      
      for (let i = 0; i < videoElement.textTracks.length; i++) {
        const track = videoElement.textTracks[i];
        console.log(`VideoPlayer Debug: Track ${i}: mode=${track.mode}, label=${track.label}, language=${track.language}`);
      }
    } else {
      console.log("VideoPlayer Debug: textTracks not available");
    }
    
    // Force showing track if available
    setTimeout(() => {
      const video = videoRef.current;
      if (video && video.textTracks && video.textTracks.length > 0) {
        for (let i = 0; i < video.textTracks.length; i++) {
          try {
            // Force show the first track
            video.textTracks[i].mode = "showing";
            console.log(`VideoPlayer Debug: Force set track ${i} to showing mode`);
          } catch (e) {
            console.error("Error showing track:", e);
          }
        }
      }
    }, 1000);
  }, [vttUrl, shouldShowLocal]);

  // 添加全局样式
  useEffect(() => {
    // 创建样式标签
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      /* 自定义字幕样式类 */
      .custom-subtitle-style {
        color: white !important;
        font-weight: bold !important;
        font-family: "Source Han Sans CN Bold", "思源黑体 CN Bold", Arial, sans-serif !important;
        text-shadow: 1px 1px 2px black, 0 0 1em black, 0 0 0.2em black !important;
      }
      
      /* 尝试直接通过DOM结构修改字幕样式 */
      ::-webkit-media-text-track-display-node:lang(zh),
      ::-webkit-media-text-track-display-node:lang(zh-CN),
      ::-webkit-media-text-track-display-node:lang(zh-Hans) {
        color: #FFEB3B !important; /* 中文黄色 */
      }
      
      /* 基于内容检测：如果节点内有中文字符，强制应用黄色 */
      ::-webkit-media-text-track-display-node:has(span:lang(zh)),
      ::-webkit-media-text-track-display-node:has(span:lang(zh-CN)),
      ::-webkit-media-text-track-display-node:has(span:lang(zh-Hans)) {
        color: #FFEB3B !important;
      }
      
      /* 添加新的选择器，用于即时应用样式 */
      .chinese-subtitle {
        color: #FFEB3B !important;
        font-weight: bold !important;
      }
    `;
    
    // 将样式添加到头部
    document.head.appendChild(styleElement);
    
    // 清理函数
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // --- 添加YouTube API加载功能 ---
  useEffect(() => {
    // 仅在显示YouTube视频时加载API
    if (!shouldShowLocal && embedVideoAvailable) {
      console.log("VideoPlayer: Setting up YouTube iframe API");
      
      // 如果YT对象已经存在，不重复加载脚本
      if (window.YT) {
        console.log("VideoPlayer: YouTube API already loaded");
        return;
      }
      
      // 添加YouTube API脚本
      if (!document.getElementById('youtube-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        console.log("VideoPlayer: Added YouTube IFrame API script");
      }
      
      // 保存原有回调以避免覆盖
      const originalOnYouTubeIframeAPIReady = window.onYouTubeIframeAPIReady;
      
      // 设置API就绪回调
      window.onYouTubeIframeAPIReady = function() {
        console.log("VideoPlayer: YouTube IFrame API is ready");
        
        // 如果存在原始回调，也执行它
        if (typeof originalOnYouTubeIframeAPIReady === 'function') {
          originalOnYouTubeIframeAPIReady();
        }
        
        // 初始化YouTube播放器
        initializeYouTubePlayer();
      };
    }
    
    // 清理函数 - 避免内存泄漏
    return () => {
      if (youtubePlayerRef.current) {
        try {
          // 尝试销毁播放器实例
          youtubePlayerRef.current.destroy();
          youtubePlayerRef.current = null;
        } catch (error) {
          console.error('Error destroying YouTube player:', error);
        }
      }
    };
  }, [shouldShowLocal, embedVideoAvailable]);
  
  // 初始化YouTube播放器
  const initializeYouTubePlayer = () => {
    // 确保API和iframe都已就绪
    if (!window.YT || !window.YT.Player) {
      console.log("VideoPlayer: YouTube API not loaded yet");
      return false;
    }
    
    const iframe = document.getElementById('youtube-player-iframe');
    if (!iframe) {
      console.log("VideoPlayer: YouTube iframe not found");
      return false;
    }
    
    try {
      // 提取视频ID
      const videoId = extractYouTubeVideoId(iframe.src);
      if (!videoId) {
        console.error("VideoPlayer: Could not extract video ID from iframe");
        return false;
      }
      
      console.log(`VideoPlayer: Initializing YouTube player for video ID: ${videoId}`);
      
      // 创建新的播放器实例
      const player = new window.YT.Player('youtube-player-iframe', {
        events: {
          'onReady': (event) => {
            console.log('VideoPlayer: YouTube player ready via API');
            youtubePlayerRef.current = event.target;
          },
          'onStateChange': (event) => {
            console.log(`VideoPlayer: YouTube player state changed to: ${event.data}`);
          },
          'onError': (event) => {
            console.error(`VideoPlayer: YouTube player error: ${event.data}`);
          }
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error initializing YouTube player:', error);
      return false;
    }
  };
  
  // 当iframe加载完成时初始化播放器
  useEffect(() => {
    if (!shouldShowLocal && embedVideoAvailable) {
      // 给iframe加载事件添加监听器
      const iframe = document.getElementById('youtube-player-iframe');
      if (iframe) {
        const handleIframeLoad = () => {
          console.log('VideoPlayer: YouTube iframe loaded, initializing player');
          // 如果API已加载，立即初始化播放器
          if (window.YT && window.YT.Player) {
            initializeYouTubePlayer();
          }
          // 否则，等待API加载完成后会自动初始化
        };
        
        iframe.addEventListener('load', handleIframeLoad);
        return () => iframe.removeEventListener('load', handleIframeLoad);
      }
    }
  }, [shouldShowLocal, embedVideoAvailable, formattedEmbedUrl]);

  // 处理YouTube URL格式转换
  useEffect(() => {
    if (embedUrl) {
      try {
        // 检查是否为YouTube URL
        let youtubeVideoId = extractYouTubeVideoId(embedUrl);
        let startTime = 0;
        
        // 尝试从URL提取开始时间
        if (embedUrl.includes('watch?v=')) {
          // 解析watch?v=格式
          const url = new URL(embedUrl);
          
          // 获取时间参数
          const timeParam = url.searchParams.get('t');
          if (timeParam) {
            if (timeParam.includes('s')) {
              // 处理格式如 59s, 1m30s
              if (timeParam.includes('h')) {
                const hours = parseInt(timeParam.match(/(\d+)h/)?.[1] || '0');
                startTime += hours * 3600;
              }
              if (timeParam.includes('m')) {
                const minutes = parseInt(timeParam.match(/(\d+)m/)?.[1] || '0');
                startTime += minutes * 60;
              }
              const seconds = parseInt(timeParam.match(/(\d+)s/)?.[1] || '0');
              startTime += seconds;
            } else {
              // 纯数字格式
              startTime = parseInt(timeParam);
            }
          }
        } else if (embedUrl.includes('youtube.com/embed/')) {
          // 从URL参数提取开始时间
          if (embedUrl.includes('start=')) {
            const startMatch = embedUrl.match(/[?&]start=(\d+)/);
            if (startMatch && startMatch[1]) {
              startTime = parseInt(startMatch[1]);
            }
          }
        }
        
        // 如果成功提取了视频ID，构建嵌入URL
        if (youtubeVideoId) {
          let formattedUrl = `https://www.youtube.com/embed/${youtubeVideoId}?rel=0&enablejsapi=1`;
          
          // 如果有开始时间，添加到URL
          if (startTime > 0) {
            formattedUrl += `&start=${startTime}`;
          }
          
          // 添加自动播放
          formattedUrl += '&autoplay=1';
          
          console.log(`VideoPlayer: Formatted YouTube URL: ${formattedUrl}`);
          setFormattedEmbedUrl(formattedUrl);
        } else {
          console.warn(`VideoPlayer: Could not extract YouTube video ID from ${embedUrl}`);
          setFormattedEmbedUrl(embedUrl);
        }
      } catch (error) {
        console.error("VideoPlayer: Error formatting URL:", error);
        setFormattedEmbedUrl(embedUrl);
      }
    } else {
      setFormattedEmbedUrl(null);
    }
  }, [embedUrl]);

  // Fetch ASS content from server
  const fetchAssContent = useCallback(async () => {
    // Fetch ASS content for any local video with subtitles
    if (!shouldShowLocal || !apiBaseUrl || !taskUuid) {
      console.log('[VideoPlayer] ASS fetch conditions not met:', {
        shouldShowLocal,
        vttLang,
        apiBaseUrl: !!apiBaseUrl,
        taskUuid: !!taskUuid
      });
      setAssContent(''); // Clear ASS content when conditions not met
      return;
    }

    try {
      console.log('[VideoPlayer] Fetching ASS file directly...');
      
      // Try to fetch the pre-generated ASS file
      const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/transcript.ass`, {
        responseType: 'text',
        timeout: 10000
      });

      if (response.status === 200 && response.data) {
        console.log('[VideoPlayer] ASS content fetched successfully');
        setAssContent(response.data);
      }
    } catch (error) {
      console.error('[VideoPlayer] Error fetching ASS content:', error);
      
      // If ASS file doesn't exist, try to process SRT first
      if (error.response?.status === 404) {
        console.log('[VideoPlayer] ASS file not found, triggering SRT processing...');
        try {
          await axios.post(`${apiBaseUrl}/api/tasks/${taskUuid}/process_srt`);
          console.log('[VideoPlayer] SRT processing completed, ASS file should be available now');
          
          // Retry fetching ASS after processing
          const retryResponse = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/transcript.ass`, {
            responseType: 'text',
            timeout: 10000
          });
          
          if (retryResponse.status === 200 && retryResponse.data) {
            console.log('[VideoPlayer] ASS content fetched successfully after processing');
            setAssContent(retryResponse.data);
          }
        } catch (processError) {
          console.error('[VideoPlayer] Error processing SRT or fetching ASS:', processError);
          setAssContent(''); // Clear on error
        }
      } else {
        setAssContent(''); // Clear on other errors
      }
    }
  }, [shouldShowLocal, vttLang, apiBaseUrl, taskUuid]);

  // Trigger ASS content fetch when conditions change
  useEffect(() => {
    fetchAssContent();
  }, [fetchAssContent]);

  return (
    // Removed outer div wrapper, parent will handle layout
    <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-lg relative"> 
      {/* Apply custom subtitle styles */}
      <style>{subtitleStyles}</style>
      {shouldShowLocal ? (
        <>
          <video 
            ref={videoRef} 
            controls 
            src={localVideoSrc} 
            title={title}
            className="w-full h-full object-contain" 
            crossOrigin="anonymous" 
          >
            {/* The <track> element logic is handled in useEffect */} 
            Your browser does not support the video tag.
          </video>
          {/* ASS字幕渲染器 - 优先使用ASS渲染器 */}
          {shouldShowLocal && assContent && (
            <AssSubtitleRenderer
              videoRef={videoRef}
              assContent={assContent}
              isVisible={true}
            />
          )}
          {/* 只有在没有ASS内容时才使用原生字幕轨道 */}
          {shouldShowLocal && !assContent && vttLang && vttUrl && (
            <track
              key={`subtitle-${vttLang}`}
              kind="subtitles"
              src={vttUrl}
              srcLang={vttLang}
              default
            />
          )}
        </>
      ) : embedVideoAvailable ? ( // Show iframe if embed is available and local wasn't chosen
        <iframe 
          // 使用格式化后的嵌入URL
          src={formattedEmbedUrl || embedUrl} 
          title={title}
          frameBorder="0" 
          id="youtube-player-iframe"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowFullScreen
          className="w-full h-full"
          // YouTube API 需要的属性
          name="youtube-player"
          loading="eager"
          onLoad={() => console.log("VideoPlayer: YouTube iframe loaded")} 
        ></iframe>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
          <p>No video available.</p>
        </div>
      )}
      {/* Button rendering is removed */}
    </div>
  );
});

export default VideoPlayer; 