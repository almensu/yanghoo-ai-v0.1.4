import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Grid, List, ChevronDown, Star, Copy, ExternalLink, Edit, Trash2, Tag, Clock, FileText, Video } from 'lucide-react';
import { ProjectManager } from '../utils/ProjectManager';
import MarkdownViewer from '../components/MarkdownViewer';
import { useToast } from '../components/Toast';

const projectManager = new ProjectManager();

const BlockCollectionPage = () => {
  const [allBlocks, setAllBlocks] = useState([]);
  const [filteredBlocks, setFilteredBlocks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [sortBy, setSortBy] = useState('collectTime');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedBlocks, setSelectedBlocks] = useState(new Set());
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const toast = useToast();

  // 加载所有项目中的 blocks
  useEffect(() => {
    loadAllBlocks();
  }, []);

  // 修改 loadAllBlocks 方法
  const loadAllBlocks = async () => {
    try {
      // 尝试从API加载所有块
      const response = await fetch('http://localhost:8000/api/blocks');
      
      if (response.ok) {
        const blocksData = await response.json();
        setAllBlocks(blocksData);
        setFilteredBlocks(blocksData);
        return;
      }
    } catch (error) {
      console.warn('从API加载块失败，回退到本地存储:', error);
    }
    
    // 如果API加载失败，回退到原来的本地存储方法
    const projects = projectManager.getAllProjects();
    const blocks = [];
    
    // 创建一个映射来存储文档信息
    const docInfoCache = new Map();
    
    // 为每个项目的 blocks 获取正确的文档信息
    for (const project of Object.values(projects)) {
      for (const block of project.selectedBlocks) {
        let enhancedBlock = {
          ...block,
          projectId: project.id,
          projectName: project.name
        };
        
        // 尝试获取正确的文档信息
        if (block.taskUuid && block.docId) {
          const cacheKey = `${block.taskUuid}:${block.docId}`;
          
          if (!docInfoCache.has(cacheKey)) {
            try {
              const response = await fetch(
                `http://localhost:8000/api/tasks/${block.taskUuid}/doc_files/${block.docId}/blocks`
              );
              
              if (response.ok) {
                const docData = await response.json();
                docInfoCache.set(cacheKey, {
                  displayName: docData.display_name || docData.filename,
                  filename: docData.filename,
                  docInfo: docData.doc_info
                });
              }
            } catch (error) {
              console.warn(`Failed to fetch doc info for ${cacheKey}:`, error);
            }
          }
          
          // 使用缓存的文档信息
          const cachedInfo = docInfoCache.get(cacheKey);
          if (cachedInfo) {
            enhancedBlock = {
              ...enhancedBlock,
              displayName: cachedInfo.displayName,
              filename: cachedInfo.filename,
              docInfo: cachedInfo.docInfo
            };
          }
        }
        
        blocks.push(enhancedBlock);
      }
    }
    
    setAllBlocks(blocks);
    setFilteredBlocks(blocks);
  };

  // 筛选和搜索逻辑
  useEffect(() => {
    let filtered = [...allBlocks];

    // 搜索过滤
    if (searchQuery) {
      filtered = filtered.filter(block => 
        block.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        block.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (block.filename && block.filename.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (block.displayName && block.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // 类型过滤
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(block => {
        switch (selectedFilter) {
          case 'heading': return block.type === 'heading' || block.content.startsWith('#');
          case 'code': return block.type === 'code' || block.content.includes('```');
          case 'paragraph': return block.type === 'paragraph';
          case 'recent': return new Date(block.collectTime) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          default: return true;
        }
      });
    }

    // 排序
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'collectTime':
          return new Date(b.collectTime) - new Date(a.collectTime);
        case 'taskTitle':
          return a.taskTitle.localeCompare(b.taskTitle);
        case 'content':
          return a.content.length - b.content.length;
        default:
          return 0;
      }
    });

    setFilteredBlocks(filtered);
  }, [allBlocks, searchQuery, selectedFilter, sortBy]);

  // 统计信息
  const stats = useMemo(() => {
    const total = allBlocks.length;
    const byType = allBlocks.reduce((acc, block) => {
      const type = block.type || 'paragraph';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
    
    const byProject = allBlocks.reduce((acc, block) => {
      acc[block.projectName] = (acc[block.projectName] || 0) + 1;
      return acc;
    }, {});

    return { total, byType, byProject };
  }, [allBlocks]);

  // 复制内容到剪贴板
  const handleCopy = async (content) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('内容已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      toast.error('复制失败，请重试');
    }
  };

  // 跳转到原文档
  const handleJumpToSource = (block) => {
    // 构建跳转URL，使用正确的文档名称
    const docId = block.displayName || block.filename || block.docId;
    const url = `/studio/${block.taskUuid}?doc=${encodeURIComponent(docId)}&block=${block.blockId}`;
    window.open(url, '_blank');
  };

  // 删除 block
  const handleDeleteBlock = (block) => {
    if (window.confirm('确定要删除这个 block 吗？')) {
      const success = projectManager.removeBlock(block.projectId, block.id);
      if (success) {
        loadAllBlocks();
        toast.success('Block 已删除');
      } else {
        toast.error('删除失败，请重试');
      }
    }
  };

  // 批量操作
  const handleBatchDelete = () => {
    if (selectedBlocks.size === 0) return;
    
    if (window.confirm(`确定要删除选中的 ${selectedBlocks.size} 个 blocks 吗？`)) {
      let successCount = 0;
      selectedBlocks.forEach(blockId => {
        const block = allBlocks.find(b => b.id === blockId);
        if (block) {
          const success = projectManager.removeBlock(block.projectId, block.id);
          if (success) successCount++;
        }
      });
      setSelectedBlocks(new Set());
      loadAllBlocks();
      
      if (successCount === selectedBlocks.size) {
        toast.success(`成功删除 ${successCount} 个 blocks`);
      } else {
        toast.warning(`删除了 ${successCount}/${selectedBlocks.size} 个 blocks`);
      }
    }
  };

  // 格式化时间戳
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const { start, end } = timestamp;
    const formatSeconds = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    return `${formatSeconds(start)}-${formatSeconds(end)}`;
  };

  // 导出功能
  const handleExportBlocks = (format = 'markdown') => {
    if (filteredBlocks.length === 0) {
      toast.warning('没有可导出的内容');
      return;
    }

    let content = '';
    const timestamp = new Date().toISOString().split('T')[0];

    switch (format) {
      case 'markdown':
        content = `# Block 收藏馆导出\n\n> 导出时间: ${new Date().toLocaleString()}\n> 总计: ${filteredBlocks.length} 个 blocks\n\n`;
        
        filteredBlocks.forEach((block, index) => {
          content += `## Block ${index + 1}: ${block.taskTitle}\n\n`;
          content += `**来源**: ${block.filename} (第${block.blockIndex}/${block.totalBlocks}块)\n`;
          content += `**项目**: ${block.projectName}\n`;
          content += `**收集时间**: ${new Date(block.collectTime).toLocaleString()}\n`;
          if (block.timestamp) {
            content += `**时间戳**: [${formatTime(block.timestamp)}]\n`;
          }
          content += `**类型**: ${block.type}\n\n`;
          content += `${block.content}\n\n---\n\n`;
        });
        break;
        
      case 'json':
        content = JSON.stringify({
          exportTime: new Date().toISOString(),
          totalBlocks: filteredBlocks.length,
          blocks: filteredBlocks
        }, null, 2);
        break;
        
      default:
        toast.error('不支持的导出格式');
        return;
    }

    // 下载文件
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `block-collection-${timestamp}.${format === 'json' ? 'json' : 'md'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`成功导出 ${filteredBlocks.length} 个 blocks`);
  };

  // 批量复制
  const handleBatchCopy = () => {
    if (selectedBlocks.size === 0) {
      toast.warning('请先选择要复制的 blocks');
      return;
    }

    const selectedBlocksData = Array.from(selectedBlocks)
      .map(blockId => allBlocks.find(b => b.id === blockId))
      .filter(Boolean);

    const content = selectedBlocksData
      .map(block => `${block.content}\n\n---\n`)
      .join('\n');

    navigator.clipboard.writeText(content).then(() => {
      toast.success(`已复制 ${selectedBlocks.size} 个 blocks 到剪贴板`);
    }).catch(() => {
      toast.error('复制失败，请重试');
    });
  };

  return (
    <div className="h-full flex bg-gray-50">
      {/* 左侧筛选面板 */}
      {showFilterPanel && (
        <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">筛选器</h3>
            
            {/* 类型筛选 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="all">全部</option>
                <option value="heading">标题</option>
                <option value="paragraph">段落</option>
                <option value="code">代码</option>
                <option value="recent">最近收集</option>
              </select>
            </div>

            {/* 排序选项 */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">排序方式</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="collectTime">收集时间</option>
                <option value="taskTitle">任务标题</option>
                <option value="content">内容长度</option>
              </select>
            </div>
          </div>

          {/* 统计信息 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-700 mb-3">统计信息</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <div>总计: {stats.total} 个 blocks</div>
              {Object.entries(stats.byType).map(([type, count]) => (
                <div key={type} className="flex justify-between">
                  <span>{type}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 项目分布 */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">项目分布</h4>
            <div className="space-y-1 text-sm text-gray-600">
              {Object.entries(stats.byProject).map(([project, count]) => (
                <div key={project} className="flex justify-between">
                  <span className="truncate">{project}:</span>
                  <span>{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 主内容区域 */}
      <div className="flex-1 flex flex-col">
        {/* 顶部工具栏 */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Block 收藏馆</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              >
                <Filter size={18} />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md"
              >
                {viewMode === 'grid' ? <List size={18} /> : <Grid size={18} />}
              </button>
            </div>
          </div>

          {/* 搜索和批量操作 */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="搜索 blocks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {selectedBlocks.size > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">已选择 {selectedBlocks.size} 个</span>
                <button
                  onClick={handleBatchDelete}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm"
                >
                  批量删除
                </button>
                <button
                  onClick={handleBatchCopy}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 text-sm"
                >
                  批量复制
                </button>
              </div>
            )}
            
            {/* 导出按钮 */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleExportBlocks('markdown')}
                className="px-3 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 text-sm"
              >
                导出 MD
              </button>
              <button
                onClick={() => handleExportBlocks('json')}
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 text-sm"
              >
                导出 JSON
              </button>
            </div>
          </div>
        </div>

        {/* Blocks 展示区域 */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredBlocks.length === 0 ? (
            <div className="text-center text-gray-500 mt-12">
              <FileText size={48} className="mx-auto mb-4 text-gray-300" />
              <p>没有找到匹配的 blocks</p>
              <p className="text-sm mt-2">尝试调整搜索条件或筛选器</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
              {filteredBlocks.map(block => (
                <BlockCard
                  key={block.id}
                  block={block}
                  viewMode={viewMode}
                  isSelected={selectedBlocks.has(block.id)}
                  onSelect={(selected) => {
                    const newSelected = new Set(selectedBlocks);
                    if (selected) {
                      newSelected.add(block.id);
                    } else {
                      newSelected.delete(block.id);
                    }
                    setSelectedBlocks(newSelected);
                  }}
                  onCopy={() => handleCopy(block.content)}
                  onJumpToSource={() => handleJumpToSource(block)}
                  onDelete={() => handleDeleteBlock(block)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Block 卡片组件
const BlockCard = ({ block, viewMode, isSelected, onSelect, onCopy, onJumpToSource, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const { start, end } = timestamp;
    const formatSeconds = (seconds) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}:${secs.toString().padStart(2, '0')}`;
    };
    return `${formatSeconds(start)}-${formatSeconds(end)}`;
  };

  const getTypeIcon = (type, content) => {
    if (type === 'heading' || content.startsWith('#')) return <Tag size={16} className="text-blue-500" />;
    if (type === 'code' || content.includes('```')) return <FileText size={16} className="text-green-500" />;
    return <FileText size={16} className="text-gray-500" />;
  };

  const truncateContent = (content, maxLength = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
      viewMode === 'list' ? 'p-4' : 'p-4'
    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* 卡片头部 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="rounded border-gray-300"
          />
          {getTypeIcon(block.type, block.content)}
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-800 truncate">
              {block.taskTitle}
            </div>
            <div className="text-xs text-gray-500 truncate">
              来自文档：{block.displayName || block.filename} • 第{block.blockIndex}/{block.totalBlocks}块
            </div>
          </div>
        </div>
        <Star size={16} className="text-yellow-400 flex-shrink-0" />
      </div>

      {/* 内容预览 */}
      <div className="mb-3">
        <div className={`text-sm text-gray-700 ${isExpanded ? '' : 'line-clamp-4'}`}>
          {isExpanded ? (
            <MarkdownViewer content={block.content} />
          ) : (
            truncateContent(block.content)
          )}
        </div>
        {block.content.length > 200 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        )}
      </div>

      {/* 时间戳 */}
      {block.timestamp && (
        <div className="flex items-center text-xs text-gray-500 mb-3">
          <Video size={12} className="mr-1" />
          [{formatTime(block.timestamp)}]
        </div>
      )}

      {/* 元信息 */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
        <div className="flex items-center space-x-2">
          <span>项目: {block.projectName}</span>
        </div>
        <div className="flex items-center">
          <Clock size={12} className="mr-1" />
          {new Date(block.collectTime).toLocaleDateString()}
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={onCopy}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            title="复制内容"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={onJumpToSource}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded"
            title="跳转到原文档"
          >
            <ExternalLink size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlockCollectionPage;