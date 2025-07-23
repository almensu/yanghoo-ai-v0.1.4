import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { estimateTokenCount, formatTokenCount } from '../utils/tokenUtils';
import { Copy, Save } from 'lucide-react';
import DocumentMention from './DocumentMention';
import ProjectBubble from './ProjectBubble';

// 格式化时间戳的工具函数
const formatTime = (seconds) => {
  if (!seconds) return '00:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// 复制到剪贴板功能
const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

// 保存回复功能
const saveReply = async (content, taskUuid, apiBaseUrl) => {
  if (!taskUuid || !apiBaseUrl) {
    console.error('Missing taskUuid or apiBaseUrl');
    return false;
  }
  
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${timestamp}.md`;
    
    await axios.post(
      `${apiBaseUrl}/api/tasks/${taskUuid}/files/${filename}`,
      content,
      {
        headers: {
          'Content-Type': 'text/plain',
        },
      }
    );
    return true;
  } catch (error) {
    console.error('Failed to save reply:', error);
    return false;
  }
};

// Complete rewrite of thinking block handling
function AIChat({ markdownContent, apiBaseUrl, taskUuid }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamedContent, setCurrentStreamedContent] = useState('');
  const [copyStatus, setCopyStatus] = useState({});
  const [saveStatus, setSaveStatus] = useState({});

  // 处理复制功能
  const handleCopy = async (content, messageId) => {
    const success = await copyToClipboard(content);
    setCopyStatus(prev => ({ ...prev, [messageId]: success ? 'copied' : 'failed' }));
    setTimeout(() => {
      setCopyStatus(prev => ({ ...prev, [messageId]: null }));
    }, 2000);
  };

  // 处理保存功能
  const handleSave = async (content, messageId) => {
    setSaveStatus(prev => ({ ...prev, [messageId]: 'saving' }));
    const success = await saveReply(content, taskUuid, apiBaseUrl);
    setSaveStatus(prev => ({ ...prev, [messageId]: success ? 'saved' : 'failed' }));
    setTimeout(() => {
      setSaveStatus(prev => ({ ...prev, [messageId]: null }));
    }, 2000);
  };
  const chatContainerRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [availableModels] = useState([
    { id: 'qwen3:0.6b', name: 'Ollama - qwen3:0.6b' },
    { id: 'qwen3:14b', name: 'Ollama - qwen3:14b' },
    { id: 'deepseek-r1:1.5b', name: 'Ollama - deepseek-r1:1.5b' },
    { id: 'deepseek-r1:8b', name: 'Ollama - deepseek-r1:8b' },
    { id: 'deepseek', name: 'DeepSeek AI' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
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
  const [loadingFileContents, setLoadingFileContents] = useState(false); // 加载文件内容的状态
  const dropdownRef = useRef(null);

  // 拖拽相关状态
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const chatAreaRef = useRef(null);

  // "@" 文档提及功能相关状态
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef(null);
  const [mentionedDocuments, setMentionedDocuments] = useState(new Map());

  // 项目相关状态
  const [projectContext, setProjectContext] = useState(null);

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
      // 1. 获取任务相关的markdown文件
      const taskFilesResponse = await axios.get(`${apiBaseUrl}/api/tasks/${taskUuid}/files/list`, {
        params: { extension: '.md' }
      });
      const taskFiles = (taskFilesResponse.data || []).map(filename => ({
        filename,
        type: 'task',
        displayName: filename,
        category: '任务文档'
      }));
      
      // 2. 获取prompt文件
      let promptFiles = [];
      try {
        const promptResponse = await axios.get(`${apiBaseUrl}/api/prompt-files`);
        promptFiles = (promptResponse.data || []).map(filename => ({
          filename,
          type: 'prompt',
          displayName: filename.replace(/^prompt_/, '').replace(/\.md$/, ''),
          category: 'Prompt模板'
        }));
        console.log(`Loaded ${promptFiles.length} prompt files:`, promptFiles);
      } catch (error) {
        console.warn('Failed to fetch prompt files:', error);
        // 如果无法获取prompt文件，继续使用任务文件
      }
      
      // 3. 合并所有文件
      const allFiles = [...promptFiles, ...taskFiles]; // prompt文件优先显示
      setAvailableFiles(allFiles);
      
      // 4. 获取token计数
      const tokenCounts = {};
      const fetchPromises = allFiles.map(async (fileInfo) => {
        try {
          let response;
          if (fileInfo.type === 'task') {
            const encodedFilename = encodeURIComponent(fileInfo.filename);
            response = await axios.get(
              `${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodedFilename}`,
              { responseType: 'text' }
            );
          } else {
            // prompt文件
            response = await axios.get(
              `${apiBaseUrl}/api/prompt-files/${encodeURIComponent(fileInfo.filename)}`,
              { responseType: 'text' }
            );
          }
          const content = response.data || '';
          tokenCounts[fileInfo.filename] = estimateTokenCount(content);
        } catch (error) {
          console.error(`Failed to fetch content for ${fileInfo.filename}:`, error);
          tokenCounts[fileInfo.filename] = 0;
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
    e.stopPropagation();
    // 检查是否包含文件类型，以避免在拖拽文本等时触发
    if (e.dataTransfer.types.includes('Files') || e.dataTransfer.types.includes('text/plain')) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // 当鼠标离开整个组件时才隐藏覆盖层
    if (e.currentTarget.contains(e.relatedTarget)) {
      return;
    }
    setIsDragOver(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy'; // 显示为复制操作
  };

  const handleDrop = (e) => {
    e.preventDefault();
    
    // 立即重置拖拽状态
    setIsDragOver(false);
    setDragCounter(0);
    
    console.log('拖拽drop事件触发');
    
    try {
      // 简化数据读取，只使用最可靠的 text/plain 格式
      const filename = e.dataTransfer.getData('text/plain');
      console.log('从拖拽事件中获取的文件名:', filename);
      
      if (filename && filename.endsWith('.md')) {
        // 添加文件到选择列表
        if (!selectedFiles.has(filename)) {
          const newSelected = new Set(selectedFiles);
          newSelected.add(filename);
          setSelectedFiles(newSelected);
          console.log('文件添加成功:', filename);
          
          // 立即加载文件内容以验证
          fetchFileContent(filename)
            .then(content => {
              console.log(`文件 ${filename} 内容加载成功，长度: ${content.length}`);
              showDropSuccessMessage(`${filename} (${formatTokenCount(estimateTokenCount(content))} tokens)`);
            })
            .catch(err => {
              console.error(`加载文件 ${filename} 内容失败:`, err);
              showDropErrorMessage(`文件添加成功，但内容加载失败: ${filename}`);
            });
        } else {
          console.log('文件已存在:', filename);
          showFileAlreadyAddedMessage(filename);
        }
      } else {
        // 拖拽失败提示
        const message = filename 
          ? `文件 "${filename}" 不是有效的Markdown文件。`
          : '未识别到有效的Markdown文件，请确保拖拽的是.md文件';
        console.warn(message);
        showDropErrorMessage(message);
      }
    } catch (error) {
      console.error('处理拖拽文件失败:', error);
      showDropErrorMessage('拖拽处理失败，请重试');
    }
  };
  
  // 获取文件内容的辅助函数
  const fetchFileContent = async (filename) => {
    if (!taskUuid || !apiBaseUrl) {
      throw new Error('缺少taskUuid或apiBaseUrl');
    }
    
    // 查找文件信息
    const fileInfo = availableFiles.find(f => f.filename === filename);
    if (!fileInfo) {
      throw new Error(`File info not found for ${filename}`);
    }
    
    let response;
    if (fileInfo.type === 'task') {
      const encodedFilename = encodeURIComponent(filename);
      response = await axios.get(
        `${apiBaseUrl}/api/tasks/${taskUuid}/files/${encodedFilename}`,
        { responseType: 'text' }
      );
    } else {
      // prompt文件
      response = await axios.get(
        `${apiBaseUrl}/api/prompt-files/${encodeURIComponent(filename)}`,
        { responseType: 'text' }
      );
    }
    return response.data || '';
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

  // 处理文档提及选择
  const handleDocumentMention = (documentInfo) => {
    // 将文档内容存储到提及的文档映射中
    const newMentionedDocuments = new Map(mentionedDocuments);
    newMentionedDocuments.set(documentInfo.reference, {
      filename: documentInfo.filename,
      taskUuid: documentInfo.taskUuid,
      content: documentInfo.content,
      reference: documentInfo.reference
    });
    setMentionedDocuments(newMentionedDocuments);
    
    // 显示成功提示
    const tempMessage = {
      role: 'system',
      content: `📎 已引用文档: ${documentInfo.reference}`,
      id: `mention-success-${Date.now()}`,
      isTemporary: true,
      type: 'success'
    };
    
    setMessages(prev => [...prev, tempMessage]);
    
    setTimeout(() => {
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    }, 3000);
  };

  // 处理输入框光标位置变化
  const handleInputChange = (e) => {
    setInputText(e.target.value);
    setCursorPosition(e.target.selectionStart);
  };

  // 处理键盘事件，更新光标位置
  const handleKeyUp = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  const handleClick = (e) => {
    setCursorPosition(e.target.selectionStart);
  };

  // 处理项目发送到AI
  const handleProjectSendToAI = (project) => {
    setProjectContext(project);
    
    // 显示项目上下文提示
    const tempMessage = {
      role: 'system',
      content: `📦 已加载项目: ${project.name} (${project.selectedBlocks.length}个块 + ${project.selectedDocuments.length}个文档)`,
      id: `project-loaded-${Date.now()}`,
      isTemporary: true,
      type: 'success'
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
    console.log('Stream finished, updating final message with content:', content);
    const { thinkingIds, reply } = processThinking(content, responseId);
    
    setMessages(prev => {
      // 找到最后一条消息并更新内容
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1];
        console.log('Final message update - before:', { role: lastMsg.role, isPlaceholder: lastMsg.isPlaceholder, content: lastMsg.content });
        if (lastMsg.role === 'assistant') {
          lastMsg.content = content;
          lastMsg.id = responseId;
          lastMsg.thinkingIds = thinkingIds;
          lastMsg.reply = reply;
          delete lastMsg.isPlaceholder; // 移除占位符标记
          console.log('Final message update - after:', { role: lastMsg.role, isPlaceholder: lastMsg.isPlaceholder, content: lastMsg.content });
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
      
      // 处理项目上下文
      if (projectContext) {
        combinedDocument += `\n\n=== 项目上下文: ${projectContext.name} ===\n`;
        if (projectContext.description) {
          combinedDocument += `项目描述: ${projectContext.description}\n\n`;
        }
        
        // 添加收集的块
        if (projectContext.selectedBlocks.length > 0) {
          combinedDocument += `## 收集的内容块 (${projectContext.selectedBlocks.length}个)\n\n`;
          projectContext.selectedBlocks
            .sort((a, b) => a.order - b.order)
            .forEach((block, index) => {
              combinedDocument += `### 块 ${index + 1}: ${block.taskTitle || 'Unknown Task'} / ${block.filename}\n`;
              combinedDocument += `**文档位置**: 第${block.blockIndex}/${block.totalBlocks}块 | **块ID**: \`${block.blockId}\` | **任务ID**: \`${block.taskUuid}\`\n`;
              if (block.timestamp) {
                combinedDocument += `**时间戳**: [${formatTime(block.timestamp.start)}-${formatTime(block.timestamp.end)}]\n`;
              }
              combinedDocument += `**收集时间**: ${new Date(block.collectTime || block.addedAt).toLocaleString()}\n\n`;
              combinedDocument += `${block.content}\n\n`;
              combinedDocument += `---\n\n`;
            });
        }
        
        // 添加完整文档
        if (projectContext.selectedDocuments.length > 0) {
          combinedDocument += `## 完整文档 (${projectContext.selectedDocuments.length}个)\n\n`;
          projectContext.selectedDocuments
            .sort((a, b) => a.order - b.order)
            .forEach((doc, index) => {
              combinedDocument += `### 文档 ${index + 1}: ${doc.taskTitle || 'Unknown Task'} / ${doc.filename}\n`;
              combinedDocument += `${doc.content}\n\n`;
            });
        }
      }
      
      // 处理 "@" 提及的文档
      const mentionMatches = inputText.match(/@[\w-]+\/[^\s]+/g);
      const mentionedContent = [];
      if (mentionMatches) {
        for (const mention of mentionMatches) {
          const docInfo = mentionedDocuments.get(mention);
          if (docInfo) {
            mentionedContent.push(`\n\n=== 引用文档: ${mention} ===\n${docInfo.content}`);
          }
        }
      }
      
      // 如果有选中的文件，加载它们的内容
      if (selectedFiles.size > 0) {
        console.log(`开始加载 ${selectedFiles.size} 个选中文件的内容`);
        setLoadingFileContents(true); // 设置加载状态
        const fileContents = [];
        
        // 使用Promise.all并行加载所有文件内容
        const loadPromises = Array.from(selectedFiles).map(async (filename) => {
          try {
            console.log(`开始加载文件: ${filename}`);
            const content = await fetchFileContent(filename);
            const fileInfo = availableFiles.find(f => f.filename === filename);
            console.log(`文件 ${filename} 加载成功，内容长度: ${content.length}`);
            return { 
              filename, 
              content,
              success: true,
              type: fileInfo?.type || 'unknown',
              category: fileInfo?.category || '未知'
            };
          } catch (error) {
            console.error(`加载文件 ${filename} 失败:`, error);
            return { 
              filename, 
              content: '[文件内容加载失败]',
              success: false,
              type: 'unknown',
              category: '未知'
            };
          }
        });
        
        // 等待所有文件加载完成
        const results = await Promise.all(loadPromises);
        
        // 组合所有文件内容，按类型分组
        const taskContents = [];
        const promptContents = [];
        
        for (const result of results) {
          const { filename, content, success, type, category } = result;
          const header = success 
            ? `\n\n=== ${category}: ${filename} ===\n` 
            : `\n\n=== ${category}: ${filename} (加载失败) ===\n`;
          
          if (type === 'prompt') {
            promptContents.push(header + content);
          } else {
            taskContents.push(header + content);
          }
        }
        
        // 先添加prompt内容，再添加任务内容
        fileContents.push(...promptContents, ...taskContents);
        
        combinedDocument += fileContents.join('\n');
        console.log(`所有文件内容加载完成，总长度: ${combinedDocument.length}`);
        setLoadingFileContents(false); // 重置加载状态
      }
      
      // 添加 "@" 提及的文档内容
      if (mentionedContent.length > 0) {
        combinedDocument += mentionedContent.join('\n');
        console.log(`添加了 ${mentionedContent.length} 个提及的文档`);
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
            const lastMessage = newMessages[newMessages.length - 1];
            newMessages[newMessages.length - 1] = { 
              role: 'assistant', 
              content: '抱歉，服务器返回了空响应。请检查您的请求和服务器日志。',
              id: lastMessage.id
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
      setLoadingFileContents(false); // 确保错误时也重置加载状态
      
      let errorMessage = '抱歉，发生了错误: ';
      let showModelSwitchSuggestion = false;
      
      if (error.response) {
        const errorDetail = error.response.data?.detail || error.response.data?.message || error.message;
        errorMessage += `服务器错误 (${error.response.status}): ${errorDetail}`;
        
        // 检查是否是 Gemini 过载错误
        if (error.response.status === 503 && 
            (errorDetail.includes('过载') || errorDetail.includes('overloaded') || 
             errorDetail.includes('UNAVAILABLE') || errorDetail.includes('Gemini'))) {
          showModelSwitchSuggestion = true;
          errorMessage += '\n\n💡 建议解决方案：\n1. 等待 1-2 分钟后重试\n2. 减少文档内容长度\n3. 切换到其他模型（如 DeepSeek 或 Ollama 模型）';
        }
        
        setDebugInfo({
          status: 'error',
          httpStatus: error.response.status,
          error: errorDetail,
          data: JSON.stringify(error.response.data),
          showModelSwitchSuggestion
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
          const lastMessage = newMessages[newMessages.length - 1];
          newMessages[newMessages.length - 1] = { 
            role: 'assistant', 
            content: errorMessage,
            id: lastMessage.id
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
    }
    
    // 检查是否是Gemini过载错误消息
    const isGeminiOverloadError = content.includes('过载') || content.includes('overloaded') || 
                                  content.includes('UNAVAILABLE') || content.includes('503');
    const isCurrentlyUsingGemini = selectedModel.includes('gemini');
    
    // 如果是Gemini过载错误且当前使用的是Gemini模型，显示快速切换选项
    if (isGeminiOverloadError && isCurrentlyUsingGemini) {
      const alternativeModels = availableModels.filter(m => !m.id.includes('gemini'));
      
      return (
        <div>
          <div className="text-red-600 whitespace-pre-wrap mb-3">
            {content.split('\n').map((line, i) => (
              <React.Fragment key={i}>
                {line}
                {i < content.split('\n').length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>
          
          {alternativeModels.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <div className="text-sm font-medium text-amber-800 mb-2">
                    快速切换到其他模型
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {alternativeModels.slice(0, 3).map(model => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          // 显示切换成功消息
                          const successMessage = {
                            role: 'system',
                            content: `✅ 已切换到 ${model.name}，请重新发送您的问题`,
                            id: `switch-success-${Date.now()}`,
                            isTemporary: true,
                            type: 'success'
                          };
                          setMessages(prev => [...prev, successMessage]);
                          setTimeout(() => {
                            setMessages(prev => prev.filter(msg => msg.id !== successMessage.id));
                          }, 5000);
                        }}
                        className="px-3 py-1.5 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
                      >
                        切换到 {model.name}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-amber-700 mt-2">
                    切换后请重新发送您的问题
                  </div>
                </div>
              </div>
            </div>
          )}
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
    <div className="flex h-full w-full relative">
      {/* 主聊天区域 */}
    <div 
        className="flex flex-col h-full w-full bg-white rounded-lg shadow overflow-hidden relative aichat-container"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
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
                    {/* Prompt文件组 */}
                    {availableFiles.filter(f => f.type === 'prompt').length > 0 && (
                      <>
                        <div className="px-3 py-2 bg-blue-50 border-b border-blue-100">
                          <div className="text-xs font-medium text-blue-800">Prompt模板</div>
                          <div className="text-xs text-blue-600">
                            {availableFiles.filter(f => f.type === 'prompt').length} 个模板
                          </div>
                        </div>
                        {availableFiles.filter(f => f.type === 'prompt').map(fileInfo => (
                          <div 
                            key={fileInfo.filename} 
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleFileSelection(fileInfo.filename)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(fileInfo.filename)}
                              onChange={() => {}}
                              className="checkbox checkbox-sm checkbox-primary"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate" title={fileInfo.filename}>
                                {fileInfo.displayName}
                              </div>
                              {fileTokenCounts[fileInfo.filename] !== undefined && (
                                <div className="text-xs text-blue-600">
                                  ~{formatTokenCount(fileTokenCounts[fileInfo.filename])} tokens
                                </div>
                              )}
                            </div>
                            <div className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                              Prompt
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    
                    {/* 任务文件组 */}
                    {availableFiles.filter(f => f.type === 'task').length > 0 && (
                      <>
                        <div className="px-3 py-2 bg-green-50 border-b border-green-100">
                          <div className="text-xs font-medium text-green-800">任务文档</div>
                          <div className="text-xs text-green-600">
                            {availableFiles.filter(f => f.type === 'task').length} 个文档
                          </div>
                        </div>
                        {availableFiles.filter(f => f.type === 'task').map(fileInfo => (
                          <div 
                            key={fileInfo.filename} 
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleFileSelection(fileInfo.filename)}
                          >
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(fileInfo.filename)}
                              onChange={() => {}}
                              className="checkbox checkbox-sm checkbox-primary"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 truncate" title={fileInfo.filename}>
                                {fileInfo.displayName}
                              </div>
                              {fileTokenCounts[fileInfo.filename] !== undefined && (
                                <div className="text-xs text-green-600">
                                  ~{formatTokenCount(fileTokenCounts[fileInfo.filename])} tokens
                                </div>
                              )}
                            </div>
                            <div className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                              任务
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    
                    {availableFiles.length === 0 && (
                      <div className="text-center text-gray-500 text-sm py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>没有找到文档</div>
                        <div className="text-xs text-gray-400 mt-1">
                          请检查任务文件或Prompt模板
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
          <div className="text-gray-500 flex-1">
            {(selectedFiles.size > 0 || mentionedDocuments.size > 0) && (
              <span>
                📎 已选择 {selectedFiles.size + mentionedDocuments.size} 个文档作为上下文
                {loadingFileContents && (
                  <span className="inline-flex ml-2 items-center">
                    <span className="loading loading-spinner loading-xs text-blue-500"></span>
                    <span className="ml-1 text-xs text-blue-500">加载中...</span>
                  </span>
                )}
              </span>
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
      {(selectedFiles.size > 0 || mentionedDocuments.size > 0 || projectContext) && (
        <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              上下文: {selectedFiles.size + mentionedDocuments.size}个文档
              {projectContext && ` + 项目"${projectContext.name}"`}
            </span>
            <span className="text-xs text-gray-500">
              (总计 ~{formatTokenCount(Array.from(selectedFiles).reduce((sum, filename) => sum + (fileTokenCounts[filename] || 0), 0))} tokens)
            </span>
          </div>
          
          {/* 文档标签列表 */}
          <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
            
            {/* 项目上下文标签 */}
            {projectContext && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors group">
                <svg className="h-3 w-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="truncate max-w-32" title={`项目: ${projectContext.name}`}>
                  {projectContext.name}
                </span>
                <span className="text-xs opacity-75">
                  {projectContext.selectedBlocks.length}块+{projectContext.selectedDocuments.length}文档
                </span>
                <button
                  onClick={() => setProjectContext(null)}
                  className="ml-1 rounded-full p-0.5 opacity-70 group-hover:opacity-100 transition-all text-purple-600 hover:text-purple-800 hover:bg-purple-300"
                  title="移除项目上下文"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            {/* 拖拽选择的文件 */}
            {Array.from(selectedFiles).map(filename => {
              const fileInfo = availableFiles.find(f => f.filename === filename);
              const isPrompt = fileInfo?.type === 'prompt';
              return (
                <div 
                  key={`file-${filename}`} 
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm group transition-colors aichat-file-tag ${
                    isPrompt ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  <span className="truncate max-w-32" title={filename}>
                    {fileInfo?.displayName || filename}
                  </span>
                  <span className="text-xs opacity-75">
                    ~{formatTokenCount(fileTokenCounts[filename] || 0)}
                  </span>
                  <button
                    onClick={() => removeFile(filename)}
                    className={`ml-1 rounded-full p-0.5 opacity-70 group-hover:opacity-100 transition-all ${
                      isPrompt 
                        ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-300' 
                        : 'text-green-600 hover:text-green-800 hover:bg-green-300'
                    }`}
                    title={`移除 ${filename}`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
            
            {/* @引用的文档 */}
            {Array.from(mentionedDocuments.values()).map(doc => (
              <div 
                key={`mention-${doc.reference}`} 
                className="flex items-center gap-1 px-2 py-1 rounded-full text-sm bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors group"
              >
                <svg className="h-3 w-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.586-6.586a2 2 0 00-2.828-2.828z" />
                </svg>
                <span className="truncate max-w-32" title={doc.reference}>
                  {doc.reference}
                </span>
                <button
                  onClick={() => {
                    const newMentionedDocuments = new Map(mentionedDocuments);
                    newMentionedDocuments.delete(doc.reference);
                    setMentionedDocuments(newMentionedDocuments);
                    
                    // 从输入框中移除引用
                    const newInputText = inputText.replace(new RegExp(doc.reference.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
                    setInputText(newInputText);
                  }}
                  className="ml-1 rounded-full p-0.5 opacity-70 group-hover:opacity-100 transition-all text-purple-600 hover:text-purple-800 hover:bg-purple-300"
                  title={`移除引用 ${doc.reference}`}
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
      
      {/* 聊天消息区 - 移除拖拽事件 */}
      <div 
        ref={(el) => {
          chatContainerRef.current = el;
          chatAreaRef.current = el;
        }}
        className="flex-grow overflow-y-auto p-4 space-y-4 relative"
        style={{ backgroundColor: '#ffffff' }}
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
                  className="relative flex-1"
                  style={{ minWidth: '280px', maxWidth: 'calc(100% - 2rem)' }}
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
                  
                  {/* 复制和保存按钮 */}
                  {!msg.isPlaceholder && msg.content && (
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleCopy(msg.content, msg.id || msg.timestamp)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="复制回复"
                      >
                        <Copy size={14} />
                        {copyStatus[msg.id || msg.timestamp] === 'copied' ? '已复制' : 
                         copyStatus[msg.id || msg.timestamp] === 'failed' ? '复制失败' : '复制'}
                      </button>
                      
                      <button
                        onClick={() => handleSave(msg.content, msg.id || msg.timestamp)}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                        title="保存回复"
                        disabled={saveStatus[msg.id || msg.timestamp] === 'saving'}
                      >
                        <Save size={14} />
                        {saveStatus[msg.id || msg.timestamp] === 'saving' ? '保存中...' :
                         saveStatus[msg.id || msg.timestamp] === 'saved' ? '已保存' :
                         saveStatus[msg.id || msg.timestamp] === 'failed' ? '保存失败' : '保存'}
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
            
            {/* 用户消息 */}
            {msg.role === 'user' && (
              <div className="relative flex-1 text-right" style={{ maxWidth: 'calc(100% - 2rem)' }}>
                <div className="inline-block bg-blue-500 text-white px-4 py-2 rounded-lg max-w-full">
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
          <div className="relative flex-grow">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleInputChange}
              onKeyUp={handleKeyUp}
              onClick={handleClick}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="输入消息... (输入 @ 可引用文档)"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 shadow-sm"
              style={{ minHeight: '60px' }}
              disabled={isLoading || isStreaming}
            />
            
            {/* DocumentMention 组件 */}
            <DocumentMention
              inputText={inputText}
              setInputText={setInputText}
              cursorPosition={cursorPosition}
              setCursorPosition={setCursorPosition}
              apiBaseUrl={apiBaseUrl}
              currentTaskUuid={taskUuid}
              onDocumentSelect={handleDocumentMention}
              textareaRef={textareaRef}
            />
          </div>
                            <button 
                    onClick={sendMessage} 
                    className="btn btn-primary h-12 w-12 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center"
                    disabled={isLoading || isStreaming || !inputText.trim() || loadingFileContents}
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

      {/* 项目气泡 */}
      <ProjectBubble onSendToAI={handleProjectSendToAI} />
    </div>
  );
}

export default AIChat; 