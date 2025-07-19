import React, { useState, useRef, useEffect } from 'react';
import { blockManager, getBlock, searchBlocks, generateShortId } from '../utils/blocks';
import { ExternalLink, Search, ArrowUp } from 'lucide-react';

// 单个引用链接组件
export const BlockReference = ({ 
  blockId, 
  className = '', 
  onHover,
  onClick
}) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const previewRef = useRef(null);
  const linkRef = useRef(null);

  const handleMouseEnter = (e) => {
    const rect = e.target.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10
    });

    // 获取被引用块的内容
    const referencedBlock = getBlock(blockId);
    if (referencedBlock) {
      const preview = referencedBlock.content.length > 200 
        ? referencedBlock.content.substring(0, 200) + '...'
        : referencedBlock.content;
      setPreviewContent(preview);
    } else {
      setPreviewContent('块未找到');
    }

    setShowPreview(true);
    if (onHover) onHover(blockId, true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
    if (onHover) onHover(blockId, false);
  };

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick(blockId);
  };

  return (
    <>
      <span
        ref={linkRef}
        className={`block-reference inline-flex items-center gap-1 px-1 py-0.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 border border-blue-200 cursor-pointer transition-all ${className}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        title={`引用块: ${generateShortId(blockId)}`}
      >
        <ExternalLink size={12} />
        <span className="text-xs font-mono">#{generateShortId(blockId)}</span>
      </span>

      {/* 悬停预览 */}
      {showPreview && (
        <div
          ref={previewRef}
          className="fixed z-50 p-3 bg-white border border-gray-300 rounded-lg shadow-lg max-w-sm"
          style={{
            left: position.x - 100, // 居中对齐
            top: position.y - 10,
            transform: 'translateY(-100%)'
          }}
        >
          <div className="text-xs text-gray-500 mb-1">
            块预览 #{generateShortId(blockId)}
          </div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {previewContent}
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="w-2 h-2 bg-white border-r border-b border-gray-300 transform rotate-45"></div>
          </div>
        </div>
      )}
    </>
  );
};

// 引用自动补全组件
export const ReferenceAutocomplete = ({
  query,
  position,
  onSelect,
  onClose,
  maxResults = 10
}) => {
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const autocompleteRef = useRef(null);

  useEffect(() => {
    if (query.length >= 2) {
      const searchResults = searchBlocks(query, {}).slice(0, maxResults);
      setResults(searchResults);
      setSelectedIndex(0);
    } else {
      setResults([]);
    }
  }, [query, maxResults]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            onSelect(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex, onSelect, onClose]);

  if (results.length === 0) return null;

  return (
    <div
      ref={autocompleteRef}
      className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-lg min-w-80 max-w-md max-h-64 overflow-y-auto"
      style={{
        left: position.x,
        top: position.y + 20
      }}
    >
      <div className="p-2 border-b bg-gray-50 text-xs text-gray-600 flex items-center gap-1">
        <Search size={12} />
        搜索块: "{query}" ({results.length} 个结果)
      </div>
      
      <div className="py-1">
        {results.map((block, index) => (
          <div
            key={block.id}
            className={`px-3 py-2 cursor-pointer border-l-2 ${
              index === selectedIndex 
                ? 'bg-blue-50 border-blue-500' 
                : 'border-transparent hover:bg-gray-50'
            }`}
            onClick={() => onSelect(block)}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500">
                {block.type} #{generateShortId(block.id)}
              </span>
              <span className="text-xs text-gray-400">
                位置: {block.metadata.position}
              </span>
            </div>
            <div className="text-sm text-gray-800 line-clamp-2">
              {block.content.length > 100 
                ? block.content.substring(0, 100) + '...'
                : block.content}
            </div>
            {block.metadata.tags.length > 0 && (
              <div className="flex gap-1 mt-1">
                {block.metadata.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-xs bg-gray-100 px-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 border-t bg-gray-50 text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <ArrowUp size={12} />
          <span>↑↓ 选择, Enter 确认, Esc 取消</span>
        </div>
      </div>
    </div>
  );
};

// 反向链接面板组件
export const BacklinksPanel = ({ blockId, className = '' }) => {
  const [backlinks, setBacklinks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!blockId) return;

    setIsLoading(true);
    try {
      const backlinkIds = blockManager.getBacklinks(blockId);
      const backlinkBlocks = backlinkIds
        .map(id => getBlock(id))
        .filter(Boolean);
      setBacklinks(backlinkBlocks);
    } catch (error) {
      console.error('获取反向链接失败:', error);
      setBacklinks([]);
    } finally {
      setIsLoading(false);
    }
  }, [blockId]);

  if (!blockId) {
    return (
      <div className={`backlinks-panel p-3 text-gray-500 text-sm ${className}`}>
        请选择一个块查看反向链接
      </div>
    );
  }

  return (
    <div className={`backlinks-panel ${className}`}>
      <div className="p-3 border-b bg-gray-50">
        <h4 className="text-sm font-medium text-gray-700">
          反向链接 ({backlinks.length})
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          引用了块 #{generateShortId(blockId)} 的其他块
        </p>
      </div>

      <div className="max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            加载中...
          </div>
        ) : backlinks.length === 0 ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            暂无反向链接
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {backlinks.map(block => (
              <div 
                key={block.id}
                className="p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => {
                  // 可以添加导航到该块的逻辑
                  console.log('导航到块:', block.id);
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    {block.type} #{generateShortId(block.id)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(block.metadata.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-sm text-gray-800 line-clamp-2">
                  {block.content.length > 80 
                    ? block.content.substring(0, 80) + '...'
                    : block.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// 引用工具函数
export const parseContentWithReferences = (content, onReferenceClick, onReferenceHover) => {
  if (!content) return content;

  // 匹配 [[blockId]] 或 @{blockId} 模式
  const referencePattern = /(\[\[([^\]]+)\]\]|@\{([^}]+)\})/g;
  
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = referencePattern.exec(content)) !== null) {
    const [fullMatch, , bracketId, braceId] = match;
    const blockId = bracketId || braceId;
    const startIndex = match.index;

    // 添加引用前的文本
    if (startIndex > lastIndex) {
      parts.push(content.substring(lastIndex, startIndex));
    }

    // 添加引用组件
    parts.push(
      <BlockReference
        key={`ref-${blockId}-${startIndex}`}
        blockId={blockId}
        onHover={onReferenceHover}
        onClick={onReferenceClick}
      />
    );

    lastIndex = startIndex + fullMatch.length;
  }

  // 添加剩余文本
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex));
  }

  return parts.length > 1 ? parts : content;
};

export default BlockReference; 