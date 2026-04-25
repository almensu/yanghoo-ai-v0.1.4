import React, { useEffect, useRef, useState } from 'react';

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
  const containerRef = useRef(null);
  const sentenceRefs = useRef([]);

  // 更新当前时间
  useEffect(() => {
    if (!syncEnabled || !videoRef?.current) return;

    const video = videoRef.current.video || videoRef.current; // 处理可能是封装过的引用
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
      
      // 自动滚动到激活项
      if (sentenceRefs.current[index]) {
        sentenceRefs.current[index].scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [currentTime, sentences, activeIndex]);

  const handleSentenceClick = (start) => {
    if (!videoRef?.current) return;
    
    const video = videoRef.current.video || videoRef.current;
    
    // 如果有 seekToTimestamp 方法则优先使用
    if (typeof videoRef.current.seekToTimestamp === 'function') {
      videoRef.current.seekToTimestamp(start);
    } else {
      video.currentTime = start;
      if (video.paused) video.play();
    }
  };

  if (!sentences || sentences.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 italic">
        暂无精制句子数据。
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex flex-col gap-2 p-2 h-full overflow-y-auto custom-scrollbar"
    >
      {sentences.map((s, index) => (
        <div
          key={index}
          ref={(el) => (sentenceRefs.current[index] = el)}
          className={`
            p-3 rounded-lg cursor-pointer transition-all duration-200 border-l-4
            ${index === activeIndex 
              ? 'bg-primary/10 border-primary shadow-sm' 
              : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'}
          `}
          onClick={() => handleSentenceClick(s.start)}
        >
          <div className="flex justify-between items-start gap-3">
            <span className="text-xs font-mono text-base-content/40 mt-0.5 flex-shrink-0">
              {new Date(s.start * 1000).toISOString().substr(11, 8)}
            </span>
            <p className={`text-sm leading-relaxed ${index === activeIndex ? 'text-primary font-medium' : 'text-base-content/80'}`}>
              {s.text}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SentencesViewer;
