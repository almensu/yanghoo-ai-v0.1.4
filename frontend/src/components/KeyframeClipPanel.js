import React, { useState, useEffect, useRef } from 'react';
import { formatTime } from '../utils/formatTime';

const KeyframeClipPanel = ({ taskUuid, onClipSegments }) => {
  const [keyframes, setKeyframes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [selectedFrames, setSelectedFrames] = useState([]);
  const [extractSettings, setExtractSettings] = useState({
    method: 'interval',
    interval: 10,
    count: 100,
    quality: 'medium',
    enableMaxCount: true  // 是否启用最大数量限制
  });
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'timeline'
  const [clipMode, setClipMode] = useState(false);
  const [segments, setSegments] = useState([]);
  const [currentSegment, setCurrentSegment] = useState({ start: null, end: null });
  const [showSettings, setShowSettings] = useState(false);
  const [gridColumns, setGridColumns] = useState(4); // 默认4列
  const [showTimestamps, setShowTimestamps] = useState(false); // 默认关闭时间戳显示

  const timelineRef = useRef(null);

  useEffect(() => {
    loadKeyframes();
    loadStats();
  }, [taskUuid]);

  const loadKeyframes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskUuid}/keyframes`);
      if (response.ok) {
        const data = await response.json();
        setKeyframes(data.keyframes || []);
      } else if (response.status === 404) {
        setKeyframes([]);
      } else {
        throw new Error('Failed to load keyframes');
      }
    } catch (err) {
      console.error('Error loading keyframes:', err);
      setError('加载关键帧失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskUuid}/keyframes/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const extractKeyframes = async () => {
    setExtracting(true);
    setError(null);
    try {
      // 处理无限制模式
      const requestData = {
        method: extractSettings.method,
        interval: extractSettings.interval,
        count: extractSettings.method === 'interval' && !extractSettings.enableMaxCount ? -1 : extractSettings.count,
        quality: extractSettings.quality,
        regenerate: true
      };

      const response = await fetch(`http://127.0.0.1:8000/api/tasks/${taskUuid}/extract_keyframes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error('提取关键帧失败');
      }

      const data = await response.json();
      setKeyframes(data.keyframes_data.keyframes || []);
      loadStats();
    } catch (err) {
      console.error('Error extracting keyframes:', err);
      setError(err.message);
    } finally {
      setExtracting(false);
    }
  };

  const deleteKeyframes = async () => {
    if (!window.confirm('确定要删除所有关键帧吗？')) return;
    
    try {
      await fetch(`http://127.0.0.1:8000/api/tasks/${taskUuid}/keyframes`, { method: 'DELETE' });
      setKeyframes([]);
      setStats(null);
      setSelectedFrames([]);
      setSegments([]);
    } catch (err) {
      console.error('Error deleting keyframes:', err);
      setError('删除关键帧失败');
    }
  };

  const toggleFrameSelection = (frameIndex) => {
    setSelectedFrames(prev => {
      if (prev.includes(frameIndex)) {
        return prev.filter(i => i !== frameIndex);
      } else {
        return [...prev, frameIndex].sort((a, b) => a - b);
      }
    });
  };

  const handleFrameClick = (frame) => {
    if (!clipMode) {
      toggleFrameSelection(frame.index);
      return;
    }

    // 剪辑模式下的逻辑
    if (currentSegment.start === null) {
      setCurrentSegment({ start: frame.timestamp, end: null });
    } else if (currentSegment.end === null) {
      const start = Math.min(currentSegment.start, frame.timestamp);
      const end = Math.max(currentSegment.start, frame.timestamp);
      
      const newSegment = { start, end };
      setSegments(prev => [...prev, newSegment]);
      setCurrentSegment({ start: null, end: null });
    }
  };

  const createSegmentsFromSelected = () => {
    if (selectedFrames.length < 2) {
      alert('请至少选择2个关键帧来创建片段');
      return;
    }

    const selectedTimestamps = selectedFrames
      .map(index => keyframes.find(f => f.index === index)?.timestamp)
      .filter(t => t !== undefined)
      .sort((a, b) => a - b);

    // 创建一个连续的片段，从第一个选中的关键帧到最后一个选中的关键帧
    // 这样可以避免视频跳跃和卡顿
    const newSegment = {
      start: selectedTimestamps[0],
      end: selectedTimestamps[selectedTimestamps.length - 1]
    };

    setSegments(prev => [...prev, newSegment]);
    setSelectedFrames([]);
    
    // 提示用户创建的是连续片段
    const duration = newSegment.end - newSegment.start;
    console.log(`创建连续片段: ${formatTime(newSegment.start)} → ${formatTime(newSegment.end)} (时长: ${formatTime(duration)})`);
  };

  const removeSegment = (index) => {
    setSegments(prev => prev.filter((_, i) => i !== index));
  };

  const clearSegments = () => {
    setSegments([]);
    setCurrentSegment({ start: null, end: null });
  };

  const handleClip = () => {
    if (segments.length === 0) {
      alert('请先创建片段');
      return;
    }
    onClipSegments(segments);
  };

  const renderKeyframeGrid = () => {    
    return (
      <div 
        className="grid gap-2"
        style={{ 
          gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
        }}
      >
        {keyframes.map((frame) => (
          <div
            key={frame.index}
            className={`relative cursor-pointer border-2 rounded transition-all overflow-hidden group ${
              selectedFrames.includes(frame.index)
                ? 'border-blue-500 bg-blue-50'
                : clipMode && currentSegment.start === frame.timestamp
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 hover:border-gray-400'
            }`}
            onClick={() => handleFrameClick(frame)}
          >
            {/* 16:9 等比例容器 */}
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <img
                src={`http://127.0.0.1:8000/files/${taskUuid}/${frame.relative_path}`}
                alt={`Frame ${frame.index}`}
                className="absolute inset-0 w-full h-full object-cover rounded transition-transform group-hover:scale-105"
                loading="lazy"
              />
              {/* 时间戳叠加层 */}
              {showTimestamps && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 rounded-b">
                  <div className="font-medium">{formatTime(frame.timestamp)}</div>
                  {gridColumns <= 4 && (
                    <div className="text-gray-300 text-[10px]">#{frame.index}</div>
                  )}
                </div>
              )}
              {/* 选中标记 */}
              {selectedFrames.includes(frame.index) && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                  ✓
                </div>
              )}
              {/* 剪辑模式起始帧标记 */}
              {clipMode && currentSegment.start === frame.timestamp && (
                <div className="absolute top-2 right-2 bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg">
                  ▶
                </div>
              )}
              {/* 悬停效果 */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTimeline = () => {
    const videoDuration = stats?.video_duration || 0;
    const timelineWidth = 800;
    
    return (
      <div className="relative" style={{ width: timelineWidth, height: 120 }}>
        <div className="absolute top-0 w-full h-2 bg-gray-200 rounded">
          {/* 时间轴背景 */}
        </div>
        
        {/* 关键帧标记 */}
        {keyframes.map((frame) => {
          const position = (frame.timestamp / videoDuration) * timelineWidth;
          return (
            <div
              key={frame.index}
              className={`absolute cursor-pointer ${
                selectedFrames.includes(frame.index) ? 'z-20' : 'z-10'
              }`}
              style={{ left: position - 30, top: 10 }}
              onClick={() => handleFrameClick(frame)}
            >
              <img
                src={`http://127.0.0.1:8000/files/${taskUuid}/${frame.relative_path}`}
                alt={`Frame ${frame.index}`}
                className={`w-16 h-12 object-cover border-2 rounded ${
                  selectedFrames.includes(frame.index)
                    ? 'border-blue-500'
                    : 'border-gray-300'
                }`}
              />
              {showTimestamps && (
                <div className="text-xs text-center mt-1">
                  {formatTime(frame.timestamp)}
                </div>
              )}
            </div>
          );
        })}
        
        {/* 片段标记 */}
        {segments.map((segment, index) => {
          const startPos = (segment.start / videoDuration) * timelineWidth;
          const endPos = (segment.end / videoDuration) * timelineWidth;
          const width = endPos - startPos;
          
          return (
            <div
              key={index}
              className="absolute bg-green-400 bg-opacity-50 border border-green-600 rounded"
              style={{
                left: startPos,
                top: 80,
                width: width,
                height: 20
              }}
            >
              <span className="text-xs text-green-800 px-1">
                片段 {index + 1}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">加载关键帧...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 头部控制面板 */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap items-center gap-4">
          <h3 className="text-lg font-semibold">关键帧剪辑</h3>
          
          {stats && (
            <div className="text-sm text-gray-600">
              已提取 {stats.count} 个关键帧 | 质量: {stats.quality} | 
              成功率: {(stats.success_rate * 100).toFixed(1)}%
              {!showSettings && (
                <span className="ml-2 text-blue-600">
                  (对结果不满意？点击"修改设置"重新提取)
                </span>
              )}
            </div>
          )}
          
          <div className="flex gap-2 ml-auto items-center">
            {/* 网格列数调整 */}
            {viewMode === 'grid' && keyframes.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-sm text-gray-600">列数:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setGridColumns(Math.max(2, gridColumns - 1))}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={gridColumns <= 2}
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-medium bg-gray-50 rounded px-2 py-1">
                    {gridColumns}
                  </span>
                  <button
                    onClick={() => setGridColumns(Math.min(12, gridColumns + 1))}
                    className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={gridColumns >= 12}
                  >
                    +
                  </button>
                </div>
                {/* 快捷列数按钮 */}
                <div className="flex gap-1 ml-2">
                  {[3, 4, 6, 8].map(cols => (
                    <button
                      key={cols}
                      onClick={() => setGridColumns(cols)}
                      className={`px-2 py-1 text-xs rounded transition-all ${
                        gridColumns === cols 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                      }`}
                    >
                      {cols}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'timeline' : 'grid')}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            >
              {viewMode === 'grid' ? '时间轴视图' : '网格视图'}
            </button>
            
            <button
              onClick={() => setShowTimestamps(!showTimestamps)}
              className={`px-3 py-1 rounded text-sm ${
                showTimestamps 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {showTimestamps ? '隐藏时间戳' : '显示时间戳'}
            </button>
            
            <button
              onClick={() => setClipMode(!clipMode)}
              className={`px-3 py-1 rounded text-sm ${
                clipMode 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {clipMode ? '退出剪辑模式' : '进入剪辑模式'}
            </button>
          </div>
        </div>

        {/* 提取设置 */}
        {(keyframes.length === 0 || showSettings) && (
          <div className="mt-4 p-4 bg-gray-50 rounded">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">提取设置</h4>
              {keyframes.length > 0 && (
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  隐藏设置
                </button>
              )}
            </div>
            {/* 方案选择 */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">提取方案</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div 
                  className={`p-3 border-2 rounded cursor-pointer transition-all ${
                    extractSettings.method === 'interval' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setExtractSettings(prev => ({ ...prev, method: 'interval' }))}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">⏱️</span>
                    <span className="font-medium">方案1: 固定间隔</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    按指定时间间隔提取关键帧，适合教学视频等需要均匀采样的场景
                  </p>
                </div>
                
                <div 
                  className={`p-3 border-2 rounded cursor-pointer transition-all ${
                    extractSettings.method === 'count' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  onClick={() => setExtractSettings(prev => ({ ...prev, method: 'count' }))}
                >
                  <div className="flex items-center mb-2">
                    <span className="text-lg mr-2">🎯</span>
                    <span className="font-medium">方案2: 固定数量</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    均匀分布提取指定数量的关键帧，适合生成预览、缩略图等场景
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {extractSettings.method === 'interval' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1">间隔 (秒)</label>
                    <input
                      type="number"
                      min="1"
                      max="60"
                      value={extractSettings.interval}
                      onChange={(e) => setExtractSettings(prev => ({
                        ...prev,
                        interval: parseInt(e.target.value)
                      }))}
                      className="w-full px-3 py-1 border rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      每隔多少秒提取一个关键帧
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium">最大数量限制</label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={extractSettings.enableMaxCount}
                          onChange={(e) => setExtractSettings(prev => ({
                            ...prev,
                            enableMaxCount: e.target.checked
                          }))}
                          className="mr-1"
                        />
                        <span className="text-xs text-gray-600">启用</span>
                      </label>
                    </div>
                    
                    {extractSettings.enableMaxCount ? (
                      <>
                        <input
                          type="number"
                          min="10"
                          max="500"
                          value={extractSettings.count}
                          onChange={(e) => setExtractSettings(prev => ({
                            ...prev,
                            count: parseInt(e.target.value)
                          }))}
                          className="w-full px-3 py-1 border rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          最多提取的关键帧数量
                        </p>
                      </>
                    ) : (
                      <>
                        <input
                          type="text"
                          value="无限制"
                          disabled
                          className="w-full px-3 py-1 border rounded bg-gray-100 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          按间隔提取所有关键帧，不限制数量
                        </p>
                      </>
                    )}
                  </div>
                </>
              )}
              
              {extractSettings.method === 'count' && (
                <div>
                  <label className="block text-sm font-medium mb-1">数量</label>
                  <input
                    type="number"
                    min="10"
                    max="500"
                    value={extractSettings.count}
                    onChange={(e) => setExtractSettings(prev => ({
                      ...prev,
                      count: parseInt(e.target.value)
                    }))}
                    className="w-full px-3 py-1 border rounded"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    要提取的关键帧总数量
                  </p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-1">质量</label>
                <select
                  value={extractSettings.quality}
                  onChange={(e) => setExtractSettings(prev => ({
                    ...prev,
                    quality: e.target.value
                  }))}
                  className="w-full px-3 py-1 border rounded"
                >
                  <option value="low">低 (160x90)</option>
                  <option value="medium">中 (320x180)</option>
                  <option value="high">高 (640x360)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  关键帧图片的分辨率
                </p>
              </div>
            </div>
            
            {/* 当前设置预览 */}
            {stats && (
              <div className="mt-3 space-y-3">
                <div className="p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>当前设置预览:</strong> 
                    方案{extractSettings.method === 'interval' ? '1(固定间隔)' : '2(固定数量)'}，
                    {extractSettings.method === 'interval' && extractSettings.enableMaxCount && `间隔 ${extractSettings.interval}秒，最多 ${extractSettings.count} 个关键帧，`}
                    {extractSettings.method === 'interval' && !extractSettings.enableMaxCount && `间隔 ${extractSettings.interval}秒，无数量限制，`}
                    {extractSettings.method === 'count' && `总数量 ${extractSettings.count} 个关键帧，`}
                    质量 {extractSettings.quality === 'low' ? '低' : extractSettings.quality === 'medium' ? '中' : '高'}
                    {stats.video_duration && extractSettings.method === 'interval' && extractSettings.enableMaxCount && (
                      <span>
                        {' '}→ 预计提取 {Math.min(Math.floor(stats.video_duration / extractSettings.interval) + 1, extractSettings.count)} 个关键帧
                      </span>
                    )}
                    {stats.video_duration && extractSettings.method === 'interval' && !extractSettings.enableMaxCount && (
                      <span>
                        {' '}→ 预计提取 {Math.floor(stats.video_duration / extractSettings.interval) + 1} 个关键帧
                      </span>
                    )}
                    {stats.video_duration && extractSettings.method === 'count' && (
                      <span>
                        {' '}→ 间隔约 {(stats.video_duration / (extractSettings.count - 1)).toFixed(1)}秒
                      </span>
                    )}
                  </p>
                </div>
                
                {keyframes.length > 0 && (
                  <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm text-yellow-700 mb-2">
                      <strong>提取建议:</strong>
                    </p>
                                         <div className="text-xs text-yellow-600 space-y-1">
                       {extractSettings.method === 'interval' && (
                         <>
                           <p>• <strong>关键帧太少？</strong> 减小间隔时间 (如改为 {Math.max(1, extractSettings.interval - 5)}秒){extractSettings.enableMaxCount && ' 或增加最大数量'}</p>
                           <p>• <strong>关键帧太多？</strong> 增大间隔时间 (如改为 {extractSettings.interval + 5}秒){extractSettings.enableMaxCount ? ' 或减少最大数量' : ' 或启用最大数量限制'}</p>
                           {!extractSettings.enableMaxCount && (
                             <p>• <strong>无限制模式:</strong> 当前会提取所有间隔位置的关键帧，适合详细分析</p>
                           )}
                         </>
                       )}
                       {extractSettings.method === 'count' && (
                         <>
                           <p>• <strong>关键帧太少？</strong> 增加数量设置</p>
                           <p>• <strong>关键帧太多？</strong> 减少数量设置</p>
                         </>
                       )}
                       <p>• <strong>图片不够清晰？</strong> 提高质量等级 (当前: {extractSettings.quality === 'low' ? '低' : extractSettings.quality === 'medium' ? '中' : '高'})</p>
                       <p>• <strong>加载太慢？</strong> 降低质量等级或减少关键帧数量</p>
                     </div>
                     
                     {/* 快速设置按钮 */}
                     <div className="mt-3 pt-3 border-t border-yellow-300">
                       <p className="text-sm text-yellow-700 mb-2"><strong>快速调整:</strong></p>
                       <div className="flex flex-wrap gap-2">
                         {extractSettings.method === 'interval' && (
                           <>
                             <button
                               onClick={() => setExtractSettings(prev => ({ ...prev, interval: Math.max(1, prev.interval - 5) }))}
                               className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                             >
                               更密集 (-5秒)
                             </button>
                             <button
                               onClick={() => setExtractSettings(prev => ({ ...prev, interval: prev.interval + 5 }))}
                               className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                             >
                               更稀疏 (+5秒)
                             </button>
                           </>
                         )}
                         {(extractSettings.method === 'count' || (extractSettings.method === 'interval' && extractSettings.enableMaxCount)) && (
                           <>
                             <button
                               onClick={() => setExtractSettings(prev => ({ ...prev, count: Math.min(500, prev.count + 50) }))}
                               className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                             >
                               更多帧 (+50)
                             </button>
                             <button
                               onClick={() => setExtractSettings(prev => ({ ...prev, count: Math.max(10, prev.count - 50) }))}
                               className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                             >
                               更少帧 (-50)
                             </button>
                           </>
                         )}
                         {extractSettings.method === 'interval' && !extractSettings.enableMaxCount && (
                           <button
                             onClick={() => setExtractSettings(prev => ({ ...prev, enableMaxCount: true }))}
                             className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                           >
                             启用数量限制
                           </button>
                         )}
                         {extractSettings.quality !== 'high' && (
                           <button
                             onClick={() => setExtractSettings(prev => ({ 
                               ...prev, 
                               quality: prev.quality === 'low' ? 'medium' : 'high' 
                             }))}
                             className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                           >
                             提高质量
                           </button>
                         )}
                         {extractSettings.quality !== 'low' && (
                           <button
                             onClick={() => setExtractSettings(prev => ({ 
                               ...prev, 
                               quality: prev.quality === 'high' ? 'medium' : 'low' 
                             }))}
                             className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 rounded"
                           >
                             降低质量
                           </button>
                         )}
                       </div>
                     </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 操作按钮 */}
        <div className="mt-4 flex flex-wrap gap-2">
          {keyframes.length === 0 ? (
            <button
              onClick={extractKeyframes}
              disabled={extracting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {extracting ? '提取中...' : '提取关键帧'}
            </button>
          ) : (
            <>
              <button
                onClick={extractKeyframes}
                disabled={extracting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {extracting ? '重新提取中...' : '重新提取'}
              </button>
              
              {!showSettings && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  修改设置
                </button>
              )}
              
              <button
                onClick={deleteKeyframes}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                删除关键帧
              </button>
              
              {!clipMode && selectedFrames.length >= 2 && (
                <button
                  onClick={createSegmentsFromSelected}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  创建连续片段 ({selectedFrames.length} 帧)
                </button>
              )}
              
              {segments.length > 0 && (
                <>
                  <button
                    onClick={clearSegments}
                    className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    清除片段
                  </button>
                  
                  <button
                    onClick={handleClip}
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    开始剪辑 ({segments.length} 个片段)
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 片段列表 */}
      {segments.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-3">剪辑片段 ({segments.length})</h4>
          <div className="space-y-2">
            {segments.map((segment, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span>
                  片段 {index + 1}: {formatTime(segment.start)} → {formatTime(segment.end)}
                  <span className="text-gray-500 ml-2">
                    (时长: {formatTime(segment.end - segment.start)})
                  </span>
                </span>
                <button
                  onClick={() => removeSegment(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 关键帧显示 */}
      {keyframes.length > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h4 className="font-medium">
                关键帧 ({keyframes.length})
                {clipMode && (
                  <span className="ml-2 text-sm text-green-600">
                    剪辑模式: 点击两个关键帧创建连续片段
                    {currentSegment.start !== null && (
                      <span className="ml-2 text-orange-600">
                        (已选择起始: {formatTime(currentSegment.start)})
                      </span>
                    )}
                  </span>
                )}
                {!clipMode && selectedFrames.length > 0 && (
                  <span className="ml-2 text-sm text-blue-600">
                    已选择 {selectedFrames.length} 个关键帧
                  </span>
                )}
              </h4>
            </div>
            
            {/* 当前显示状态 */}
            {viewMode === 'grid' && (
              <div className="text-sm text-gray-500">
                {gridColumns} 列网格 • 等比例 16:9 显示
              </div>
            )}
          </div>
          
          <div className="overflow-x-auto">
            {viewMode === 'grid' ? renderKeyframeGrid() : renderTimeline()}
          </div>
        </div>
      )}

      {/* 使用说明 */}
      {keyframes.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-medium text-blue-800 mb-2">使用说明</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• <strong>网格模式</strong>: 点击关键帧选择，然后点击"创建片段" - 会创建从第一帧到最后一帧的连续片段</p>
            <p>• <strong>剪辑模式</strong>: 依次点击两个关键帧自动创建连续片段 - 包含中间所有画面，避免卡顿</p>
            <p>• <strong>时间轴模式</strong>: 在时间轴上可视化查看关键帧分布</p>
            <p>• <strong>连续剪辑</strong>: 选中的关键帧之间会自动补全中间画面，确保视频流畅</p>
            <p>• 创建片段后点击"开始剪辑"进行视频剪切</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default KeyframeClipPanel;