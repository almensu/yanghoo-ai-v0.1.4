import React, { useState } from 'react';
import { Edit3, Save, X, AlertCircle } from 'lucide-react';

const DocumentRenameModal = ({ 
  isOpen, 
  onClose, 
  currentFilename, 
  taskUuid, 
  onRenameSuccess 
}) => {
  const [newFilename, setNewFilename] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen && currentFilename) {
      // 移除 .md 扩展名用于编辑
      const nameWithoutExt = currentFilename.replace('.md', '');
      setNewFilename(nameWithoutExt);
      setError('');
    }
  }, [isOpen, currentFilename]);

  const handleRename = async () => {
    if (!newFilename.trim()) {
      setError('文件名不能为空');
      return;
    }

    // 验证文件名
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(newFilename)) {
      setError('文件名包含无效字符: < > : " / \\ | ? *');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `http://localhost:8000/api/tasks/${taskUuid}/doc_files/${currentFilename}/rename`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            new_filename: newFilename
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || '重命名失败');
      }

      // 通知父组件重命名成功
      if (onRenameSuccess) {
        onRenameSuccess(data.old_filename, data.new_filename);
      }

      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleRename();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 max-w-90vw">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <Edit3 size={20} className="text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">重命名文档</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isLoading}
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              当前文件名
            </label>
            <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded border">
              {currentFilename}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新文件名
            </label>
            <input
              type="text"
              value={newFilename}
              onChange={(e) => setNewFilename(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="输入新的文件名..."
              disabled={isLoading}
              autoFocus
            />
            <div className="text-xs text-gray-500 mt-1">
              将自动添加 .md 扩展名
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center space-x-2">
                <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* 提示信息 */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm text-blue-700">
              <strong>注意：</strong>
              <ul className="mt-1 space-y-1 text-xs">
                <li>• 重命名会同时更新文件系统和 metadata 记录</li>
                <li>• 已收集到项目中的 blocks 会自动更新引用</li>
                <li>• 文件名不能包含特殊字符</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isLoading}
          >
            取消
          </button>
          <button
            onClick={handleRename}
            disabled={isLoading || !newFilename.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>重命名中...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>确认重命名</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentRenameModal; 