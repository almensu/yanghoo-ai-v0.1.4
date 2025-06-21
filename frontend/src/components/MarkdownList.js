import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { estimateTokenCount, formatTokenCount, getTokenCountColorClass } from '../utils/tokenUtils';

// Props:
// - files: Array of markdown filenames (strings)
// - selectedFile: The currently selected filename (string)
// - onSelectFile: Function to call when a file is clicked (passes filename)
// - taskUuid: UUID of the current task for fetching file contents
// - apiBaseUrl: Base URL for API calls

function MarkdownList({ files, selectedFile, onSelectFile, taskUuid, apiBaseUrl }) {
  const [fileTokenCounts, setFileTokenCounts] = useState({});
  const [loadingTokenCounts, setLoadingTokenCounts] = useState(false);
  const [draggedFile, setDraggedFile] = useState(null);

  // Fetch token counts for all files
  useEffect(() => {
    if (!files || files.length === 0 || !taskUuid || !apiBaseUrl) {
      return;
    }

    const fetchTokenCounts = async () => {
      setLoadingTokenCounts(true);
      const tokenCounts = {};

      try {
        // Fetch content for each file and calculate token count
        const fetchPromises = files.map(async (filename) => {
          try {
            const encodedFilename = encodeURIComponent(filename);
            const response = await axios.get(
              `${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodedFilename}`,
              { responseType: 'text' }
            );
            const content = response.data || '';
            const tokenCount = estimateTokenCount(content);
            tokenCounts[filename] = tokenCount;
          } catch (error) {
            console.error(`Failed to fetch content for ${filename}:`, error);
            tokenCounts[filename] = 0; // Default to 0 on error
          }
        });

        await Promise.all(fetchPromises);
        setFileTokenCounts(tokenCounts);
      } catch (error) {
        console.error('Error fetching token counts:', error);
      } finally {
        setLoadingTokenCounts(false);
      }
    };

    fetchTokenCounts();
  }, [files, taskUuid, apiBaseUrl]);

  const handleDragStart = (e, filename) => {
    setDraggedFile(filename);
    
    // 构造稳定的拖拽数据
    const dragData = {
      filename,
      taskUuid,
      tokenCount: fileTokenCounts[filename] || 0,
      timestamp: Date.now()
    };
    
    // 设置多种格式的拖拽数据以提高兼容性
    e.dataTransfer.setData('text/plain', filename);
    e.dataTransfer.setData('application/markdown-file', JSON.stringify(dragData));
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';
    
    // 创建自定义拖拽图片
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-ghost';
    dragImage.style.cssText = `
      position: absolute;
      top: -1000px;
      left: -1000px;
      padding: 8px 12px;
      background: #3b82f6;
      color: white;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
    `;
    dragImage.textContent = `📄 ${filename}`;
    document.body.appendChild(dragImage);
    
    // 设置拖拽图片
    e.dataTransfer.setDragImage(dragImage, 10, 10);
    
    // 延迟清理拖拽图片
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragEnd = () => {
    setDraggedFile(null);
  };

  if (!files || files.length === 0) {
    return (
      <div className="border-t border-gray-200 pt-4">
        <h4 className="text-md font-medium mb-1 text-gray-700">Markdown Documents</h4>
        <p className="text-gray-500 text-sm italic">没有找到 Markdown 文件</p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-200 pt-4">
      <h4 className="text-md font-medium mb-2 text-gray-700 flex items-center gap-2">
        Markdown Documents
        {loadingTokenCounts && (
          <span className="loading loading-spinner loading-xs"></span>
        )}
        <span className="text-xs text-gray-500 font-normal">
          (可拖拽到AI对话区)
        </span>
      </h4>
      <ul className="list-none pl-0 space-y-1">
        {files.map(filename => {
          const tokenCount = fileTokenCounts[filename];
          const hasTokenCount = tokenCount !== undefined;
          const isDragging = draggedFile === filename;
          
          return (
            <li key={filename}>
              <button 
                onClick={() => onSelectFile(filename)}
                draggable={true}
                onDragStart={(e) => handleDragStart(e, filename)}
                onDragEnd={handleDragEnd}
                className={`text-sm text-left w-full px-2 py-2 rounded border transition-colors relative cursor-move ${
                  selectedFile === filename 
                    ? 'bg-primary text-primary-content font-semibold border-primary' 
                    : 'hover:bg-base-200 border-transparent hover:border-gray-200'
                } ${
                  isDragging ? 'opacity-50 scale-95' : ''
                }`}
                title={`点击选择 • 拖拽到AI对话区添加 • ${filename}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate flex-1">
                    {/* 拖拽图标 */}
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-3 w-3 text-gray-400 flex-shrink-0" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                    <div className="truncate" title={filename}>
                      {filename}
                    </div>
                  </div>
                  {hasTokenCount && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <span 
                        className={`text-xs font-medium px-1.5 py-0.5 rounded-full bg-white/20 ${
                          selectedFile === filename 
                            ? 'text-primary-content' 
                            : getTokenCountColorClass(tokenCount)
                        }`}
                        title={`约 ${tokenCount} tokens`}
                      >
                        {formatTokenCount(tokenCount)}
                      </span>
                      <span className="text-xs opacity-70">tokens</span>
                    </div>
                  )}
                </div>
                
                {/* 拖拽状态指示 */}
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded border-2 border-blue-500 border-dashed"></div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      
      {/* Token count summary */}
      {Object.keys(fileTokenCounts).length > 0 && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            总计: {formatTokenCount(Object.values(fileTokenCounts).reduce((sum, count) => sum + count, 0))} tokens
            ({files.length} 个文件)
          </div>
        </div>
      )}
    </div>
  );
}

export default MarkdownList; 