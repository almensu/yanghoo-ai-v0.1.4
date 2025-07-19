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
  const [mode, setMode] = useState('documents'); // 'documents' | 'tasks'
  const [selectedTaskUuid, setSelectedTaskUuid] = useState(currentTaskUuid);
  
  // 数据状态
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);

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
        
        // 如果查询为空，默认显示当前任务的文档
        if (afterAt === '') {
          setMode('documents');
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

  // 当显示时获取数据
  useEffect(() => {
    if (isVisible) {
      if (mode === 'tasks') {
        fetchTasks();
      } else if (mode === 'documents' && selectedTaskUuid) {
        fetchDocuments(selectedTaskUuid);
      }
    }
  }, [isVisible, mode, selectedTaskUuid, apiBaseUrl, fetchTasks, fetchDocuments]);

    // 处理选择
  const handleSelect = useCallback(async (option) => {
    if (option.type === 'task') {
      // 选择了任务，切换到该任务的文档列表
      setSelectedTaskUuid(option.uuid);
      setMode('documents');
      setMentionQuery('');
      setSelectedIndex(0);
      await fetchDocuments(option.uuid);
      return;
    }

    if (option.type === 'separator') return;

    // 选择了文档
    const documentRef = `@${selectedTaskUuid}/${option.filename}`;
    
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
        // 获取文档内容
        const response = await axios.get(
          `${apiBaseUrl}/api/tasks/${selectedTaskUuid}/documents/${option.filename}/content`
        );
        onDocumentSelect({
          filename: option.filename,
          taskUuid: selectedTaskUuid,
          content: response.data.content,
          reference: documentRef
        });
      } catch (error) {
        console.error('Failed to fetch document content:', error);
      }
    }

    setIsVisible(false);
  }, [inputText, setInputText, setCursorPosition, apiBaseUrl, selectedTaskUuid, onDocumentSelect, textareaRef, mentionStart, cursorPosition, fetchDocuments]);

  // 过滤选项
  const filteredOptions = useMemo(() => {
    if (mode === 'tasks') {
      return tasks.filter(task => 
        task.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        (task.title && task.title.toLowerCase().includes(mentionQuery.toLowerCase()))
      );
    } else {
      const filtered = documents.filter(doc => 
        doc.filename.toLowerCase().includes(mentionQuery.toLowerCase())
      );
      
      // 如果在文档模式但查询匹配任务，添加切换选项
      const matchingTasks = tasks.filter(task => 
        task.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
        (task.title && task.title.toLowerCase().includes(mentionQuery.toLowerCase()))
      );
      
      if (matchingTasks.length > 0 && mentionQuery.length > 0) {
        return [
          ...filtered,
          { type: 'separator', label: '其他任务' },
          ...matchingTasks.map(task => ({ ...task, type: 'task' }))
        ];
      }
      
      return filtered;
    }
  }, [mode, tasks, documents, mentionQuery]);

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
          setIsVisible(false);
          break;
        case 'Tab':
          e.preventDefault();
          if (mode === 'documents') {
            // Tab 切换到任务模式
            setMode('tasks');
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
   }, [isVisible, selectedIndex, filteredOptions, mode, fetchTasks, handleSelect]);

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

    // 估算位置（简化版本）
    const rect = textarea.getBoundingClientRect();
    const top = rect.top + (currentLine * lineHeight) + lineHeight + 5;
    const left = rect.left + (charInLine * fontSize * 0.6);

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
            {mode === 'tasks' ? '选择任务' : `选择文档`}
          </div>
          <div className="text-xs text-gray-500">
            {mode === 'documents' && selectedTaskUuid && (
              <span>当前: {selectedTaskUuid.slice(0, 8)}...</span>
            )}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          ↑↓ 选择 • Enter 确认 • Tab 切换 • Esc 取消
        </div>
      </div>

      {/* 选项列表 */}
      <div className="max-h-64 overflow-y-auto">
        {loadingTasks || loadingDocuments ? (
          <div className="px-3 py-4 text-center text-gray-500">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
              加载中...
            </div>
          </div>
        ) : (
          filteredOptions.map((option, index) => {
            if (option.type === 'separator') {
              return (
                <div key={index} className="px-3 py-1 text-xs font-medium text-gray-500 bg-gray-100 border-t">
                  {option.label}
                </div>
              );
            }

            const isSelected = index === selectedIndex;
            const isTask = option.type === 'task';

            return (
              <div
                key={isTask ? option.uuid : option.filename}
                className={`px-3 py-2 cursor-pointer flex items-start gap-2 ${
                  isSelected ? 'bg-blue-50 border-l-2 border-blue-500' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleSelect(option)}
              >
                {/* 图标 */}
                <div className="flex-shrink-0 mt-1">
                  {isTask ? (
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  )}
                </div>

                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {isTask ? (option.title || option.name) : option.filename}
                  </div>
                  
                  {isTask ? (
                    <div className="text-xs text-gray-500 truncate">
                      UUID: {option.uuid}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500">
                      {option.lines} 行 • {formatTokenCount(estimateTokenCount(option.preview || ''))} tokens
                    </div>
                  )}
                  
                  {!isTask && option.preview && (
                    <div className="text-xs text-gray-400 mt-1 truncate">
                      {option.preview.split('\n')[0]}
                    </div>
                  )}
                </div>

                {/* 类型标识 */}
                <div className="flex-shrink-0">
                  <span className={`px-2 py-1 text-xs rounded ${
                    isTask ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {isTask ? '任务' : 'MD'}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {!loadingTasks && !loadingDocuments && filteredOptions.length === 0 && (
          <div className="px-3 py-4 text-center text-gray-500">
            <svg className="w-8 h-8 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div className="text-sm">未找到匹配的{mode === 'tasks' ? '任务' : '文档'}</div>
            <div className="text-xs text-gray-400 mt-1">
              {mode === 'documents' ? '按 Tab 切换到任务搜索' : '尝试输入其他关键词'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentMention; 