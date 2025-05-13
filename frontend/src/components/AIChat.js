import React, { useState, useEffect, useRef, memo } from 'react';
import axios from 'axios';
import MarkdownViewer from './MarkdownViewer'; // Assuming MarkdownViewer is in the same directory

// Complete rewrite of thinking block handling
function AIChat({ markdownContent, apiBaseUrl }) {
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

  useEffect(() => {
    setMessages([
      { role: 'system', content: '我可以帮您分析和讨论文档内容，请随时提问。' }
    ]);
  }, []);

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
      const chatApiUrl = `${apiBaseUrl}/api/chat`;
      console.log("Sending chat request to:", chatApiUrl);
      
      const payload = {
        messages: [...messages, userMessage],
        document: markdownContent || "No document provided.",
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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* 顶部模型选择栏 */}
      <div className="p-3 border-b flex items-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <span className="text-sm font-medium text-gray-700 mr-2">选择AI模型:</span>
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
        
        {/* 调试开关 - 默认隐藏，按住Alt+D显示 */}
        <button 
          className="ml-2 px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-400 hover:bg-gray-200"
          title="按Alt+D开关调试信息"
          onClick={() => setShowDebug(!showDebug)}
          style={{ opacity: 0.3 }}
        >
          {showDebug ? "隐藏调试" : "显示调试"}
        </button>
        
        <div className="ml-auto flex items-center">
          {(isLoading || isStreaming) ? (
            <div className="flex items-center text-xs text-indigo-600">
              <span className="loading loading-dots loading-xs mr-1"></span>
              {isStreaming ? "正在生成..." : "处理中..."}
            </div>
          ) : (
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-1"></div>
              <span className="text-xs text-gray-600">
                {`${availableModels.find(m => m.id === selectedModel)?.name || selectedModel}`}
              </span>
            </div>
          )}
        </div>
      </div>
      
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
      
      {/* 聊天消息区 */}
      <div 
        ref={chatContainerRef}
        className="flex-grow overflow-y-auto p-4 space-y-4"
        style={{
          backgroundColor: '#ffffff'
        }}
      >
        {messages.filter(msg => msg.role !== 'system').map((msg, index) => (
          <div 
            key={msg.id || index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI icon for assistant messages */}
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center mr-2 mt-1">
                <span className="text-xs font-medium text-gray-600">AI</span>
              </div>
            )}
            
            <div 
              className={`relative max-w-3xl ${msg.role === 'user' ? 'text-right' : ''}`}
              style={{
                minWidth: msg.role === 'assistant' ? '280px' : 'auto'
              }}
            >
              {/* 角色标识 - 只为助手消息显示名称 */}
              {msg.role === 'assistant' && (
                <div className="text-xs font-medium mb-1 text-gray-600 flex items-center">
                  <span>Ai助手</span>
                  {isStreaming && msg.isPlaceholder && (
                    <span className="ml-2 inline-flex items-center">
                      <span className="loading loading-dots loading-xs text-blue-500"></span>
                    </span>
                  )}
                </div>
              )}
              
              {/* 消息内容 - 使用新的渲染函数 */}
              <div className={`markdown-content break-words ${msg.role === 'user' ? 'text-right' : ''}`}>
                {renderMessageContent(msg, msg.role === 'user')}
              </div>
            </div>
          </div>
        ))}
        
        {/* 如果没有消息，显示欢迎信息 */}
        {messages.filter(msg => msg.role !== 'system').length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-lg font-semibold text-gray-400">
              欢迎使用AI对话助手
            </div>
            <div className="text-sm text-gray-400 mt-2 text-center">
              请在下方输入您的问题或指令
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

// CSS样式
const style = document.createElement('style');
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

// 添加键盘快捷键支持
document.addEventListener('keydown', function(e) {
  // Alt+D 切换调试信息显示
  if (e.altKey && e.key === 'd') {
    const debugButtons = document.querySelectorAll('[title="按Alt+D开关调试信息"]');
    if (debugButtons.length > 0) {
      debugButtons[0].click();
    }
  }
});

export default AIChat; 