import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import MarkdownViewer from './MarkdownViewer'; // Assuming MarkdownViewer is in the same directory

function AIChat({ markdownContent, apiBaseUrl }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStreamedContent, setCurrentStreamedContent] = useState('');
  const chatContainerRef = useRef(null);
  const [selectedModel, setSelectedModel] = useState('deepseek');
  const [availableModels, setAvailableModels] = useState([
    { id: 'deepseek', name: 'DeepSeek AI' },
    { id: 'qwen3:14b', name: 'Ollama - qwen3:14b' },
    { id: 'qwen3:0.6b', name: 'Ollama - qwen3:0.6b' },
    //{ id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }
  ]);
  const [debugInfo, setDebugInfo] = useState(null);
  const [showDebug, setShowDebug] = useState(false);
  const [rawResponse, setRawResponse] = useState(null);
  const [thoughtOpacity] = useState(0.5);

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

  // 处理思考标签，将内容分为思考部分和正式回复部分
  const processThinking = (content) => {
    if (!content) return { thinkingBlocks: [], reply: null };
    
    // 改进：匹配多个<think>...</think>标签
    const thinkRegex = /<think>([\s\S]*?)<\/think>/g;
    const thinkMatches = Array.from(content.matchAll(thinkRegex));
    
    if (thinkMatches.length > 0) {
      // 提取所有思考内容
      const thinkingBlocks = thinkMatches.map(match => match[1].trim());
      
      // 替换所有思考标签获取纯回复内容
      let reply = content;
      thinkMatches.forEach(match => {
        reply = reply.replace(match[0], '');
      });
      reply = reply.trim();
      
      return { thinkingBlocks, reply };
    }
    
    // 如果没有匹配到思考标签，则全部内容视为正式回复
    return { thinkingBlocks: [], reply: content };
  };

  // 模拟流式接收响应
  const streamResponse = async (content) => {
    setIsStreaming(true);
    setCurrentStreamedContent('');
    
    // 处理思考标签
    const { thinkingBlocks, reply } = processThinking(content);
    let contentToStream = content;
    
    // 流式显示的步长和延迟
    const chunkSize = 3; // 每次添加的字符数
    const delay = 15; // 毫秒
    
    // 流式显示内容
    let currentPosition = 0;
    while (currentPosition < contentToStream.length) {
      const nextChunk = contentToStream.substring(
        currentPosition, 
        Math.min(currentPosition + chunkSize, contentToStream.length)
      );
      
      currentPosition += chunkSize;
      
      setCurrentStreamedContent(prev => prev + nextChunk);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    // 流式显示结束，更新消息
    setMessages(prev => {
      // 找到最后一条消息并更新内容
      const newMessages = [...prev];
      if (newMessages.length > 0) {
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === 'assistant') {
          lastMsg.content = content;
          if (thinkingBlocks.length > 0) {
            lastMsg.thinkingBlocks = thinkingBlocks;
            lastMsg.reply = reply;
          }
        }
      }
      return newMessages;
    });
    
    setIsStreaming(false);
    setCurrentStreamedContent('');
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    
    const userMessage = { role: 'user', content: inputText };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setDebugInfo(null);
    setRawResponse(null);
    
    // 添加占位的AI回复消息
    setMessages(prev => [...prev, { role: 'assistant', content: '', isPlaceholder: true }]);
    
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
        
        // 处理思考标签
        const { thinkingBlocks, reply } = processThinking(response.data.content);
        const content = response.data.content;
        
        // 更新调试信息
        setDebugInfo({
          status: 'success',
          model: response.data.model_used,
          contentLength: content.length,
          hasThinking: thinkingBlocks.length > 0,
          thinkingBlocksCount: thinkingBlocks.length,
          contentPreview: content.substring(0, 50) + '...'
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
    if (!content && !isStreaming) return <div className="text-red-500 italic">无内容显示或加载。</div>;
    
    if (isUserMessage) {
      // 用户消息直接渲染
      return (
        <div className="text-white">
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
      const hasThinking = msg.thinkingBlocks?.length > 0 || (isStreaming && content.includes('<think>'));
      
      // 如果是流式显示中，使用当前流式内容
      const displayContent = isStreaming && msg.isPlaceholder ? currentStreamedContent : content;
      
      // 如果消息有思考和回复部分，或者正在流式显示
      if (hasThinking) {
        // 解析思考内容和正式回复
        let thinkingBlocks = [];
        let reply = '';
        
        if (isStreaming) {
          const processed = processThinking(displayContent);
          thinkingBlocks = processed.thinkingBlocks || [];
          reply = processed.reply || '';
        } else {
          thinkingBlocks = msg.thinkingBlocks || [];
          reply = msg.reply || content;
        }
        
        return (
          <>
            {/* 思考部分 - 多个思考块显示 */}
            {thinkingBlocks.map((thinking, index) => (
              <div 
                key={`thinking-${index}`}
                className="thinking-block mb-3 p-3 rounded-lg border border-amber-200 text-gray-700 text-sm"
                style={{ 
                  opacity: thoughtOpacity,
                  backgroundColor: 'rgba(254, 243, 199, 0.2)',
                  transition: 'none' // 禁用过渡效果，防止闪烁
                }}
              >
                <div className="flex items-center mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-amber-400 mr-1">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                  <span className="font-medium text-amber-500 opacity-75">思考过程</span>
                </div>
                <div className="whitespace-pre-wrap text-gray-600">
                  {thinking.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < thinking.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            
            {/* 正式回复部分 */}
            {reply && (
              <div className="whitespace-pre-wrap text-gray-800">
                {reply.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < reply.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            )}
            
            {/* 如果既没有思考也没有回复，但有内容，则显示全部内容 */}
            {thinkingBlocks.length === 0 && !reply && displayContent && (
              <div className="whitespace-pre-wrap text-gray-800">
                {displayContent.split('\n').map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < displayContent.split('\n').length - 1 && <br />}
                  </React.Fragment>
                ))}
              </div>
            )}
          </>
        );
      } else {
        // 普通回复，无思考部分
        return (
          <div className="text-gray-800">
            <div className="whitespace-pre-wrap">
              {displayContent.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  {i < displayContent.split('\n').length - 1 && <br />}
                </React.Fragment>
              ))}
            </div>
          </div>
        );
      }
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
        className="flex-grow overflow-y-auto p-4 space-y-6 bg-gradient-to-b from-gray-50 to-white"
        style={{
          backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(200, 200, 255, 0.1) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(200, 200, 255, 0.1) 2%, transparent 0%)',
          backgroundSize: '100px 100px'
        }}
      >
        {messages.filter(msg => msg.role !== 'system').map((msg, index) => (
          <div 
            key={index} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`relative max-w-4xl p-4 rounded-xl shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white mr-2'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 ml-2'
              } animate-fadeIn`}
              style={{
                animationDelay: `${0.1 * index}s`,
                boxShadow: msg.role === 'user' 
                  ? '0 4px 6px -1px rgba(59, 130, 246, 0.1), 0 2px 4px -1px rgba(59, 130, 246, 0.06)' 
                  : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                minWidth: msg.role === 'assistant' ? '280px' : 'auto'
              }}
            >
              {/* 添加气泡尖角 */}
              <div 
                className={`absolute top-4 ${msg.role === 'user' ? 'right-0 transform translate-x-1/2 rotate-45' : 'left-0 transform -translate-x-1/2 rotate-45'} w-3 h-3 ${
                  msg.role === 'user' ? 'bg-blue-500' : 'bg-gray-100'
                }`}
              ></div>
              
              {/* 角色标识 */}
              <div className={`text-xs font-semibold mb-1 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'} flex items-center`}>
                {msg.role === 'user' ? (
                  <span>您</span>
                ) : (
                  <>
                    <span>AI 助手</span>
                    {isStreaming && msg.isPlaceholder && (
                      <span className="ml-2 inline-flex items-center">
                        <span className="loading loading-dots loading-xs text-blue-500"></span>
                      </span>
                    )}
                  </>
                )}
              </div>
              
              {/* 消息内容 - 使用新的渲染函数 */}
              <div className="markdown-content break-words">
                {renderMessageContent(msg, msg.role === 'user')}
                {msg.role === 'assistant' && !msg.isPlaceholder && (
                  <div className="text-xxs text-gray-400 mt-2 text-right">
                    {`${new Date().toLocaleTimeString()} · ${msg.content.length} 字符`}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* 如果没有消息，显示欢迎信息 */}
        {messages.filter(msg => msg.role !== 'system').length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="text-lg font-semibold text-gray-400 animate-pulse">
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

// 添加必要的CSS动画
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .animate-fadeIn {
    animation: fadeIn 0.3s ease-out forwards;
  }
  .text-xxs {
    font-size: 0.65rem;
  }
  
  /* 禁用思考模块的过渡效果 */
  .thinking-block {
    transition: none !important;
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