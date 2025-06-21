import React, { useState, useEffect, useRef, memo } from 'react';
import axios from 'axios';
import MarkdownViewer from './MarkdownViewer'; // Assuming MarkdownViewer is in the same directory
import { estimateTokenCount, formatTokenCount, getTokenCountColorClass } from '../utils/tokenUtils';

// Complete rewrite of thinking block handling
function AIChat({ markdownContent, apiBaseUrl, taskUuid }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamedContent, setCurrentStreamedContent] = useState('');
  const chatContainerRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [availableModels, setAvailableModels] = useState([
    { id: 'qwen3:0.6b', name: 'Ollama - qwen3:0.6b' },
    { id: 'qwen3:14b', name: 'Ollama - qwen3:14b' },
    { id: 'deepseek', name: 'DeepSeek AI' },
    //{ id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ]);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [rawResponse, setRawResponse] = useState(null);
  
  // New: Store thinking blocks outside of React state
  const thinkingBlocksRef = useRef(new Map());
  const thinkingContainerRef = useRef(new Map());

  // 文档选择相关状态
  const [availableFiles, setAvailableFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState(new Set());
  const [showFileDropdown, setShowFileDropdown] = useState(false);
  const [fileTokenCounts, setFileTokenCounts] = useState({});
  const [loadingFiles, setLoadingFiles] = useState(false);
  const dropdownRef = useRef(null);

  // 拖拽相关状态
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const chatAreaRef = useRef(null);

  useEffect(() => {
    setMessages([
      { role: 'system', content: '我可以帮您分析和讨论文档内容，请随时提问。' }
    ]);
  }, []);

  // 获取文件列表和token计数
  useEffect(() => {
    if (taskUuid && apiBaseUrl) {
      fetchMarkdownFiles();
    }
  }, [taskUuid, apiBaseUrl]);

  // 点击外部关闭下拉菜单 & ESC键处理
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFileDropdown(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowFileDropdown(false);
        setIsDragOver(false);
        setDragCounter(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const fetchMarkdownFiles = async () => {
    if (!taskUuid || !apiBaseUrl) return;
    
    setLoadingFiles(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/list`, {
        params: { extension: '.md' }
      });
      const files = response.data || [];
      setAvailableFiles(files);
      
      // 获取token计数
      const tokenCounts = {};
      const fetchPromises = files.map(async (filename) => {
        try {
          const encodedFilename = encodeURIComponent(filename);
          const response = await axios.get(
            `${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodedFilename}`,
            { responseType: 'text' }
          );
          const content = response.data || '';
          tokenCounts[filename] = estimateTokenCount(content);
        } catch (error) {
          console.error(`Failed to fetch content for ${filename}:`, error);
          tokenCounts[filename] = 0;
        }
      });
      await Promise.all(fetchPromises);
      setFileTokenCounts(tokenCounts);
    } catch (error) {
      console.error('Failed to fetch markdown files:', error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const toggleFileSelection = (filename) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(filename)) {
      newSelected.delete(filename);
    } else {
      newSelected.add(filename);
    }
    setSelectedFiles(newSelected);
  };

  const removeFile = (filename) => {
    const newSelected = new Set(selectedFiles);
    newSelected.delete(filename);
    setSelectedFiles(newSelected);
  };

  const selectAllFiles = () => {
    setSelectedFiles(new Set(availableFiles));
  };

  const clearAllFiles = () => {
    setSelectedFiles(new Set());
  };

  // 修复的拖拽事件处理
  const handleDragEnter = (e) => {
    e.preventDefault();
    
    // 检查是否是markdown文件拖拽
    if (e.dataTransfer.types.includes('application/markdown-file') || 
        e.dataTransfer.types.includes('text/plain')) {
      setDragCounter(prev => prev + 1);
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter <= 0) {
        setIsDragOver(false);
        return 0;
      }
      return newCounter;
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    // 立即重置拖拽状态
    setIsDragOver(false);
    setDragCounter(0);
    
    console.log('拖拽drop事件触发');
    
    try {
      // 尝试获取markdown文件数据
      let markdownFileData = e.dataTransfer.getData('application/markdown-file');
      console.log('获取到的拖拽数据:', markdownFileData);
      
      // 如果没有专用数据，尝试从文本中解析
      if (!markdownFileData) {
        const textData = e.dataTransfer.getData('text/plain');
        console.log('文本数据:', textData);
        if (textData && textData.endsWith('.md')) {
          // 简单构造文件信息
          markdownFileData = JSON.stringify({
            filename: textData,
            taskUuid: taskUuid,
            tokenCount: 0
          });
        }
      }
      
      if (markdownFileData) {
        const fileInfo = JSON.parse(markdownFileData);
        const filename = fileInfo.filename;
        console.log('解析出的文件名:', filename);
        
        if (filename) {
          // 添加文件到选择列表
          if (!selectedFiles.has(filename)) {
            const newSelected = new Set(selectedFiles);
            newSelected.add(filename);
            setSelectedFiles(newSelected);
            console.log('文件添加成功:', filename);
            
            // 显示成功提示
            showDropSuccessMessage(filename);
          } else {
            console.log('文件已存在:', filename);
            // 如果文件已存在，显示提示
            showFileAlreadyAddedMessage(filename);
          }
        }
      } else {
        // 拖拽失败提示
        console.warn('未识别到有效的markdown文件');
        showDropErrorMessage('未识别到有效的markdown文件');
      }
    } catch (error) {
      console.error('处理拖拽文件失败:', error);
      showDropErrorMessage('拖拽处理失败，请重试');
    }
  };

  const showDropSuccessMessage = (filename) => {
    // 创建临时提示消息
    const tempMessage = {
      role: 'system',
      content: `✅ 已添加文档: ${filename}`,
      id: `drop-success-${Date.now()}`,
      isTemporary: true,
      type: 'success'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    // 3秒后移除提示消息
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }, 3000);
  };

  const showFileAlreadyAddedMessage = (filename) => {
    const tempMessage = {
      role: 'system',
      content: `ℹ️ 文档 ${filename} 已在选择列表中`,
      id: `already-added-${Date.now()}`,
      isTemporary: true,
      type: 'info'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }, 2000);
  };

  const showDropErrorMessage = (message) => {
    const tempMessage = {
      role: 'system',
      content: `❌ ${message}`,
      id: `drop-error-${Date.now()}`,
      isTemporary: true,
      type: 'error'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }, 3000);
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamedContent]);

  // 创建独立的思考块 DOM 元素并添加到容器
  const createThinkingBlock = (containerId, thinkingId, content) => {
    // 检查容器是否存在
    const container = document.getElementById(containerId);
    if (!container) return null;
    
    // 检查是否已经存在这个思考块
    const existingBlock = document.getElementById(thinkingId);
    if (existingBlock) {
      return existingBlock;
    }
    
    // 创建新的思考块
    const thinkingBlock = document.createElement('div');
    thinkingBlock.id = thinkingId;
    thinkingBlock.className = 'thinking-block mb-3 p-3 rounded-lg border text-gray-600 text-sm';
    thinkingBlock.style.opacity = '0.8';
    thinkingBlock.style.backgroundColor = 'rgba(243, 244, 246, 0.5)';
    thinkingBlock.style.borderColor = '#e5e7eb';
    thinkingBlock.style.position = 'relative';
    
    // 创建标题
    const titleDiv = document.createElement('div');
    titleDiv.className = 'flex items-center mb-1';
    
    const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    iconSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    iconSvg.setAttribute('fill', 'none');
    iconSvg.setAttribute('viewBox', '0 0 24 24');
    iconSvg.setAttribute('stroke-width', '1.5');
    iconSvg.setAttribute('stroke', 'currentColor');
    iconSvg.setAttribute('class', 'w-4 h-4 text-gray-400 mr-1');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('d', 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z');
    iconSvg.appendChild(path);
    
    const titleSpan = document.createElement('span');
    titleSpan.className = 'font-medium text-gray-500 opacity-75';
    titleSpan.textContent = '思考过程';
    
    titleDiv.appendChild(iconSvg);
    titleDiv.appendChild(titleSpan);
    
    // 创建内容
    const contentDiv = document.createElement('div');
    contentDiv.className = 'whitespace-pre-wrap text-gray-500';
    contentDiv.innerHTML = content.replace(/\n/g, '<br>');
    
    // 添加所有元素到思考块
    thinkingBlock.appendChild(titleDiv);
    thinkingBlock.appendChild(contentDiv);
    
    // 添加到容器
    container.appendChild(thinkingBlock);
    
    return thinkingBlock;
  };

  // 处理思考标签，将内容分为思考部分和正式回复部分
  const processThinking = (content, msgId) => {
    if (!content) return { thinkingIds: [], reply: null };
    
    // 创建/确保思考块容器存在
    if (!thinkingContainerRef.current.has(msgId)) {
      const containerId = `thinking-container-${msgId}`;
      thinkingContainerRef.current.set(msgId, containerId);
      
      // 延迟确保容器元素在DOM中
      setTimeout(() => {
        const containerElement = document.getElementById(containerId);
        if (containerElement) {
          // 清空容器
          containerElement.innerHTML = '';
        }
      }, 0);
    }
    
    // 匹配思考标签
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const thinkMatches = Array.from(content.matchAll(thinkRegex));
    
    if (thinkMatches.length > 0) {
      const containerId = thinkingContainerRef.current.get(msgId);
      const thinkingIds = [];
      
      // 提取所有思考内容并创建DOM元素
      thinkMatches.forEach((match, index) => {
        const thinkingContent = match[1].trim();
        const thinkingId = `thinking-${msgId}-${index}`;
        thinkingIds.push(thinkingId);
        
        if (!thinkingBlocksRef.current.has(thinkingId)) {
          thinkingBlocksRef.current.set(thinkingId, thinkingContent);
          
          // 延迟创建DOM元素，确保容器已存在
          setTimeout(() => {
            createThinkingBlock(containerId, thinkingId, thinkingContent);
          }, 10);
        }
      });
      
      // 替换所有思考标签获取纯回复内容
      let reply = content;
      thinkMatches.forEach(match => {
        reply = reply.replace(match[0], '');
      });
      
      return { thinkingIds, reply: reply.trim() };
    }
    
    // 如果没有匹配到思考标签，则全部内容视为正式回复
    return { thinkingIds: [], reply: content };
  };

  // 模拟流式接收响应 - 使用修改后的处理方法
  const streamResponse = async (content) => {
    setIsStreaming(true);
    setCurrentStreamedContent('');
    
    // 生成一个特定响应的消息ID
    const responseId = `resp-${Date.now()}`;
    
    // 流式显示的步长和延迟
    const chunkSize = 3; // 每次添加的字符数
    const delay = 15; // 毫秒
    
    // 流式显示内容
    let currentPosition = 0;
    let accumulatedContent = '';
    
    // 将消息ID添加到最后一条消息
    setMessages(prev => {
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === 'assistant') {
          lastMsg.id = responseId;
        }
      }
      return newMessages;
    });
    
    while (currentPosition < content.length) {
      const nextChunk = content.substring(
        currentPosition, 
        Math.min(currentPosition + chunkSize, content.length)
      );
      
      currentPosition += chunkSize;
      accumulatedContent += nextChunk;
      
      setCurrentStreamedContent(accumulatedContent);
      
      // 实时处理思考标签
      processThinking(accumulatedContent, responseId);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // 流式显示结束，最终更新消息
    const { thinkingIds, reply } = processThinking(content, responseId);
    
    setMessages(prev => {
      // 找到最后一条消息并更新内容
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === 'assistant') {
          lastMsg.content = content;
          lastMsg.id = responseId;
          lastMsg.thinkingIds = thinkingIds;
          lastMsg.reply = reply;
        }
      }
      return newMessages;
    });
    
    setIsStreaming(false);
    setCurrentStreamedContent('');
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = { role: 'user', content: inputText, id: `msg-${Date.now()}` };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setDebugInfo(null);
    setRawResponse(null);
    
    // 添加占位的AI回复消息
    const assistantMsgId = `msg-${Date.now() + 1}`;
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: '', 
      isPlaceholder: true, 
      id: assistantMsgId 
    }]);
    
    try {
      // 获取选中文件的内容
      let combinedDocument = markdownContent || "";
      
      if (selectedFiles.size > 0) {
        const fileContents = [];
        for (const filename of selectedFiles) {
          try {
            const encodedFilename = encodeURIComponent(filename);
            const response = await axios.get(
              `${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodedFilename}`,
              { responseType: 'text' }
            );
            fileContents.push(`\n\n=== ${filename} ===\n${response.data}`);
          } catch (error) {
            console.error(`Failed to fetch ${filename}:`, error);
            fileContents.push(`\n\n=== ${filename} (加载失败) ===\n[文件内容加载失败]`);
          }
        }
        combinedDocument += fileContents.join('\n');
      }
      
      const chatApiUrl = `${apiBaseUrl}/api/chat`;
      console.log("Sending chat request to:", chatApiUrl);
      
      const payload = {
        messages: [...messages, userMessage],
        document: combinedDocument || "No document provided.",
        model: selectedModel,
        language: 'zh'
      };
      
      console.log("Payload:", payload);

      const response = await axios.post(chatApiUrl, payload);
      
      console.log("Response received:", response.data);
      setRawResponse(response.data);
      
      if (response.data && response.data.content) {
        console.log("Content received:", response.data.content);
        const content = response.data.content;
        
        // 更新调试信息
        setDebugInfo({
          status: 'success',
          model: response.data.model_used,
          contentLength: content.length,
        });
        
        // 开始流式显示
        await streamResponse(content);
        
      } else {
        console.error('Response is missing content:', response.data);
        
        // 更新错误消息
        setMessages(prev => {
          const newMessages = [...prev];
          // 替换最后一条占位消息
          if (newMessages.length > 0 && newMessages[newMessages.length - 1].isPlaceholder) {
            newMessages[newMessages.length - 1] = { 
              role: 'assistant', 
              content: '抱歉，服务器返回了空响应。请检查您的请求和服务器日志。'
            };
          }
          return newMessages;
        });
        
        setDebugInfo({
          status: 'error',
          error: 'Empty response content',
          response: JSON.stringify(response.data)
        });
      }
    } catch (error) {
      console.error('聊天请求失败:', error.response ? error.response.data : error.message);
      
      let errorMessage = '抱歉，发生了错误: ';
      
      if (error.response) {
        errorMessage += `服务器错误 (${error.response.status}): ${error.response.data?.detail || error.response.data?.message || JSON.stringify(error.response.data) || error.message}`;
        setDebugInfo({
          status: 'error',
          httpStatus: error.response.status,
          error: error.response.data?.detail || error.message,
          data: JSON.stringify(error.response.data)
        });
      } else if (error.request) {
        errorMessage += `没有收到服务器响应，请检查服务器是否运行。`;
        setDebugInfo({
          status: 'error',
          error: 'No response from server',
          message: error.message
        });
      } else {
        errorMessage += error.message;
        setDebugInfo({
          status: 'error',
          error: 'Request setup error',
          message: error.message
        });
      }
      
      // 更新错误消息
      setMessages(prev => {
        const newMessages = [...prev];
        // 替换最后一条占位消息
        if (newMessages.length > 0 && newMessages[newMessages.length - 1].isPlaceholder) {
          newMessages[newMessages.length - 1] = { 
            role: 'assistant', 
            content: errorMessage
          };
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      setTimeout(scrollToBottom, 100);
    }
  };

  // 渲染消息内容
  const renderMessageContent = (msg, isUserMessage) => {
    const content = msg.content;

    // NEW: If it's an assistant's placeholder message and its content is initially empty
    // before streaming for it has begun, return null to avoid the "无内容显示或加载" message.
    // The UI will update once streaming starts or use other loading indicators.
    if (msg.role === 'assistant' && msg.isPlaceholder && !content && !isStreaming) {
      return null;
    }

    // ORIGINAL check: (This was line 239)
    // This will now primarily catch genuinely empty messages or errors,
    // rather than the transient placeholder state.
    if (!content && !isStreaming) return <div className="text-red-500 italic">无内容显示或加载。</div>;
    
    if (isUserMessage) {
      // 用户消息直接渲染
      return (
        <div className="text-gray-800">
          <div className="whitespace-pre-wrap">
            {content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
        </div>
      );
    } else {
      // AI助手消息 - 检查是否有思考内容
      const hasThinking = content.includes('<think>');
      
      // 如果是流式显示中，使用当前流式内容
      const displayContent = isStreaming && msg.isPlaceholder ? currentStreamedContent : content;
      const containerId = `thinking-container-${msg.id}`;
      
      // 对于正在流式显示的消息，需要实时处理思考标签
      if (isStreaming && msg.isPlaceholder) {
        processThinking(displayContent, msg.id);
      }
      
      // 提取回复内容
      let replyContent = '';
      if (msg.reply) {
        replyContent = msg.reply;
      } else if (hasThinking) {
        // 如果没有预处理的回复，但有思考标签，实时提取
        const processed = processThinking(displayContent, msg.id);
        replyContent = processed.reply;
      } else {
        replyContent = displayContent;
      }
      
      return (
        <>
          {/* 思考容器 - 将由 DOM 操作填充 */}
          <div 
            id={containerId}
            className="thinking-blocks-container"
          ></div>
          
          {/* 正式回复部分 */}
          {replyContent && (
            <div className="whitespace-pre-wrap text-gray-800">
              {replyContent.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < replyContent.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          )}
        </>
      );
    }
  };

  // 添加键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+D 切换调试信息显示
      if (e.altKey && e.key === 'd') {
        setShowDebug(prev => !prev);
      }
    };

    try {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        try {
          document.removeEventListener('keydown', handleKeyDown);
        } catch (error) {
          console.error("AIChat: Error removing keydown event listener:", error);
        }
      };
    } catch (error) {
      console.error("AIChat: Error adding keydown event listener:", error);
    }
  }, []);

  // 移除全局事件监听器
  useEffect(() => {
    return () => {
      // 在组件卸载时移除全局样式
      const styleElement = document.head.querySelector('style[data-aichat-styles]');
      if (styleElement) {
        document.head.removeChild(styleElement);
      }
    };
  }, []);

  // CSS样式
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-aichat-styles', 'true');
    style.textContent = `
      .text-xxs {
        font-size: 0.65rem;
      }
      
      .thinking-blocks-container {
        display: block;
      }
      
      .thinking-block {
        display: block;
        margin-bottom: 0.75rem;
        padding: 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.875rem;
        opacity: 0.8;
        background-color: rgba(243, 244, 246, 0.5);
        border: 1px solid #e5e7eb;
        position: relative;
        contain: content;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      try {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      } catch (error) {
        console.error("AIChat: Error removing style element:", error);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden relative aichat-container">
      {/* 顶部模型选择栏 - 增强版 */}
      <div className="p-3 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">AI模型:</span>
            <select 
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="select select-sm select-bordered focus:ring-2 focus:ring-blue-500 transition-all"
              disabled={isLoading || isStreaming}
            >
              {availableModels.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            {/* 紧凑的文档添加按钮 */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowFileDropdown(!showFileDropdown)}
                className={`relative p-2 rounded-full transition-all ${
                  selectedFiles.size > 0 
                    ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-md' 
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
                title={`添加文档 (已选${selectedFiles.size}个)`}
                disabled={isLoading || isStreaming}
              >
                {loadingFiles ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                
                {/* 文档数量指示器 */}
                {selectedFiles.size > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {selectedFiles.size}
                  </span>
                )}
              </button>
              
              {/* 文档选择下拉菜单 */}
              {showFileDropdown && (
                <div className="absolute top-full right-0 mt-1 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 aichat-dropdown">
                  <div className="p-3 border-b border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">选择文档</span>
                      <div className="flex gap-1">
                        <button
                          onClick={selectAllFiles}
                          className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          disabled={availableFiles.length === 0}
                        >
                          全选
                        </button>
                        <button
                          onClick={clearAllFiles}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          disabled={selectedFiles.size === 0}
                        >
                          清空
                        </button>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {availableFiles.length > 0 ? `共 ${availableFiles.length} 个文档可选` : '未找到文档'}
                    </div>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {availableFiles.length > 0 ? (
                      availableFiles.map(filename => (
                        <div 
                          key={filename} 
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                          onClick={() => toggleFileSelection(filename)}
                        >
                          <input
                            type="checkbox"
                            checked={selectedFiles.has(filename)}
                            onChange={() => {}} // 通过父div的onClick处理
                            className="checkbox checkbox-sm checkbox-primary"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate" title={filename}>
                              {filename}
                            </div>
                            {fileTokenCounts[filename] !== undefined && (
                              <div className="text-xs text-gray-500">
                                ~{formatTokenCount(fileTokenCounts[filename])} tokens
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 text-sm py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>没有找到markdown文件</div>
                        <div className="text-xs text-gray-400 mt-1">
                          或从右侧工作区拖拽文档到此处
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* 调试开关 */}
            <button 
              className="px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-400 hover:bg-gray-200"
              title="按Alt+D开关调试信息"
              onClick={() => setShowDebug(!showDebug)}
              style={{ opacity: 0.3 }}
            >
              {showDebug ? "隐藏调试" : "显示调试"}
            </button>
          </div>
        </div>
        
        {/* 状态显示 */}
        <div className="flex items-center justify-between text-xs mt-2">
          <div className="text-gray-500">
            {selectedFiles.size > 0 && (
              <span>已选择 {selectedFiles.size} 个文档作为上下文</span>
            )}
          </div>
          <div className="flex items-center">
            {(isLoading || isStreaming) ? (
              <div className="flex items-center text-indigo-600">
                <span className="loading loading-dots loading-xs mr-1"></span>
                {isStreaming ? "正在生成..." : "处理中..."}
              </div>
            ) : (
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
                <span className="text-gray-600">
                  {availableModels.find(m => m.id === selectedModel)?.name || selectedModel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 已选择文档展示区域 */}
      {selectedFiles.size > 0 && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              已选择 {selectedFiles.size} 个文档作为上下文
            </span>
            <span className="text-xs text-gray-500">
              (总计 ~{formatTokenCount(Array.from(selectedFiles).reduce((sum, filename) => sum + (fileTokenCounts[filename] || 0), 0))} tokens)
            </span>
          </div>
          
          {/* 文档标签列表 */}
          <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
            {Array.from(selectedFiles).map(filename => (
              <div 
                key={filename} 
                className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm group hover:bg-blue-200 transition-colors aichat-file-tag"
              >
                <span className="truncate max-w-32" title={filename}>
                  {filename}
                </span>
                <span className="text-xs opacity-75">
                  ~{formatTokenCount(fileTokenCounts[filename] || 0)}
                </span>
                <button
                  onClick={() => removeFile(filename)}
                  className="ml-1 text-blue-600 hover:text-blue-800 hover:bg-blue-300 rounded-full p-0.5 opacity-70 group-hover:opacity-100 transition-all"
                  title={`移除 ${filename}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 拖拽覆盖层 - 改进版 */}
      {isDragOver && (
        <div 
          className="absolute inset-0 bg-blue-500 bg-opacity-15 backdrop-blur-sm z-50 flex items-center justify-center"
          onClick={() => {
            setIsDragOver(false);
            setDragCounter(0);
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-8 border-2 border-blue-500 border-dashed transform scale-105 transition-all duration-200 ease-out">
            <div className="text-center">
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-blue-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-700 mb-2">
                释放以添加文档
              </div>
              <div className="text-sm text-blue-600 max-w-xs">
                文档将自动添加到对话上下文中
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* 调试信息面板 - 默认隐藏 */}
      {showDebug && debugInfo && (
        <div 
          className={`text-xs p-2 transition-all duration-300 ${
            debugInfo.status === 'success' 
              ? 'bg-green-50 text-green-700 border-b border-green-100' 
              : 'bg-red-50 text-red-700 border-b border-red-100'
          }`}
        >
          <div className="font-semibold">调试信息:</div>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}
      
      {/* 原始响应查看器 - 默认隐藏 */}
      {showDebug && rawResponse && (
        <div className="text-xs p-2 bg-gray-50 border-b border-gray-200 overflow-auto max-h-36">
          <details>
            <summary className="font-semibold cursor-pointer text-gray-700 hover:text-blue-600 transition-colors">
              查看原始响应
            </summary>
            <pre className="whitespace-pre-wrap mt-1 text-gray-700 p-2 rounded bg-gray-100">
              {JSON.stringify(rawResponse, null, 2)}
            </pre>
          </details>
        </div>
      )}
      
      {/* 聊天消息区 - 添加拖拽事件 */}
      <div 
        ref={(el) => {
          chatContainerRef.current = el;
          chatAreaRef.current = el;
        }}
        className="flex-grow overflow-y-auto p-4 space-y-4 relative"
        style={{ backgroundColor: '#ffffff' }}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {messages.filter(msg => msg.role !== 'system' || msg.isTemporary).map((msg, index) => (
          <div 
            key={msg.id || index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} ${
              msg.isTemporary ? 'animate-pulse' : ''
            }`}
          >
            {/* 系统消息样式 */}
            {msg.role === 'system' && msg.isTemporary && (
              <div className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                msg.type === 'success' 
                  ? 'bg-green-100 text-green-800' 
                  : msg.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {msg.type === 'success' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : msg.type === 'error' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {msg.content}
              </div>
            )}
            
            {/* AI助手消息 */}
            {msg.role === 'assistant' && (
              <>
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2 mt-1">
                  <span className="text-xs font-medium text-gray-600">AI</span>
                </div>
                <div 
                  className="relative max-w-3xl"
                  style={{ minWidth: '280px' }}
                >
                  {/* 角色标识 */}
                  <div className="text-xs font-medium mb-1 text-gray-600 flex items-center">
                    <span>Ai助手</span>
                    {isStreaming && msg.isPlaceholder && (
                      <span className="ml-2 inline-flex items-center">
                        <span className="loading loading-dots loading-xs text-blue-500"></span>
                      </span>
                    )}
                  </div>
                  
                  {/* 消息内容 */}
                  <div className="markdown-content break-words">
                    {renderMessageContent(msg, false)}
                  </div>
                </div>
              </>
            )}
            
            {/* 用户消息 */}
            {msg.role === 'user' && (
              <div className="relative max-w-3xl text-right">
                <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg">
                  <div className="markdown-content break-words">
                    {renderMessageContent(msg, true)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* 增强的欢迎信息 */}
        {messages.filter(msg => msg.role !== 'system' || msg.isTemporary).length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div className="text-xl font-semibold text-gray-400 mb-2">
                欢迎使用AI对话助手
              </div>
              <div className="text-sm text-gray-400 space-y-1">
                <div>请在下方输入您的问题或指令</div>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <div className="flex items-center gap-1 text-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span className="text-xs">点击加号添加文档</span>
                  </div>
                  <span className="text-gray-300">或</span>
                  <div className="flex items-center gap-1 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                    <span className="text-xs">拖拽文档到此处</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* 输入区域 */}
      <div className="border-t p-3 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex gap-2 items-center">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="按 Shift+Enter 换行，按 Enter 发送..."
            className="flex-grow p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 shadow-sm"
            style={{ minHeight: '60px' }}
            disabled={isLoading || isStreaming}
          />
          <button 
            onClick={sendMessage} 
            className="btn btn-primary h-12 w-12 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
            disabled={isLoading || isStreaming || !inputText.trim()}
          >
            {isLoading || isStreaming ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-1 text-center">
          使用{availableModels.find(m => m.id === selectedModel)?.name}进行回答
        </div>
      </div>
    </div>
  );
}

export default AIChat; 