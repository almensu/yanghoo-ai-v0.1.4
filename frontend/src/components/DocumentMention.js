import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import axios from 'axios';
import { estimateTokenCount, formatTokenCount } from '../utils/tokenUtils';

const DocumentMention = ({ 
  inputText, 
  setInputText, 
  cursorPosition, 
  setCursorPosition,
  apiBaseUrl, 
  currentTaskUuid,
  onDocumentSelect,
  textareaRef 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionStart, setMentionStart] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [viewMode, setViewMode] = useState('categories'); // 'categories' | 'files' | 'prompt'
  const [selectedTaskUuid, setSelectedTaskUuid] = useState(currentTaskUuid);
  
  // 数据状态
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [promptFiles, setPromptFiles] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingPrompts, setLoadingPrompts] = useState(false);

  const dropdownRef = useRef(null);

  // 检测 "@" 输入
  useEffect(() => {
    const text = inputText;
    const position = cursorPosition;
    
    // 查找光标前最近的 "@" 符号
    const beforeCursor = text.slice(0, position);
    const lastAtIndex = beforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      // 检查 "@" 后面是否有空格（如果有空格则不触发）
      const afterAt = beforeCursor.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
        setMentionStart(lastAtIndex);
        setMentionQuery(afterAt);
        setIsVisible(true);
        setSelectedIndex(0);
        
        // 如果查询为空，默认显示分类视图
        if (afterAt === '') {
          setViewMode('categories');
          setSelectedTaskUuid(currentTaskUuid);
        }
        return;
      }
    }
    
    setIsVisible(false);
  }, [inputText, cursorPosition, currentTaskUuid]);

  // 获取任务列表
  const fetchTasks = useCallback(async () => {
    if (!apiBaseUrl) return;
    
    setLoadingTasks(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks`);
      setTasks(response.data.tasks || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  }, [apiBaseUrl]);

  // 获取文档列表
  const fetchDocuments = useCallback(async (taskUuid) => {
    if (!apiBaseUrl || !taskUuid) return;
    
    setLoadingDocuments(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/documents`);
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Failed to fetch documents:', error);
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, [apiBaseUrl]);

  // 获取Prompt文件列表
  const fetchPromptFiles = useCallback(async () => {
    if (!apiBaseUrl) return;
    
    setLoadingPrompts(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/prompt-files`);
      setPromptFiles(response.data || []);
    } catch (error) {
      console.error('Failed to fetch prompt files:', error);
      setPromptFiles([]);
    } finally {
      setLoadingPrompts(false);
    }
  }, [apiBaseUrl]);

  // 当显示时获取数据
  useEffect(() => {
    if (isVisible) {
      if (viewMode === 'tasks') {
        fetchTasks();
      } else if (viewMode === 'files' && selectedTaskUuid) {
        fetchDocuments(selectedTaskUuid);
      } else if (viewMode === 'prompt') {
        fetchPromptFiles();
      }
    }
  }, [isVisible, viewMode, selectedTaskUuid, apiBaseUrl, fetchTasks, fetchDocuments, fetchPromptFiles]);

  // 处理选择
  const handleSelect = useCallback(async (option) => {
    if (option.type === 'category') {
      // 进入分类
      if (option.id === 'files') {
        setViewMode('files');
        setSelectedIndex(0);
        await fetchDocuments(selectedTaskUuid);
      } else if (option.id === 'prompt') {
        setViewMode('prompt');
        setSelectedIndex(0);
        await fetchPromptFiles();
      }
      return;
    }

    if (option.type === 'task') {
      // 选择了任务，切换到该任务的文档列表
      setSelectedTaskUuid(option.uuid);
      setViewMode('files');
      setMentionQuery('');
      setSelectedIndex(0);
      await fetchDocuments(option.uuid);
      return;
    }

    if (option.type === 'separator') return;

    // 选择了文档或prompt文件
    let documentRef;
    if (viewMode === 'prompt') {
      documentRef = `@prompt/${option.filename}`;
    } else {
      documentRef = `@${selectedTaskUuid}/${option.filename}`;
    }
    
    // 替换输入框中的 "@query" 为选中的文档引用
    const newText = inputText.slice(0, mentionStart) + documentRef + inputText.slice(cursorPosition);
    setInputText(newText);
    
    // 设置光标位置到插入文本的末尾
    const newCursorPosition = mentionStart + documentRef.length;
    setCursorPosition(newCursorPosition);
    
    // 聚焦回输入框并设置光标位置
    if (textareaRef.current) {
      textareaRef.current.focus();
      setTimeout(() => {
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
      }, 0);
    }

    // 通知父组件文档被选择
    if (onDocumentSelect) {
      try {
        let response;
        if (viewMode === 'prompt') {
          // 获取prompt文件内容
          response = await axios.get(`${apiBaseUrl}/api/prompt-files/${encodeURIComponent(option.filename)}`);
        } else {
          // 获取文档内容
          response = await axios.get(
            `${apiBaseUrl}/api/tasks/${selectedTaskUuid}/documents/${option.filename}/content`
          );
        }
        
        onDocumentSelect({
          filename: option.filename,
          taskUuid: viewMode === 'prompt' ? 'prompt' : selectedTaskUuid,
          content: response.data.content || response.data,
          reference: documentRef
        });
      } catch (error) {
        console.error('Failed to fetch document content:', error);
      }
    }

    setIsVisible(false);
  }, [inputText, setInputText, setCursorPosition, apiBaseUrl, selectedTaskUuid, onDocumentSelect, textareaRef, mentionStart, cursorPosition, fetchDocuments, fetchPromptFiles, viewMode]);

  // 获取当前显示的选项列表
  const filteredOptions = useMemo(() => {
    if (viewMode === 'categories') {
      // 显示分类选项
      const categories = [
        { type: 'category', id: 'files', label: 'Files', description: '当前任务的文档' },
        { type: 'category', id: 'prompt', label: 'Prompt', description: 'Prompt模板文件' }
      ];
      
      // 根据查询过滤
      if (mentionQuery) {
        return categories.filter(cat => 
          cat.label.toLowerCase().includes(mentionQuery.toLowerCase())
        );
      }
      
      return categories;
    } else if (viewMode === 'tasks') {
      return tasks.filter(task => 
        task.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        (task.title && task.title.toLowerCase().includes(mentionQuery.toLowerCase()))
      );
    } else if (viewMode === 'files') {
      return documents.filter(doc => 
        doc.filename.toLowerCase().includes(mentionQuery.toLowerCase())
      );
    } else if (viewMode === 'prompt') {
      return promptFiles.filter(file => 
        file.toLowerCase().includes(mentionQuery.toLowerCase())
      ).map(filename => ({ filename, type: 'prompt' }));
    }
    
    return [];
  }, [viewMode, tasks, documents, promptFiles, mentionQuery]);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isVisible) return;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(0, prev - 1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(filteredOptions.length - 1, prev + 1));
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredOptions[selectedIndex]) {
            handleSelect(filteredOptions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          if (viewMode === 'categories') {
            setIsVisible(false);
          } else {
            // 返回分类视图
            setViewMode('categories');
            setSelectedIndex(0);
          }
          break;
        case 'Tab':
          e.preventDefault();
          if (viewMode === 'files') {
            // Tab 切换到任务模式
            setViewMode('tasks');
            setSelectedIndex(0);
            fetchTasks();
          }
          break;
        default:
          break;
      }
    };

    if (isVisible) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isVisible, selectedIndex, filteredOptions, viewMode, fetchTasks, handleSelect]);

  // 计算下拉框位置
  const getDropdownPosition = () => {
    if (!textareaRef.current) return { top: 0, left: 0 };

    const textarea = textareaRef.current;
    const style = window.getComputedStyle(textarea);
    const fontSize = parseInt(style.fontSize);
    const lineHeight = parseInt(style.lineHeight) || fontSize * 1.2;

    // 计算到 "@" 符号的位置
    const beforeMention = inputText.slice(0, mentionStart);
    const lines = beforeMention.split('\n');
    const currentLine = lines.length - 1;
    const charInLine = lines[lines.length - 1].length;

    // 获取textarea和 @符号的视窗信息
    const rect = textarea.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const dropdownHeight = 300; // 最大高度
    const dropdownWidth = 320; // 下拉框宽度（w-80 = 320px）

    // 计算"@"符号的位置
    const atSymbolTop = rect.top + (currentLine * lineHeight);
    let left = rect.left + (charInLine * fontSize * 0.6);

    // 检查下方是否有足够空间
    const spaceBelow = viewportHeight - (atSymbolTop + lineHeight);
    const spaceAbove = atSymbolTop;

    // 优先放置在上方，如果上方空间不足且下方空间充足则放下方
    let top;
    if (spaceAbove >= dropdownHeight || (spaceAbove > spaceBelow && spaceAbove >= 200)) {
      // 放置在"@"符号上方
      top = atSymbolTop - dropdownHeight - 5;
    } else {
      // 放置在"@"符号下方
      top = atSymbolTop + lineHeight + 5;
    }

    // 确保不超出视窗边界
    top = Math.max(10, Math.min(top, viewportHeight - dropdownHeight - 10));
    left = Math.max(10, Math.min(left, viewportWidth - dropdownWidth - 10));

    return { top, left };
  };

  if (!isVisible || filteredOptions.length === 0) {
    return null;
  }

  const position = getDropdownPosition();

  return (
    <div
      ref={dropdownRef}
      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-w-sm w-80"
      style={{
        top: position.top,
        left: position.left,
        maxHeight: '300px'
      }}
    >
      {/* 头部 */}
      <div className="px-3 py-2 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-gray-700">
            {viewMode === 'categories' ? '选择类型' : 
             viewMode === 'tasks' ? '选择任务' : 
             viewMode === 'files' ? '选择文档' : 'Prompt模板'}
          </div>
          {viewMode !== 'categories' && (
            <button
              onClick={() => {
                setViewMode('categories');
                setSelectedIndex(0);
              }}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              返回
            </button>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          ↑↓ 选择 • Enter 确认 • {viewMode === 'categories' ? 'Esc 取消' : 'Esc 返回'}
        </div>
      </div>

      {/* 选项列表 */}
      <div className="max-h-64 overflow-y-auto">
        {(loadingTasks || loadingDocuments || loadingPrompts) ? (
          <div className="px-3 py-4 text-center text-gray-500">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              加载中...
            </div>
          </div>
        ) : (
          filteredOptions.map((option, index) => {
            const isSelected = index === selectedIndex;
            
            if (option.type === 'category') {
              return (
                <div
                  key={option.id}
                  className={`px-3 py-3 cursor-pointer flex items-center gap-3 ${
                    isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      option.id === 'files' ? 'bg-blue-100' : 'bg-purple-100'
                    }`}>
                      {option.id === 'files' ? (
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              );
            }

            if (option.type === 'task') {
              return (
                <div
                  key={option.uuid}
                  className={`px-3 py-2 cursor-pointer flex items-start gap-2 ${
                    isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {option.title || option.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      UUID: {option.uuid}
                    </div>
                  </div>
                </div>
              );
            }

            // 文档或prompt文件
            return (
              <div
                key={option.filename}
                className={`px-3 py-2 cursor-pointer flex items-start gap-2 ${
                  isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelect(option)}
              >
                <div className="flex-shrink-0 mt-1">
                  {viewMode === 'prompt' ? (
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {option.filename}
                  </div>
                  {viewMode === 'files' && option.lines && (
                    <div className="text-xs text-gray-500">
                      {option.lines} 行 • {formatTokenCount(estimateTokenCount(option.preview || ''))} tokens
                    </div>
                  )}
                  {viewMode === 'files' && option.preview && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {option.preview.split('\n')[0]}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 text-xs rounded ${
                    viewMode === 'prompt' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {viewMode === 'prompt' ? 'PROMPT' : 'MD'}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {!loadingTasks && !loadingDocuments && !loadingPrompts && filteredOptions.length === 0 && (
          <div className="px-3 py-4 text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-sm">未找到匹配的文件</div>
            <div className="text-xs text-gray-400 mt-1">
              尝试输入其他关键词
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentMention; 