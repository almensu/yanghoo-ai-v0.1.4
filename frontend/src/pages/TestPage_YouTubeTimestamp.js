import React, { useEffect } from 'react';

function TestPage_YouTubeTimestamp() {
  useEffect(() => {
    // Load YouTube IFrame API
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    // Initialize the player when API is ready
    window.onYouTubeIframeAPIReady = function() {
      const player = new window.YT.Player('youtube-player', {
        height: '100%',
        width: '100%',
        videoId: 'JpUZsBUitzA',
        playerVars: {
          'start': 0,
          'rel': 0,
          'controls': 1,
          'showinfo': 0
        },
        events: {
          'onReady': onPlayerReady
        }
      });

      function onPlayerReady() {
        const timestampItems = document.querySelectorAll('.timestamp-list li');
        timestampItems.forEach(item => {
          item.addEventListener('click', () => {
            timestampItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            const time = parseInt(item.getAttribute('data-time'), 10);
            if (!isNaN(time)) {
              player.seekTo(time, true);
              player.playVideo();
            }
          });
        });
      }
    };

    // Cleanup function
    return () => {
      delete window.onYouTubeIframeAPIReady;
    };
  }, []);

  return (
    <div className="p-6 h-full bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">YouTube 视频时间戳跳转</h1>
      <div className="container flex flex-col lg:flex-row gap-5 max-w-7xl mx-auto">
        <div className="flex-grow lg:w-3/4 video-section relative" style={{ aspectRatio: '16/9' }}>
          <div id="youtube-player" className="w-full h-full"></div>
        </div>
        <div className="timestamp-section bg-white p-5 rounded-lg shadow-md lg:w-1/4">
          <h3 className="text-xl font-semibold mb-4">时间戳</h3>
          <ul className="timestamp-list space-y-2">
            <li data-time="0" className="active p-3 cursor-pointer border-b hover:bg-gray-50 transition-colors rounded">0:00 - 开始</li>
            <li data-time="30" className="p-3 cursor-pointer border-b hover:bg-gray-50 transition-colors rounded">0:30 - 场景 1</li>
            <li data-time="60" className="p-3 cursor-pointer border-b hover:bg-gray-50 transition-colors rounded">1:00 - 场景 2</li>
            <li data-time="90" className="p-3 cursor-pointer border-b hover:bg-gray-50 transition-colors rounded">1:30 - 场景 3</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default TestPage_YouTubeTimestamp; 