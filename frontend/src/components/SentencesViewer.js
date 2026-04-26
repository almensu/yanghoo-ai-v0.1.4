import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Activity } from 'lucide-react';

/**
 * 句子级转录稿查看器
 * 
 * Props:
 * - sentences: 句子数组 [{text, start, end}]
 * - videoRef: 视频引用
 * - syncEnabled: 是否开启同步高亮
 */
const SentencesViewer = ({ sentences = [], videoRef, syncEnabled = true }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const scrollTimeoutRef = useRef(null);
  const containerRef = useRef(null);
  const sentenceRefs = useRef([]);

  // 检测用户滚动
  const handleScroll = useCallback(() => {
    setIsUserScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false);
    }, 3000); // 3秒无操作后恢复自动滚动
  }, []);

  // 更新当前时间
  useEffect(() => {
    if (!syncEnabled || !videoRef?.current) return;

    const video = videoRef.current.video || videoRef.current;
    if (!video || typeof video.addEventListener !== 'function') return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [videoRef, syncEnabled]);

  // 根据当前时间计算激活的句子索引
  useEffect(() => {
    if (!sentences.length) return;

    const index = sentences.findIndex(
      (s) => currentTime >= s.start && currentTime <= s.end
    );

    if (index !== -1 && index !== activeIndex) {
      setActiveIndex(index);
      
      // 自动滚动到激活项 (仅在非用户手动滚动时)
      if (!isUserScrolling && sentenceRefs.current[index]) {
        sentenceRefs.current[index].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentTime, sentences, activeIndex, isUserScrolling]);

  const handleSentenceClick = (start) => {
    if (!videoRef?.current) return;
    
    const video = videoRef.current.video || videoRef.current;
    if (typeof videoRef.current.seekToTimestamp === 'function') {
      videoRef.current.seekToTimestamp(start);
    } else {
      video.currentTime = start;
      if (video.paused) video.play();
    }
  };

  if (!sentences || sentences.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-base-content/20 italic gap-2">
        <Activity size={32} strokeWidth={1} />
        <span className="text-xs">暂无精制句子数据</span>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      onScroll={handleScroll}
      className="flex flex-col h-full overflow-y-auto custom-scrollbar bg-base-100"
    >
      <div className="divide-y divide-base-200">
        {sentences.map((s, index) => (
          <div
            key={index}
            ref={(el) => (sentenceRefs.current[index] = el)}
            className={`
              flex gap-4 p-3 cursor-pointer transition-colors duration-150 group
              ${index === activeIndex 
                ? 'bg-primary/5 text-primary border-r-2 border-primary' 
                : 'hover:bg-base-200 text-base-content/80'}
            `}
            onClick={() => handleSentenceClick(s.start)}
          >
            <div className={`
              text-[10px] font-mono tabular-nums mt-1 flex-shrink-0 w-14
              ${index === activeIndex ? 'text-primary font-bold' : 'text-base-content/30 group-hover:text-base-content/50'}
            `}>
              {new Date(s.start * 1000).toISOString().substr(11, 8)}
            </div>
            <div className={`
              text-sm leading-relaxed break-words flex-grow
              ${index === activeIndex ? 'font-medium' : ''}
            `}>
              {s.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentencesViewer;
