import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import { projectManager } from '../utils/ProjectManager';
import { formatTokenCount } from '../utils/tokenUtils';
import { VirtualizedList } from '../hooks/useVirtualization';
import { useResponsive } from '../hooks/useResponsive';
import { 
  Search, 
  Play, 
  Folder, 
  FileText, 
  Hash, 
  Plus,
  Check,
  ChevronRight,
  ChevronDown,
  Video,
  Clock
} from 'lucide-react';

const CrossTaskBrowser = ({ 
  apiBaseUrl, 
  onBlockCollected,
  onDocumentCollected,
  className = '' 
}) => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState(new Set());
  const [selectedDocuments, setSelectedDocuments] = useState(new Set());
  
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDocuments, setExpandedDocuments] = useState(new Set());
  
  const [activeProject, setActiveProject] = useState(null);
  const { isMobile, isTablet } = useResponsive();

  // 加载数据
  useEffect(() => {
    if (apiBaseUrl) {
      loadTasks();
    }
    loadActiveProject();
  }, [apiBaseUrl]);

  // 优化的过滤块（使用useMemo缓存结果）
  const filteredBlocks = useMemo(() => {
    if (!searchTerm) return blocks;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return blocks.filter(block => 
      block.content.toLowerCase().includes(lowerSearchTerm) ||
      block.filename.toLowerCase().includes(lowerSearchTerm) ||
      block.taskTitle.toLowerCase().includes(lowerSearchTerm)
    );
  }, [blocks, searchTerm]);

  const loadActiveProject = () => {
    const active = projectManager.getActiveProject();
    setActiveProject(active);
  };

  const loadTasks = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTaskDocuments = async (taskUuid) => {
    setLoading(true);
    try {
      // 获取任务的文档列表
      const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/list`, {
        params: { extension: '.md' }
      });
      
      const documentList = response.data || [];
      const documentsWithContent = [];

      // 并行加载所有文档内容
      const loadPromises = documentList.map(async (filename) => {
        try {
          const contentResponse = await axios.get(
            `${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodeURIComponent(filename)}`,
            { responseType: 'text' }
          );
          
          const content = contentResponse.data || '';
          
          // 简单的块解析 - 按段落分割
          const blockList = parseContentToBlocks(content, filename);
          
          return {
            filename,
            content,
            blocks: blockList,
            tokenCount: estimateTokenCount(content)
          };
        } catch (error) {
          console.error(`Failed to load document ${filename}:`, error);
          return {
            filename,
            content: '',
            blocks: [],
            tokenCount: 0
          };
        }
      });

      const results = await Promise.all(loadPromises);
      setDocuments(results);

      // 合并所有块
      const allBlocks = [];
      results.forEach(doc => {
        doc.blocks.forEach(block => {
          allBlocks.push({
            ...block,
            taskUuid: taskUuid,
            taskTitle: selectedTask?.title || selectedTask?.name || 'Unknown Task',
            filename: doc.filename
          });
        });
      });
      setBlocks(allBlocks);

    } catch (error) {
      console.error('Failed to load task documents:', error);
    } finally {
      setLoading(false);
    }
  };

  // 简单的内容块解析
  const parseContentToBlocks = (content, filename) => {
    if (!content) return [];

    const blocks = [];
    const lines = content.split('\n');
    let currentBlock = '';
    let blockIndex = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // 如果是标题行或空行，结束当前块
      if (line.startsWith('#') || line === '') {
        if (currentBlock.trim()) {
          blocks.push({
            id: `${filename}-block-${blockIndex}`,
            content: currentBlock.trim(),
            type: 'paragraph',
            lineStart: Math.max(0, i - currentBlock.split('\n').length),
            lineEnd: i - 1
          });
          blockIndex++;
          currentBlock = '';
        }
        
        // 如果是标题，作为单独的块
        if (line.startsWith('#')) {
          blocks.push({
            id: `${filename}-block-${blockIndex}`,
            content: line,
            type: 'heading',
            lineStart: i,
            lineEnd: i
          });
          blockIndex++;
        }
      } else {
        currentBlock += (currentBlock ? '\n' : '') + lines[i];
      }
    }

    // 处理最后一个块
    if (currentBlock.trim()) {
      blocks.push({
        id: `${filename}-block-${blockIndex}`,
        content: currentBlock.trim(),
        type: 'paragraph',
        lineStart: Math.max(0, lines.length - currentBlock.split('\n').length),
        lineEnd: lines.length - 1
      });
    }

    return blocks.filter(block => block.content.length > 20); // 过滤太短的块
  };

  // 简单的token估算
  const estimateTokenCount = (text) => {
    if (!text) return 0;
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
    return Math.ceil(chineseChars * 1.5 + englishWords);
  };

  // 任务选择
  const handleTaskSelect = (task) => {
    setSelectedTask(task);
    setDocuments([]);
    setBlocks([]);
    setSelectedBlocks(new Set());
    setSelectedDocuments(new Set());
    setExpandedDocuments(new Set());
    loadTaskDocuments(task.uuid);
  };

  // 块选择切换
  const handleBlockToggle = (blockId) => {
    const newSelected = new Set(selectedBlocks);
    if (newSelected.has(blockId)) {
      newSelected.delete(blockId);
    } else {
      newSelected.add(blockId);
    }
    setSelectedBlocks(newSelected);
  };

  // 文档选择切换
  const handleDocumentToggle = (filename) => {
    const newSelected = new Set(selectedDocuments);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedDocuments(newSelected);
  };

  // 收集选中的块
  const handleCollectBlocks = () => {
    if (!activeProject || selectedBlocks.size === 0) return;

    selectedBlocks.forEach(blockId => {
      const block = blocks.find(b => b.id === blockId);
      if (block) {
        const blockData = {
          taskUuid: block.taskUuid,
          taskTitle: block.taskTitle,
          filename: block.filename,
          blockId: block.id,
          content: block.content
        };

        const result = projectManager.addBlock(activeProject.id, blockData);
        if (result && onBlockCollected) {
          onBlockCollected(activeProject.id, result);
        }
      }
    });

    setSelectedBlocks(new Set());
  };

  // 收集选中的文档
  const handleCollectDocuments = () => {
    if (!activeProject || selectedDocuments.size === 0) return;

    selectedDocuments.forEach(filename => {
      const doc = documents.find(d => d.filename === filename);
      if (doc) {
        const documentData = {
          taskUuid: selectedTask.uuid,
          taskTitle: selectedTask.title || selectedTask.name || 'Unknown Task',
          filename: doc.filename,
          content: doc.content
        };

        const result = projectManager.addDocument(activeProject.id, documentData);
        if (result && onDocumentCollected) {
          onDocumentCollected(activeProject.id, result);
        }
      }
    });

    setSelectedDocuments(new Set());
  };

  // filteredBlocks已在上面通过useMemo定义

  return (
    <div className={`flex flex-col h-full bg-white border border-gray-200 rounded-lg ${className}`}>
      
      {/* 头部 */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900 mb-2">跨任务内容浏览器</h3>
        
        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索内容..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* 当前项目提示 */}
        {activeProject && (
          <div className="mt-2 text-sm text-gray-600">
            收集到项目: <span className="font-medium text-blue-600">{activeProject.name}</span>
          </div>
        )}
      </div>

      <div className={`flex flex-1 overflow-hidden ${isMobile ? 'flex-col' : ''}`}>
        
        {/* 左侧任务列表 */}
        <div className={`${isMobile ? 'w-full h-48' : 'w-1/3'} border-r border-gray-200 overflow-y-auto`}>
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700">任务列表</h4>
          </div>
          
          {loading && !selectedTask ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              加载中...
            </div>
          ) : (
            <div className="p-2">
              {tasks.map(task => (
                <button
                  key={task.uuid}
                  onClick={() => handleTaskSelect(task)}
                  className={`w-full p-3 text-left rounded-lg mb-2 transition-colors ${
                    selectedTask?.uuid === task.uuid 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Video size={16} className="text-blue-500" />
                    <span className="font-medium text-gray-900 truncate">
                      {task.title || task.name || 'Untitled Task'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {task.uuid}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 右侧内容区域 */}
        <div className="flex-1 flex flex-col overflow-hidden">
          
          {selectedTask ? (
            <>
              {/* 文档和块选择区域 */}
              <div className="flex-1 overflow-y-auto">
                
                {/* 文档列表 */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <FileText size={14} />
                      文档 ({documents.length})
                    </h4>
                    {selectedDocuments.size > 0 && (
                      <button
                        onClick={handleCollectDocuments}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        收集 {selectedDocuments.size} 个文档
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    {documents.map(doc => (
                      <div key={doc.filename} className="border border-gray-200 rounded">
                        <div className="flex items-center gap-2 p-2">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.has(doc.filename)}
                            onChange={() => handleDocumentToggle(doc.filename)}
                            className="rounded"
                          />
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedDocuments);
                              if (newExpanded.has(doc.filename)) {
                                newExpanded.delete(doc.filename);
                              } else {
                                newExpanded.add(doc.filename);
                              }
                              setExpandedDocuments(newExpanded);
                            }}
                            className="flex items-center gap-1 flex-1 text-left"
                          >
                            {expandedDocuments.has(doc.filename) ? (
                              <ChevronDown size={14} />
                            ) : (
                              <ChevronRight size={14} />
                            )}
                            <span className="font-medium text-sm">{doc.filename}</span>
                            <span className="text-xs text-gray-500 ml-auto">
                              {formatTokenCount(doc.tokenCount)} tokens
                            </span>
                          </button>
                        </div>
                        
                        {/* 文档的块列表 */}
                        {expandedDocuments.has(doc.filename) && (
                          <div className="border-t border-gray-200 bg-gray-50 p-2">
                            {doc.blocks.map(block => {
                              const fullBlockId = `${doc.filename}-block-${doc.blocks.indexOf(block)}`;
                              return (
                                <div key={fullBlockId} className="flex items-start gap-2 p-2 hover:bg-white rounded">
                                  <input
                                    type="checkbox"
                                    checked={selectedBlocks.has(block.id)}
                                    onChange={() => handleBlockToggle(block.id)}
                                    className="rounded mt-1"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm text-gray-900 line-clamp-2">
                                      {block.content}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {block.type} • 行 {block.lineStart}-{block.lineEnd}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 所有块的平铺视图 */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <Hash size={14} />
                      所有内容块 ({filteredBlocks.length})
                    </h4>
                    {selectedBlocks.size > 0 && (
                      <button
                        onClick={handleCollectBlocks}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        收集 {selectedBlocks.size} 个块
                      </button>
                    )}
                  </div>
                  
                  {/* 使用虚拟化列表优化大量数据渲染 */}
                  {filteredBlocks.length > 50 ? (
                    <VirtualizedList
                      items={filteredBlocks}
                      itemHeight={120}
                      height={400}
                      renderItem={(block) => (
                        <div
                          className={`p-3 border rounded-lg transition-colors mx-2 my-1 ${
                            selectedBlocks.has(block.id) 
                              ? 'border-blue-300 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selectedBlocks.has(block.id)}
                              onChange={() => handleBlockToggle(block.id)}
                              className="rounded mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 mb-1">
                                {block.filename} • {block.type} • 行 {block.lineStart}-{block.lineEnd}
                              </div>
                              <div className="text-sm text-gray-900 line-clamp-3">
                                {block.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    />
                  ) : (
                    <div className="space-y-2">
                      {filteredBlocks.map(block => (
                        <div
                          key={block.id}
                          className={`p-3 border rounded-lg transition-colors ${
                            selectedBlocks.has(block.id) 
                              ? 'border-blue-300 bg-blue-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <input
                              type="checkbox"
                              checked={selectedBlocks.has(block.id)}
                              onChange={() => handleBlockToggle(block.id)}
                              className="rounded mt-1"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-gray-500 mb-1">
                                {block.filename} • {block.type} • 行 {block.lineStart}-{block.lineEnd}
                              </div>
                              <div className="text-sm text-gray-900">
                                {block.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Folder size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">选择一个任务</p>
                <p className="text-sm">从左侧选择任务来浏览其内容</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CrossTaskBrowser; 