import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Edit3, Trash2, ChevronUp, ChevronDown, 
         Check, X, Hash, Type, Code, List, Quote, Minus, Table, Image, 
         GripVertical, MoreHorizontal } from 'lucide-react';
import { BlockManager, MarkdownParser } from '../utils/blocks';
import MarkdownViewer from './MarkdownViewer';
import QuickCollector from './QuickCollector';

const BlockEditor = ({ 
  markdownContent = '', 
  onContentChange, 
  taskUuid, 
  apiBaseUrl,
  filename = null, // 当前编辑的文档文件名
  taskTitle = null, // 任务标题
  className = '' 
}) => {
  const [blockManager, setBlockManager] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selectedBlocks, setSelectedBlocks] = useState(new Set());
  const [editingBlock, setEditingBlock] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [hoveredBlock, setHoveredBlock] = useState(null);
  const textareaRef = useRef(null);

  // 自动调整textarea高度
  useEffect(() => {
    if (textareaRef.current && editingBlock) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }, [editContent, editingBlock]);

  // 拖拽状态
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // 初始化
  useEffect(() => {
    try {
      const manager = new BlockManager();
      if (markdownContent) {
        manager.loadFromMarkdown(markdownContent);
      }
      setBlockManager(manager);
      updateBlocks(manager);
    } catch (error) {
      console.error('Failed to initialize BlockManager:', error);
    }
  }, [markdownContent]);

  const updateBlocks = (manager = blockManager) => {
    if (manager) {
      setBlocks([...manager.getAllBlocks()]);
    }
  };

  // 保存更改
  const saveChanges = () => {
    if (blockManager && onContentChange) {
      const markdown = blockManager.toMarkdown();
      onContentChange(markdown);
    }
  };

  // 手柄点击选择块
  const handleHandleClick = (blockId, event) => {
    event.stopPropagation();
    
    if (event.ctrlKey || event.metaKey) {
      // 多选
      const newSelected = new Set(selectedBlocks);
      if (newSelected.has(blockId)) {
        newSelected.delete(blockId);
      } else {
        newSelected.add(blockId);
      }
      setSelectedBlocks(newSelected);
    } else {
      // 单选
      setSelectedBlocks(new Set([blockId]));
    }
  };

  // 文本区域点击 - 直接进入编辑模式
  const handleTextClick = (blockId, event) => {
    event.stopPropagation();
    // 清除块选择
    setSelectedBlocks(new Set());
    // 找到对应的块并进入编辑模式
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      startEditing(block);
    }
  };

  // 拖拽处理
  const handleDragStart = (e, block) => {
    setDraggedBlock(block);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
    
    // 设置拖拽数据，支持拖拽到项目篮
    const dragData = {
      type: 'block',
      source: 'block-editor',
      block: {
        id: block.id,
        content: block.content,
        type: block.type,
        taskUuid: taskUuid,
        taskTitle: taskTitle,
        filename: filename,
        blockIndex: blocks.findIndex(b => b.id === block.id) + 1, // 块在文档中的序号
        totalBlocks: blocks.length,
        timestamp: Date.now()
      }
    };
    
    e.dataTransfer.setData('text/plain', JSON.stringify(dragData));
    e.dataTransfer.setData('text/html', block.content);
  };

  const handleDragEnd = () => {
    setDraggedBlock(null);
    setDragOver(null);
    setIsDragging(false);
  };

  const handleDragOver = (e, targetBlock) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (draggedBlock && targetBlock && draggedBlock.id !== targetBlock.id) {
      setDragOver(targetBlock.id);
    }
  };

  const handleDrop = (e, targetBlock) => {
    e.preventDefault();
    
    if (!draggedBlock || !targetBlock || draggedBlock.id === targetBlock.id) {
      return;
    }

    const draggedIndex = blocks.findIndex(b => b.id === draggedBlock.id);
    const targetIndex = blocks.findIndex(b => b.id === targetBlock.id);

    if (draggedIndex !== -1 && targetIndex !== -1) {
      const rect = e.currentTarget.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const height = rect.height;
      const insertAfter = y > height / 2;

      let newPosition = targetIndex;
      if (insertAfter) {
        newPosition = targetIndex + 1;
      }

      if (draggedIndex < targetIndex && insertAfter) {
        newPosition = targetIndex;
      } else if (draggedIndex > targetIndex && !insertAfter) {
        newPosition = targetIndex;
      } else if (draggedIndex < targetIndex && !insertAfter) {
        newPosition = targetIndex - 1;
      }

      try {
        blockManager.moveBlock(draggedBlock.id, newPosition);
        updateBlocks();
        saveChanges();
      } catch (error) {
        console.error('Failed to move block:', error);
      }
    }

    setDraggedBlock(null);
    setDragOver(null);
    setIsDragging(false);
  };

  // 块操作
  const deleteBlock = (blockId) => {
    try {
      blockManager.deleteBlock(blockId);
      updateBlocks();
      setSelectedBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(blockId);
        return newSet;
      });
      saveChanges();
    } catch (error) {
      console.error('Failed to delete block:', error);
    }
  };

  // 编辑功能
  const startEditing = (block) => {
    setEditingBlock(block.id);
    setEditContent(block.content);
    // 不设置选中状态，保持编辑时无色块高亮
  };

  const saveEdit = () => {
    if (editingBlock && blockManager) {
      try {
        blockManager.updateBlock(editingBlock, { content: editContent });
        updateBlocks();
        setEditingBlock(null);
        setEditContent('');
        saveChanges();
      } catch (error) {
        console.error('Failed to save edit:', error);
      }
    }
  };

  const cancelEdit = () => {
    setEditingBlock(null);
    setEditContent('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      saveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  // 添加新块
  const addBlock = (type = 'paragraph', afterBlockId = null) => {
    if (!blockManager) return;

    const content = getDefaultContent(type);
    try {
      const newBlock = blockManager.createBlock(content, type);
      updateBlocks();
      saveChanges();
      
      // 自动开始编辑新块
      setTimeout(() => {
        startEditing(newBlock);
      }, 100);
    } catch (error) {
      console.error('Failed to add block:', error);
    }
  };

  const getDefaultContent = (type) => {
    const defaults = {
      paragraph: '输入文本...',
      heading: '# 标题',
      code: '```\n// 代码\n```',
      list: '- 列表项',
      quote: '> 引用',
      divider: '---',
      table: '| 列1 | 列2 |\n|-----|-----|\n| 内容 | 内容 |',
      image: '![图片描述](图片链接)'
    };
    return defaults[type] || '新内容';
  };

  // 渲染块内容
  const renderBlockContent = (block) => {
    if (editingBlock === block.id) {
      return (
        <div className="w-full">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border-none outline-none resize-none bg-transparent leading-relaxed"
            placeholder="输入内容..."
            autoFocus
            style={{ 
              minHeight: '1.5rem',
              height: 'auto',
              overflow: 'hidden'
            }}
            onInput={(e) => {
              // 自适应高度
              e.target.style.height = 'auto';
              e.target.style.height = e.target.scrollHeight + 'px';
            }}
          />
        </div>
      );
    }

    return (
      <div 
        className="w-full px-3 py-2 cursor-text min-h-[1.5rem] leading-relaxed"
        onClick={() => startEditing(block)}
      >
        {block.content ? (
          <MarkdownViewer 
            markdownContent={block.content} 
            className="markdown-viewer-clean"
          />
        ) : (
          <div className="text-gray-400 italic">空块 - 点击编辑</div>
        )}
      </div>
    );
  };

  // 渲染块操作菜单
  const renderBlockActions = (block) => {
    return (
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <QuickCollector
          block={block}
          taskUuid={taskUuid}
          taskTitle="当前文档" // 可以从props传入更准确的标题
          filename="document.md" // 可以从props传入实际文件名
          onCollected={(projectId, result) => {
            console.log(`Block ${block.id} collected to project ${projectId}`);
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            addBlock('paragraph');
          }}
          className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
          title="添加块"
        >
          <Plus size={14} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            deleteBlock(block.id);
          }}
          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
          title="删除"
        >
          <Trash2 size={14} />
        </button>
        <button
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded"
          title="更多"
        >
          <MoreHorizontal size={14} />
        </button>
      </div>
    );
  };

  // 点击空白区域取消选择
  const handleContainerClick = (e) => {
    // 检查点击的是否为空白区域（不是块元素）
    const isBlockElement = e.target.closest('[data-block-id]');
    const isToolbarElement = e.target.closest('.block-toolbar');
    const isAddButton = e.target.closest('button');
    
    if (!isBlockElement && !isToolbarElement && !isAddButton) {
      setSelectedBlocks(new Set());
      if (editingBlock) {
        saveEdit();
      }
    }
  };

  if (!blockManager) {
    return <div className="p-4">初始化中...</div>;
  }

  return (
    <div 
      className={`flex flex-col h-full bg-white ${className}`}
      onClick={handleContainerClick}
    >
      {/* 简化的工具栏 */}
      <div className="block-toolbar flex items-center justify-between px-6 py-3 border-b bg-white sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="font-medium text-gray-900">文档编辑器</h2>
          <div className="text-sm text-gray-500">
            {blocks.length} 个块
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => addBlock('paragraph')}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Plus size={16} />
            添加块
          </button>
        </div>
      </div>

      {/* 块列表 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {blocks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-4">
              <Type size={48} className="mx-auto mb-3" />
              <p className="text-lg">开始写作</p>
              <p className="text-sm">点击下方按钮创建第一个块</p>
            </div>
            <button
              onClick={() => addBlock('paragraph')}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              创建第一个块
            </button>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {blocks.map((block, index) => {
              const isSelected = selectedBlocks.has(block.id);
              const isBeingDragged = draggedBlock?.id === block.id;
              const isDragTarget = dragOver === block.id;
              const isHovered = hoveredBlock === block.id;
              
              return (
                                 <div
                   key={block.id}
                   data-block-id={block.id}
                   className={`
                     group relative transition-colors duration-150 rounded-lg
                     ${isSelected ? 'bg-blue-50 ring-2 ring-blue-200' : ''}
                     ${isBeingDragged ? 'opacity-50' : ''}
                     ${isDragTarget ? 'bg-gray-100' : ''}
                     mb-1
                   `}
                  onMouseEnter={() => setHoveredBlock(block.id)}
                  onMouseLeave={() => setHoveredBlock(null)}
                  onDragOver={(e) => handleDragOver(e, block)}
                  onDrop={(e) => handleDrop(e, block)}
                >
                  {/* 拖拽指示线 */}
                  {isDragTarget && (
                    <div className="absolute -top-0.5 left-0 right-0 h-0.5 bg-blue-400 rounded-full z-10"></div>
                  )}
                  
                  <div className="flex items-start">
                    {/* 左侧手柄区域 */}
                    <div className="flex items-center w-8 pt-3 justify-center">
                      {isHovered && (
                        <div
                          draggable={isSelected}
                          onDragStart={isSelected ? (e) => handleDragStart(e, block) : undefined}
                          onDragEnd={isSelected ? handleDragEnd : undefined}
                          onClick={(e) => handleHandleClick(block.id, e)}
                          className={`p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded transition-colors ${
                            isSelected ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                          }`}
                        >
                          <GripVertical size={14} />
                        </div>
                      )}
                    </div>

                    {/* 主要内容区域 */}
                    <div 
                      className="flex-1 min-w-0 cursor-text"
                      onClick={(e) => handleTextClick(block.id, e)}
                    >
                      {renderBlockContent(block)}
                    </div>

                    {/* 右侧操作区域 */}
                    <div className="flex items-start w-24 pt-3 justify-end pr-2">
                      {isSelected && renderBlockActions(block)}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* 底部添加区域 */}
            <div className="mt-8 pt-4 border-t border-gray-100">
              <button
                onClick={() => addBlock('paragraph')}
                className="w-full py-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-center"
              >
                <Plus size={20} className="mx-auto mb-1" />
                <div className="text-sm">点击添加新块</div>
              </button>
            </div>
          </div>
        )}
      </div>


    </div>
  );
};

export default BlockEditor; 