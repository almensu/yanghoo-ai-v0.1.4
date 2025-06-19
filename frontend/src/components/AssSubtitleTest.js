import React from 'react';

// 测试ASS字幕渲染的组件
const AssSubtitleTest = () => {
  const testAssContent = `[Script Info]
Title: Test ASS Subtitles
ScriptType: v4.00+

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Source Han Sans CN Bold,24,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,1,2,10,10,30,1
Style: Chinese,Source Han Sans CN Bold,24,&H0000FFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,2,1,2,10,10,30,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:05.00,0:00:08.00,Default,,0,0,0,,Hello World! This is a test subtitle.
Dialogue: 0,0:00:10.00,0:00:13.00,Chinese,,0,0,0,,你好世界！这是一个测试字幕。
Dialogue: 0,0:00:15.00,0:00:18.00,Default,,0,0,0,,Mixed content: 英文 and 中文
`;

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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parsedSubtitles = parseAssContent(testAssContent);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">ASS字幕解析测试</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">解析结果:</h3>
        <p className="text-sm text-gray-600 mb-4">共解析到 {parsedSubtitles.length} 条字幕</p>
        
        <div className="space-y-4">
          {parsedSubtitles.map((sub, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm font-mono text-gray-500">
                  {formatTime(sub.start)} → {formatTime(sub.end)}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {sub.style}
                </span>
              </div>
              
                             <div className="relative bg-black rounded p-3 text-center">
                 <div
                   className="inline-block px-3 py-2 rounded"
                   style={{
                     backgroundColor: 'rgba(0, 0, 0, 0.7)',
                     color: /[\u4e00-\u9fa5]/.test(sub.text) ? '#FFEB3B' : '#FFFFFF',
                     fontSize: '16px',
                     fontFamily: '"Source Han Sans CN Bold", "思源黑体 CN Bold", Arial, sans-serif',
                     fontWeight: 'bold',
                     textShadow: '1px 1px 2px black, 0 0 1em black, 0 0 0.2em black',
                     lineHeight: '1.4',
                     whiteSpace: 'pre-line'
                   }}
                 >
                   {sub.text}
                 </div>
                 <div className="mt-2 text-xs text-gray-500">
                   包含中文: {/[\u4e00-\u9fa5]/.test(sub.text) ? '是' : '否'} | 
                   颜色: {/[\u4e00-\u9fa5]/.test(sub.text) ? '黄色' : '白色'}
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-2">原始ASS内容:</h3>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-h-64">
          {testAssContent}
        </pre>
      </div>
    </div>
  );
};

export default AssSubtitleTest; 