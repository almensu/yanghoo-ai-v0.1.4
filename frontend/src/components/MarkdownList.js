import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { estimateTokenCount, formatTokenCount, getTokenCountColorClass } from '../utils/tokenUtils';

// Props:
// - files: Array of markdown filenames (strings)
// - selectedFile: The currently selected filename (string)
// - onSelectFile: Function to call when a file is clicked (passes filename)
// - onFileDeleted: Function to call when a file is deleted (passes filename)
// - onFileRenamed: Function to call when a file is renamed (passes old and new filename)
// - taskUuid: UUID of the current task for fetching file contents
// - apiBaseUrl: Base URL for API calls

function MarkdownList({ files, selectedFile, onSelectFile, onFileDeleted, onFileRenamed, taskUuid, apiBaseUrl }) {
  const [fileTokenCounts, setFileTokenCounts] = useState({});
  const [loadingTokenCounts, setLoadingTokenCounts] = useState(false);
  const [draggedFile, setDraggedFile] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(null);

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
    console.log(`开始拖拽文件: ${filename}`);
    setDraggedFile(filename);
    const safeFilename = String(filename);
    
    // 简化数据设置，只使用最可靠的 text/plain 格式
    e.dataTransfer.setData('text/plain', safeFilename);
    e.dataTransfer.effectAllowed = 'copy';
    
    // 创建自定义拖拽图片 (保持UI友好)
    const dragImage = document.createElement('div');
    dragImage.className = 'drag-ghost';
    dragImage.style.cssText = `
      position: absolute; top: -1000px; left: -1000px;
      padding: 8px 12px; background: #3b82f6; color: white;
      border-radius: 8px; font-size: 14px; font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 1000;
      pointer-events: none;
    `;
    dragImage.textContent = `📄 ${safeFilename}`;
    document.body.appendChild(dragImage);
    
    try {
      e.dataTransfer.setDragImage(dragImage, 10, 10);
    } catch (error) {
      console.warn('Failed to set drag image:', error);
    }
    
    // 立即清理拖拽图片
    setTimeout(() => {
      if (dragImage.parentNode) {
        document.body.removeChild(dragImage);
      }
    }, 0);
    
    // 添加调试信息
    console.log(`拖拽状态已设置: ${filename}, isDragging应该为true`);
  };

  const handleDragEnd = () => {
    console.log('拖拽结束，清理状态');
    setDraggedFile(null);
  };

  const handleEditClick = (filename, e) => {
    e.stopPropagation();
    setEditingFile(filename);
    // Remove .md extension for editing
    const titleWithoutExt = filename.endsWith('.md') ? filename.slice(0, -3) : filename;
    setEditingTitle(titleWithoutExt);
  };

  const handleSaveEdit = async (e) => {
    e.stopPropagation();
    if (!editingTitle.trim() || !editingFile) return;

    const newFilename = editingTitle.trim().endsWith('.md') ? editingTitle.trim() : `${editingTitle.trim()}.md`;
    
    if (newFilename === editingFile) {
      // No change, just cancel editing
      setEditingFile(null);
      setEditingTitle('');
      return;
    }

    setIsRenaming(true);
    try {
      await axios.put(
        `${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodeURIComponent(editingFile)}/rename`,
        { new_filename: newFilename }
      );
      
      // Notify parent component about the rename
      if (onFileRenamed) {
        onFileRenamed(editingFile, newFilename);
      }
      
      setEditingFile(null);
      setEditingTitle('');
    } catch (error) {
      console.error('Failed to rename file:', error);
      alert(`重命名失败: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleCancelEdit = (e) => {
    e.stopPropagation();
    setEditingFile(null);
    setEditingTitle('');
  };

  const handleDeleteClick = async (filename, e) => {
    e.stopPropagation();
    
    if (!window.confirm(`确定要删除文件 "${filename}" 吗？此操作不可撤销。`)) {
      return;
    }

    setIsDeleting(filename);
    try {
      await axios.delete(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodeURIComponent(filename)}`);
      
      // Notify parent component about the deletion
      if (onFileDeleted) {
        onFileDeleted(filename);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
      alert(`删除失败: ${error.response?.data?.detail || error.message}`);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit(e);
    } else if (e.key === 'Escape') {
      handleCancelEdit(e);
    }
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
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-md font-medium text-gray-700 flex items-center gap-2">
          Markdown Documents
          {loadingTokenCounts && (
            <span className="loading loading-spinner loading-xs"></span>
          )}
        </h4>
        <span className="text-xs text-gray-500">
          可拖拽到AI对话或项目篮
        </span>
      </div>
      <div className="grid gap-2">
        {files.map(filename => {
          const tokenCount = fileTokenCounts[filename];
          const hasTokenCount = tokenCount !== undefined;
          const isDragging = draggedFile === filename;
          const isEditing = editingFile === filename;
          const isCurrentlyDeleting = isDeleting === filename;
          
          // 调试信息
          if (isDragging) {
            console.log(`渲染拖拽状态: ${filename}, isDragging: ${isDragging}, draggedFile: ${draggedFile}`);
          }
          
          return (
            <div key={filename}>
              <div 
                className={`group relative p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                  selectedFile === filename 
                    ? 'bg-blue-50 border-blue-200 shadow-sm' 
                    : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                } ${
                  isDragging ? 'opacity-60 scale-95' : ''
                } ${
                  isCurrentlyDeleting ? 'opacity-50' : ''
                }`}
              >
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 focus:ring-primary text-gray-900"
                      placeholder="输入文件标题..."
                      autoFocus
                    />
                    <button
                      onClick={handleSaveEdit}
                      disabled={isRenaming}
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                      {isRenaming ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div 
                    className="flex items-start gap-3"
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, filename)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onSelectFile(filename)}
                  >
                    {/* 文档图标 */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className={`p-2 rounded-lg ${selectedFile === filename ? 'bg-blue-100' : 'bg-gray-100 group-hover:bg-gray-200'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>

                    {/* 文档信息 */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate mb-1">
                        {filename.replace('.md', '')}
                      </h4>
                      {hasTokenCount && (
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className={getTokenCountColorClass(tokenCount)}>
                            {formatTokenCount(tokenCount)} tokens
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* 操作按钮 */}
                    <div className="flex-shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(filename, e);
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="重命名"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(filename, e);
                        }}
                        disabled={isCurrentlyDeleting}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="删除"
                      >
                        {isCurrentlyDeleting ? (
                          <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* 拖拽状态指示 */}
                {isDragging && (
                  <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded border-2 border-blue-500 border-dashed z-10 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-700 font-semibold text-xs text-center">
                      <div>拖拽中...</div>
                      <div className="text-xs opacity-75 mt-1">可拖拽到AI对话或项目篮</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
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