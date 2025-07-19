import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MarkdownEditor from './MarkdownEditor';
import MarkdownViewer from './MarkdownViewer';
import MarkdownWithTimestamps from './MarkdownWithTimestamps';
import BlockEditor from './BlockEditor'; // 新的块编辑器
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { FileText, Edit3, Eye, Save, Plus, X, Search } from 'lucide-react';

// Props:
// - taskUuid: The UUID of the current task
// - apiBaseUrl: The base URL for the backend API  
// - markdownContent: Optional fallback markdown content from parent
// - videoRef: Reference to the video element for timestamp navigation

function StudioWorkSpaceEnhanced({ taskUuid, apiBaseUrl, markdownContent, videoRef }) {
  // 状态管理
  const [markdownFiles, setMarkdownFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentMarkdownContent, setCurrentMarkdownContent] = useState(markdownContent || '');
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // 引用
  const selectedFileRef = useRef(null);

  // 获取文件列表
  const fetchFileList = async () => {
    if (!taskUuid) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/list?extension=.md`);
      const files = response.data;
      
      if (Array.isArray(files)) {
        setMarkdownFiles(files);
        
        // 如果没有选中文件且有文件列表，自动选择第一个
        if (!selectedFile && files.length > 0) {
          setSelectedFile(files[0]);
        }
      } else {
        setError('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch file list:', err);
      setError(`Failed to load file list: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 获取文件内容
  const fetchFileContent = async (fileName) => {
    if (!fileName || !taskUuid) return;
    
    setError(null);
    
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${fileName}`);
      setCurrentMarkdownContent(response.data);
    } catch (err) {
      console.error('Failed to fetch file content:', err);
      setError(`Failed to load file: ${err.message}`);
    }
  };

  // 保存文件内容
  const saveFileContent = async (fileName, content) => {
    if (!fileName || !taskUuid) return false;
    
    setIsSaving(true);
    
    try {
      await axios.post(`${apiBaseUrl}/api/tasks/${taskUuid}/files/${fileName}`, 
        content,
        { 
          headers: { 'Content-Type': 'text/plain' }
        }
      );
      return true;
    } catch (err) {
      console.error('Failed to save file:', err);
      setError(`Failed to save file: ${err.message}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 初始化加载
  useEffect(() => {
    fetchFileList();
  }, [taskUuid]);

  // 监听传入的markdownContent变化
  useEffect(() => {
    if (markdownContent && !selectedFile) {
      setCurrentMarkdownContent(markdownContent);
    }
  }, [markdownContent, selectedFile]);

  // 当选中文件改变时加载内容
  useEffect(() => {
    if (selectedFile && selectedFile !== selectedFileRef.current) {
      selectedFileRef.current = selectedFile;
      fetchFileContent(selectedFile);
    }
  }, [selectedFile]);

  // 处理文件选择
  const handleSelectFile = (fileName) => {
    if (isEditing) {
      const shouldSwitch = window.confirm('您有未保存的更改。确定要切换文件吗？');
      if (!shouldSwitch) return;
      setIsEditing(false);
    }
    setSelectedFile(fileName);
  };

  // 别名函数
  const handleFileSelect = handleSelectFile;

  // 处理内容更改
  const handleContentChange = (newContent) => {
    setCurrentMarkdownContent(newContent);
  };

  // 处理保存编辑
  const handleSaveEdit = async () => {
    if (!selectedFile) return;
    
    const success = await saveFileContent(selectedFile, currentMarkdownContent);
    if (success) {
      setIsEditing(false);
    }
  };

  // 处理保存新文件
  const handleSaveNew = async () => {
    if (!newFileName.trim()) return;
    
    const fileName = newFileName.endsWith('.md') ? newFileName : `${newFileName}.md`;
    const success = await saveFileContent(fileName, currentMarkdownContent);
    
    if (success) {
      setIsCreatingNew(false);
      setNewFileName('');
      setSelectedFile(fileName);
      await fetchFileList(); // 刷新文件列表
    }
  };

  // 处理导出PDF
  const handleExportPDF = () => {
    // PDF导出逻辑保持不变...
  };

  // 渲染内容区域
  const renderContent = () => {
    if (isEditing) {
      return (
        <div className="h-full flex flex-col">
          <div className="flex-1 flex flex-col">
            <MarkdownEditor 
              key={`editor-${selectedFile || 'new'}`}
              value={currentMarkdownContent}
              onChange={handleContentChange}
            />
          </div>
          
          <div className="flex justify-end gap-2 mt-2 p-2 border-t bg-gray-50">
            <button
              onClick={() => isCreatingNew ? setIsCreatingNew(false) : setIsEditing(false)}
              className="flex items-center gap-1 px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
            >
              <X size={16} />
              取消
            </button>
            <button
              onClick={isCreatingNew ? handleSaveNew : handleSaveEdit}
              disabled={isSaving}
              className={`flex items-center gap-1 px-3 py-1 text-sm rounded ${
                isSaving 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              <Save size={16} />
              {isSaving ? '保存中...' : '保存'}
            </button>
          </div>
        </div>
      );
    }

    if (currentMarkdownContent) {
      return (
        <div className="h-full">
          <BlockEditor
            markdownContent={currentMarkdownContent}
            onContentChange={handleContentChange}
            taskUuid={taskUuid}
            apiBaseUrl={apiBaseUrl}
            className="h-full"
          />
        </div>
      );
    }

    return (
      <div className="flex-1 overflow-auto p-4 bg-gray-50 text-center">
        <h3 className="text-lg font-medium text-gray-600 mb-2">选择文件开始编辑</h3>
        <p className="text-sm text-gray-500">
          从左侧文件列表中选择一个Markdown文件来查看或编辑内容
        </p>
      </div>
    );
  };

  // 过滤文件列表
  const filteredFiles = markdownFiles.filter(file => 
    file.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* 文件列表侧边栏 */}
      <div className="flex h-full">
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Markdown 文档</h3>
              <button
                onClick={() => setIsCreatingNew(true)}
                className="flex items-center gap-1 px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus size={16} />
                新建
              </button>
            </div>
            
            {/* 搜索框 */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="搜索文件..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 文件列表 */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="ml-2">加载中...</span>
              </div>
            ) : error ? (
              <div className="p-4 text-red-600 text-sm">
                错误: {error}
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="p-4 text-gray-500 text-sm text-center">
                {markdownFiles.length === 0 ? '没有找到markdown文件' : '没有匹配的文件'}
              </div>
            ) : (
              <div className="p-2">
                {filteredFiles.map(file => (
                  <button
                    key={file}
                    onClick={() => handleFileSelect(file)}
                    className={`w-full text-left p-3 mb-1 rounded-lg text-sm transition-colors ${
                      selectedFile === file
                        ? 'bg-blue-100 text-blue-900 border border-blue-200'
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-gray-400" />
                      <span className="truncate">{file}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 主内容区域 */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* 编辑器内容 */}
          <div className="flex-1 overflow-hidden">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudioWorkSpaceEnhanced; 